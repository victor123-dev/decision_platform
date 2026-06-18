"""
LP 文件解析服务

纯 Python 实现，解析 LP 格式文件，提取完整的模型结构：
- 变量名、类型、边界
- 目标函数系数和方向
- 约束名称、系数、方向、RHS
"""

import re
import logging

logger = logging.getLogger(__name__)




def _parse_lp_content(content: str) -> dict:
    """纯 Python LP 格式解析器"""

    # 移除注释行（以 \ 开头）
    lines = []
    for line in content.split("\n"):
        stripped = line.strip()
        if stripped.startswith("\\") or stripped.startswith("*"):
            continue
        # 移除行内注释
        comment_idx = line.find("\\")
        if comment_idx > 0:
            line = line[:comment_idx]
        lines.append(line)

    text = "\n".join(lines)

    # 分段：按 LP 关键字分割
    sections = _split_sections(text)

    # 解析各段
    obj_sense, obj_name, obj_coeffs = _parse_objective_section(sections.get("objective", ""))
    constraints = _parse_constraints_section(sections.get("constraints", ""))
    bounds = _parse_bounds_section(sections.get("bounds", ""))
    binary_vars = _parse_integrality_section(sections.get("binary", ""))
    general_vars = _parse_integrality_section(sections.get("general", ""))

    # 收集所有变量名
    all_var_names = set()
    for var_name in obj_coeffs:
        all_var_names.add(var_name)
    for c in constraints:
        for var_name in c["coefficients"]:
            all_var_names.add(var_name)
    for var_name in bounds:
        all_var_names.add(var_name)
    for var_name in binary_vars:
        all_var_names.add(var_name)
    for var_name in general_vars:
        all_var_names.add(var_name)

    # 构建变量列表
    variables = []
    num_binary = 0
    num_integer = 0
    num_continuous = 0

    for var_name in sorted(all_var_names):
        var_type = "continuous"
        if var_name in binary_vars:
            var_type = "binary"
            num_binary += 1
        elif var_name in general_vars:
            var_type = "integer"
            num_integer += 1
        else:
            num_continuous += 1

        bound_info = bounds.get(var_name, {})
        lower = bound_info.get("lower", 0.0 if var_type != "binary" else 0.0)
        upper = bound_info.get("upper", None)

        if var_type == "binary":
            lower = 0.0
            upper = 1.0
        # 处理自由变量（无边界约束）
        if lower is not None and lower <= -1e20:
            lower = None
        if upper is not None and upper >= 1e20:
            upper = None

        variables.append({
            "name": var_name,
            "type": var_type,
            "lowerBound": lower,
            "upperBound": upper,
        })

    # 构建目标函数系数字典
    objective_coefficients = {}
    for var_name, coeff in obj_coeffs.items():
        if abs(coeff) > 1e-10:
            objective_coefficients[var_name] = round(coeff, 10)

    return {
        "name": "imported_model",
        "format": "lp",
        "objectiveSense": obj_sense,
        "variables": variables,
        "objective": {
            "sense": obj_sense,
            "coefficients": objective_coefficients,
        },
        "constraints": constraints,
        "stats": {
            "numVariables": len(variables),
            "numConstraints": len(constraints),
            "numBinary": num_binary,
            "numInteger": num_integer,
            "numContinuous": num_continuous,
        },
    }


def _split_sections(text: str) -> dict:
    """将 LP 文本按段落关键字分割"""
    sections = {}

    # 定义段落关键字（不区分大小写）
    section_patterns = [
        ("objective", r"(?i)\b(minimize|min|maximize|max)\b"),
        ("constraints", r"(?i)\b(subject\s+to|s\.?\s*t\.?|st)\b"),
        ("bounds", r"(?i)\b(bounds?|bound)\b"),
        ("binary", r"(?i)\b(binary|bin|binaries)\b"),
        ("general", r"(?i)\b(general|gen|generals|integer|integers)\b"),
    ]

    # 找到所有段落标记的位置
    markers = []
    for section_name, pattern in section_patterns:
        for match in re.finditer(pattern, text):
            markers.append((match.start(), match.end(), section_name, match.group()))

    # 按位置排序
    markers.sort(key=lambda x: x[0])

    # 去除重复的段落（同一段落类型可能有多个匹配，取第一个）
    seen_sections = set()
    filtered_markers = []
    for start, end, name, keyword in markers:
        if name not in seen_sections:
            seen_sections.add(name)
            filtered_markers.append((start, end, name, keyword))

    # 提取各段内容
    for i, (start, end, name, keyword) in enumerate(filtered_markers):
        if i + 1 < len(filtered_markers):
            next_start = filtered_markers[i + 1][0]
        else:
            # 查找 "End" 标记或文本末尾
            end_match = re.search(r"(?i)\bend\b", text[end:])
            if end_match:
                next_start = end + end_match.start()
            else:
                next_start = len(text)

        section_text = text[end:next_start]
        # 如果是目标函数段，包含关键字本身（min/max后面可能直接跟表达式）
        if name == "objective":
            sections[name] = section_text
        else:
            sections[name] = section_text

    return sections


def _parse_expression(text: str) -> dict:
    """
    解析线性表达式字符串，返回 {var_name: coefficient} 字典。
    支持格式: "3 x1 + 2 x2 - x3", "3*x1 + 2*x2", "x1 - 5*x2" 等
    """
    coeffs = {}
    # 标准化：去除空格中的多余部分
    text = text.strip()
    if not text:
        return coeffs

    # 在 - 和 + 前插入分隔符，但保留符号
    # 先处理减号：将 " - " 替换为 " + -"
    normalized = re.sub(r'\s*-\s*', ' + -', text)
    # 分割各项
    terms = re.split(r'\s*\+\s*', normalized)

    for term in terms:
        term = term.strip()
        if not term:
            continue

        # 匹配系数和变量名
        # 格式: [+-]?[数字][*]?变量名 或 [+-]?变量名
        match = re.match(
            r'^([+-]?\s*\d*\.?\d*(?:[eE][+-]?\d+)?)\s*\*?\s*([a-zA-Z_][a-zA-Z0-9_.]*)$',
            term
        )
        if match:
            coeff_str = match.group(1).replace(" ", "")
            var_name = match.group(2)

            if not coeff_str or coeff_str == "+":
                coeff = 1.0
            elif coeff_str == "-":
                coeff = -1.0
            else:
                try:
                    coeff = float(coeff_str)
                except ValueError:
                    coeff = 1.0

            coeffs[var_name] = coeffs.get(var_name, 0.0) + coeff
        else:
            # 尝试纯数字（常数项，忽略）
            try:
                float(term.replace(" ", ""))
            except ValueError:
                # 可能是纯变量名
                var_match = re.match(r'^([+-]?)\s*([a-zA-Z_][a-zA-Z0-9_.]*)$', term)
                if var_match:
                    sign = -1.0 if var_match.group(1) == "-" else 1.0
                    var_name = var_match.group(2)
                    coeffs[var_name] = coeffs.get(var_name, 0.0) + sign

    return coeffs


def _parse_objective_section(text: str) -> tuple:
    """解析目标函数段，返回 (sense, name, coefficients)"""
    text = text.strip()
    if not text:
        return "minimize", "obj", {}

    # 检查是否有 "obj:" 或类似标签
    obj_name = "obj"
    label_match = re.match(r'([a-zA-Z_]\w*)\s*:(.*)', text, re.DOTALL)
    if label_match:
        obj_name = label_match.group(1)
        text = label_match.group(2).strip()

    # 解析表达式（可能是多行）
    # 合并多行为一个表达式
    expr_text = " ".join(text.split())
    coeffs = _parse_expression(expr_text)

    # 确定方向（在 _split_sections 中已确定，这里默认 minimize）
    # 方向信息需要从原始关键字中获取
    sense = "minimize"  # 默认，调用方会修正

    return sense, obj_name, coeffs


def _parse_constraints_section(text: str) -> list:
    """解析约束段，返回约束列表"""
    constraints = []
    if not text.strip():
        return constraints

    # 将文本按行处理，合并续行（不以约束方向关键字开头的行是上一行的延续）
    constraint_texts = []
    current = ""

    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue

        # 检查是否包含约束方向
        if re.search(r'<=|>=|=|=<|=>', line):
            if current:
                constraint_texts.append(current)
            current = line
        elif re.match(r'^[a-zA-Z_]\w*\s*:', line):
            # 新的约束标签
            if current:
                constraint_texts.append(current)
            current = line
        else:
            # 续行
            current += " " + line

    if current:
        constraint_texts.append(current)

    # 解析每个约束
    for ct in constraint_texts:
        ct = ct.strip()
        if not ct:
            continue

        # 提取约束名（如果有 label:）
        c_name = f"c{len(constraints) + 1}"
        label_match = re.match(r'([a-zA-Z_]\w*)\s*:(.*)', ct)
        if label_match:
            c_name = label_match.group(1)
            ct = label_match.group(2).strip()

        # 提取约束方向和 RHS
        sense_match = re.search(r'(<=|>=|=|=<|=>)\s*([+-]?\s*\d*\.?\d*(?:[eE][+-]?\d+)?)\s*$', ct)
        if not sense_match:
            continue

        sense_raw = sense_match.group(1)
        rhs_str = sense_match.group(2).replace(" ", "")

        # 标准化方向
        if sense_raw in ("<=", "=<"):
            sense = "<="
        elif sense_raw in (">=", "=>"):
            sense = ">="
        else:
            sense = "=="

        try:
            rhs = float(rhs_str) if rhs_str else 0.0
        except ValueError:
            rhs = 0.0

        # 提取左侧表达式
        expr_text = ct[:sense_match.start()].strip()
        coefficients = _parse_expression(expr_text)

        if coefficients:
            constraints.append({
                "name": c_name,
                "coefficients": {k: round(v, 10) for k, v in coefficients.items() if abs(v) > 1e-10},
                "sense": sense,
                "rhs": round(rhs, 10),
            })

    return constraints


def _parse_bounds_section(text: str) -> dict:
    """解析边界段，返回 {var_name: {lower, upper}} 字典"""
    bounds = {}
    if not text.strip():
        return bounds

    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue

        # 格式1: lb <= var <= ub
        match1 = re.match(
            r'([+-]?\s*\d*\.?\d*|[-]?inf|[-]?infinity)\s*<=\s*([a-zA-Z_]\w*)\s*<=\s*([+-]?\s*\d*\.?\d*|inf|infinity)',
            line, re.IGNORECASE
        )
        if match1:
            lb = _parse_bound_value(match1.group(1))
            var_name = match1.group(2)
            ub = _parse_bound_value(match1.group(3))
            if var_name not in bounds:
                bounds[var_name] = {}
            bounds[var_name]["lower"] = lb
            bounds[var_name]["upper"] = ub
            continue

        # 格式2: var <= ub 或 var >= lb
        match2 = re.match(
            r'([a-zA-Z_]\w*)\s*(<=|>=|=)\s*([+-]?\s*\d*\.?\d*|[-+]?inf|[-+]?infinity)',
            line, re.IGNORECASE
        )
        if match2:
            var_name = match2.group(1)
            direction = match2.group(2)
            value = _parse_bound_value(match2.group(3))
            if var_name not in bounds:
                bounds[var_name] = {}
            if direction == "<=":
                bounds[var_name]["upper"] = value
            elif direction == ">=":
                bounds[var_name]["lower"] = value
            elif direction == "=":
                bounds[var_name]["lower"] = value
                bounds[var_name]["upper"] = value
            continue

        # 格式3: var free
        match3 = re.match(r'([a-zA-Z_]\w*)\s+free', line, re.IGNORECASE)
        if match3:
            var_name = match3.group(1)
            bounds[var_name] = {"lower": None, "upper": None}

    return bounds


def _parse_bound_value(s: str) -> float:
    """解析边界值字符串"""
    s = s.strip().replace(" ", "").lower()
    if s in ("inf", "+inf", "infinity", "+infinity"):
        return 1e30
    if s in ("-inf", "-infinity"):
        return -1e30
    try:
        return float(s)
    except ValueError:
        return 0.0


def _parse_integrality_section(text: str) -> set:
    """解析 Binary/General 段，返回变量名集合"""
    var_names = set()
    if not text.strip():
        return var_names

    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        # 每行可能有多个变量名
        for token in re.findall(r'[a-zA-Z_]\w*', line):
            var_names.add(token)

    return var_names


def _fix_objective_sense(text: str, sections: dict) -> str:
    """从原始文本中确定目标函数方向"""
    # 查找 minimize/maximize 关键字
    min_match = re.search(r'(?i)\b(minimize|min)\b', text)
    max_match = re.search(r'(?i)\b(maximize|max)\b', text)

    if min_match and (not max_match or min_match.start() < max_match.start()):
        return "minimize"
    elif max_match:
        return "maximize"
    return "minimize"


def parse_model_file(content: str, file_format: str) -> dict:
    """
    解析 LP 文件，返回完整的模型结构。

    Args:
        content: 文件文本内容
        file_format: 仅支持 'lp'

    Returns:
        dict: 包含 variables, objective, constraints, stats 的完整模型
    """
    if file_format.lower() != "lp":
        raise ValueError(f"仅支持 LP 格式文件，收到: {file_format}")

    result = _parse_lp_content(content)

    # 修正目标函数方向
    sense = _fix_objective_sense(content, {})
    result["objectiveSense"] = sense
    result["objective"]["sense"] = sense

    return result
