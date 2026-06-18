"""
初始化本体-模型映射预置数据

定位：属性与变量名映射的标准字典（非模板）

决策变量集：按业务场景分组（APS/MPS/MRP/库存优化/物流运输/任务调度）
约束条件集：按业务场景分组，变量名与决策变量集完全匹配

变量性质：
  - direct_ref（直引变量）：格式"本体模型.对象.属性"，直接引用单个本体属性
  - association（关联变量）：多维变量X[i,j]，展示关联对象信息和关联关系

运行方式：
  cd backend
  python -m scripts.init_mapping_presets
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.mongodb_client import mongodb_client
from datetime import datetime

ONTOLOGY_ID = "ont-supply-chain-control-tower"
ONTOLOGY_NAME = "供应链控制塔"

# ─────────────────────────────────────────────────────────────────────────────
# 供应链控制塔本体对象类型参考
# ─────────────────────────────────────────────────────────────────────────────
# obj-supplier  供应商   : supplier_id, name, location, risk_level
# obj-customer  客户     : customer_id, name, type
# obj-material  物料     : material_id, name, category
# obj-work-order 工单    : work_order_id, product_id, status, planned_quantity
# obj-product   产品     : product_id, name, category
# obj-risk      风险     : risk_id, title, risk_level, status, impact_scope
# obj-inventory 库存     : inventory_id, material_id, location, total_quantity, reorder_quantity, safety_stock
# obj-machine   机台     : machine_id, status, oee
# obj-task      生产任务 : task_id, work_order_id, machine_id, status
# obj-logistics 物流单   : logistics_id, supplier_id, material_id, status, delay_days
# obj-warehouse 仓库     : name, capacity, location
# obj-order     订单     : order_no, amount, status


# ─────────────────────────────────────────────────────────────────────────────
# 辅助构造器
# ─────────────────────────────────────────────────────────────────────────────

def _ts():
    return datetime.utcnow().isoformat()


def _direct_ref(object_type_id: str, property_id: str, display_name: str) -> dict:
    return {"objectTypeId": object_type_id, "propertyId": property_id, "displayName": display_name}


def _idx(alias: str, object_type_id: str, property_id: str, set_name: str, role: str = "") -> dict:
    return {"alias": alias, "objectTypeId": object_type_id, "propertyId": property_id,
            "setName": set_name, "role": role}


def _ont_ref(object_type_id: str, property_id: str) -> dict:
    return {"objectTypeId": object_type_id, "propertyId": property_id, "ontologyName": ONTOLOGY_NAME}


def _var_index(alias: str, set_name: str, object_type_id: str, display_name: str) -> dict:
    return {"alias": alias, "setName": set_name, "objectTypeId": object_type_id,
            "objectTypeDisplayName": display_name}


def _assoc_prop(object_type_id: str, display_name: str, properties: list) -> dict:
    """关联变量所关联的业务属性
    properties: [{"propertyId": "xxx", "displayName": "XXX显示名"}, ...]
    """
    return {"objectTypeId": object_type_id, "displayName": display_name, "properties": properties}


# ─────────────────────────────────────────────────────────────────────────────
# 预置决策变量集 —— 按业务场景分组（标准字典）
# nature: "direct_ref" = 直引变量 | "association" = 关联变量
# ─────────────────────────────────────────────────────────────────────────────

PRESET_VARIABLE_SETS = [

    # ══════════════════════════════════════════════════════════════════════════
    # 场景1: APS高级计划排程
    # 业务目标：将工单分配到机台，确定加工顺序和时间，最小化makespan和延期
    # ══════════════════════════════════════════════════════════════════════════
    {
        "_id": "dvs-scenario-aps",
        "name": "APS高级计划排程",
        "scenario": "APS",
        "scenarioDisplayName": "APS高级计划排程",
        "description": "将工单分配到机台，确定加工顺序和时间安排，最小化最大完工时间和延期惩罚",
        "ontology_id": ONTOLOGY_ID,
        "variables": [
            {
                "id": "dv-aps-x-assign",
                "symbol": "X_工单分配",
                "name": "工单机台分配",
                "nameEn": "work_order_machine_assignment",
                "nature": "association",
                "dimension": "2D",
                "domain": "binary",
                "indices": [
                    _var_index("i", "工单集合", "obj-work-order", "工单"),
                    _var_index("j", "机台集合", "obj-machine", "机台"),
                ],
                "ontologyRefs": [
                    _ont_ref("obj-work-order", "work_order_id"),
                    _ont_ref("obj-machine", "machine_id"),
                ],
                "indexMapping": [
                    _idx("i", "obj-work-order", "work_order_id", "工单集合", "被分配对象"),
                    _idx("j", "obj-machine", "machine_id", "机台集合", "执行资源"),
                ],
                "lowerBound": 0, "upperBound": 1,
                "businessMeaning": "工单i是否分配给机台j加工",
                "valueMeaning": {"1": "分配", "0": "不分配"},
                "associatedProperties": [
                    _assoc_prop("obj-work-order", "工单", [{"propertyId": "planned_quantity", "displayName": "计划数量"}, {"propertyId": "status", "displayName": "状态"}]),
                    _assoc_prop("obj-machine", "机台", [{"propertyId": "status", "displayName": "状态"}, {"propertyId": "oee", "displayName": "OEE指标"}]),
                ],
            },
            {
                "id": "dv-aps-s-start",
                "symbol": "S_开始时间",
                "name": "工单开始时间",
                "nameEn": "work_order_start_time",
                "nature": "direct_ref",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("i", "工单集合", "obj-work-order", "工单"),
                ],
                "ontologyRefs": [_ont_ref("obj-work-order", "status")],
                "directRef": _direct_ref("obj-work-order", "status", "工单.状态(排程时间)"),
                "indexMapping": [
                    _idx("i", "obj-work-order", "work_order_id", "工单集合", "排程对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "工单i的开始加工时间",
                "unit": "小时",
            },
            {
                "id": "dv-aps-c-completion",
                "symbol": "C_完工时间",
                "name": "工单完工时间",
                "nameEn": "work_order_completion_time",
                "nature": "association",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("i", "工单集合", "obj-work-order", "工单"),
                ],
                "ontologyRefs": [_ont_ref("obj-work-order", "work_order_id")],
                "indexMapping": [
                    _idx("i", "obj-work-order", "work_order_id", "工单集合", "排程对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "工单i的完工时间",
                "unit": "小时",
                "associatedProperties": [
                    _assoc_prop("obj-work-order", "工单", [{"propertyId": "status", "displayName": "状态"}, {"propertyId": "planned_quantity", "displayName": "计划数量"}]),
                ],
            },
            {
                "id": "dv-aps-y-sequence",
                "symbol": "Y_加工顺序",
                "name": "机台工单加工顺序",
                "nameEn": "machine_work_order_sequence",
                "nature": "association",
                "dimension": "3D",
                "domain": "binary",
                "indices": [
                    _var_index("i", "工单集合", "obj-work-order", "工单"),
                    _var_index("k", "工单集合", "obj-work-order", "工单"),
                    _var_index("j", "机台集合", "obj-machine", "机台"),
                ],
                "ontologyRefs": [
                    _ont_ref("obj-work-order", "work_order_id"),
                    _ont_ref("obj-machine", "machine_id"),
                ],
                "indexMapping": [
                    _idx("i", "obj-work-order", "work_order_id", "工单集合", "前序工单"),
                    _idx("k", "obj-work-order", "work_order_id", "工单集合", "后序工单"),
                    _idx("j", "obj-machine", "machine_id", "机台集合", "执行资源"),
                ],
                "lowerBound": 0, "upperBound": 1,
                "businessMeaning": "在机台j上，工单i是否紧接在工单k之前加工",
                "valueMeaning": {"1": "i先于k", "0": "非此顺序"},
                "associatedProperties": [
                    _assoc_prop("obj-work-order", "工单", [{"propertyId": "status", "displayName": "状态"}]),
                    _assoc_prop("obj-machine", "机台", [{"propertyId": "status", "displayName": "状态"}, {"propertyId": "oee", "displayName": "OEE指标"}]),
                ],
            },
            {
                "id": "dv-aps-t-tardy",
                "symbol": "T_延期时间",
                "name": "工单延期时间",
                "nameEn": "work_order_tardiness",
                "nature": "association",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("i", "工单集合", "obj-work-order", "工单"),
                ],
                "ontologyRefs": [_ont_ref("obj-work-order", "work_order_id")],
                "indexMapping": [
                    _idx("i", "obj-work-order", "work_order_id", "工单集合", "排程对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "工单i的延期时间（完工时间超过交期的部分）",
                "unit": "小时",
                "associatedProperties": [
                    _assoc_prop("obj-work-order", "工单", [{"propertyId": "status", "displayName": "状态"}]),
                ],
            },
            {
                "id": "dv-aps-cmax",
                "symbol": "CMAX_最大完工",
                "name": "最大完工时间",
                "nameEn": "makespan",
                "nature": "association",
                "dimension": "0D",
                "domain": "continuous",
                "indices": [],
                "ontologyRefs": [],
                "indexMapping": [],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "所有工单中最大的完工时间（Makespan）",
                "unit": "小时",
            },
        ],
        "created_at": _ts(), "updated_at": _ts(),
    },

    # ══════════════════════════════════════════════════════════════════════════
    # 场景2: MPS主生产计划
    # 业务目标：确定每个产品每个时间周期的生产数量，满足客户订单需求
    # ══════════════════════════════════════════════════════════════════════════
    {
        "_id": "dvs-scenario-mps",
        "name": "MPS主生产计划",
        "scenario": "MPS",
        "scenarioDisplayName": "MPS主生产计划",
        "description": "确定各产品在各计划周期内的生产数量，平衡客户需求与产能约束",
        "ontology_id": ONTOLOGY_ID,
        "variables": [
            {
                "id": "dv-mps-prod-qty",
                "symbol": "PROD_产出数量",
                "name": "产品周期产出量",
                                "nameEn": "product_period_output_quantity",
                "nature": "association",
                "dimension": "2D",
                "domain": "integer",
                "indices": [
                    _var_index("p", "产品集合", "obj-product", "产品"),
                    _var_index("t", "时间周期集合", None, "计划周期"),
                ],
                "ontologyRefs": [_ont_ref("obj-product", "product_id")],
                "indexMapping": [
                    _idx("p", "obj-product", "product_id", "产品集合", "生产品种"),
                    _idx("t", None, None, "时间周期集合", "计划周期"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "产品p在时间周期t内的计划生产数量",
                "unit": "件",
                "associatedProperties": [
                    _assoc_prop("obj-product", "产品", [{"propertyId": "name", "displayName": "名称"}, {"propertyId": "category", "displayName": "类别"}]),
                ],
            },
            {
                "id": "dv-mps-ord-accept",
                "symbol": "ORD_订单接受",
                "name": "客户订单接受",
                                "nameEn": "customer_order_acceptance",
                "nature": "association",
                "dimension": "2D",
                "domain": "binary",
                "indices": [
                    _var_index("c", "客户集合", "obj-customer", "客户"),
                    _var_index("p", "产品集合", "obj-product", "产品"),
                ],
                "ontologyRefs": [
                    _ont_ref("obj-customer", "customer_id"),
                    _ont_ref("obj-product", "product_id"),
                ],
                "indexMapping": [
                    _idx("c", "obj-customer", "customer_id", "客户集合", "需求方"),
                    _idx("p", "obj-product", "product_id", "产品集合", "需求品种"),
                ],
                "lowerBound": 0, "upperBound": 1,
                "businessMeaning": "是否接受客户c对产品p的订单",
                "valueMeaning": {"1": "接受", "0": "拒绝"},
                "associatedProperties": [
                    _assoc_prop("obj-customer", "客户", [{"propertyId": "name", "displayName": "名称"}, {"propertyId": "type", "displayName": "类型"}]),
                    _assoc_prop("obj-product", "产品", [{"propertyId": "name", "displayName": "名称"}]),
                ],
            },
            {
                "id": "dv-mps-alloc",
                "symbol": "ALLOC_产品分配",
                "name": "产品客户分配量",
                                "nameEn": "product_customer_allocation",
                "nature": "association",
                "dimension": "2D",
                "domain": "continuous",
                "indices": [
                    _var_index("p", "产品集合", "obj-product", "产品"),
                    _var_index("c", "客户集合", "obj-customer", "客户"),
                ],
                "ontologyRefs": [
                    _ont_ref("obj-product", "product_id"),
                    _ont_ref("obj-customer", "customer_id"),
                ],
                "indexMapping": [
                    _idx("p", "obj-product", "product_id", "产品集合", "分配品种"),
                    _idx("c", "obj-customer", "customer_id", "客户集合", "接收方"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "产品p分配给客户c的数量",
                "unit": "件",
                "associatedProperties": [
                    _assoc_prop("obj-product", "产品", [{"propertyId": "name", "displayName": "名称"}]),
                    _assoc_prop("obj-customer", "客户", [{"propertyId": "name", "displayName": "名称"}]),
                ],
            },
            {
                "id": "dv-mps-inv-fg",
                "symbol": "INV_成品库存",
                "name": "成品周期库存",
                                "nameEn": "finished_goods_inventory",
                "nature": "association",
                "dimension": "2D",
                "domain": "continuous",
                "indices": [
                    _var_index("p", "产品集合", "obj-product", "产品"),
                    _var_index("t", "时间周期集合", None, "计划周期"),
                ],
                "ontologyRefs": [_ont_ref("obj-product", "product_id")],
                "indexMapping": [
                    _idx("p", "obj-product", "product_id", "产品集合", "库存品种"),
                    _idx("t", None, None, "时间周期集合", "库存周期"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "产品p在周期t末的成品库存水平",
                "unit": "件",
                "associatedProperties": [
                    _assoc_prop("obj-product", "产品", [{"propertyId": "name", "displayName": "名称"}]),
                ],
            },
            {
                "id": "dv-mps-backlog",
                "symbol": "BACKLOG_欠货量",
                "name": "客户欠货量",
                                "nameEn": "customer_backlog_quantity",
                "nature": "association",
                "dimension": "3D",
                "domain": "continuous",
                "indices": [
                    _var_index("c", "客户集合", "obj-customer", "客户"),
                    _var_index("p", "产品集合", "obj-product", "产品"),
                    _var_index("t", "时间周期集合", None, "计划周期"),
                ],
                "ontologyRefs": [
                    _ont_ref("obj-customer", "customer_id"),
                    _ont_ref("obj-product", "product_id"),
                ],
                "indexMapping": [
                    _idx("c", "obj-customer", "customer_id", "客户集合", "欠货客户"),
                    _idx("p", "obj-product", "product_id", "产品集合", "欠货品种"),
                    _idx("t", None, None, "时间周期集合", "欠货周期"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "客户c对产品p在周期t的未满足需求量",
                "unit": "件",
                "associatedProperties": [
                    _assoc_prop("obj-customer", "客户", [{"propertyId": "name", "displayName": "名称"}]),
                    _assoc_prop("obj-product", "产品", [{"propertyId": "name", "displayName": "名称"}]),
                ],
            },
            {
                "id": "dv-mps-pri-customer",
                "symbol": "PRI_客户优先级",
                "name": "客户优先级",
                                "nameEn": "customer_priority",
                "nature": "direct_ref",
                "dimension": "1D",
                "domain": "integer",
                "indices": [
                    _var_index("c", "客户集合", "obj-customer", "客户"),
                ],
                "ontologyRefs": [_ont_ref("obj-customer", "type")],
                "directRef": _direct_ref("obj-customer", "type", "客户.类型(优先级)"),
                "indexMapping": [
                    _idx("c", "obj-customer", "customer_id", "客户集合", "优先级对象"),
                ],
                "lowerBound": 1, "upperBound": 5,
                "businessMeaning": "客户c的服务优先级等级（由客户类型映射）",
            },
        ],
        "created_at": _ts(), "updated_at": _ts(),
    },

    # ══════════════════════════════════════════════════════════════════════════
    # 场景3: MRP物料需求计划
    # 业务目标：根据MPS生产计划，通过BOM展开计算物料需求，确定采购计划
    # ══════════════════════════════════════════════════════════════════════════
    {
        "_id": "dvs-scenario-mrp",
        "name": "MRP物料需求计划",
        "scenario": "MRP",
        "scenarioDisplayName": "MRP物料需求计划",
        "description": "根据主生产计划通过BOM展开计算物料需求，确定供应商选择和采购批量",
        "ontology_id": ONTOLOGY_ID,
        "variables": [
            {
                "id": "dv-mrp-demand",
                "symbol": "MRP_物料需求",
                "name": "物料周期需求量",
                                "nameEn": "material_demand_quantity",
                "nature": "association",
                "dimension": "2D",
                "domain": "continuous",
                "indices": [
                    _var_index("m", "物料集合", "obj-material", "物料"),
                    _var_index("t", "时间周期集合", None, "计划周期"),
                ],
                "ontologyRefs": [_ont_ref("obj-material", "material_id")],
                "indexMapping": [
                    _idx("m", "obj-material", "material_id", "物料集合", "需求物料"),
                    _idx("t", None, None, "时间周期集合", "需求周期"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "物料m在周期t内的总需求量（由BOM展开计算）",
                "unit": "件",
                "associatedProperties": [
                    _assoc_prop("obj-material", "物料", [{"propertyId": "name", "displayName": "名称"}, {"propertyId": "category", "displayName": "类别"}]),
                ],
            },
            {
                "id": "dv-mrp-purchase",
                "symbol": "PURCHASE_采购量",
                "name": "供应商物料采购量",
                                "nameEn": "supplier_material_purchase_quantity",
                "nature": "association",
                "dimension": "3D",
                "domain": "continuous",
                "indices": [
                    _var_index("s", "供应商集合", "obj-supplier", "供应商"),
                    _var_index("m", "物料集合", "obj-material", "物料"),
                    _var_index("t", "时间周期集合", None, "计划周期"),
                ],
                "ontologyRefs": [
                    _ont_ref("obj-supplier", "supplier_id"),
                    _ont_ref("obj-material", "material_id"),
                ],
                "indexMapping": [
                    _idx("s", "obj-supplier", "supplier_id", "供应商集合", "供应来源"),
                    _idx("m", "obj-material", "material_id", "物料集合", "采购品种"),
                    _idx("t", None, None, "时间周期集合", "采购周期"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "从供应商s采购物料m在周期t的数量",
                "unit": "件",
                "associatedProperties": [
                    _assoc_prop("obj-supplier", "供应商", [{"propertyId": "name", "displayName": "名称"}, {"propertyId": "location", "displayName": "所在地"}]),
                    _assoc_prop("obj-material", "物料", [{"propertyId": "name", "displayName": "名称"}]),
                ],
            },
            {
                "id": "dv-mrp-z-supplier",
                "symbol": "Z_供应商选择",
                "name": "供应商物料选择",
                                "nameEn": "supplier_material_selection",
                "nature": "association",
                "dimension": "2D",
                "domain": "binary",
                "indices": [
                    _var_index("s", "供应商集合", "obj-supplier", "供应商"),
                    _var_index("m", "物料集合", "obj-material", "物料"),
                ],
                "ontologyRefs": [
                    _ont_ref("obj-supplier", "supplier_id"),
                    _ont_ref("obj-material", "material_id"),
                ],
                "indexMapping": [
                    _idx("s", "obj-supplier", "supplier_id", "供应商集合", "候选供应商"),
                    _idx("m", "obj-material", "material_id", "物料集合", "供应物料"),
                ],
                "lowerBound": 0, "upperBound": 1,
                "businessMeaning": "是否从供应商s采购物料m",
                "valueMeaning": {"1": "选择", "0": "不选择"},
                "associatedProperties": [
                    _assoc_prop("obj-supplier", "供应商", [{"propertyId": "name", "displayName": "名称"}]),
                    _assoc_prop("obj-material", "物料", [{"propertyId": "name", "displayName": "名称"}]),
                ],
            },
            {
                "id": "dv-mrp-inv-material",
                "symbol": "INV_物料库存",
                "name": "物料周期库存",
                                "nameEn": "material_period_inventory",
                "nature": "association",
                "dimension": "2D",
                "domain": "continuous",
                "indices": [
                    _var_index("m", "物料集合", "obj-material", "物料"),
                    _var_index("t", "时间周期集合", None, "计划周期"),
                ],
                "ontologyRefs": [_ont_ref("obj-material", "material_id")],
                "indexMapping": [
                    _idx("m", "obj-material", "material_id", "物料集合", "库存物料"),
                    _idx("t", None, None, "时间周期集合", "库存周期"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "物料m在周期t末的库存水平",
                "unit": "件",
                "associatedProperties": [
                    _assoc_prop("obj-material", "物料", [{"propertyId": "name", "displayName": "名称"}]),
                ],
            },
            {
                "id": "dv-mrp-bom-consume",
                "symbol": "BOM_物料消耗",
                "name": "BOM物料消耗系数",
                                "nameEn": "bom_material_consumption_coefficient",
                "nature": "association",
                "dimension": "2D",
                "domain": "continuous",
                "indices": [
                    _var_index("p", "产品集合", "obj-product", "产品"),
                    _var_index("m", "物料集合", "obj-material", "物料"),
                ],
                "ontologyRefs": [
                    _ont_ref("obj-product", "product_id"),
                    _ont_ref("obj-material", "material_id"),
                ],
                "indexMapping": [
                    _idx("p", "obj-product", "product_id", "产品集合", "父项产品"),
                    _idx("m", "obj-material", "material_id", "物料集合", "子项物料"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "生产单位产品p所需物料m的数量（BOM展开系数）",
                "unit": "件/件",
                "associatedProperties": [
                    _assoc_prop("obj-product", "产品", [{"propertyId": "name", "displayName": "名称"}]),
                    _assoc_prop("obj-material", "物料", [{"propertyId": "name", "displayName": "名称"}]),
                ],
            },
            {
                "id": "dv-mrp-receipt",
                "symbol": "RECEIPT_到货量",
                "name": "物料到货量",
                                "nameEn": "material_receipt_quantity",
                "nature": "association",
                "dimension": "2D",
                "domain": "continuous",
                "indices": [
                    _var_index("m", "物料集合", "obj-material", "物料"),
                    _var_index("t", "时间周期集合", None, "计划周期"),
                ],
                "ontologyRefs": [_ont_ref("obj-material", "material_id")],
                "indexMapping": [
                    _idx("m", "obj-material", "material_id", "物料集合", "到货物料"),
                    _idx("t", None, None, "时间周期集合", "到货周期"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "物料m在周期t内的到货入库数量",
                "unit": "件",
                "associatedProperties": [
                    _assoc_prop("obj-material", "物料", [{"propertyId": "name", "displayName": "名称"}]),
                ],
            },
            {
                "id": "dv-mrp-q-reorder",
                "symbol": "Q_补货数量",
                "name": "物料补货批量",
                                "nameEn": "material_reorder_quantity",
                "nature": "direct_ref",
                "dimension": "1D",
                "domain": "integer",
                "indices": [
                    _var_index("m", "物料集合", "obj-material", "物料"),
                ],
                "ontologyRefs": [_ont_ref("obj-inventory", "reorder_quantity")],
                "directRef": _direct_ref("obj-inventory", "reorder_quantity", "库存.补货批量"),
                "indexMapping": [
                    _idx("m", "obj-material", "material_id", "物料集合", "补货物料"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "物料m的单次补货批量",
                "unit": "件",
            },
        ],
        "created_at": _ts(), "updated_at": _ts(),
    },

    # ══════════════════════════════════════════════════════════════════════════
    # 场景4: 库存优化
    # 业务目标：优化库存水平、安全库存、再订货点和订货批量
    # ══════════════════════════════════════════════════════════════════════════
    {
        "_id": "dvs-scenario-inventory",
        "name": "库存优化",
        "scenario": "库存优化",
        "scenarioDisplayName": "库存优化",
        "description": "优化各物料的库存水平、安全库存、再订货点和经济订货批量，最小化持有成本与缺货成本",
        "ontology_id": ONTOLOGY_ID,
        "variables": [
            {
                "id": "dv-inv-level",
                "symbol": "INV_库存水平",
                "name": "物料库存水平",
                                "nameEn": "material_inventory_level",
                "nature": "direct_ref",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("m", "物料集合", "obj-material", "物料"),
                ],
                "ontologyRefs": [_ont_ref("obj-inventory", "total_quantity")],
                "directRef": _direct_ref("obj-inventory", "total_quantity", "库存.总数量"),
                "indexMapping": [
                    _idx("m", "obj-material", "material_id", "物料集合", "库存对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "物料m的当前库存水平",
                "unit": "件",
            },
            {
                "id": "dv-inv-safety",
                "symbol": "SS_安全库存",
                "name": "安全库存水平",
                                "nameEn": "safety_stock_level",
                "nature": "direct_ref",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("m", "物料集合", "obj-material", "物料"),
                ],
                "ontologyRefs": [_ont_ref("obj-inventory", "safety_stock")],
                "directRef": _direct_ref("obj-inventory", "safety_stock", "库存.安全库存"),
                "indexMapping": [
                    _idx("m", "obj-material", "material_id", "物料集合", "安全库存对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "物料m的安全库存水平（最低库存阈值）",
                "unit": "件",
            },
            {
                "id": "dv-inv-rop",
                "symbol": "ROP_再订货点",
                "name": "再订货点",
                                "nameEn": "reorder_point",
                "nature": "association",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("m", "物料集合", "obj-material", "物料"),
                ],
                "ontologyRefs": [_ont_ref("obj-material", "material_id")],
                "indexMapping": [
                    _idx("m", "obj-material", "material_id", "物料集合", "库存对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "物料m的再订货点（库存降至该值时触发补货）",
                "unit": "件",
                "associatedProperties": [
                    _assoc_prop("obj-material", "物料", [{"propertyId": "name", "displayName": "名称"}]),
                    _assoc_prop("obj-inventory", "库存", [{"propertyId": "total_quantity", "displayName": "总数量"}]),
                ],
            },
            {
                "id": "dv-inv-eoq",
                "symbol": "EOQ_经济批量",
                "name": "经济订货批量",
                                "nameEn": "economic_order_quantity",
                "nature": "association",
                "dimension": "1D",
                "domain": "integer",
                "indices": [
                    _var_index("m", "物料集合", "obj-material", "物料"),
                ],
                "ontologyRefs": [_ont_ref("obj-material", "material_id")],
                "indexMapping": [
                    _idx("m", "obj-material", "material_id", "物料集合", "订货对象"),
                ],
                "lowerBound": 1, "upperBound": None,
                "businessMeaning": "物料m的经济订货批量（EOQ）",
                "unit": "件",
                "associatedProperties": [
                    _assoc_prop("obj-material", "物料", [{"propertyId": "name", "displayName": "名称"}]),
                ],
            },
            {
                "id": "dv-inv-stockout",
                "symbol": "STOCKOUT_缺货量",
                "name": "缺货数量",
                                "nameEn": "stockout_quantity",
                "nature": "association",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("m", "物料集合", "obj-material", "物料"),
                ],
                "ontologyRefs": [_ont_ref("obj-material", "material_id")],
                "indexMapping": [
                    _idx("m", "obj-material", "material_id", "物料集合", "缺货对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "物料m的缺货数量（需求超出可用库存的部分）",
                "unit": "件",
                "associatedProperties": [
                    _assoc_prop("obj-material", "物料", [{"propertyId": "name", "displayName": "名称"}]),
                    _assoc_prop("obj-inventory", "库存", [{"propertyId": "total_quantity", "displayName": "总数量"}]),
                ],
            },
            {
                "id": "dv-inv-holding",
                "symbol": "HOLDING_持有成本",
                "name": "库存持有成本",
                                "nameEn": "inventory_holding_cost",
                "nature": "association",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("m", "物料集合", "obj-material", "物料"),
                ],
                "ontologyRefs": [_ont_ref("obj-material", "material_id")],
                "indexMapping": [
                    _idx("m", "obj-material", "material_id", "物料集合", "成本对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "物料m的库存持有成本",
                "unit": "元",
                "associatedProperties": [
                    _assoc_prop("obj-material", "物料", [{"propertyId": "name", "displayName": "名称"}]),
                    _assoc_prop("obj-inventory", "库存", [{"propertyId": "total_quantity", "displayName": "总数量"}]),
                ],
            },
        ],
        "created_at": _ts(), "updated_at": _ts(),
    },

    # ══════════════════════════════════════════════════════════════════════════
    # 场景5: 物流运输
    # 业务目标：选择运输路线和承运商，确定运输批量，最小化物流成本和延期
    # ══════════════════════════════════════════════════════════════════════════
    {
        "_id": "dvs-scenario-logistics",
        "name": "物流运输",
        "scenario": "物流运输",
        "scenarioDisplayName": "物流运输",
        "description": "选择运输路线和承运商，确定运输批量，最小化物流总成本和延期天数",
        "ontology_id": ONTOLOGY_ID,
        "variables": [
            {
                "id": "dv-log-route",
                "symbol": "R_运输路线",
                "name": "物流路线选择",
                                "nameEn": "logistics_route_selection",
                "nature": "association",
                "dimension": "2D",
                "domain": "binary",
                "indices": [
                    _var_index("l", "物流单集合", "obj-logistics", "物流单"),
                    _var_index("w", "仓库集合", "obj-warehouse", "仓库"),
                ],
                "ontologyRefs": [
                    _ont_ref("obj-logistics", "logistics_id"),
                    _ont_ref("obj-warehouse", "name"),
                ],
                "indexMapping": [
                    _idx("l", "obj-logistics", "logistics_id", "物流单集合", "运输对象"),
                    _idx("w", "obj-warehouse", "name", "仓库集合", "中转节点"),
                ],
                "lowerBound": 0, "upperBound": 1,
                "businessMeaning": "物流单l是否通过仓库w中转",
                "valueMeaning": {"1": "选择该路线", "0": "不选择"},
                "associatedProperties": [
                    _assoc_prop("obj-logistics", "物流单", [{"propertyId": "status", "displayName": "状态"}, {"propertyId": "delay_days", "displayName": "延期天数"}]),
                    _assoc_prop("obj-warehouse", "仓库", [{"propertyId": "name", "displayName": "名称"}, {"propertyId": "capacity", "displayName": "容量"}]),
                ],
            },
            {
                "id": "dv-log-ship-qty",
                "symbol": "SHIP_运输数量",
                "name": "物流运输量",
                                "nameEn": "logistics_shipping_quantity",
                "nature": "direct_ref",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("l", "物流单集合", "obj-logistics", "物流单"),
                ],
                "ontologyRefs": [_ont_ref("obj-logistics", "logistics_id")],
                "directRef": _direct_ref("obj-logistics", "logistics_id", "物流单.运输量"),
                "indexMapping": [
                    _idx("l", "obj-logistics", "logistics_id", "物流单集合", "运输对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "物流单l的运输数量",
                "unit": "件",
            },
            {
                "id": "dv-log-delay",
                "symbol": "DL_延期天数",
                "name": "物流延期天数",
                                "nameEn": "logistics_delay_days",
                "nature": "direct_ref",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("l", "物流单集合", "obj-logistics", "物流单"),
                ],
                "ontologyRefs": [_ont_ref("obj-logistics", "delay_days")],
                "directRef": _direct_ref("obj-logistics", "delay_days", "物流单.延期天数"),
                "indexMapping": [
                    _idx("l", "obj-logistics", "logistics_id", "物流单集合", "延期对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "物流单l的实际到达时间超过预期到达时间的天数",
                "unit": "天",
            },
            {
                "id": "dv-log-carrier",
                "symbol": "CARRIER_承运商选择",
                "name": "承运商选择",
                                "nameEn": "carrier_selection",
                "nature": "association",
                "dimension": "2D",
                "domain": "binary",
                "indices": [
                    _var_index("l", "物流单集合", "obj-logistics", "物流单"),
                    _var_index("c", "承运商集合", None, "承运商"),
                ],
                "ontologyRefs": [_ont_ref("obj-logistics", "logistics_id")],
                "indexMapping": [
                    _idx("l", "obj-logistics", "logistics_id", "物流单集合", "运输对象"),
                    _idx("c", None, None, "承运商集合", "承运方"),
                ],
                "lowerBound": 0, "upperBound": 1,
                "businessMeaning": "物流单l是否由承运商c负责运输",
                "valueMeaning": {"1": "选择", "0": "不选择"},
                "associatedProperties": [
                    _assoc_prop("obj-logistics", "物流单", [{"propertyId": "status", "displayName": "状态"}]),
                ],
            },
            {
                "id": "dv-log-cost",
                "symbol": "COST_运输成本",
                "name": "物流运输成本",
                                "nameEn": "logistics_transportation_cost",
                "nature": "association",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("l", "物流单集合", "obj-logistics", "物流单"),
                ],
                "ontologyRefs": [_ont_ref("obj-logistics", "logistics_id")],
                "indexMapping": [
                    _idx("l", "obj-logistics", "logistics_id", "物流单集合", "成本对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "物流单l的总运输成本",
                "unit": "元",
                "associatedProperties": [
                    _assoc_prop("obj-logistics", "物流单", [{"propertyId": "status", "displayName": "状态"}]),
                ],
            },
            {
                "id": "dv-log-arrival",
                "symbol": "ARRIVAL_到达时间",
                "name": "物流到达时间",
                                "nameEn": "logistics_arrival_time",
                "nature": "association",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("l", "物流单集合", "obj-logistics", "物流单"),
                ],
                "ontologyRefs": [_ont_ref("obj-logistics", "logistics_id")],
                "indexMapping": [
                    _idx("l", "obj-logistics", "logistics_id", "物流单集合", "到达对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "物流单l的实际到达时间",
                "unit": "天",
                "associatedProperties": [
                    _assoc_prop("obj-logistics", "物流单", [{"propertyId": "status", "displayName": "状态"}, {"propertyId": "delay_days", "displayName": "延期天数"}]),
                ],
            },
        ],
        "created_at": _ts(), "updated_at": _ts(),
    },

    # ══════════════════════════════════════════════════════════════════════════
    # 场景6: 任务调度
    # 业务目标：将细粒度生产任务调度到机台，确定执行顺序，最小化换线时间和完工时间
    # ══════════════════════════════════════════════════════════════════════════
    {
        "_id": "dvs-scenario-task-scheduling",
        "name": "任务调度",
        "scenario": "任务调度",
        "scenarioDisplayName": "任务调度",
        "description": "将细粒度生产任务调度到机台，确定执行顺序和换线安排，最小化总完工时间和换线成本",
        "ontology_id": ONTOLOGY_ID,
        "variables": [
            {
                "id": "dv-task-assign",
                "symbol": "A_任务分配",
                "name": "任务机台分配",
                                "nameEn": "task_machine_assignment",
                "nature": "association",
                "dimension": "2D",
                "domain": "binary",
                "indices": [
                    _var_index("i", "生产任务集合", "obj-task", "生产任务"),
                    _var_index("j", "机台集合", "obj-machine", "机台"),
                ],
                "ontologyRefs": [
                    _ont_ref("obj-task", "task_id"),
                    _ont_ref("obj-machine", "machine_id"),
                ],
                "indexMapping": [
                    _idx("i", "obj-task", "task_id", "生产任务集合", "被调度对象"),
                    _idx("j", "obj-machine", "machine_id", "机台集合", "执行资源"),
                ],
                "lowerBound": 0, "upperBound": 1,
                "businessMeaning": "生产任务i是否分配给机台j执行",
                "valueMeaning": {"1": "分配", "0": "不分配"},
                "associatedProperties": [
                    _assoc_prop("obj-task", "生产任务", [{"propertyId": "status", "displayName": "状态"}, {"propertyId": "work_order_id", "displayName": "工单ID"}]),
                    _assoc_prop("obj-machine", "机台", [{"propertyId": "status", "displayName": "状态"}, {"propertyId": "oee", "displayName": "OEE指标"}]),
                ],
            },
            {
                "id": "dv-task-ts-start",
                "symbol": "TS_任务开始",
                "name": "任务开始时间",
                                "nameEn": "task_start_time",
                "nature": "association",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("i", "生产任务集合", "obj-task", "生产任务"),
                ],
                "ontologyRefs": [_ont_ref("obj-task", "task_id")],
                "indexMapping": [
                    _idx("i", "obj-task", "task_id", "生产任务集合", "调度对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "生产任务i的开始执行时间",
                "unit": "小时",
                "associatedProperties": [
                    _assoc_prop("obj-task", "生产任务", [{"propertyId": "status", "displayName": "状态"}]),
                ],
            },
            {
                "id": "dv-task-tc-end",
                "symbol": "TC_任务完工",
                "name": "任务完工时间",
                                "nameEn": "task_completion_time",
                "nature": "association",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("i", "生产任务集合", "obj-task", "生产任务"),
                ],
                "ontologyRefs": [_ont_ref("obj-task", "task_id")],
                "indexMapping": [
                    _idx("i", "obj-task", "task_id", "生产任务集合", "调度对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "生产任务i的完工时间",
                "unit": "小时",
                "associatedProperties": [
                    _assoc_prop("obj-task", "生产任务", [{"propertyId": "status", "displayName": "状态"}]),
                ],
            },
            {
                "id": "dv-task-seq",
                "symbol": "SEQ_执行顺序",
                "name": "任务执行位置",
                                "nameEn": "task_execution_sequence",
                "nature": "association",
                "dimension": "2D",
                "domain": "integer",
                "indices": [
                    _var_index("i", "生产任务集合", "obj-task", "生产任务"),
                    _var_index("j", "机台集合", "obj-machine", "机台"),
                ],
                "ontologyRefs": [
                    _ont_ref("obj-task", "task_id"),
                    _ont_ref("obj-machine", "machine_id"),
                ],
                "indexMapping": [
                    _idx("i", "obj-task", "task_id", "生产任务集合", "排序对象"),
                    _idx("j", "obj-machine", "machine_id", "机台集合", "排序机台"),
                ],
                "lowerBound": 1, "upperBound": None,
                "businessMeaning": "生产任务i在机台j上的执行位置序号",
                "associatedProperties": [
                    _assoc_prop("obj-task", "生产任务", [{"propertyId": "status", "displayName": "状态"}]),
                    _assoc_prop("obj-machine", "机台", [{"propertyId": "status", "displayName": "状态"}]),
                ],
            },
            {
                "id": "dv-task-chg",
                "symbol": "CHG_换线",
                "name": "换线决策",
                                "nameEn": "machine_changeover_decision",
                "nature": "association",
                "dimension": "3D",
                "domain": "binary",
                "indices": [
                    _var_index("k", "生产任务集合", "obj-task", "生产任务"),
                    _var_index("l", "生产任务集合", "obj-task", "生产任务"),
                    _var_index("j", "机台集合", "obj-machine", "机台"),
                ],
                "ontologyRefs": [
                    _ont_ref("obj-task", "task_id"),
                    _ont_ref("obj-machine", "machine_id"),
                ],
                "indexMapping": [
                    _idx("k", "obj-task", "task_id", "生产任务集合", "前序任务"),
                    _idx("l", "obj-task", "task_id", "生产任务集合", "后序任务"),
                    _idx("j", "obj-machine", "machine_id", "机台集合", "换线机台"),
                ],
                "lowerBound": 0, "upperBound": 1,
                "businessMeaning": "在机台j上，任务k完成后是否需要换线才能执行任务l",
                "valueMeaning": {"1": "需要换线", "0": "无需换线"},
                "associatedProperties": [
                    _assoc_prop("obj-task", "生产任务", [{"propertyId": "status", "displayName": "状态"}, {"propertyId": "work_order_id", "displayName": "工单ID"}]),
                    _assoc_prop("obj-machine", "机台", [{"propertyId": "status", "displayName": "状态"}]),
                ],
            },
            {
                "id": "dv-task-qty-output",
                "symbol": "QTY_任务产出",
                "name": "任务产出量",
                                "nameEn": "task_output_quantity",
                "nature": "direct_ref",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("i", "生产任务集合", "obj-task", "生产任务"),
                ],
                "ontologyRefs": [_ont_ref("obj-task", "status")],
                "directRef": _direct_ref("obj-task", "status", "生产任务.状态(产出量)"),
                "indexMapping": [
                    _idx("i", "obj-task", "task_id", "生产任务集合", "产出对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "生产任务i的实际产出数量",
                "unit": "件",
            },
            {
                "id": "dv-task-idle",
                "symbol": "IDLE_机台空闲",
                "name": "机台空闲时间",
                                "nameEn": "machine_idle_time",
                "nature": "association",
                "dimension": "1D",
                "domain": "continuous",
                "indices": [
                    _var_index("j", "机台集合", "obj-machine", "机台"),
                ],
                "ontologyRefs": [_ont_ref("obj-machine", "machine_id")],
                "indexMapping": [
                    _idx("j", "obj-machine", "machine_id", "机台集合", "空闲对象"),
                ],
                "lowerBound": 0, "upperBound": None,
                "businessMeaning": "机台j在调度周期内的总空闲时间",
                "unit": "小时",
                "associatedProperties": [
                    _assoc_prop("obj-machine", "机台", [{"propertyId": "status", "displayName": "状态"}, {"propertyId": "oee", "displayName": "OEE指标"}]),
                ],
            },
        ],
        "created_at": _ts(), "updated_at": _ts(),
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# 预置约束条件集 —— 按业务场景分组
# 约束中引用的变量名必须与决策变量集中的 symbol 完全匹配
# ─────────────────────────────────────────────────────────────────────────────

PRESET_CONSTRAINT_SETS = [

    # ── APS高级计划排程 ──
    {
        "_id": "cts-scenario-aps",
        "name": "APS高级计划排程",
        "scenario": "APS",
        "description": "高级计划排程场景的基础约束条件",
        "ontology_id": ONTOLOGY_ID,
        "constraints": [
            {
                "id": "ct-aps-assign-unique",
                "name": "工单分配唯一性",
                "description": "每个工单必须且只能分配给一台机台加工",
                "category": "assignment",
                "expressionText": "∀i∈工单: Σ(j∈机台) X_工单分配[i,j] = 1",
                "forEach": [{"alias": "i", "setRef": "工单集合", "objectTypeId": "obj-work-order"}],
                "operator": "==", "rhsValue": 1.0,
                "hardness": "hard",
                "businessMeaning": "确保每个工单被恰好一台机台处理，避免漏排或重排",
                "relatedVariableSymbols": ["X_工单分配"],
            },
            {
                "id": "ct-aps-capacity-machine",
                "name": "机台产能约束",
                "description": "每台机台的加工总时长不超过其可用工时",
                "category": "capacity",
                "expressionText": "∀j∈机台: Σ(i∈工单) X_工单分配[i,j] × processing_time[i] ≤ available_hours[j]",
                "forEach": [{"alias": "j", "setRef": "机台集合", "objectTypeId": "obj-machine"}],
                "operator": "<=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "机台j的加工总时长不超过其可用工时",
                "relatedVariableSymbols": ["X_工单分配", "S_开始时间"],
            },
            {
                "id": "ct-aps-no-overlap",
                "name": "机台工单不重叠",
                "description": "同一台机台上两个工单不能在时间上重叠",
                "category": "mutual_exclusion",
                "expressionText": "∀i,k∈工单, ∀j∈机台: S_开始时间[i] + pt[i] ≤ S_开始时间[k] + M×(1 - Y_加工顺序[i,k,j])",
                "forEach": [
                    {"alias": "i", "setRef": "工单集合", "objectTypeId": "obj-work-order"},
                    {"alias": "k", "setRef": "工单集合", "objectTypeId": "obj-work-order"},
                    {"alias": "j", "setRef": "机台集合", "objectTypeId": "obj-machine"},
                ],
                "operator": "<=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "确保机台j上工单i和工单k在时间上不重叠（大M法）",
                "relatedVariableSymbols": ["S_开始时间", "Y_加工顺序"],
            },
            {
                "id": "ct-aps-completion-def",
                "name": "完工时间定义",
                "description": "工单完工时间 = 开始时间 + 加工时长",
                "category": "balance",
                "expressionText": "∀i∈工单: C_完工时间[i] = S_开始时间[i] + Σ(j∈机台) X_工单分配[i,j] × pt[i,j]",
                "forEach": [{"alias": "i", "setRef": "工单集合", "objectTypeId": "obj-work-order"}],
                "operator": "==", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "定义完工时间与开始时间的关系",
                "relatedVariableSymbols": ["C_完工时间", "S_开始时间", "X_工单分配"],
            },
            {
                "id": "ct-aps-makespan-bound",
                "name": "Makespan上界",
                "description": "最大完工时间不小于任何工单的完工时间",
                "category": "balance",
                "expressionText": "∀i∈工单: CMAX_最大完工 ≥ C_完工时间[i]",
                "forEach": [{"alias": "i", "setRef": "工单集合", "objectTypeId": "obj-work-order"}],
                "operator": ">=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "CMAX是所有工单完工时间的最大值",
                "relatedVariableSymbols": ["CMAX_最大完工", "C_完工时间"],
            },
            {
                "id": "ct-aps-tardiness-def",
                "name": "延期时间定义",
                "description": "工单延期时间 = max(0, 完工时间 - 交期)",
                "category": "balance",
                "expressionText": "∀i∈工单: T_延期时间[i] ≥ C_完工时间[i] - due_date[i]",
                "forEach": [{"alias": "i", "setRef": "工单集合", "objectTypeId": "obj-work-order"}],
                "operator": ">=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "若完工时间超过交期，则产生延期",
                "relatedVariableSymbols": ["T_延期时间", "C_完工时间"],
            },
            {
                "id": "ct-aps-eligible-machine",
                "name": "机台资质约束",
                "description": "工单只能分配给具备加工资质的机台",
                "category": "capacity",
                "expressionText": "∀i∈工单, ∀j∉eligible[i]: X_工单分配[i,j] = 0",
                "forEach": [
                    {"alias": "i", "setRef": "工单集合", "objectTypeId": "obj-work-order"},
                    {"alias": "j", "setRef": "机台集合", "objectTypeId": "obj-machine"},
                ],
                "operator": "==", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "只有具备资质的机台才能加工特定工单",
                "relatedVariableSymbols": ["X_工单分配"],
            },
            {
                "id": "ct-aps-precedence",
                "name": "工序前序约束",
                "description": "工单的后续工序必须在前序工序完成后才能开始",
                "category": "precedence",
                "expressionText": "∀i∈工单, ∀(op_a→op_b): S_开始时间[op_b] ≥ C_完工时间[op_a]",
                "forEach": [{"alias": "i", "setRef": "工单集合", "objectTypeId": "obj-work-order"}],
                "operator": ">=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "确保工单内部的工序严格按先后顺序执行",
                "relatedVariableSymbols": ["S_开始时间", "C_完工时间"],
            },
        ],
        "created_at": _ts(), "updated_at": _ts(),
    },

    # ── MPS主生产计划 ──
    {
        "_id": "cts-scenario-mps",
        "name": "MPS主生产计划",
        "scenario": "MPS",
        "description": "主生产计划场景的基础约束条件",
        "ontology_id": ONTOLOGY_ID,
        "constraints": [
            {
                "id": "ct-mps-demand-satisfy",
                "name": "客户需求满足",
                "description": "分配给客户的产品总量须满足其已接受的订单需求",
                "category": "balance",
                "expressionText": "∀c∈客户, ∀p∈产品: ALLOC_产品分配[p,c] ≥ demand[c,p] × ORD_订单接受[c,p]",
                "forEach": [
                    {"alias": "c", "setRef": "客户集合", "objectTypeId": "obj-customer"},
                    {"alias": "p", "setRef": "产品集合", "objectTypeId": "obj-product"},
                ],
                "operator": ">=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "已接受订单的客户需求必须被满足",
                "relatedVariableSymbols": ["ALLOC_产品分配", "ORD_订单接受"],
            },
            {
                "id": "ct-mps-supply-cap",
                "name": "产出分配平衡",
                "description": "产品分配给所有客户的总量不超过该产品的总产出",
                "category": "balance",
                "expressionText": "∀p∈产品, ∀t∈周期: Σ(c∈客户) ALLOC_产品分配[p,c] ≤ PROD_产出数量[p,t]",
                "forEach": [
                    {"alias": "p", "setRef": "产品集合", "objectTypeId": "obj-product"},
                    {"alias": "t", "setRef": "时间周期集合"},
                ],
                "operator": "<=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "产品p分配总量不超过其产出量",
                "relatedVariableSymbols": ["PROD_产出数量", "ALLOC_产品分配"],
            },
            {
                "id": "ct-mps-inventory-balance",
                "name": "成品库存平衡",
                "description": "期末库存 = 期初库存 + 产出 - 分配",
                "category": "balance",
                "expressionText": "∀p∈产品, ∀t∈周期: INV_成品库存[p,t] = INV_成品库存[p,t-1] + PROD_产出数量[p,t] - Σ(c) ALLOC_产品分配[p,c]",
                "forEach": [
                    {"alias": "p", "setRef": "产品集合", "objectTypeId": "obj-product"},
                    {"alias": "t", "setRef": "时间周期集合"},
                ],
                "operator": "==", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "确保成品库存进出平衡",
                "relatedVariableSymbols": ["INV_成品库存", "PROD_产出数量", "ALLOC_产品分配"],
            },
            {
                "id": "ct-mps-capacity-limit",
                "name": "产能上限",
                "description": "各产品的总产出不得超过产能上限",
                "category": "capacity",
                "expressionText": "∀p∈产品, ∀t∈周期: PROD_产出数量[p,t] ≤ capacity[p,t]",
                "forEach": [
                    {"alias": "p", "setRef": "产品集合", "objectTypeId": "obj-product"},
                    {"alias": "t", "setRef": "时间周期集合"},
                ],
                "operator": "<=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "产品p在周期t的产出不超过其产能上限",
                "relatedVariableSymbols": ["PROD_产出数量"],
            },
            {
                "id": "ct-mps-vip-priority",
                "name": "VIP客户优先",
                "description": "VIP类型客户的优先级不低于基准优先级",
                "category": "capacity",
                "expressionText": "∀c∈VIP客户: PRI_客户优先级[c] ≥ base_priority",
                "forEach": [{"alias": "c", "setRef": "客户集合", "objectTypeId": "obj-customer"}],
                "operator": ">=", "rhsValue": 0.0,
                "hardness": "soft",
                "businessMeaning": "VIP客户的服务优先级不低于基准值",
                "relatedVariableSymbols": ["PRI_客户优先级", "ORD_订单接受"],
            },
            {
                "id": "ct-mps-backlog-def",
                "name": "欠货量定义",
                "description": "欠货量 = 需求 - 实际分配（当需求未被完全满足时）",
                "category": "balance",
                "expressionText": "∀c,p,t: BACKLOG_欠货量[c,p,t] ≥ demand[c,p,t] - ALLOC_产品分配[p,c]",
                "forEach": [
                    {"alias": "c", "setRef": "客户集合", "objectTypeId": "obj-customer"},
                    {"alias": "p", "setRef": "产品集合", "objectTypeId": "obj-product"},
                    {"alias": "t", "setRef": "时间周期集合"},
                ],
                "operator": ">=", "rhsValue": 0.0,
                "hardness": "soft",
                "businessMeaning": "未被满足的客户需求记为欠货量",
                "relatedVariableSymbols": ["BACKLOG_欠货量", "ALLOC_产品分配"],
            },
        ],
        "created_at": _ts(), "updated_at": _ts(),
    },

    # ── MRP物料需求计划 ──
    {
        "_id": "cts-scenario-mrp",
        "name": "MRP物料需求计划",
        "scenario": "MRP",
        "description": "物料需求计划场景的基础约束条件",
        "ontology_id": ONTOLOGY_ID,
        "constraints": [
            {
                "id": "ct-mrp-bom-explode",
                "name": "BOM展开需求",
                "description": "物料需求 = 各产品产出量 × BOM消耗系数之和",
                "category": "balance",
                "expressionText": "∀m∈物料, ∀t∈周期: MRP_物料需求[m,t] = Σ(p∈产品) BOM_物料消耗[p,m] × PROD_产出数量[p,t]",
                "forEach": [
                    {"alias": "m", "setRef": "物料集合", "objectTypeId": "obj-material"},
                    {"alias": "t", "setRef": "时间周期集合"},
                ],
                "operator": "==", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "通过BOM展开计算各物料的总需求",
                "relatedVariableSymbols": ["MRP_物料需求", "BOM_物料消耗", "PROD_产出数量"],
            },
            {
                "id": "ct-mrp-inventory-balance",
                "name": "物料库存平衡",
                "description": "期末库存 = 期初库存 + 到货 - 需求消耗",
                "category": "balance",
                "expressionText": "∀m,t: INV_物料库存[m,t] = INV_物料库存[m,t-1] + RECEIPT_到货量[m,t] - MRP_物料需求[m,t]",
                "forEach": [
                    {"alias": "m", "setRef": "物料集合", "objectTypeId": "obj-material"},
                    {"alias": "t", "setRef": "时间周期集合"},
                ],
                "operator": "==", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "确保物料库存进出平衡",
                "relatedVariableSymbols": ["INV_物料库存", "RECEIPT_到货量", "MRP_物料需求"],
            },
            {
                "id": "ct-mrp-supplier-source",
                "name": "供应商采购关联",
                "description": "只能从已选择的供应商处采购物料",
                "category": "balance",
                "expressionText": "∀s,m,t: PURCHASE_采购量[s,m,t] ≤ M × Z_供应商选择[s,m]",
                "forEach": [
                    {"alias": "s", "setRef": "供应商集合", "objectTypeId": "obj-supplier"},
                    {"alias": "m", "setRef": "物料集合", "objectTypeId": "obj-material"},
                    {"alias": "t", "setRef": "时间周期集合"},
                ],
                "operator": "<=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "未选择的供应商不能采购（大M法）",
                "relatedVariableSymbols": ["PURCHASE_采购量", "Z_供应商选择"],
            },
            {
                "id": "ct-mrp-receipt-def",
                "name": "到货量定义",
                "description": "物料到货量 = 提前期前的采购量之和",
                "category": "balance",
                "expressionText": "∀m,t: RECEIPT_到货量[m,t] = Σ(s∈供应商) PURCHASE_采购量[s,m,t-lead_time[s,m]]",
                "forEach": [
                    {"alias": "m", "setRef": "物料集合", "objectTypeId": "obj-material"},
                    {"alias": "t", "setRef": "时间周期集合"},
                ],
                "operator": "==", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "到货量等于提前期前下达的采购订单量",
                "relatedVariableSymbols": ["RECEIPT_到货量", "PURCHASE_采购量"],
            },
            {
                "id": "ct-mrp-safety-stock",
                "name": "物料安全库存",
                "description": "物料库存不得低于安全库存水平",
                "category": "capacity",
                "expressionText": "∀m,t: INV_物料库存[m,t] ≥ SS_安全库存[m]",
                "forEach": [
                    {"alias": "m", "setRef": "物料集合", "objectTypeId": "obj-material"},
                    {"alias": "t", "setRef": "时间周期集合"},
                ],
                "operator": ">=", "rhsValue": 0.0,
                "hardness": "soft",
                "businessMeaning": "保证物料库存始终高于安全线",
                "relatedVariableSymbols": ["INV_物料库存", "SS_安全库存"],
            },
            {
                "id": "ct-mrp-lead-time",
                "name": "采购提前期",
                "description": "采购订单下达后须经过提前期才能到货",
                "category": "precedence",
                "expressionText": "∀s,m,t: PURCHASE_采购量[s,m,t] 在 t+lead_time[s,m] 周期后才能转化为 RECEIPT_到货量",
                "forEach": [
                    {"alias": "s", "setRef": "供应商集合", "objectTypeId": "obj-supplier"},
                    {"alias": "m", "setRef": "物料集合", "objectTypeId": "obj-material"},
                    {"alias": "t", "setRef": "时间周期集合"},
                ],
                "operator": ">=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "确保采购到货时间与提前期一致",
                "relatedVariableSymbols": ["PURCHASE_采购量", "RECEIPT_到货量"],
            },
        ],
        "created_at": _ts(), "updated_at": _ts(),
    },

    # ── 库存优化 ──
    {
        "_id": "cts-scenario-inventory",
        "name": "库存优化",
        "scenario": "库存优化",
        "description": "库存优化场景的基础约束条件",
        "ontology_id": ONTOLOGY_ID,
        "constraints": [
            {
                "id": "ct-inv-balance",
                "name": "库存平衡",
                "description": "期末库存 = 期初库存 + 补货量 - 需求量",
                "category": "balance",
                "expressionText": "∀m∈物料: INV_库存水平[m] = initial_inv[m] + Q_补货数量[m] - demand[m]",
                "forEach": [{"alias": "m", "setRef": "物料集合", "objectTypeId": "obj-material"}],
                "operator": "==", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "确保库存进出平衡",
                "relatedVariableSymbols": ["INV_库存水平", "Q_补货数量"],
            },
            {
                "id": "ct-inv-safety-stock",
                "name": "安全库存下限",
                "description": "库存水平不得低于安全库存",
                "category": "capacity",
                "expressionText": "∀m∈物料: INV_库存水平[m] ≥ SS_安全库存[m]",
                "forEach": [{"alias": "m", "setRef": "物料集合", "objectTypeId": "obj-material"}],
                "operator": ">=", "rhsValue": 0.0,
                "hardness": "soft",
                "businessMeaning": "保证库存水平始终高于安全线",
                "relatedVariableSymbols": ["INV_库存水平", "SS_安全库存"],
            },
            {
                "id": "ct-inv-warehouse-cap",
                "name": "仓库容量",
                "description": "库存总量不超过仓库容量",
                "category": "capacity",
                "expressionText": "Σ(m∈物料) INV_库存水平[m] × volume[m] ≤ warehouse_capacity",
                "forEach": [],
                "operator": "<=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "所有物料库存占用的空间不超过仓库总容量",
                "relatedVariableSymbols": ["INV_库存水平"],
            },
            {
                "id": "ct-inv-reorder-trigger",
                "name": "再订货触发",
                "description": "当库存降至再订货点以下时必须补货",
                "category": "capacity",
                "expressionText": "∀m∈物料: INV_库存水平[m] ≥ ROP_再订货点[m] - M × reorder_triggered[m]",
                "forEach": [{"alias": "m", "setRef": "物料集合", "objectTypeId": "obj-material"}],
                "operator": ">=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "库存低于再订货点时必须触发补货",
                "relatedVariableSymbols": ["INV_库存水平", "ROP_再订货点"],
            },
            {
                "id": "ct-inv-eoq-lot",
                "name": "批量约束",
                "description": "补货数量应为经济批量的整数倍",
                "category": "capacity",
                "expressionText": "∀m∈物料: Q_补货数量[m] = EOQ_经济批量[m] × n[m]",
                "forEach": [{"alias": "m", "setRef": "物料集合", "objectTypeId": "obj-material"}],
                "operator": "==", "rhsValue": 0.0,
                "hardness": "soft",
                "businessMeaning": "补货批量与经济订货批量关联",
                "relatedVariableSymbols": ["EOQ_经济批量", "Q_补货数量"],
            },
            {
                "id": "ct-inv-stockout-def",
                "name": "缺货定义",
                "description": "缺货量 = max(0, 需求 - 可用库存)",
                "category": "balance",
                "expressionText": "∀m∈物料: STOCKOUT_缺货量[m] ≥ demand[m] - INV_库存水平[m]",
                "forEach": [{"alias": "m", "setRef": "物料集合", "objectTypeId": "obj-material"}],
                "operator": ">=", "rhsValue": 0.0,
                "hardness": "soft",
                "businessMeaning": "需求超出库存的部分记为缺货",
                "relatedVariableSymbols": ["STOCKOUT_缺货量", "INV_库存水平"],
            },
        ],
        "created_at": _ts(), "updated_at": _ts(),
    },

    # ── 物流运输 ──
    {
        "_id": "cts-scenario-logistics",
        "name": "物流运输",
        "scenario": "物流运输",
        "description": "物流运输场景的基础约束条件",
        "ontology_id": ONTOLOGY_ID,
        "constraints": [
            {
                "id": "ct-log-route-unique",
                "name": "路线唯一性",
                "description": "每个物流单只能选择一条运输路线",
                "category": "assignment",
                "expressionText": "∀l∈物流单: Σ(w∈仓库) R_运输路线[l,w] = 1",
                "forEach": [{"alias": "l", "setRef": "物流单集合", "objectTypeId": "obj-logistics"}],
                "operator": "==", "rhsValue": 1.0,
                "hardness": "hard",
                "businessMeaning": "每个物流单必须且只能通过一个仓库中转",
                "relatedVariableSymbols": ["R_运输路线"],
            },
            {
                "id": "ct-log-warehouse-throughput",
                "name": "仓库吞吐约束",
                "description": "仓库处理量不超过其吞吐能力",
                "category": "capacity",
                "expressionText": "∀w∈仓库: Σ(l∈物流单) SHIP_运输数量[l] × R_运输路线[l,w] ≤ throughput[w]",
                "forEach": [{"alias": "w", "setRef": "仓库集合", "objectTypeId": "obj-warehouse"}],
                "operator": "<=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "每个仓库的物流处理量不超过其吞吐上限",
                "relatedVariableSymbols": ["R_运输路线", "SHIP_运输数量"],
            },
            {
                "id": "ct-log-delivery-deadline",
                "name": "配送时效",
                "description": "物流延期天数不超过允许上限",
                "category": "capacity",
                "expressionText": "∀l∈物流单: DL_延期天数[l] ≤ max_delay",
                "forEach": [{"alias": "l", "setRef": "物流单集合", "objectTypeId": "obj-logistics"}],
                "operator": "<=", "rhsValue": 0.0,
                "hardness": "soft",
                "businessMeaning": "物流延期天数不超过允许的最大延期",
                "relatedVariableSymbols": ["DL_延期天数"],
            },
            {
                "id": "ct-log-demand-satisfy",
                "name": "需求满足",
                "description": "运达量必须满足客户需求",
                "category": "balance",
                "expressionText": "∀c∈客户: Σ(l∈物流单) SHIP_运输数量[l] ≥ demand[c]",
                "forEach": [{"alias": "c", "setRef": "客户集合", "objectTypeId": "obj-customer"}],
                "operator": ">=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "确保运达客户的总量满足其需求",
                "relatedVariableSymbols": ["SHIP_运输数量"],
            },
            {
                "id": "ct-log-carrier-select",
                "name": "承运商唯一选择",
                "description": "每个物流单只能选择一个承运商",
                "category": "assignment",
                "expressionText": "∀l∈物流单: Σ(c∈承运商) CARRIER_承运商选择[l,c] = 1",
                "forEach": [{"alias": "l", "setRef": "物流单集合", "objectTypeId": "obj-logistics"}],
                "operator": "==", "rhsValue": 1.0,
                "hardness": "hard",
                "businessMeaning": "每个物流单必须且只能由一个承运商负责运输",
                "relatedVariableSymbols": ["CARRIER_承运商选择"],
            },
            {
                "id": "ct-log-cost-def",
                "name": "运输成本定义",
                "description": "运输成本 = 路线成本 + 承运商费用",
                "category": "balance",
                "expressionText": "∀l∈物流单: COST_运输成本[l] = Σ(w) R_运输路线[l,w] × route_cost[l,w] + Σ(c) CARRIER_承运商选择[l,c] × carrier_cost[l,c]",
                "forEach": [{"alias": "l", "setRef": "物流单集合", "objectTypeId": "obj-logistics"}],
                "operator": "==", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "定义物流单的总运输成本",
                "relatedVariableSymbols": ["COST_运输成本", "R_运输路线", "CARRIER_承运商选择"],
            },
        ],
        "created_at": _ts(), "updated_at": _ts(),
    },

    # ── 任务调度 ──
    {
        "_id": "cts-scenario-task-scheduling",
        "name": "任务调度",
        "scenario": "任务调度",
        "description": "任务调度场景的基础约束条件",
        "ontology_id": ONTOLOGY_ID,
        "constraints": [
            {
                "id": "ct-task-assign-unique",
                "name": "任务分配唯一性",
                "description": "每个生产任务必须且只能分配给一台机台",
                "category": "assignment",
                "expressionText": "∀i∈生产任务: Σ(j∈机台) A_任务分配[i,j] = 1",
                "forEach": [{"alias": "i", "setRef": "生产任务集合", "objectTypeId": "obj-task"}],
                "operator": "==", "rhsValue": 1.0,
                "hardness": "hard",
                "businessMeaning": "确保每个生产任务被恰好一台机台执行",
                "relatedVariableSymbols": ["A_任务分配"],
            },
            {
                "id": "ct-task-machine-parallel",
                "name": "机台并行上限",
                "description": "每台机台同时执行的任务数不超过其并行能力上限",
                "category": "capacity",
                "expressionText": "∀j∈机台: Σ(i∈生产任务) A_任务分配[i,j] ≤ max_parallel[j]",
                "forEach": [{"alias": "j", "setRef": "机台集合", "objectTypeId": "obj-machine"}],
                "operator": "<=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "机台j同时执行的任务数不超过其并行能力上限",
                "relatedVariableSymbols": ["A_任务分配"],
            },
            {
                "id": "ct-task-seq-conflict",
                "name": "任务顺序唯一性",
                "description": "同一台机台上，两个任务不能占据相同的执行位置",
                "category": "mutual_exclusion",
                "expressionText": "∀i≠k∈生产任务, ∀j∈机台: SEQ_执行顺序[i,j] ≠ SEQ_执行顺序[k,j] (当A_任务分配[i,j]=A_任务分配[k,j]=1)",
                "forEach": [
                    {"alias": "i", "setRef": "生产任务集合", "objectTypeId": "obj-task"},
                    {"alias": "k", "setRef": "生产任务集合", "objectTypeId": "obj-task"},
                    {"alias": "j", "setRef": "机台集合", "objectTypeId": "obj-machine"},
                ],
                "operator": "!=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "同一机台上不同任务的执行顺序必须不同",
                "relatedVariableSymbols": ["SEQ_执行顺序", "A_任务分配"],
            },
            {
                "id": "ct-task-time-window",
                "name": "任务时间窗",
                "description": "任务的完工时间 = 开始时间 + 加工时长",
                "category": "capacity",
                "expressionText": "∀i∈生产任务: TC_任务完工[i] = TS_任务开始[i] + Σ(j) A_任务分配[i,j] × duration[i,j]",
                "forEach": [{"alias": "i", "setRef": "生产任务集合", "objectTypeId": "obj-task"}],
                "operator": "==", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "定义任务的完工时间与开始时间的关系",
                "relatedVariableSymbols": ["TS_任务开始", "TC_任务完工", "A_任务分配"],
            },
            {
                "id": "ct-task-changeover",
                "name": "换线时间约束",
                "description": "换线时后续任务必须等待换线完成后才能开始",
                "category": "precedence",
                "expressionText": "∀k,l∈任务, ∀j∈机台: TS_任务开始[l] ≥ TC_任务完工[k] + changeover[k,l,j] × CHG_换线[k,l,j]",
                "forEach": [
                    {"alias": "k", "setRef": "生产任务集合", "objectTypeId": "obj-task"},
                    {"alias": "l", "setRef": "生产任务集合", "objectTypeId": "obj-task"},
                    {"alias": "j", "setRef": "机台集合", "objectTypeId": "obj-machine"},
                ],
                "operator": ">=", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "换线时间必须被纳入调度时间窗",
                "relatedVariableSymbols": ["CHG_换线", "TS_任务开始", "TC_任务完工"],
            },
            {
                "id": "ct-task-output-def",
                "name": "产出定义",
                "description": "任务产出数量等于其已分配机台的产出之和",
                "category": "balance",
                "expressionText": "∀i∈生产任务: QTY_任务产出[i] = Σ(j∈机台) A_任务分配[i,j] × output[i,j]",
                "forEach": [{"alias": "i", "setRef": "生产任务集合", "objectTypeId": "obj-task"}],
                "operator": "==", "rhsValue": 0.0,
                "hardness": "hard",
                "businessMeaning": "任务产出等于其执行机台的实际产出",
                "relatedVariableSymbols": ["QTY_任务产出", "A_任务分配"],
            },
            {
                "id": "ct-task-idle-def",
                "name": "空闲时间定义",
                "description": "机台空闲时间 = 调度周期 - 总加工时间",
                "category": "balance",
                "expressionText": "∀j∈机台: IDLE_机台空闲[j] = horizon - Σ(i∈任务) A_任务分配[i,j] × (TC_任务完工[i] - TS_任务开始[i])",
                "forEach": [{"alias": "j", "setRef": "机台集合", "objectTypeId": "obj-machine"}],
                "operator": "==", "rhsValue": 0.0,
                "hardness": "soft",
                "businessMeaning": "定义机台的空闲时间",
                "relatedVariableSymbols": ["IDLE_机台空闲", "TC_任务完工", "TS_任务开始", "A_任务分配"],
            },
        ],
        "created_at": _ts(), "updated_at": _ts(),
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# 初始化入口
# ─────────────────────────────────────────────────────────────────────────────

def init_presets():
    """将预置数据写入MongoDB"""
    var_col = mongodb_client.get_collection("decision_variable_sets")
    con_col = mongodb_client.get_collection("constraint_template_sets")

    print("=" * 60)
    print("开始初始化本体-模型映射预置数据（场景模式）")
    print("=" * 60)

    # 写入决策变量集（覆盖更新）
    for vs in PRESET_VARIABLE_SETS:
        existing = var_col.find_one({"_id": vs["_id"]})
        var_col.replace_one({"_id": vs["_id"]}, vs, upsert=True)
        var_count = len(vs.get("variables", []))
        direct = sum(1 for v in vs.get("variables", []) if v.get("nature") == "direct_ref")
        assoc = var_count - direct
        action = "更新" if existing else "创建"
        print(f"  ✅ {action}变量集: {vs['_id']} ({vs['name']})，含 {var_count} 个变量（{direct}直引+{assoc}关联）")

    # 写入约束条件集（覆盖更新）
    for cs in PRESET_CONSTRAINT_SETS:
        existing = con_col.find_one({"_id": cs["_id"]})
        con_col.replace_one({"_id": cs["_id"]}, cs, upsert=True)
        con_count = len(cs.get("constraints", []))
        action = "更新" if existing else "创建"
        print(f"  ✅ {action}约束集: {cs['_id']} ({cs['name']})，含 {con_count} 个约束")

    print("\n" + "=" * 60)
    print("初始化完成！")
    total_vars = sum(len(vs.get("variables", [])) for vs in PRESET_VARIABLE_SETS)
    total_direct = sum(1 for vs in PRESET_VARIABLE_SETS for v in vs.get("variables", []) if v.get("nature") == "direct_ref")
    total_assoc = total_vars - total_direct
    total_cons = sum(len(cs.get("constraints", [])) for cs in PRESET_CONSTRAINT_SETS)
    print(f"  决策变量集: {len(PRESET_VARIABLE_SETS)} 个场景（共 {total_vars} 个变量：{total_direct}直引+{total_assoc}关联）")
    print(f"  约束条件集: {len(PRESET_CONSTRAINT_SETS)} 个场景（共 {total_cons} 个约束）")
    print("=" * 60)


if __name__ == "__main__":
    init_presets()
