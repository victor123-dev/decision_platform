"""
初始化本体数据到 Neo4j

运行方式：
  cd backend
  python -m scripts.init_ontology
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.neo4j_client import neo4j_client

def init_ontology():
    """初始化供应链控制塔本体数据"""
    
    ontology_data = {
        "id": "ont-supply-chain-control-tower",
        "name": "供应链控制塔",
        "description": "供应链全链路语义模型，整合产品、物料、工艺路线、机台设备、供应商、客户、工单、采购订单、排程、库存、质量、物流、风险等全链路业务实体",
        "status": "published",
        "creator": "数据架构师",
        "updatedAt": "2026-06-08 14:30"
    }
    
    object_types = [
        {
            "id": "obj-supplier",
            "name": "Supplier",
            "displayName": "供应商",
            "description": "提供物料或服务的外部供应商",
            "properties": [
                {"name": "supplier_id", "type": "string", "description": "供应商ID"},
                {"name": "name", "type": "string", "description": "供应商名称"},
                {"name": "location", "type": "string", "description": "所在地"},
                {"name": "risk_level", "type": "string", "description": "风险等级"}
            ]
        },
        {
            "id": "obj-customer",
            "name": "Customer",
            "displayName": "客户",
            "description": "购买产品或服务的客户",
            "properties": [
                {"name": "customer_id", "type": "string", "description": "客户ID"},
                {"name": "name", "type": "string", "description": "客户名称"},
                {"name": "type", "type": "string", "description": "客户类型"}
            ]
        },
        {
            "id": "obj-material",
            "name": "Material",
            "displayName": "物料",
            "description": "生产所需的原材料和辅料",
            "properties": [
                {"name": "material_id", "type": "string", "description": "物料ID"},
                {"name": "material_name", "type": "string", "description": "物料名称"},
                {"name": "material_type", "type": "string", "description": "物料类型"},
                {"name": "unit_price", "type": "number", "description": "单价"},
                {"name": "stock_qty", "type": "number", "description": "库存数量"},
                {"name": "supplier_id", "type": "string", "description": "供应商ID"}
            ]
        },
        {
            "id": "obj-product",
            "name": "Product",
            "displayName": "产品",
            "description": "生产的成品或半成品",
            "properties": [
                {"name": "product_id", "type": "string", "description": "产品ID"},
                {"name": "product_name", "type": "string", "description": "产品名称"},
                {"name": "category", "type": "string", "description": "产品类别"}
            ]
        },
        {
            "id": "obj-order",
            "name": "Order",
            "displayName": "订单",
            "description": "客户下达的采购订单",
            "properties": [
                {"name": "order_id", "type": "string", "description": "订单ID"},
                {"name": "order_no", "type": "string", "description": "订单编号"},
                {"name": "amount", "type": "number", "description": "订单金额"},
                {"name": "status", "type": "string", "description": "订单状态"}
            ]
        },
        {
            "id": "obj-work-order",
            "name": "WorkOrder",
            "displayName": "工单",
            "description": "生产工单",
            "properties": [
                {"name": "work_order_id", "type": "string", "description": "工单ID"},
                {"name": "product_id", "type": "string", "description": "产品ID"},
                {"name": "status", "type": "string", "description": "工单状态"},
                {"name": "planned_quantity", "type": "number", "description": "计划数量"}
            ]
        },
        {
            "id": "obj-risk",
            "name": "Risk",
            "displayName": "风险",
            "description": "供应链风险事件",
            "properties": [
                {"name": "risk_id", "type": "string", "description": "风险ID"},
                {"name": "title", "type": "string", "description": "风险标题"},
                {"name": "risk_level", "type": "string", "description": "风险等级"},
                {"name": "status", "type": "string", "description": "状态"},
                {"name": "impact_scope", "type": "string", "description": "影响范围"}
            ]
        },
        {
            "id": "obj-inventory",
            "name": "Inventory",
            "displayName": "库存",
            "description": "库存记录",
            "properties": [
                {"name": "inventory_id", "type": "string", "description": "库存ID"},
                {"name": "material_id", "type": "string", "description": "物料ID"},
                {"name": "location", "type": "string", "description": "库位"},
                {"name": "total_quantity", "type": "number", "description": "总数量"},
                {"name": "reorder_quantity", "type": "number", "description": "再订购数量"},
                {"name": "safety_stock", "type": "number", "description": "安全库存"}
            ]
        },
        {
            "id": "obj-machine",
            "name": "Machine",
            "displayName": "机台",
            "description": "生产设备",
            "properties": [
                {"name": "machine_id", "type": "string", "description": "机台ID"},
                {"name": "status", "type": "string", "description": "状态"},
                {"name": "oee", "type": "number", "description": "设备综合效率"}
            ]
        },
        {
            "id": "obj-task",
            "name": "Task",
            "displayName": "生产任务",
            "description": "生产任务",
            "properties": [
                {"name": "task_id", "type": "string", "description": "任务ID"},
                {"name": "work_order_id", "type": "string", "description": "工单ID"},
                {"name": "machine_id", "type": "string", "description": "机台ID"},
                {"name": "status", "type": "string", "description": "状态"}
            ]
        },
        {
            "id": "obj-logistics",
            "name": "Logistics",
            "displayName": "物流单",
            "description": "物流运输单据",
            "properties": [
                {"name": "logistics_id", "type": "string", "description": "物流单ID"},
                {"name": "supplier_id", "type": "string", "description": "供应商ID"},
                {"name": "material_id", "type": "string", "description": "物料ID"},
                {"name": "status", "type": "string", "description": "状态"},
                {"name": "delay_days", "type": "number", "description": "延迟天数"}
            ]
        },
        {
            "id": "obj-warehouse",
            "name": "Warehouse",
            "displayName": "仓库",
            "description": "仓储设施",
            "properties": [
                {"name": "warehouse_id", "type": "string", "description": "仓库ID"},
                {"name": "name", "type": "string", "description": "仓库名称"},
                {"name": "capacity", "type": "number", "description": "容量"},
                {"name": "location", "type": "string", "description": "位置"}
            ]
        }
    ]
    
    try:
        delete_query = """
            MATCH (o:Ontology {id: $id})
            DETACH DELETE o
        """
        neo4j_client.execute_write_query(delete_query, {"id": ontology_data["id"]})
        print(f"已删除旧的本体: {ontology_data['id']}")
        
        create_ontology_query = """
            CREATE (o:Ontology {
                id: $id,
                name: $name,
                description: $description,
                status: $status,
                creator: $creator,
                updatedAt: $updatedAt
            })
            RETURN o
        """
        neo4j_client.execute_write_query(create_ontology_query, ontology_data)
        print(f"已创建本体: {ontology_data['name']}")
        
        for obj_type in object_types:
            create_obj_query = """
                MATCH (o:Ontology {id: $ontology_id})
                CREATE (ot:ObjectType {
                    id: $obj_id,
                    name: $obj_name,
                    displayName: $display_name,
                    description: $description,
                    properties: $properties
                })
                CREATE (o)-[:HAS_OBJECT_TYPE]->(ot)
                RETURN ot
            """
            params = {
                "ontology_id": ontology_data["id"],
                "obj_id": obj_type["id"],
                "obj_name": obj_type["name"],
                "display_name": obj_type["displayName"],
                "description": obj_type["description"],
                "properties": obj_type["properties"]
            }
            neo4j_client.execute_write_query(create_obj_query, params)
            print(f"  - 已创建对象类型: {obj_type['displayName']} ({obj_type['id']})")
        
        print("\n本体数据初始化完成！")
        return True
        
    except Exception as e:
        print(f"初始化本体数据失败: {e}")
        return False

if __name__ == "__main__":
    init_ontology()
