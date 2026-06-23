"""
LinearMIPAdapter — LP/MIP 求解器适配器

支持 GLOP（纯LP）、SCIP（LP+MIP）、CBC（MIP回退）。
接受 LinearModelIR dict 或前端直接传递的 {variables, constraints, objective} 格式。
"""

import logging
import time
from typing import Dict

from ortools.linear_solver import pywraplp

from app.services.solver_adapters.base import BaseSolverAdapter

logger = logging.getLogger(__name__)


class LinearMIPAdapter(BaseSolverAdapter):
    """将 LP/MIP 模型数据转换为 OR-Tools 模型并求解。"""

    def validate(self, model_data: dict) -> dict:
        """验证 LP/MIP 模型数据完整性"""
        errors = []
        warnings = []

        variables = model_data.get("variables", [])
        if not variables:
            errors.append("模型中没有变量定义")

        objective = model_data.get("objective")
        if not objective:
            warnings.append("模型没有目标函数，将作为可行性问题求解")

        constraints = model_data.get("constraints", [])
        if not constraints:
            warnings.append("模型没有约束条件")

        # 验证目标函数中引用的变量存在
        if objective:
            coefficients = objective.get("coefficients", {})
            var_ids = {v.get("id") or v.get("name", "") for v in variables}
            for var_id in coefficients:
                if var_id not in var_ids:
                    errors.append(f"目标函数引用了不存在的变量: {var_id}")

        return {"valid": len(errors) == 0, "errors": errors, "warnings": warnings}

    def solve(self, model_data: dict, config: dict = None) -> dict:
        """求解 LP/MIP 模型。

        支持两种输入格式:
        1. LinearModelIR 的 dict 形式 (含 sense 字段)
        2. 前端直接传递的 {variables, constraints, objective} 格式

        Returns:
            {
                "status": "optimal"|"feasible"|"infeasible"|"unbounded"|"error",
                "objective_value": float|None,
                "solution": {var_id: value},
                "solve_time": float,
            }
        """
        config = config or {}
        start_time = time.time()

        try:
            variables = model_data.get("variables", [])
            constraints = model_data.get("constraints", [])
            objective = model_data.get("objective", {})

            # 兼容 LinearModelIR 格式：objective 可能是嵌套对象
            if isinstance(objective, dict) and "coefficients" not in objective:
                # 可能是前端格式 — 没有 coefficients 字段
                objective = {"coefficients": {}}

            num_cols = len(variables)
            if num_cols == 0:
                return {
                    "status": "error",
                    "objective_value": None,
                    "solution": {},
                    "solve_time": time.time() - start_time,
                    "message": "模型中没有变量",
                }

            # 根据 problemType 自动选择最优求解器
            problem_type = config.get("problem_type", "MIP")
            if problem_type == "LP":
                solver = pywraplp.Solver.CreateSolver("GLOP")
                if not solver:
                    solver = pywraplp.Solver.CreateSolver("SCIP")
                if not solver:
                    return {
                        "status": "error",
                        "objective_value": None,
                        "solution": {},
                        "solve_time": time.time() - start_time,
                        "message": "无法创建 OR-Tools LP 求解器 (GLOP/SCIP)",
                    }
            else:  # MIP
                solver = pywraplp.Solver.CreateSolver("SCIP")
                if not solver:
                    solver = pywraplp.Solver.CreateSolver("CBC")
                if not solver:
                    return {
                        "status": "error",
                        "objective_value": None,
                        "solution": {},
                        "solve_time": time.time() - start_time,
                        "message": "无法创建 OR-Tools MIP 求解器 (SCIP/CBC)",
                    }

            # 设置时间限制
            time_limit = config.get("timeLimitSeconds", 60)
            solver.SetTimeLimit(time_limit * 1000)

            # 变量 ID → OR-Tools 变量映射
            var_map: Dict[str, pywraplp.Variable] = {}
            for v in variables:
                # 支持 dict 和对象两种形式
                vid = v.get("id") if isinstance(v, dict) else v.id
                domain = v.get("domain") if isinstance(v, dict) else v.domain
                lb = v.get("lowerBound") if isinstance(v, dict) else v.lowerBound
                ub = v.get("upperBound") if isinstance(v, dict) else v.upperBound

                lb = lb if lb is not None else 0.0
                ub = ub if ub is not None else solver.infinity()

                if domain == "binary":
                    var_map[vid] = solver.IntVar(0, 1, vid)
                elif domain == "integer":
                    var_map[vid] = solver.IntVar(lb, ub, vid)
                else:
                    var_map[vid] = solver.NumVar(lb, ub, vid)

            # 目标函数
            obj_coefficients = objective.get("coefficients", {})
            if obj_coefficients:
                obj = solver.Objective()
                for var_id, coeff in obj_coefficients.items():
                    if var_id in var_map and coeff != 0:
                        obj.SetCoefficient(var_map[var_id], coeff)

                # sense 可能在顶层（LinearModelIR）或在 objective 内（前端格式）
                sense = model_data.get("sense") or objective.get("sense", "minimize")
                if sense == "maximize":
                    obj.SetMaximization()
                else:
                    obj.SetMinimization()

            # 约束条件
            for c in constraints:
                if isinstance(c, dict):
                    rhs = c.get("rhs", 0)
                    operator = c.get("operator", "<=")
                    c_name = c.get("name", c.get("id", ""))
                    coefficients = c.get("coefficients", {})
                else:
                    rhs = c.rhs
                    operator = c.operator
                    c_name = c.name
                    coefficients = c.coefficients

                if operator == "<=":
                    row_lb = -solver.infinity()
                    row_ub = rhs
                elif operator == ">=":
                    row_lb = rhs
                    row_ub = solver.infinity()
                elif operator == "==":
                    row_lb = rhs
                    row_ub = rhs
                else:
                    row_lb = -solver.infinity()
                    row_ub = solver.infinity()

                constraint = solver.Constraint(row_lb, row_ub, c_name)
                for var_id, coeff in coefficients.items():
                    if var_id in var_map and coeff != 0:
                        constraint.SetCoefficient(var_map[var_id], coeff)

            # 求解
            status = solver.Solve()

            status_map = {
                pywraplp.Solver.OPTIMAL: "optimal",
                pywraplp.Solver.INFEASIBLE: "infeasible",
                pywraplp.Solver.UNBOUNDED: "unbounded",
                pywraplp.Solver.NOT_SOLVED: "unknown",
                pywraplp.Solver.FEASIBLE: "feasible",
            }

            solve_status = status_map.get(status, "unknown")
            objective_value = None
            solution: Dict[str, float] = {}

            if status in (pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE):
                objective_value = solver.Objective().Value()
                for vid, var in var_map.items():
                    solution[vid] = var.solution_value()

            solve_time = time.time() - start_time

            logger.info(
                f"LP/MIP solve complete: status={solve_status}, "
                f"obj={objective_value}, time={solve_time:.3f}s"
            )

            return {
                "status": solve_status,
                "objective_value": objective_value,
                "solution": solution,
                "solve_time": solve_time,
            }

        except Exception as e:
            logger.error(f"LP/MIP solve error: {e}", exc_info=True)
            return {
                "status": "error",
                "objective_value": None,
                "solution": {},
                "solve_time": time.time() - start_time,
                "message": str(e),
            }
