"""
OR-Tools Python 代码生成器 — 向后兼容入口

新代码请使用 code_generators 包中的 CodeGeneratorFactory。
"""

import re

from app.services.code_generators import CodeGeneratorFactory, LinearMIPCodeGenerator


# 保留原有函数签名（向后兼容）
def generate_ortools_code(model_def: dict) -> str:
    """向后兼容接口：生成 OR-Tools LP/MIP Python 代码"""
    generator = LinearMIPCodeGenerator()
    return generator.generate(model_def)


# 保留辅助函数（其他模块可能引用）
def _safe_var(name: str) -> str:
    """将变量名转换为合法的 Python 标识符"""
    safe = re.sub(r'[^a-zA-Z0-9_]', '_', name)
    if safe and safe[0].isdigit():
        safe = 'v_' + safe
    if not safe:
        safe = 'var'
    return safe
