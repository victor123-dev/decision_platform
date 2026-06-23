"""
多维决策变量测试场景初始化脚本

在 MongoDB 中创建 5 个覆盖不同维度组合的优化模型测试用例，
用于验证多维决策变量在前端展示、本体映射、DSL 生成等全链路功能。

运行方式：
    cd backend
    python -m scripts.init_test_scenarios
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.mongodb_client import mongodb_client
from datetime import datetime, timezone

ONTOLOGY_ID = "ont-supply-chain-control-tower"
ONTOLOGY_NAME = "供应链控制塔"

# 测试场景专用集合名
TEST_SCENARIOS_COLLECTION = "optimization_test_scenarios"
TEST_SCENARIO_TAG = "multi-dimension-test-scenario"


def _ts():
    return datetime.now(timezone.utc).isoformat()


def _id(prefix: str, name: str) -> str:
    """生成稳定的测试用例 ID"""
    suffix = name.lower().replace(" ", "-").replace("_", "-")
    return f"{prefix}-{suffix}"


def _ont_ref(object_type_id: str, property_id: str) -> dict:
    return {"objectTypeId": object_type_id, "propertyId": property_id, "ontologyName": ONTOLOGY_NAME}


def _var_index(alias: str, set_name: str, object_type_id: str, display_name: str, business_meaning: str = "") -> dict:
    return {"alias": alias, "setName": set_name, "objectTypeId": object_type_id,
            "objectTypeDisplayName": display_name, "businessMeaning": business_meaning}


def _idx(alias: str, object_type_id: str, property_id: str, set_name: str, role: str = "", business_meaning: str = "") -> dict:
    return {"alias": alias, "objectTypeId": object_type_id, "propertyId": property_id,
            "setName": set_name, "role": role, "businessMeaning": business_meaning}


def _assoc_prop(object_type_id: str, display_name: str, properties: list) -> dict:
    return {"objectTypeId": object_type_id, "displayName": display_name, "properties": properties}


def _var_0d(
    vid: str,
    symbol: str,
    name: str,
    name_en: str,
    domain: str,
    lower_bound: float,
    upper_bound: float,
    business_meaning: str,
    unit: str = None,
) -> dict:
    """构造 0D 决策变量"""
    return {
        "id": vid,
        "symbol": symbol,
        "name": name,
        "nameEn": name_en,
        "nature": "association",
        "dimension": "0D",
        "domain": domain,
        "indices": [],
        "ontologyRefs": [],
        "indexMapping": [],
        "lowerBound": lower_bound,
        "upperBound": upper_bound,
        "businessMeaning": business_meaning,
        "unit": unit,
        "valueType": "number",
        "associatedProperties": [],
    }


def _var_1d(
    vid: str,
    symbol: str,
    name: str,
    name_en: str,
    domain: str,
    lower_bound: float,
    upper_bound: float,
    object_type_id: str,
    property_id: str,
    set_name: str,
    display_name: str,
    business_meaning: str,
    unit: str = None,
) -> dict:
    """构造 1D 决策变量，索引统一使用 i"""
    return {
        "id": vid,
        "symbol": symbol,
        "name": name,
        "nameEn": name_en,
        "nature": "association",
        "dimension": "1D",
        "domain": domain,
        "indices": [_var_index("i", set_name, object_type_id, display_name, business_meaning)],
        "ontologyRefs": [_ont_ref(object_type_id, property_id)],
        "indexMapping": [_idx("i", object_type_id, property_id, set_name, "索引对象", business_meaning)],
        "lowerBound": lower_bound,
        "upperBound": upper_bound,
        "businessMeaning": f"{business_meaning}对应的{name}",
        "unit": unit,
        "valueType": "number",
        "associatedProperties": [
            _assoc_prop(object_type_id, display_name, [{"propertyId": property_id, "displayName": business_meaning}])
        ],
    }


def _var_2d(
    vid: str,
    symbol: str,
    name: str,
    name_en: str,
    domain: str,
    lower_bound: float,
    upper_bound: float,
    index_defs: list,
    unit: str = None,
    value_meaning: dict = None,
) -> dict:
    """
    构造 2D 决策变量。
    index_defs: [(object_type_id, property_id, set_name, display_name, business_meaning), ...]
    索引符号按顺序使用 i, j。
    """
    aliases = ["i", "j"]
    indices = []
    ontology_refs = []
    index_mapping = []
    associated_properties = []

    for idx, (object_type_id, property_id, set_name, display_name, business_meaning) in enumerate(index_defs):
        alias = aliases[idx]
        indices.append(_var_index(alias, set_name, object_type_id, display_name, business_meaning))
        if object_type_id:
            ontology_refs.append(_ont_ref(object_type_id, property_id))
            index_mapping.append(_idx(alias, object_type_id, property_id, set_name, "索引对象", business_meaning))
            associated_properties.append(
                _assoc_prop(object_type_id, display_name, [{"propertyId": property_id, "displayName": business_meaning}])
            )

    return {
        "id": vid,
        "symbol": symbol,
        "name": name,
        "nameEn": name_en,
        "nature": "association",
        "dimension": "2D",
        "domain": domain,
        "indices": indices,
        "ontologyRefs": ontology_refs,
        "indexMapping": index_mapping,
        "lowerBound": lower_bound,
        "upperBound": upper_bound,
        "businessMeaning": name,
        "valueMeaning": value_meaning,
        "unit": unit,
        "valueType": "number",
        "associatedProperties": associated_properties,
    }


def _var_3d(
    vid: str,
    symbol: str,
    name: str,
    name_en: str,
    domain: str,
    lower_bound: float,
    upper_bound: float,
    index_defs: list,
    unit: str = None,
    value_meaning: dict = None,
) -> dict:
    """
    构造 3D 决策变量。
    index_defs: [(object_type_id, property_id, set_name, display_name, business_meaning), ...]
    索引符号按顺序使用 i, j, k。
    """
    aliases = ["i", "j", "k"]
    indices = []
    ontology_refs = []
    index_mapping = []
    associated_properties = []

    for idx, (object_type_id, property_id, set_name, display_name, business_meaning) in enumerate(index_defs):
        alias = aliases[idx]
        indices.append(_var_index(alias, set_name, object_type_id, display_name, business_meaning))
        if object_type_id:
            ontology_refs.append(_ont_ref(object_type_id, property_id))
            index_mapping.append(_idx(alias, object_type_id, property_id, set_name, "索引对象", business_meaning))
            associated_properties.append(
                _assoc_prop(object_type_id, display_name, [{"propertyId": property_id, "displayName": business_meaning}])
            )

    return {
        "id": vid,
        "symbol": symbol,
        "name": name,
        "nameEn": name_en,
        "nature": "association",
        "dimension": "3D",
        "domain": domain,
        "indices": indices,
        "ontologyRefs": ontology_refs,
        "indexMapping": index_mapping,
        "lowerBound": lower_bound,
        "upperBound": upper_bound,
        "businessMeaning": name,
        "valueMeaning": value_meaning,
        "unit": unit,
        "valueType": "number",
        "associatedProperties": associated_properties,
    }


def _constraint(cid: str, name: str, expression: str, sense: str, rhs: float, description: str = "") -> dict:
    return {
        "id": cid,
        "name": name,
        "expression": expression,
        "sense": sense,
        "rhs": rhs,
        "description": description,
    }


def _objective(sense: str, expression: str) -> dict:
    return {"sense": sense, "expression": expression}


# ═════════════════════════════════════════════════════════════════════════════
# 5 个测试场景
# ═════════════════════════════════════════════════════════════════════════════

TEST_SCENARIOS = [
    {
        "_id": _id("ts", "single-product-profit"),
        "tag": TEST_SCENARIO_TAG,
        "name": "场景1：产品利润最大化（仅0D）",
        "description": "确定单一产品最优产量，验证0D变量基础展示与无索引列场景。",
        "problem_type": "LP",
        "variables": [
            _var_0d(
                vid=_id("dv", "single-x"),
                symbol="x",
                name="产量",
                name_en="production_quantity",
                domain="continuous",
                lower_bound=0,
                upper_bound=None,
                business_meaning="单一产品的计划产量",
                unit="件",
            ),
            _var_0d(
                vid=_id("dv", "single-p"),
                symbol="P",
                name="利润",
                name_en="profit",
                domain="continuous",
                lower_bound=0,
                upper_bound=None,
                business_meaning="单一产品的总利润",
                unit="元",
            ),
        ],
        "objectives": [
            _objective("maximize", "P")
        ],
        "constraints": [
            _constraint(
                _id("ct", "single-profit-def"),
                "利润公式",
                "P - 50*x + 1000",
                "==",
                0.0,
                "利润 = 单位利润 × 产量 - 固定成本",
            ),
            _constraint(
                _id("ct", "single-capacity"),
                "产能限制",
                "x",
                "<=",
                200.0,
                "产量不超过产线最大产能",
            ),
        ],
        "created_at": _ts(),
        "updated_at": _ts(),
    },

    {
        "_id": _id("ts", "multi-product-planning"),
        "tag": TEST_SCENARIO_TAG,
        "name": "场景2：多产品产量规划（0D + 1D）",
        "description": "多种产品的最优产量规划，验证1D索引展示与0D/1D混合表格。",
        "problem_type": "LP",
        "variables": [
            _var_1d(
                vid=_id("dv", "multi-x"),
                symbol="x",
                name="产品产量",
                name_en="product_production_quantity",
                domain="continuous",
                lower_bound=0,
                upper_bound=None,
                object_type_id="obj-product",
                property_id="product_id",
                set_name="产品集合",
                display_name="产品",
                business_meaning="产品编号",
                unit="件",
            ),
            _var_0d(
                vid=_id("dv", "multi-total-profit"),
                symbol="TotalProfit",
                name="总利润",
                name_en="total_profit",
                domain="continuous",
                lower_bound=0,
                upper_bound=None,
                business_meaning="所有产品的总利润",
                unit="元",
            ),
        ],
        "objectives": [
            _objective("maximize", "TotalProfit")
        ],
        "constraints": [
            _constraint(
                _id("ct", "multi-profit-def"),
                "总利润定义",
                "TotalProfit - sum(profit_i * x_i)",
                "==",
                0.0,
                "总利润等于各产品利润贡献之和",
            ),
            _constraint(
                _id("ct", "multi-product-capacity"),
                "产品产能约束",
                "x_i",
                "<=",
                100.0,
                "每个产品的产量不超过其产能上限",
            ),
        ],
        "created_at": _ts(),
        "updated_at": _ts(),
    },

    {
        "_id": _id("ts", "work-order-machine-assignment"),
        "tag": TEST_SCENARIO_TAG,
        "name": "场景3：工单机台分配（0D + 1D + 2D）",
        "description": "工单分配到机台并最小化最大完工时间，验证2D索引与本体映射、多维度混合。",
        "problem_type": "MIP",
        "variables": [
            _var_2d(
                vid=_id("dv", "sched-y"),
                symbol="Y",
                name="工单机台分配",
                name_en="work_order_machine_assignment",
                domain="binary",
                lower_bound=0,
                upper_bound=1,
                index_defs=[
                    ("obj-work-order", "work_order_id", "工单集合", "工单", "工单编号"),
                    ("obj-machine", "machine_id", "机台集合", "机台", "机台编号"),
                ],
                value_meaning={"1": "分配", "0": "不分配"},
            ),
            _var_1d(
                vid=_id("dv", "sched-s"),
                symbol="S",
                name="工单开工时间",
                name_en="work_order_start_time",
                domain="continuous",
                lower_bound=0,
                upper_bound=None,
                object_type_id="obj-work-order",
                property_id="work_order_id",
                set_name="工单集合",
                display_name="工单",
                business_meaning="工单编号",
                unit="小时",
            ),
            _var_0d(
                vid=_id("dv", "sched-cmax"),
                symbol="Cmax",
                name="最大完工时间",
                name_en="makespan",
                domain="continuous",
                lower_bound=0,
                upper_bound=None,
                business_meaning="所有工单中最大的完工时间（Makespan）",
                unit="小时",
            ),
        ],
        "objectives": [
            _objective("minimize", "Cmax")
        ],
        "constraints": [
            _constraint(
                _id("ct", "sched-assign-unique"),
                "每个工单恰好分配一台机台",
                "sum_j(Y_ij) - 1",
                "==",
                0.0,
                "每个工单必须且只能分配给一台机台",
            ),
            _constraint(
                _id("ct", "sched-makespan-bound"),
                "Makespan下界",
                "Cmax - S_i - processing_time_i",
                ">=",
                0.0,
                "最大完工时间不小于任一工单的开工时间加加工时长",
            ),
        ],
        "created_at": _ts(),
        "updated_at": _ts(),
    },

    {
        "_id": _id("ts", "warehouse-customer-delivery"),
        "tag": TEST_SCENARIO_TAG,
        "name": "场景4：多仓库物料配送（1D + 2D）",
        "description": "多个仓库向多个客户配送以最小化运输成本，验证2D多对象关联与无0D变量场景。",
        "problem_type": "LP",
        "variables": [
            _var_2d(
                vid=_id("dv", "delivery-t"),
                symbol="T",
                name="仓库到客户配送量",
                name_en="warehouse_to_customer_delivery_quantity",
                domain="continuous",
                lower_bound=0,
                upper_bound=None,
                index_defs=[
                    ("obj-warehouse", "warehouse_id", "仓库集合", "仓库", "仓库编号"),
                    ("obj-customer", "customer_id", "客户集合", "客户", "客户编号"),
                ],
                unit="件",
            ),
            _var_1d(
                vid=_id("dv", "delivery-u"),
                symbol="U",
                name="仓库出库总量",
                name_en="warehouse_total_outbound_quantity",
                domain="continuous",
                lower_bound=0,
                upper_bound=None,
                object_type_id="obj-warehouse",
                property_id="warehouse_id",
                set_name="仓库集合",
                display_name="仓库",
                business_meaning="仓库编号",
                unit="件",
            ),
        ],
        "objectives": [
            _objective("minimize", "sum(cost_ij * T_ij)")
        ],
        "constraints": [
            _constraint(
                _id("ct", "delivery-outbound-def"),
                "仓库出库总量定义",
                "U_i - sum_j(T_ij)",
                "==",
                0.0,
                "仓库出库总量等于其发往所有客户的配送量之和",
            ),
            _constraint(
                _id("ct", "delivery-warehouse-cap"),
                "库存容量约束",
                "U_i",
                "<=",
                500.0,
                "仓库出库总量不超过仓库库存容量",
            ),
            _constraint(
                _id("ct", "delivery-demand"),
                "客户需求满足",
                "sum_i(T_ij)",
                ">=",
                100.0,
                "所有仓库对某客户的配送总量满足其需求",
            ),
        ],
        "created_at": _ts(),
        "updated_at": _ts(),
    },

    {
        "_id": _id("ts", "job-shop-scheduling"),
        "tag": TEST_SCENARIO_TAG,
        "name": "场景5：车间排程全场景（0D + 1D + 2D + 3D）",
        "description": "Job-Shop调度最小化Makespan，验证全维度混合展示与求解表格合并单元格。",
        "problem_type": "MIP",
        "variables": [
            _var_3d(
                vid=_id("dv", "jobs-z"),
                symbol="Z",
                name="工序机台分配",
                name_en="operation_machine_assignment",
                domain="binary",
                lower_bound=0,
                upper_bound=1,
                index_defs=[
                    ("obj-work-order", "work_order_id", "工单集合", "工单", "工单编号"),
                    ("obj-task", "task_id", "工序集合", "工序", "工序编号"),
                    ("obj-machine", "machine_id", "机台集合", "机台", "机台编号"),
                ],
                value_meaning={"1": "加工", "0": "不加工"},
            ),
            _var_2d(
                vid=_id("dv", "jobs-y"),
                symbol="Y",
                name="工序开始时间",
                name_en="operation_start_time",
                domain="continuous",
                lower_bound=0,
                upper_bound=None,
                index_defs=[
                    ("obj-work-order", "work_order_id", "工单集合", "工单", "工单编号"),
                    ("obj-task", "task_id", "工序集合", "工序", "工序编号"),
                ],
                unit="小时",
            ),
            _var_1d(
                vid=_id("dv", "jobs-c"),
                symbol="C",
                name="工单完工时间",
                name_en="work_order_completion_time",
                domain="continuous",
                lower_bound=0,
                upper_bound=None,
                object_type_id="obj-work-order",
                property_id="work_order_id",
                set_name="工单集合",
                display_name="工单",
                business_meaning="工单编号",
                unit="小时",
            ),
            _var_0d(
                vid=_id("dv", "jobs-cmax"),
                symbol="Cmax",
                name="最大完工时间",
                name_en="makespan",
                domain="continuous",
                lower_bound=0,
                upper_bound=None,
                business_meaning="所有工单中最大的完工时间（Makespan）",
                unit="小时",
            ),
        ],
        "objectives": [
            _objective("minimize", "Cmax")
        ],
        "constraints": [
            _constraint(
                _id("ct", "jobs-operation-machine"),
                "工序分配唯一性",
                "sum_k(Z_ijk) - 1",
                "==",
                0.0,
                "每道工序必须且只能分配给一台机台加工",
            ),
            _constraint(
                _id("ct", "jobs-operation-seq"),
                "工序顺序约束",
                "Y_ij - Y_i(j-1) - processing_time_i(j-1)",
                ">=",
                0.0,
                "同一工单内后道工序的开始时间不早于前道工序完工时间",
            ),
            _constraint(
                _id("ct", "jobs-machine-cap"),
                "机台容量约束",
                "sum_{i,j} Z_ijk - 1",
                "<=",
                0.0,
                "同一时刻每台机台最多加工一道工序",
            ),
            _constraint(
                _id("ct", "jobs-completion-def"),
                "工单完工时间定义",
                "C_i - Y_iJ - processing_time_iJ",
                ">=",
                0.0,
                "工单完工时间不小于最后一道工序的开始时间加加工时长",
            ),
            _constraint(
                _id("ct", "jobs-makespan-def"),
                "Makespan定义",
                "Cmax - C_i",
                ">=",
                0.0,
                "最大完工时间不小于任一工单的完工时间",
            ),
        ],
        "created_at": _ts(),
        "updated_at": _ts(),
    },
]


def init_test_scenarios():
    """将测试场景写入 MongoDB"""
    col = mongodb_client.get_collection(TEST_SCENARIOS_COLLECTION)

    print("=" * 70)
    print("开始初始化多维决策变量测试场景")
    print("=" * 70)

    # 清理旧的测试数据
    delete_result = col.delete_many({"tag": TEST_SCENARIO_TAG})
    print(f"  🗑️  清理旧测试场景: {delete_result.deleted_count} 条")

    # 写入新数据
    inserted = []
    for scenario in TEST_SCENARIOS:
        col.insert_one(scenario)
        inserted.append(scenario)

    # 打印摘要
    print("\n" + "-" * 70)
    print("写入结果摘要")
    print("-" * 70)

    total_vars = 0
    dim_counts = {}
    for scenario in inserted:
        var_count = len(scenario.get("variables", []))
        total_vars += var_count
        dims = {}
        for v in scenario.get("variables", []):
            d = v.get("dimension", "unknown")
            dims[d] = dims.get(d, 0) + 1
            dim_counts[d] = dim_counts.get(d, 0) + 1
        dim_summary = "/".join(
            f"{d}{dims[d]}"
            for d in sorted(dims.keys(), key=lambda x: ["0D", "1D", "2D", "3D"].index(x) if x in ["0D", "1D", "2D", "3D"] else 99)
        )
        obj_count = len(scenario.get("objectives", []))
        con_count = len(scenario.get("constraints", []))
        print(f"  ✅ {scenario['name']}")
        print(f"      变量: {var_count} 个 ({dim_summary}) | 目标: {obj_count} 个 | 约束: {con_count} 个")

    print("\n" + "=" * 70)
    total_dim_summary = "/".join(
        f"{d}{dim_counts[d]}"
        for d in sorted(dim_counts.keys(), key=lambda x: ["0D", "1D", "2D", "3D"].index(x) if x in ["0D", "1D", "2D", "3D"] else 99)
    )
    total_objs = sum(len(s.get("objectives", [])) for s in inserted)
    total_cons = sum(len(s.get("constraints", [])) for s in inserted)
    print(f"  测试场景: {len(inserted)} 个")
    print(f"  决策变量: {total_vars} 个（维度分布: {total_dim_summary}）")
    print(f"  目标函数: {total_objs} 个")
    print(f"  约束条件: {total_cons} 个")
    print(f"  目标集合: {TEST_SCENARIOS_COLLECTION}")
    print("=" * 70)


if __name__ == "__main__":
    init_test_scenarios()
