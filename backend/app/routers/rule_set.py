from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database.sqlite_client import get_db
from app.database.sqlite_models import RuleSet, Rule
import logging
import uuid
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Pydantic models ──

class RuleResponse(BaseModel):
    id: str
    rule_set_id: str
    name: str
    condition: Optional[str] = None
    then_action: Optional[str] = None
    else_action: Optional[str] = None
    enabled: bool = True
    priority: int = 1


class RuleSetResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    status: str = "active"
    version: str = "v1.0"
    creator: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    rules: List[RuleResponse] = []


class RuleSetCreate(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    status: str = "active"
    version: str = "v1.0"
    creator: Optional[str] = None


class RuleSetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    version: Optional[str] = None
    creator: Optional[str] = None


class RuleCreate(BaseModel):
    id: Optional[str] = None
    name: str
    condition: Optional[str] = None
    then_action: Optional[str] = None
    else_action: Optional[str] = None
    enabled: bool = True
    priority: int = 1


class RuleUpdate(BaseModel):
    name: Optional[str] = None
    condition: Optional[str] = None
    then_action: Optional[str] = None
    else_action: Optional[str] = None
    enabled: Optional[bool] = None
    priority: Optional[int] = None


# ── helpers ──

def _rs_to_dict(rs: RuleSet) -> dict:
    return {
        "id": rs.id,
        "name": rs.name,
        "description": rs.description,
        "status": rs.status,
        "version": rs.version,
        "creator": rs.creator,
        "created_at": rs.created_at.isoformat() if rs.created_at else None,
        "updated_at": rs.updated_at.isoformat() if rs.updated_at else None,
        "rules": [_rule_to_dict(r) for r in (rs.rules or [])],
    }


def _rule_to_dict(r: Rule) -> dict:
    return {
        "id": r.id,
        "rule_set_id": r.rule_set_id,
        "name": r.name,
        "condition": r.condition,
        "then_action": r.then_action,
        "else_action": r.else_action,
        "enabled": r.enabled,
        "priority": r.priority,
    }


# ── RuleSet endpoints ──

@router.get("/", response_model=List[RuleSetResponse])
def list_rulesets(
    search: Optional[str] = Query(None, description="按名称搜索"),
    status_filter: Optional[str] = Query(None, alias="status", description="按状态过滤"),
    db: Session = Depends(get_db),
):
    q = db.query(RuleSet)
    if search:
        q = q.filter(RuleSet.name.contains(search))
    if status_filter:
        q = q.filter(RuleSet.status == status_filter)
    return [_rs_to_dict(rs) for rs in q.order_by(RuleSet.created_at.desc()).all()]


@router.get("/{ruleset_id}", response_model=RuleSetResponse)
def get_ruleset(ruleset_id: str, db: Session = Depends(get_db)):
    rs = db.query(RuleSet).filter(RuleSet.id == ruleset_id).first()
    if not rs:
        raise HTTPException(status_code=404, detail="规则集不存在")
    return _rs_to_dict(rs)


@router.post("/", response_model=RuleSetResponse, status_code=status.HTTP_201_CREATED)
def create_ruleset(body: RuleSetCreate, db: Session = Depends(get_db)):
    rs_id = body.id or str(uuid.uuid4())
    rs = RuleSet(
        id=rs_id,
        name=body.name,
        description=body.description,
        status=body.status,
        version=body.version,
        creator=body.creator,
    )
    db.add(rs)
    db.commit()
    db.refresh(rs)
    return _rs_to_dict(rs)


@router.put("/{ruleset_id}", response_model=RuleSetResponse)
def update_ruleset(ruleset_id: str, body: RuleSetUpdate, db: Session = Depends(get_db)):
    rs = db.query(RuleSet).filter(RuleSet.id == ruleset_id).first()
    if not rs:
        raise HTTPException(status_code=404, detail="规则集不存在")
    for key, val in body.dict(exclude_unset=True).items():
        setattr(rs, key, val)
    rs.updated_at = datetime.now()
    db.commit()
    db.refresh(rs)
    return _rs_to_dict(rs)


@router.delete("/{ruleset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ruleset(ruleset_id: str, db: Session = Depends(get_db)):
    rs = db.query(RuleSet).filter(RuleSet.id == ruleset_id).first()
    if not rs:
        raise HTTPException(status_code=404, detail="规则集不存在")
    # 删除关联规则
    db.query(Rule).filter(Rule.rule_set_id == ruleset_id).delete()
    db.delete(rs)
    db.commit()


# ── Rule endpoints ──

@router.post("/{ruleset_id}/rules", response_model=RuleResponse, status_code=status.HTTP_201_CREATED)
def add_rule(ruleset_id: str, body: RuleCreate, db: Session = Depends(get_db)):
    rs = db.query(RuleSet).filter(RuleSet.id == ruleset_id).first()
    if not rs:
        raise HTTPException(status_code=404, detail="规则集不存在")
    rule_id = body.id or str(uuid.uuid4())
    rule = Rule(
        id=rule_id,
        rule_set_id=ruleset_id,
        name=body.name,
        condition=body.condition,
        then_action=body.then_action,
        else_action=body.else_action,
        enabled=body.enabled,
        priority=body.priority,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return _rule_to_dict(rule)


@router.put("/{ruleset_id}/rules/{rule_id}", response_model=RuleResponse)
def update_rule(ruleset_id: str, rule_id: str, body: RuleUpdate, db: Session = Depends(get_db)):
    rule = db.query(Rule).filter(Rule.id == rule_id, Rule.rule_set_id == ruleset_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="规则不存在")
    for key, val in body.dict(exclude_unset=True).items():
        setattr(rule, key, val)
    db.commit()
    db.refresh(rule)
    return _rule_to_dict(rule)


@router.delete("/{ruleset_id}/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rule(ruleset_id: str, rule_id: str, db: Session = Depends(get_db)):
    rule = db.query(Rule).filter(Rule.id == rule_id, Rule.rule_set_id == ruleset_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="规则不存在")
    db.delete(rule)
    db.commit()
