import pandas as pd
import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1/ontology"

def create_ontology():
    """创建供应链控制塔本体"""
    ontology_data = {
        "id": "ont-supply-chain-control-tower",
        "name": "供应链控制塔",
        "description": "供应链控制塔本体模型，用于管理供应链数据和风险",
        "status": "active",
        "creator": "system",
        "updated_at": "2026-06-11T00:00:00"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/", json=ontology_data)
        if response.status_code == 201:
            print("✅ 本体创建成功")
        elif response.status_code == 409:
            print("ℹ️ 本体已存在")
        else:
            print(f"❌ 创建本体失败: {response.text}")
    except Exception as e:
        print(f"❌ 创建本体异常: {e}")

def create_object_types():
    """创建对象类型"""
    object_types = [
        {
            "id": "obj-supplier",
            "name": "supplier",
            "display_name": "供应商",
            "description": "供应链中的供应商实体",
            "properties": [
                {"name": "supplier_id", "type": "string", "label": "供应商ID"},
                {"name": "name", "type": "string", "label": "供应商名称"},
                {"name": "location", "type": "string", "label": "所在地"},
                {"name": "risk_level", "type": "string", "label": "风险等级"}
            ]
        },
        {
            "id": "obj-customer",
            "name": "customer",
            "display_name": "客户",
            "description": "供应链中的客户实体",
            "properties": [
                {"name": "customer_id", "type": "string", "label": "客户ID"},
                {"name": "name", "type": "string", "label": "客户名称"},
                {"name": "type", "label": "客户类型"}
            ]
        },
        {
            "id": "obj-material",
            "name": "material",
            "display_name": "物料",
            "description": "生产所需的原材料",
            "properties": [
                {"name": "material_id", "type": "string", "label": "物料ID"},
                {"name": "name", "type": "string", "label": "物料名称"},
                {"name": "category", "type": "string", "label": "物料类别"}
            ]
        },
        {
            "id": "obj-work-order",
            "name": "work_order",
            "display_name": "工单",
            "description": "生产工单",
            "properties": [
                {"name": "work_order_id", "type": "string", "label": "工单ID"},
                {"name": "product_id", "type": "string", "label": "产品ID"},
                {"name": "status", "type": "string", "label": "状态"},
                {"name": "planned_quantity", "type": "number", "label": "计划数量"}
            ]
        },
        {
            "id": "obj-product",
            "name": "product",
            "display_name": "产品",
            "description": "生产的产品",
            "properties": [
                {"name": "product_id", "type": "string", "label": "产品ID"},
                {"name": "name", "type": "string", "label": "产品名称"},
                {"name": "category", "type": "string", "label": "产品类别"}
            ]
        },
        {
            "id": "obj-risk",
            "name": "risk",
            "display_name": "风险",
            "description": "供应链风险事件",
            "properties": [
                {"name": "risk_id", "type": "string", "label": "风险ID"},
                {"name": "title", "type": "string", "label": "风险标题"},
                {"name": "risk_level", "type": "string", "label": "风险等级"},
                {"name": "status", "type": "string", "label": "处理状态"},
                {"name": "impact_scope", "type": "string", "label": "影响范围"}
            ]
        },
        {
            "id": "obj-inventory",
            "name": "inventory",
            "display_name": "库存",
            "description": "原材料或成品库存",
            "properties": [
                {"name": "inventory_id", "type": "string", "label": "库存ID"},
                {"name": "material_id", "type": "string", "label": "物料ID"},
                {"name": "location", "type": "string", "label": "仓库位置"},
                {"name": "total_quantity", "type": "number", "label": "总数量"}
            ]
        },
        {
            "id": "obj-machine",
            "name": "machine",
            "display_name": "机台",
            "description": "生产设备",
            "properties": [
                {"name": "machine_id", "type": "string", "label": "机台ID"},
                {"name": "status", "type": "string", "label": "状态"},
                {"name": "oee", "type": "number", "label": "OEE指标"}
            ]
        },
        {
            "id": "obj-task",
            "name": "task",
            "display_name": "生产任务",
            "description": "生产任务",
            "properties": [
                {"name": "task_id", "type": "string", "label": "任务ID"},
                {"name": "work_order_id", "type": "string", "label": "工单ID"},
                {"name": "machine_id", "type": "string", "label": "机台ID"},
                {"name": "status", "type": "string", "label": "状态"}
            ]
        },
        {
            "id": "obj-logistics",
            "name": "logistics",
            "display_name": "物流单",
            "description": "物流运输单",
            "properties": [
                {"name": "logistics_id", "type": "string", "label": "物流单ID"},
                {"name": "supplier_id", "type": "string", "label": "供应商ID"},
                {"name": "material_id", "type": "string", "label": "物料ID"},
                {"name": "status", "type": "string", "label": "状态"},
                {"name": "delay_days", "type": "number", "label": "延期天数"}
            ]
        }
    ]
    
    for obj_type in object_types:
        try:
            response = requests.post(
                f"{BASE_URL}/ont-supply-chain-control-tower/object-types",
                json=obj_type
            )
            if response.status_code == 200:
                print(f"✅ 创建对象类型: {obj_type['display_name']}")
            elif response.status_code == 403:
                print(f"⚠️ 对象类型可能已存在: {obj_type['display_name']}")
            else:
                print(f"❌ 创建对象类型失败 {obj_type['display_name']}: {response.text}")
            time.sleep(0.1)
        except Exception as e:
            print(f"❌ 创建对象类型异常 {obj_type['display_name']}: {e}")

def create_link_types():
    """创建链接类型"""
    link_types = [
        {"id": "link-supplies", "name": "supplies", "display_name": "供应", "description": "供应商供应物料", "source": "obj-supplier", "target": "obj-material"},
        {"id": "link-uses", "name": "uses", "display_name": "使用", "description": "工单使用物料", "source": "obj-work-order", "target": "obj-material"},
        {"id": "link-produces", "name": "produces", "display_name": "生产", "description": "工单生产产品", "source": "obj-work-order", "target": "obj-product"},
        {"id": "link-affects", "name": "affects", "display_name": "影响", "description": "风险影响实体", "source": "obj-risk", "target": "obj-material"},
        {"id": "link-has-risk", "name": "has_risk", "display_name": "关联风险", "description": "供应商关联风险", "source": "obj-supplier", "target": "obj-risk"},
        {"id": "link-transports", "name": "transports", "display_name": "运输", "description": "物流运输物料", "source": "obj-logistics", "target": "obj-material"},
        {"id": "link-stores", "name": "stores", "display_name": "存储", "description": "仓库存储物料", "source": "obj-inventory", "target": "obj-material"},
        {"id": "link-executes", "name": "executes", "display_name": "执行", "description": "机台执行任务", "source": "obj-machine", "target": "obj-task"}
    ]
    
    for link_type in link_types:
        try:
            response = requests.post(
                f"{BASE_URL}/ont-supply-chain-control-tower/link-types",
                json=link_type
            )
            if response.status_code == 200:
                print(f"✅ 创建链接类型: {link_type['display_name']}")
            elif response.status_code == 403:
                print(f"⚠️ 链接类型可能已存在: {link_type['display_name']}")
            else:
                print(f"❌ 创建链接类型失败 {link_type['display_name']}: {response.text}")
            time.sleep(0.1)
        except Exception as e:
            print(f"❌ 创建链接类型异常 {link_type['display_name']}: {e}")

def import_instances_from_excel(excel_path):
    """从Excel导入实例数据"""
    xl = pd.ExcelFile(excel_path)
    
    # 定义sheet到对象类型的映射
    sheet_mapping = {
        "供应商": "obj-supplier",
        "原材料库存": "obj-inventory",
        "成品库存": "obj-inventory",
        "外部供应链风险": "obj-risk",
        "物流单": "obj-logistics",
        "生产任务": "obj-task"
    }
    
    for sheet_name, obj_type_id in sheet_mapping.items():
        if sheet_name not in xl.sheet_names:
            print(f"⚠️ 跳过不存在的Sheet: {sheet_name}")
            continue
            
        df = pd.read_excel(excel_path, sheet_name=sheet_name)
        
        # 跳过标题行（第一行是中文标题）
        if len(df) > 0 and df.iloc[0, 0] == df.columns[0]:
            df = df.iloc[1:]
        
        count = 0
        for _, row in df.iterrows():
            properties = {}
            for col in df.columns:
                value = row[col]
                if pd.notna(value):
                    # 转换类型
                    if isinstance(value, (int, float)):
                        if value == int(value):
                            properties[col] = int(value)
                        else:
                            properties[col] = float(value)
                    else:
                        properties[col] = str(value)
            
            if properties:
                try:
                    response = requests.post(
                        f"{BASE_URL}/ont-supply-chain-control-tower/instances",
                        json={
                            "object_type_id": obj_type_id,
                            "properties": properties
                        }
                    )
                    if response.status_code == 200:
                        count += 1
                        if count % 50 == 0:
                            print(f"📥 已导入 {count} 条 {sheet_name} 数据")
                    else:
                        pass  # 静默处理错误
                    time.sleep(0.05)
                except Exception as e:
                    pass  # 静默处理异常
        
        print(f"✅ {sheet_name}: 成功导入 {count} 条数据")

if __name__ == "__main__":
    excel_path = "/Users/shijinxin/Downloads/Athena/数智空间/本体相关/528演示/demo演示材料/本体_执行Action前.xlsx"
    
    print("=" * 60)
    print("开始导入供应链控制塔本体数据")
    print("=" * 60)
    
    print("\n1️⃣ 创建本体...")
    create_ontology()
    
    print("\n2️⃣ 创建对象类型...")
    create_object_types()
    
    print("\n3️⃣ 创建链接类型...")
    create_link_types()
    
    print("\n4️⃣ 导入实例数据...")
    import_instances_from_excel(excel_path)
    
    print("\n" + "=" * 60)
    print("导入完成！")
    print("=" * 60)