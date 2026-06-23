"""
OO-DSL Pydantic Schemas

Ontology-grounded Optimization DSL data structures for:
- Sets (bound to ontology object types)
- Parameters (bound to ontology properties or relation properties)
- Decision Variable Templates (indexed by sets)
- Objective Function
- Constraint Templates
- Solver Config
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


# ── Enums ─────────────────────────────────────────────────────────────────

class ProblemType(str, Enum):
    LP = "LP"          # 线性规划 (GLOP/SCIP)
    MIP = "MIP"        # 混合整数规划 (SCIP/CBC)
    CP_SAT = "CP_SAT"  # 约束满足 (CP-SAT Solver)


class VariableDomain(str, Enum):
    continuous = "continuous"
    integer = "integer"
    binary = "binary"


class ObjectiveSense(str, Enum):
    minimize = "minimize"
    maximize = "maximize"


class ConstraintOperator(str, Enum):
    le = "<="
    ge = ">="
    eq = "=="


class BindingType(str, Enum):
    object_property = "object_property"
    relation_property = "relation_property"


class GlobalConstraintType(str, Enum):
    ALL_DIFFERENT = "AllDifferent"       # 所有变量取不同值
    NO_OVERLAP = "NoOverlap"            # 区间不重叠
    CUMULATIVE = "Cumulative"           # 累积资源约束
    ELEMENT = "Element"                 # 索引取值约束
    TABLE = "Table"                     # 表格约束（允许值组合）
    CIRCUIT = "Circuit"                 # 哈密顿回路
    INVERSE = "Inverse"                 # 逆映射
    AUTOMATON = "Automaton"             # 有限自动机


# ── CP-SAT Variable Definitions ──────────────────────────────────────────

class IntVarDefinition(BaseModel):
    id: str = Field(description="变量唯一标识")
    name: str = Field(description="变量名称")
    lowerBound: int = Field(0, description="下界")
    upperBound: int = Field(100, description="上界")
    description: Optional[str] = ""


class BoolVarDefinition(BaseModel):
    id: str = Field(description="变量唯一标识")
    name: str = Field(description="变量名称")
    description: Optional[str] = ""


class IntervalVarDefinition(BaseModel):
    id: str = Field(description="变量唯一标识")
    name: str = Field(description="变量名称")
    startVar: str = Field(description="开始变量ID (引用IntVar)")
    sizeMin: int = Field(description="最小持续时间")
    sizeMax: int = Field(description="最大持续时间")
    endVar: str = Field(description="结束变量ID (引用IntVar)")
    description: Optional[str] = ""


# ── Global Constraint ────────────────────────────────────────────────────

class GlobalConstraint(BaseModel):
    id: str = Field(description="约束唯一标识")
    type: GlobalConstraintType = Field(description="全局约束类型")
    variables: List[str] = Field(default_factory=list, description="关联变量ID列表")
    intervals: List[str] = Field(default_factory=list, description="关联区间变量ID列表")
    params: Dict[str, Any] = Field(default_factory=dict, description="约束参数 (如 capacity, demands 等)")
    name: Optional[str] = ""
    description: Optional[str] = ""


# ── CP-SAT Solver Config ─────────────────────────────────────────────────

class CPSATSolverConfig(BaseModel):
    timeLimitSeconds: int = 60
    numWorkers: int = 4
    searchStrategy: str = Field("automatic", description="automatic/fixed/choose_first")
    solutionLimit: int = Field(0, description="0=找最优, >0=找到N个解即停")
    enumerateAllSolutions: bool = False
    logSearchProgress: bool = False


# ── Ontology Reference ────────────────────────────────────────────────────

class OntologyRef(BaseModel):
    ontologyId: Optional[str] = None
    objectTypeId: Optional[str] = None
    propertyId: Optional[str] = None
    relationTypeId: Optional[str] = None


# ── Set Definition ────────────────────────────────────────────────────────

class SetDefinition(BaseModel):
    id: str = Field(description="集合唯一标识, e.g. 'set_person'")
    symbol: str = Field(description="集合符号, e.g. 'I'")
    name: str = Field(description="业务名称, e.g. '人员集合'")
    description: Optional[str] = ""
    ontologyRef: OntologyRef = Field(description="绑定本体对象类型")
    filter: Optional[Dict[str, Any]] = None
    instanceSource: Dict[str, Any] = Field(
        default_factory=lambda: {"type": "ontology_instances"}
    )


# ── Parameter Definition ──────────────────────────────────────────────────

class ParameterDefinition(BaseModel):
    id: str = Field(description="参数唯一标识")
    symbol: str = Field(description="参数符号, e.g. 'duration'")
    name: str = Field(description="业务名称")
    description: Optional[str] = ""
    indices: List[str] = Field(default_factory=list, description="索引集合ID列表")
    valueType: str = "number"
    unit: Optional[str] = None
    defaultValue: Optional[float] = None
    missingValueStrategy: str = Field(
        "error", description="error|default|skip|ask_user"
    )
    ontologyBinding: Dict[str, Any] = Field(
        description="本体绑定, type=object_property|relation_property"
    )


# ── Decision Variable Template ────────────────────────────────────────────

class DecisionVariableTemplate(BaseModel):
    id: str = Field(description="变量模板唯一标识")
    symbol: str = Field(description="变量符号, e.g. 'x'")
    name: str = Field(description="业务名称")
    description: Optional[str] = ""
    domain: VariableDomain = Field(description="取值域")
    indices: List[str] = Field(default_factory=list, description="索引集合ID列表")
    lowerBound: Optional[float] = None
    upperBound: Optional[float] = None
    businessMeaning: str = Field(description="业务含义")
    valueMeaning: Dict[str, str] = Field(
        default_factory=dict, description="取值解释, e.g. {'1':'分配','0':'不分配'}"
    )
    expansionPolicy: Dict[str, Any] = Field(
        default_factory=lambda: {"type": "cartesian_product"}
    )


# ── Objective Definition ──────────────────────────────────────────────────

class ObjectiveDefinition(BaseModel):
    id: Optional[str] = None
    sense: ObjectiveSense
    expression: Optional[Dict[str, Any]] = Field(
        None, description="结构化AST (optional for MVP)"
    )
    expressionText: str = Field(
        description="文本表达式, e.g. 'sum(i in I, j in J) duration[i,j] * x[i,j]'"
    )
    businessMeaning: str = Field(description="业务含义")


# ── Constraint Template ───────────────────────────────────────────────────

class ConstraintTemplate(BaseModel):
    id: str = Field(description="约束模板唯一标识")
    name: str = Field(description="约束名称")
    description: Optional[str] = ""
    forEach: List[Dict[str, str]] = Field(
        default_factory=list,
        description="展开维度, e.g. [{'alias':'j','setId':'set_task'}]"
    )
    leftExpression: Optional[Dict[str, Any]] = None
    operator: ConstraintOperator
    rightExpression: Optional[Dict[str, Any]] = None
    expressionText: str = Field(description="文本表达式")
    rhsValue: float = Field(0.0, description="右端常数值, e.g. 1.0 表示 sum(...) == 1")
    businessMeaning: str = Field(description="业务含义")
    hardness: str = Field("hard", description="hard|soft")


# ── Solver Config ─────────────────────────────────────────────────────────

class SolverConfig(BaseModel):
    solver: str = "ortools"
    timeLimitSeconds: int = 60
    mipGap: float = 0.001
    outputFormat: str = "internal"
    debugArtifacts: Dict[str, Any] = Field(
        default_factory=lambda: {
            "saveExpandedModel": True,
            "saveLpText": False,
        }
    )


# ── Full OO-DSL Model ─────────────────────────────────────────────────────

class OptimizationDslModel(BaseModel):
    id: Optional[str] = None
    workspaceId: Optional[str] = None
    name: str
    description: Optional[str] = ""
    problemType: ProblemType = ProblemType.MIP
    dslVersion: str = "0.1"
    ontologyId: str
    businessProblem: Optional[str] = ""
    sets: List[SetDefinition] = Field(default_factory=list)
    parameters: List[ParameterDefinition] = Field(default_factory=list)
    variables: List[DecisionVariableTemplate] = Field(default_factory=list)
    objective: Optional[ObjectiveDefinition] = None
    constraints: List[ConstraintTemplate] = Field(default_factory=list)
    # CP-SAT 专用字段
    intVars: List[IntVarDefinition] = Field(default_factory=list)
    intervalVars: List[IntervalVarDefinition] = Field(default_factory=list)
    boolVars: List[BoolVarDefinition] = Field(default_factory=list)
    globalConstraints: List[GlobalConstraint] = Field(default_factory=list)
    cpsatConfig: Optional[CPSATSolverConfig] = None
    solverConfig: SolverConfig = Field(default_factory=SolverConfig)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    status: str = "draft"


# ── Validation Result ─────────────────────────────────────────────────────

class ValidationIssue(BaseModel):
    code: str
    level: str = Field(description="error|warning|suggestion")
    message: str
    path: Optional[str] = None
    businessMessage: Optional[str] = None
    fixSuggestion: Optional[str] = None


class ValidationResult(BaseModel):
    modelId: str
    status: str = Field(description="passed|failed")
    errors: List[ValidationIssue] = Field(default_factory=list)
    warnings: List[ValidationIssue] = Field(default_factory=list)
    suggestions: List[ValidationIssue] = Field(default_factory=list)
    summary: Dict[str, Any] = Field(default_factory=dict)


# ── Linear Model IR (Compiler Output) ─────────────────────────────────────

class IRVariable(BaseModel):
    id: str = Field(description="展开后变量ID, e.g. 'x__person_zhangsan__task_A'")
    templateId: str
    symbol: str
    indices: Dict[str, str] = Field(description="集合ID→实例ID映射")
    domain: str
    lowerBound: float = 0.0
    upperBound: float = 1.0
    businessLabel: str = ""


class IRObjective(BaseModel):
    coefficients: Dict[str, float] = Field(description="变量ID→系数")
    constant: float = 0.0


class IRConstraint(BaseModel):
    id: str
    templateId: Optional[str] = None
    name: str
    coefficients: Dict[str, float]
    operator: str
    rhs: float
    businessLabel: str = ""


class LinearModelIR(BaseModel):
    modelId: str
    sense: str
    variables: List[IRVariable] = Field(default_factory=list)
    objective: IRObjective
    constraints: List[IRConstraint] = Field(default_factory=list)
    debug: Dict[str, Any] = Field(default_factory=dict)


# ── Solve Result ──────────────────────────────────────────────────────────

class SolveResult(BaseModel):
    modelId: str
    status: str = Field(description="optimal|infeasible|unbounded|error")
    objectiveValue: Optional[float] = None
    solution: Dict[str, float] = Field(default_factory=dict)
    intSolution: Dict[str, int] = Field(default_factory=dict, description="CP-SAT 整数解")
    allSolutions: List[Dict[str, int]] = Field(default_factory=list, description="枚举的所有解")
    solveTime: float = 0.0
    businessResults: List[Dict[str, Any]] = Field(default_factory=list)
    metrics: Dict[str, Any] = Field(default_factory=dict)


# ── CP-SAT Model IR (Compiler Output) ────────────────────────────────────

class CPSATModelIR(BaseModel):
    modelId: str
    intVars: List[Dict[str, Any]] = Field(default_factory=list, description="[{id, name, lb, ub}]")
    boolVars: List[Dict[str, Any]] = Field(default_factory=list, description="[{id, name}]")
    intervalVars: List[Dict[str, Any]] = Field(default_factory=list, description="[{id, start_var, size_min, size_max, end_var}]")
    linearConstraints: List[Dict[str, Any]] = Field(default_factory=list, description="[{coeffs:{var_id: coeff}, op, rhs}]")
    globalConstraints: List[Dict[str, Any]] = Field(default_factory=list, description="[{type, vars, intervals, params}]")
    objective: Optional[Dict[str, Any]] = Field(None, description="{sense: minimize/maximize, coefficients: {var_id: coeff}}")
    config: Dict[str, Any] = Field(default_factory=dict, description="{num_workers, time_limit, ...}")
