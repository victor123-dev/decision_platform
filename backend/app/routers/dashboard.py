from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import Optional
from app.database.sqlite_client import get_db
from app.database.sqlite_models import ExecutionRecord, RuleSet, DecisionFlowDB
import logging
import json
from datetime import datetime, timedelta

router = APIRouter()
logger = logging.getLogger(__name__)


# ── KPIs ──

@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    try:
        total_executions = db.query(func.count(ExecutionRecord.id)).scalar() or 0
        success_count = db.query(func.count(ExecutionRecord.id)).filter(
            ExecutionRecord.status == "success"
        ).scalar() or 0
        success_rate = round(success_count / total_executions * 100, 1) if total_executions > 0 else 0.0

        active_rulesets = db.query(func.count(RuleSet.id)).filter(
            RuleSet.status == "active"
        ).scalar() or 0

        online_flows = db.query(func.count(DecisionFlowDB.id)).filter(
            DecisionFlowDB.status == "online"
        ).scalar() or 0
    except Exception as e:
        logger.warning(f"KPI查询异常: {e}")
        total_executions, success_rate, active_rulesets, online_flows = 0, 0.0, 0, 0

    return {
        "total_executions": total_executions,
        "success_rate": success_rate,
        "active_rulesets": active_rulesets,
        "online_flows": online_flows,
    }


# ── Execution Trend (last 7 days) ──

@router.get("/execution-trend")
def get_execution_trend(db: Session = Depends(get_db)):
    try:
        seven_days_ago = datetime.now() - timedelta(days=7)
        rows = db.query(
            func.date(ExecutionRecord.created_at).label("date"),
            func.count(ExecutionRecord.id).label("count"),
        ).filter(
            ExecutionRecord.created_at >= seven_days_ago
        ).group_by(
            func.date(ExecutionRecord.created_at)
        ).order_by(
            text("date ASC")
        ).all()

        trend = []
        for r in rows:
            date_str = str(r.date) if r.date else ""
            trend.append({"date": date_str, "count": r.count})

        # Fill missing days with zero
        date_counts = {item["date"]: item["count"] for item in trend}
        filled = []
        for i in range(7):
            d = (datetime.now() - timedelta(days=6 - i)).strftime("%Y-%m-%d")
            filled.append({"date": d, "count": date_counts.get(d, 0)})
    except Exception as e:
        logger.warning(f"执行趋势查询异常: {e}")
        filled = []

    return filled


# ── Rule Hit Rate ──

@router.get("/rule-hit-rate")
def get_rule_hit_rate(db: Session = Depends(get_db)):
    hit = 0
    miss = 0
    error = 0
    try:
        records = db.query(ExecutionRecord).filter(
            ExecutionRecord.output_data.isnot(None)
        ).all()

        for rec in records:
            try:
                output = json.loads(rec.output_data) if rec.output_data else {}
                trace = output.get("trace", [])
                for step in trace:
                    step_type = step.get("type", "")
                    if step_type == "rule_hit":
                        hit += 1
                    elif step_type == "rule_miss":
                        miss += 1
                    elif step_type == "exception":
                        error += 1
            except (json.JSONDecodeError, AttributeError, TypeError):
                continue
    except Exception as e:
        logger.warning(f"规则命中率查询异常: {e}")

    total = hit + miss + error
    return {
        "hit": hit,
        "miss": miss,
        "error": error,
        "total": total,
        "hit_rate": round(hit / total * 100, 1) if total > 0 else 0.0,
    }


# ── Top Flows ──

@router.get("/top-flows")
def get_top_flows(db: Session = Depends(get_db)):
    try:
        rows = db.query(
            ExecutionRecord.flow_id,
            ExecutionRecord.flow_name,
            func.count(ExecutionRecord.id).label("count"),
        ).group_by(
            ExecutionRecord.flow_id, ExecutionRecord.flow_name
        ).order_by(
            text("count DESC")
        ).limit(5).all()

        top = [
            {"flow_id": r.flow_id, "flow_name": r.flow_name or r.flow_id, "count": r.count}
            for r in rows
        ]
    except Exception as e:
        logger.warning(f"Top流程查询异常: {e}")
        top = []

    return top


# ── Recent Executions ──

@router.get("/recent-executions")
def get_recent_executions(db: Session = Depends(get_db)):
    try:
        records = db.query(ExecutionRecord).order_by(
            ExecutionRecord.created_at.desc()
        ).limit(8).all()

        result = []
        for rec in records:
            result.append({
                "id": rec.id,
                "flow_id": rec.flow_id,
                "flow_name": rec.flow_name,
                "status": rec.status,
                "duration": rec.duration,
                "created_at": rec.created_at.isoformat() if rec.created_at else None,
            })
    except Exception as e:
        logger.warning(f"最近执行记录查询异常: {e}")
        result = []

    return result
