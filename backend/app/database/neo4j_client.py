from neo4j import GraphDatabase
from config.settings import settings
import logging
import sqlite3
import json

logger = logging.getLogger(__name__)

def get_db_connection():
    return sqlite3.connect(settings.sqlite_path)

# Mock data for offline mode
MOCK_ONTOLOGIES = [
    {
        "id": "ont-supply-chain-control-tower",
        "name": "供应链控制塔",
        "description": "供应链控制塔本体模型，包含供应商、仓库、订单等核心概念",
        "status": "active",
        "creator": "admin",
        "updated_at": "2026-06-01T10:00:00Z"
    }
]

MOCK_OBJECT_TYPES = {
    "ont-supply-chain-control-tower": [
        {"id": "obj-supplier", "name": "supplier", "display_name": "供应商", "description": "供应链中的供应商实体", "properties": [{"name": "supplier_id", "type": "string", "label": "供应商ID"}, {"name": "name", "type": "string", "label": "供应商名称"}, {"name": "location", "type": "string", "label": "所在地"}, {"name": "risk_level", "type": "string", "label": "风险等级"}]},
        {"id": "obj-warehouse", "name": "warehouse", "display_name": "仓库", "description": "存储设施", "properties": [{"name": "name", "type": "string"}, {"name": "capacity", "type": "number"}, {"name": "location", "type": "string"}]},
        {"id": "obj-order", "name": "order", "display_name": "订单", "description": "采购订单", "properties": [{"name": "order_no", "type": "string"}, {"name": "amount", "type": "number"}, {"name": "status", "type": "string"}]},
        {"id": "obj-product", "name": "product", "display_name": "产品", "description": "库存产品", "properties": [{"name": "product_id", "type": "string", "label": "产品ID"}, {"name": "name", "type": "string", "label": "产品名称"}, {"name": "category", "type": "string", "label": "产品类别"}]},
        {"id": "obj-customer", "name": "customer", "display_name": "客户", "description": "供应链中的客户实体", "properties": [{"name": "customer_id", "type": "string", "label": "客户ID"}, {"name": "name", "type": "string", "label": "客户名称"}, {"name": "type", "type": "string", "label": "客户类型"}]},
        {"id": "obj-material", "name": "material", "display_name": "物料", "description": "生产所需的原材料", "properties": [{"name": "material_id", "type": "string", "label": "物料ID"}, {"name": "name", "type": "string", "label": "物料名称"}, {"name": "category", "type": "string", "label": "物料类别"}]},
        {"id": "obj-work-order", "name": "work_order", "display_name": "工单", "description": "生产工单", "properties": [{"name": "work_order_id", "type": "string", "label": "工单ID"}, {"name": "product_id", "type": "string", "label": "产品ID"}, {"name": "status", "type": "string", "label": "状态"}, {"name": "planned_quantity", "type": "number", "label": "计划数量"}]},
        {"id": "obj-risk", "name": "risk", "display_name": "风险", "description": "供应链风险事件", "properties": [{"name": "risk_id", "type": "string", "label": "风险ID"}, {"name": "title", "type": "string", "label": "风险标题"}, {"name": "risk_level", "type": "string", "label": "风险等级"}, {"name": "status", "type": "string", "label": "处理状态"}, {"name": "impact_scope", "type": "string", "label": "影响范围"}]},
        {"id": "obj-inventory", "name": "inventory", "display_name": "库存", "description": "原材料或成品库存", "properties": [{"name": "inventory_id", "type": "string", "label": "库存ID"}, {"name": "material_id", "type": "string", "label": "物料ID"}, {"name": "location", "type": "string", "label": "仓库位置"}, {"name": "total_quantity", "type": "number", "label": "总数量"}]},
        {"id": "obj-machine", "name": "machine", "display_name": "机台", "description": "生产设备", "properties": [{"name": "machine_id", "type": "string", "label": "机台ID"}, {"name": "status", "type": "string", "label": "状态"}, {"name": "oee", "type": "number", "label": "OEE指标"}]},
        {"id": "obj-task", "name": "task", "display_name": "生产任务", "description": "生产任务", "properties": [{"name": "task_id", "type": "string", "label": "任务ID"}, {"name": "work_order_id", "type": "string", "label": "工单ID"}, {"name": "machine_id", "type": "string", "label": "机台ID"}, {"name": "status", "type": "string", "label": "状态"}]},
        {"id": "obj-logistics", "name": "logistics", "display_name": "物流单", "description": "物流运输单", "properties": [{"name": "logistics_id", "type": "string", "label": "物流单ID"}, {"name": "supplier_id", "type": "string", "label": "供应商ID"}, {"name": "material_id", "type": "string", "label": "物料ID"}, {"name": "status", "type": "string", "label": "状态"}, {"name": "delay_days", "type": "number", "label": "延期天数"}]},
    ]
}

MOCK_ACTION_TYPES = {
    "ont-supply-chain-control-tower": [
        {"id": "act-create-order", "name": "create_order", "display_name": "创建订单", "description": "创建采购订单", "target_model_id": None, "input_schema": {"order_no": "string", "amount": "number"}, "output_schema": {"order_id": "string", "status": "string"}},
        {"id": "act-check-inventory", "name": "check_inventory", "display_name": "库存检查", "description": "检查产品库存", "target_model_id": None, "input_schema": {"product_id": "string"}, "output_schema": {"quantity": "number", "location": "string"}},
        {"id": "act-update-supplier", "name": "update_supplier", "display_name": "更新供应商", "description": "更新供应商信息", "target_model_id": None, "input_schema": {"supplier_id": "string", "rating": "number"}, "output_schema": {"success": "boolean"}},
        {"id": "act-check-risk", "name": "check_risk", "display_name": "风险评估", "description": "评估供应商风险", "target_model_id": None, "input_schema": {"supplier_id": "string"}, "output_schema": {"risk_level": "string", "impact": "string"}},
        {"id": "act-track-logistics", "name": "track_logistics", "display_name": "物流跟踪", "description": "跟踪物流运输状态", "target_model_id": None, "input_schema": {"logistics_id": "string"}, "output_schema": {"status": "string", "location": "string", "estimated_arrival": "string"}},
        {"id": "act-update-inventory", "name": "update_inventory", "display_name": "更新库存", "description": "更新库存数量", "target_model_id": None, "input_schema": {"inventory_id": "string", "quantity": "number"}, "output_schema": {"success": "boolean", "new_quantity": "number"}},
    ]
}

MOCK_LINK_TYPES = {
    "ont-supply-chain-control-tower": [
        {"id": "link-supplies", "name": "supplies", "display_name": "供应", "description": "供应商供应产品", "source": "supplier", "target": "product"},
        {"id": "link-stores", "name": "stores", "display_name": "存储", "description": "仓库存储产品", "source": "warehouse", "target": "product"},
        {"id": "link-contains", "name": "contains", "display_name": "包含", "description": "订单包含产品", "source": "order", "target": "product"},
        {"id": "link-uses", "name": "uses", "display_name": "使用", "description": "工单使用物料", "source": "work_order", "target": "material"},
        {"id": "link-produces", "name": "produces", "display_name": "生产", "description": "工单生产产品", "source": "work_order", "target": "product"},
        {"id": "link-affects", "name": "affects", "display_name": "影响", "description": "风险影响实体", "source": "risk", "target": "material"},
        {"id": "link-has-risk", "name": "has_risk", "display_name": "关联风险", "description": "供应商关联风险", "source": "supplier", "target": "risk"},
        {"id": "link-transports", "name": "transports", "display_name": "运输", "description": "物流运输物料", "source": "logistics", "target": "material"},
        {"id": "link-executes", "name": "executes", "display_name": "执行", "description": "机台执行任务", "source": "machine", "target": "task"},
        {"id": "link-belongs-to", "name": "belongs_to", "display_name": "归属", "description": "物料归属产品", "source": "material", "target": "product"},
    ]
}


class Neo4jClient:
    def __init__(self):
        self.driver = None
        self.offline_mode = False
    
    def connect(self):
        try:
            self.driver = GraphDatabase.driver(
                settings.neo4j_uri,
                auth=(settings.neo4j_user, settings.neo4j_password)
            )
            self.driver.verify_connectivity()
            logger.info("Successfully connected to Neo4j")
            self.offline_mode = False
        except Exception as e:
            logger.warning(f"Neo4j connection failed, switching to offline mode: {e}")
            self.offline_mode = True
    
    def close(self):
        if self.driver:
            self.driver.close()
            logger.info("Neo4j connection closed")
    
    def execute_query(self, query, parameters=None):
        if self.offline_mode:
            return self._execute_mock_query(query, parameters)
        
        if not self.driver:
            self.connect()
            if self.offline_mode:
                return self._execute_mock_query(query, parameters)
        
        with self.driver.session() as session:
            result = session.run(query, parameters or {})
            return [record.data() for record in result]
    
    def execute_write_query(self, query, parameters=None):
        if self.offline_mode:
            raise Exception("Neo4j is offline, write operations are not available")
        
        if not self.driver:
            self.connect()
            if self.offline_mode:
                raise Exception("Neo4j is offline, write operations are not available")
        
        with self.driver.session() as session:
            result = session.run(query, parameters or {})
            return result.consume()
    
    def _execute_mock_query(self, query, parameters):
        query_lower = query.lower()
        
        # List ontologies query
        if "match (o:ontology)" in query_lower and "return o.id" in query_lower:
            return MOCK_ONTOLOGIES
        
        # Subtype queries - must use exact patterns and checked BEFORE detail query
        # because the detail pattern is a substring of these subtype patterns
        if "match (o:ontology {id: $ontology_id})-[:has_object_type]->(ot:objecttype)" in query_lower:
            ontology_id = parameters.get("ontology_id") if parameters else None
            if ontology_id:
                conn = get_db_connection()
                cursor = conn.execute('SELECT * FROM ontology_object_types WHERE ontology_id = ?', (ontology_id,))
                rows = cursor.fetchall()
                conn.close()
                result = []
                for row in rows:
                    result.append({
                        "id": row[0],
                        "ontology_id": row[1],
                        "name": row[2],
                        "display_name": row[3],
                        "description": row[4],
                        "properties": json.loads(row[5]) if row[5] else []
                    })
                return result
            return []
        
        if "match (o:ontology {id: $ontology_id})-[:has_action_type]->(at:actiontype)" in query_lower:
            ontology_id = parameters.get("ontology_id") if parameters else None
            if ontology_id:
                conn = get_db_connection()
                cursor = conn.execute('SELECT * FROM ontology_action_types WHERE ontology_id = ?', (ontology_id,))
                rows = cursor.fetchall()
                conn.close()
                result = []
                for row in rows:
                    result.append({
                        "id": row[0],
                        "ontology_id": row[1],
                        "name": row[2],
                        "display_name": row[3],
                        "description": row[4],
                        "target_model_id": row[5],
                        "input_schema": json.loads(row[6]) if row[6] else {},
                        "output_schema": json.loads(row[7]) if row[7] else {}
                    })
                return result
            return []
        
        if "match (o:ontology {id: $ontology_id})-[:has_link_type]->(lt:linktype)" in query_lower:
            ontology_id = parameters.get("ontology_id") if parameters else None
            if ontology_id:
                conn = get_db_connection()
                cursor = conn.execute('SELECT * FROM ontology_link_types WHERE ontology_id = ?', (ontology_id,))
                rows = cursor.fetchall()
                conn.close()
                result = []
                for row in rows:
                    result.append({
                        "id": row[0],
                        "ontology_id": row[1],
                        "name": row[2],
                        "display_name": row[3],
                        "description": row[4],
                        "source": row[5],
                        "target": row[6]
                    })
                return result
            return []
        
        # Ontology detail query - checked AFTER subtype queries
        if "match (o:ontology {id: $ontology_id})" in query_lower:
            ontology_id = parameters.get("ontology_id") if parameters else None
            if ontology_id:
                # 获取对象类型
                conn = get_db_connection()
                cursor = conn.execute('SELECT * FROM ontology_object_types WHERE ontology_id = ?', (ontology_id,))
                obj_rows = cursor.fetchall()
                object_types = []
                for row in obj_rows:
                    object_types.append({
                        "id": row[0],
                        "name": row[2],
                        "display_name": row[3],
                        "description": row[4],
                        "properties": json.loads(row[5]) if row[5] else []
                    })
                
                # 获取行动类型
                cursor = conn.execute('SELECT * FROM ontology_action_types WHERE ontology_id = ?', (ontology_id,))
                act_rows = cursor.fetchall()
                action_types = []
                for row in act_rows:
                    action_types.append({
                        "id": row[0],
                        "name": row[2],
                        "display_name": row[3],
                        "description": row[4],
                        "target_model_id": row[5],
                        "input_schema": json.loads(row[6]) if row[6] else {},
                        "output_schema": json.loads(row[7]) if row[7] else {}
                    })
                
                # 获取链接类型
                cursor = conn.execute('SELECT * FROM ontology_link_types WHERE ontology_id = ?', (ontology_id,))
                link_rows = cursor.fetchall()
                link_types = []
                for row in link_rows:
                    link_types.append({
                        "id": row[0],
                        "name": row[2],
                        "display_name": row[3],
                        "description": row[4],
                        "source": row[5],
                        "target": row[6]
                    })
                
                conn.close()
                
                ontology = next((o for o in MOCK_ONTOLOGIES if o["id"] == ontology_id), None)
                if ontology:
                    return [{
                        **ontology,
                        "object_types": object_types,
                        "action_types": action_types,
                        "link_types": link_types,
                    }]
            return []
        
        return []

    def health_check(self):
        if self.offline_mode:
            return {"status": "degraded", "message": "Running in offline mode with mock data"}
        try:
            if not self.driver:
                self.connect()
            if self.driver:
                self.driver.verify_connectivity()
                return {"status": "healthy"}
            else:
                return {"status": "degraded", "message": "Driver not initialized"}
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)[:100]}


neo4j_client = Neo4jClient()
