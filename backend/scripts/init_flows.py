import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json

def init_decision_flows():
    flows = [
        {
            "id": "flow-001",
            "name": "信用评分决策流",
            "description": "完整的个人信贷信用评分流程，包含数据获取、规则评估、模型预测和结果输出",
            "node_count": 10,
            "tags": ["信贷", "风控"],
            "updated_at": "2026-06-02 14:20",
            "checked_out_by": None,
            "status": "active",
            "nodes": [
                {"id": "n1", "type": "interface", "position": {"x": 50, "y": 200}, "data": {"label": "开始", "config": {}}},
                {"id": "n2", "type": "http_request", "position": {"x": 250, "y": 200}, "data": {"label": "获取征信数据", "config": {"url": "/api/credit/report", "method": "GET"}}},
                {"id": "n3", "type": "script", "position": {"x": 450, "y": 200}, "data": {"label": "数据清洗转换", "config": {"format": "JSON"}}},
                {"id": "n4", "type": "rules", "position": {"x": 650, "y": 120}, "data": {"label": "基础规则评估", "config": {"rulesetId": "rs-001"}}},
                {"id": "n5", "type": "ml_model", "position": {"x": 650, "y": 300}, "data": {"label": "ML风险模型", "config": {"modelId": "mdl-001", "format": "ONNX"}}},
                {"id": "n6", "type": "asynchronous", "position": {"x": 870, "y": 200}, "data": {"label": "合并评分", "config": {"strategy": "weighted_avg"}}},
                {"id": "n7", "type": "if", "position": {"x": 1070, "y": 200}, "data": {"label": "评分判断", "config": {"condition": "${final_score} >= 60"}}},
                {"id": "n8", "type": "script", "position": {"x": 1270, "y": 120}, "data": {"label": "生成审批建议", "config": {"fileId": "cf-001"}}},
                {"id": "n9", "type": "notification", "position": {"x": 1270, "y": 300}, "data": {"label": "记录拒绝原因", "config": {"level": "WARN"}}},
                {"id": "n10", "type": "end", "position": {"x": 1470, "y": 200}, "data": {"label": "结束", "config": {}}},
            ],
            "edges": [
                {"id": "e1", "source": "n1", "target": "n2"},
                {"id": "e2", "source": "n2", "target": "n3"},
                {"id": "e3", "source": "n3", "target": "n4"},
                {"id": "e4", "source": "n3", "target": "n5"},
                {"id": "e5", "source": "n4", "target": "n6"},
                {"id": "e6", "source": "n5", "target": "n6"},
                {"id": "e7", "source": "n6", "target": "n7"},
                {"id": "e8", "source": "n7", "target": "n8", "source_handle": "yes", "label": "通过"},
                {"id": "e9", "source": "n7", "target": "n9", "source_handle": "no", "label": "拒绝"},
                {"id": "e10", "source": "n8", "target": "n10"},
                {"id": "e11", "source": "n9", "target": "n10"},
            ]
        },
        {
            "id": "flow-002",
            "name": "反欺诈交易监控流",
            "description": "实时交易风控流程，支持规则+模型双重校验",
            "node_count": 7,
            "tags": ["风控", "反欺诈"],
            "updated_at": "2026-06-01 09:30",
            "checked_out_by": None,
            "status": "active",
            "nodes": [
                {"id": "n1", "type": "interface", "position": {"x": 50, "y": 150}, "data": {"label": "交易事件", "config": {}}},
                {"id": "n2", "type": "rules", "position": {"x": 250, "y": 150}, "data": {"label": "反欺诈规则", "config": {"rulesetId": "rs-002"}}},
                {"id": "n3", "type": "if", "position": {"x": 470, "y": 150}, "data": {"label": "风险等级", "config": {"condition": "${risk_level} == \"high\""}}},
                {"id": "n4", "type": "ml_model", "position": {"x": 690, "y": 80}, "data": {"label": "欺诈检测模型", "config": {"modelId": "mdl-002"}}},
                {"id": "n5", "type": "notification", "position": {"x": 690, "y": 250}, "data": {"label": "安全交易日志", "config": {"level": "INFO"}}},
                {"id": "n6", "type": "subprocess", "position": {"x": 910, "y": 80}, "data": {"label": "人工审核子流程", "config": {"subflowId": "flow-004"}}},
                {"id": "n7", "type": "end", "position": {"x": 1110, "y": 150}, "data": {"label": "处理完成", "config": {}}},
            ],
            "edges": [
                {"id": "e1", "source": "n1", "target": "n2"},
                {"id": "e2", "source": "n2", "target": "n3"},
                {"id": "e3", "source": "n3", "target": "n4", "source_handle": "yes", "label": "高风险"},
                {"id": "e4", "source": "n3", "target": "n5", "source_handle": "no", "label": "正常"},
                {"id": "e5", "source": "n4", "target": "n6"},
                {"id": "e6", "source": "n5", "target": "n7"},
                {"id": "e7", "source": "n6", "target": "n7"},
            ]
        },
        {
            "id": "flow-003",
            "name": "自动订单审核流",
            "description": "采购订单自动审批与人工复核流程",
            "node_count": 6,
            "tags": ["供应链", "订单"],
            "updated_at": "2026-05-28 11:00",
            "checked_out_by": None,
            "status": "active",
            "nodes": [
                {"id": "n1", "type": "interface", "position": {"x": 50, "y": 150}, "data": {"label": "新订单", "config": {}}},
                {"id": "n2", "type": "rules", "position": {"x": 250, "y": 150}, "data": {"label": "订单审核规则", "config": {"rulesetId": "rs-003"}}},
                {"id": "n3", "type": "if", "position": {"x": 470, "y": 150}, "data": {"label": "是否自动审批", "config": {"condition": "${auto_approve} == true"}}},
                {"id": "n4", "type": "script", "position": {"x": 690, "y": 80}, "data": {"label": "自动审批处理", "config": {"fileId": "cf-002"}}},
                {"id": "n5", "type": "notification", "position": {"x": 690, "y": 250}, "data": {"label": "转人工审核", "config": {"level": "WARN"}}},
                {"id": "n6", "type": "end", "position": {"x": 910, "y": 150}, "data": {"label": "订单处理完成", "config": {}}},
            ],
            "edges": [
                {"id": "e1", "source": "n1", "target": "n2"},
                {"id": "e2", "source": "n2", "target": "n3"},
                {"id": "e3", "source": "n3", "target": "n4", "source_handle": "yes", "label": "自动"},
                {"id": "e4", "source": "n3", "target": "n5", "source_handle": "no", "label": "人工"},
                {"id": "e5", "source": "n4", "target": "n6"},
                {"id": "e6", "source": "n5", "target": "n6"},
            ],
            "integration": {
                "backend": "native",
                "mode": "production"
            }
        },
        {
            "id": "flow-004",
            "name": "库存智能补货流",
            "description": "基于库存水位的自动补货决策，调用优化求解模型",
            "node_count": 5,
            "tags": ["供应链", "库存", "优化"],
            "updated_at": "2026-06-10 15:30",
            "checked_out_by": None,
            "status": "active",
            "nodes": [
                {"id": "n1", "type": "interface", "position": {"x": 50, "y": 200}, "data": {"label": "库存检查触发", "config": {}}},
                {"id": "n2", "type": "http_request", "position": {"x": 250, "y": 200}, "data": {"label": "获取库存数据", "config": {"url": "/api/ontology/ont-supply-chain/instances", "method": "GET"}}},
                {"id": "n3", "type": "optimization_model", "position": {"x": 450, "y": 200}, "data": {"label": "EOQ优化求解", "config": {"modelId": "opt-001"}}},
                {"id": "n4", "type": "script", "position": {"x": 650, "y": 200}, "data": {"label": "生成补货建议", "config": {}}},
                {"id": "n5", "type": "end", "position": {"x": 850, "y": 200}, "data": {"label": "执行完成", "config": {}}},
            ],
            "edges": [
                {"id": "e1", "source": "n1", "target": "n2"},
                {"id": "e2", "source": "n2", "target": "n3"},
                {"id": "e3", "source": "n3", "target": "n4"},
                {"id": "e4", "source": "n4", "target": "n5"},
            ]
        },
        {
            "id": "flow-005",
            "name": "供应商评估决策流",
            "description": "综合评估供应商表现并分级，结合本体数据和规则引擎",
            "node_count": 6,
            "tags": ["供应链", "供应商", "评估"],
            "updated_at": "2026-06-10 16:00",
            "checked_out_by": None,
            "status": "active",
            "nodes": [
                {"id": "n1", "type": "interface", "position": {"x": 50, "y": 200}, "data": {"label": "开始评估", "config": {}}},
                {"id": "n2", "type": "http_request", "position": {"x": 250, "y": 200}, "data": {"label": "获取供应商数据", "config": {"url": "/api/ontology/ont-supply-chain/instances", "method": "GET"}}},
                {"id": "n3", "type": "rules", "position": {"x": 450, "y": 200}, "data": {"label": "供应商评分规则", "config": {"rulesetId": "rs-004"}}},
                {"id": "n4", "type": "if", "position": {"x": 650, "y": 200}, "data": {"label": "等级判断", "config": {"condition": "${total_score} >= 80"}}},
                {"id": "n5", "type": "notification", "position": {"x": 850, "y": 150}, "data": {"label": "A级供应商", "config": {"level": "INFO"}}},
                {"id": "n6", "type": "notification", "position": {"x": 850, "y": 250}, "data": {"label": "B/C级供应商", "config": {"level": "WARN"}}},
                {"id": "n7", "type": "end", "position": {"x": 1050, "y": 200}, "data": {"label": "评估完成", "config": {}}},
            ],
            "edges": [
                {"id": "e1", "source": "n1", "target": "n2"},
                {"id": "e2", "source": "n2", "target": "n3"},
                {"id": "e3", "source": "n3", "target": "n4"},
                {"id": "e4", "source": "n4", "target": "n5", "source_handle": "yes", "label": ">=80"},
                {"id": "e5", "source": "n4", "target": "n6", "source_handle": "no", "label": "<80"},
                {"id": "e6", "source": "n5", "target": "n7"},
                {"id": "e7", "source": "n6", "target": "n7"},
            ]
        },
        {
            "id": "flow-006",
            "name": "信贷综合评分决策流",
            "description": "使用评分卡、决策表和决策树综合评估信贷申请，演示JVS规则引擎新节点类型",
            "node_count": 8,
            "tags": ["信贷", "评分卡", "决策表"],
            "updated_at": "2026-06-18 10:00",
            "checked_out_by": None,
            "status": "draft",
            "nodes": [
                {"id": "n1", "type": "interface", "position": {"x": 50, "y": 250}, "data": {"label": "信贷申请入口", "config": {}}},
                {"id": "n2", "type": "assignment", "position": {"x": 250, "y": 250}, "data": {"label": "计算负债比", "config": {"target_variable": "debt_ratio", "variable_type": "小数", "assignment_mode": "基础赋值", "value_source": "表达式", "expression": "${debt} / ${income}", "default_value": "0"}}},
                {"id": "n3", "type": "simple_scorecard", "position": {"x": 450, "y": 250}, "data": {"label": "基础信用评分", "config": {"base_score": 30, "score_items": '[{"variable_name":"age","variable_type":"整数","weight":"100%","scoring_condition":"当 \'age\' 大于等于 25 时","value_source":"固定值","value":10,"note":"年龄达标"},{"variable_name":"income","variable_type":"小数","weight":"100%","scoring_condition":"当 \'income\' 大于等于 50000 时","value_source":"固定值","value":20,"note":"收入达标"},{"variable_name":"debt_ratio","variable_type":"小数","weight":"100%","scoring_condition":"当 \'debt_ratio\' 小于等于 0.5 时","value_source":"固定值","value":15,"note":"负债比低"}]', "score_sum": True, "weight_sum": False, "result_variable": "scorecard_score"}}},
                {"id": "n4", "type": "decision_table", "position": {"x": 650, "y": 250}, "data": {"label": "风险等级判定", "config": {"condition_variables": '[{"name":"scorecard_score","type":"小数","source":"context"}]', "decision_rules": '[{"priority":1,"conditions":{"scorecard_score":{"operator":"大于等于","value_source":"固定值","value":70}},"actions":{"risk_level":{"source":"固定值","value":"低"},"credit_limit":{"source":"固定值","value":100000}},"note":"高评分"},{"priority":2,"conditions":{"scorecard_score":{"operator":"大于等于","value_source":"固定值","value":50}},"actions":{"risk_level":{"source":"固定值","value":"中"},"credit_limit":{"source":"固定值","value":50000}},"note":"中等评分"},{"priority":3,"conditions":{"scorecard_score":{"operator":"小于","value_source":"固定值","value":50}},"actions":{"risk_level":{"source":"固定值","value":"高"},"credit_limit":{"source":"固定值","value":10000}},"note":"低评分"}]', "result_variables": '[{"name":"risk_level","type":"字符串","default":"未知"},{"name":"credit_limit","type":"小数","default":0}]', "hit_policy": "优先匹配"}}},
                {"id": "n5", "type": "cross_decision_table", "position": {"x": 850, "y": 250}, "data": {"label": "额度利率矩阵", "config": {"row_variable": "risk_level", "row_keys": '["低","中","高"]', "row_operator": "精确匹配", "column_variable": "loan_term", "column_keys": '["短期","中期","长期"]', "column_operator": "精确匹配", "matrix_values": '[[3.5,4.0,4.5],[4.5,5.0,5.5],[6.0,7.0,8.0]]', "default_value": "5.0", "result_variable": "interest_rate", "result_type": "小数"}}},
                {"id": "n6", "type": "decision_tree", "position": {"x": 1050, "y": 250}, "data": {"label": "最终审批决策", "config": {"tree_nodes": '[{"id":"root","type":"condition","variable":"risk_level","operator":"等于","value_source":"固定值","value":"低","true_child":"approve","false_child":"check_mid"},{"id":"approve","type":"action","result_variable":"approval_decision","result_value":"自动批准","result_source":"固定值"},{"id":"check_mid","type":"condition","variable":"scorecard_score","operator":"大于等于","value_source":"固定值","value":50,"true_child":"conditional","false_child":"reject"},{"id":"conditional","type":"action","result_variable":"approval_decision","result_value":"有条件批准","result_source":"固定值"},{"id":"reject","type":"action","result_variable":"approval_decision","result_value":"拒绝","result_source":"固定值"}]', "root_node_id": "root", "max_depth": 20, "default_result_variable": "approval_decision", "default_value": "拒绝"}}},
                {"id": "n7", "type": "notification", "position": {"x": 1250, "y": 250}, "data": {"label": "发送审批结果", "config": {"channel": "Email", "recipients": "申请人"}}},
                {"id": "n8", "type": "end", "position": {"x": 1450, "y": 250}, "data": {"label": "流程结束", "config": {}}},
            ],
            "edges": [
                {"id": "e1", "source": "n1", "target": "n2"},
                {"id": "e2", "source": "n2", "target": "n3"},
                {"id": "e3", "source": "n3", "target": "n4"},
                {"id": "e4", "source": "n4", "target": "n5"},
                {"id": "e5", "source": "n5", "target": "n6"},
                {"id": "e6", "source": "n6", "target": "n7"},
                {"id": "e7", "source": "n7", "target": "n8"},
            ]
        }
    ]
    
    return flows

def init_optimization_models():
    models = [
        {
            "id": "opt-001",
            "name": "EOQ库存优化模型",
            "description": "基于经济订货量的库存补货优化模型",
            "problem_type": "LP",
            "status": "active",
            "updated_at": "2026-06-10",
            "variables": [
                {"name": "order_qty", "lower_bound": 0, "upper_bound": 10000, "is_integer": True},
                {"name": "safety_stock", "lower_bound": 0, "upper_bound": 5000, "is_integer": True},
            ],
            "constraints": [
                {"name": "demand_constraint", "expression": "order_qty", "operator": ">=", "rhs": 100},
                {"name": "capacity_constraint", "expression": "order_qty", "operator": "<=", "rhs": 5000},
            ],
            "objective": {"sense": "min", "expression": "0.5*order_qty + 10*safety_stock + 2*order_qty"}
        },
        {
            "id": "opt-002",
            "name": "资源分配优化模型",
            "description": "多资源约束下的最优分配模型",
            "problem_type": "LP",
            "status": "active",
            "updated_at": "2026-06-10",
            "variables": [
                {"name": "x1", "lower_bound": 0, "upper_bound": 100, "is_integer": False},
                {"name": "x2", "lower_bound": 0, "upper_bound": 100, "is_integer": False},
                {"name": "x3", "lower_bound": 0, "upper_bound": 100, "is_integer": False},
            ],
            "constraints": [
                {"name": "resource1", "expression": "2*x1 + 3*x2 + x3", "operator": "<=", "rhs": 100},
                {"name": "resource2", "expression": "x1 + 2*x2 + 4*x3", "operator": "<=", "rhs": 80},
                {"name": "resource3", "expression": "3*x1 + x2 + 2*x3", "operator": "<=", "rhs": 90},
            ],
            "objective": {"sense": "max", "expression": "5*x1 + 4*x2 + 6*x3"}
        }
    ]
    
    return models

if __name__ == "__main__":
    flows = init_decision_flows()
    models = init_optimization_models()
    
    print(f"Created {len(flows)} decision flows")
    print(f"Created {len(models)} optimization models")
    
    with open("flows.json", "w") as f:
        json.dump(flows, f, indent=2, ensure_ascii=False)
    
    with open("optimization_models.json", "w") as f:
        json.dump(models, f, indent=2, ensure_ascii=False)
    
    print("Flows and models saved to JSON files")
