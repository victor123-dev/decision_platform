"""
线性规划/混合整数规划 (LP/MIP) 代码生成器

将 OptimizationModel 的 variables/objective/constraints 转换为
可直接运行的 OR-Tools (pywraplp) Python 代码。

生成规范：
  - 使用代数表达式风格 (solver.Minimize / solver.Add)
  - 变量命名采用英文标识符
  - 注释标注中文变量名
  - 二进制变量使用 BoolVar
"""

import re
from typing import Dict

from .base import BaseCodeGenerator


class LinearMIPCodeGenerator(BaseCodeGenerator):
    """OR-Tools pywraplp (LP/MIP) 代码生成器"""

    def generate(self, model_data: dict) -> str:
        """
        将模型定义转换为 OR-Tools Python 代码。

        Args:
            model_data: 包含 variables, objective, constraints 的模型字典

        Returns:
            str: 可运行的 Python 代码字符串
        """
        variables = model_data.get("variables", [])
        objective = model_data.get("objective", {})
        constraints = model_data.get("constraints", [])
        model_name = model_data.get("name", "optimization_model")

        L = []  # output lines

        # ── 头部 ──
        L.append(f'"""')
        L.append(f'模型名称: {model_name}')
        L.append(f'自动生成 — 基于 OR-Tools 线性规划求解器')
        L.append(f'"""')
        L.append("")
        L.append("from ortools.linear_solver import pywraplp")
        L.append("")
        L.append("")
        L.append("def solve_model():")
        L.append('    """构建并求解优化模型"""')

        # ── 求解器初始化 ──
        L.append("    # 创建求解器 (SCIP > CBC 回退)")
        L.append("    solver = pywraplp.Solver.CreateSolver('SCIP')")
        L.append("    if not solver:")
        L.append("        solver = pywraplp.Solver.CreateSolver('CBC')")
        L.append("    if not solver:")
        L.append("        raise RuntimeError('无法创建 OR-Tools 求解器')")
        L.append("")

        # ── 决策变量 ──
        L.append("    # ─── 决策变量 ───")

        var_map = {}  # original_name -> safe_python_name
        for v in variables:
            name = v.get("name", "x")
            safe = self._safe_var(name)
            var_map[name] = safe

            vtype = v.get("type", "continuous")
            lb = v.get("lowerBound", 0) or 0
            ub = v.get("upperBound", None)

            ub_str = str(ub) if ub is not None else "solver.infinity()"
            lb_str = str(lb) if lb is not None else "-solver.infinity()"

            if vtype == "binary":
                L.append(f"    {safe} = solver.BoolVar('{name}')")
            elif vtype == "integer":
                L.append(f"    {safe} = solver.IntVar({lb_str}, {ub_str}, '{name}')")
            else:
                L.append(f"    {safe} = solver.NumVar({lb_str}, {ub_str}, '{name}')")

        L.append("")

        # ── 目标函数 ──
        obj_sense = objective.get("sense", "minimize")
        obj_coeffs = objective.get("coefficients", {})
        sense_label = "最小化" if obj_sense == "minimize" else "最大化"

        L.append("    # ─── 目标函数（" + sense_label + "）───")
        obj_expr = self._build_expr(obj_coeffs, var_map)
        if obj_expr == "0":
            L.append("    # 目标函数系数均为零")
            obj_expr = "0"

        if obj_sense == "minimize":
            L.append(f"    solver.Minimize({obj_expr})")
        else:
            L.append(f"    solver.Maximize({obj_expr})")
        L.append("")

        # ── 约束条件 ──
        L.append("    # ─── 约束条件 ───")
        for idx, c in enumerate(constraints):
            c_name = c.get("name", f"constraint_{idx+1}")
            c_sense = c.get("sense", "<=")
            c_rhs = c.get("rhs", 0)
            c_coeffs = c.get("coefficients", {})

            c_var = f"c{idx + 1}"
            lhs_expr = self._build_expr(c_coeffs, var_map)

            if c_sense == "<=":
                op = "<="
            elif c_sense == ">=":
                op = ">="
            else:
                op = "=="

            L.append(f"    {c_var} = solver.Add(")
            L.append(f"        {lhs_expr} {op} {c_rhs},")
            L.append(f"        '{c_name}')")

        L.append("")

        # ── 求解与结果输出 ──
        L.append("    # ─── 求解 ───")
        L.append("    status = solver.Solve()")
        L.append("")
        L.append("    # ─── 输出结果 ───")
        L.append("    if status == pywraplp.Solver.OPTIMAL:")
        L.append("        print(f'目标函数值: {solver.Objective().Value():.6f}')")
        L.append("        print(f'求解时间:   {solver.wall_time() / 1000:.4f} 秒')")
        L.append("        print()")
        L.append("        print('最优解:')")

        for v in variables:
            name = v.get("name", "x")
            safe = var_map.get(name, self._safe_var(name))
            L.append(f"        print(f'  {name} = {{{safe}.solution_value():.6f}}')")

        L.append("")
        L.append("    elif status == pywraplp.Solver.INFEASIBLE:")
        L.append("        print('模型无解（约束不可行）')")
        L.append("    elif status == pywraplp.Solver.UNBOUNDED:")
        L.append("        print('模型无界')")
        L.append("    elif status == pywraplp.Solver.NOT_SOLVED:")
        L.append("        print('模型未求解')")
        L.append("    else:")
        L.append("        print(f'求解状态码: {status}')")
        L.append("")
        L.append("")
        L.append("if __name__ == '__main__':")
        L.append("    solve_model()")
        L.append("")

        return "\n".join(L)

    def _build_expr(self, coefficients, var_map: Dict[str, str]) -> str:
        """
        将 {变量名: 系数} 字典转换为代数表达式字符串。

        例: {"x": 3, "y": -1, "z": 0.5} → "3 * x - y + 0.5 * z"
        """
        if isinstance(coefficients, list):
            # 兼容 list-of-dict 格式
            terms = []
            for item in coefficients:
                vn = item.get("variable", "")
                c = item.get("coefficient", 0)
                if abs(c) > 1e-10:
                    safe = var_map.get(vn, self._safe_var(vn))
                    terms.append((safe, c))
        elif isinstance(coefficients, dict):
            terms = []
            for vn, c in coefficients.items():
                if abs(c) > 1e-10:
                    safe = var_map.get(vn, self._safe_var(vn))
                    terms.append((safe, c))
        else:
            return "0"

        if not terms:
            return "0"

        parts = []
        for i, (name, coeff) in enumerate(terms):
            if i == 0:
                # 首项
                if coeff == 1:
                    parts.append(name)
                elif coeff == -1:
                    parts.append(f"-{name}")
                else:
                    parts.append(f"{self._fmt_num(coeff)} * {name}")
            else:
                # 后续项
                if coeff > 0:
                    if coeff == 1:
                        parts.append(f"+ {name}")
                    else:
                        parts.append(f"+ {self._fmt_num(coeff)} * {name}")
                else:  # coeff < 0
                    abs_c = abs(coeff)
                    if abs_c == 1:
                        parts.append(f"- {name}")
                    else:
                        parts.append(f"- {self._fmt_num(abs_c)} * {name}")

        return " ".join(parts)

    def _fmt_num(self, n) -> str:
        """格式化数字：整数不带小数点，浮点数保留必要精度"""
        if isinstance(n, float) and n == int(n):
            return str(int(n))
        return str(n)

    def _safe_var(self, name: str) -> str:
        """将变量名转换为合法的 Python 标识符"""
        safe = re.sub(r'[^a-zA-Z0-9_]', '_', name)
        if safe and safe[0].isdigit():
            safe = 'v_' + safe
        if not safe:
            safe = 'var'
        return safe
