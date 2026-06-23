"""
代码生成器工厂

根据问题类型创建对应的代码生成器实例。
"""

from .base import BaseCodeGenerator
from .linear_mip_generator import LinearMIPCodeGenerator
from .cpsat_generator import CPSATCodeGenerator


class CodeGeneratorFactory:
    """代码生成器工厂类"""

    @staticmethod
    def create(problem_type: str) -> BaseCodeGenerator:
        """
        根据问题类型创建对应的代码生成器。

        Args:
            problem_type: 问题类型，支持 "LP", "MIP", "CP_SAT"

        Returns:
            对应的代码生成器实例

        Raises:
            ValueError: 不支持的问题类型
        """
        if problem_type in ("LP", "MIP"):
            return LinearMIPCodeGenerator()
        elif problem_type == "CP_SAT":
            return CPSATCodeGenerator()
        else:
            raise ValueError(f"Unsupported problem type: {problem_type}")
