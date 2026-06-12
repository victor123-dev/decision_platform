import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_databases, get_db
from app.database.sqlite_models import RuleSet, Rule, GlobalVariable, ExecutionRecord
from datetime import datetime

def init_sample_data():
    db = next(get_db())
    
    rule_sets = [
        {
            "id": "rs-001",
            "name": "个人信用评分规则",
            "description": "基于个人征信数据计算信用评分",
            "version": "v2.3",
            "creator": "张工",
            "rules": [
                {"id": "r-001", "name": "年龄校验", "condition": "${age} >= 18 && ${age} <= 65", "then_action": "score = 10", "else_action": "score = 0", "enabled": True, "priority": 1},
                {"id": "r-002", "name": "收入评估", "condition": "${monthly_income} > 8000", "then_action": "score = score + 20", "else_action": "score = score + 5", "enabled": True, "priority": 2},
                {"id": "r-003", "name": "负债率检查", "condition": "${debt_ratio} < 0.4", "then_action": "score = score + 15", "else_action": "score = score - 10", "enabled": True, "priority": 3},
                {"id": "r-004", "name": "征信查询次数", "condition": "${credit_inquiries_30d} < 5", "then_action": "score = score + 10", "else_action": "score = score - 5", "enabled": True, "priority": 4},
                {"id": "r-005", "name": "历史逾期记录", "condition": "${overdue_count_12m} == 0", "then_action": "score = score + 25", "else_action": "score = score - 15", "enabled": True, "priority": 5},
                {"id": "r-006", "name": "工作稳定性", "condition": "${employment_years} >= 2", "then_action": "score = score + 10", "else_action": "score = score + 0", "enabled": True, "priority": 6},
                {"id": "r-007", "name": "房产加分", "condition": "${has_property} == true", "then_action": "score = score + 10", "else_action": "", "enabled": False, "priority": 7},
                {"id": "r-008", "name": "最终评级", "condition": "${score} >= 80", "then_action": 'level = "A"', "else_action": '${score} >= 60 ? level = "B" : level = "C"', "enabled": True, "priority": 8},
            ]
        },
        {
            "id": "rs-002",
            "name": "反欺诈交易规则",
            "description": "识别可疑交易并触发风控动作",
            "version": "v1.8",
            "creator": "李工",
            "rules": [
                {"id": "r-101", "name": "大额交易预警", "condition": "${transaction_amount} > 50000", "then_action": 'risk_level = "high"', "else_action": "", "enabled": True, "priority": 1},
                {"id": "r-102", "name": "短时间频繁交易", "condition": "${transactions_1h} > 10", "then_action": 'risk_level = "high"', "else_action": "", "enabled": True, "priority": 2},
                {"id": "r-103", "name": "异地交易检查", "condition": "${ip_city} != ${registered_city}", "then_action": 'risk_level = "medium"', "else_action": "", "enabled": True, "priority": 3},
                {"id": "r-104", "name": "夜间交易", "condition": "${hour} >= 23 || ${hour} <= 5", "then_action": "risk_score = risk_score + 20", "else_action": "", "enabled": True, "priority": 4},
                {"id": "r-105", "name": "黑名单匹配", "condition": "${merchant_id} in blacklist", "then_action": 'action = "block"', "else_action": "", "enabled": True, "priority": 5},
            ]
        },
        {
            "id": "rs-003",
            "name": "订单自动审核规则",
            "description": "自动审批符合条件的采购订单",
            "version": "v1.2",
            "creator": "王工",
            "rules": [
                {"id": "r-201", "name": "小额自动审批", "condition": "${order_amount} < 5000", "then_action": "auto_approve = true", "else_action": "", "enabled": True, "priority": 1},
                {"id": "r-202", "name": "优选供应商放行", "condition": '${supplier_tier} == "gold"', "then_action": "auto_approve = true", "else_action": "", "enabled": True, "priority": 2},
                {"id": "r-203", "name": "预算检查", "condition": "${order_amount} <= ${remaining_budget}", "then_action": "budget_ok = true", "else_action": "budget_ok = false", "enabled": True, "priority": 3},
                {"id": "r-204", "name": "重复订单检测", "condition": "${duplicate_orders_7d} > 0", "then_action": 'flag = "duplicate"', "else_action": "", "enabled": True, "priority": 4},
            ]
        },
    ]
    
    global_variables = [
        {"id": "v-001", "name": "max_loan_amount", "data_type": "number", "default_value": "500000", "scope": "global", "description": "单笔贷款最大额度"},
        {"id": "v-002", "name": "risk_threshold", "data_type": "number", "default_value": "0.6", "scope": "global", "description": "风险评分阈值"},
        {"id": "v-003", "name": "auto_approve_limit", "data_type": "number", "default_value": "50000", "scope": "global", "description": "自动审批金额上限"},
        {"id": "v-004", "name": "blacklist_version", "data_type": "string", "default_value": "v2026.06", "scope": "global", "description": "黑名单数据版本"},
        {"id": "v-005", "name": "enable_fraud_model", "data_type": "boolean", "default_value": "true", "scope": "global", "description": "是否启用反欺诈模型"},
        {"id": "v-006", "name": "credit_score_weight", "data_type": "number", "default_value": "0.4", "scope": "flow", "description": "规则评分权重"},
        {"id": "v-007", "name": "model_score_weight", "data_type": "number", "default_value": "0.6", "scope": "flow", "description": "模型评分权重"},
        {"id": "v-008", "name": "review_required", "data_type": "boolean", "default_value": "false", "scope": "session", "description": "是否需要人工复核"},
        {"id": "v-009", "name": "order_timeout_hours", "data_type": "number", "default_value": "48", "scope": "flow", "description": "订单审批超时时间(小时)"},
        {"id": "v-010", "name": "notification_email", "data_type": "string", "default_value": "risk-team@optdev.com", "scope": "global", "description": "风控团队通知邮箱"},
    ]
    
    for rs_data in rule_sets:
        existing = db.query(RuleSet).filter(RuleSet.id == rs_data["id"]).first()
        if not existing:
            rs = RuleSet(
                id=rs_data["id"],
                name=rs_data["name"],
                description=rs_data["description"],
                version=rs_data["version"],
                creator=rs_data["creator"],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            db.add(rs)
            db.commit()
            
            for rule_data in rs_data["rules"]:
                rule = Rule(
                    id=rule_data["id"],
                    rule_set_id=rs_data["id"],
                    name=rule_data["name"],
                    condition=rule_data["condition"],
                    then_action=rule_data["then_action"],
                    else_action=rule_data["else_action"],
                    enabled=rule_data["enabled"],
                    priority=rule_data["priority"]
                )
                db.add(rule)
            db.commit()
            print(f"Created rule set: {rs_data['name']}")
        else:
            print(f"Rule set already exists: {rs_data['name']}")
    
    for var_data in global_variables:
        existing = db.query(GlobalVariable).filter(GlobalVariable.id == var_data["id"]).first()
        if not existing:
            var = GlobalVariable(
                id=var_data["id"],
                name=var_data["name"],
                data_type=var_data["data_type"],
                default_value=var_data["default_value"],
                scope=var_data["scope"],
                description=var_data["description"],
                updated_at=datetime.now()
            )
            db.add(var)
            db.commit()
            print(f"Created global variable: {var_data['name']}")
        else:
            print(f"Global variable already exists: {var_data['name']}")

if __name__ == "__main__":
    print("Initializing databases...")
    init_databases()
    print("Initializing sample data...")
    init_sample_data()
    print("Database initialization completed.")
