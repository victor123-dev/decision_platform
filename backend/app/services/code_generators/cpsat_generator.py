"""
CP-SAT 约束求解器代码生成器

将模型定义转换为可直接运行的 OR-Tools CP-SAT Python 代码。

生成规范：
  - 使用代数表达式风格 (model.add / model.minimize)
  - 变量命名采用英文标识符
  - 注释标注中文变量名/含义
  - 布尔变量使用 new_bool_var()
  - 整数变量使用 new_int_var()
  - 区间变量使用 new_interval_var()
  - 全局约束映射到对应 API
"""

import re
from typing import Dict, List

from .base import BaseCodeGenerator


class CPSATCodeGenerator(BaseCodeGenerator):
    """OR-Tools CP-SAT 约束求解器代码生成器"""

    def generate(self, model_data: dict) -> str:
        """
        将模型定义转换为 CP-SAT Python 代码。

        Args:
            model_data: 包含变量、约束、目标函数等的模型字典

        Returns:
            str: 可运行的 Python 代码字符串
        """
        model_name = model_data.get("name", "cp_sat_model")
        int_vars = model_data.get("intVars", [])
        bool_vars = model_data.get("boolVars", [])
        interval_vars = model_data.get("intervalVars", [])
        linear_constraints = model_data.get("linearConstraints", [])
        global_constraints = model_data.get("globalConstraints", [])
        objective = model_data.get("objective", {})
        cpsat_config = model_data.get("cpsatConfig", {})

        # 构建变量名映射: id -> safe_python_name
        var_map: Dict[str, str] = {}
        # 也维护 id -> 原始描述
        var_desc: Dict[str, str] = {}

        for v in int_vars:
            vid = v.get("id", v.get("name", "x"))
            name = v.get("name", vid)
            safe = self._safe_var(name)
            # 避免重名
            safe = self._unique_name(safe, var_map)
            var_map[vid] = safe
            var_desc[vid] = v.get("description", name)

        for v in bool_vars:
            vid = v.get("id", v.get("name", "b"))
            name = v.get("name", vid)
            safe = self._safe_var(name)
            safe = self._unique_name(safe, var_map)
            var_map[vid] = safe
            var_desc[vid] = v.get("description", name)

        for v in interval_vars:
            vid = v.get("id", v.get("name", "iv"))
            name = v.get("name", vid)
            safe = self._safe_var(name)
            safe = self._unique_name(safe, var_map)
            var_map[vid] = safe
            var_desc[vid] = v.get("description", name)
            # 区间变量的 start/end 也注册
            start_var = v.get("startVar")
            end_var = v.get("endVar")
            if start_var and start_var not in var_map:
                var_map[start_var] = f"{safe}_start"
            if end_var and end_var not in var_map:
                var_map[end_var] = f"{safe}_end"

        L: List[str] = []

        # ── 头部 ──
        L.append('"""')
        L.append(f'模型名称: {model_name}')
        L.append('自动生成 — 基于 OR-Tools CP-SAT 约束求解器')
        L.append('"""')
        L.append("")
        L.append("from ortools.sat.python import cp_model")
        L.append("")
        L.append("")
        L.append("def solve_model():")
        L.append('    """构建并求解 CP-SAT 模型"""')
        L.append("    model = cp_model.CpModel()")
        L.append("")

        # ── 整数变量 ──
        all_var_safes = []  # 用于结果输出
        if int_vars:
            L.append("    # ─── 整数变量 ───")
            for v in int_vars:
                vid = v.get("id", v.get("name", "x"))
                name = v.get("name", vid)
                safe = var_map[vid]
                lb = v.get("lowerBound", 0)
                ub = v.get("upperBound", 100)
                desc = v.get("description", name)
                L.append(f"    {safe} = model.new_int_var({lb}, {ub}, '{name}')  # {desc}")
                all_var_safes.append((safe, name))
            L.append("")

        # ── 布尔变量 ──
        if bool_vars:
            L.append("    # ─── 布尔变量 ───")
            for v in bool_vars:
                vid = v.get("id", v.get("name", "b"))
                name = v.get("name", vid)
                safe = var_map[vid]
                desc = v.get("description", name)
                L.append(f"    {safe} = model.new_bool_var('{name}')  # {desc}")
                all_var_safes.append((safe, name))
            L.append("")

        # ── 区间变量 ──
        if interval_vars:
            L.append("    # ─── 区间变量 ───")
            for v in interval_vars:
                vid = v.get("id", v.get("name", "iv"))
                name = v.get("name", vid)
                safe = var_map[vid]
                desc = v.get("description", name)

                start_var = v.get("startVar")
                end_var = v.get("endVar")
                size_min = v.get("sizeMin", 1)
                size_max = v.get("sizeMax", size_min)

                start_safe = var_map.get(start_var, f"{safe}_start")
                end_safe = var_map.get(end_var, f"{safe}_end")

                # 生成 start/end 辅助变量（如果尚未作为 intVar 声明）
                start_already = any(iv.get("id") == start_var for iv in int_vars)
                end_already = any(iv.get("id") == end_var for iv in int_vars)

                horizon = v.get("horizon", 1000)
                if not start_already:
                    L.append(f"    {start_safe} = model.new_int_var(0, {horizon}, '{name}_start')")
                if not end_already:
                    L.append(f"    {end_safe} = model.new_int_var(0, {horizon}, '{name}_end')")

                size_safe = f"{safe}_size"
                L.append(f"    {size_safe} = model.new_int_var({size_min}, {size_max}, '{name}_size')")
                L.append(f"    {safe} = model.new_interval_var({start_safe}, {size_safe}, {end_safe}, '{name}')  # {desc}")
                all_var_safes.append((start_safe, f"{name}_start"))
                all_var_safes.append((end_safe, f"{name}_end"))
            L.append("")

        # ── 线性约束 ──
        if linear_constraints:
            L.append("    # ─── 线性约束 ───")
            for idx, c in enumerate(linear_constraints):
                c_name = c.get("name", f"约束{idx + 1}")
                c_coeffs = c.get("coefficients", {})
                c_op = c.get("operator", "<=")
                c_rhs = c.get("rhs", 0)

                expr = self._build_expr(c_coeffs, var_map)
                if c_op == "<=":
                    op_str = "<="
                elif c_op == ">=":
                    op_str = ">="
                else:
                    op_str = "=="

                L.append(f"    model.add({expr} {op_str} {self._fmt_num(c_rhs)})  # {c_name}")
            L.append("")

        # ── 全局约束 ──
        if global_constraints:
            L.append("    # ─── 全局约束 ───")
            for gc in global_constraints:
                gc_type = gc.get("type", "")
                gc_name = gc.get("name", gc_type)
                gc_vars = gc.get("variables", [])

                var_list = [var_map.get(v, self._safe_var(v)) for v in gc_vars]
                var_list_str = ", ".join(var_list)

                if gc_type == "AllDifferent":
                    L.append(f"    model.add_all_different([{var_list_str}])  # {gc_name}")
                elif gc_type == "NoOverlap":
                    L.append(f"    model.add_no_overlap([{var_list_str}])  # {gc_name}")
                elif gc_type == "Cumulative":
                    demands = gc.get("demands", [])
                    capacity = gc.get("capacity", 1)
                    demands_str = ", ".join(str(d) for d in demands)
                    L.append(f"    model.add_cumulative([{var_list_str}], [{demands_str}], {capacity})  # {gc_name}")
                elif gc_type == "Circuit":
                    L.append(f"    model.add_circuit([{var_list_str}])  # {gc_name}")
                elif gc_type == "Inverse":
                    inverse_vars = gc.get("inverseVariables", [])
                    inv_list = [var_map.get(v, self._safe_var(v)) for v in inverse_vars]
                    inv_list_str = ", ".join(inv_list)
                    L.append(f"    model.add_inverse([{var_list_str}], [{inv_list_str}])  # {gc_name}")
                else:
                    L.append(f"    # 未知全局约束类型: {gc_type} ({gc_name})")
            L.append("")

        # ── 目标函数 ──
        if objective and objective.get("coefficients"):
            obj_sense = objective.get("sense", "minimize")
            obj_coeffs = objective.get("coefficients", {})
            sense_label = "最小化" if obj_sense == "minimize" else "最大化"

            L.append(f"    # ─── 目标函数（{sense_label}）───")
            obj_expr = self._build_expr(obj_coeffs, var_map)

            if obj_sense == "minimize":
                L.append(f"    model.minimize({obj_expr})")
            else:
                L.append(f"    model.maximize({obj_expr})")
            L.append("")

        # ── 求解 ──
        L.append("    # ─── 求解 ───")
        L.append("    solver = cp_model.CpSolver()")

        # 求解器参数配置
        time_limit = cpsat_config.get("timeLimitSeconds", 60)
        num_workers = cpsat_config.get("numWorkers", 8)
        log_search = cpsat_config.get("logSearchProgress", False)

        L.append(f"    solver.parameters.max_time_in_seconds = {time_limit}")
        L.append(f"    solver.parameters.num_workers = {num_workers}")
        if log_search:
            L.append("    solver.parameters.log_search_progress = True")
        L.append("    status = solver.solve(model)")
        L.append("")

        # ── 输出结果 ──
        L.append("    # ─── 输出结果 ───")
        L.append("    if status == cp_model.OPTIMAL:")
        if objective and objective.get("coefficients"):
            L.append("        print(f'目标函数值: {solver.objective_value}')")
        L.append("        print(f'求解时间:   {solver.wall_time:.4f} 秒')")
        L.append("        print()")
        L.append("        print('最优解:')")
        for safe, name in all_var_safes:
            L.append(f"        print(f'  {name} = {{solver.value({safe})}}')")

        L.append("    elif status == cp_model.FEASIBLE:")
        L.append("        print('找到可行解（非最优）:')")
        if objective and objective.get("coefficients"):
            L.append("        print(f'  目标函数值: {solver.objective_value}')")
        for safe, name in all_var_safes:
            L.append(f"        print(f'  {name} = {{solver.value({safe})}}')")

        L.append("    elif status == cp_model.INFEASIBLE:")
        L.append("        print('模型无解（约束不可满足）')")
        L.append("    else:")
        L.append("        print(f'求解状态: {solver.status_name(status)}')")
        L.append("")
        L.append("")
        L.append("if __name__ == '__main__':")
        L.append("    solve_model()")
        L.append("")

        return "\n".join(L)

    def _build_expr(self, coefficients: dict, var_map: Dict[str, str]) -> str:
        """
        将 {变量ID: 系数} 字典转换为代数表达式字符串。

        例: {"v1": 3, "v2": -1} → "3 * x - y"
        """
        if isinstance(coefficients, list):
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
                if coeff == 1:
                    parts.append(name)
                elif coeff == -1:
                    parts.append(f"-{name}")
                else:
                    parts.append(f"{self._fmt_num(coeff)} * {name}")
            else:
                if coeff > 0:
                    if coeff == 1:
                        parts.append(f"+ {name}")
                    else:
                        parts.append(f"+ {self._fmt_num(coeff)} * {name}")
                else:
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

    def _unique_name(self, name: str, existing: Dict[str, str]) -> str:
        """确保变量名在已有映射中唯一"""
        used = set(existing.values())
        if name not in used:
            return name
        idx = 2
        while f"{name}_{idx}" in used:
            idx += 1
        return f"{name}_{idx}"
