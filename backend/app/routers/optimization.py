from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text, func
import highspy
import numpy as np
import logging
import json
import re
from datetime import datetime

from app.database.sqlite_client import SessionLocal, Base, engine
from app.database.sqlite_models import OptimizationModelDB

logger = logging.getLogger(__name__)

# Ensure the optimization_models table exists and add indexes
Base.metadata.create_all(bind=engine, tables=[OptimizationModelDB.__table__])

# Add performance indexes (idempotent)
with engine.connect() as conn:
    try:
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_opt_models_status ON optimization_models(status)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_opt_models_updated ON optimization_models(updated_at)"))
        conn.commit()
    except Exception as e:
        logger.warning(f"Index creation skipped: {e}")

router = APIRouter()

# --- Pydantic Models ---

class OptimizationVariable(BaseModel):
    id: str = Field(description="变量唯一标识")
    name: str = Field(description="变量名称")
    type: str = Field("continuous", description="变量类型", pattern="^(continuous|integer|binary)$")
    lower_bound: float = Field(0.0, description="下界")
    upper_bound: Optional[float] = Field(None, description="上界")

class OptimizationConstraint(BaseModel):
    id: str = Field(description="约束唯一标识")
    name: str = Field(description="约束名称")
    expression: str = Field(description="约束表达式")
    sense: str = Field(description="约束方向", pattern="^(<=|>=|==)$")
    rhs: float = Field(description="右侧值")

class OptimizationObjective(BaseModel):
    sense: str = Field(description="目标方向", pattern="^(maximize|minimize)$")
    expression: str = Field(description="目标函数表达式")

class OptimizationModel(BaseModel):
    id: Optional[str] = Field(None, description="模型唯一标识")
    name: str = Field(description="模型名称")
    description: Optional[str] = Field("", description="描述")
    problem_type: str = Field(description="问题类型", pattern="^(LP|MIP|QP)$")
    status: Optional[str] = Field("draft", description="状态")
    objective: OptimizationObjective = Field(description="目标函数")
    variables: List[OptimizationVariable] = Field(default_factory=list)
    constraints: List[OptimizationConstraint] = Field(default_factory=list)

class OptimizationResult(BaseModel):
    model_id: str = Field(description="模型ID")
    status: str = Field(description="求解状态")
    objective_value: Optional[float] = Field(None, description="目标函数值")
    solution: Dict[str, float] = Field(default_factory=dict, description="变量解")
    solve_time: float = Field(description="求解时间(秒)")
    iterations: int = Field(description="迭代次数")

# --- DB <-> API Conversion ---

def db_to_api(db_model: OptimizationModelDB) -> OptimizationModel:
    """将SQLite模型转换为API模型"""
    return OptimizationModel(
        id=db_model.id,
        name=db_model.name,
        description=db_model.description,
        problem_type=db_model.problem_type,
        status=db_model.status,
        objective=OptimizationObjective(
            sense=db_model.objective_sense or "maximize",
            expression=db_model.objective_expression or ""
        ),
        variables=[OptimizationVariable(**v) for v in json.loads(db_model.variables or "[]")],
        constraints=[OptimizationConstraint(**c) for c in json.loads(db_model.constraints or "[]")]
    )


def api_to_db(model: OptimizationModel) -> OptimizationModelDB:
    """将API模型转换为SQLite模型"""
    return OptimizationModelDB(
        id=model.id,
        name=model.name,
        description=model.description,
        problem_type=model.problem_type,
        status=model.status,
        objective_sense=model.objective.sense if model.objective else None,
        objective_expression=model.objective.expression if model.objective else None,
        variables=json.dumps([v.model_dump() for v in (model.variables or [])]),
        constraints=json.dumps([c.model_dump() for c in (model.constraints or [])]),
    )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class OptimizationModelListItem(BaseModel):
    """轻量级列表项，仅包含摘要字段"""
    id: str
    name: str
    description: Optional[str] = ""
    problem_type: str
    status: str
    updated_at: Optional[datetime] = None


class OptimizationModelListResponse(BaseModel):
    """分页列表响应"""
    items: List[OptimizationModelListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# --- CRUD Endpoints ---

@router.get("/", tags=["优化求解模型"])
async def list_models(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页条数"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    status_filter: Optional[str] = Query(None, description="状态过滤"),
    db: Session = Depends(get_db),
):
    """分页查询优化模型列表（轻量级，不含 variables/constraints）"""
    query = db.query(OptimizationModelDB)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (OptimizationModelDB.name.like(pattern)) |
            (OptimizationModelDB.description.like(pattern))
        )
    if status_filter:
        query = query.filter(OptimizationModelDB.status == status_filter)

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    # 各状态计数（不受分页/搜索影响，反映全局状态分布）
    status_counts = dict(
        db.query(OptimizationModelDB.status, func.count(OptimizationModelDB.id))
        .group_by(OptimizationModelDB.status)
        .all()
    )

    items = (
        query.order_by(OptimizationModelDB.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": [
            OptimizationModelListItem(
                id=m.id, name=m.name, description=m.description,
                problem_type=m.problem_type, status=m.status,
                updated_at=m.updated_at,
            )
            for m in items
        ],
        "total": total,
        "status_counts": status_counts,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }

@router.get("/{model_id}", response_model=OptimizationModel, tags=["优化求解模型"])
async def get_model(model_id: str, db: Session = Depends(get_db)):
    db_model = db.query(OptimizationModelDB).filter(OptimizationModelDB.id == model_id).first()
    if not db_model:
        raise HTTPException(status_code=404, detail="Model not found")
    return db_to_api(db_model)

@router.post("/", response_model=OptimizationModel, status_code=status.HTTP_201_CREATED, tags=["优化求解模型"])
async def create_model(model: OptimizationModel, db: Session = Depends(get_db)):
    if not model.id:
        count = db.query(OptimizationModelDB).count()
        model.id = f"model-{count + 1:04d}"

    db_model = api_to_db(model)
    db.add(db_model)
    db.commit()
    db.refresh(db_model)

    logger.info(f"Created optimization model: {model.name} ({model.id})")
    logger.info(f"Objective expression: {model.objective.expression}")
    logger.info(f"Constraints:")
    for c in model.constraints:
        logger.info(f"  {c.name}: expression='{c.expression}', sense='{c.sense}', rhs={c.rhs}")

    return db_to_api(db_model)

@router.put("/{model_id}", response_model=OptimizationModel, tags=["优化求解模型"])
async def update_model(model_id: str, model: OptimizationModel, db: Session = Depends(get_db)):
    db_model = db.query(OptimizationModelDB).filter(OptimizationModelDB.id == model_id).first()
    if not db_model:
        raise HTTPException(status_code=404, detail="Model not found")

    db_model.name = model.name
    db_model.description = model.description
    db_model.problem_type = model.problem_type
    db_model.status = model.status
    db_model.objective_sense = model.objective.sense if model.objective else None
    db_model.objective_expression = model.objective.expression if model.objective else None
    db_model.variables = json.dumps([v.model_dump() for v in (model.variables or [])])
    db_model.constraints = json.dumps([c.model_dump() for c in (model.constraints or [])])
    db_model.updated_at = datetime.now()

    db.commit()
    db.refresh(db_model)

    logger.info(f"Updated optimization model: {model.name}")
    return db_to_api(db_model)

@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["优化求解模型"])
async def delete_model(model_id: str, db: Session = Depends(get_db)):
    db_model = db.query(OptimizationModelDB).filter(OptimizationModelDB.id == model_id).first()
    if not db_model:
        raise HTTPException(status_code=404, detail="Model not found")
    db.delete(db_model)
    db.commit()
    logger.info(f"Deleted optimization model: {model_id}")

# --- Expression Parser ---

def parse_expression(expression, var_indices):
    """解析数学表达式，返回变量系数字典"""
    coeffs = {i: 0.0 for i in range(len(var_indices))}
    expr = expression.replace(' ', '')

    # 使用正则直接提取每个项（包含其符号）
    # 例如: "3*x1-5*x2" -> ["3*x1", "-5*x2"]
    # 例如: "-5*x" -> ["-5*x"]
    terms = re.findall(r'[+-]?[^+-]+', expr)

    logger.debug(f"Parsing expression: '{expression}' -> '{expr}' -> terms: {terms}")

    for term in terms:
        if not term:
            continue

        if '*' in term:
            coeff_str, var_name = term.split('*', 1)
            coeff = float(coeff_str)
        else:
            # 处理纯变量项，如 'x1' 或 '-x1'
            if term.startswith('-'):
                coeff = -1.0
                var_name = term[1:]
            elif term.startswith('+'):
                coeff = 1.0
                var_name = term[1:]
            else:
                coeff = 1.0
                var_name = term

        logger.debug(f"  Term: '{term}' -> coeff: {coeff}, var_name: '{var_name}'")

        if var_name in var_indices:
            coeffs[var_indices[var_name]] += coeff
            logger.debug(f"    Added to index {var_indices[var_name]}, new value: {coeffs[var_indices[var_name]]}")
        else:
            logger.debug(f"    Variable '{var_name}' not found in var_indices")

    logger.debug(f"Final coefficients: {coeffs}")
    return coeffs

# --- Solve Endpoint ---

@router.post("/{model_id}/solve", response_model=OptimizationResult, tags=["优化求解模型"])
async def solve_model(model_id: str, db: Session = Depends(get_db)):
    db_model = db.query(OptimizationModelDB).filter(OptimizationModelDB.id == model_id).first()
    if not db_model:
        raise HTTPException(status_code=404, detail="Model not found")

    model = db_to_api(db_model)

    try:
        var_indices = {v.name: i for i, v in enumerate(model.variables)}
        num_cols = len(model.variables)
        num_rows = len(model.constraints)

        # 创建HighsLp对象
        lp = highspy.HighsLp()
        lp.num_col_ = num_cols
        lp.num_row_ = num_rows

        # 设置目标函数系数
        col_cost = np.array([0.0] * num_cols, dtype=np.float64)
        obj_coeffs = parse_expression(model.objective.expression, var_indices)
        for idx, coeff in obj_coeffs.items():
            col_cost[idx] = coeff
        lp.col_cost_ = col_cost

        # 设置变量边界
        lp.col_lower_ = np.array([v.lower_bound for v in model.variables], dtype=np.float64)
        lp.col_upper_ = np.array([v.upper_bound if v.upper_bound else float('inf') for v in model.variables], dtype=np.float64)

        # 设置约束边界
        row_lower = []
        row_upper = []
        for constraint in model.constraints:
            if constraint.sense == '<=':
                row_lower.append(-float('inf'))
                row_upper.append(constraint.rhs)
            elif constraint.sense == '>=':
                row_lower.append(constraint.rhs)
                row_upper.append(float('inf'))
            elif constraint.sense == '==':
                row_lower.append(constraint.rhs)
                row_upper.append(constraint.rhs)
        lp.row_lower_ = np.array(row_lower, dtype=np.float64)
        lp.row_upper_ = np.array(row_upper, dtype=np.float64)

        # 设置目标方向
        if model.objective.sense == 'maximize':
            lp.sense_ = highspy.ObjSense.kMaximize
        else:
            lp.sense_ = highspy.ObjSense.kMinimize

        # 设置约束矩阵（列主序稀疏格式）
        A_start = [0]
        A_index = []
        A_value = []

        # 预先解析所有约束的系数
        constraint_coeffs = []
        for constraint in model.constraints:
            coeffs = parse_expression(constraint.expression, var_indices)
            constraint_coeffs.append(coeffs)

        # 按列构建稀疏矩阵
        for col_idx in range(num_cols):
            for row_idx in range(num_rows):
                coeff = constraint_coeffs[row_idx][col_idx]
                if coeff != 0:
                    A_index.append(row_idx)
                    A_value.append(coeff)
            A_start.append(len(A_index))

        lp.a_matrix_.start_ = np.array(A_start, dtype=np.int32)
        lp.a_matrix_.index_ = np.array(A_index, dtype=np.int32)
        lp.a_matrix_.value_ = np.array(A_value, dtype=np.float64)

        # 设置整数变量
        if any(v.type in ("integer", "binary") for v in model.variables):
            integrality = []
            for v in model.variables:
                if v.type in ("integer", "binary"):
                    integrality.append(highspy.HighsVarType.kInteger)
                else:
                    integrality.append(highspy.HighsVarType.kContinuous)
            lp.integrality_ = integrality

        # 创建求解器并传递模型
        highs = highspy.Highs()
        pass_result = highs.passModel(lp)

        if pass_result != highspy.HighsStatus.kOk:
            raise RuntimeError(f"Failed to pass model to solver: {pass_result}")

        # 求解
        highs.run()

        # 获取结果
        model_status = highs.getModelStatus()

        status_map = {
            highspy.HighsModelStatus.kOptimal: "optimal",
            highspy.HighsModelStatus.kInfeasible: "infeasible",
            highspy.HighsModelStatus.kUnbounded: "unbounded",
            highspy.HighsModelStatus.kInterrupt: "interrupted",
            highspy.HighsModelStatus.kHighsInterrupt: "interrupted",
        }

        solution = {}
        objective_value = None
        if model_status == highspy.HighsModelStatus.kOptimal:
            x = highs.getSolution().col_value
            for v in model.variables:
                solution[v.name] = float(x[var_indices[v.name]])
            objective_value = float(highs.getObjectiveValue())

        # 更新模型状态为solved
        db_model.status = "solved"
        db_model.updated_at = datetime.now()
        db.commit()

        return OptimizationResult(
            model_id=model_id,
            status=status_map.get(model_status, "unknown"),
            objective_value=objective_value,
            solution=solution,
            solve_time=float(highs.getRunTime()),
            iterations=0
        )

    except Exception as e:
        logger.error(f"Error solving model {model_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- MPS/LP Direct Solve Endpoint ---

@router.post("/solve-mps", tags=["优化求解模型"])
async def solve_mps_content(body: dict):
    """直接接收 MPS/LP 文件内容，使用 HiGHS 原生读取器求解"""
    content = body.get("content", "")
    file_format = body.get("format", "mps")

    if not content:
        raise HTTPException(status_code=400, detail="缺少模型文件内容")

    import tempfile
    import os

    suffix = f".{file_format}"
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix=suffix, delete=False) as f:
            f.write(content)
            tmp_path = f.name

        highs = highspy.Highs()
        highs.setOptionValue("output_flag", False)
        read_status = highs.readModel(tmp_path)
        if read_status != highspy.HighsStatus.kOk:
            raise HTTPException(status_code=400, detail="无法解析模型文件")

        highs.run()
        model_status = highs.getModelStatus()

        status_map = {
            highspy.HighsModelStatus.kOptimal: "optimal",
            highspy.HighsModelStatus.kInfeasible: "infeasible",
            highspy.HighsModelStatus.kUnbounded: "unbounded",
        }

        solution = {}
        objective_value = None
        if model_status == highspy.HighsModelStatus.kOptimal:
            sol = highs.getSolution()
            num_cols = highs.getNumCol()
            for i in range(num_cols):
                # HiGHS getColName 返回 (status, name) 元组
                try:
                    col_info = highs.getColName(i)
                    col_name = col_info[1] if isinstance(col_info, tuple) else str(col_info)
                except Exception:
                    col_name = f"x{i}"
                solution[col_name] = float(sol.col_value[i])
            objective_value = float(highs.getObjectiveValue())

        return {
            "model_id": "mps-direct",
            "status": status_map.get(model_status, "unknown"),
            "objective_value": objective_value,
            "solution": solution,
            "solve_time": float(highs.getRunTime()),
            "iterations": 0,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error solving MPS content: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
