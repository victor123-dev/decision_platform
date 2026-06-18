"""
OO-DSL API — 本体驱动的优化建模 DSL 路由

提供 DSL 模型 CRUD、校验、编译、求解、结果查看等接口。
包含 demo 接口用于端到端测试。
"""

import json
import uuid
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.sqlite_client import SessionLocal, Base, engine
from app.database.sqlite_models import (
    OptimizationDslModelDB,
    OntologyInstance,
    OntologyRelationInstance,
)
from app.schemas.optimization_dsl import (
    OptimizationDslModel,
    ValidationResult,
    LinearModelIR,
    SolveResult,
)
from app.services.ontology_resolver import OntologyResolver
from app.services.oo_validator import OOValidator
from app.services.oo_compiler import OOCompiler
from app.services.solver_adapter import SolverAdapter
from app.services.result_interpreter import ResultInterpreter

logger = logging.getLogger(__name__)

router = APIRouter()

# 确保表存在
Base.metadata.create_all(
    bind=engine,
    tables=[
        OptimizationDslModelDB.__table__,
        OntologyRelationInstance.__table__,
    ],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Pydantic request/response models ─────────────────────────────

class DslModelListItem(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    problem_type: str
    status: str
    ontology_id: str
    updated_at: Optional[datetime] = None


class DslModelListResponse(BaseModel):
    items: list
    total: int


class ValidateResponse(BaseModel):
    model_id: str
    status: str
    errors: list = []
    warnings: list = []
    summary: dict = {}


class CompileResponse(BaseModel):
    model_id: str
    status: str
    ir: Optional[dict] = None
    summary: dict = {}


class SolveResponse(BaseModel):
    model_id: str
    status: str
    objective_value: Optional[float] = None
    solution: dict = {}
    solve_time: float = 0.0
    business_results: list = []
    metrics: dict = {}


# ── Helper ───────────────────────────────────────────────────────

def _db_to_dsl_model(db_model: OptimizationDslModelDB) -> dict:
    """将 DB 模型转为 DSL model dict。"""
    dsl_json = json.loads(db_model.dsl_json) if db_model.dsl_json else {}
    return {
        "id": db_model.id,
        "workspaceId": db_model.workspace_id,
        "name": db_model.name,
        "description": db_model.description,
        "problemType": db_model.problem_type,
        "dslVersion": db_model.dsl_version,
        "ontologyId": db_model.ontology_id,
        "businessProblem": db_model.business_problem,
        "status": db_model.status,
        **dsl_json,
    }


def _dsl_model_to_json(dsl_model: dict) -> str:
    """提取 DSL 核心内容存储为 JSON。"""
    core = {
        "sets": dsl_model.get("sets", []),
        "parameters": dsl_model.get("parameters", []),
        "variables": dsl_model.get("variables", []),
        "objective": dsl_model.get("objective"),
        "constraints": dsl_model.get("constraints", []),
        "solverConfig": dsl_model.get("solverConfig", {}),
        "metadata": dsl_model.get("metadata", {}),
    }
    return json.dumps(core, ensure_ascii=False)


# ── CRUD Endpoints ───────────────────────────────────────────────

@router.get("/", tags=["OO-DSL"])
async def list_dsl_models(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    ontology_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """列出 DSL 模型。"""
    query = db.query(OptimizationDslModelDB)
    if ontology_id:
        query = query.filter(OptimizationDslModelDB.ontology_id == ontology_id)

    total = query.count()
    items = (
        query.order_by(OptimizationDslModelDB.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": [
            {
                "id": m.id,
                "name": m.name,
                "description": m.description,
                "problemType": m.problem_type,
                "status": m.status,
                "ontologyId": m.ontology_id,
                "updatedAt": str(m.updated_at) if m.updated_at else None,
            }
            for m in items
        ],
        "total": total,
    }


@router.get("/{model_id}", tags=["OO-DSL"])
async def get_dsl_model(model_id: str, db: Session = Depends(get_db)):
    """获取 DSL 模型详情。"""
    db_model = (
        db.query(OptimizationDslModelDB)
        .filter(OptimizationDslModelDB.id == model_id)
        .first()
    )
    if not db_model:
        raise HTTPException(status_code=404, detail="DSL model not found")
    return _db_to_dsl_model(db_model)


@router.post("/", status_code=status.HTTP_201_CREATED, tags=["OO-DSL"])
async def create_dsl_model(body: dict, db: Session = Depends(get_db)):
    """创建 DSL 模型。"""
    model_id = body.get("id") or f"dsl-{uuid.uuid4().hex[:8]}"
    name = body.get("name", "Unnamed DSL Model")
    ontology_id = body.get("ontologyId", "")

    if not ontology_id:
        raise HTTPException(status_code=400, detail="ontologyId is required")

    db_model = OptimizationDslModelDB(
        id=model_id,
        workspace_id=body.get("workspaceId"),
        name=name,
        description=body.get("description", ""),
        problem_type=body.get("problemType", "MIP"),
        ontology_id=ontology_id,
        business_problem=body.get("businessProblem", ""),
        dsl_version=body.get("dslVersion", "0.1"),
        dsl_json=_dsl_model_to_json(body),
        status="draft",
    )
    db.add(db_model)
    db.commit()

    logger.info(f"Created DSL model: {name} ({model_id})")
    return _db_to_dsl_model(db_model)


@router.put("/{model_id}", tags=["OO-DSL"])
async def update_dsl_model(
    model_id: str, body: dict, db: Session = Depends(get_db)
):
    """更新 DSL 模型。"""
    db_model = (
        db.query(OptimizationDslModelDB)
        .filter(OptimizationDslModelDB.id == model_id)
        .first()
    )
    if not db_model:
        raise HTTPException(status_code=404, detail="DSL model not found")

    if "name" in body:
        db_model.name = body["name"]
    if "description" in body:
        db_model.description = body["description"]
    if "problemType" in body:
        db_model.problem_type = body["problemType"]
    if "businessProblem" in body:
        db_model.business_problem = body["businessProblem"]

    db_model.dsl_json = _dsl_model_to_json(body)
    db_model.updated_at = datetime.now()
    db.commit()

    logger.info(f"Updated DSL model: {model_id}")
    return _db_to_dsl_model(db_model)


@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["OO-DSL"])
async def delete_dsl_model(model_id: str, db: Session = Depends(get_db)):
    """删除 DSL 模型。"""
    db_model = (
        db.query(OptimizationDslModelDB)
        .filter(OptimizationDslModelDB.id == model_id)
        .first()
    )
    if not db_model:
        raise HTTPException(status_code=404, detail="DSL model not found")
    db.delete(db_model)
    db.commit()
    logger.info(f"Deleted DSL model: {model_id}")


# ── Validate ─────────────────────────────────────────────────────

@router.post("/{model_id}/validate", tags=["OO-DSL"])
async def validate_model(model_id: str, db: Session = Depends(get_db)):
    """校验 DSL 模型完整性。"""
    db_model = (
        db.query(OptimizationDslModelDB)
        .filter(OptimizationDslModelDB.id == model_id)
        .first()
    )
    if not db_model:
        raise HTTPException(status_code=404, detail="DSL model not found")

    dsl_model = _db_to_dsl_model(db_model)
    validator = OOValidator()
    result = validator.validate(dsl_model)

    # 保存校验结果
    db_model.validation_json = result.model_dump_json()
    db_model.status = "validated" if result.status == "passed" else "validation_failed"
    db_model.updated_at = datetime.now()
    db.commit()

    return result.model_dump()


# ── Compile ──────────────────────────────────────────────────────

@router.post("/{model_id}/compile", tags=["OO-DSL"])
async def compile_model(model_id: str, db: Session = Depends(get_db)):
    """编译 DSL 模型为 LinearModelIR。"""
    db_model = (
        db.query(OptimizationDslModelDB)
        .filter(OptimizationDslModelDB.id == model_id)
        .first()
    )
    if not db_model:
        raise HTTPException(status_code=404, detail="DSL model not found")

    dsl_model = _db_to_dsl_model(db_model)
    resolver = OntologyResolver(db, db_model.ontology_id)
    compiler = OOCompiler(resolver)

    try:
        ir = compiler.compile(dsl_model)
        ir_dict = ir.model_dump()

        # 保存编译结果
        db_model.compiled_json = json.dumps(ir_dict, ensure_ascii=False)
        db_model.status = "compiled"
        db_model.updated_at = datetime.now()
        db.commit()

        return {
            "modelId": model_id,
            "status": "compiled",
            "ir": ir_dict,
            "summary": {
                "variables": len(ir.variables),
                "constraints": len(ir.constraints),
                "objectiveSense": ir.sense,
            },
        }
    except Exception as e:
        logger.error(f"Compilation failed for {model_id}: {e}", exc_info=True)
        db_model.status = "compile_failed"
        db_model.updated_at = datetime.now()
        db.commit()
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/{model_id}/compiled", tags=["OO-DSL"])
async def get_compiled(model_id: str, db: Session = Depends(get_db)):
    """查看编译产物。"""
    db_model = (
        db.query(OptimizationDslModelDB)
        .filter(OptimizationDslModelDB.id == model_id)
        .first()
    )
    if not db_model:
        raise HTTPException(status_code=404, detail="DSL model not found")
    if not db_model.compiled_json:
        raise HTTPException(status_code=404, detail="Model not compiled yet")
    return json.loads(db_model.compiled_json)


# ── Solve ────────────────────────────────────────────────────────

@router.post("/{model_id}/solve", tags=["OO-DSL"])
async def solve_model(model_id: str, db: Session = Depends(get_db)):
    """编译 + 求解 DSL 模型。"""
    db_model = (
        db.query(OptimizationDslModelDB)
        .filter(OptimizationDslModelDB.id == model_id)
        .first()
    )
    if not db_model:
        raise HTTPException(status_code=404, detail="DSL model not found")

    dsl_model = _db_to_dsl_model(db_model)
    resolver = OntologyResolver(db, db_model.ontology_id)
    compiler = OOCompiler(resolver)
    solver = SolverAdapter()
    interpreter = ResultInterpreter()

    try:
        # 编译
        ir = compiler.compile(dsl_model)

        # 保存编译结果
        db_model.compiled_json = json.dumps(ir.model_dump(), ensure_ascii=False)

        # 求解
        solve_result = solver.solve(ir)

        # 解释结果
        set_instances, _ = resolver.resolve_all(dsl_model)
        business = interpreter.interpret(solve_result, dsl_model, set_instances)

        # 构建完整结果
        full_result = {
            "modelId": model_id,
            "status": solve_result["status"],
            "objectiveValue": solve_result.get("objective_value"),
            "solution": solve_result.get("solution", {}),
            "solveTime": solve_result.get("solve_time", 0),
            "businessResults": business.get("businessResults", []),
            "metrics": business.get("metrics", {}),
        }

        # 保存求解结果
        db_model.solve_result_json = json.dumps(full_result, ensure_ascii=False)
        db_model.status = "solved" if solve_result["status"] == "optimal" else "solve_failed"
        db_model.updated_at = datetime.now()
        db.commit()

        return full_result

    except Exception as e:
        logger.error(f"Solve failed for {model_id}: {e}", exc_info=True)
        db_model.status = "solve_failed"
        db_model.updated_at = datetime.now()
        db.commit()
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/{model_id}/result", tags=["OO-DSL"])
async def get_result(model_id: str, db: Session = Depends(get_db)):
    """查看求解结果（含业务解释）。"""
    db_model = (
        db.query(OptimizationDslModelDB)
        .filter(OptimizationDslModelDB.id == model_id)
        .first()
    )
    if not db_model:
        raise HTTPException(status_code=404, detail="DSL model not found")
    if not db_model.solve_result_json:
        raise HTTPException(status_code=404, detail="Model not solved yet")
    return json.loads(db_model.solve_result_json)


# ── Demo: Person-Task Assignment ─────────────────────────────────

@router.post("/demo/person-task-assignment", tags=["OO-DSL Demo"])
async def create_demo_person_task_assignment(db: Session = Depends(get_db)):
    """创建人员-任务分配优化 demo。

    自动写入：
    - 本体实例（3 个人员 + 4 个任务）
    - 关系实例（duration 属性）
    - DSL 模型

    经典分配问题：最小化总处理时长。
    """
    ontology_id = "ont-demo-person-task"
    model_id = "dsl-demo-person-task"

    # ── 1. 清理旧 demo 数据 ──────────────────────────────────────
    db.query(OntologyInstance).filter(
        OntologyInstance.ontology_id == ontology_id
    ).delete()
    db.query(OntologyRelationInstance).filter(
        OntologyRelationInstance.ontology_id == ontology_id
    ).delete()
    db.query(OptimizationDslModelDB).filter(
        OptimizationDslModelDB.id == model_id
    ).delete()
    db.commit()

    # ── 2. 创建本体实例 ──────────────────────────────────────────
    persons = [
        {"id": "person_zhangsan", "props": {"displayName": "张三", "name": "张三", "capacity": 5}},
        {"id": "person_lisi", "props": {"displayName": "李四", "name": "李四", "capacity": 4}},
        {"id": "person_wangwu", "props": {"displayName": "王五", "name": "王五", "capacity": 3}},
    ]
    tasks = [
        {"id": "task_A", "props": {"displayName": "任务A", "name": "任务A", "priority": 1}},
        {"id": "task_B", "props": {"displayName": "任务B", "name": "任务B", "priority": 2}},
        {"id": "task_C", "props": {"displayName": "任务C", "name": "任务C", "priority": 3}},
        {"id": "task_D", "props": {"displayName": "任务D", "name": "任务D", "priority": 4}},
    ]

    for p in persons:
        inst = OntologyInstance(
            id=p["id"],
            ontology_id=ontology_id,
            object_type_id="Person",
            properties=json.dumps(p["props"], ensure_ascii=False),
        )
        db.add(inst)

    for t in tasks:
        inst = OntologyInstance(
            id=t["id"],
            ontology_id=ontology_id,
            object_type_id="Task",
            properties=json.dumps(t["props"], ensure_ascii=False),
        )
        db.add(inst)

    # ── 3. 创建关系实例 (duration: Person -> Task) ───────────────
    # duration 矩阵（行=人员，列=任务）：
    #         任务A  任务B  任务C  任务D
    # 张三      3      5      7      4
    # 李四      4      6      5      3
    # 王五      5      4      6      5
    duration_matrix = {
        ("person_zhangsan", "task_A"): 3.0,
        ("person_zhangsan", "task_B"): 5.0,
        ("person_zhangsan", "task_C"): 7.0,
        ("person_zhangsan", "task_D"): 4.0,
        ("person_lisi", "task_A"): 4.0,
        ("person_lisi", "task_B"): 6.0,
        ("person_lisi", "task_C"): 5.0,
        ("person_lisi", "task_D"): 3.0,
        ("person_wangwu", "task_A"): 5.0,
        ("person_wangwu", "task_B"): 4.0,
        ("person_wangwu", "task_C"): 6.0,
        ("person_wangwu", "task_D"): 5.0,
    }

    for (src, tgt), dur in duration_matrix.items():
        ri = OntologyRelationInstance(
            id=f"rel-{src}-{tgt}",
            ontology_id=ontology_id,
            relation_type_id="assigned_to",
            source_instance_id=src,
            target_instance_id=tgt,
            properties=json.dumps({"duration": dur}),
        )
        db.add(ri)

    db.commit()

    # ── 4. 创建 DSL 模型 ─────────────────────────────────────────
    dsl_content = {
        "sets": [
            {
                "id": "set_person",
                "symbol": "I",
                "name": "人员集合",
                "description": "所有可分配的人员",
                "ontologyRef": {"objectTypeId": "Person"},
            },
            {
                "id": "set_task",
                "symbol": "J",
                "name": "任务集合",
                "description": "所有需要分配的任务",
                "ontologyRef": {"objectTypeId": "Task"},
            },
        ],
        "parameters": [
            {
                "id": "param_duration",
                "symbol": "duration",
                "name": "处理时长",
                "description": "人员处理任务所需的时长",
                "indices": ["set_person", "set_task"],
                "valueType": "number",
                "unit": "小时",
                "ontologyBinding": {
                    "type": "relation_property",
                    "sourceSetId": "set_person",
                    "relationTypeId": "assigned_to",
                    "targetSetId": "set_task",
                    "propertyId": "duration",
                },
            },
        ],
        "variables": [
            {
                "id": "var_assignment",
                "symbol": "x",
                "name": "分配变量",
                "domain": "binary",
                "indices": ["set_person", "set_task"],
                "businessMeaning": "人员是否被分配处理任务",
                "valueMeaning": {"1": "分配", "0": "不分配"},
            },
        ],
        "objective": {
            "sense": "minimize",
            "expressionText": "sum(i in I, j in J) duration[i,j] * x[i,j]",
            "businessMeaning": "最小化总处理时长",
        },
        "constraints": [
            {
                "id": "constraint_each_task_once",
                "name": "每任务分配一次",
                "forEach": [{"alias": "j", "setId": "set_task"}],
                "operator": "==",
                "expressionText": "sum(i in I) x[i,j]",
                "rhsValue": 1.0,
                "businessMeaning": "每个任务必须分配给恰好一个人员",
            },
            {
                "id": "constraint_person_max_one",
                "name": "每人最多一任务",
                "forEach": [{"alias": "i", "setId": "set_person"}],
                "operator": "<=",
                "expressionText": "sum(j in J) x[i,j]",
                "rhsValue": 1.0,
                "businessMeaning": "每个人员最多处理一个任务",
            },
        ],
        "solverConfig": {"solver": "ortools", "timeLimitSeconds": 60},
    }

    db_model = OptimizationDslModelDB(
        id=model_id,
        workspace_id="demo",
        name="人员-任务分配优化",
        description="经典分配问题：将 3 个人员分配到 4 个任务，最小化总处理时长",
        problem_type="MIP",
        ontology_id=ontology_id,
        business_problem="如何将人员最优地分配到任务，使得总处理时长最小？每个任务必须分配给恰好一个人员，每个人员最多处理一个任务。",
        dsl_version="0.1",
        dsl_json=json.dumps(dsl_content, ensure_ascii=False),
        status="draft",
    )
    db.add(db_model)
    db.commit()

    logger.info(f"Created demo: person-task assignment (ontology={ontology_id}, model={model_id})")

    return {
        "message": "Demo 数据创建成功",
        "ontology_id": ontology_id,
        "model_id": model_id,
        "data": {
            "persons": [p["id"] for p in persons],
            "tasks": [t["id"] for t in tasks],
            "relations": len(duration_matrix),
        },
        "next_steps": [
            f"POST /api/v1/optimization-dsl/{model_id}/validate — 校验模型",
            f"POST /api/v1/optimization-dsl/{model_id}/compile — 编译模型",
            f"POST /api/v1/optimization-dsl/{model_id}/solve — 求解模型",
            f"GET /api/v1/optimization-dsl/{model_id}/result — 查看结果",
        ],
    }
