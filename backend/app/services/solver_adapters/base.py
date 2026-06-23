"""
BaseSolverAdapter — 求解器适配器抽象基类

所有求解器适配器（LP/MIP、CP-SAT 等）都必须实现此接口。
"""

from abc import ABC, abstractmethod
from typing import Dict, Any


class BaseSolverAdapter(ABC):
    """求解器适配器基类"""

    @abstractmethod
    def validate(self, model_data: dict) -> dict:
        """验证模型数据完整性

        Args:
            model_data: 模型数据字典

        Returns:
            {"valid": bool, "errors": [...], "warnings": [...]}
        """
        ...

    @abstractmethod
    def solve(self, model_data: dict, config: dict = None) -> dict:
        """执行求解

        Args:
            model_data: 模型数据字典
            config: 可选的求解器配置

        Returns:
            {
                "status": "optimal"|"feasible"|"infeasible"|"unbounded"|"error",
                "objective_value": float|None,
                "solution": {var_id: value},
                "solve_time": float,
                "message": str
            }
        """
        ...
