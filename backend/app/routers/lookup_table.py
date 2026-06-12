from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any
from app.database.sqlite_client import get_db, Base, engine
from app.database.sqlite_models import LookupTableDB
import json
import logging
import uuid
from datetime import datetime

# 确保表存在
Base.metadata.create_all(bind=engine, tables=[LookupTableDB.__table__])

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Pydantic models ──

class LookupTableColumn(BaseModel):
    name: str
    type: str = "string"


class LookupTableResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    columns: List[LookupTableColumn] = []
    rows: List[List[Any]] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class LookupTableCreate(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    columns: List[LookupTableColumn] = []
    rows: List[List[Any]] = []


class LookupTableUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    columns: Optional[List[LookupTableColumn]] = None
    rows: Optional[List[List[Any]]] = None


# ── helpers ──

def _lt_to_dict(lt: LookupTableDB) -> dict:
    columns = json.loads(lt.columns_def) if lt.columns_def else []
    rows = json.loads(lt.rows_data) if lt.rows_data else []
    return {
        "id": lt.id,
        "name": lt.name,
        "description": lt.description,
        "columns": columns,
        "rows": rows,
        "created_at": lt.created_at.isoformat() if lt.created_at else None,
        "updated_at": lt.updated_at.isoformat() if lt.updated_at else None,
    }


# ── endpoints ──

@router.get("/", response_model=List[LookupTableResponse])
def list_lookup_tables(db: Session = Depends(get_db)):
    items = db.query(LookupTableDB).order_by(LookupTableDB.created_at.desc()).all()
    return [_lt_to_dict(i) for i in items]


@router.get("/{item_id}", response_model=LookupTableResponse)
def get_lookup_table(item_id: str, db: Session = Depends(get_db)):
    lt = db.query(LookupTableDB).filter(LookupTableDB.id == item_id).first()
    if not lt:
        raise HTTPException(status_code=404, detail="查找表不存在")
    return _lt_to_dict(lt)


@router.post("/", response_model=LookupTableResponse, status_code=status.HTTP_201_CREATED)
def create_lookup_table(body: LookupTableCreate, db: Session = Depends(get_db)):
    lt_id = body.id or str(uuid.uuid4())
    lt = LookupTableDB(
        id=lt_id,
        name=body.name,
        description=body.description,
        columns_def=json.dumps([c.dict() for c in body.columns], ensure_ascii=False),
        rows_data=json.dumps(body.rows, ensure_ascii=False),
    )
    db.add(lt)
    db.commit()
    db.refresh(lt)
    return _lt_to_dict(lt)


@router.put("/{item_id}", response_model=LookupTableResponse)
def update_lookup_table(item_id: str, body: LookupTableUpdate, db: Session = Depends(get_db)):
    lt = db.query(LookupTableDB).filter(LookupTableDB.id == item_id).first()
    if not lt:
        raise HTTPException(status_code=404, detail="查找表不存在")
    if body.name is not None:
        lt.name = body.name
    if body.description is not None:
        lt.description = body.description
    if body.columns is not None:
        lt.columns_def = json.dumps([c.dict() for c in body.columns], ensure_ascii=False)
    if body.rows is not None:
        lt.rows_data = json.dumps(body.rows, ensure_ascii=False)
    lt.updated_at = datetime.now()
    db.commit()
    db.refresh(lt)
    return _lt_to_dict(lt)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lookup_table(item_id: str, db: Session = Depends(get_db)):
    lt = db.query(LookupTableDB).filter(LookupTableDB.id == item_id).first()
    if not lt:
        raise HTTPException(status_code=404, detail="查找表不存在")
    db.delete(lt)
    db.commit()
