import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests

def init_flows():
    base_url = "http://localhost:8000/api/v1"
    
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
            ]
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
        }
    ]
    
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
    
    print("Creating optimization models...")
    for model in models:
        try:
            response = requests.post(f"{base_url}/optimization/", json=model)
            if response.status_code == 201:
                print(f"Created model: {model['name']}")
            else:
                print(f"Failed to create model {model['name']}: {response.text}")
        except Exception as e:
            print(f"Error creating model {model['name']}: {e}")
    
    print("\nCreating decision flows...")
    for flow in flows:
        try:
            response = requests.post(f"{base_url}/flows/", json=flow)
            if response.status_code == 201:
                print(f"Created flow: {flow['name']}")
            else:
                print(f"Failed to create flow {flow['name']}: {response.text}")
        except Exception as e:
            print(f"Error creating flow {flow['name']}: {e}")
    
    print("\nInitialization completed!")

if __name__ == "__main__":
    init_flows()
