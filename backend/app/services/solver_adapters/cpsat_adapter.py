"""
CPSATAdapter — CP-SAT 约束满足求解器适配器

支持整数变量、布尔变量、区间变量、线性约束、全局约束（AllDifferent、NoOverlap、Cumulative 等）。
使用 ortools.sat.python.cp_model 后端。
"""

import logging
import time
from typing import Dict, Any, List

from ortools.sat.python import cp_model

from app.services.solver_adapters.base import BaseSolverAdapter

logger = logging.getLogger(__name__)


class CPSATAdapter(BaseSolverAdapter):
    """CP-SAT 约束满足求解器适配器"""

    def validate(self, model_data: dict) -> dict:
        """验证 CP-SAT 模型数据完整性"""
        errors = []
        warnings = []

        int_vars = model_data.get("intVars", [])
        bool_vars = model_data.get("boolVars", [])

        if not int_vars and not bool_vars:
            errors.append("CP-SAT 模型至少需要一个整数变量或布尔变量")

        # 收集所有变量ID
        all_var_ids = set()
        for v in int_vars:
            vid = v.get("id")
            if not vid:
                errors.append("整数变量缺少 id 字段")
            else:
                all_var_ids.add(vid)

        for v in bool_vars:
            vid = v.get("id")
            if not vid:
                errors.append("布尔变量缺少 id 字段")
            else:
                all_var_ids.add(vid)

        # 验证区间变量引用的变量存在
        for iv in model_data.get("intervalVars", []):
            start_var = iv.get("startVar")
            end_var = iv.get("endVar")
            if start_var and start_var not in all_var_ids:
                errors.append(f"区间变量 {iv.get('id')} 引用了不存在的 startVar: {start_var}")
            if end_var and end_var not in all_var_ids:
                errors.append(f"区间变量 {iv.get('id')} 引用了不存在的 endVar: {end_var}")

        # 验证全局约束引用的变量存在
        for gc in model_data.get("globalConstraints", []):
            for vid in gc.get("variables", []):
                if vid not in all_var_ids:
                    warnings.append(
                        f"全局约束 {gc.get('id', gc.get('type'))} 引用了不存在的变量: {vid}"
                    )

        # 验证线性约束引用的变量存在
        for lc in model_data.get("linearConstraints", []):
            for vid in lc.get("coefficients", {}).keys():
                if vid not in all_var_ids:
                    warnings.append(
                        f"线性约束引用了不存在的变量: {vid}"
                    )

        return {"valid": len(errors) == 0, "errors": errors, "warnings": warnings}

    def solve(self, model_data: dict, config: dict = None) -> dict:
        """执行 CP-SAT 求解

        Args:
            model_data: CP-SAT 模型数据，包含 intVars, boolVars, intervalVars,
                        linearConstraints, globalConstraints, objective
            config: 求解器配置 (timeLimitSeconds, numWorkers, etc.)

        Returns:
            {
                "status": "optimal"|"feasible"|"infeasible"|"error"|"unknown",
                "objective_value": float|None,
                "solution": {var_id: value},
                "intSolution": {var_id: int_value},
                "solve_time": float,
                "allSolutions": [...] (可选)
            }
        """
        config = config or {}
        start_time = time.time()

        try:
            model = cp_model.CpModel()
            var_map: Dict[str, Any] = {}  # var_id -> cp_model variable

            # 1. 创建整数变量
            for v in model_data.get("intVars", []):
                vid = v["id"]
                var_map[vid] = model.new_int_var(
                    v.get("lowerBound", 0),
                    v.get("upperBound", 100),
                    v.get("name", vid)
                )

            # 2. 创建布尔变量
            for v in model_data.get("boolVars", []):
                vid = v["id"]
                var_map[vid] = model.new_bool_var(v.get("name", vid))

            # 3. 创建区间变量
            interval_map: Dict[str, Any] = {}
            for iv in model_data.get("intervalVars", []):
                start_var = var_map.get(iv["startVar"])
                end_var = var_map.get(iv["endVar"])
                size = iv.get("sizeMin", iv.get("size", 1))
                if start_var is not None and end_var is not None:
                    interval_map[iv["id"]] = model.new_interval_var(
                        start_var, size, end_var, iv.get("name", iv["id"])
                    )

            # 4. 添加线性约束
            for c in model_data.get("linearConstraints", []):
                coeffs = c.get("coefficients", {})
                op = c.get("operator", "<=")
                rhs = c.get("rhs", 0)
                expr = sum(
                    coeff * var_map[vid]
                    for vid, coeff in coeffs.items()
                    if vid in var_map
                )
                if op == "<=":
                    model.add(expr <= rhs)
                elif op == ">=":
                    model.add(expr >= rhs)
                elif op == "==":
                    model.add(expr == rhs)

            # 5. 添加全局约束
            for gc in model_data.get("globalConstraints", []):
                self._add_global_constraint(model, gc, var_map, interval_map)

            # 6. 设置目标函数
            objective = model_data.get("objective")
            if objective:
                sense = objective.get("sense", "minimize")
                coefficients = objective.get("coefficients", {})
                obj_expr = sum(
                    coeff * var_map[vid]
                    for vid, coeff in coefficients.items()
                    if vid in var_map
                )
                if sense == "minimize":
                    model.minimize(obj_expr)
                else:
                    model.maximize(obj_expr)

            # 7. 配置求解器
            solver = cp_model.CpSolver()
            solver.parameters.max_time_in_seconds = config.get("timeLimitSeconds", 60)
            solver.parameters.num_workers = config.get("numWorkers", 4)
            if config.get("logSearchProgress", False):
                solver.parameters.log_search_progress = True

            # 8. 求解
            all_solutions: List[Dict[str, int]] = []
            if config.get("enumerateAllSolutions", False):
                collector = _SolutionCollector(var_map)
                status = solver.solve(model, collector)
                all_solutions = collector.solutions
            else:
                status = solver.solve(model)

            # 9. 处理结果
            status_map = {
                cp_model.OPTIMAL: "optimal",
                cp_model.FEASIBLE: "feasible",
                cp_model.INFEASIBLE: "infeasible",
                cp_model.MODEL_INVALID: "error",
                cp_model.UNKNOWN: "unknown",
            }

            solve_status = status_map.get(status, "unknown")
            solution: Dict[str, float] = {}
            objective_value = None

            if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
                objective_value = solver.objective_value if objective else None
                for vid, var in var_map.items():
                    solution[vid] = solver.value(var)

            solve_time = time.time() - start_time

            logger.info(
                f"CP-SAT solve complete: status={solve_status}, "
                f"obj={objective_value}, time={solve_time:.3f}s"
            )

            result = {
                "status": solve_status,
                "objective_value": objective_value,
                "solution": solution,
                "intSolution": {k: int(v) for k, v in solution.items()},
                "solve_time": solve_time,
            }

            if all_solutions:
                result["allSolutions"] = all_solutions

            return result

        except Exception as e:
            logger.error(f"CP-SAT solve error: {e}", exc_info=True)
            return {
                "status": "error",
                "objective_value": None,
                "solution": {},
                "solve_time": time.time() - start_time,
                "message": str(e),
            }

    def _add_global_constraint(
        self,
        model: cp_model.CpModel,
        gc: dict,
        var_map: Dict[str, Any],
        interval_map: Dict[str, Any],
    ) -> None:
        """添加全局约束到模型"""
        gc_type = gc.get("type")
        gc_vars = [var_map[vid] for vid in gc.get("variables", []) if vid in var_map]
        gc_intervals = [
            interval_map[iid] for iid in gc.get("intervals", []) if iid in interval_map
        ]
        params = gc.get("params", {})

        if gc_type == "AllDifferent" and gc_vars:
            model.add_all_different(gc_vars)
        elif gc_type == "NoOverlap" and gc_intervals:
            model.add_no_overlap(gc_intervals)
        elif gc_type == "Cumulative" and gc_intervals:
            demands = params.get("demands", [1] * len(gc_intervals))
            capacity = params.get("capacity", 1)
            model.add_cumulative(gc_intervals, demands, capacity)
        elif gc_type == "Element":
            # Element 约束: target == array[index]
            index_var = gc.get("variables", [None])[0] if gc.get("variables") else None
            target_var = params.get("target")
            values = params.get("values", [])
            if index_var and target_var and values:
                idx = var_map.get(index_var)
                tgt = var_map.get(target_var)
                if idx is not None and tgt is not None:
                    model.add_element(idx, values, tgt)
        elif gc_type == "Circuit" and gc_vars:
            # Circuit 需要 arcs 列表 [(head, tail, literal), ...]
            arcs = params.get("arcs", [])
            if arcs:
                model.add_circuit(arcs)
        elif gc_type == "Table" and gc_vars:
            # Table 约束: 允许的值组合
            tuples_list = params.get("tuples", [])
            if tuples_list:
                model.add_allowed_assignments(gc_vars, tuples_list)
        elif gc_type == "Inverse":
            # Inverse 约束
            forward_vars = gc_vars[:len(gc_vars) // 2]
            inverse_vars = gc_vars[len(gc_vars) // 2:]
            if forward_vars and inverse_vars:
                model.add_inverse(forward_vars, inverse_vars)
        else:
            logger.warning(f"Unsupported global constraint type: {gc_type}")


class _SolutionCollector(cp_model.CpSolverSolutionCallback):
    """CP-SAT 解收集器，用于枚举所有解"""

    def __init__(self, variables: Dict[str, Any]):
        cp_model.CpSolverSolutionCallback.__init__(self)
        self._variables = variables
        self.solutions: List[Dict[str, int]] = []

    def on_solution_callback(self):
        sol = {}
        for vid, var in self._variables.items():
            sol[vid] = self.value(var)
        self.solutions.append(sol)
