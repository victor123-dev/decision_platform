from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from .sqlite_client import Base
from datetime import datetime

class OntologyInstance(Base):
    __tablename__ = "ontology_instances"
    
    id = Column(String, primary_key=True)
    ontology_id = Column(String, nullable=False)
    object_type_id = Column(String, nullable=False)
    properties = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class ExecutionRecord(Base):
    __tablename__ = "execution_records"
    
    id = Column(String, primary_key=True)
    flow_id = Column(String, nullable=False)
    flow_name = Column(String)
    status = Column(String)
    input_data = Column(Text)
    output_data = Column(Text)
    trace = Column(Text)
    duration = Column(Float)
    created_at = Column(DateTime, default=datetime.now)

class RuleSet(Base):
    __tablename__ = "rule_sets"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="active")
    version = Column(String, default="v1.0")
    creator = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class Rule(Base):
    __tablename__ = "rules"
    
    id = Column(String, primary_key=True)
    rule_set_id = Column(String, ForeignKey("rule_sets.id"))
    name = Column(String, nullable=False)
    condition = Column(Text)
    then_action = Column(Text)
    else_action = Column(Text)
    enabled = Column(Boolean, default=True)
    priority = Column(Integer, default=1)
    
    rule_set = relationship("RuleSet", back_populates="rules")

RuleSet.rules = relationship("Rule", order_by=Rule.priority, back_populates="rule_set")

class GlobalVariable(Base):
    __tablename__ = "global_variables"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    data_type = Column(String, nullable=False)
    default_value = Column(String)
    scope = Column(String, default="global")
    description = Column(Text)
    updated_at = Column(DateTime, default=datetime.now)

class OptimizationModelDB(Base):
    __tablename__ = "optimization_models"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    problem_type = Column(String, default="LP")
    status = Column(String, default="draft")
    objective_sense = Column(String)
    objective_expression = Column(Text)
    variables = Column(Text)  # JSON
    constraints = Column(Text)  # JSON
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class DecisionFlowDB(Base):
    __tablename__ = "decision_flows"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="draft")
    tags = Column(Text)  # JSON List[str]
    nodes = Column(Text)  # JSON List[FlowNode]
    edges = Column(Text)  # JSON List[FlowEdge]
    node_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class LookupTableDB(Base):
    __tablename__ = "lookup_tables"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    columns_def = Column(Text)  # JSON List[{name, type}]
    rows_data = Column(Text)  # JSON List[List[value]]
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class AIModelDB(Base):
    __tablename__ = "ai_models"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    format = Column(String)  # ONNX, PMML, Python等
    version = Column(String)
    accuracy = Column(Float)
    recall = Column(Float)
    f1 = Column(Float)
    status = Column(String, default="draft")
    description = Column(Text)
    inputs = Column(Text)  # JSON
    outputs = Column(Text)  # JSON
    versions = Column(Text)  # JSON
    sparkline = Column(Text)  # JSON
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class CodeFileDB(Base):
    __tablename__ = "code_files"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    language = Column(String)
    size = Column(String)
    description = Column(Text)
    lines = Column(Integer)
    code = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class PublishTargetDB(Base):
    __tablename__ = "publish_targets"
    id = Column(String, primary_key=True)
    endpoint = Column(String, nullable=False)
    type = Column(String, default="REST API")
    status = Column(String, default="stopped")
    deployed_at = Column(DateTime)
    calls_24h = Column(Integer, default=0)
    version = Column(String)
    env = Column(String, default="development")


class PublishHistoryDB(Base):
    __tablename__ = "publish_history"
    id = Column(String, primary_key=True)
    action = Column(String, nullable=False)
    flow = Column(String)
    version = Column(String)
    env = Column(String)
    user = Column(String)
    time = Column(String)
    status = Column(String)
