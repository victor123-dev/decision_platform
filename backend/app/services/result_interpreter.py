"""
ResultInterpreter — 求解结果 → 业务语义解释

将求解器的变量值映射回业务语义，生成可读的业务结果。
"""

import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)


class ResultInterpreter:
    """将求解结果解释为业务语义。"""

    def interpret(
        self,
        solve_result: dict,
        dsl_model: dict,
        set_instances: Dict[str, List[Dict[str, Any]]],
    ) -> dict:
        """解释求解结果。

        Args:
            solve_result: SolverAdapter 输出的求解结果
            dsl_model: OO-DSL 模型 dict
            set_instances: {set_id: [instance_list]} 集合实例

        Returns:
            {
                "businessResults": [...],
                "metrics": {...},
            }
        """
        if solve_result.get("status") != "optimal":
            return {
                "businessResults": [],
                "metrics": {
                    "status": solve_result.get("status"),
                    "message": f"模型求解状态: {solve_result.get('status')}",
                },
            }

        solution = solve_result.get("solution", {})
        variables = dsl_model.get("variables", [])
        parameters = dsl_model.get("parameters", [])
        objective = dsl_model.get("objective")

        # 构建变量模板索引
        var_template_index: Dict[str, dict] = {}
        for v in variables:
            var_template_index[v["id"]] = v

        # 构建集合实例索引
        instance_display_index: Dict[str, Dict[str, str]] = {}
        for set_id, instances in set_instances.items():
            instance_display_index[set_id] = {
                inst["id"]: inst["displayName"] for inst in instances
            }

        # 构建参数值索引
        param_index: Dict[str, dict] = {}
        for p in parameters:
            param_index[p["id"]] = p

        # ── 1. 逐变量解释 ──────────────────────────────────────
        business_results = []
        for var_id, value in solution.items():
            # 从变量 ID 解析出模板和索引
            # var_id 格式: x__set_person_inst-xxx__set_task_inst-yyy
            var_def = self._find_var_def(var_id, variables, solution)
            if not var_def:
                continue

            # 跳过零值（或接近零的值）
            if abs(value) < 1e-6:
                continue

            # 构建业务解释
            meaning = self._interpret_variable(
                var_id, value, var_def, instance_display_index
            )
            business_results.append(meaning)

        # ── 2. 计算业务指标 ──────────────────────────────────────
        metrics = {
            "objectiveValue": solve_result.get("objective_value"),
            "objectiveSense": objective.get("sense", "minimize") if objective else "unknown",
            "objectiveMeaning": objective.get("businessMeaning", "") if objective else "",
            "totalVariables": len(solution),
            "nonZeroVariables": sum(1 for v in solution.values() if abs(v) >= 1e-6),
            "solveTime": solve_result.get("solve_time", 0),
        }

        # 按变量模板分组统计
        template_stats: Dict[str, Dict[str, Any]] = {}
        for var_id, value in solution.items():
            if abs(value) < 1e-6:
                continue
            var_def = self._find_var_def(var_id, variables, solution)
            if var_def:
                tid = var_def["id"]
                if tid not in template_stats:
                    template_stats[tid] = {
                        "templateId": tid,
                        "templateName": var_def.get("name", tid),
                        "businessMeaning": var_def.get("businessMeaning", ""),
                        "count": 0,
                        "totalValue": 0.0,
                    }
                template_stats[tid]["count"] += 1
                template_stats[tid]["totalValue"] += value

        metrics["variableTemplateStats"] = list(template_stats.values())

        return {
            "businessResults": business_results,
            "metrics": metrics,
        }

    def _find_var_def(
        self, var_id: str, variables: List[dict], solution: dict
    ) -> dict:
        """根据展开变量 ID 找到对应的变量模板定义。"""
        # 变量 ID 格式: symbol__set_id_inst_id__set_id_inst_id
        # 从 symbol 前缀匹配
        for v in variables:
            symbol = v.get("symbol", "")
            if var_id.startswith(symbol + "__") or var_id == symbol:
                return v
        # 如果没匹配到，尝试从变量模板 ID 匹配
        for v in variables:
            if var_id.startswith(v.get("id", "")):
                return v
        return None

    def _interpret_variable(
        self,
        var_id: str,
        value: float,
        var_def: dict,
        instance_display_index: Dict[str, Dict[str, str]],
    ) -> Dict[str, Any]:
        """解释单个变量的业务含义。"""
        symbol = var_def.get("symbol", "")
        business_meaning = var_def.get("businessMeaning", "")
        value_meaning = var_def.get("valueMeaning", {})
        indices_def = var_def.get("indices", [])

        # 从 var_id 中提取实例 ID
        # var_id 格式: x__set_person_inst-xxx__set_task_inst-yyy
        parts = var_id.split("__")
        instance_ids = {}
        if len(parts) > 1:
            for part in parts[1:]:
                # part 格式: set_id_inst_id
                # 需要找到对应的 set_id
                for set_id in indices_def:
                    prefix = set_id + "_"
                    if part.startswith(prefix):
                        inst_id = part[len(prefix):]
                        instance_ids[set_id] = inst_id
                        break

        # 构建显示名称
        display_parts = []
        for set_id in indices_def:
            inst_id = instance_ids.get(set_id, "?")
            display_map = instance_display_index.get(set_id, {})
            display_name = display_map.get(inst_id, inst_id)
            display_parts.append(display_name)

        # 值解释
        value_str = str(round(value, 4))
        if value_meaning:
            # 尝试匹配整数值
            int_val = str(int(value)) if value == int(value) else None
            value_explanation = value_meaning.get(int_val, value_meaning.get(value_str, ""))
        else:
            value_explanation = ""

        # 构建业务结果
        result = {
            "variableId": var_id,
            "symbol": symbol,
            "value": value,
            "valueExplanation": value_explanation,
            "businessMeaning": business_meaning,
            "dimensions": display_parts,
            "description": "",
        }

        # 生成自然语言描述
        if display_parts and value_explanation:
            result["description"] = (
                f"{business_meaning}({', '.join(display_parts)}): {value_explanation}"
            )
        elif display_parts:
            result["description"] = (
                f"{business_meaning}({', '.join(display_parts)}) = {value_str}"
            )
        else:
            result["description"] = f"{business_meaning} = {value_str}"

        return result
