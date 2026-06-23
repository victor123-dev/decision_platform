"""
SolverAdapter — 向后兼容入口

现在内部委托给 solver_adapters 包中的 LinearMIPAdapter。
原始导入路径 `from app.services.solver_adapter import SolverAdapter` 仍然可用。
"""

from app.services.solver_adapters import SolverAdapterFactory, LinearMIPAdapter


# 保持旧的类名可用（向后兼容）
class SolverAdapter:
    """向后兼容包装器，委托给 LinearMIPAdapter"""

    def __init__(self):
        self._adapter = LinearMIPAdapter()

    def solve(self, ir) -> dict:
        """求解 LinearModelIR。

        Args:
            ir: 编译后的 LinearModelIR (Pydantic model 或 dict)

        Returns:
            {
                "status": "optimal"|"infeasible"|"unbounded"|"error",
                "objective_value": float|None,
                "solution": {var_id: value},
                "solve_time": float,
            }
        """
        # 将 LinearModelIR 转为 dict 格式
        if hasattr(ir, "model_dump"):
            model_data = ir.model_dump()
        elif hasattr(ir, "dict"):
            model_data = ir.dict()
        else:
            model_data = ir

        return self._adapter.solve(model_data)
