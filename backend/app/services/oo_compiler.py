"""
OO-DSL Compiler — DSL → LinearModelIR

职责：
- 调用 OntologyResolver 获取集合实例和参数值
- 展开变量模板（笛卡尔积）
- 解析 expressionText（MVP：正则 + 模式匹配）
- 展开目标函数 → 系数字典
- 展开约束模板（forEach 遍历）→ 约束实例列表
- 输出 LinearModelIR
"""

import re
import logging
import itertools
from typing import Dict, List, Any, Optional, Tuple

from app.schemas.optimization_dsl import LinearModelIR, IRVariable, IRObjective, IRConstraint
from app.services.ontology_resolver import OntologyResolver

logger = logging.getLogger(__name__)


# ────────────────────────────────────────────────────────────────────
# Expression Parser Helpers
# ────────────────────────────────────────────────────────────────────

# 匹配 sum(alias in setId, ...) body
SUM_PATTERN = re.compile(
    r"sum\s*\(([^)]+)\)\s*(.*)", re.DOTALL
)

# 匹配 index binding: alias in setId
BINDING_PATTERN = re.compile(
    r"(\w+)\s+in\s+(\w+)"
)

# 匹配 param/variable reference: symbol[idx1,idx2,...]
REF_PATTERN = re.compile(
    r"(\w+)\s*\[([^\]]+)\]"
)

# 匹配纯量引用（无索引）: symbol （不是 sum 关键词）
SCALAR_PATTERN = re.compile(
    r"(?<!\w)(?!sum\b)(\w+)(?!\s*\[)(?!\s*\()"
)


def _parse_sum_expression(expr_text: str) -> Tuple[List[Tuple[str, str]], str]:
    """解析 sum(...) body 表达式。

    Returns:
        (bindings, body)
        bindings: [(alias, setId), ...]
        body: 内部表达式文本
    """
    expr_text = expr_text.strip()
    m = SUM_PATTERN.match(expr_text)
    if not m:
        return [], expr_text

    bindings_str = m.group(1)
    body = m.group(2).strip()

    bindings = []
    for bm in BINDING_PATTERN.finditer(bindings_str):
        bindings.append((bm.group(1), bm.group(2)))

    return bindings, body


def _parse_body_terms(body: str) -> List[Tuple[float, Dict[str, List[str]], Dict[str, List[str]]]]:
    """解析 body 表达式为项列表。

    每个项 = (系数, {param_symbol: [index_aliases]}, {var_symbol: [index_aliases]})

    支持的模式：
    - "param[i,j] * x[i,j]"
    - "x[i,j]"
    - "3.0 * x[i,j]"
    - "param[i] * x[i,j] * y[j]"
    - "-x[i,j]"
    """
    body = body.strip()
    if not body:
        return []

    # 按 * 分割（但注意不要分割 [] 内的内容）
    tokens = _split_multiply(body)

    terms = []
    coeff = 1.0
    params = {}
    variables = {}

    for token in tokens:
        token = token.strip()
        if not token:
            continue

        # 尝试匹配 ref[idx] 模式
        ref_match = REF_PATTERN.match(token)
        if ref_match:
            symbol = ref_match.group(1)
            indices = [i.strip() for i in ref_match.group(2).split(",")]
            # 暂时标记为 unknown，后续根据 symbol 查表确定是 param 还是 var
            terms.append(("ref", symbol, indices))
            continue

        # 尝试匹配纯数字
        try:
            val = float(token)
            coeff *= val
            continue
        except ValueError:
            pass

        # 尝试匹配纯符号（无索引的变量或参数）
        scalar_match = SCALAR_PATTERN.match(token)
        if scalar_match:
            symbol = scalar_match.group(1)
            terms.append(("scalar", symbol, []))
            continue

        logger.warning(f"Cannot parse token: '{token}' in body '{body}'")

    # 将 ref/scalar 分类为 param 或 var（需要外部传入 symbol 表）
    return terms


def _split_multiply(expr: str) -> List[str]:
    """按 * 分割表达式，忽略 [] 内部的 *。"""
    tokens = []
    depth = 0
    current = ""
    i = 0
    while i < len(expr):
        ch = expr[i]
        if ch == '[':
            depth += 1
            current += ch
        elif ch == ']':
            depth -= 1
            current += ch
        elif ch == '*' and depth == 0:
            tokens.append(current.strip())
            current = ""
        else:
            current += ch
        i += 1
    if current.strip():
        tokens.append(current.strip())
    return tokens


def _classify_terms(
    raw_terms: list,
    param_symbols: Dict[str, dict],
    var_symbols: Dict[str, dict],
) -> List[Tuple[float, Dict[str, List[str]], Dict[str, List[str]]]]:
    """将解析出的项分类为参数和变量引用。

    Returns:
        [(coeff, {param_symbol: [indices]}, {var_symbol: [indices]}), ...]
    """
    result = []
    coeff = 1.0
    params: Dict[str, List[str]] = {}
    variables: Dict[str, List[str]] = {}

    for term_type, symbol, indices in raw_terms:
        if term_type == "ref":
            if symbol in param_symbols:
                params[symbol] = indices
            elif symbol in var_symbols:
                variables[symbol] = indices
            else:
                # 默认尝试当变量处理
                logger.warning(f"Unknown symbol '{symbol}', treating as variable")
                variables[symbol] = indices
        elif term_type == "scalar":
            if symbol in param_symbols:
                params[symbol] = indices
            elif symbol in var_symbols:
                variables[symbol] = indices
            else:
                try:
                    coeff *= float(symbol)
                except ValueError:
                    logger.warning(f"Unknown scalar symbol '{symbol}', treating as variable")
                    variables[symbol] = indices

    result.append((coeff, params, variables))
    return result


# ────────────────────────────────────────────────────────────────────
# Symbol → Set ID 映射工具
# ────────────────────────────────────────────────────────────────────

def _build_symbol_to_setid_map(
    indices: List[str],
    set_id_to_symbol: Dict[str, str],
) -> Dict[str, str]:
    """构建 alias → setId 映射。

    例如 indices=["set_person", "set_task"]，
    set_id_to_symbol={"set_person": "I", "set_task": "J"}
    → {"i": "set_person", "j": "set_task"}
    （MVP 中 alias 默认为 index 的小写字母）
    """
    mapping = {}
    for idx_id in indices:
        sym = set_id_to_symbol.get(idx_id, idx_id)
        # alias 默认为 symbol 的小写首字母或整个 symbol 小写
        alias = sym.lower()
        mapping[alias] = idx_id
    return mapping


# ────────────────────────────────────────────────────────────────────
# OOCompiler
# ────────────────────────────────────────────────────────────────────

class OOCompiler:
    """将 OO-DSL 模型编译为 LinearModelIR。"""

    def __init__(self, resolver: OntologyResolver):
        self.resolver = resolver

    def compile(self, dsl_model: dict) -> LinearModelIR:
        """编译 DSL 模型。

        Args:
            dsl_model: OptimizationDslModel dict

        Returns:
            LinearModelIR
        """
        model_id = dsl_model.get("id", "unknown")
        logger.info(f"Compiling DSL model: {model_id}")

        # 1. 解析集合实例和参数值
        set_instances, parameter_values = self.resolver.resolve_all(dsl_model)

        # 2. 构建符号映射表
        sets = dsl_model.get("sets", [])
        parameters = dsl_model.get("parameters", [])
        variables = dsl_model.get("variables", [])
        objective = dsl_model.get("objective")
        constraints = dsl_model.get("constraints", [])

        set_id_to_symbol = {s["id"]: s["symbol"] for s in sets}
        set_symbol_to_id = {s["symbol"]: s["id"] for s in sets}  # 反向映射: "I" -> "set_person"
        set_id_to_instances = set_instances  # {set_id: [instances]}

        param_symbol_to_def = {p["symbol"]: p for p in parameters}
        param_id_to_values = {}
        for p in parameters:
            pid = p["id"]
            if pid in parameter_values:
                param_id_to_values[pid] = parameter_values[pid]
            # 也建一个 symbol -> values 的映射
        param_symbol_to_values = {}
        for p in parameters:
            param_symbol_to_values[p["symbol"]] = param_id_to_values.get(p["id"], {})

        var_symbol_to_def = {v["symbol"]: v for v in variables}

        # 3. 展开变量模板
        expanded_vars: List[IRVariable] = []
        var_id_to_def = {}  # var_id -> variable template def

        for v in variables:
            var_instances = self._expand_variable_template(
                v, set_id_to_instances, set_id_to_symbol
            )
            for vi in var_instances:
                expanded_vars.append(vi)
                var_id_to_def[vi.id] = v

        logger.info(f"Expanded {len(variables)} templates -> {len(expanded_vars)} variables")

        # 4. 展开目标函数
        obj_sense = "minimize"
        obj_coefficients: Dict[str, float] = {}
        obj_constant = 0.0

        if objective:
            obj_sense = objective.get("sense", "minimize")
            expr_text = objective.get("expressionText", "")
            obj_coefficients, obj_constant = self._expand_expression(
                expr_text, set_id_to_instances, set_id_to_symbol, set_symbol_to_id,
                param_symbol_to_values, param_symbol_to_def,
                var_symbol_to_def, expanded_vars,
            )

        ir_objective = IRObjective(coefficients=obj_coefficients, constant=obj_constant)

        # 5. 展开约束模板
        ir_constraints: List[IRConstraint] = []
        for c in constraints:
            constraint_instances = self._expand_constraint_template(
                c, set_id_to_instances, set_id_to_symbol, set_symbol_to_id,
                param_symbol_to_values, param_symbol_to_def,
                var_symbol_to_def, expanded_vars,
            )
            ir_constraints.extend(constraint_instances)

        logger.info(f"Expanded {len(constraints)} constraint templates -> {len(ir_constraints)} constraints")

        # 6. 构建 IR
        ir = LinearModelIR(
            modelId=model_id,
            sense=obj_sense,
            variables=expanded_vars,
            objective=ir_objective,
            constraints=ir_constraints,
            debug={
                "totalSetInstances": sum(len(v) for v in set_instances.values()),
                "setParameterValues": {
                    pid: len(vals) for pid, vals in param_id_to_values.items()
                },
            },
        )

        logger.info(f"Compilation complete: {len(ir.variables)} vars, {len(ir.constraints)} constraints")
        return ir

    # ------------------------------------------------------------------
    # 变量模板展开
    # ------------------------------------------------------------------

    def _expand_variable_template(
        self,
        var_def: dict,
        set_id_to_instances: Dict[str, List[dict]],
        set_id_to_symbol: Dict[str, str],
    ) -> List[IRVariable]:
        """展开变量模板为实例列表（笛卡尔积）。"""
        vid = var_def["id"]
        symbol = var_def["symbol"]
        domain = var_def.get("domain", "continuous")
        indices = var_def.get("indices", [])
        business_meaning = var_def.get("businessMeaning", "")
        value_meaning = var_def.get("valueMeaning", {})

        if not indices:
            # 无索引变量，单个实例
            return [IRVariable(
                id=symbol,
                templateId=vid,
                symbol=symbol,
                indices={},
                domain=domain,
                lowerBound=var_def.get("lowerBound", 0.0),
                upperBound=var_def.get("upperBound", 1.0),
                businessLabel=business_meaning,
            )]

        # 获取每个索引集合的实例
        index_instance_lists = []
        index_set_ids = []
        for set_id in indices:
            instances = set_id_to_instances.get(set_id, [])
            index_instance_lists.append(instances)
            index_set_ids.append(set_id)

        # 笛卡尔积展开
        result = []
        for combo in itertools.product(*index_instance_lists):
            # combo = (inst1, inst2, ...)
            var_id_parts = [symbol]
            index_map = {}
            label_parts = []
            for set_id, inst in zip(index_set_ids, combo):
                var_id_parts.append(f"{set_id}_{inst['id']}")
                index_map[set_id] = inst["id"]
                label_parts.append(inst["displayName"])

            var_id = "__".join(var_id_parts)
            business_label = f"{business_meaning}({', '.join(label_parts)})"

            # 根据 valueMeaning 设置边界
            lb = var_def.get("lowerBound")
            ub = var_def.get("upperBound")
            if domain == "binary":
                lb = lb if lb is not None else 0.0
                ub = ub if ub is not None else 1.0

            result.append(IRVariable(
                id=var_id,
                templateId=vid,
                symbol=symbol,
                indices=index_map,
                domain=domain,
                lowerBound=lb if lb is not None else 0.0,
                upperBound=ub if ub is not None else (1.0 if domain == "binary" else float("inf")),
                businessLabel=business_label,
            ))

        return result

    # ------------------------------------------------------------------
    # 表达式展开
    # ------------------------------------------------------------------

    def _expand_expression(
        self,
        expr_text: str,
        set_id_to_instances: Dict[str, List[dict]],
        set_id_to_symbol: Dict[str, str],
        set_symbol_to_id: Dict[str, str],
        param_symbol_to_values: Dict[str, Dict[str, float]],
        param_symbol_to_def: Dict[str, dict],
        var_symbol_to_def: Dict[str, dict],
        expanded_vars: List[IRVariable],
    ) -> Tuple[Dict[str, float], float]:
        """展开表达式为系数字典。

        Returns:
            (coefficients, constant)
        """
        # 解析 sum 结构
        sum_bindings, body = _parse_sum_expression(expr_text)

        # 解析 body 项
        raw_terms = _parse_body_terms(body)
        classified = _classify_terms(raw_terms, param_symbol_to_def, var_symbol_to_def)

        # 确定需要遍历的索引集合
        if sum_bindings:
            # sum_bindings: [(alias, set_symbol_or_id), ...]
            # 将 symbol 解析为 set_id
            resolved_bindings = []
            for alias, sym_or_id in sum_bindings:
                set_id = set_symbol_to_id.get(sym_or_id, sym_or_id)
                resolved_bindings.append((alias, set_id))
            iteration_sets = [(alias, set_id) for alias, set_id in resolved_bindings]
        else:
            iteration_sets = []

        # 构建 var_id 查找索引: (symbol, index_values_tuple) -> var_id
        var_lookup: Dict[Tuple[str, ...], str] = {}
        for v in expanded_vars:
            key = (v.symbol,) + tuple(
                v.indices.get(sid, "") for sid in sorted(v.indices.keys())
            )
            var_lookup[key] = v.id

        # 更精确的查找: symbol -> {index_set_values -> var_id}
        var_index: Dict[str, List[IRVariable]] = {}
        for v in expanded_vars:
            var_index.setdefault(v.symbol, []).append(v)

        coefficients: Dict[str, float] = {}
        constant = 0.0

        if not iteration_sets:
            # 无 sum，直接计算
            for coeff, params, variables in classified:
                if not variables and not params:
                    constant += coeff
                    continue

                # 计算参数值乘积
                param_product = coeff
                for psym, pindices in params.items():
                    pvals = param_symbol_to_values.get(psym, {})
                    # 无索引参数
                    if not pindices:
                        for k, v in pvals.items():
                            param_product *= v
                            break
                    # 有索引但无 sum — 这种情况下不应该出现
                    # 暂时跳过

                # 变量引用
                if not variables:
                    constant += param_product
                    continue

                for var_sym, vindices in variables.items():
                    # 找到匹配的展开变量
                    for ev in var_index.get(var_sym, []):
                        var_key = f"{var_sym}"
                        if vindices:
                            # 需要更多上下文来确定是哪个实例
                            pass
                        coefficients[ev.id] = coefficients.get(ev.id, 0) + param_product

            return coefficients, constant

        # 有 sum — 遍历所有组合
        # 构建迭代空间: alias -> [(instance_id, displayName)]
        iter_space = {}
        for alias, set_id in iteration_sets:
            instances = set_id_to_instances.get(set_id, [])
            iter_space[alias] = instances

        # 生成 alias -> instance 的所有组合
        alias_names = [a for a, _ in iteration_sets]
        alias_set_ids = [sid for _, sid in iteration_sets]

        for combo in itertools.product(*[iter_space[a] for a in alias_names]):
            # combo[i] 对应 alias_names[i] 的实例
            alias_to_instance = {}
            alias_to_set_id = {}
            for i, alias in enumerate(alias_names):
                alias_to_instance[alias] = combo[i]
                alias_to_set_id[alias] = alias_set_ids[i]

            # 对每一项计算系数
            for coeff, params, variables in classified:
                term_coeff = coeff

                # 计算参数值
                for psym, pindices in params.items():
                    pvals = param_symbol_to_values.get(psym, {})
                    if not pindices:
                        # 无索引参数
                        for k, v in pvals.items():
                            term_coeff *= v
                            break
                    else:
                        # 有索引参数，用 alias_to_instance 解析
                        key_parts = []
                        for pidx in pindices:
                            inst = alias_to_instance.get(pidx)
                            if inst:
                                key_parts.append(inst["id"])
                            else:
                                key_parts.append(pidx)
                        param_key = "|".join(key_parts)
                        val = pvals.get(param_key, 0.0)
                        term_coeff *= val

                # 找到对应的展开变量
                for var_sym, vindices in variables.items():
                    # 构建查找条件
                    matching_vars = self._find_matching_var(
                        var_sym, vindices, alias_to_instance, alias_to_set_id,
                        var_index,
                    )
                    for mv in matching_vars:
                        coefficients[mv.id] = coefficients.get(mv.id, 0) + term_coeff

        return coefficients, constant

    def _find_matching_var(
        self,
        var_sym: str,
        vindices: List[str],
        alias_to_instance: Dict[str, dict],
        alias_to_set_id: Dict[str, str],
        var_index: Dict[str, List[IRVariable]],
    ) -> List[IRVariable]:
        """根据索引别名找到匹配的展开变量。"""
        candidates = var_index.get(var_sym, [])
        if not candidates:
            return []

        if not vindices:
            return candidates

        result = []
        for ev in candidates:
            match = True
            for vidx_alias in vindices:
                # vidx_alias 是表达式中的别名，如 "i", "j"
                inst = alias_to_instance.get(vidx_alias)
                if inst:
                    set_id = alias_to_set_id.get(vidx_alias)
                    if set_id and ev.indices.get(set_id) != inst["id"]:
                        match = False
                        break
                else:
                    # 别名不在当前 sum 绑定中，可能是外层 forEach 绑定
                    # 暂时跳过
                    pass
            if match:
                result.append(ev)

        return result

    # ------------------------------------------------------------------
    # 约束模板展开
    # ------------------------------------------------------------------

    def _expand_constraint_template(
        self,
        constraint_def: dict,
        set_id_to_instances: Dict[str, List[dict]],
        set_id_to_symbol: Dict[str, str],
        set_symbol_to_id: Dict[str, str],
        param_symbol_to_values: Dict[str, Dict[str, float]],
        param_symbol_to_def: Dict[str, dict],
        var_symbol_to_def: Dict[str, dict],
        expanded_vars: List[IRVariable],
    ) -> List[IRConstraint]:
        """展开约束模板为约束实例列表。"""
        cid = constraint_def["id"]
        name = constraint_def.get("name", "")
        operator = constraint_def.get("operator", "<=")
        expr_text = constraint_def.get("expressionText", "")
        rhs_value = constraint_def.get("rhsValue", 0.0)
        business_meaning = constraint_def.get("businessMeaning", "")
        forEach = constraint_def.get("forEach", [])

        if not forEach:
            # 无 forEach，直接展开表达式
            coeffs, constant = self._expand_expression(
                expr_text, set_id_to_instances, set_id_to_symbol, set_symbol_to_id,
                param_symbol_to_values, param_symbol_to_def,
                var_symbol_to_def, expanded_vars,
            )
            return [IRConstraint(
                id=cid,
                templateId=cid,
                name=name,
                coefficients=coeffs,
                operator=operator,
                rhs=rhs_value - constant,
                businessLabel=business_meaning,
            )]

        # 有 forEach — 遍历每个组合
        var_index = _build_var_index(expanded_vars)

        # forEach: [{"alias": "j", "setId": "set_task"}, ...]
        iter_space = []
        for fe in forEach:
            alias = fe["alias"]
            set_id = fe["setId"]
            instances = set_id_to_instances.get(set_id, [])
            iter_space.append([(alias, set_id, inst) for inst in instances])

        result = []
        for combo in itertools.product(*iter_space):
            # combo = [(alias, set_id, instance), ...]
            fe_alias_to_instance = {}
            fe_alias_to_set_id = {}
            label_parts = []
            constraint_id_parts = [cid]

            for alias, set_id, inst in combo:
                fe_alias_to_instance[alias] = inst
                fe_alias_to_set_id[alias] = set_id
                label_parts.append(inst["displayName"])
                constraint_id_parts.append(f"{set_id}_{inst['id']}")

            constraint_id = "__".join(constraint_id_parts)
            business_label = f"{business_meaning}({', '.join(label_parts)})"

            # 解析表达式中的 sum 结构
            sum_bindings, body = _parse_sum_expression(expr_text)

            # 将 sum 绑定中的 symbol 解析为 set_id
            resolved_sum_bindings = []
            for s_alias, s_sym_or_id in sum_bindings:
                s_set_id = set_symbol_to_id.get(s_sym_or_id, s_sym_or_id)
                resolved_sum_bindings.append((s_alias, s_set_id))

            # 构建完整的 alias -> instance / set_id 映射
            full_alias_to_instance = dict(fe_alias_to_instance)
            full_alias_to_set_id = dict(fe_alias_to_set_id)

            if resolved_sum_bindings:
                # 有 sum + forEach
                sum_iter_space = {}
                for s_alias, s_set_id in resolved_sum_bindings:
                    sum_iter_space[s_alias] = set_id_to_instances.get(s_set_id, [])

                s_alias_names = [a for a, _ in resolved_sum_bindings]
                s_alias_set_ids = [sid for _, sid in resolved_sum_bindings]

                constraint_coeffs: Dict[str, float] = {}
                constraint_constant = 0.0

                for s_combo in itertools.product(*[sum_iter_space[a] for a in s_alias_names]):
                    for i, alias in enumerate(s_alias_names):
                        full_alias_to_instance[alias] = s_combo[i]
                        full_alias_to_set_id[alias] = s_alias_set_ids[i]

                    raw_terms = _parse_body_terms(body)
                    classified = _classify_terms(
                        raw_terms, param_symbol_to_def, var_symbol_to_def
                    )

                    for coeff, params, variables in classified:
                        term_coeff = coeff
                        for psym, pindices in params.items():
                            pvals = param_symbol_to_values.get(psym, {})
                            if not pindices:
                                for k, v in pvals.items():
                                    term_coeff *= v
                                    break
                            else:
                                key_parts = []
                                for pidx in pindices:
                                    inst = full_alias_to_instance.get(pidx)
                                    if inst:
                                        key_parts.append(inst["id"])
                                    else:
                                        key_parts.append(pidx)
                                param_key = "|".join(key_parts)
                                term_coeff *= pvals.get(param_key, 0.0)

                        for var_sym, vindices in variables.items():
                            matching = self._find_matching_var(
                                var_sym, vindices,
                                full_alias_to_instance, full_alias_to_set_id,
                                var_index,
                            )
                            for mv in matching:
                                constraint_coeffs[mv.id] = (
                                    constraint_coeffs.get(mv.id, 0) + term_coeff
                                )

                result.append(IRConstraint(
                    id=constraint_id,
                    templateId=cid,
                    name=name,
                    coefficients=constraint_coeffs,
                    operator=operator,
                    rhs=rhs_value - constraint_constant,
                    businessLabel=business_label,
                ))
            else:
                # 无 sum，只有 forEach
                raw_terms = _parse_body_terms(expr_text)
                classified = _classify_terms(
                    raw_terms, param_symbol_to_def, var_symbol_to_def
                )

                constraint_coeffs = {}
                constraint_constant = 0.0

                for coeff, params, variables in classified:
                    term_coeff = coeff
                    for psym, pindices in params.items():
                        pvals = param_symbol_to_values.get(psym, {})
                        if not pindices:
                            for k, v in pvals.items():
                                term_coeff *= v
                                break
                        else:
                            key_parts = []
                            for pidx in pindices:
                                inst = full_alias_to_instance.get(pidx)
                                if inst:
                                    key_parts.append(inst["id"])
                                else:
                                    key_parts.append(pidx)
                            param_key = "|".join(key_parts)
                            term_coeff *= pvals.get(param_key, 0.0)

                    if not variables:
                        constraint_constant += term_coeff
                        continue

                    for var_sym, vindices in variables.items():
                        matching = self._find_matching_var(
                            var_sym, vindices,
                            full_alias_to_instance, full_alias_to_set_id,
                            var_index,
                        )
                        for mv in matching:
                            constraint_coeffs[mv.id] = (
                                constraint_coeffs.get(mv.id, 0) + term_coeff
                            )

                result.append(IRConstraint(
                    id=constraint_id,
                    templateId=cid,
                    name=name,
                    coefficients=constraint_coeffs,
                    operator=operator,
                    rhs=rhs_value - constraint_constant,
                    businessLabel=business_label,
                ))

        return result


def _build_var_index(expanded_vars: List[IRVariable]) -> Dict[str, List[IRVariable]]:
    """构建 symbol -> [IRVariable] 索引。"""
    index: Dict[str, List[IRVariable]] = {}
    for v in expanded_vars:
        index.setdefault(v.symbol, []).append(v)
    return index
