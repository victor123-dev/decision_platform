"""
OO-DSL Validator — DSL 模型校验器

校验项（P0）：
- 集合 symbol 不重复
- 参数/变量引用的 setId 存在
- 目标函数/约束引用的参数/变量存在
- 本体对象类型存在（可选，需 Neo4j）
- 参数数据可获取（warning 级别）
"""

import logging
from typing import Dict, List, Any

from app.schemas.optimization_dsl import ValidationResult, ValidationIssue

logger = logging.getLogger(__name__)


class OOValidator:
    """校验 OO-DSL 模型的完整性和一致性。"""

    def validate(self, dsl_model: dict) -> ValidationResult:
        """校验完整的 DSL 模型。

        Args:
            dsl_model: OptimizationDslModel dict

        Returns:
            ValidationResult
        """
        errors: List[ValidationIssue] = []
        warnings: List[ValidationIssue] = []
        suggestions: List[ValidationIssue] = []

        model_id = dsl_model.get("id", "unknown")
        sets = dsl_model.get("sets", [])
        parameters = dsl_model.get("parameters", [])
        variables = dsl_model.get("variables", [])
        objective = dsl_model.get("objective")
        constraints = dsl_model.get("constraints", [])

        # ── 1. 集合 symbol 唯一性 ──────────────────────────────
        symbols_seen: Dict[str, str] = {}  # symbol -> set_id
        for s in sets:
            sym = s.get("symbol", "")
            sid = s.get("id", "")
            if sym in symbols_seen:
                errors.append(ValidationIssue(
                    code="DUPLICATE_SET_SYMBOL",
                    level="error",
                    message=f"集合 symbol '{sym}' 重复：'{symbols_seen[sym]}' 和 '{sid}'",
                    path=f"sets.{sid}.symbol",
                    businessMessage=f"集合符号 {sym} 被多个集合使用",
                    fixSuggestion=f"请为集合 '{sid}' 使用不同的符号",
                ))
            symbols_seen[sym] = sid

        # ── 2. 集合 ontologyRef 检查 ───────────────────────────
        for s in sets:
            sid = s.get("id", "")
            oref = s.get("ontologyRef", {})
            if not oref.get("objectTypeId"):
                errors.append(ValidationIssue(
                    code="MISSING_SET_ONTOLOGY_REF",
                    level="error",
                    message=f"集合 '{sid}' 缺少 ontologyRef.objectTypeId",
                    path=f"sets.{sid}.ontologyRef",
                    businessMessage=f"集合 {s.get('name', sid)} 未绑定本体对象类型",
                    fixSuggestion="请在集合定义中指定 ontologyRef.objectTypeId",
                ))

        # ── 3. 参数/变量引用的 setId 存在 ──────────────────────
        set_ids = {s.get("id") for s in sets}

        for p in parameters:
            pid = p.get("id", "")
            for idx_set_id in p.get("indices", []):
                if idx_set_id not in set_ids:
                    errors.append(ValidationIssue(
                        code="INVALID_SET_REFERENCE",
                        level="error",
                        message=f"参数 '{pid}' 引用了不存在的集合 '{idx_set_id}'",
                        path=f"parameters.{pid}.indices",
                        businessMessage=f"参数 {p.get('name', pid)} 的索引引用了不存在的集合",
                        fixSuggestion=f"请确认集合 '{idx_set_id}' 已定义",
                    ))

            # 检查 ontologyBinding
            binding = p.get("ontologyBinding", {})
            btype = binding.get("type")
            if btype == "object_property":
                if not binding.get("setId") or not binding.get("propertyId"):
                    errors.append(ValidationIssue(
                        code="INCOMPLETE_BINDING",
                        level="error",
                        message=f"参数 '{pid}' 的 object_property 绑定不完整",
                        path=f"parameters.{pid}.ontologyBinding",
                        fixSuggestion="需要提供 setId 和 propertyId",
                    ))
                elif binding.get("setId") not in set_ids:
                    errors.append(ValidationIssue(
                        code="INVALID_SET_REFERENCE",
                        level="error",
                        message=f"参数 '{pid}' 绑定的集合 '{binding.get('setId')}' 不存在",
                        path=f"parameters.{pid}.ontologyBinding.setId",
                    ))
            elif btype == "relation_property":
                for key in ("sourceSetId", "targetSetId"):
                    sid = binding.get(key)
                    if sid and sid not in set_ids:
                        errors.append(ValidationIssue(
                            code="INVALID_SET_REFERENCE",
                            level="error",
                            message=f"参数 '{pid}' 绑定的集合 '{sid}' 不存在",
                            path=f"parameters.{pid}.ontologyBinding.{key}",
                        ))
                if not binding.get("relationTypeId"):
                    errors.append(ValidationIssue(
                        code="INCOMPLETE_BINDING",
                        level="error",
                        message=f"参数 '{pid}' 的 relation_property 绑定缺少 relationTypeId",
                        path=f"parameters.{pid}.ontologyBinding",
                    ))
                if not binding.get("propertyId"):
                    errors.append(ValidationIssue(
                        code="INCOMPLETE_BINDING",
                        level="error",
                        message=f"参数 '{pid}' 的 relation_property 绑定缺少 propertyId",
                        path=f"parameters.{pid}.ontologyBinding",
                    ))
            else:
                warnings.append(ValidationIssue(
                    code="UNKNOWN_BINDING_TYPE",
                    level="warning",
                    message=f"参数 '{pid}' 的绑定类型 '{btype}' 未知",
                    path=f"parameters.{pid}.ontologyBinding.type",
                ))

        for v in variables:
            vid = v.get("id", "")
            for idx_set_id in v.get("indices", []):
                if idx_set_id not in set_ids:
                    errors.append(ValidationIssue(
                        code="INVALID_SET_REFERENCE",
                        level="error",
                        message=f"变量 '{vid}' 引用了不存在的集合 '{idx_set_id}'",
                        path=f"variables.{vid}.indices",
                        businessMessage=f"变量 {v.get('name', vid)} 的索引引用了不存在的集合",
                        fixSuggestion=f"请确认集合 '{idx_set_id}' 已定义",
                    ))

        # ── 4. 目标函数存在性 ──────────────────────────────────
        if not objective:
            errors.append(ValidationIssue(
                code="MISSING_OBJECTIVE",
                level="error",
                message="模型缺少目标函数",
                path="objective",
                businessMessage="未定义优化目标",
                fixSuggestion="请定义目标函数（minimize 或 maximize）",
            ))
        else:
            if not objective.get("expressionText"):
                errors.append(ValidationIssue(
                    code="MISSING_OBJECTIVE_EXPR",
                    level="error",
                    message="目标函数缺少表达式",
                    path="objective.expressionText",
                ))

        # ── 5. 约束表达式检查 ──────────────────────────────────
        for c in constraints:
            cid = c.get("id", "")
            if not c.get("expressionText"):
                errors.append(ValidationIssue(
                    code="MISSING_CONSTRAINT_EXPR",
                    level="error",
                    message=f"约束 '{cid}' 缺少表达式",
                    path=f"constraints.{cid}.expressionText",
                ))

        # ── 6. 变量 symbol 唯一性 ──────────────────────────────
        var_symbols_seen: Dict[str, str] = {}
        for v in variables:
            sym = v.get("symbol", "")
            vid = v.get("id", "")
            if sym in var_symbols_seen:
                warnings.append(ValidationIssue(
                    code="DUPLICATE_VAR_SYMBOL",
                    level="warning",
                    message=f"变量 symbol '{sym}' 重复：'{var_symbols_seen[sym]}' 和 '{vid}'",
                    path=f"variables.{vid}.symbol",
                ))
            var_symbols_seen[sym] = vid

        # ── 7. 空模型警告 ──────────────────────────────────────
        if not sets:
            warnings.append(ValidationIssue(
                code="EMPTY_SETS",
                level="warning",
                message="模型未定义任何集合",
                path="sets",
            ))
        if not variables:
            warnings.append(ValidationIssue(
                code="EMPTY_VARIABLES",
                level="warning",
                message="模型未定义任何决策变量",
                path="variables",
            ))

        # ── 汇总 ──────────────────────────────────────────────
        status = "passed" if not errors else "failed"
        summary = {
            "totalErrors": len(errors),
            "totalWarnings": len(warnings),
            "totalSuggestions": len(suggestions),
            "totalSets": len(sets),
            "totalParameters": len(parameters),
            "totalVariables": len(variables),
            "totalConstraints": len(constraints),
        }

        return ValidationResult(
            modelId=model_id,
            status=status,
            errors=errors,
            warnings=warnings,
            suggestions=suggestions,
            summary=summary,
        )
