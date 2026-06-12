from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database.sqlite_client import get_db
from app.database.sqlite_models import GlobalVariable
import logging
import uuid
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Pydantic models ──

class GlobalVariableResponse(BaseModel):
    id: str
    name: str
    data_type: str
    default_value: Optional[str] = None
    scope: str = "global"
    description: Optional[str] = None
    updated_at: Optional[str] = None


class GlobalVariableCreate(BaseModel):
    id: Optional[str] = None
    name: str
    data_type: str
    default_value: Optional[str] = None
    scope: str = "global"
    description: Optional[str] = None


class GlobalVariableUpdate(BaseModel):
    name: Optional[str] = None
    data_type: Optional[str] = None
    default_value: Optional[str] = None
    scope: Optional[str] = None
    description: Optional[str] = None


# ── helpers ──

def _gv_to_dict(gv: GlobalVariable) -> dict:
    return {
        "id": gv.id,
        "name": gv.name,
        "data_type": gv.data_type,
        "default_value": gv.default_value,
        "scope": gv.scope,
        "description": gv.description,
        "updated_at": gv.updated_at.isoformat() if gv.updated_at else None,
    }


# ── endpoints ──

@router.get("/", response_model=List[GlobalVariableResponse])
def list_variables(
    scope: Optional[str] = Query(None, description="按scope过滤"),
    db: Session = Depends(get_db),
):
    q = db.query(GlobalVariable)
    if scope:
        q = q.filter(GlobalVariable.scope == scope)
    return [_gv_to_dict(gv) for gv in q.order_by(GlobalVariable.updated_at.desc()).all()]


@router.post("/", response_model=GlobalVariableResponse, status_code=status.HTTP_201_CREATED)
def create_variable(body: GlobalVariableCreate, db: Session = Depends(get_db)):
    gv_id = body.id or str(uuid.uuid4())
    gv = GlobalVariable(
        id=gv_id,
        name=body.name,
        data_type=body.data_type,
        default_value=body.default_value,
        scope=body.scope,
        description=body.description,
    )
    db.add(gv)
    db.commit()
    db.refresh(gv)
    return _gv_to_dict(gv)


@router.put("/{variable_id}", response_model=GlobalVariableResponse)
def update_variable(variable_id: str, body: GlobalVariableUpdate, db: Session = Depends(get_db)):
    gv = db.query(GlobalVariable).filter(GlobalVariable.id == variable_id).first()
    if not gv:
        raise HTTPException(status_code=404, detail="全局变量不存在")
    for key, val in body.dict(exclude_unset=True).items():
        setattr(gv, key, val)
    gv.updated_at = datetime.now()
    db.commit()
    db.refresh(gv)
    return _gv_to_dict(gv)


@router.delete("/{variable_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_variable(variable_id: str, db: Session = Depends(get_db)):
    gv = db.query(GlobalVariable).filter(GlobalVariable.id == variable_id).first()
    if not gv:
        raise HTTPException(status_code=404, detail="全局变量不存在")
    db.delete(gv)
    db.commit()
