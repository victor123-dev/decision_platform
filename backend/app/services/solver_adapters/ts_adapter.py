"""
TabuSearchAdapter — 禁忌搜索元启发式求解器适配器

适用于 CP-SAT 问题类型，使用禁忌搜索算法搜索近似最优解。
支持整数变量、布尔变量、线性约束（惩罚法）和全局约束（AllDifferent）。
"""

import logging
import random
import time
from collections import deque
from typing import Dict, Any, List, Tuple

from app.services.solver_adapters.base import BaseSolverAdapter

logger = logging.getLogger(__name__)


class TabuSearchAdapter(BaseSolverAdapter):
    """禁忌搜索元启发式求解器适配器"""

    def validate(self, model_data: dict) -> dict:
        """验证模型数据完整性"""
        errors = []
        warnings = []

        int_vars = model_data.get("intVars", [])
        bool_vars = model_data.get("boolVars", [])

        if not int_vars and not bool_vars:
            errors.append("禁忌搜索模型至少需要一个整数变量或布尔变量")

        for v in int_vars:
            if not v.get("id"):
                errors.append("整数变量缺少 id 字段")

        for v in bool_vars:
            if not v.get("id"):
                errors.append("布尔变量缺少 id 字段")

        return {"valid": len(errors) == 0, "errors": errors, "warnings": warnings}

    def solve(self, model_data: dict, config: dict = None) -> dict:
        """执行禁忌搜索求解

        Args:
            model_data: 模型数据，格式同 CPSATAdapter
            config: 求解器配置，支持以下参数：
                - tabuTenure: 禁忌期限（默认 7）
                - maxIterations: 最大迭代次数（默认 5000）
                - neighborhoodSize: 邻域大小（默认 20）

        Returns:
            求解结果字典
        """
        config = config or {}
        start_time = time.time()

        try:
            # 读取参数
            tabu_tenure = config.get("tabuTenure", 7)
            max_iterations = config.get("maxIterations", 5000)
            neighborhood_size = config.get("neighborhoodSize", 20)

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
            current_cost = self._total_cost(
                current_solution, objective, linear_constraints, global_constraints, var_ids
            )

            best_solution = dict(current_solution)
            best_cost = current_cost

            # 禁忌表：记录 (变量index, 旧值, 新值) 的移动
            tabu_list: deque = deque(maxlen=tabu_tenure)

            for iteration in range(max_iterations):
                # 生成邻域
                neighbors = self._generate_neighborhood(
                    current_solution, var_ids, var_bounds, neighborhood_size
                )

                # 选择最好的非禁忌邻域解（或满足 Aspiration 准则）
                best_neighbor = None
                best_neighbor_cost = float("inf")
                best_move = None

                for neighbor, move in neighbors:
                    neighbor_cost = self._total_cost(
                        neighbor, objective, linear_constraints, global_constraints, var_ids
                    )

                    is_tabu = move in tabu_list

                    # Aspiration 准则：比全局最优更好则无视禁忌
                    if not is_tabu or neighbor_cost < best_cost:
                        if neighbor_cost < best_neighbor_cost:
                            best_neighbor = neighbor
                            best_neighbor_cost = neighbor_cost
                            best_move = move

                if best_neighbor is None:
                    # 所有邻域都在禁忌表中，跳过
                    continue

                # 移动到最佳邻域解
                current_solution = best_neighbor
                current_cost = best_neighbor_cost

                # 将移动加入禁忌表
                tabu_list.append(best_move)

                # 更新全局最优
                if current_cost < best_cost:
                    best_solution = dict(current_solution)
                    best_cost = current_cost

            # 构建结果
            best_obj_value = self._evaluate_objective(best_solution, objective, var_ids)
            best_penalty = self._evaluate_constraints(
                best_solution, linear_constraints, global_constraints, var_ids
            )

            status = "feasible"

            solve_time = time.time() - start_time
            logger.info(
                f"TS solve complete: status={status}, "
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
            logger.error(f"TS solve error: {e}", exc_info=True)
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

    def _generate_neighborhood(
        self,
        solution: Dict[str, int],
        var_ids: List[str],
        var_bounds: List[Tuple[int, int]],
        neighborhood_size: int,
    ) -> List[Tuple[Dict[str, int], tuple]]:
        """生成邻域解集合

        每个邻域解通过以下操作之一生成：
        - 随机选一个变量，随机取域内新值
        - 随机 swap 两个变量的值
        """
        neighbors = []
        n_vars = len(var_ids)

        for _ in range(neighborhood_size):
            neighbor = dict(solution)

            if n_vars >= 2 and random.random() < 0.3:
                # Swap 操作：交换两个变量的值
                i, j = random.sample(range(n_vars), 2)
                vi, vj = var_ids[i], var_ids[j]
                old_val_i, old_val_j = neighbor[vi], neighbor[vj]

                # 检查 swap 后是否在域范围内
                li, ui = var_bounds[i]
                lj, uj = var_bounds[j]
                if lj <= old_val_i <= uj and li <= old_val_j <= ui:
                    neighbor[vi] = old_val_j
                    neighbor[vj] = old_val_i
                    move = ("swap", i, j, old_val_i, old_val_j)
                else:
                    # swap 不可行，改用随机赋值
                    idx = random.randint(0, n_vars - 1)
                    vid = var_ids[idx]
                    lb, ub = var_bounds[idx]
                    old_val = neighbor[vid]
                    new_val = random.randint(lb, ub)
                    while new_val == old_val and (ub - lb) > 0:
                        new_val = random.randint(lb, ub)
                    neighbor[vid] = new_val
                    move = (idx, old_val, new_val)
            else:
                # 随机赋值操作
                idx = random.randint(0, n_vars - 1)
                vid = var_ids[idx]
                lb, ub = var_bounds[idx]
                old_val = neighbor[vid]
                new_val = random.randint(lb, ub)
                while new_val == old_val and (ub - lb) > 0:
                    new_val = random.randint(lb, ub)
                neighbor[vid] = new_val
                move = (idx, old_val, new_val)

            neighbors.append((neighbor, move))

        return neighbors

    def _evaluate_objective(
        self, solution: Dict[str, int], objective: dict, var_ids: List[str]
    ) -> float:
        """计算目标函数值"""
        if not objective:
            return 0.0

        coefficients = objective.get("coefficients", {})
        sense = objective.get("sense", "minimize")

        obj_value = sum(
            coefficients.get(vid, 0) * solution.get(vid, 0)
            for vid in var_ids
        )

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

        for gc in global_constraints:
            gc_type = gc.get("type")
            if gc_type == "AllDifferent":
                variables = gc.get("variables", [])
                values = [solution.get(vid, 0) for vid in variables if vid in solution]
                seen = set()
                duplicates = 0
                for val in values:
                    if val in seen:
                        duplicates += 1
                    seen.add(val)
                total_penalty += duplicates * penalty_coeff

        return total_penalty

    def _total_cost(
        self,
        solution: Dict[str, int],
        objective: dict,
        linear_constraints: list,
        global_constraints: list,
        var_ids: List[str],
    ) -> float:
        """计算总代价 = 目标函数 + 约束惩罚"""
        obj = self._evaluate_objective(solution, objective, var_ids)
        penalty = self._evaluate_constraints(solution, linear_constraints, global_constraints, var_ids)
        return obj + penalty
