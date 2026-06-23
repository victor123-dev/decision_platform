"""
代码生成器抽象基类

所有具体代码生成器必须继承此基类并实现 generate() 方法。
"""

from abc import ABC, abstractmethod


class BaseCodeGenerator(ABC):
    """代码生成器基类"""

    @abstractmethod
    def generate(self, model_data: dict) -> str:
        """将模型数据转换为可执行的 Python 代码

        Args:
            model_data: 模型定义字典

        Returns:
            完整的可执行 Python 代码字符串
        """
        ...
