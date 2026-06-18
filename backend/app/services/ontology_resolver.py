"""
Ontology Resolver — 本体实例/属性/关系解析服务

从 SQLite 本体实例表中读取：
- 集合实例（按 object_type_id 过滤）
- 对象属性参数值
- 关系属性参数值（从 ontology_relation_instances 表）
"""

import json
import logging
from typing import Dict, List, Any, Optional

from sqlalchemy.orm import Session

from app.database.sqlite_models import OntologyInstance, OntologyRelationInstance

logger = logging.getLogger(__name__)


class OntologyResolver:
    """解析本体绑定，返回集合实例和参数值。"""

    def __init__(self, db: Session, ontology_id: str):
        self.db = db
        self.ontology_id = ontology_id

    # ------------------------------------------------------------------
    # 集合实例
    # ------------------------------------------------------------------

    def resolve_set(self, set_def: dict) -> List[Dict[str, Any]]:
        """根据 SetDefinition 的 ontologyRef 读取实例列表。

        Args:
            set_def: SetDefinition 的 dict 形式（含 ontologyRef.objectTypeId）

        Returns:
            [{"id": "inst-xxx", "displayName": "张三", "properties": {...}}, ...]
        """
        ontology_ref = set_def.get("ontologyRef", {})
        object_type_id = ontology_ref.get("objectTypeId")
        if not object_type_id:
            logger.warning(f"Set {set_def.get('id')} has no objectTypeId in ontologyRef")
            return []

        instances = (
            self.db.query(OntologyInstance)
            .filter(
                OntologyInstance.ontology_id == self.ontology_id,
                OntologyInstance.object_type_id == object_type_id,
            )
            .all()
        )

        results = []
        for inst in instances:
            props = json.loads(inst.properties) if inst.properties else {}
            display_name = (
                props.get("displayName")
                or props.get("name")
                or props.get("名称")
                or inst.id
            )
            results.append({
                "id": inst.id,
                "displayName": display_name,
                "properties": props,
            })

        logger.info(
            f"Resolved set '{set_def.get('id')}' -> {len(results)} instances "
            f"(objectTypeId={object_type_id})"
        )
        return results

    # ------------------------------------------------------------------
    # 对象属性参数
    # ------------------------------------------------------------------

    def resolve_object_property_parameter(
        self, param_def: dict, set_instances: Dict[str, List[Dict[str, Any]]]
    ) -> Dict[str, float]:
        """读取一维对象属性参数值。

        Args:
            param_def: ParameterDefinition dict，ontologyBinding 格式:
                {"type": "object_property", "setId": "set_person", "propertyId": "capacity"}
            set_instances: {set_id: [instance_list]} 已解析的集合实例

        Returns:
            {"inst-xxx": 10.0, ...}  键为实例 ID，值为参数值
        """
        binding = param_def.get("ontologyBinding", {})
        set_id = binding.get("setId")
        property_id = binding.get("propertyId")
        if not set_id or not property_id:
            logger.warning(f"Parameter {param_def.get('id')} has incomplete object_property binding")
            return {}

        instances = set_instances.get(set_id, [])
        values: Dict[str, float] = {}
        for inst in instances:
            val = inst["properties"].get(property_id)
            if val is not None:
                try:
                    values[inst["id"]] = float(val)
                except (ValueError, TypeError):
                    logger.warning(
                        f"Cannot convert property '{property_id}' value '{val}' "
                        f"to float for instance {inst['id']}"
                    )
        return values

    # ------------------------------------------------------------------
    # 关系属性参数
    # ------------------------------------------------------------------

    def resolve_relation_property_parameter(
        self,
        param_def: dict,
        set_instances: Dict[str, List[Dict[str, Any]]],
    ) -> Dict[str, float]:
        """读取二维关系属性参数值。

        Args:
            param_def: ParameterDefinition dict，ontologyBinding 格式:
                {
                    "type": "relation_property",
                    "sourceSetId": "set_person",
                    "relationTypeId": "assigned_to",
                    "targetSetId": "set_task",
                    "propertyId": "duration"
                }
            set_instances: {set_id: [instance_list]}

        Returns:
            {"source_inst_id|target_inst_id": 3.5, ...}
        """
        binding = param_def.get("ontologyBinding", {})
        source_set_id = binding.get("sourceSetId")
        relation_type_id = binding.get("relationTypeId")
        target_set_id = binding.get("targetSetId")
        property_id = binding.get("propertyId")

        if not all([source_set_id, relation_type_id, target_set_id, property_id]):
            logger.warning(
                f"Parameter {param_def.get('id')} has incomplete relation_property binding"
            )
            return {}

        # 获取 source / target 实例 ID 集合
        source_ids = {inst["id"] for inst in set_instances.get(source_set_id, [])}
        target_ids = {inst["id"] for inst in set_instances.get(target_set_id, [])}

        # 查询关系实例
        rel_instances = (
            self.db.query(OntologyRelationInstance)
            .filter(
                OntologyRelationInstance.ontology_id == self.ontology_id,
                OntologyRelationInstance.relation_type_id == relation_type_id,
            )
            .all()
        )

        values: Dict[str, float] = {}
        for ri in rel_instances:
            src = ri.source_instance_id
            tgt = ri.target_instance_id
            if src in source_ids and tgt in target_ids:
                props = json.loads(ri.properties) if ri.properties else {}
                val = props.get(property_id)
                if val is not None:
                    try:
                        key = f"{src}|{tgt}"
                        values[key] = float(val)
                    except (ValueError, TypeError):
                        logger.warning(
                            f"Cannot convert relation property '{property_id}' "
                            f"value '{val}' to float for {src}->{tgt}"
                        )

        logger.info(
            f"Resolved relation parameter '{param_def.get('id')}' -> "
            f"{len(values)} values (relationType={relation_type_id})"
        )
        return values

    # ------------------------------------------------------------------
    # 统一参数解析入口
    # ------------------------------------------------------------------

    def resolve_parameter(
        self,
        param_def: dict,
        set_instances: Dict[str, List[Dict[str, Any]]],
    ) -> Dict[str, float]:
        """根据 ontologyBinding.type 自动分发到对应的解析方法。"""
        binding = param_def.get("ontologyBinding", {})
        binding_type = binding.get("type")

        if binding_type == "object_property":
            return self.resolve_object_property_parameter(param_def, set_instances)
        elif binding_type == "relation_property":
            return self.resolve_relation_property_parameter(param_def, set_instances)
        else:
            logger.warning(
                f"Unknown binding type '{binding_type}' for parameter {param_def.get('id')}"
            )
            return {}

    # ------------------------------------------------------------------
    # 批量解析所有集合和参数
    # ------------------------------------------------------------------

    def resolve_all(
        self, dsl_model: dict
    ) -> tuple:
        """批量解析 DSL 模型中的所有集合和参数。

        Args:
            dsl_model: OptimizationDslModel dict

        Returns:
            (set_instances, parameter_values)
            - set_instances: {set_id: [instance_list]}
            - parameter_values: {param_id: {key: value}}
        """
        sets = dsl_model.get("sets", [])
        parameters = dsl_model.get("parameters", [])

        # 1. 解析所有集合
        set_instances: Dict[str, List[Dict[str, Any]]] = {}
        for s in sets:
            set_instances[s["id"]] = self.resolve_set(s)

        # 2. 解析所有参数
        parameter_values: Dict[str, Dict[str, float]] = {}
        for p in parameters:
            parameter_values[p["id"]] = self.resolve_parameter(p, set_instances)

        return set_instances, parameter_values
