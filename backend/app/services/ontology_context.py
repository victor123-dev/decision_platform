"""
Ontology Context Provider for AI Agent

Provides ontology semantic context to the LLM system prompt,
enabling business-meaningful variable names instead of x1, x2, etc.
"""

import time
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class OntologyContextProvider:
    """Fetches ontology data and formats it as LLM-readable context text."""

    _cache: Optional[str] = None
    _cache_timestamp: float = 0
    _cache_ttl: int = 300  # 5 minutes

    @classmethod
    def get_ontology_context(cls) -> str:
        """Get formatted ontology context for LLM system prompt.

        Returns cached text if available and fresh, otherwise fetches and formats.
        Never raises — returns empty string on failure.
        """
        try:
            # Check cache
            if cls._cache is not None and (time.time() - cls._cache_timestamp < cls._cache_ttl):
                return cls._cache

            # Fetch ontology data
            ontologies = cls._fetch_ontology_data()
            if not ontologies:
                logger.info("No ontology data available for agent context")
                return ""

            # Format for LLM
            context = cls._format_for_llm(ontologies)

            # Update cache
            cls._cache = context
            cls._cache_timestamp = time.time()

            return context

        except Exception as e:
            logger.warning(f"Failed to get ontology context: {e}")
            # Return stale cache if available, otherwise empty string
            return cls._cache or ""

    @classmethod
    def warm_up(cls):
        """Pre-load ontology context cache at startup."""
        logger.info("Warming up ontology context cache...")
        context = cls.get_ontology_context()
        if context:
            logger.info(f"Ontology context warmed up ({len(context)} chars)")
        else:
            logger.warning("Ontology context warm-up returned empty")

    @classmethod
    def _fetch_ontology_data(cls) -> List[Dict[str, Any]]:
        """Fetch ontology list with object types from Neo4j (or fallback)."""
        from app.database.neo4j_client import neo4j_client

        # Step 1: List all ontologies
        list_query = """
            MATCH (o:Ontology)
            RETURN o.id as id, o.name as name, o.description as description,
                   o.status as status, o.creator as creator, o.updatedAt as updated_at
        """
        ontologies = neo4j_client.execute_query(list_query)
        if not ontologies:
            return []

        # Step 2: For each ontology, fetch object types
        result = []
        for ont in ontologies:
            ont_id = ont.get("id")
            if not ont_id:
                continue

            ot_query = """
                MATCH (o:Ontology {id: $ontology_id})-[:HAS_OBJECT_TYPE]->(ot:ObjectType)
                RETURN ot.id as id, ot.name as name, ot.displayName as display_name,
                       ot.description as description, ot.properties as properties
            """
            object_types = neo4j_client.execute_query(ot_query, {"ontology_id": ont_id})

            result.append({
                "id": ont_id,
                "name": ont.get("name", ""),
                "description": ont.get("description", ""),
                "object_types": object_types or [],
            })

        return result

    @classmethod
    def _format_for_llm(cls, ontologies: List[Dict[str, Any]]) -> str:
        """Format ontology data into LLM-readable text for system prompt."""
        sections = []

        for ont in ontologies:
            ont_name = ont.get("name", "未知本体")
            ont_desc = ont.get("description", "")
            object_types = ont.get("object_types", [])

            if not object_types:
                continue

            header = f"## 可用业务本体：{ont_name}"
            if ont_desc:
                header += f"\n{ont_desc}"
            header += "\n以下是业务领域定义的标准对象类型及其属性。构建优化模型时，请使用这些标准业务语义来命名变量和约束，而非使用数学符号（如 x1, x2）。"

            sections.append(header)

            for ot in object_types:
                display_name = ot.get("display_name", ot.get("name", ""))
                name = ot.get("name", "")
                description = ot.get("description", "")
                properties = ot.get("properties", [])

                ot_header = f"### 对象类型：{display_name} ({name})"
                if description:
                    ot_header += f" — {description}"

                lines = [ot_header]
                for prop in properties:
                    prop_name = prop.get("name", "")
                    prop_type = prop.get("type", "string")
                    prop_label = prop.get("label", prop_name)
                    # Format: "- 显示标签 (field_name): type"
                    lines.append(f"- {prop_label} ({prop_name}): {prop_type}")

                sections.append("\n".join(lines))

        # Add naming convention instructions
        naming_rules = """
## 变量与约束命名规范（关键要求）：
1. 决策变量必须使用业务语义命名，格式为"业务对象+业务属性"
   - 正确示例："产品A产量"、"仓库库存水平"、"供应商运输量"、"机台利用率"
   - 错误示例：x1, x2, x3, var_1, var_2
2. 约束条件使用业务规则命名
   - 正确示例："产能上限约束"、"物料供需平衡"、"最低库存要求"
   - 错误示例：constraint_1, c1, c2
3. 目标函数描述使用完整业务语言
   - 正确示例："最大化总利润"、"最小化运输成本"
4. 当本体中定义了相关对象类型时，优先使用本体的 display_name 和属性 label 来命名"""

        sections.append(naming_rules)

        return "\n\n".join(sections)
