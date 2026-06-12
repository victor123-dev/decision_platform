from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database.sqlite_client import get_db
from app.database.sqlite_models import PublishTargetDB, PublishHistoryDB
import logging
import uuid
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Pydantic models ──

class PublishTargetResponse(BaseModel):
    id: str
    endpoint: str
    type: str = "REST API"
    status: str = "stopped"
    deployed_at: Optional[str] = None
    calls_24h: int = 0
    version: Optional[str] = None
    env: str = "development"


class PublishTargetCreate(BaseModel):
    id: Optional[str] = None
    endpoint: str
    type: str = "REST API"
    status: str = "stopped"
    version: Optional[str] = None
    env: str = "development"


class PublishTargetUpdate(BaseModel):
    endpoint: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    deployed_at: Optional[str] = None
    calls_24h: Optional[int] = None
    version: Optional[str] = None
    env: Optional[str] = None


class PublishHistoryResponse(BaseModel):
    id: str
    action: str
    flow: Optional[str] = None
    version: Optional[str] = None
    env: Optional[str] = None
    user: Optional[str] = None
    time: Optional[str] = None
    status: Optional[str] = None


class PublishHistoryCreate(BaseModel):
    id: Optional[str] = None
    action: str
    flow: Optional[str] = None
    version: Optional[str] = None
    env: Optional[str] = None
    user: Optional[str] = None
    time: Optional[str] = None
    status: Optional[str] = None


class ControlAction(BaseModel):
    action: str  # "start" or "stop"


# ── helpers ──

def _target_to_dict(t: PublishTargetDB) -> dict:
    return {
        "id": t.id,
        "endpoint": t.endpoint,
        "type": t.type,
        "status": t.status,
        "deployed_at": t.deployed_at.isoformat() if t.deployed_at else None,
        "calls_24h": t.calls_24h,
        "version": t.version,
        "env": t.env,
    }


def _history_to_dict(h: PublishHistoryDB) -> dict:
    return {
        "id": h.id,
        "action": h.action,
        "flow": h.flow,
        "version": h.version,
        "env": h.env,
        "user": h.user,
        "time": h.time,
        "status": h.status,
    }


# ── Target endpoints ──

@router.get("/targets", response_model=List[PublishTargetResponse])
def list_targets(
    env: Optional[str] = Query(None, description="按环境过滤"),
    db: Session = Depends(get_db),
):
    q = db.query(PublishTargetDB)
    if env:
        q = q.filter(PublishTargetDB.env == env)
    return [_target_to_dict(t) for t in q.all()]


@router.post("/targets", response_model=PublishTargetResponse, status_code=status.HTTP_201_CREATED)
def create_target(body: PublishTargetCreate, db: Session = Depends(get_db)):
    t_id = body.id or str(uuid.uuid4())
    t = PublishTargetDB(
        id=t_id,
        endpoint=body.endpoint,
        type=body.type,
        status=body.status,
        version=body.version,
        env=body.env,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return _target_to_dict(t)


@router.put("/targets/{target_id}", response_model=PublishTargetResponse)
def update_target(target_id: str, body: PublishTargetUpdate, db: Session = Depends(get_db)):
    t = db.query(PublishTargetDB).filter(PublishTargetDB.id == target_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="发布目标不存在")
    update_data = body.dict(exclude_unset=True)
    # Handle deployed_at string -> datetime conversion
    if "deployed_at" in update_data and update_data["deployed_at"] is not None:
        try:
            update_data["deployed_at"] = datetime.fromisoformat(update_data["deployed_at"])
        except (ValueError, TypeError):
            update_data["deployed_at"] = datetime.now()
    for key, val in update_data.items():
        setattr(t, key, val)
    db.commit()
    db.refresh(t)
    return _target_to_dict(t)


@router.post("/targets/{target_id}/control", response_model=PublishTargetResponse)
def control_target(target_id: str, body: ControlAction, db: Session = Depends(get_db)):
    t = db.query(PublishTargetDB).filter(PublishTargetDB.id == target_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="发布目标不存在")
    if body.action == "start":
        t.status = "running"
        t.deployed_at = datetime.now()
    elif body.action == "stop":
        t.status = "stopped"
    else:
        raise HTTPException(status_code=400, detail="无效操作，仅支持 start 或 stop")
    db.commit()
    db.refresh(t)
    return _target_to_dict(t)


# ── History endpoints ──

@router.get("/history", response_model=List[PublishHistoryResponse])
def list_history(db: Session = Depends(get_db)):
    records = db.query(PublishHistoryDB).order_by(PublishHistoryDB.id.desc()).all()
    return [_history_to_dict(h) for h in records]


@router.post("/history", response_model=PublishHistoryResponse, status_code=status.HTTP_201_CREATED)
def create_history(body: PublishHistoryCreate, db: Session = Depends(get_db)):
    h_id = body.id or str(uuid.uuid4())
    h = PublishHistoryDB(
        id=h_id,
        action=body.action,
        flow=body.flow,
        version=body.version,
        env=body.env,
        user=body.user,
        time=body.time,
        status=body.status,
    )
    db.add(h)
    db.commit()
    db.refresh(h)
    return _history_to_dict(h)
