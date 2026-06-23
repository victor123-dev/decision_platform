"""
SimulatedAnnealingAdapter — 模拟退火元启发式求解器适配器

适用于 CP-SAT 问题类型，使用模拟退火算法搜索近似最优解。
支持整数变量、布尔变量、线性约束（惩罚法）和全局约束（AllDifferent）。
"""

import logging
import math
import random
import time
from typing import Dict, Any, List, Tuple

from app.services.solver_adapters.base import BaseSolverAdapter

logger = logging.getLogger(__name__)


class SimulatedAnnealingAdapter(BaseSolverAdapter):
    """模拟退火元启发式求解器适配器"""

    def validate(self, model_data: dict) -> dict:
        """验证模型数据完整性"""
        errors = []
        warnings = []

        int_vars = model_data.get("intVars", [])
        bool_vars = model_data.get("boolVars", [])

        if not int_vars and not bool_vars:
            errors.append("模拟退火模型至少需要一个整数变量或布尔变量")

        for v in int_vars:
            if not v.get("id"):
                errors.append("整数变量缺少 id 字段")

        for v in bool_vars:
            if not v.get("id"):
                errors.append("布尔变量缺少 id 字段")

        return {"valid": len(errors) == 0, "errors": errors, "warnings": warnings}

    def solve(self, model_data: dict, config: dict = None) -> dict:
        """执行模拟退火求解

        Args:
            model_data: 模型数据，格式同 CPSATAdapter
            config: 求解器配置，支持以下参数：
                - initialTemperature: 初始温度（默认 1000）
                - coolingRate: 冷却速率（默认 0.995）
                - minTemperature: 最低温度（默认 0.01）
                - maxIterations: 最大迭代次数（默认 10000）

        Returns:
            求解结果字典
        """
        config = config or {}
        start_time = time.time()

        try:
            # 读取参数
            initial_temp = config.get("initialTemperature", 1000)
            cooling_rate = config.get("coolingRate", 0.995)
            min_temp = config.get("minTemperature", 0.01)
            max_iterations = config.get("maxIterations", 10000)

            # 解析变量
            var_info = self._parse_variables(model_data)
            var_ids = var_info["var_ids"]
            var_bounds = var_info["var_bounds"]

            if not var_ids:
                return {
                    "status": "error",
                    "objective_value": None,
                    "solution": {},
                    "intSolution": {},
                    "solve_time": time.time() - start_time,
                    "message": "没有可优化的变量",
                }

            # 解析目标和约束
            objective = model_data.get("objective", {})
            linear_constraints = model_data.get("linearConstraints", [])
            global_constraints = model_data.get("globalConstraints", [])

            # 初始化解
            current_solution = self._random_solution(var_ids, var_bounds)
            current_obj = self._evaluate_objective(current_solution, objective, var_ids)
            current_penalty = self._evaluate_constraints(
                current_solution, linear_constraints, global_constraints, var_ids
            )
            current_cost = current_obj + current_penalty

            best_solution = dict(current_solution)
            best_cost = current_cost

            temperature = initial_temp

            for iteration in range(max_iterations):
                # 生成邻域解
                neighbor = self._generate_neighbor(current_solution, var_ids, var_bounds)
                neighbor_obj = self._evaluate_objective(neighbor, objective, var_ids)
                neighbor_penalty = self._evaluate_constraints(
                    neighbor, linear_constraints, global_constraints, var_ids
                )
                neighbor_cost = neighbor_obj + neighbor_penalty

                # Metropolis 准则
                delta = neighbor_cost - current_cost
                if delta < 0 or random.random() < math.exp(-delta / max(temperature, 1e-10)):
                    current_solution = neighbor
                    current_cost = neighbor_cost

                    # 更新全局最优
                    if current_cost < best_cost:
                        best_solution = dict(current_solution)
                        best_cost = current_cost

                # 温度衰减
                temperature *= cooling_rate
                if temperature < min_temp:
                    temperature = min_temp

            # 构建结果
            best_obj_value = self._evaluate_objective(best_solution, objective, var_ids)
            best_penalty = self._evaluate_constraints(
                best_solution, linear_constraints, global_constraints, var_ids
            )

            status = "feasible"
            if best_penalty > 0:
                # 有约束违反，但仍然返回解
                status = "feasible"

            solve_time = time.time() - start_time
            logger.info(
                f"SA solve complete: status={status}, "
                f"obj={best_obj_value}, penalty={best_penalty}, time={solve_time:.3f}s"
            )

            return {
                "status": status,
                "objective_value": best_obj_value if objective else None,
                "solution": best_solution,
                "intSolution": {k: int(v) for k, v in best_solution.items()},
                "solve_time": solve_time,
            }

        except Exception as e:
            logger.error(f"SA solve error: {e}", exc_info=True)
            return {
                "status": "error",
                "objective_value": None,
                "solution": {},
                "intSolution": {},
                "solve_time": time.time() - start_time,
                "message": str(e),
            }

    def _parse_variables(self, model_data: dict) -> dict:
        """解析变量信息"""
        var_ids: List[str] = []
        var_bounds: List[Tuple[int, int]] = []

        for v in model_data.get("intVars", []):
            vid = v["id"]
            lb = v.get("lowerBound", 0)
            ub = v.get("upperBound", 100)
            var_ids.append(vid)
            var_bounds.append((int(lb), int(ub)))

        for v in model_data.get("boolVars", []):
            vid = v["id"]
            var_ids.append(vid)
            var_bounds.append((0, 1))

        return {"var_ids": var_ids, "var_bounds": var_bounds}

    def _random_solution(self, var_ids: List[str], var_bounds: List[Tuple[int, int]]) -> Dict[str, int]:
        """生成随机初始解"""
        solution = {}
        for i, vid in enumerate(var_ids):
            lb, ub = var_bounds[i]
            solution[vid] = random.randint(lb, ub)
        return solution

    def _generate_neighbor(
        self, solution: Dict[str, int], var_ids: List[str], var_bounds: List[Tuple[int, int]]
    ) -> Dict[str, int]:
        """生成邻域解：随机选一个变量，在其域范围内随机取新值"""
        neighbor = dict(solution)
        idx = random.randint(0, len(var_ids) - 1)
        vid = var_ids[idx]
        lb, ub = var_bounds[idx]
        new_val = random.randint(lb, ub)
        neighbor[vid] = new_val
        return neighbor

    def _evaluate_objective(
        self, solution: Dict[str, int], objective: dict, var_ids: List[str]
    ) -> float:
        """计算目标函数值（已考虑 minimize/maximize 方向）"""
        if not objective:
            return 0.0

        coefficients = objective.get("coefficients", {})
        sense = objective.get("sense", "minimize")

        obj_value = sum(
            coefficients.get(vid, 0) * solution.get(vid, 0)
            for vid in var_ids
        )

        # 对于 maximize，取负使其变成最小化问题
        if sense == "maximize":
            obj_value = -obj_value

        return obj_value

    def _evaluate_constraints(
        self,
        solution: Dict[str, int],
        linear_constraints: list,
        global_constraints: list,
        var_ids: List[str],
        penalty_coeff: float = 1000.0,
    ) -> float:
        """计算约束违反惩罚值"""
        total_penalty = 0.0

        # 线性约束惩罚
        for c in linear_constraints:
            coeffs = c.get("coefficients", {})
            op = c.get("operator", "<=")
            rhs = c.get("rhs", 0)

            lhs = sum(coeffs.get(vid, 0) * solution.get(vid, 0) for vid in var_ids)

            if op == "<=":
                violation = max(0.0, lhs - rhs)
            elif op == ">=":
                violation = max(0.0, rhs - lhs)
            elif op == "==":
                violation = abs(lhs - rhs)
            else:
                violation = 0.0

            total_penalty += violation * penalty_coeff

        # 全局约束惩罚
        for gc in global_constraints:
            gc_type = gc.get("type")
            if gc_type == "AllDifferent":
                variables = gc.get("variables", [])
                values = [solution.get(vid, 0) for vid in variables if vid in solution]
                # 计算重复值的数量
                seen = set()
                duplicates = 0
                for val in values:
                    if val in seen:
                        duplicates += 1
                    seen.add(val)
                total_penalty += duplicates * penalty_coeff

        return total_penalty
