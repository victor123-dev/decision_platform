from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from ortools.linear_solver import pywraplp
import logging
import json
import re
from datetime import datetime

from app.database.sqlite_client import SessionLocal, Base, engine
from app.database.sqlite_models import OptimizationModelDB
from app.services.solver_adapters import SolverAdapterFactory
from app.services.code_generators import CodeGeneratorFactory

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

# 迁移：为 optimization_models 添加新字段（幂等）
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE optimization_models ADD COLUMN algorithm_config TEXT"))
        conn.commit()
    except Exception:
        pass  # 字段已存在
    try:
        conn.execute(text("ALTER TABLE optimization_models ADD COLUMN solver_config TEXT"))
        conn.commit()
    except Exception:
        pass  # 字段已存在

router = APIRouter()

# --- Pydantic Models ---

class OptimizationVariable(BaseModel):
    id: str = Field(description="变量唯一标识")
    name: str = Field(description="变量中文名称")
    nameEn: Optional[str] = Field(None, description="变量英文名称")
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
    problem_type: str = Field(description="问题类型", pattern="^(LP|MIP|CP_SAT)$")
    status: Optional[str] = Field("draft", description="状态")
    objective: OptimizationObjective = Field(description="目标函数")
    variables: List[OptimizationVariable] = Field(default_factory=list)
    constraints: List[OptimizationConstraint] = Field(default_factory=list)
    algorithm_config: Optional[Dict[str, Any]] = Field(None, description="算法特定配置(CP-SAT)")
    solver_config: Optional[Dict[str, Any]] = Field(None, description="求解器参数配置")

class OptimizationResult(BaseModel):
    model_id: str = Field(description="模型ID")
    status: str = Field(description="求解状态")
    objective_value: Optional[float] = Field(None, description="目标函数值")
    solution: Dict[str, float] = Field(default_factory=dict, description="变量解（扁平，向后兼容）")
    solutionDetails: Optional[List[Dict[str, Any]]] = Field(None, description="结构化变量解（含维度索引）")
    solve_time: float = Field(description="求解时间(秒)")
    iterations: int = Field(description="迭代次数")

# --- DB <-> API Conversion ---

def db_to_api(db_model: OptimizationModelDB) -> OptimizationModel:
    """将SQLite模型转换为API模型"""
    algorithm_config = None
    if db_model.algorithm_config:
        try:
            algorithm_config = json.loads(db_model.algorithm_config)
        except Exception:
            algorithm_config = None
    solver_config = None
    if db_model.solver_config:
        try:
            solver_config = json.loads(db_model.solver_config)
        except Exception:
            solver_config = None
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
        constraints=[OptimizationConstraint(**c) for c in json.loads(db_model.constraints or "[]")],
        algorithm_config=algorithm_config,
        solver_config=solver_config,
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
        algorithm_config=json.dumps(model.algorithm_config) if model.algorithm_config else None,
        solver_config=json.dumps(model.solver_config) if model.solver_config else None,
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
    if model.algorithm_config is not None:
        db_model.algorithm_config = json.dumps(model.algorithm_config)
    if model.solver_config is not None:
        db_model.solver_config = json.dumps(model.solver_config)
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

# --- Solve Endpoint (OR-Tools) ---

@router.post("/{model_id}/solve", response_model=OptimizationResult, tags=["优化求解模型"])
async def solve_model(model_id: str, db: Session = Depends(get_db)):
    db_model = db.query(OptimizationModelDB).filter(OptimizationModelDB.id == model_id).first()
    if not db_model:
        raise HTTPException(status_code=404, detail="Model not found")

    model = db_to_api(db_model)

    try:
        import time
        start_time = time.time()

        problem_type = model.problem_type

        if problem_type == "CP_SAT":
            # CP-SAT 路径 - 根据求解策略选择适配器
            algorithm_config = json.loads(db_model.algorithm_config or "{}")
            solver_config = json.loads(db_model.solver_config or "{}")
            solving_strategy = solver_config.get("solvingStrategy", "exact")
            adapter = SolverAdapterFactory.create(problem_type, solving_strategy)

            model_data = {
                "intVars": algorithm_config.get("intVars", []),
                "boolVars": algorithm_config.get("boolVars", []),
                "intervalVars": algorithm_config.get("intervalVars", []),
                "linearConstraints": algorithm_config.get("linearConstraints", []),
                "globalConstraints": algorithm_config.get("globalConstraints", []),
                "objective": algorithm_config.get("objective"),
            }

            result = adapter.solve(model_data, solver_config)
            solve_time = time.time() - start_time

            # 更新模型状态
            db_model.status = "solved"
            db_model.updated_at = datetime.now()
            db.commit()

            return OptimizationResult(
                model_id=model_id,
                status=result.get("status", "unknown"),
                objective_value=result.get("objective_value"),
                solution=result.get("solution", {}),
                solve_time=result.get("solve_time", solve_time),
                iterations=0
            )

        # LP/MIP 路径 - 根据问题类型自动选择求解器
        var_indices = {v.name: i for i, v in enumerate(model.variables)}

        # 创建 OR-Tools 求解器
        if model.problem_type == "LP":
            solver = pywraplp.Solver.CreateSolver('GLOP')
            if not solver:
                solver = pywraplp.Solver.CreateSolver('SCIP')
            if not solver:
                raise RuntimeError('无法创建 OR-Tools LP 求解器 (GLOP/SCIP)')
        else:
            solver = pywraplp.Solver.CreateSolver('SCIP')
            if not solver:
                solver = pywraplp.Solver.CreateSolver('CBC')
            if not solver:
                raise RuntimeError('无法创建 OR-Tools MIP 求解器 (SCIP/CBC)')

        # 创建变量
        vars_list = []
        for v in model.variables:
            lb = v.lower_bound if v.lower_bound is not None else 0.0
            ub = v.upper_bound if v.upper_bound is not None else solver.infinity()
            if v.type == 'binary':
                var = solver.IntVar(0, 1, v.name)
            elif v.type == 'integer':
                var = solver.IntVar(lb, ub, v.name)
            else:
                var = solver.NumVar(lb, ub, v.name)
            vars_list.append(var)

        # 目标函数
        obj = solver.Objective()
        obj_coeffs = parse_expression(model.objective.expression, var_indices)
        for idx, coeff in obj_coeffs.items():
            if coeff != 0:
                obj.SetCoefficient(vars_list[idx], coeff)

        if model.objective.sense == 'maximize':
            obj.SetMaximization()
        else:
            obj.SetMinimization()

        # 约束条件
        for constraint in model.constraints:
            c_coeffs = parse_expression(constraint.expression, var_indices)
            if constraint.sense == '<=':
                c = solver.Constraint(-solver.infinity(), constraint.rhs)
            elif constraint.sense == '>=':
                c = solver.Constraint(constraint.rhs, solver.infinity())
            else:  # ==
                c = solver.Constraint(constraint.rhs, constraint.rhs)

            for idx, coeff in c_coeffs.items():
                if coeff != 0:
                    c.SetCoefficient(vars_list[idx], coeff)

        # 求解
        status = solver.Solve()

        status_map = {
            pywraplp.Solver.OPTIMAL: "optimal",
            pywraplp.Solver.INFEASIBLE: "infeasible",
            pywraplp.Solver.UNBOUNDED: "unbounded",
            pywraplp.Solver.NOT_SOLVED: "unknown",
            pywraplp.Solver.FEASIBLE: "feasible",
        }

        solution = {}
        objective_value = None
        solve_status = status_map.get(status, "unknown")

        if status == pywraplp.Solver.OPTIMAL:
            for v in model.variables:
                idx = var_indices[v.name]
                solution[v.name] = vars_list[idx].solution_value()
            objective_value = solver.Objective().Value()

        solve_time = time.time() - start_time

        # 更新模型状态为solved
        db_model.status = "solved"
        db_model.updated_at = datetime.now()
        db.commit()

        return OptimizationResult(
            model_id=model_id,
            status=solve_status,
            objective_value=objective_value,
            solution=solution,
            solve_time=solve_time,
            iterations=0
        )

    except Exception as e:
        logger.error(f"Error solving model {model_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Code Generation Endpoint ---

@router.post("/{model_id}/generate-code", tags=["优化求解模型"])
async def generate_code(model_id: str, db: Session = Depends(get_db)):
    """为模型生成可执行的 OR-Tools Python 代码"""
    db_model = db.query(OptimizationModelDB).filter(OptimizationModelDB.id == model_id).first()
    if not db_model:
        raise HTTPException(status_code=404, detail="Model not found")

    model = db_to_api(db_model)
    problem_type = model.problem_type

    try:
        generator = CodeGeneratorFactory.create(problem_type)

        if problem_type in ("LP", "MIP"):
            model_data = {
                "name": model.name,
                "variables": [v.model_dump() for v in model.variables],
                "objective": model.objective.model_dump() if model.objective else {},
                "constraints": [c.model_dump() for c in model.constraints],
            }
        elif problem_type == "CP_SAT":
            algorithm_config = json.loads(db_model.algorithm_config or "{}")
            solver_config = json.loads(db_model.solver_config or "{}")
            model_data = {
                "name": model.name,
                "problemType": "CP_SAT",
                "intVars": algorithm_config.get("intVars", []),
                "boolVars": algorithm_config.get("boolVars", []),
                "intervalVars": algorithm_config.get("intervalVars", []),
                "linearConstraints": algorithm_config.get("linearConstraints", []),
                "globalConstraints": algorithm_config.get("globalConstraints", []),
                "objective": algorithm_config.get("objective"),
                "cpsatConfig": solver_config,
            }
        else:
            model_data = {"name": model.name}

        code = generator.generate(model_data)
        return {"code": code, "problem_type": problem_type}

    except Exception as e:
        logger.error(f"Error generating code for model {model_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- LP Direct Solve Endpoint ---

@router.post("/solve-lp", tags=["优化求解模型"])
async def solve_lp_content(body: dict):
    """接收 LP 文件内容，解析并使用 OR-Tools 求解"""
    from app.services.file_parser import parse_model_file
    import time

    content = body.get("content", "")
    file_format = body.get("format", "lp")

    if not content:
        raise HTTPException(status_code=400, detail="缺少模型文件内容")

    try:
        start_time = time.time()

        # 解析 LP 文件
        parsed = parse_model_file(content, file_format)

        # 创建 OR-Tools 求解器
        solver = pywraplp.Solver.CreateSolver('SCIP')
        if not solver:
            solver = pywraplp.Solver.CreateSolver('CBC')
        if not solver:
            raise RuntimeError('无法创建 OR-Tools 求解器')

        # 创建变量
        var_map = {}
        for v in parsed["variables"]:
            name = v["name"]
            lb = v.get("lowerBound") if v.get("lowerBound") is not None else 0.0
            ub = v.get("upperBound") if v.get("upperBound") is not None else solver.infinity()
            if v["type"] == "binary":
                var_map[name] = solver.IntVar(0, 1, name)
            elif v["type"] == "integer":
                var_map[name] = solver.IntVar(lb, ub, name)
            else:
                var_map[name] = solver.NumVar(lb, ub, name)

        # 目标函数
        obj = solver.Objective()
        for var_name, coeff in parsed.get("objective", {}).get("coefficients", {}).items():
            if var_name in var_map and coeff != 0:
                obj.SetCoefficient(var_map[var_name], coeff)

        sense = parsed.get("objectiveSense", "minimize")
        if sense == "maximize":
            obj.SetMaximization()
        else:
            obj.SetMinimization()

        # 约束条件
        for c in parsed.get("constraints", []):
            if c["sense"] == "<=":
                constraint = solver.Constraint(-solver.infinity(), c["rhs"])
            elif c["sense"] == ">=":
                constraint = solver.Constraint(c["rhs"], solver.infinity())
            else:
                constraint = solver.Constraint(c["rhs"], c["rhs"])

            for var_name, coeff in c.get("coefficients", {}).items():
                if var_name in var_map and coeff != 0:
                    constraint.SetCoefficient(var_map[var_name], coeff)

        # 求解
        status = solver.Solve()

        status_map = {
            pywraplp.Solver.OPTIMAL: "optimal",
            pywraplp.Solver.INFEASIBLE: "infeasible",
            pywraplp.Solver.UNBOUNDED: "unbounded",
        }

        solution = {}
        objective_value = None
        if status == pywraplp.Solver.OPTIMAL:
            for name, var in var_map.items():
                solution[name] = var.solution_value()
            objective_value = solver.Objective().Value()

        solve_time = time.time() - start_time

        return {
            "model_id": "lp-direct",
            "status": status_map.get(status, "unknown"),
            "objective_value": objective_value,
            "solution": solution,
            "solve_time": solve_time,
            "iterations": 0,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error solving LP content: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── New Endpoints: parse-file / generate-python / generate-dsl ─────────────

@router.post("/parse-file", tags=["优化求解模型"])
async def parse_model_file(body: dict):
    """
    解析 LP 文件内容，返回完整模型结构。
    body: { content: str, format: 'lp' }
    """
    from app.services.file_parser import parse_model_file

    content = body.get("content", "")
    file_format = body.get("format", "lp")

    if not content:
        raise HTTPException(status_code=400, detail="缺少模型文件内容")

    try:
        result = parse_model_file(content, file_format)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error parsing model file: {e}")
        raise HTTPException(status_code=500, detail=f"解析失败: {str(e)}")


@router.post("/generate-python", tags=["优化求解模型"])
async def generate_python_code(body: dict):
    """
    将模型定义转换为 OR-Tools Python 代码。
    body: { variables: [...], objective: {...}, constraints: [...], name: str }
    """
    from app.services.code_generator import generate_ortools_code

    try:
        code = generate_ortools_code(body)
        return {"code": code}
    except Exception as e:
        logger.error(f"Error generating Python code: {e}")
        raise HTTPException(status_code=500, detail=f"代码生成失败: {str(e)}")


@router.post("/generate-dsl", tags=["优化求解模型"])
async def generate_or_dsl(body: dict):
    """
    将模型定义转换为 OR-DSL JSON 结构。
    body: { variables: [...], objective: {...}, constraints: [...], name: str,
            problem_type: str, ontologies: [...] }
    """
    from app.services.dsl_converter import model_to_or_dsl

    try:
        ontologies = body.pop("ontologies", None) or []
        or_dsl = model_to_or_dsl(body, ontologies)
        return {"orDsl": or_dsl}
    except Exception as e:
        logger.error(f"Error generating OR-DSL: {e}")
        raise HTTPException(status_code=500, detail=f"DSL生成失败: {str(e)}")
