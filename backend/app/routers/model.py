from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any
from app.database.sqlite_client import get_db
from app.database.sqlite_models import AIModelDB
import logging
import uuid
import json
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Pydantic models ──

class ModelResponse(BaseModel):
    id: str
    name: str
    format: Optional[str] = None
    version: Optional[str] = None
    accuracy: Optional[float] = None
    recall: Optional[float] = None
    f1: Optional[float] = None
    status: str = "draft"
    description: Optional[str] = None
    inputs: Optional[Any] = None
    outputs: Optional[Any] = None
    versions: Optional[Any] = None
    sparkline: Optional[Any] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ModelCreate(BaseModel):
    id: Optional[str] = None
    name: str
    format: Optional[str] = None
    version: Optional[str] = None
    accuracy: Optional[float] = None
    recall: Optional[float] = None
    f1: Optional[float] = None
    status: str = "draft"
    description: Optional[str] = None
    inputs: Optional[Any] = None
    outputs: Optional[Any] = None
    versions: Optional[Any] = None
    sparkline: Optional[Any] = None


class ModelUpdate(BaseModel):
    name: Optional[str] = None
    format: Optional[str] = None
    version: Optional[str] = None
    accuracy: Optional[float] = None
    recall: Optional[float] = None
    f1: Optional[float] = None
    status: Optional[str] = None
    description: Optional[str] = None
    inputs: Optional[Any] = None
    outputs: Optional[Any] = None
    versions: Optional[Any] = None
    sparkline: Optional[Any] = None


# ── helpers ──

def _model_to_dict(m: AIModelDB) -> dict:
    return {
        "id": m.id,
        "name": m.name,
        "format": m.format,
        "version": m.version,
        "accuracy": m.accuracy,
        "recall": m.recall,
        "f1": m.f1,
        "status": m.status,
        "description": m.description,
        "inputs": json.loads(m.inputs) if m.inputs else None,
        "outputs": json.loads(m.outputs) if m.outputs else None,
        "versions": json.loads(m.versions) if m.versions else None,
        "sparkline": json.loads(m.sparkline) if m.sparkline else None,
        "created_at": m.created_at.isoformat() if m.created_at else None,
        "updated_at": m.updated_at.isoformat() if m.updated_at else None,
    }


# ── endpoints ──

@router.get("/", response_model=List[ModelResponse])
def list_models(
    search: Optional[str] = Query(None, description="按名称搜索"),
    status_filter: Optional[str] = Query(None, alias="status", description="按状态过滤"),
    db: Session = Depends(get_db),
):
    q = db.query(AIModelDB)
    if search:
        q = q.filter(AIModelDB.name.contains(search))
    if status_filter:
        q = q.filter(AIModelDB.status == status_filter)
    return [_model_to_dict(m) for m in q.order_by(AIModelDB.created_at.desc()).all()]


@router.get("/{model_id}", response_model=ModelResponse)
def get_model(model_id: str, db: Session = Depends(get_db)):
    m = db.query(AIModelDB).filter(AIModelDB.id == model_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="AI模型不存在")
    return _model_to_dict(m)


@router.post("/", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
def create_model(body: ModelCreate, db: Session = Depends(get_db)):
    m_id = body.id or str(uuid.uuid4())
    m = AIModelDB(
        id=m_id,
        name=body.name,
        format=body.format,
        version=body.version,
        accuracy=body.accuracy,
        recall=body.recall,
        f1=body.f1,
        status=body.status,
        description=body.description,
        inputs=json.dumps(body.inputs) if body.inputs is not None else None,
        outputs=json.dumps(body.outputs) if body.outputs is not None else None,
        versions=json.dumps(body.versions) if body.versions is not None else None,
        sparkline=json.dumps(body.sparkline) if body.sparkline is not None else None,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return _model_to_dict(m)


@router.put("/{model_id}", response_model=ModelResponse)
def update_model(model_id: str, body: ModelUpdate, db: Session = Depends(get_db)):
    m = db.query(AIModelDB).filter(AIModelDB.id == model_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="AI模型不存在")
    update_data = body.dict(exclude_unset=True)
    # JSON fields need serialization
    for json_field in ("inputs", "outputs", "versions", "sparkline"):
        if json_field in update_data and update_data[json_field] is not None:
            update_data[json_field] = json.dumps(update_data[json_field])
    for key, val in update_data.items():
        setattr(m, key, val)
    m.updated_at = datetime.now()
    db.commit()
    db.refresh(m)
    return _model_to_dict(m)


@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_model(model_id: str, db: Session = Depends(get_db)):
    m = db.query(AIModelDB).filter(AIModelDB.id == model_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="AI模型不存在")
    db.delete(m)
    db.commit()
