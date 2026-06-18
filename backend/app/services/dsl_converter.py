"""
OR-DSL 转换器

将 OptimizationModel 的扁平结构（variables/objective/constraints）
转换为 OR-DSL JSON 格式，包含集合、索引变量、本体语义引用等结构化信息。
"""

import logging
import re
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


def model_to_or_dsl(model_def: dict, ontologies: Optional[list] = None) -> dict:
    """
    将扁平模型定义转换为 OR-DSL JSON 结构。

    Args:
        model_def: 包含 variables, objective, constraints 的模型字典
        ontologies: 本体数据列表（用于语义匹配）

    Returns:
        dict: OR-DSL 格式的 JSON 结构
    """
    variables = model_def.get("variables", [])
    objective = model_def.get("objective", {})
    constraints = model_def.get("constraints", [])
    model_name = model_def.get("name", "optimization_model")
    problem_type = model_def.get("problem_type", "LP")

    # 构建本体查找表
    ontology_lookup = _build_ontology_lookup(ontologies or [])

    # ── 推断集合（Sets）──────────────────────────────────────────
    sets = _infer_sets(variables, ontology_lookup)

    # ── 转换变量 ─────────────────────────────────────────────────
    dsl_variables = []
    for v in variables:
        dsl_var = {
            "id": v.get("id", f"var-{v.get('name', 'x')}"),
            "symbol": v.get("name", "x"),
            "name": v.get("name", "x"),
            "domain": _map_domain(v.get("type", "continuous")),
            "lowerBound": v.get("lowerBound", 0),
            "upperBound": v.get("upperBound"),
        }

        # 优先透传模型草案中已有的本体语义引用
        if v.get("ontologyRef"):
            dsl_var["ontologyRef"] = v["ontologyRef"]
            if v.get("ontologyPath"):
                dsl_var["businessMeaning"] = f"{v['ontologyPath']}"
        else:
            # 尝试匹配本体语义
            onto_match = _match_variable_to_ontology(v.get("name", ""), ontology_lookup)
            if onto_match:
                dsl_var["ontologyRef"] = onto_match["ref"]
                dsl_var["businessMeaning"] = onto_match["meaning"]

        # 尝试推断索引（如果变量名包含下标模式如 X11M1）
        indices = _infer_variable_indices(v.get("name", ""), sets)
        if indices:
            dsl_var["indices"] = indices

        dsl_variables.append(dsl_var)

    # ── 转换目标函数 ─────────────────────────────────────────────
    dsl_objective = _convert_objective(objective, variables)

    # ── 转换约束条件 ─────────────────────────────────────────────
    dsl_constraints = []
    for idx, c in enumerate(constraints):
        dsl_con = {
            "id": c.get("id", f"con-{idx+1}"),
            "name": c.get("name", f"constraint_{idx+1}"),
            "expressionText": _build_expression_text(c),
            "operator": c.get("sense", "<="),
            "rhsValue": c.get("rhs", 0),
            "businessMeaning": c.get("description", c.get("name", "")),
        }

        # 推断约束类别
        dsl_con["category"] = _infer_constraint_category(c.get("name", ""))

        dsl_constraints.append(dsl_con)

    # ── 组装 OR-DSL ──────────────────────────────────────────────
    or_dsl = {
        "problemType": problem_type,
        "name": model_name,
        "businessProblem": model_def.get("description", ""),
        "sets": sets,
        "variables": dsl_variables,
        "objective": dsl_objective,
        "constraints": dsl_constraints,
    }

    # 如果有本体匹配，添加 ontologyId
    matched_ont_ids = set()
    for v in dsl_variables:
        if "ontologyRef" in v and v["ontologyRef"].get("ontologyId"):
            matched_ont_ids.add(v["ontologyRef"]["ontologyId"])
    if matched_ont_ids:
        or_dsl["ontologyId"] = list(matched_ont_ids)[0]

    return or_dsl


# ─────────────────────────────────────────────────────────────────────────────
# Helper functions
# ─────────────────────────────────────────────────────────────────────────────

def _build_ontology_lookup(ontologies: list) -> dict:
    """构建本体查找映射: property_label → {path, objectTypeId, propertyId, ontologyId, objectName}"""
    lookup = {}
    for ont in ontologies:
        ont_id = ont.get("id", "")
        ont_name = ont.get("name", "")
        for ot in ont.get("object_types", []):
            ot_id = ot.get("id", "")
            ot_display = ot.get("display_name", "")
            for prop in ot.get("properties", []):
                label = prop.get("label") or prop.get("name", "")
                if label:
                    lookup[label] = {
                        "path": f"{ont_name}.{ot_display}.{label}",
                        "ref": {
                            "ontologyId": ont_id,
                            "objectTypeId": ot_id,
                            "propertyId": prop.get("name", ""),
                        },
                        "meaning": f"{ot_display}的{label}",
                        "objectDisplayName": ot_display,
                    }
    return lookup


def _match_variable_to_ontology(var_name: str, lookup: dict) -> Optional[dict]:
    """尝试将变量名匹配到本体属性"""
    if not var_name or not lookup:
        return None

    # 直接匹配
    for label, info in lookup.items():
        if label in var_name or var_name in label:
            return info

    return None


def _infer_sets(variables: list, ontology_lookup: dict) -> list:
    """从变量列表中推断集合定义"""
    sets = []
    seen = set()

    # 分析变量名模式，提取可能的索引维度
    # 例如 X11M1 → 工件1, 机台1
    index_patterns = set()
    for v in variables:
        name = v.get("name", "")
        # 提取字母+数字的模式
        parts = re.findall(r'([A-Za-z]+)(\d+)', name)
        for prefix, _ in parts:
            if prefix.upper() not in ('X', 'Y', 'Z', 'S', 'C', 'T', 'Q', 'INV', 'SHIP',
                                        'CMAX', 'SS', 'DL', 'R'):
                index_patterns.add(prefix)

    # 将常见的索引前缀映射到集合
    PREFIX_TO_SET = {
        'M': {"symbol": "J", "name": "机台集合", "objectType": "机台"},
        'W': {"symbol": "W", "name": "仓库集合", "objectType": "仓库"},
        'P': {"symbol": "P", "name": "产品集合", "objectType": "产品"},
        'S': {"symbol": "S", "name": "供应商集合", "objectType": "供应商"},
        'C': {"symbol": "C", "name": "客户集合", "objectType": "客户"},
    }

    for prefix in index_patterns:
        upper = prefix.upper()
        if upper in PREFIX_TO_SET and upper not in seen:
            info = PREFIX_TO_SET[upper]
            sets.append({
                "id": f"set-{info['name']}",
                "symbol": info["symbol"],
                "name": info["name"],
            })
            seen.add(upper)

    return sets


def _infer_variable_indices(var_name: str, sets: list) -> list:
    """从变量名推断索引维度"""
    indices = []
    parts = re.findall(r'([A-Za-z]+)(\d+)', var_name)

    set_symbols = {s["symbol"] for s in sets}

    for prefix, _ in parts:
        upper = prefix.upper()
        if upper in ('X', 'Y', 'Z'):
            continue  # 跳过变量本身的符号
        for s in sets:
            if s["symbol"] == upper or s.get("name", "").startswith(prefix):
                indices.append(s["id"])

    return indices


def _map_domain(var_type: str) -> str:
    """映射变量类型到OR-DSL domain"""
    mapping = {
        "continuous": "continuous",
        "integer": "integer",
        "binary": "binary",
    }
    return mapping.get(var_type, "continuous")


def _convert_objective(objective: dict, variables: list) -> dict:
    """转换目标函数为OR-DSL格式，支持 $变量名 系数占位符透传"""
    sense = objective.get("sense", "minimize")
    coeffs = objective.get("coefficients", {})

    if isinstance(coeffs, dict):
        terms = []
        for var_name, coeff in coeffs.items():
            term = _format_coefficient_term(var_name, coeff)
            if term:
                terms.append(term)
        expr = " + ".join(terms).replace("+ -", "- ") if terms else "0"
    elif isinstance(coeffs, list):
        terms = []
        for item in coeffs:
            var_name = item.get("variable", "")
            coeff = item.get("coefficient", 0)
            term = _format_coefficient_term(var_name, coeff)
            if term:
                terms.append(term)
        expr = " + ".join(terms).replace("+ -", "- ") if terms else "0"
    else:
        expr = objective.get("expression", "0")

    return {
        "sense": sense,
        "expressionText": expr,
        "businessMeaning": objective.get("description", f"{sense} 目标函数"),
    }


def _build_expression_text(constraint: dict) -> str:
    """从约束的系数构建表达式文本，支持 $变量名 系数占位符透传"""
    coeffs = constraint.get("coefficients", {})
    sense = constraint.get("sense", "<=")
    rhs = constraint.get("rhs", 0)

    terms = []
    if isinstance(coeffs, dict):
        for var_name, coeff in coeffs.items():
            term = _format_coefficient_term(var_name, coeff)
            if term:
                terms.append(term)

    expr = " + ".join(terms).replace("+ -", "- ") if terms else "0"
    sense_symbol = {"<=": "≤", ">=": "≥", "==": "="}.get(sense, sense)
    return f"{expr} {sense_symbol} {rhs}"


def _format_coefficient_term(var_name: str, coeff: Any) -> Optional[str]:
    """格式化单个系数项，支持 $变量名 占位符和数值系数"""
    if not var_name:
        return None

    # 支持 "$变量名" 形式的占位符（字符串且以 $ 开头）
    if isinstance(coeff, str):
        coeff = coeff.strip()
        if coeff.startswith("$"):
            return f"{coeff}*{var_name}"
        # 尝试转换为数字
        try:
            coeff = float(coeff)
        except ValueError:
            return None

    if isinstance(coeff, (int, float)):
        if abs(coeff) < 1e-10:
            return None
        if coeff == 1:
            return var_name
        if coeff == -1:
            return f"-{var_name}"
        return f"{coeff}*{var_name}"

    return None


def _infer_constraint_category(name: str) -> str:
    """根据约束名称推断类别"""
    name_lower = name.lower()
    if any(kw in name_lower for kw in ["分配", "assign", "唯一", "unique"]):
        return "assignment"
    if any(kw in name_lower for kw in ["产能", "容量", "capacity", "上限", "不超"]):
        return "capacity"
    if any(kw in name_lower for kw in ["顺序", "前", "preceden", "sequence"]):
        return "precedence"
    if any(kw in name_lower for kw in ["互斥", "不重叠", "mutual", "exclusion"]):
        return "mutual_exclusion"
    if any(kw in name_lower for kw in ["平衡", "balance", "等式", "定义"]):
        return "balance"
    return "custom"
