from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database.sqlite_client import get_db
from app.database.sqlite_models import CodeFileDB
import logging
import uuid
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Pydantic models ──

class CodeFileResponse(BaseModel):
    id: str
    name: str
    language: Optional[str] = None
    size: Optional[str] = None
    description: Optional[str] = None
    lines: Optional[int] = None
    code: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class CodeFileCreate(BaseModel):
    id: Optional[str] = None
    name: str
    language: Optional[str] = None
    size: Optional[str] = None
    description: Optional[str] = None
    lines: Optional[int] = None
    code: Optional[str] = None


class CodeFileUpdate(BaseModel):
    name: Optional[str] = None
    language: Optional[str] = None
    size: Optional[str] = None
    description: Optional[str] = None
    lines: Optional[int] = None
    code: Optional[str] = None


# ── helpers ──

def _code_file_to_dict(cf: CodeFileDB, include_code: bool = False) -> dict:
    result = {
        "id": cf.id,
        "name": cf.name,
        "language": cf.language,
        "size": cf.size,
        "description": cf.description,
        "lines": cf.lines,
        "created_at": cf.created_at.isoformat() if cf.created_at else None,
        "updated_at": cf.updated_at.isoformat() if cf.updated_at else None,
    }
    if include_code:
        result["code"] = cf.code
    else:
        result["code"] = None
    return result


# ── endpoints ──

@router.get("/", response_model=List[CodeFileResponse])
def list_code_files(
    search: Optional[str] = Query(None, description="按名称搜索"),
    language: Optional[str] = Query(None, description="按语言过滤"),
    db: Session = Depends(get_db),
):
    q = db.query(CodeFileDB)
    if search:
        q = q.filter(CodeFileDB.name.contains(search))
    if language:
        q = q.filter(CodeFileDB.language == language)
    return [_code_file_to_dict(cf, include_code=False) for cf in q.order_by(CodeFileDB.created_at.desc()).all()]


@router.get("/{code_file_id}", response_model=CodeFileResponse)
def get_code_file(code_file_id: str, db: Session = Depends(get_db)):
    cf = db.query(CodeFileDB).filter(CodeFileDB.id == code_file_id).first()
    if not cf:
        raise HTTPException(status_code=404, detail="代码文件不存在")
    return _code_file_to_dict(cf, include_code=True)


@router.post("/", response_model=CodeFileResponse, status_code=status.HTTP_201_CREATED)
def create_code_file(body: CodeFileCreate, db: Session = Depends(get_db)):
    cf_id = body.id or str(uuid.uuid4())
    cf = CodeFileDB(
        id=cf_id,
        name=body.name,
        language=body.language,
        size=body.size,
        description=body.description,
        lines=body.lines,
        code=body.code,
    )
    db.add(cf)
    db.commit()
    db.refresh(cf)
    return _code_file_to_dict(cf, include_code=True)


@router.put("/{code_file_id}", response_model=CodeFileResponse)
def update_code_file(code_file_id: str, body: CodeFileUpdate, db: Session = Depends(get_db)):
    cf = db.query(CodeFileDB).filter(CodeFileDB.id == code_file_id).first()
    if not cf:
        raise HTTPException(status_code=404, detail="代码文件不存在")
    for key, val in body.dict(exclude_unset=True).items():
        setattr(cf, key, val)
    cf.updated_at = datetime.now()
    db.commit()
    db.refresh(cf)
    return _code_file_to_dict(cf, include_code=True)


@router.delete("/{code_file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_code_file(code_file_id: str, db: Session = Depends(get_db)):
    cf = db.query(CodeFileDB).filter(CodeFileDB.id == code_file_id).first()
    if not cf:
        raise HTTPException(status_code=404, detail="代码文件不存在")
    db.delete(cf)
    db.commit()
