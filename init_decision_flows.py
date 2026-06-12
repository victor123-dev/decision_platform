import sys
import os

# Change to backend directory so the database path is correct
os.chdir('/Users/shijinxin/qoderwork/20260605_area_decision_v1.0.0/backend')
sys.path.insert(0, '/Users/shijinxin/qoderwork/20260605_area_decision_v1.0.0/backend')

from app.database.sqlite_client import SessionLocal, engine
from app.database.sqlite_models import DecisionFlowDB
from app.database import sqlite_models
import json
from datetime import datetime

# Create tables if they don't exist
sqlite_models.Base.metadata.create_all(bind=engine)

# Mock decision flows data
decision_flows = [
    {
        "id": "flow-001",
        "name": "信用评分决策流",
        "description": "完整的个人信贷信用评分流程，包含数据获取、规则评估、模型预测和结果输出",
        "nodeCount": 10,
        "tags": ["信贷", "风控"],
        "updatedAt": "2026-06-02 14:20",
        "checkedOutBy": None,
        "status": "active",
        "nodes": [
            {"id": "n1", "type": "interface", "position": {"x": 50, "y": 200}, "data": {"label": "开始", "config": {}}},
            {"id": "n2", "type": "data_view", "position": {"x": 250, "y": 200}, "data": {"label": "获取征信数据", "config": {"url": "/api/credit/report", "method": "GET"}}},
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
            {"id": "e8", "source": "n7", "target": "n8", "sourceHandle": "yes", "label": "通过"},
            {"id": "e9", "source": "n7", "target": "n9", "sourceHandle": "no", "label": "拒绝"},
            {"id": "e10", "source": "n8", "target": "n10"},
            {"id": "e11", "source": "n9", "target": "n10"},
        ],
    },
    {
        "id": "flow-002",
        "name": "反欺诈交易监控流",
        "description": "实时交易风控流程，支持规则+模型双重校验",
        "nodeCount": 7,
        "tags": ["风控", "反欺诈"],
        "updatedAt": "2026-06-01 09:30",
        "checkedOutBy": None,
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
            {"id": "e3", "source": "n3", "target": "n4", "sourceHandle": "yes", "label": "高风险"},
            {"id": "e4", "source": "n3", "target": "n5", "sourceHandle": "no", "label": "正常"},
            {"id": "e5", "source": "n4", "target": "n6"},
            {"id": "e6", "source": "n5", "target": "n7"},
            {"id": "e7", "source": "n6", "target": "n7"},
        ],
    },
    {
        "id": "flow-003",
        "name": "自动订单审核流",
        "description": "采购订单自动审批与人工复核流程",
        "nodeCount": 6,
        "tags": ["供应链", "订单"],
        "updatedAt": "2026-05-28 11:00",
        "checkedOutBy": None,
        "status": "draft",
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
            {"id": "e3", "source": "n3", "target": "n4", "sourceHandle": "yes", "label": "自动"},
            {"id": "e4", "source": "n3", "target": "n5", "sourceHandle": "no", "label": "人工"},
            {"id": "e5", "source": "n4", "target": "n6"},
            {"id": "e6", "source": "n5", "target": "n6"},
        ],
    },
    {
        "id": "flow-004",
        "name": "库存智能补货流",
        "description": "基于库存水位的自动补货决策",
        "nodeCount": 5,
        "tags": ["供应链", "库存"],
        "updatedAt": "2026-05-25 15:30",
        "checkedOutBy": None,
        "status": "active",
        "nodes": [],
        "edges": [],
    },
]

db = SessionLocal()
try:
    # Clear existing flows
    db.query(DecisionFlowDB).delete()
    
    # Insert flows
    for flow in decision_flows:
        now = datetime.now()
        db_flow = DecisionFlowDB(
            id=flow["id"],
            name=flow["name"],
            description=flow["description"],
            status=flow["status"],
            tags=json.dumps(flow["tags"]),
            nodes=json.dumps(flow["nodes"]),
            edges=json.dumps(flow["edges"]),
            node_count=flow["nodeCount"],
            created_at=now,
            updated_at=now,
        )
        db.add(db_flow)
        print(f"✅ 导入决策流程: {flow['name']}")
    
    db.commit()
    print("\n=== 导入完成 ===")
    print(f"共导入 {len(decision_flows)} 个决策流程")
finally:
    db.close()