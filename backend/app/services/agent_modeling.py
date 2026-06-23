"""
智能建模助手 - 结构化建模服务

实现带建模可行性评估的9步建模流程：
前置：建模可行性评估（5要素：系数、决策变量、目标函数、约束条件、取值范围）
1. 识别业务语义（对象/动作/关系/字段）
2. 确认系数（常数/上游参数）
3. 确认决策变量
4. 确认目标函数
5. 确认约束条件
6. 确认取值范围
7. 完善模型
8. 生成建模草案
9. 生成OR-DSL
"""

import json
import logging
import re
from typing import Dict, Any, List, Optional, Set
from datetime import datetime

from app.database.mongodb_client import mongodb_client
from app.services.dsl_converter import model_to_or_dsl

logger = logging.getLogger(__name__)

# 供应链控制塔本体对象类型预定义（用于识别和匹配）
ONTOLOGY_OBJECT_TYPES = [
    {"id": "obj-supplier", "name": "supplier", "displayName": "供应商", "keywords": ["供应商", "供货商", "供应方"]},
    {"id": "obj-warehouse", "name": "warehouse", "displayName": "仓库", "keywords": ["仓库", "仓储", "库房"]},
    {"id": "obj-order", "name": "order", "displayName": "订单", "keywords": ["订单", "订货", "采购单"]},
    {"id": "obj-product", "name": "product", "displayName": "产品", "keywords": ["产品", "货品", "成品"]},
    {"id": "obj-customer", "name": "customer", "displayName": "客户", "keywords": ["客户", "顾客", "需求方"]},
    {"id": "obj-material", "name": "material", "displayName": "物料", "keywords": ["物料", "原材料", "原料", "材料"]},
    {"id": "obj-work-order", "name": "work_order", "displayName": "工单", "keywords": ["工单", "生产工单", "加工单"]},
    {"id": "obj-risk", "name": "risk", "displayName": "风险", "keywords": ["风险", "不确定性"]},
    {"id": "obj-inventory", "name": "inventory", "displayName": "库存", "keywords": ["库存", "存货", "库存量"]},
    {"id": "obj-machine", "name": "machine", "displayName": "机台", "keywords": ["机台", "机器", "设备", "产线"]},
    {"id": "obj-task", "name": "task", "displayName": "生产任务", "keywords": ["生产任务", "任务", "工序"]},
    {"id": "obj-logistics", "name": "logistics", "displayName": "物流单", "keywords": ["物流", "运输", "配送", "物流单"]},
]

# 业务动作关键词映射
ACTION_KEYWORDS = {
    "分配": ["分配", "指派", "安排"],
    "排程": ["排程", "排序", "调度", "安排时间"],
    "补货": ["补货", "订货", "采购"],
    "运输": ["运输", "配送", "送货"],
    "生产": ["生产", "制造", "加工"],
    "最小化": ["最小化", "最小", "降低", "减少", "优化成本"],
    "最大化": ["最大化", "最大", "提高", "增加", "优化利润"],
}

# 本体对象主键属性映射表
OBJECT_PRIMARY_KEYS = {
    "obj-supplier": "supplier_id",
    "obj-customer": "customer_id",
    "obj-material": "material_id",
    "obj-work-order": "work_order_id",
    "obj-product": "product_id",
    "obj-risk": "risk_id",
    "obj-inventory": "inventory_id",
    "obj-machine": "machine_id",
    "obj-task": "task_id",
    "obj-logistics": "logistics_id",
    "obj-warehouse": "name",
    "obj-order": "order_no",
}

# 常见业务字段与属性的映射
FIELD_KEYWORDS = {
    "数量": ["数量", "产量", "批量", "订货量"],
    "时间": ["时间", "完工时间", "开始时间", "延期"],
    "成本": ["成本", "费用", "价格"],
    "产能": ["产能", "能力", "容量"],
    "需求": ["需求", "需求量", "订单量"],
}

# 建模五要素关键词（用于可行性评估兜底）
ELEMENT_KEYWORDS = {
    "coefficients": {
        "keywords": ["成本", "价格", "利润", "单位", "系数", "加工时间", "产能", "容量", "资源", "参数"],
        "question": "模型中的系数（如单位成本、加工时间、产能等）是否已经明确？如果有来自上游节点的参数，请说明参数名称。",
    },
    "variables": {
        "keywords": ["产量", "分配", "分配量", "开工", "开始时间", "完工时间", "订单量", "补货量", "运输量"],
        "question": "需要求解的决策变量是什么？例如各产品的产量、各任务的开始时间等。",
    },
    "objective": {
        "keywords": ["最小化", "最大化", "最小", "最大", "优化", "提高", "降低", "减少"],
        "question": "优化目标是什么？请明确是最大化（利润/效率）还是最小化（成本/时间/风险）。",
    },
    "constraints": {
        "keywords": ["约束", "限制", "不超过", "至少", "满足", "不大于", "不小于", "等于", "资源限制", "产能限制"],
        "question": "有哪些约束条件？例如资源上限、产能限制、需求满足、时间窗等。",
    },
    "bounds": {
        "keywords": ["非负", "大于", "小于", "范围", "0到1", "整数", "连续", "取值", "边界", "上界", "下界"],
        "question": "决策变量的取值范围是什么？例如非负、0-1二进制、整数等。",
    },
}


class StructuredModelingService:
    """结构化建模服务"""

    def __init__(self, llm_client: Optional[Any] = None):
        self.llm_client = llm_client
        self._entity_cache: Dict[str, Any] = {}

    # ═══════════════════════════════════════════════════════════════════════
    # 建模可行性评估
    # ═══════════════════════════════════════════════════════════════════════

    def assess_modeling_feasibility(self, user_input: str, context: Optional[Dict[str, Any]] = None,
                                    ontologies: Optional[List[dict]] = None) -> Dict[str, Any]:
        """
        评估用户输入是否包含完整的5个建模要素：
        系数、决策变量、目标函数、约束条件、取值范围

        评估策略：
        1. 先用规则快速评估文本中是否明确包含各要素
        2. 如果规则判断不完整且存在歧义，再调用 LLM 做二次确认
        3. 如果缺少 variables/constraints/bounds，尝试通过本体-模型映射自动推断
        4. 只有无法自动推断的缺失项，才需要向用户提问

        返回评估结果和需要补充的问题（包含结构化 issues）
        """
        # 第一步：基于规则的快速评估
        preliminary = self._assess_with_rules(user_input, context)

        # 第二步：用本体推断补充缺失的 variables / constraints / bounds（避免直接调用 LLM）
        inferred = self._infer_missing_elements(preliminary, user_input, ontologies)

        # 第三步：自动推断后仍不完整，再用 LLM 做二次确认
        if not inferred.get("complete", False) and self.llm_client:
            try:
                llm_assessment = self._assess_with_llm(user_input, context, ontologies)
                # 仅在 LLM 判定更完整时才提升结论；否则保留推断结果（减少误判）
                if llm_assessment.get("complete", False):
                    inferred = llm_assessment
                else:
                    # 合并 LLM 的 reason，但保留推断的 missing 判定
                    inferred["elements"] = {
                        **llm_assessment.get("elements", {}),
                        **inferred.get("elements", {}),
                    }
            except Exception as e:
                logger.warning(f"LLM feasibility assessment failed: {e}, keeping inferred result")

        # 第四步：生成结构化 issues 用于前端分步引导向导
        inferred["issues"] = self._build_issues(inferred)
        return inferred

    def _infer_missing_elements(self, preliminary: Dict[str, Any], user_input: str,
                                ontologies: Optional[List[dict]]) -> Dict[str, Any]:
        """根据本体映射推断缺失的建模要素（使用规则提取避免在可行性评估中调用 LLM）"""
        elements = preliminary.get("elements", {})
        missing = set(preliminary.get("missing_elements", []))
        auto_inferred = []

        # 用规则提取业务实体并缓存，避免在可行性评估中调用 LLM（Step 1 会单独调用 LLM 做完整提取）
        entities = None
        object_type_ids = []
        matched_vars = []
        matched_cons = []

        if "variables" in missing:
            entities = entities or self._extract_with_rules(user_input)
            object_type_ids = entities.get("objectTypeIds", [])
            matched_vars = self.match_variable_sets(object_type_ids, entities)
            if matched_vars:
                missing.discard("variables")
                elements["variables"] = {
                    "present": True,
                    "reason": f"已从本体-模型映射库推断出 {len(matched_vars)} 个相关决策变量",
                    "inferred": True,
                    "matchedCount": len(matched_vars),
                }
                auto_inferred.append("variables")

        if "constraints" in missing and "variables" not in missing:
            entities = entities or self._extract_with_rules(user_input)
            object_type_ids = object_type_ids or entities.get("objectTypeIds", [])
            matched_vars = matched_vars or self.match_variable_sets(object_type_ids, entities)
            matched_cons = matched_cons or self.match_constraint_sets(matched_vars, object_type_ids)
            if matched_cons:
                missing.discard("constraints")
                elements["constraints"] = {
                    "present": True,
                    "reason": f"已从本体-模型映射库推断出 {len(matched_cons)} 个相关约束",
                    "inferred": True,
                    "matchedCount": len(matched_cons),
                }
                auto_inferred.append("constraints")

        if "bounds" in missing:
            entities = entities or self._extract_with_rules(user_input)
            object_type_ids = object_type_ids or entities.get("objectTypeIds", [])
            matched_vars = matched_vars or self.match_variable_sets(object_type_ids, entities)
            if matched_vars:
                missing.discard("bounds")
                elements["bounds"] = {
                    "present": True,
                    "reason": "已根据变量类型自动推断默认取值范围（如0-1二进制、非负连续等）",
                    "inferred": True,
                }
                auto_inferred.append("bounds")

        complete = len(missing) == 0
        missing_list = list(missing)

        # 重新生成问题（只针对仍缺失的要素）
        questions = []
        if not complete:
            questions = [
                ELEMENT_KEYWORDS.get(k, {}).get("question", f"请补充{k}相关信息。")
                for k in missing_list
            ]

        suggestion = ""
        if auto_inferred and not complete:
            suggestion = f"已自动推断出：{', '.join(auto_inferred)}。请补充其余缺失信息。"
        elif auto_inferred:
            suggestion = f"已自动推断出：{', '.join(auto_inferred)}。"
        elif not complete:
            suggestion = "请补充缺失的建模要素后再次尝试。"

        return {
            "complete": complete,
            "elements": elements,
            "missing_elements": missing_list,
            "questions": questions,
            "suggestion": suggestion,
            "auto_inferred": auto_inferred,
        }

    def _build_issues(self, assessment: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        将缺失的建模要素转换为结构化 issues，供前端 GuidedFeasibilityWizard 使用。
        每个 issue 包含：element, type, title, question, keywords
        """
        issues = []
        element_titles = {
            "coefficients": "系数",
            "variables": "决策变量",
            "objective": "目标函数",
            "constraints": "约束条件",
            "bounds": "取值范围",
        }
        element_keywords = {
            "coefficients": ["成本", "价格", "利润", "单位", "系数", "加工时间", "产能", "需求"],
            "variables": ["产量", "分配", "分配量", "开工", "开始时间", "完工时间", "订单量", "补货量", "运输量"],
            "objective": ["最小化", "最大化", "最小", "最大", "优化", "提高", "降低", "减少"],
            "constraints": ["约束", "限制", "不超过", "至少", "满足", "不大于", "不小于", "等于", "资源限制", "产能限制"],
            "bounds": ["非负", "大于", "小于", "范围", "0到1", "整数", "连续", "取值", "边界", "上界", "下界"],
        }
        for element in assessment.get("missing_elements", []):
            issues.append({
                "element": element,
                "type": "missing",
                "title": element_titles.get(element, element),
                "question": ELEMENT_KEYWORDS.get(element, {}).get(
                    "question", f"请补充{element_titles.get(element, element)}相关信息。"
                ),
                "keywords": element_keywords.get(element, []),
            })
        return issues

    def _assess_with_llm(self, user_input: str, context: Optional[Dict[str, Any]],
                         ontologies: Optional[List[dict]]) -> Dict[str, Any]:
        """使用LLM评估建模可行性"""
        conversation_context = ""
        if context and context.get("history"):
            conversation_context = "\n".join([
                f"{'用户' if h.get('role') == 'user' else '助手'}：{h.get('content', '')}"
                for h in context.get("history", [])[-6:]
            ])

        prompt = f"""你是一位供应链优化建模专家。请评估以下业务描述是否包含建立一个完整优化模型所需的5个核心要素：

5个核心要素：
1. coefficients（系数）：已知的常数或来自上游节点的参数，如单位成本、加工时间、产能、需求量等
2. variables（决策变量）：需要求解的未知量，如产量、分配量、开始时间等
3. objective（目标函数）：优化目标，如最小化成本/时间，最大化利润/效率
4. constraints（约束条件）：限制条件，如资源上限、产能限制、需求满足等
5. bounds（取值范围）：变量的取值范围，如非负、0-1、整数等

请只返回一个JSON对象，不要返回Markdown。JSON格式如下：
{{
  "complete": false,
  "elements": {{
    "coefficients": {{"present": false, "reason": "缺少单位成本/加工时间等系数信息"}},
    "variables": {{"present": false, "reason": "缺少需要求解的未知量"}},
    "objective": {{"present": false, "reason": "缺少优化目标"}},
    "constraints": {{"present": false, "reason": "缺少约束条件"}},
    "bounds": {{"present": false, "reason": "缺少变量取值范围"}}
  }},
  "missing_elements": ["coefficients", "variables"],
  "questions": [
    "请问每个产品的单位成本是多少？或者成本是否来自上游某个参数？",
    "需要求解的决策变量是什么？"
  ],
  "suggestion": "建议补充上述信息后重新评估。"
}}

业务描述：{user_input}
{('之前的对话：' + conversation_context) if conversation_context else ''}"""

        messages = [
            {"role": "system", "content": "你是供应链优化建模专家，只输出JSON。"},
            {"role": "user", "content": prompt}
        ]

        result = self.llm_client.chat(messages, temperature=0.2)
        content = result.get("content", "") if isinstance(result, dict) else result
        assessment = self._extract_json_object(content)

        # 规范化字段
        assessment.setdefault("complete", False)
        assessment.setdefault("missing_elements", [])
        assessment.setdefault("questions", [])
        assessment.setdefault("suggestion", "")

        # 确保 missing_elements 和 questions 一致
        if not assessment["missing_elements"] and not assessment["complete"]:
            # 如果 LLM 返回 complete=false 但没有 missing_elements，重新从 elements 推断
            elements = assessment.get("elements", {})
            missing = []
            for key in ["coefficients", "variables", "objective", "constraints", "bounds"]:
                elem = elements.get(key, {})
                if not elem.get("present", False):
                    missing.append(key)
            assessment["missing_elements"] = missing

        if not assessment["questions"] and assessment["missing_elements"]:
            assessment["questions"] = [
                ELEMENT_KEYWORDS.get(k, {}).get("question", f"请补充{k}相关信息。")
                for k in assessment["missing_elements"]
            ]

        return assessment

    def _assess_with_rules(self, user_input: str, context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """基于规则评估建模可行性（兜底方案）"""
        text = user_input.lower()

        elements = {}
        missing = []

        for key, config in ELEMENT_KEYWORDS.items():
            present = any(kw in text for kw in config["keywords"])
            elements[key] = {
                "present": present,
                "reason": "已识别" if present else config["question"],
            }
            if not present:
                missing.append(key)

        return {
            "complete": len(missing) == 0,
            "elements": elements,
            "missing_elements": missing,
            "questions": [ELEMENT_KEYWORDS[k]["question"] for k in missing],
            "suggestion": "请补充缺失的建模要素后再次尝试。" if missing else "",
        }

    # ═══════════════════════════════════════════════════════════════════════
    # Step 1: 业务语义识别
    # ═══════════════════════════════════════════════════════════════════════

    def extract_business_entities(self, user_input: str, ontologies: Optional[List[dict]] = None) -> Dict[str, Any]:
        """
        识别业务对象、动作、关系、字段
        优先使用LLM，LLM不可用时使用规则匹配兜底
        对同一输入进行本地缓存，减少重复 LLM 调用
        """
        cache_key = f"{hash(user_input.strip())}_{hash(json.dumps(ontologies or [], sort_keys=True, ensure_ascii=False))}"
        cached = self._entity_cache.get(cache_key)
        if cached:
            return cached

        if self.llm_client:
            try:
                result = self._extract_with_llm(user_input, ontologies)
                self._entity_cache[cache_key] = result
                return result
            except Exception as e:
                logger.warning(f"LLM entity extraction failed: {e}, using rule-based fallback")

        result = self._extract_with_rules(user_input)
        self._entity_cache[cache_key] = result
        return result

    def _extract_with_llm(self, user_input: str, ontologies: Optional[List[dict]]) -> Dict[str, Any]:
        """使用LLM识别业务实体"""
        ontology_desc = self._build_ontology_description(ontologies)

        prompt = f"""你是一位供应链优化建模专家。请从用户的业务描述中提取结构化信息。

可用本体对象类型：
{ontology_desc}

请只返回一个JSON对象，不要返回Markdown。JSON格式如下：
{{
  "objects": ["对象类型显示名1", "对象类型显示名2"],
  "actions": ["动作1", "动作2"],
  "relations": ["关系描述1", "关系描述2"],
  "fields": ["字段1", "字段2"],
  "objective_hint": "用户隐含的优化目标描述",
  "business_summary": "业务需求一句话总结",
  "variables_hint": [
    {{
      "name": "变量中文名",
      "symbol": "变量符号（如x_ij）",
      "dimension": "1D或2D或3D或scalar",
      "indices": [
        {{"alias": "i", "businessMeaning": "索引i的业务含义（如工单编号）", "objectTypeId": "对应本体ID（如obj-work-order）", "propertyId": "主键属性（如work_order_id）"}}
      ]
    }}
  ]
}}

说明：variables_hint 用于描述核心决策变量的维度信息。例如"每个工单的开始时间"是1D变量（索引i=工单），"工单分配到机台"是2D变量（索引i=工单，j=机台）。

业务描述：{user_input}"""

        messages = [
            {"role": "system", "content": "你是供应链优化建模专家，只输出JSON。"},
            {"role": "user", "content": prompt}
        ]

        result = self.llm_client.chat(messages, temperature=0.2)
        content = result.get("content", "") if isinstance(result, dict) else result
        entities = self._extract_json_object(content)

        # 规范化字段
        entities.setdefault("objects", [])
        entities.setdefault("actions", [])
        entities.setdefault("relations", [])
        entities.setdefault("fields", [])
        entities.setdefault("objective_hint", "")
        entities.setdefault("business_summary", user_input[:80])
        entities.setdefault("variables_hint", [])

        # 将识别出的文本映射到标准 objectTypeId
        entities["objectTypeIds"] = self._map_objects_to_ids(entities.get("objects", []))

        return entities

    def _extract_with_rules(self, user_input: str) -> Dict[str, Any]:
        """基于规则提取业务实体（兜底方案）"""
        text = user_input.lower()

        objects = []
        object_ids = []
        for ot in ONTOLOGY_OBJECT_TYPES:
            for kw in ot["keywords"]:
                if kw in text:
                    objects.append(ot["displayName"])
                    object_ids.append(ot["id"])
                    break

        actions = []
        for action, kws in ACTION_KEYWORDS.items():
            if any(kw in text for kw in kws):
                actions.append(action)

        fields = []
        for field, kws in FIELD_KEYWORDS.items():
            if any(kw in text for kw in kws):
                fields.append(field)

        # 推断优化目标
        objective_hint = ""
        if any(kw in text for kw in ACTION_KEYWORDS["最小化"]):
            objective_hint = "最小化成本/时间"
        elif any(kw in text for kw in ACTION_KEYWORDS["最大化"]):
            objective_hint = "最大化利润/效率"

        return {
            "objects": list(set(objects)),
            "objectTypeIds": list(set(object_ids)),
            "actions": list(set(actions)),
            "relations": [],
            "fields": list(set(fields)),
            "objective_hint": objective_hint,
            "business_summary": user_input[:80],
        }

    def _build_ontology_description(self, ontologies: Optional[List[dict]]) -> str:
        """构建本体描述文本"""
        if not ontologies:
            return "\n".join([f"- {ot['displayName']} ({ot['id']})" for ot in ONTOLOGY_OBJECT_TYPES])

        lines = []
        for ont in ontologies:
            for ot in ont.get("object_types", []):
                props = ", ".join([p.get("label") or p.get("name", "") for p in ot.get("properties", [])[:5]])
                lines.append(f"- {ot.get('display_name', '')} ({ot.get('id', '')})：{props}")
        return "\n".join(lines) if lines else "\n".join([f"- {ot['displayName']}" for ot in ONTOLOGY_OBJECT_TYPES])

    def _map_objects_to_ids(self, object_names: List[str]) -> List[str]:
        """将对象显示名/文本映射到 objectTypeId"""
        ids = []
        name_lower = [n.lower() for n in object_names]
        for ot in ONTOLOGY_OBJECT_TYPES:
            if ot["displayName"] in object_names or ot["name"] in object_names:
                ids.append(ot["id"])
                continue
            for kw in ot["keywords"]:
                if any(kw in n for n in name_lower):
                    ids.append(ot["id"])
                    break
        return list(set(ids))

    # ═══════════════════════════════════════════════════════════════════════
    # Step 2 & 3: 匹配变量集 / 约束集
    # ═══════════════════════════════════════════════════════════════════════

    def match_variable_sets(self, object_type_ids: List[str], entities: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        根据识别的对象类型，从 MongoDB 匹配相关决策变量
        返回扁平化的变量列表（带来源集合信息）
        """
        if not object_type_ids:
            return []

        col = mongodb_client.get_collection("decision_variable_sets")
        sets = list(col.find({}))

        matched_vars = []
        seen_var_ids = set()

        for vs in sets:
            for v in vs.get("variables", []):
                if v.get("id") in seen_var_ids:
                    continue

                relevance = self._compute_var_relevance(v, object_type_ids, entities)
                if relevance > 0:
                    seen_var_ids.add(v.get("id"))
                    matched_vars.append({
                        **v,
                        "_sourceSetName": vs.get("name", ""),
                        "_sourceScenario": vs.get("scenario", ""),
                        "_relevance": relevance,
                    })

        # 按相关度降序，限制数量
        matched_vars.sort(key=lambda x: x.get("_relevance", 0), reverse=True)
        return matched_vars[:12]

    def _compute_var_relevance(self, variable: Dict[str, Any], object_type_ids: List[str], entities: Dict[str, Any]) -> float:
        """计算变量与业务实体的相关度分数"""
        score = 0.0

        # 从 indexMapping / ontologyRefs / directRef 收集对象ID
        var_obj_ids = set()
        for im in variable.get("indexMapping", []):
            if im.get("objectTypeId"):
                var_obj_ids.add(im["objectTypeId"])
        for ref in variable.get("ontologyRefs", []):
            if ref.get("objectTypeId"):
                var_obj_ids.add(ref["objectTypeId"])
        if variable.get("directRef", {}).get("objectTypeId"):
            var_obj_ids.add(variable["directRef"]["objectTypeId"])

        # 对象匹配
        matched_objs = var_obj_ids & set(object_type_ids)
        score += len(matched_objs) * 2.0

        # 业务动作匹配
        symbol = variable.get("symbol", "")
        name = variable.get("name", "")
        business_meaning = variable.get("businessMeaning", "")
        var_text = f"{symbol} {name} {business_meaning}"

        for action in entities.get("actions", []):
            if action in var_text:
                score += 1.0

        # 字段匹配
        for field in entities.get("fields", []):
            if field in var_text:
                score += 0.5

        return score

    def match_constraint_sets(self, matched_vars: List[Dict[str, Any]], object_type_ids: List[str]) -> List[Dict[str, Any]]:
        """
        根据匹配到的变量和对象，匹配相关约束条件
        """
        if not object_type_ids and not matched_vars:
            return []

        col = mongodb_client.get_collection("constraint_template_sets")
        sets = list(col.find({}))

        # 收集相关变量符号
        var_symbols = {v.get("symbol", "") for v in matched_vars if v.get("symbol")}

        matched_cons = []
        seen_con_ids = set()

        for cs in sets:
            for c in cs.get("constraints", []):
                if c.get("id") in seen_con_ids:
                    continue

                relevance = self._compute_constraint_relevance(c, object_type_ids, var_symbols)
                if relevance > 0:
                    seen_con_ids.add(c.get("id"))
                    matched_cons.append({
                        **c,
                        "_sourceSetName": cs.get("name", ""),
                        "_sourceScenario": cs.get("scenario", ""),
                        "_relevance": relevance,
                    })

        matched_cons.sort(key=lambda x: x.get("_relevance", 0), reverse=True)
        return matched_cons[:10]

    def _compute_constraint_relevance(self, constraint: Dict[str, Any], object_type_ids: List[str], var_symbols: Set[str]) -> float:
        """计算约束与变量的相关度"""
        score = 0.0

        # forEach 中的对象匹配
        for fe in constraint.get("forEach", []):
            if fe.get("objectTypeId") in object_type_ids:
                score += 1.5

        # 相关变量符号匹配
        related_symbols = set(constraint.get("relatedVariableSymbols", []))
        if related_symbols & var_symbols:
            score += 2.0

        # 表达式文本匹配
        expr = f"{constraint.get('name', '')} {constraint.get('expressionText', '')} {constraint.get('description', '')}"
        for sym in var_symbols:
            if sym and sym in expr:
                score += 1.0

        return score

    # ═══════════════════════════════════════════════════════════════════════
    # Step 2-9: 确认系数/变量/目标/约束/范围 + 完善模型 + 生成草案
    # ═══════════════════════════════════════════════════════════════════════

    def identify_coefficients(self, entities: Dict[str, Any], matched_vars: List[Dict[str, Any]],
                              matched_cons: List[Dict[str, Any]], user_input: str) -> Dict[str, Any]:
        """
        Step 2: 确认系数
        从业务描述和匹配结果中识别已知系数（常数）和上游参数
        """
        coefficients = []

        # 从业务描述中识别数字和单位
        # 模式：数字 + 单位/关键词
        patterns = [
            (r"(\d+(?:\.\d+)?)\s*小时", "加工时间/时间", "小时"),
            (r"(\d+(?:\.\d+)?)\s*元", "成本/价格", "元"),
            (r"(\d+(?:\.\d+)?)\s*台", "机台数量", "台"),
            (r"(\d+(?:\.\d+)?)\s*个", "数量", "个"),
            (r"产能\s*[:：]?\s*(\d+(?:\.\d+)?)", "产能", "单位"),
            (r"需求\s*[:：]?\s*(\d+(?:\.\d+)?)", "需求量", "单位"),
            (r"(\d+(?:\.\d+)?)\s*%", "百分比系数", "%"),
        ]

        text = user_input.lower()
        seen = set()
        for pattern, label, unit in patterns:
            for match in re.finditer(pattern, text):
                value = match.group(1)
                key = f"{label}_{value}"
                if key not in seen:
                    seen.add(key)
                    coefficients.append({
                        "name": label,
                        "value": float(value),
                        "unit": unit,
                        "source": "constant",
                        "description": f"从业务描述中识别：{label} = {value} {unit}",
                    })

        # 从变量中识别可能是系数的属性（如 OEE、单位成本等）
        for v in matched_vars:
            for prop in v.get("associatedProperties", []):
                for p in prop.get("properties", []):
                    prop_name = p.get("displayName") or p.get("propertyId", "")
                    if any(kw in prop_name for kw in ["OEE", "成本", "价格", "时间", "产能", "产出率"]):
                        coef_name = f"{prop.get('displayName', '对象')}.{prop_name}"
                        if coef_name not in seen:
                            seen.add(coef_name)
                            coefficients.append({
                                "name": coef_name,
                                "value": None,
                                "unit": "",
                                "source": "upstream_parameter",
                                "description": f"可能来自上游节点参数：{coef_name}",
                            })

        # 兜底：如果没有任何系数，添加一个通用提示
        if not coefficients:
            coefficients.append({
                "name": "待确认系数",
                "value": None,
                "unit": "",
                "source": "unknown",
                "description": "未从描述中识别到具体系数，请在模型编辑时补充。",
            })

        return {
            "coefficients": coefficients,
            "summary": f"识别到 {len(coefficients)} 个系数/参数",
        }

    def confirm_variables(self, matched_vars: List[Dict[str, Any]], user_input: str = "") -> Dict[str, Any]:
        """
        Step 3: 确认决策变量
        将匹配到的变量转换为前端可编辑格式，保留本体引用路径信息，并推断维度和索引
        """
        variables = []
        for idx, v in enumerate(matched_vars):
            ontology_ref = self._build_ontology_ref(v)
            # 维度推断：用变量的 businessMeaning/name/symbol 结合用户原始输入
            var_desc = " ".join(filter(None, [
                v.get("businessMeaning", ""),
                v.get("name", ""),
                v.get("symbol", ""),
            ]))
            dim_info = self._infer_variable_dimension(var_desc, user_input)
            variables.append({
                "id": v.get("id", f"v-{idx + 1}"),
                "name": v.get("name", v.get("symbol", f"变量{idx + 1}")),
                "symbol": v.get("symbol", ""),
                "type": self._map_domain(v.get("domain", "continuous")),
                "lowerBound": v.get("lowerBound", 0),
                "upperBound": v.get("upperBound", None),
                "businessMeaning": v.get("businessMeaning", ""),
                "unit": v.get("unit", ""),
                "ontologyRef": ontology_ref,
                "ontologyPath": self._build_ontology_path(ontology_ref),
                "source": v.get("_sourceScenario", "AI匹配"),
                "dimension": dim_info["dimension"],
                "indices": dim_info["indices"],
            })

        return {
            "variables": variables,
            "summary": f"确认 {len(variables)} 个决策变量",
        }

    def confirm_objective(self, entities: Dict[str, Any], variables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Step 4: 确认目标函数
        """
        objective = self._infer_objective(entities, variables)
        return {
            "objective": objective,
            "summary": f"确认目标方向：{objective.get('sense', 'minimize')}",
        }

    def confirm_constraints(self, matched_cons: List[Dict[str, Any]], variables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Step 5: 确认约束条件
        """
        constraints = []
        for idx, c in enumerate(matched_cons):
            coefficients = self._infer_constraint_coefficients(c, variables)
            constraints.append({
                "id": c.get("id", f"c-{idx + 1}"),
                "name": c.get("name", f"约束{idx + 1}"),
                "description": c.get("description", c.get("businessMeaning", "")),
                "sense": c.get("operator", "<="),
                "rhs": c.get("rhsValue", 0),
                "category": c.get("category", "custom"),
                "hardness": c.get("hardness", "hard"),
                "coefficients": coefficients,
            })

        return {
            "constraints": constraints,
            "summary": f"确认 {len(constraints)} 个约束条件",
        }

    def confirm_bounds(self, variables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Step 6: 确认取值范围
        整理变量的上下界信息
        """
        bounds = []
        for v in variables:
            bounds.append({
                "variableId": v.get("id"),
                "variableName": v.get("name"),
                "type": v.get("type", "continuous"),
                "lowerBound": v.get("lowerBound", 0),
                "upperBound": v.get("upperBound", None),
                "description": self._describe_bound(v),
            })

        return {
            "bounds": bounds,
            "summary": f"确认 {len(bounds)} 个变量的取值范围",
        }

    def _describe_bound(self, variable: Dict[str, Any]) -> str:
        """描述变量取值范围"""
        var_type = variable.get("type", "continuous")
        lower = variable.get("lowerBound", 0)
        upper = variable.get("upperBound")

        if var_type == "binary":
            return "0-1 二进制变量"
        elif var_type == "integer":
            if upper is not None:
                return f"整数，取值范围 [{lower}, {upper}]"
            return f"整数，{lower} ≤ x"
        else:
            if upper is not None:
                return f"连续变量，取值范围 [{lower}, {upper}]"
            return f"连续变量，{lower} ≤ x"

    def refine_model(self, variables: List[Dict[str, Any]], objective: Dict[str, Any],
                     constraints: List[Dict[str, Any]], coefficients: List[Dict[str, Any]],
                     user_input: str, entities: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Step 7: 完善模型
        整合所有要素，补充问题类型等元数据
        """
        problem_type = self._infer_problem_type(variables)

        return {
            "problemType": problem_type,
            "name": f"AI-{datetime.utcnow().strftime('%m%d%H%M')}",
            "description": user_input,
            "objective": objective,
            "variables": variables,
            "constraints": constraints,
            "coefficients": coefficients,
            "_entities": entities or {},
            "_matchedVarCount": len(variables),
            "_matchedConCount": len(constraints),
        }

    def build_model_draft(self, refined_model: Dict[str, Any]) -> Dict[str, Any]:
        """
        Step 8: 生成建模草案
        将完善后的模型转换为可编辑草案（与 refine_model 基本一致，保留历史兼容性）
        """
        draft = {
            **refined_model,
            "_draftGeneratedAt": datetime.utcnow().isoformat(),
        }
        draft["summary"] = self._summarize_draft(draft)
        return draft

    def _summarize_draft(self, draft: Dict[str, Any]) -> str:
        """
        生成模型草案的一句话中文摘要，用于 Agent 输出结果加粗/高亮展示。
        """
        problem_type = draft.get("problemType", "LP")
        objective = draft.get("objective", {})
        sense = "最小化" if objective.get("sense") in ("min", "minimize") else "最大化"
        description = objective.get("description", "目标函数")
        # 避免 description 已包含方向词时重复
        if description.startswith("最小化") or description.startswith("最大化"):
            sense = ""
        var_count = len(draft.get("variables", []))
        con_count = len(draft.get("constraints", []))
        var_names = ", ".join([v.get("name", "") for v in draft.get("variables", [])[:3]])
        if var_count > 3:
            var_names += " 等"
        return f"已生成{problem_type}模型：{sense}{description}，包含 {var_count} 个决策变量（{var_names}）和 {con_count} 个约束条件。"

    # 保留历史兼容方法：从 entities/vars/cons 直接生成草案
    def build_model_draft_legacy(self, entities: Dict[str, Any], matched_vars: List[Dict[str, Any]],
                                 matched_cons: List[Dict[str, Any]], user_input: str) -> Dict[str, Any]:
        """旧版直接生成草案（兼容非流式调用）"""
        variables = self.confirm_variables(matched_vars, user_input)["variables"]
        constraints = self.confirm_constraints(matched_cons, variables)["constraints"]
        objective = self.confirm_objective(entities, variables)["objective"]
        coefficients = self.identify_coefficients(entities, matched_vars, matched_cons, user_input)["coefficients"]
        refined = self.refine_model(variables, objective, constraints, coefficients, user_input, entities)
        return self.build_model_draft(refined)

    # ═══════════════════════════════════════════════════════════════════════
    # Step 9: 生成OR-DSL
    # ═══════════════════════════════════════════════════════════════════════

    def generate_or_dsl_for_draft(self, draft: Dict[str, Any], ontologies: Optional[List[dict]] = None) -> Dict[str, Any]:
        """将模型草案转换为OR-DSL，透传变量的 ontologyRef / ontologyPath"""
        # dsl_converter 期望的输入格式
        model_def = {
            "name": draft.get("name", "optimization_model"),
            "description": draft.get("description", ""),
            "problem_type": draft.get("problemType", "LP"),
            "variables": [
                {
                    "id": v.get("id", f"v-{i}"),
                    "name": v.get("name", ""),
                    "type": v.get("type", "continuous"),
                    "lowerBound": v.get("lowerBound", 0),
                    "upperBound": v.get("upperBound", None),
                    "ontologyRef": v.get("ontologyRef"),
                    "ontologyPath": v.get("ontologyPath"),
                }
                for i, v in enumerate(draft.get("variables", []))
            ],
            "objective": draft.get("objective", {}),
            "constraints": draft.get("constraints", []),
        }
        return model_to_or_dsl(model_def, ontologies)

    # ═══════════════════════════════════════════════════════════════════════
    # 完整流程
    # ═══════════════════════════════════════════════════════════════════════

    def run_modeling_pipeline(self, user_input: str, ontologies: Optional[List[dict]] = None) -> Dict[str, Any]:
        """运行完整建模流程（非流式，用于测试和兜底）"""
        entities = self.extract_business_entities(user_input, ontologies)
        matched_vars = self.match_variable_sets(entities.get("objectTypeIds", []), entities)
        matched_cons = self.match_constraint_sets(matched_vars, entities.get("objectTypeIds", []))
        draft = self.build_model_draft_legacy(entities, matched_vars, matched_cons, user_input)
        or_dsl = self.generate_or_dsl_for_draft(draft, ontologies)
        return {
            "entities": entities,
            "matchedVariables": matched_vars,
            "matchedConstraints": matched_cons,
            "draft": draft,
            "orDsl": or_dsl,
        }

    # ═══════════════════════════════════════════════════════════════════════
    # 工具方法
    # ═══════════════════════════════════════════════════════════════════════

    def _infer_variable_dimension(self, var_text: str, user_input: str = "") -> Dict[str, Any]:
        """
        从变量的业务描述或用户原始输入中推断维度和索引信息。

        返回结构：
        {
            "dimension": "1D" | "2D" | "3D" | "scalar",
            "indices": [
                {
                    "alias": "i",
                    "businessMeaning": "工单编号",
                    "objectTypeId": "obj-work-order",
                    "propertyId": "work_order_id"
                },
                ...
            ]
        }
        """
        combined = f"{var_text} {user_input}".strip()

        # ── 1. 显式索引声明：X[i]、X[i,j]、X[i,j,k] ──
        explicit = re.search(r'[A-Za-z_][\w]*\s*\[([ijk,\s]+)\]', combined)
        if explicit:
            raw_indices = [s.strip() for s in explicit.group(1).split(',') if s.strip()]
            dim = len(raw_indices)
            dimension = f"{dim}D" if dim <= 3 else f"{dim}D"
            indices = [{"alias": a, "businessMeaning": "", "objectTypeId": "", "propertyId": ""}
                       for a in raw_indices[:3]]
            return {"dimension": dimension, "indices": indices}

        # ── 2. 三维：「在XX j上 YY i 是否在 ZZ k 之前」等三对象组合 ──
        three_d_patterns = [
            r'(在.{1,6}[ijk]上.{0,10}[ijk].{0,10}在.{1,6}[ijk])',
            r'(\S+)[到分配运送](\S+)(的\S+)(在|上|经过)(\S+)',
        ]
        obj_matches_3d = []
        for pat in three_d_patterns:
            if re.search(pat, combined):
                # 尝试提取三个对象
                objs = self._match_objects_in_text(combined)
                if len(objs) >= 3:
                    obj_matches_3d = objs[:3]
                    break
        if len(obj_matches_3d) == 3:
            indices = [
                self._build_index_entry(alias, obj)
                for alias, obj in zip(["i", "j", "k"], obj_matches_3d)
            ]
            return {"dimension": "3D", "indices": indices}

        # ── 3. 二维：「XX 到/分配到/运送到 YY 的 ZZ」/ 「XX 和 YY 的」 ──
        two_d_patterns = [
            r'([\u4e00-\u9fa5]{1,6})(到|分配到|运送到|派发到|配送到|指派到)([\u4e00-\u9fa5]{1,6})',
            r'([\u4e00-\u9fa5]{1,6})与([\u4e00-\u9fa5]{1,6})之间',
            r'([\u4e00-\u9fa5]{1,6})在([\u4e00-\u9fa5]{1,6})上的',
        ]
        for pat in two_d_patterns:
            m = re.search(pat, combined)
            if m:
                # 尝试从捕获组1、3（或1、2）提取两个业务对象
                objs = self._match_objects_in_text(combined)
                if len(objs) >= 2:
                    indices = [
                        self._build_index_entry("i", objs[0]),
                        self._build_index_entry("j", objs[1]),
                    ]
                    return {"dimension": "2D", "indices": indices}

        # ── 4. 一维：「每个 XX 的 YY」/ 「各 XX 的 YY」 ──
        one_d_patterns = [
            r'每个?([\u4e00-\u9fa5]{1,8})的',
            r'各([\u4e00-\u9fa5]{1,8})的',
            r'每条([\u4e00-\u9fa5]{1,8})的',
        ]
        for pat in one_d_patterns:
            m = re.search(pat, combined)
            if m:
                candidate = m.group(1)
                obj = self._find_ontology_object_by_text(candidate)
                if obj:
                    indices = [self._build_index_entry("i", obj)]
                    return {"dimension": "1D", "indices": indices}

        # ── 5. 从文本中匹配到至少一个业务对象视为 1D ──
        objs = self._match_objects_in_text(combined)
        if len(objs) >= 2:
            indices = [
                self._build_index_entry("i", objs[0]),
                self._build_index_entry("j", objs[1]),
            ]
            return {"dimension": "2D", "indices": indices}
        if len(objs) == 1:
            indices = [self._build_index_entry("i", objs[0])]
            return {"dimension": "1D", "indices": indices}

        return {"dimension": "scalar", "indices": []}

    def _match_objects_in_text(self, text: str) -> List[Dict[str, Any]]:
        """从文本中按顺序匹配本体对象，返回匹配到的对象信息列表"""
        matched = []
        seen_ids = set()
        for ot in ONTOLOGY_OBJECT_TYPES:
            for kw in ot["keywords"]:
                if kw in text and ot["id"] not in seen_ids:
                    seen_ids.add(ot["id"])
                    matched.append(ot)
                    break
        return matched

    def _find_ontology_object_by_text(self, text: str) -> Optional[Dict[str, Any]]:
        """通过文本片段查找最匹配的本体对象"""
        for ot in ONTOLOGY_OBJECT_TYPES:
            if ot["displayName"] in text:
                return ot
            for kw in ot["keywords"]:
                if kw in text:
                    return ot
        return None

    def _build_index_entry(self, alias: str, obj: Dict[str, Any]) -> Dict[str, Any]:
        """根据本体对象构建索引条目"""
        obj_id = obj.get("id", "")
        property_id = OBJECT_PRIMARY_KEYS.get(obj_id, "id")
        display_name = obj.get("displayName", obj.get("name", ""))
        return {
            "alias": alias,
            "businessMeaning": f"{display_name}编号" if not display_name.endswith(("编号", "号")) else display_name,
            "objectTypeId": obj_id,
            "propertyId": property_id,
        }

    def _build_ontology_ref(self, variable: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """从变量定义中提取本体引用"""
        if variable.get("directRef"):
            return variable["directRef"]
        refs = variable.get("ontologyRefs", [])
        if refs:
            return refs[0]
        return None

    def _build_ontology_path(self, ontology_ref: Optional[Dict[str, Any]]) -> str:
        """根据本体引用构建用于前端展示的 path 字符串"""
        if not ontology_ref:
            return ""
        object_type_id = ontology_ref.get("objectTypeId", "")
        property_id = ontology_ref.get("propertyId", "")
        object_name = next((ot["displayName"] for ot in ONTOLOGY_OBJECT_TYPES if ot["id"] == object_type_id), object_type_id)
        return f"本体模型.{object_name}.{property_id}"

    def _infer_objective(self, entities: Dict[str, Any], variables: List[Dict[str, Any]]) -> Dict[str, Any]:
        """根据业务实体推断目标函数"""
        objective_hint = entities.get("objective_hint", "").lower()

        # 优先判断句首/主导方向：最小化X > 最大化X
        if objective_hint.startswith("最小化") or any(kw in objective_hint for kw in ["最小化", "minimize", "降低", "减少", "缩短"]):
            sense = "minimize"
        elif objective_hint.startswith("最大化") or any(kw in objective_hint for kw in ["最大化", "maximize", "提高", "增加"]):
            sense = "maximize"
        else:
            # 兜底：根据常见业务关键词判断
            if any(kw in objective_hint for kw in ["利润", "效率", "收益", "产出", "利用率"]):
                sense = "maximize"
            else:
                sense = "minimize"

        # 智能选择目标函数变量：优先匹配业务关键词
        coefficients = []
        selected_vars = self._select_objective_variables(objective_hint, variables)
        for v in selected_vars:
            coefficients.append({
                "variable": v.get("name", ""),
                "coefficient": 1,
            })

        return {
            "sense": sense,
            "coefficients": coefficients,
            "description": entities.get("objective_hint", f"{sense} 目标函数"),
        }

    def _infer_constraint_coefficients(self, constraint: Dict[str, Any], variables: List[Dict[str, Any]]) -> Dict[str, float]:
        """根据约束的表达式或相关变量符号推断系数"""
        coefficients = {}

        # 优先使用 relatedVariableSymbols
        related_symbols = constraint.get("relatedVariableSymbols", [])
        expr_text = f"{constraint.get('name', '')} {constraint.get('expressionText', '')}"

        for sym in related_symbols:
            # 找到符号对应的变量名
            matched_var = next((v for v in variables if v.get("symbol") == sym or v.get("name") == sym), None)
            if matched_var:
                coefficients[matched_var.get("name", sym)] = 1.0

        # 如果 relatedVariableSymbols 没有匹配到，尝试从 expressionText 中提取变量符号
        if not coefficients:
            for v in variables:
                sym = v.get("symbol", "")
                name = v.get("name", "")
                if sym and sym in expr_text:
                    coefficients[name] = 1.0

        return coefficients

    def _select_objective_variables(self, objective_hint: str, variables: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """根据目标提示选择最相关的目标函数变量"""
        if not variables:
            return []

        hint = objective_hint.lower()
        priority_keywords = [
            # (关键词列表, 最多选择数量)
            (["完工时间", "makespan", "完成时间", "总时间"], 2),
            (["成本", "费用", "价格"], 2),
            (["延期", "延迟", "拖期"], 2),
            (["库存", "存货"], 2),
            (["运输", "物流", "配送"], 2),
        ]

        for kws, max_count in priority_keywords:
            if any(kw in hint for kw in kws):
                matched = []
                for v in variables:
                    v_name = (v.get("name", "") + v.get("businessMeaning", "") + v.get("symbol", "")).lower()
                    if any(kw in v_name for kw in kws):
                        matched.append(v)
                if matched:
                    return matched[:max_count]

        # 兜底：选择前3个变量
        return variables[:3]

    def _infer_problem_type(self, variables: List[Dict[str, Any]]) -> str:
        """根据变量类型推断问题类型"""
        has_integer = any(v.get("type") in ["integer", "binary"] for v in variables)
        return "MIP" if has_integer else "LP"

    def _map_domain(self, domain: str) -> str:
        """映射变量域到前端类型"""
        mapping = {
            "continuous": "continuous",
            "integer": "integer",
            "binary": "binary",
        }
        return mapping.get(domain, "continuous")

    @staticmethod
    def _extract_json_object(content: str) -> Dict[str, Any]:
        """从文本中提取JSON对象"""
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if not match:
                raise
            return json.loads(match.group(0))


