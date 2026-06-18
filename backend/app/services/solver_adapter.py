"""
SolverAdapter — LinearModelIR → OR-Tools LP/MIP

将编译器输出的 LinearModelIR 转换为 OR-Tools 可执行的 LP/MIP 模型并求解。
"""

import logging
import time
from typing import Dict, Optional

from ortools.linear_solver import pywraplp

from app.schemas.optimization_dsl import LinearModelIR

logger = logging.getLogger(__name__)


class SolverAdapter:
    """将 LinearModelIR 转换为 OR-Tools 模型并求解。"""

    def solve(self, ir: LinearModelIR) -> dict:
        """求解 LinearModelIR。

        Args:
            ir: 编译后的 LinearModelIR

        Returns:
            {
                "status": "optimal" | "infeasible" | "unbounded" | "error",
                "objective_value": float | None,
                "solution": {var_id: value},
                "solve_time": float,
            }
        """
        start_time = time.time()

        try:
            variables = ir.variables
            constraints = ir.constraints
            objective = ir.objective

            num_cols = len(variables)
            num_rows = len(constraints)

            if num_cols == 0:
                return {
                    "status": "error",
                    "objective_value": None,
                    "solution": {},
                    "solve_time": time.time() - start_time,
                    "message": "模型中没有变量",
                }

            # 创建求解器（SCIP 支持 LP + MIP）
            solver = pywraplp.Solver.CreateSolver("SCIP")
            if not solver:
                # 回退到 CBC
                solver = pywraplp.Solver.CreateSolver("CBC")
            if not solver:
                return {
                    "status": "error",
                    "objective_value": None,
                    "solution": {},
                    "solve_time": time.time() - start_time,
                    "message": "无法创建 OR-Tools 求解器 (SCIP/CBC)",
                }

            # 变量 ID → OR-Tools 变量映射
            var_map: Dict[str, pywraplp.Variable] = {}
            for v in variables:
                lb = v.lowerBound if v.lowerBound is not None else 0.0
                ub = v.upperBound if v.upperBound is not None else solver.infinity()

                if v.domain == "binary":
                    var_map[v.id] = solver.IntVar(0, 1, v.id)
                elif v.domain == "integer":
                    var_map[v.id] = solver.IntVar(lb, ub, v.id)
                else:
                    var_map[v.id] = solver.NumVar(lb, ub, v.id)

            # 目标函数
            obj = solver.Objective()
            for var_id, coeff in objective.coefficients.items():
                if var_id in var_map and coeff != 0:
                    obj.SetCoefficient(var_map[var_id], coeff)

            if ir.sense == "maximize":
                obj.SetMaximization()
            else:
                obj.SetMinimization()

            # 约束条件
            for c in constraints:
                rhs = c.rhs
                if c.operator == "<=":
                    row_lb = -solver.infinity()
                    row_ub = rhs
                elif c.operator == ">=":
                    row_lb = rhs
                    row_ub = solver.infinity()
                elif c.operator == "==":
                    row_lb = rhs
                    row_ub = rhs
                else:
                    row_lb = -solver.infinity()
                    row_ub = solver.infinity()

                constraint = solver.Constraint(row_lb, row_ub, c.name)
                for var_id, coeff in c.coefficients.items():
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

            if status == pywraplp.Solver.OPTIMAL:
                objective_value = solver.Objective().Value()
                for v in variables:
                    if v.id in var_map:
                        solution[v.id] = var_map[v.id].solution_value()

            solve_time = time.time() - start_time

            logger.info(
                f"Solve complete: status={solve_status}, "
                f"obj={objective_value}, time={solve_time:.3f}s"
            )

            return {
                "status": solve_status,
                "objective_value": objective_value,
                "solution": solution,
                "solve_time": solve_time,
            }

        except Exception as e:
            logger.error(f"Solve error: {e}", exc_info=True)
            return {
                "status": "error",
                "objective_value": None,
                "solution": {},
                "solve_time": time.time() - start_time,
                "message": str(e),
            }
