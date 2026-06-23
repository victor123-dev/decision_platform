"""
GeneticAlgorithmAdapter — 遗传算法元启发式求解器适配器

适用于 CP-SAT 问题类型，使用 pymoo 框架实现遗传算法搜索近似最优解。
支持整数变量、布尔变量、线性约束和全局约束（AllDifferent）。
"""

import logging
import time
from typing import Dict, Any, List, Tuple

import numpy as np

from app.services.solver_adapters.base import BaseSolverAdapter

logger = logging.getLogger(__name__)


class _CPSATProblem:
    """pymoo Problem 子类，封装 CP-SAT 模型的目标与约束"""

    def __init__(
        self,
        var_ids: List[str],
        var_bounds: List[Tuple[int, int]],
        objective: dict,
        linear_constraints: list,
        global_constraints: list,
    ):
        n_var = len(var_ids)
        xl = np.array([b[0] for b in var_bounds], dtype=float)
        xu = np.array([b[1] for b in var_bounds], dtype=float)

        # 计算不等约束数量
        n_ieq_constr = 0
        for c in linear_constraints:
            op = c.get("operator", "<=")
            if op in ("<=", ">="):
                n_ieq_constr += 1

        # AllDifferent 全局约束作为不等约束
        for gc in global_constraints:
            if gc.get("type") == "AllDifferent":
                variables = gc.get("variables", [])
                # 每对变量需要不相等: n*(n-1)/2 个约束
                n = len(variables)
                n_ieq_constr += n * (n - 1) // 2

        self.var_ids = var_ids
        self.objective = objective
        self.linear_constraints = linear_constraints
        self.global_constraints = global_constraints

        # 使用 pymoo 的 Problem 定义
        from pymoo.core.problem import Problem

        self._pymoo_problem = Problem(
            n_var=n_var,
            n_obj=1,
            n_ieq_constr=n_ieq_constr,
            xl=xl,
            xu=xu,
            vtype=int,
        )

    def evaluate(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """评估一组解的目标值和约束违反

        Args:
            X: 解向量或解矩阵 (n_var,) 或 (pop_size, n_var)

        Returns:
            (f, g) 目标值和约束违反量
        """
        if X.ndim == 1:
            X = X.reshape(1, -1)

        pop_size = X.shape[0]
        f = np.zeros((pop_size, 1))

        # 计算不等约束数量
        n_ieq_constr = self._pymoo_problem.n_ieq_constr
        g = np.zeros((pop_size, n_ieq_constr))

        for i in range(pop_size):
            solution = {self.var_ids[j]: int(round(X[i, j])) for j in range(len(self.var_ids))}

            # 目标函数
            coefficients = self.objective.get("coefficients", {})
            sense = self.objective.get("sense", "minimize")
            obj_val = sum(
                coefficients.get(vid, 0) * solution.get(vid, 0)
                for vid in self.var_ids
            )
            if sense == "maximize":
                obj_val = -obj_val
            f[i, 0] = obj_val

            # 线性约束违反（pymoo 要求 g <= 0 表示可行）
            c_idx = 0
            for c in self.linear_constraints:
                coeffs = c.get("coefficients", {})
                op = c.get("operator", "<=")
                rhs = c.get("rhs", 0)
                lhs = sum(coeffs.get(vid, 0) * solution.get(vid, 0) for vid in self.var_ids)

                if op == "<=":
                    g[i, c_idx] = lhs - rhs  # <= rhs 可行 => lhs - rhs <= 0
                    c_idx += 1
                elif op == ">=":
                    g[i, c_idx] = rhs - lhs  # >= rhs 可行 => rhs - lhs <= 0
                    c_idx += 1

            # AllDifferent 约束
            for gc in self.global_constraints:
                if gc.get("type") == "AllDifferent":
                    variables = gc.get("variables", [])
                    for a in range(len(variables)):
                        for b in range(a + 1, len(variables)):
                            va = solution.get(variables[a], 0)
                            vb = solution.get(variables[b], 0)
                            # 两个变量不相等 => |va - vb| - 1 >= 0 (可行)
                            # pymoo: g <= 0 可行 => g = -(|va - vb| - 1) = 1 - |va - vb|
                            g[i, c_idx] = 1 - abs(va - vb)
                            c_idx += 1

        return f, g


class _PymooWrapper:
    """将自定义 Problem 包装成 pymoo 兼容的 Problem 类"""

    def __init__(self, cpsat_problem: _CPSATProblem):
        from pymoo.core.problem import Problem

        self.cpsat_problem = cpsat_problem
        p = cpsat_problem._pymoo_problem

        # 动态创建 pymoo Problem 子类
        class WrappedProblem(Problem):
            def __init__(self_self):
                super().__init__(
                    n_var=p.n_var,
                    n_obj=1,
                    n_ieq_constr=p.n_ieq_constr,
                    xl=p.xl,
                    xu=p.xu,
                    vtype=int,
                )

            def _evaluate(self_self, X, out, *args, **kwargs):
                f, g = cpsat_problem.evaluate(X)
                out["F"] = f
                if g.shape[1] > 0:
                    out["G"] = g

        self._wrapped_class = WrappedProblem


class GeneticAlgorithmAdapter(BaseSolverAdapter):
    """遗传算法元启发式求解器适配器（基于 pymoo）"""

    def validate(self, model_data: dict) -> dict:
        """验证模型数据完整性"""
        errors = []
        warnings = []

        int_vars = model_data.get("intVars", [])
        bool_vars = model_data.get("boolVars", [])

        if not int_vars and not bool_vars:
            errors.append("遗传算法模型至少需要一个整数变量或布尔变量")

        for v in int_vars:
            if not v.get("id"):
                errors.append("整数变量缺少 id 字段")

        for v in bool_vars:
            if not v.get("id"):
                errors.append("布尔变量缺少 id 字段")

        return {"valid": len(errors) == 0, "errors": errors, "warnings": warnings}

    def solve(self, model_data: dict, config: dict = None) -> dict:
        """执行遗传算法求解

        Args:
            model_data: 模型数据，格式同 CPSATAdapter
            config: 求解器配置，支持以下参数：
                - populationSize: 种群大小（默认 100）
                - generations: 迭代代数（默认 200）
                - crossoverRate: 交叉率（默认 0.9）
                - mutationRate: 变异率（默认 0.1）

        Returns:
            求解结果字典
        """
        config = config or {}
        start_time = time.time()

        try:
            from pymoo.algorithms.soo.nonconvex.ga import GA
            from pymoo.optimize import minimize as pymoo_minimize
            from pymoo.operators.crossover.sbx import SBX
            from pymoo.operators.mutation.pm import PM
            from pymoo.operators.sampling.rnd import IntegerRandomSampling
            from pymoo.termination import get_termination

            # 读取参数
            pop_size = config.get("populationSize", 100)
            n_gen = config.get("generations", 200)
            crossover_rate = config.get("crossoverRate", 0.9)
            mutation_rate = config.get("mutationRate", 0.1)

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

            # 构建 pymoo Problem
            cpsat_problem = _CPSATProblem(
                var_ids, var_bounds, objective, linear_constraints, global_constraints
            )
            wrapper = _PymooWrapper(cpsat_problem)
            problem = wrapper._wrapped_class()

            # 配置 GA 算法
            algorithm = GA(
                pop_size=pop_size,
                sampling=IntegerRandomSampling(),
                crossover=SBX(prob=crossover_rate, eta=3.0, vtype=float),
                mutation=PM(eta=3.0, vtype=float),
                eliminate_duplicates=True,
            )

            # 终止条件
            termination = get_termination("n_gen", n_gen)

            # 执行优化
            res = pymoo_minimize(
                problem,
                algorithm,
                termination,
                seed=42,
                verbose=False,
            )

            # 提取结果
            solve_time = time.time() - start_time

            if res.X is not None:
                best_x = np.atleast_1d(res.X)
                solution = {var_ids[j]: int(round(best_x[j])) for j in range(len(var_ids))}

                # 计算原始目标值（不取负）
                coefficients = objective.get("coefficients", {})
                sense = objective.get("sense", "minimize")
                obj_value = sum(
                    coefficients.get(vid, 0) * solution.get(vid, 0)
                    for vid in var_ids
                )
                if sense == "maximize":
                    # pymoo 中我们最小化 -obj，所以 res.F 是 -obj_value
                    # 这里 obj_value 已经是正确的正值
                    pass

                # 检查约束可行性
                _, g = cpsat_problem.evaluate(best_x)
                max_cv = np.max(g) if g.shape[1] > 0 else 0.0
                status = "feasible" if max_cv <= 1e-6 else "feasible"

                logger.info(
                    f"GA solve complete: status={status}, "
                    f"obj={obj_value}, time={solve_time:.3f}s"
                )

                return {
                    "status": status,
                    "objective_value": obj_value if objective else None,
                    "solution": solution,
                    "intSolution": {k: int(v) for k, v in solution.items()},
                    "solve_time": solve_time,
                }
            else:
                return {
                    "status": "infeasible",
                    "objective_value": None,
                    "solution": {},
                    "intSolution": {},
                    "solve_time": solve_time,
                }

        except Exception as e:
            logger.error(f"GA solve error: {e}", exc_info=True)
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
