from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.database.sqlite_client import SessionLocal
from app.database.sqlite_models import DecisionFlowDB, RuleSet, Rule, OptimizationModelDB, OntologyInstance
from app.database import get_db
from app.database.neo4j_client import neo4j_client
import logging
import json
import re
import highspy
import numpy as np
from datetime import datetime
from simpleeval import simple_eval
import requests as http_requests

logger = logging.getLogger(__name__)

router = APIRouter()

class FlowNode(BaseModel):
    id: str = Field(description="节点唯一标识")
    type: str = Field(description="节点类型")
    position: Dict[str, int] = Field(default_factory=dict, description="位置")
    data: Dict[str, Any] = Field(default_factory=dict, description="节点数据")

class FlowEdge(BaseModel):
    model_config = {"populate_by_name": True}
    id: str = Field(description="边唯一标识")
    source: str = Field(description="源节点ID")
    target: str = Field(description="目标节点ID")
    source_handle: Optional[str] = Field(None, alias="sourceHandle", description="源节点出口")
    label: Optional[str] = Field(None, description="边标签")

class DecisionFlow(BaseModel):
    id: str = Field(description="流程唯一标识")
    name: str = Field(description="流程名称")
    description: str = Field(default="", description="描述")
    node_count: int = Field(default=0, description="节点数量")
    tags: List[str] = Field(default_factory=list, description="标签")
    updated_at: Optional[str] = Field(None, description="更新时间")
    checked_out_by: Optional[str] = Field(None, description="签出用户")
    status: str = Field(default="draft", description="状态")
    nodes: List[FlowNode] = Field(default_factory=list)
    edges: List[FlowEdge] = Field(default_factory=list)

class ExecutionResult(BaseModel):
    flow_id: str = Field(description="流程ID")
    trace_id: str = Field(description="追踪ID")
    status: str = Field(description="执行状态")
    result: Dict[str, Any] = Field(default_factory=dict, description="执行结果")
    trace: List[Dict[str, Any]] = Field(default_factory=list, description="执行轨迹")
    duration: float = Field(description="执行耗时(秒)")


def db_to_flow(db_flow):
    """将数据库对象转换为API模型"""
    return DecisionFlow(
        id=db_flow.id,
        name=db_flow.name,
        description=db_flow.description or "",
        status=db_flow.status or "draft",
        tags=json.loads(db_flow.tags or "[]"),
        nodes=[FlowNode(**n) for n in json.loads(db_flow.nodes or "[]")],
        edges=[FlowEdge(**e) for e in json.loads(db_flow.edges or "[]")],
        node_count=db_flow.node_count or 0,
        updated_at=db_flow.updated_at.isoformat() if db_flow.updated_at else datetime.now().isoformat(),
    )


class FlowEngine:
    @staticmethod
    async def execute(flow: DecisionFlow, input_data: Dict[str, Any] = None):
        trace = []
        context = input_data.copy() if input_data else {}
        current_nodes = [n for n in flow.nodes if n.type in ['interface', 'manual_trigger']]
        visited = set()
        trace_id = str(hash(str(flow.id) + str(input_data)))
        
        while current_nodes:
            node = current_nodes.pop(0)
            if node.id in visited:
                continue
            visited.add(node.id)
            
            step_result = await FlowEngine.execute_node(node, context)
            trace.append(step_result)
            
            if node.type == 'end':
                continue
            
            next_nodes = FlowEngine.get_next_nodes(flow, node.id, step_result.get('output'))
            current_nodes.extend(next_nodes)
        
        return ExecutionResult(
            flow_id=flow.id,
            trace_id=trace_id,
            status='success',
            result=context,
            trace=trace,
            duration=0.1
        )
    
    @staticmethod
    async def execute_node(node: FlowNode, context: Dict[str, Any]):
        node_type = node.type
        
        if node_type == 'interface':
            return {'step': len(context.keys()) + 1, 'node': node.data.get('label', node.id), 
                    'status': 'success', 'input': '-', 'output': '触发执行'}
        
        elif node_type == 'if':
            condition = node.data.get('config', {}).get('condition', 'True')
            # 替换 ${var} 为 context值
            def replace_var(match):
                var_name = match.group(1)
                val = context.get(var_name, 'None')
                if isinstance(val, str):
                    return f'"{val}"'
                return str(val)
            safe_condition = re.sub(r'\$\{(\w+)\}', replace_var, condition)
            try:
                result = simple_eval(safe_condition)
            except Exception:
                result = False
            output = str(result)
            context['__branch_result__'] = result
            return {'step': len(context.keys()), 'node': node.data.get('label', '条件判断'),
                    'status': 'success', 'input': condition, 'output': output}
        
        elif node_type == 'rules':
            ruleset_id = node.data.get('config', {}).get('rulesetId')
            db = SessionLocal()
            try:
                rules = db.query(Rule).filter(
                    Rule.rule_set_id == ruleset_id,
                    Rule.enabled == True
                ).order_by(Rule.priority).all()
                
                rule_score = 0
                auto_approve = False
                matched_rules = []
                
                for rule in rules:
                    try:
                        cond = rule.condition or "True"
                        # 替换变量引用
                        for key, val in context.items():
                            if isinstance(val, (int, float)):
                                cond = cond.replace(f"${key}", str(val))
                            elif isinstance(val, str):
                                cond = cond.replace(f"${key}", f'"{val}"')
                        
                        if simple_eval(cond):
                            matched_rules.append(rule.name)
                            try:
                                action = json.loads(rule.then_action) if rule.then_action else {}
                            except Exception:
                                action = {}
                            rule_score += action.get('score', 25)
                            if action.get('auto_approve'):
                                auto_approve = True
                    except Exception as e:
                        logger.warning(f"Rule eval error: {e}")
                        continue
                
                if not rules:
                    rule_score = 0
                
                context['rule_score'] = rule_score
                context['auto_approve'] = auto_approve
            finally:
                db.close()
            
            return {'step': len(context.keys()), 'node': node.data.get('label', '规则评估'),
                    'status': 'success', 'input': f'rulesetId={ruleset_id}', 
                    'output': f'rule_score={rule_score}, auto_approve={auto_approve}'}
        
        elif node_type == 'script':
            script_code = node.data.get('config', {}).get('code', '')
            if script_code:
                safe_globals = {
                    '__builtins__': {
                        'len': len, 'str': str, 'int': int, 'float': float,
                        'bool': bool, 'list': list, 'dict': dict, 'tuple': tuple,
                        'abs': abs, 'min': min, 'max': max, 'sum': sum,
                        'round': round, 'sorted': sorted, 'enumerate': enumerate,
                        'range': range, 'zip': zip, 'map': map, 'filter': filter,
                        'True': True, 'False': False, 'None': None,
                        'isinstance': isinstance, 'type': type,
                    }
                }
                local_vars = {'context': context}
                try:
                    exec(script_code, safe_globals, local_vars)
                    # 将local_vars中的新变量合并到context
                    for k, v in local_vars.items():
                        if k != 'context' and not k.startswith('_'):
                            context[k] = v
                    context['processed'] = True
                except Exception as e:
                    context['script_error'] = str(e)
                    context['processed'] = False
            else:
                context['processed'] = True
            return {'step': len(context.keys()), 'node': node.data.get('label', '脚本执行'),
                    'status': 'success', 'input': '原始数据', 'output': '处理完成'}
        
        elif node_type == 'asynchronous':
            strategy = node.data.get('config', {}).get('strategy', 'weighted_avg')
            if 'rule_score' in context:
                context['final_score'] = context['rule_score']
            else:
                context['final_score'] = 0
            return {'step': len(context.keys()), 'node': node.data.get('label', '综合评分'),
                    'status': 'success', 'input': f'strategy={strategy}', 'output': f'final_score = {context["final_score"]}'}
        
        elif node_type == 'http_request':
            config = node.data.get('config', {})
            url = config.get('url', '')
            method = config.get('method', 'GET').upper()
            headers = config.get('headers', {})
            body = config.get('body', None)
            timeout = config.get('timeout', 10)

            try:
                if method == 'GET':
                    resp = http_requests.get(url, headers=headers, timeout=timeout)
                elif method == 'POST':
                    resp = http_requests.post(url, json=body, headers=headers, timeout=timeout)
                elif method == 'PUT':
                    resp = http_requests.put(url, json=body, headers=headers, timeout=timeout)
                elif method == 'DELETE':
                    resp = http_requests.delete(url, headers=headers, timeout=timeout)
                else:
                    resp = http_requests.request(method, url, json=body, headers=headers, timeout=timeout)
                
                try:
                    response_data = resp.json()
                except Exception:
                    response_data = {"text": resp.text}
                
                context['http_response'] = {
                    'status': resp.status_code,
                    'data': response_data
                }
            except Exception as e:
                context['http_response'] = {
                    'status': 0,
                    'error': str(e)
                }
            
            return {'step': len(context.keys()), 'node': node.data.get('label', 'HTTP请求'),
                    'status': 'success', 'input': f'{method} {url}', 
                    'output': f"status={context['http_response'].get('status', 0)}"}
        
        elif node_type == 'optimization_model':
            model_id = node.data.get('config', {}).get('modelId')
            db = SessionLocal()
            try:
                db_model = db.query(OptimizationModelDB).filter(OptimizationModelDB.id == model_id).first()
                if db_model:
                    # 从SQLite重建模型对象
                    from app.routers.optimization import OptimizationModel, OptimizationVariable, OptimizationConstraint, OptimizationObjective
                    variables = [OptimizationVariable(**v) for v in json.loads(db_model.variables or "[]")]
                    constraints = [OptimizationConstraint(**c) for c in json.loads(db_model.constraints or "[]")]
                    objective = OptimizationObjective(**json.loads(db_model.objective_expression or "{}"))
                    model = OptimizationModel(
                        id=db_model.id,
                        name=db_model.name,
                        description=db_model.description or "",
                        problem_type=db_model.problem_type or "LP",
                        status=db_model.status or "draft",
                        variables=variables,
                        constraints=constraints,
                        objective=objective,
                    )
                    try:
                        col_indices = {v.name: i for i, v in enumerate(model.variables)}
                        num_cols = len(model.variables)
                        num_rows = len(model.constraints)
                        
                        lp = highspy.HighsLp()
                        lp.num_col_ = num_cols
                        lp.num_row_ = num_rows
                        
                        col_cost = [0.0] * num_cols
                        for term in model.objective.expression.replace(' ', '').split('+'):
                            if term:
                                if '*' in term:
                                    coeff, var = term.split('*')
                                    col_cost[col_indices[var]] = float(coeff)
                                else:
                                    col_cost[col_indices[term]] = 1.0
                        lp.col_cost_ = np.array(col_cost, dtype=np.float64)
                        
                        lp.col_lower_ = np.array([v.lower_bound for v in model.variables], dtype=np.float64)
                        lp.col_upper_ = np.array([v.upper_bound if v.upper_bound else float('inf') for v in model.variables], dtype=np.float64)
                        
                        row_lower = []
                        row_upper = []
                        for constraint in model.constraints:
                            if constraint.operator == '<=':
                                row_lower.append(-float('inf'))
                                row_upper.append(constraint.rhs)
                            elif constraint.operator == '>=':
                                row_lower.append(constraint.rhs)
                                row_upper.append(float('inf'))
                            elif constraint.operator == '==':
                                row_lower.append(constraint.rhs)
                                row_upper.append(constraint.rhs)
                        lp.row_lower_ = np.array(row_lower, dtype=np.float64)
                        lp.row_upper_ = np.array(row_upper, dtype=np.float64)
                        
                        if model.objective.sense == 'max':
                            lp.sense_ = highspy.ObjSense.kMaximize
                        else:
                            lp.sense_ = highspy.ObjSense.kMinimize
                        
                        A_start = [0]
                        A_index = []
                        A_value = []
                        for col_idx, var in enumerate(model.variables):
                            col_name = var.name
                            for row_idx, constraint in enumerate(model.constraints):
                                expr = constraint.expression.replace(' ', '')
                                terms = expr.split('+')
                                for term in terms:
                                    if term:
                                        if '*' in term:
                                            coeff_str, var_name = term.split('*')
                                            coeff = float(coeff_str)
                                        else:
                                            coeff = 1.0
                                            var_name = term
                                        if var_name == col_name:
                                            A_index.append(row_idx)
                                            A_value.append(coeff)
                            A_start.append(len(A_index))
                        
                        lp.a_matrix_.start_ = np.array(A_start, dtype=np.int32)
                        lp.a_matrix_.index_ = np.array(A_index, dtype=np.int32)
                        lp.a_matrix_.value_ = np.array(A_value, dtype=np.float64)
                        
                        if any(v.is_integer for v in model.variables):
                            integrality = []
                            for v in model.variables:
                                if v.is_integer:
                                    integrality.append(highspy.HighsVarType.kInteger)
                                else:
                                    integrality.append(highspy.HighsVarType.kContinuous)
                            lp.integrality_ = integrality
                        
                        highs = highspy.Highs()
                        highs.passModel(lp)
                        highs.run()
                        
                        model_status = highs.getModelStatus()
                        if model_status == highspy.HighsModelStatus.kOptimal:
                            x = highs.getSolution().col_value
                            solution = {v.name: float(x[col_indices[v.name]]) for v in model.variables}
                            context['optimization_solution'] = solution
                            context['objective_value'] = float(highs.getObjectiveValue())
                            return {'step': len(context.keys()), 'node': node.data.get('label', '优化求解'),
                                    'status': 'success', 'input': f'modelId={model_id}', 'output': str(solution)}
                        else:
                            return {'step': len(context.keys()), 'node': node.data.get('label', '优化求解'),
                                    'status': 'error', 'input': f'modelId={model_id}', 'output': '求解失败'}
                    except Exception as e:
                        return {'step': len(context.keys()), 'node': node.data.get('label', '优化求解'),
                                'status': 'error', 'input': f'modelId={model_id}', 'output': str(e)}
                else:
                    return {'step': len(context.keys()), 'node': node.data.get('label', '优化求解'),
                            'status': 'error', 'input': f'modelId={model_id}', 'output': '模型不存在'}
            finally:
                db.close()
        
        elif node_type == 'object_access':
            config = node.data.get('config', {})
            ontology_id = config.get('ontologyId', '')
            object_type_id = config.get('objectTypeId', '')
            access_mode = config.get('access_mode', config.get('accessMode', '查询'))
            filter_condition = config.get('filter_condition', config.get('filterCondition', ''))
            output_variable = config.get('output_variable', config.get('outputVariable', 'query_result'))

            db = SessionLocal()
            try:
                query = db.query(OntologyInstance).filter(OntologyInstance.ontology_id == ontology_id)
                if object_type_id:
                    query = query.filter(OntologyInstance.object_type_id == object_type_id)
                instances = query.all()

                # Convert to list of dicts
                results = []
                for inst in instances:
                    try:
                        props = json.loads(inst.properties) if inst.properties else {}
                    except Exception:
                        props = {}
                    results.append({
                        'id': inst.id,
                        'ontology_id': inst.ontology_id,
                        'object_type_id': inst.object_type_id,
                        'properties': props,
                    })

                # Apply simple filter if provided
                if filter_condition and results:
                    filtered = []
                    for r in results:
                        try:
                            cond = filter_condition
                            # Replace ${var} with property values
                            def replace_prop(match, props=r['properties']):
                                var_name = match.group(1)
                                val = props.get(var_name, context.get(var_name, 'None'))
                                if isinstance(val, str):
                                    return f'"{val}"'
                                return str(val)
                            safe_cond = re.sub(r'\$\{(\w+)\}', replace_prop, cond)
                            if simple_eval(safe_cond):
                                filtered.append(r)
                        except Exception:
                            filtered.append(r)
                    results = filtered

                context[output_variable] = results
                context[f'{output_variable}_count'] = len(results)

                return {'step': len(context.keys()), 'node': node.data.get('label', '对象访问'),
                        'status': 'success',
                        'input': f'ontology_id={ontology_id}, object_type_id={object_type_id}',
                        'output': f'{len(results)} instances -> {output_variable}'}
            except Exception as e:
                context[output_variable] = []
                return {'step': len(context.keys()), 'node': node.data.get('label', '对象访问'),
                        'status': 'error',
                        'input': f'ontology_id={ontology_id}, object_type_id={object_type_id}',
                        'output': str(e)}
            finally:
                db.close()

        elif node_type == 'action':
            config = node.data.get('config', {})
            ontology_id = config.get('ontologyId', '')
            action_type_id = config.get('actionTypeId', '')
            action_type_label = config.get('action_type', config.get('actionType', '触发事件'))

            # Determine the action operation
            # Look up the action type from Neo4j to get target_model_id and operation info
            target_model_id = None
            operation = 'create'  # default
            try:
                if ontology_id and action_type_id:
                    query = """
                        MATCH (o:Ontology {id: $ontology_id})-[:HAS_ACTION_TYPE]->(at:ActionType {id: $action_type_id})
                        RETURN at.targetModelId as target_model_id, at.name as name,
                               at.displayName as display_name, at.inputSchema as input_schema
                    """
                    at_result = neo4j_client.execute_query(query, {
                        "ontology_id": ontology_id,
                        "action_type_id": action_type_id
                    })
                    if at_result:
                        target_model_id = at_result[0].get('target_model_id')
                        action_type_label = at_result[0].get('display_name') or at_result[0].get('name') or action_type_label
            except Exception as e:
                logger.warning(f"Failed to look up action type from Neo4j: {e}")

            # Execute the action based on type
            db = SessionLocal()
            try:
                if action_type_label in ('触发事件', '调用服务', '状态变更') and target_model_id:
                    # Create a new ontology instance
                    import uuid
                    instance_id = f"inst-{ontology_id}-{uuid.uuid4().hex[:8]}"
                    # Build properties from context
                    props = {}
                    input_params = config.get('input_params', '')
                    if input_params:
                        try:
                            props = json.loads(input_params) if isinstance(input_params, str) else input_params
                        except Exception:
                            props = {}
                    # Also merge matching context variables
                    for key, val in context.items():
                        if not key.startswith('__') and isinstance(val, (str, int, float, bool)):
                            props[key] = val

                    instance = OntologyInstance(
                        id=instance_id,
                        ontology_id=ontology_id,
                        object_type_id=target_model_id,
                        properties=json.dumps(props)
                    )
                    db.add(instance)
                    db.commit()
                    db.refresh(instance)

                    context['action_result'] = {
                        'status': 'created',
                        'instance_id': instance_id,
                        'ontology_id': ontology_id,
                        'object_type_id': target_model_id,
                        'properties': props,
                    }
                    return {'step': len(context.keys()), 'node': node.data.get('label', '行动执行'),
                            'status': 'success',
                            'input': f'action={action_type_label}, target={target_model_id}',
                            'output': f'created instance {instance_id}'}
                else:
                    # Generic action - record the action invocation
                    context['action_result'] = {
                        'status': 'executed',
                        'action_type': action_type_label,
                        'ontology_id': ontology_id,
                    }
                    return {'step': len(context.keys()), 'node': node.data.get('label', '行动执行'),
                            'status': 'success',
                            'input': f'action={action_type_label}',
                            'output': '行动已执行'}
            except Exception as e:
                context['action_result'] = {'status': 'error', 'error': str(e)}
                return {'step': len(context.keys()), 'node': node.data.get('label', '行动执行'),
                        'status': 'error',
                        'input': f'action={action_type_label}',
                        'output': str(e)}
            finally:
                db.close()

        elif node_type == 'end':
            return {'step': len(context.keys()), 'node': node.data.get('label', '结束'),
                    'status': 'success', 'input': '-', 'output': '执行完成'}
        
        else:
            return {'step': len(context.keys()), 'node': node.data.get('label', node.type),
                    'status': 'success', 'input': '-', 'output': '处理完成'}
    
    @staticmethod
    def get_next_nodes(flow: DecisionFlow, node_id: str, output=None):
        next_edges = [e for e in flow.edges if e.source == node_id]
        next_nodes = []
        
        for edge in next_edges:
            if edge.source_handle:
                if output is not None:
                    if str(output).lower() == str(edge.source_handle).lower():
                        target_node = next(n for n in flow.nodes if n.id == edge.target)
                        next_nodes.append(target_node)
                elif edge.source_handle in ['yes', 'true', 'a', '1']:
                    target_node = next(n for n in flow.nodes if n.id == edge.target)
                    next_nodes.append(target_node)
            else:
                target_node = next(n for n in flow.nodes if n.id == edge.target)
                next_nodes.append(target_node)
        
        return next_nodes

@router.get("/", response_model=List[DecisionFlow], tags=["决策流程"])
async def list_flows():
    db = SessionLocal()
    try:
        flows = db.query(DecisionFlowDB).all()
        return [db_to_flow(f) for f in flows]
    finally:
        db.close()

@router.get("/{flow_id}", response_model=DecisionFlow, tags=["决策流程"])
async def get_flow(flow_id: str):
    db = SessionLocal()
    try:
        db_flow = db.query(DecisionFlowDB).filter(DecisionFlowDB.id == flow_id).first()
        if not db_flow:
            raise HTTPException(status_code=404, detail="Flow not found")
        return db_to_flow(db_flow)
    finally:
        db.close()

@router.post("/", response_model=DecisionFlow, status_code=status.HTTP_201_CREATED, tags=["决策流程"])
async def create_flow(flow: DecisionFlow):
    db = SessionLocal()
    try:
        now = datetime.now()
        db_flow = DecisionFlowDB(
            id=flow.id,
            name=flow.name,
            description=flow.description,
            status=flow.status or "draft",
            tags=json.dumps(flow.tags),
            nodes=json.dumps([n.model_dump() for n in flow.nodes]),
            edges=json.dumps([e.model_dump(by_alias=True) for e in flow.edges]),
            node_count=flow.node_count or len(flow.nodes),
            created_at=now,
            updated_at=now,
        )
        db.add(db_flow)
        db.commit()
        db.refresh(db_flow)
        logger.info(f"Created decision flow: {flow.name}")
        return db_to_flow(db_flow)
    finally:
        db.close()

@router.put("/{flow_id}", response_model=DecisionFlow, tags=["决策流程"])
async def update_flow(flow_id: str, flow: DecisionFlow):
    db = SessionLocal()
    try:
        db_flow = db.query(DecisionFlowDB).filter(DecisionFlowDB.id == flow_id).first()
        if not db_flow:
            raise HTTPException(status_code=404, detail="Flow not found")
        db_flow.name = flow.name
        db_flow.description = flow.description
        db_flow.status = flow.status
        db_flow.tags = json.dumps(flow.tags)
        db_flow.nodes = json.dumps([n.model_dump() for n in flow.nodes])
        db_flow.edges = json.dumps([e.model_dump(by_alias=True) for e in flow.edges])
        db_flow.node_count = flow.node_count or len(flow.nodes)
        db_flow.updated_at = datetime.now()
        db.commit()
        db.refresh(db_flow)
        logger.info(f"Updated decision flow: {flow.name}")
        return db_to_flow(db_flow)
    finally:
        db.close()

@router.delete("/{flow_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["决策流程"])
async def delete_flow(flow_id: str):
    db = SessionLocal()
    try:
        db_flow = db.query(DecisionFlowDB).filter(DecisionFlowDB.id == flow_id).first()
        if not db_flow:
            raise HTTPException(status_code=404, detail="Flow not found")
        db.delete(db_flow)
        db.commit()
        logger.info(f"Deleted decision flow: {flow_id}")
    finally:
        db.close()

@router.post("/{flow_id}/execute", response_model=ExecutionResult, tags=["决策流程"])
async def execute_flow(flow_id: str, input_data: Optional[Dict[str, Any]] = None):
    db = SessionLocal()
    try:
        db_flow = db.query(DecisionFlowDB).filter(DecisionFlowDB.id == flow_id).first()
        if not db_flow:
            raise HTTPException(status_code=404, detail="Flow not found")
    finally:
        db.close()
    
    flow = db_to_flow(db_flow)
    
    try:
        result = await FlowEngine.execute(flow, input_data or {})
        logger.info(f"Executed flow {flow_id} successfully")
        return result
    except Exception as e:
        logger.error(f"Error executing flow {flow_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
