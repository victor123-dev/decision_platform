"""
本体-模型映射集 CRUD API

使用 MongoDB 存储决策变量集和约束条件集（JSON文档型数据）
集合：
  - decision_variable_sets: 决策变量集
  - constraint_template_sets: 约束条件模板集
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
import uuid

from app.database.mongodb_client import mongodb_client

logger = logging.getLogger(__name__)

router = APIRouter()

# ─────────────────────────────────────────────────────────────────────────────
# Auto-seed: 集合为空时自动注入预置数据
# ─────────────────────────────────────────────────────────────────────────────
_seeded = {"variable_sets": False, "constraint_sets": False}


def _col_count(col) -> int:
    """获取集合文档数，兼容MongoDB和MemoryCollectionProxy"""
    from app.database.mongodb_client import MemoryCollectionProxy
    if isinstance(col, MemoryCollectionProxy):
        return len(col._data)
    try:
        return col.count_documents({})
    except Exception:
        return len(list(col.find()))


def _ensure_seeded():
    """检查集合是否为空，空则自动注入预置种子数据"""
    if _seeded["variable_sets"] and _seeded["constraint_sets"]:
        return
    try:
        from scripts.init_mapping_presets import PRESET_VARIABLE_SETS, PRESET_CONSTRAINT_SETS
        if not _seeded["variable_sets"]:
            col = _var_sets_col()
            if _col_count(col) == 0:
                for vs in PRESET_VARIABLE_SETS:
                    col.insert_one(vs)
                logger.info(f"Auto-seeded {len(PRESET_VARIABLE_SETS)} decision variable sets")
            _seeded["variable_sets"] = True

        if not _seeded["constraint_sets"]:
            col = _con_sets_col()
            if _col_count(col) == 0:
                for cs in PRESET_CONSTRAINT_SETS:
                    col.insert_one(cs)
                logger.info(f"Auto-seeded {len(PRESET_CONSTRAINT_SETS)} constraint template sets")
            _seeded["constraint_sets"] = True
    except Exception as e:
        logger.warning(f"Auto-seed failed (non-critical): {e}")
        _seeded["variable_sets"] = True
        _seeded["constraint_sets"] = True


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic Models
# ─────────────────────────────────────────────────────────────────────────────

class VariableIndex(BaseModel):
    alias: str = Field(description="索引别名，如 i, j, k")
    setName: Optional[str] = Field(None, description="集合名称")
    objectTypeId: Optional[str] = Field(None, description="本体对象类型ID")
    objectTypeDisplayName: Optional[str] = Field(None, description="本体对象类型显示名")
    businessMeaning: Optional[str] = Field(None, description="索引代表的业务涵义")


class OntologyRef(BaseModel):
    ontologyId: Optional[str] = Field(None, description="本体模型ID")
    objectTypeId: Optional[str] = Field(None, description="对象类型ID")
    propertyId: Optional[str] = Field(None, description="属性ID")


class DirectRef(BaseModel):
    """直引变量：直接引用单个本体属性"""
    objectTypeId: str = Field(description="本体对象类型ID")
    propertyId: str = Field(description="本体属性ID")
    displayName: str = Field("", description="显示路径，如'库存.总数量'")


class IndexMapping(BaseModel):
    """关联变量：索引维度与本体对象的映射关系"""
    alias: str = Field(description="索引别名，如 i, j, k")
    objectTypeId: Optional[str] = Field(None, description="本体对象类型ID")
    propertyId: Optional[str] = Field(None, description="本体属性ID")
    setName: Optional[str] = Field(None, description="集合名称")
    role: Optional[str] = Field(None, description="索引角色说明，如'被分配对象'、'执行资源'")
    businessMeaning: Optional[str] = Field(None, description="索引代表的业务涵义")


class DecisionVariable(BaseModel):
    id: str = Field(default_factory=lambda: f"dv-{uuid.uuid4().hex[:8]}")
    symbol: str = Field(description="变量符号，如 X_工单分配")
    name: str = Field(description="变量中文名称")
    nameEn: Optional[str] = Field(None, description="变量英文名称")
    nature: str = Field("association", description="变量性质: direct_ref|association")
    dimension: str = Field("1D", description="维度: 0D|1D|2D|3D")
    domain: str = Field("continuous", description="变量域: continuous|integer|binary")
    indices: List[VariableIndex] = Field(default_factory=list, description="索引维度")
    ontologyRef: Optional[OntologyRef] = Field(None, description="本体属性引用(单属性)")
    ontologyRefs: List[OntologyRef] = Field(default_factory=list, description="本体属性引用列表")
    directRef: Optional[DirectRef] = Field(None, description="直引变量引用(仅nature=direct_ref)")
    indexMapping: List[IndexMapping] = Field(default_factory=list, description="关联变量索引映射(仅nature=association)")
    lowerBound: Optional[float] = Field(0.0, description="下界")
    upperBound: Optional[float] = Field(None, description="上界")
    businessMeaning: str = Field("", description="业务含义说明")
    valueMeaning: Optional[Dict[str, str]] = Field(None, description="取值含义")
    unit: Optional[str] = Field(None, description="单位")
    valueType: str = Field("number", description="值类型: number|boolean")
    associatedProperties: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="关联变量关联的业务属性(仅nature=association)")


class ConstraintForEach(BaseModel):
    alias: str = Field(description="遍历别名")
    setRef: Optional[str] = Field(None, description="集合引用名")
    objectTypeId: Optional[str] = Field(None, description="本体对象类型ID")


class ConstraintTemplate(BaseModel):
    id: str = Field(default_factory=lambda: f"ct-{uuid.uuid4().hex[:8]}")
    name: str = Field(description="约束名称")
    description: str = Field("", description="约束描述")
    category: str = Field("custom", description="分类: assignment|capacity|precedence|mutual_exclusion|balance|custom")
    expressionText: str = Field(description="约束表达式文本")
    forEach: List[ConstraintForEach] = Field(default_factory=list, description="遍历维度")
    operator: str = Field("==", description="约束方向: <=|>=|==")
    rhsValue: float = Field(0.0, description="右侧值")
    hardness: str = Field("hard", description="硬度: hard|soft")
    businessMeaning: str = Field("", description="业务含义")
    relatedVariableSymbols: List[str] = Field(default_factory=list, description="关联的变量符号列表")
    penaltyWeight: Optional[float] = Field(None, description="软约束惩罚权重")


class DecisionVariableSetCreate(BaseModel):
    name: str = Field(description="变量集名称")
    description: Optional[str] = Field("", description="描述")
    ontology_id: Optional[str] = Field(None, description="关联本体ID")
    scenario: Optional[str] = Field(None, description="业务场景: APS|MPS|MRP|库存优化|物流运输|任务调度")
    variables: List[DecisionVariable] = Field(default_factory=list)


class DecisionVariableSetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    variables: Optional[List[DecisionVariable]] = None


class ConstraintTemplateSetCreate(BaseModel):
    name: str = Field(description="约束集名称")
    description: Optional[str] = Field("", description="描述")
    ontology_id: Optional[str] = Field(None, description="关联本体ID")
    constraints: List[ConstraintTemplate] = Field(default_factory=list)


class ConstraintTemplateSetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    constraints: Optional[List[ConstraintTemplate]] = None


class ImportVariablesRequest(BaseModel):
    variables: List[DecisionVariable]


class ImportConstraintsRequest(BaseModel):
    constraints: List[ConstraintTemplate]


# ─────────────────────────────────────────────────────────────────────────────
# Helper: MongoDB collection access
# ─────────────────────────────────────────────────────────────────────────────

def _var_sets_col():
    return mongodb_client.get_collection("decision_variable_sets")


def _con_sets_col():
    return mongodb_client.get_collection("constraint_template_sets")


def _doc_to_dict(doc: dict) -> dict:
    """将MongoDB文档转为API响应dict（_id → id，去掉_id）"""
    if not doc:
        return {}
    result = dict(doc)
    if "_id" in result:
        result["id"] = str(result.pop("_id"))
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Decision Variable Set CRUD
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/variable-sets/", tags=["映射集合"])
async def list_variable_sets(
    ontology_id: Optional[str] = Query(None, description="按本体ID过滤"),
):
    """列表查询决策变量集"""
    _ensure_seeded()
    col = _var_sets_col()
    filter_query = {}
    if ontology_id:
        filter_query["ontology_id"] = ontology_id
    docs = col.find(filter_query)
    items = []
    for doc in docs:
        items.append(_doc_to_dict(doc))
    return {"items": items, "total": len(items)}


@router.get("/variable-sets/{set_id}", tags=["映射集合"])
async def get_variable_set(set_id: str):
    """获取单个决策变量集详情"""
    col = _var_sets_col()
    doc = col.find_one({"_id": set_id})
    if not doc:
        raise HTTPException(status_code=404, detail="变量集不存在")
    return _doc_to_dict(doc)


@router.post("/variable-sets/", status_code=201, tags=["映射集合"])
async def create_variable_set(body: DecisionVariableSetCreate):
    """创建决策变量集"""
    col = _var_sets_col()
    doc_id = f"dvs-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()
    doc = {
        "_id": doc_id,
        "name": body.name,
        "description": body.description or "",
        "ontology_id": body.ontology_id,
        "scenario": body.scenario,
        "variables": [v.model_dump() for v in body.variables],
        "created_at": now,
        "updated_at": now,
    }
    col.insert_one(doc)
    logger.info(f"Created decision variable set: {doc_id} ({body.name})")
    return _doc_to_dict(doc)


@router.put("/variable-sets/{set_id}", tags=["映射集合"])
async def update_variable_set(set_id: str, body: DecisionVariableSetUpdate):
    """更新决策变量集"""
    col = _var_sets_col()
    doc = col.find_one({"_id": set_id})
    if not doc:
        raise HTTPException(status_code=404, detail="变量集不存在")
    update_fields = {"updated_at": datetime.utcnow().isoformat()}
    if body.name is not None:
        update_fields["name"] = body.name
    if body.description is not None:
        update_fields["description"] = body.description
    if body.variables is not None:
        update_fields["variables"] = [v.model_dump() for v in body.variables]
    _update_in_proxy(col, set_id, update_fields)
    updated = col.find_one({"_id": set_id})
    return _doc_to_dict(updated)


@router.delete("/variable-sets/{set_id}", status_code=204, tags=["映射集合"])
async def delete_variable_set(set_id: str):
    """删除决策变量集"""
    col = _var_sets_col()
    doc = col.find_one({"_id": set_id})
    if not doc:
        raise HTTPException(status_code=404, detail="变量集不存在")
    _delete_in_proxy(col, set_id)
    logger.info(f"Deleted decision variable set: {set_id}")


@router.post("/variable-sets/{set_id}/import", tags=["映射集合"])
async def import_variables_to_set(set_id: str, body: ImportVariablesRequest):
    """批量导入决策变量到已有变量集"""
    col = _var_sets_col()
    doc = col.find_one({"_id": set_id})
    if not doc:
        raise HTTPException(status_code=404, detail="变量集不存在")
    existing = doc.get("variables", [])
    new_vars = [v.model_dump() for v in body.variables]
    merged = existing + new_vars
    _update_in_proxy(col, set_id, {
        "variables": merged,
        "updated_at": datetime.utcnow().isoformat()
    })
    updated = col.find_one({"_id": set_id})
    return _doc_to_dict(updated)


# ─────────────────────────────────────────────────────────────────────────────
# Constraint Template Set CRUD
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/constraint-sets/", tags=["映射集合"])
async def list_constraint_sets(
    ontology_id: Optional[str] = Query(None, description="按本体ID过滤"),
):
    """列表查询约束条件集"""
    _ensure_seeded()
    col = _con_sets_col()
    filter_query = {}
    if ontology_id:
        filter_query["ontology_id"] = ontology_id
    docs = col.find(filter_query)
    items = []
    for doc in docs:
        items.append(_doc_to_dict(doc))
    return {"items": items, "total": len(items)}


@router.get("/constraint-sets/{set_id}", tags=["映射集合"])
async def get_constraint_set(set_id: str):
    """获取单个约束条件集详情"""
    col = _con_sets_col()
    doc = col.find_one({"_id": set_id})
    if not doc:
        raise HTTPException(status_code=404, detail="约束集不存在")
    return _doc_to_dict(doc)


@router.post("/constraint-sets/", status_code=201, tags=["映射集合"])
async def create_constraint_set(body: ConstraintTemplateSetCreate):
    """创建约束条件集"""
    col = _con_sets_col()
    doc_id = f"cts-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat()
    doc = {
        "_id": doc_id,
        "name": body.name,
        "description": body.description or "",
        "ontology_id": body.ontology_id,
        "constraints": [c.model_dump() for c in body.constraints],
        "created_at": now,
        "updated_at": now,
    }
    col.insert_one(doc)
    logger.info(f"Created constraint template set: {doc_id} ({body.name})")
    return _doc_to_dict(doc)


@router.put("/constraint-sets/{set_id}", tags=["映射集合"])
async def update_constraint_set(set_id: str, body: ConstraintTemplateSetUpdate):
    """更新约束条件集"""
    col = _con_sets_col()
    doc = col.find_one({"_id": set_id})
    if not doc:
        raise HTTPException(status_code=404, detail="约束集不存在")
    update_fields = {"updated_at": datetime.utcnow().isoformat()}
    if body.name is not None:
        update_fields["name"] = body.name
    if body.description is not None:
        update_fields["description"] = body.description
    if body.constraints is not None:
        update_fields["constraints"] = [c.model_dump() for c in body.constraints]
    _update_in_proxy(col, set_id, update_fields)
    updated = col.find_one({"_id": set_id})
    return _doc_to_dict(updated)


@router.delete("/constraint-sets/{set_id}", status_code=204, tags=["映射集合"])
async def delete_constraint_set(set_id: str):
    """删除约束条件集"""
    col = _con_sets_col()
    doc = col.find_one({"_id": set_id})
    if not doc:
        raise HTTPException(status_code=404, detail="约束集不存在")
    _delete_in_proxy(col, set_id)
    logger.info(f"Deleted constraint template set: {set_id}")


@router.post("/constraint-sets/{set_id}/import", tags=["映射集合"])
async def import_constraints_to_set(set_id: str, body: ImportConstraintsRequest):
    """批量导入约束条件到已有约束集"""
    col = _con_sets_col()
    doc = col.find_one({"_id": set_id})
    if not doc:
        raise HTTPException(status_code=404, detail="约束集不存在")
    existing = doc.get("constraints", [])
    new_cons = [c.model_dump() for c in body.constraints]
    merged = existing + new_cons
    _update_in_proxy(col, set_id, {
        "constraints": merged,
        "updated_at": datetime.utcnow().isoformat()
    })
    updated = col.find_one({"_id": set_id})
    return _doc_to_dict(updated)


# ─────────────────────────────────────────────────────────────────────────────
# Helper functions for MemoryCollectionProxy compatibility
# ─────────────────────────────────────────────────────────────────────────────

def collection_name_or_fallback(col, name):
    """获取集合名"""
    return getattr(col, "name", name)


def _update_in_proxy(col, doc_id: str, update_fields: dict):
    """兼容MemoryCollectionProxy和真实MongoDB的update操作"""
    from app.database.mongodb_client import MemoryCollectionProxy
    if isinstance(col, MemoryCollectionProxy):
        for doc in col._data:
            if doc.get("_id") == doc_id:
                doc.update(update_fields)
                return
    else:
        # 真实MongoDB
        col.update_one({"_id": doc_id}, {"$set": update_fields})


def _delete_in_proxy(col, doc_id: str):
    """兼容MemoryCollectionProxy和真实MongoDB的delete操作"""
    from app.database.mongodb_client import MemoryCollectionProxy
    if isinstance(col, MemoryCollectionProxy):
        col._data = [d for d in col._data if d.get("_id") != doc_id]
    else:
        col.delete_one({"_id": doc_id})


# ─────────────────────────────────────────────────────────────────────────────
# 单个变量 / 约束的增删端点
# ─────────────────────────────────────────────────────────────────────────────

class SingleVariableAdd(BaseModel):
    variable: DecisionVariable


class SingleConstraintAdd(BaseModel):
    constraint: ConstraintTemplate


@router.post("/variable-sets/{set_id}/variables", tags=["映射集合"])
async def add_variable_to_set(set_id: str, body: SingleVariableAdd):
    """向决策变量集中添加单个变量"""
    col = _var_sets_col()
    doc = col.find_one({"_id": set_id})
    if not doc:
        raise HTTPException(status_code=404, detail="变量集不存在")
    existing = doc.get("variables", [])
    existing.append(body.variable.model_dump())
    _update_in_proxy(col, set_id, {
        "variables": existing,
        "updated_at": datetime.utcnow().isoformat()
    })
    updated = col.find_one({"_id": set_id})
    return _doc_to_dict(updated)


@router.delete("/variable-sets/{set_id}/variables/{var_id}", status_code=204, tags=["映射集合"])
async def remove_variable_from_set(set_id: str, var_id: str):
    """从决策变量集中删除单个变量"""
    col = _var_sets_col()
    doc = col.find_one({"_id": set_id})
    if not doc:
        raise HTTPException(status_code=404, detail="变量集不存在")
    existing = doc.get("variables", [])
    new_vars = [v for v in existing if v.get("id") != var_id]
    if len(new_vars) == len(existing):
        raise HTTPException(status_code=404, detail="变量不存在")
    _update_in_proxy(col, set_id, {
        "variables": new_vars,
        "updated_at": datetime.utcnow().isoformat()
    })


@router.post("/constraint-sets/{set_id}/constraints", tags=["映射集合"])
async def add_constraint_to_set(set_id: str, body: SingleConstraintAdd):
    """向约束条件集中添加单个约束"""
    col = _con_sets_col()
    doc = col.find_one({"_id": set_id})
    if not doc:
        raise HTTPException(status_code=404, detail="约束集不存在")
    existing = doc.get("constraints", [])
    existing.append(body.constraint.model_dump())
    _update_in_proxy(col, set_id, {
        "constraints": existing,
        "updated_at": datetime.utcnow().isoformat()
    })
    updated = col.find_one({"_id": set_id})
    return _doc_to_dict(updated)


@router.delete("/constraint-sets/{set_id}/constraints/{con_id}", status_code=204, tags=["映射集合"])
async def remove_constraint_from_set(set_id: str, con_id: str):
    """从约束条件集中删除单个约束"""
    col = _con_sets_col()
    doc = col.find_one({"_id": set_id})
    if not doc:
        raise HTTPException(status_code=404, detail="约束集不存在")
    existing = doc.get("constraints", [])
    new_cons = [c for c in existing if c.get("id") != con_id]
    if len(new_cons) == len(existing):
        raise HTTPException(status_code=404, detail="约束不存在")
    _update_in_proxy(col, set_id, {
        "constraints": new_cons,
        "updated_at": datetime.utcnow().isoformat()
    })
