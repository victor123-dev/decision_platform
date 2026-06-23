from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.database.sqlite_client import SessionLocal
from app.database.sqlite_models import DecisionFlowDB, RuleSet, Rule, OptimizationModelDB, OntologyInstance
from app.database import get_db
from app.database.neo4j_client import neo4j_client
from app.services.solver_adapters import SolverAdapterFactory
import logging
import json
import re
from ortools.linear_solver import pywraplp
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
                    problem_type = db_model.problem_type or "LP"
                    try:
                        if problem_type == "CP_SAT":
                            # CP-SAT 路径 - 使用适配器工厂
                            adapter = SolverAdapterFactory.create(problem_type)
                            algorithm_config = json.loads(db_model.algorithm_config or "{}")
                            solver_config = json.loads(db_model.solver_config or "{}")

                            model_data = {
                                "intVars": algorithm_config.get("intVars", []),
                                "boolVars": algorithm_config.get("boolVars", []),
                                "intervalVars": algorithm_config.get("intervalVars", []),
                                "linearConstraints": algorithm_config.get("linearConstraints", []),
                                "globalConstraints": algorithm_config.get("globalConstraints", []),
                                "objective": algorithm_config.get("objective"),
                            }

                            result = adapter.solve(model_data, solver_config)
                            solve_status = result.get("status", "unknown")

                            if solve_status in ("optimal", "feasible"):
                                solution = result.get("solution", {})
                                context['optimization_solution'] = solution
                                context['objective_value'] = result.get("objective_value")
                                return {'step': len(context.keys()), 'node': node.data.get('label', '优化求解'),
                                        'status': 'success', 'input': f'modelId={model_id}', 'output': str(solution)}
                            else:
                                return {'step': len(context.keys()), 'node': node.data.get('label', '优化求解'),
                                        'status': 'error', 'input': f'modelId={model_id}', 'output': f'求解失败: {solve_status}'}

                        # LP/MIP 路径 - 保持原有逻辑
                        from app.routers.optimization import OptimizationModel, OptimizationVariable, OptimizationConstraint, OptimizationObjective
                        variables = [OptimizationVariable(**v) for v in json.loads(db_model.variables or "[]")]
                        constraints = [OptimizationConstraint(**c) for c in json.loads(db_model.constraints or "[]")]
                        objective = OptimizationObjective(**json.loads(db_model.objective_expression or "{}"))
                        model = OptimizationModel(
                            id=db_model.id,
                            name=db_model.name,
                            description=db_model.description or "",
                            problem_type=problem_type,
                            status=db_model.status or "draft",
                            variables=variables,
                            constraints=constraints,
                            objective=objective,
                        )

                        col_indices = {v.name: i for i, v in enumerate(model.variables)}

                        solver = pywraplp.Solver.CreateSolver('SCIP')
                        if not solver:
                            solver = pywraplp.Solver.CreateSolver('CBC')
                        if not solver:
                            raise RuntimeError('无法创建 OR-Tools 求解器')

                        # 创建变量
                        vars_list = []
                        for v in model.variables:
                            lb = v.lower_bound if v.lower_bound is not None else 0.0
                            ub = v.upper_bound if v.upper_bound else solver.infinity()
                            if hasattr(v, 'is_integer') and v.is_integer:
                                vars_list.append(solver.IntVar(lb, ub, v.name))
                            else:
                                vars_list.append(solver.NumVar(lb, ub, v.name))

                        # 目标函数
                        obj = solver.Objective()
                        for term in model.objective.expression.replace(' ', '').split('+'):
                            if term:
                                if '*' in term:
                                    coeff, var = term.split('*')
                                    idx = col_indices.get(var)
                                    if idx is not None:
                                        obj.SetCoefficient(vars_list[idx], float(coeff))
                                else:
                                    idx = col_indices.get(term)
                                    if idx is not None:
                                        obj.SetCoefficient(vars_list[idx], 1.0)

                        if model.objective.sense == 'max':
                            obj.SetMaximization()
                        else:
                            obj.SetMinimization()

                        # 约束条件
                        for constraint in model.constraints:
                            if constraint.operator == '<=':
                                c = solver.Constraint(-solver.infinity(), constraint.rhs)
                            elif constraint.operator == '>=':
                                c = solver.Constraint(constraint.rhs, solver.infinity())
                            elif constraint.operator == '==':
                                c = solver.Constraint(constraint.rhs, constraint.rhs)
                            else:
                                continue

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
                                    idx = col_indices.get(var_name)
                                    if idx is not None:
                                        c.SetCoefficient(vars_list[idx], coeff)

                        # 求解
                        status = solver.Solve()
                        if status == pywraplp.Solver.OPTIMAL:
                            solution = {v.name: vars_list[col_indices[v.name]].solution_value() for v in model.variables}
                            context['optimization_solution'] = solution
                            context['objective_value'] = solver.Objective().Value()
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

        # --- JVS 规则引擎新增节点 (v3 — 对齐JVS属性配置规范v3) ---

        elif node_type == 'assignment':
            config = node.data.get('config', {})
            target_variable = config.get('target_variable', 'result')
            variable_type = config.get('variable_type', '字符串')
            assignment_mode = config.get('assignment_mode', '基础赋值')
            value_source = config.get('value_source', '固定值')
            fixed_value = config.get('fixed_value', '')
            ref_variable = config.get('ref_variable', '')
            expression = config.get('expression', '')
            condition_expression = config.get('condition_expression', '')
            mapping_rules_raw = config.get('mapping_rules', '[]')
            default_value = config.get('default_value', '')

            try:
                mapping_rules = json.loads(mapping_rules_raw) if isinstance(mapping_rules_raw, str) else mapping_rules_raw
            except Exception:
                mapping_rules = []

            def replace_var(match):
                var_name = match.group(1)
                val = context.get(var_name, '')
                if isinstance(val, str):
                    return f'"{val}"'
                return str(val)

            result = default_value
            try:
                if assignment_mode == '基础赋值':
                    if value_source == '固定值':
                        result = fixed_value
                    elif value_source == '引用变量':
                        result = context.get(ref_variable, default_value)
                    elif value_source == '表达式':
                        resolved_expr = re.sub(r'\$\{(\w+)\}', replace_var, expression)
                        result = simple_eval(resolved_expr)
                    elif value_source == '函数计算':
                        resolved_expr = re.sub(r'\$\{(\w+)\}', replace_var, expression)
                        result = simple_eval(resolved_expr)
                    elif value_source == '节点结果':
                        result = context.get(ref_variable, default_value)
                    else:
                        result = fixed_value
                elif assignment_mode == '映射赋值':
                    source_val = context.get(ref_variable, None)
                    result = default_value
                    if source_val is not None:
                        for rule in mapping_rules:
                            match_val = rule.get('match', rule.get('source', ''))
                            assign_val = rule.get('value', rule.get('target', ''))
                            if str(source_val) == str(match_val):
                                result = assign_val
                                break
                elif assignment_mode == '条件赋值':
                    resolved_cond = re.sub(r'\$\{(\w+)\}', replace_var, condition_expression)
                    try:
                        cond_met = simple_eval(resolved_cond)
                    except Exception:
                        cond_met = False
                    if cond_met:
                        if value_source in ('表达式', '函数计算'):
                            resolved_expr = re.sub(r'\$\{(\w+)\}', replace_var, expression)
                            result = simple_eval(resolved_expr)
                        elif value_source == '引用变量':
                            result = context.get(ref_variable, default_value)
                        else:
                            result = fixed_value
                    else:
                        result = default_value

                # Type coercion based on variable_type
                if variable_type == '整数':
                    result = int(float(result)) if result != '' and result is not None else 0
                elif variable_type == '小数':
                    result = float(result) if result != '' and result is not None else 0.0
                elif variable_type == '布尔':
                    result = bool(result)
                elif variable_type == '日期':
                    result = str(result)
                elif variable_type == '集合':
                    if isinstance(result, str):
                        try:
                            result = json.loads(result)
                        except Exception:
                            result = [result]
            except Exception as e:
                logger.warning(f"Assignment expression error: {e}")
                result = default_value if default_value else None

            context[target_variable] = result
            return {'step': len(context.keys()), 'node': node.data.get('label', '赋值'),
                    'status': 'success',
                    'input': f'{target_variable} = ({assignment_mode}/{value_source})',
                    'output': f'{target_variable} = {result}'}

        elif node_type == 'simple_scorecard':
            config = node.data.get('config', {})
            base_score = config.get('base_score', 0)
            score_items_raw = config.get('score_items', '[]')
            score_sum_enabled = config.get('score_sum', True)
            weight_sum_enabled = config.get('weight_sum', False)
            result_variable = config.get('result_variable', 'scorecard_score')
            min_score = config.get('min_score', None)
            max_score = config.get('max_score', None)
            evaluation_dims_raw = config.get('evaluation_dimensions', '[]')

            try:
                score_items = json.loads(score_items_raw) if isinstance(score_items_raw, str) else score_items_raw
            except Exception:
                score_items = []
            try:
                evaluation_dims = json.loads(evaluation_dims_raw) if isinstance(evaluation_dims_raw, str) else evaluation_dims_raw
            except Exception:
                evaluation_dims = []

            matched_scores = []
            matched_items = []
            total_weight = 0.0

            for item in score_items:
                variable_name = item.get('variable_name', '')
                variable_type = item.get('variable_type', '小数')
                weight_str = str(item.get('weight', '100%')).replace('%', '')
                scoring_condition = item.get('scoring_condition', '')
                value_source = item.get('value_source', '固定值')
                value = item.get('value', 0)
                note = item.get('note', '')

                try:
                    weight = float(weight_str) / 100.0
                except (ValueError, TypeError):
                    weight = 1.0

                context_val = context.get(variable_name)
                if context_val is None:
                    continue

                # Parse scoring condition like "当 '年龄' 大于等于 18 时"
                condition_matched = True
                if scoring_condition and scoring_condition not in ('请输入', '-'):
                    condition_matched = True
                    try:
                        for op_cn, op_py in [('大于等于', '>='), ('小于等于', '<='), ('等于', '=='), ('大于', '>'), ('小于', '<'), ('不等于', '!=')]:
                            if op_cn in scoring_condition:
                                parts = scoring_condition.split(op_cn)
                                if len(parts) >= 2:
                                    threshold_str = parts[-1].strip().replace('时', '').strip()
                                    try:
                                        threshold = float(threshold_str)
                                        ctx_val = float(context_val)
                                    except (ValueError, TypeError):
                                        threshold = threshold_str
                                        ctx_val = str(context_val)
                                    condition_matched = simple_eval(f'{repr(ctx_val)} {op_py} {repr(threshold)}')
                                    break
                    except Exception as e:
                        logger.warning(f"Scorecard condition parse error: {e}")
                        condition_matched = True

                if condition_matched:
                    if value_source == '固定值':
                        score_val = float(value) if value else 0
                    else:
                        score_val = float(context.get(str(value), value)) if value else 0

                    weighted_score = score_val * weight if weight_sum_enabled else score_val
                    matched_scores.append(weighted_score)
                    matched_items.append({'variable': variable_name, 'score': score_val, 'weight': weight, 'note': note})
                    total_weight += weight

            subtotal = sum(matched_scores) if score_sum_enabled else (matched_scores[-1] if matched_scores else 0)
            total = float(base_score) + subtotal

            # Clamp to min/max score range
            if min_score is not None and total < min_score:
                total = min_score
            if max_score is not None and total > max_score:
                total = max_score

            context[result_variable] = round(total, 2)
            context['scorecard_result'] = matched_items
            context['scorecard_score'] = round(total, 2)
            context['scorecard_base'] = base_score
            context['scorecard_weight_sum'] = round(total_weight, 2)

            return {'step': len(context.keys()), 'node': node.data.get('label', '简单评分卡'),
                    'status': 'success',
                    'input': f'base={base_score}, {len(score_items)} 评分项',
                    'output': f'{result_variable}={round(total, 2)}, matched={len(matched_items)}'}

        elif node_type == 'complex_scorecard':
            config = node.data.get('config', {})
            scoring_rules_raw = config.get('scoring_rules', '[]')
            scoring_dims_raw = config.get('scoring_dimensions', '[]')
            aggregation = config.get('aggregation', '加权求和')
            result_variable = config.get('result_variable', 'complex_scorecard_score')
            weight_check = config.get('weight_check', False)
            normalization = config.get('normalization', False)
            min_score = config.get('min_score', None)
            max_score = config.get('max_score', None)

            try:
                scoring_dims = json.loads(scoring_dims_raw) if isinstance(scoring_dims_raw, str) else scoring_dims_raw
            except Exception:
                scoring_dims = []
            try:
                scoring_rules = json.loads(scoring_rules_raw) if isinstance(scoring_rules_raw, str) else scoring_rules_raw
            except Exception:
                scoring_rules = []

            dimension_results = []

            def eval_level_condition(cond, ctx):
                """Evaluate a JVS-style level condition."""
                if not cond or cond in ('-', '未设置'):
                    return True
                try:
                    for op_cn, op_py in [('大于等于', '>='), ('小于等于', '<='), ('等于', '=='), ('大于', '>'), ('小于', '<'), ('不等于', '!=')]:
                        if op_cn in cond:
                            parts = cond.split(op_cn)
                            if len(parts) >= 2:
                                var_match = re.search(r"'(\w+)'", parts[0])
                                threshold_str = parts[-1].strip().replace('时', '').strip()
                                if var_match:
                                    var_name = var_match.group(1)
                                    ctx_val = ctx.get(var_name, None)
                                    if ctx_val is not None:
                                        try:
                                            threshold = float(threshold_str)
                                            ctx_val = float(ctx_val)
                                        except (ValueError, TypeError):
                                            threshold = threshold_str
                                            ctx_val = str(ctx_val)
                                        return simple_eval(f'{repr(ctx_val)} {op_py} {repr(threshold)}')
                                    else:
                                        return False
                            break
                except Exception as e:
                    logger.warning(f"Complex scorecard condition parse error: {e}")
                return True

            if scoring_dims:
                for dim in scoring_dims:
                    dim_name = dim.get('name', 'unknown')
                    weight = dim.get('weight', 1.0)
                    rules = dim.get('rules', [])
                    dim_score = 0

                    for rule in rules:
                        rule_matched = True
                        for level_key in ['level1', 'level2', 'level3']:
                            cond = rule.get(level_key, '')
                            if not eval_level_condition(cond, context):
                                rule_matched = False
                                break

                        if rule_matched:
                            dim_score = rule.get('value', 0)
                            break

                    dimension_results.append({
                        'name': dim_name,
                        'weight': weight,
                        'score': dim_score,
                        'weighted_score': dim_score * weight,
                    })
            elif scoring_rules:
                for rule in scoring_rules:
                    rule_matched = True
                    for level_key in ['level1_condition', 'level2_condition', 'level3_condition']:
                        cond = rule.get(level_key, '')
                        if not eval_level_condition(cond, context):
                            rule_matched = False
                            break

                    if rule_matched:
                        dimension_results.append({
                            'name': rule.get('note', 'rule'),
                            'weight': 1.0,
                            'score': rule.get('value', 0),
                            'weighted_score': rule.get('value', 0),
                        })
                        break

            # Weight validation
            if weight_check and dimension_results:
                total_weight = sum(d['weight'] for d in dimension_results)
                if abs(total_weight - 1.0) > 0.01:
                    logger.warning(f"Complex scorecard weight check failed: sum={total_weight}")

            # Aggregate
            if aggregation == '加权求和':
                total = sum(d['weighted_score'] for d in dimension_results)
            elif aggregation == '加权平均':
                tw = sum(d['weight'] for d in dimension_results)
                total = (sum(d['weighted_score'] for d in dimension_results) / tw) if tw else 0
            elif aggregation == '取最高维度分':
                total = max((d['weighted_score'] for d in dimension_results), default=0)
            elif aggregation == '取最低维度分':
                total = min((d['weighted_score'] for d in dimension_results), default=0)
            else:
                total = sum(d['weighted_score'] for d in dimension_results)

            # Normalization
            if normalization and dimension_results:
                max_possible = max((d['score'] for d in dimension_results), default=1)
                if max_possible > 0:
                    total = total / max_possible * 100

            # Clamp to min/max
            if min_score is not None and total < min_score:
                total = min_score
            if max_score is not None and total > max_score:
                total = max_score

            context[result_variable] = round(total, 2)
            context['complex_scorecard_result'] = dimension_results
            context['complex_scorecard_score'] = round(total, 2)

            return {'step': len(context.keys()), 'node': node.data.get('label', '复杂评分卡'),
                    'status': 'success',
                    'input': f'{len(scoring_dims or scoring_rules)} rules/dims, aggregation={aggregation}',
                    'output': f'{result_variable}={round(total, 2)}'}

        elif node_type == 'decision_table':
            config = node.data.get('config', {})
            condition_variables_raw = config.get('condition_variables', '[]')
            decision_rules_raw = config.get('decision_rules', '[]')
            result_vars_raw = config.get('result_variables', '[]')
            default_result = config.get('default_result', '')
            hit_policy = config.get('hit_policy', '首次命中')
            priority_field = config.get('priority_field', 'priority')

            try:
                condition_variables = json.loads(condition_variables_raw) if isinstance(condition_variables_raw, str) else condition_variables_raw
            except Exception:
                condition_variables = []
            try:
                decision_rules = json.loads(decision_rules_raw) if isinstance(decision_rules_raw, str) else decision_rules_raw
            except Exception:
                decision_rules = []
            try:
                result_variables = json.loads(result_vars_raw) if isinstance(result_vars_raw, str) else result_vars_raw
            except Exception:
                result_variables = []

            # Initialize result variables with defaults
            for rv in result_variables:
                rv_name = rv.get('name', '')
                rv_default = rv.get('default', '')
                if rv_name:
                    context[rv_name] = rv_default

            def evaluate_structured_condition(ctx_val, cond_obj):
                """Evaluate a structured condition: {operator, value_source, value}"""
                if isinstance(cond_obj, str):
                    # Legacy string condition fallback
                    cond_str = cond_obj.strip()
                    if not cond_str or cond_str in ('-', '*'):
                        return True
                    for op_cn, op_py in [('大于等于', '>='), ('小于等于', '<='), ('不等于', '!='), ('等于', '=='), ('大于', '>'), ('小于', '<')]:
                        if cond_str.startswith(op_cn):
                            cmp_val_str = cond_str[len(op_cn):].strip()
                            try:
                                cmp_val = float(cmp_val_str)
                                c_val = float(ctx_val)
                            except (ValueError, TypeError):
                                cmp_val = cmp_val_str
                                c_val = str(ctx_val)
                            return simple_eval(f'{repr(c_val)} {op_py} {repr(cmp_val)}')
                    try:
                        return float(ctx_val) == float(cond_str)
                    except (ValueError, TypeError):
                        return str(ctx_val) == str(cond_str)

                # Structured condition object
                operator_cn = cond_obj.get('operator', '等于')
                value_source = cond_obj.get('value_source', '固定值')
                cond_value = cond_obj.get('value', '')

                if value_source == '引用变量':
                    cmp_val = context.get(cond_value, cond_value)
                else:
                    cmp_val = cond_value

                if not operator_cn or operator_cn == '-':
                    return True

                op_map = {'大于等于': '>=', '小于等于': '<=', '等于': '==', '大于': '>', '小于': '<', '不等于': '!='}
                op_py = op_map.get(operator_cn, '==')

                try:
                    try:
                        cmp_v = float(cmp_val)
                        ctx_v = float(ctx_val)
                    except (ValueError, TypeError):
                        cmp_v = str(cmp_val)
                        ctx_v = str(ctx_val)
                    return simple_eval(f'{repr(ctx_v)} {op_py} {repr(cmp_v)}')
                except Exception:
                    return False

            # Sort rules by priority if using priority-based policy
            if hit_policy in ('优先匹配', '优先级命中'):
                def get_priority(r):
                    return r.get(priority_field, r.get('priority', 999))
                decision_rules = sorted(decision_rules, key=get_priority)

            matched_rules = []
            for rule in decision_rules:
                conditions = rule.get('conditions', {})
                all_match = True
                for var_name, cond_obj in conditions.items():
                    ctx_val = context.get(var_name)
                    if ctx_val is None:
                        all_match = False
                        break
                    if not evaluate_structured_condition(ctx_val, cond_obj):
                        all_match = False
                        break
                if all_match:
                    matched_rules.append(rule)

            # Apply hit policy
            if hit_policy in ('全部收集',):
                result_list = matched_rules if matched_rules else []
            elif hit_policy in ('优先匹配', '优先级命中'):
                result_list = [matched_rules[0]] if matched_rules else []
            elif hit_policy == '首次命中':
                result_list = [matched_rules[0]] if matched_rules else []
            elif hit_policy == '最近修改优先':
                result_list = [matched_rules[-1]] if matched_rules else []
            elif hit_policy == '唯一命中':
                result_list = [matched_rules[0]] if len(matched_rules) == 1 else []
            else:
                result_list = [matched_rules[0]] if matched_rules else []

            # Apply actions from matched rules to context
            for matched_rule in result_list:
                actions = matched_rule.get('actions', {})
                for act_var, act_obj in actions.items():
                    if isinstance(act_obj, dict):
                        act_source = act_obj.get('source', '固定值')
                        act_value = act_obj.get('value', '')
                        if act_source == '引用变量':
                            context[act_var] = context.get(act_value, act_value)
                        elif act_source == '表达式':
                            def replace_act_var(match):
                                vn = match.group(1)
                                vv = context.get(vn, '')
                                if isinstance(vv, str):
                                    return f'"{vv}"'
                                return str(vv)
                            resolved = re.sub(r'\$\{(\w+)\}', replace_act_var, str(act_value))
                            try:
                                context[act_var] = simple_eval(resolved)
                            except Exception:
                                context[act_var] = act_value
                        else:
                            context[act_var] = act_value
                    else:
                        context[act_var] = act_obj

            # Store decision table metadata
            if result_list:
                context['decision_table_result'] = result_list[0] if len(result_list) == 1 else result_list
            else:
                context['decision_table_result'] = {'default': default_result}
            context['decision_table_matched_count'] = len(matched_rules)

            return {'step': len(context.keys()), 'node': node.data.get('label', '决策表'),
                    'status': 'success',
                    'input': f'{len(decision_rules)} rules, policy={hit_policy}',
                    'output': f'matched={len(matched_rules)}'}

        elif node_type == 'cross_decision_table':
            config = node.data.get('config', {})
            row_variable = config.get('row_variable', '')
            column_variable = config.get('column_variable', '')
            row_keys_raw = config.get('row_keys', '[]')
            column_keys_raw = config.get('column_keys', '[]')
            matrix_values_raw = config.get('matrix_values', '[]')
            default_value = config.get('default_value', '')
            result_variable = config.get('result_variable', 'cross_decision_result')
            row_operator = config.get('row_operator', '精确匹配')
            column_operator = config.get('column_operator', '精确匹配')
            result_type = config.get('result_type', '')

            try:
                row_keys = json.loads(row_keys_raw) if isinstance(row_keys_raw, str) else row_keys_raw
            except Exception:
                row_keys = []
            try:
                column_keys = json.loads(column_keys_raw) if isinstance(column_keys_raw, str) else column_keys_raw
            except Exception:
                column_keys = []
            try:
                matrix_values = json.loads(matrix_values_raw) if isinstance(matrix_values_raw, str) else matrix_values_raw
            except Exception:
                matrix_values = []

            row_val = context.get(row_variable, '')
            col_val = context.get(column_variable, '')

            def find_key_index(keys, val, operator):
                """Find the matching key index based on operator type."""
                val_str = str(val)
                for i, k in enumerate(keys):
                    k_str = str(k)
                    if operator == '精确匹配':
                        if k_str == val_str:
                            return i
                    elif operator == '范围匹配':
                        # Key format: "min~max" or "min-max"
                        if '~' in k_str:
                            parts = k_str.split('~')
                            try:
                                low = float(parts[0].strip())
                                high = float(parts[1].strip()) if len(parts) > 1 else float('inf')
                                if low <= float(val_str) < high:
                                    return i
                            except (ValueError, TypeError):
                                pass
                        elif '-' in k_str and k_str.count('-') == 1:
                            parts = k_str.split('-')
                            try:
                                low = float(parts[0].strip())
                                high = float(parts[1].strip())
                                if low <= float(val_str) < high:
                                    return i
                            except (ValueError, TypeError):
                                pass
                        else:
                            if k_str == val_str:
                                return i
                    elif operator == '模糊匹配':
                        if k_str in val_str or val_str in k_str:
                            return i
                    else:
                        if k_str == val_str:
                            return i
                return None

            row_idx = find_key_index(row_keys, row_val, row_operator)
            col_idx = find_key_index(column_keys, col_val, column_operator)

            if row_idx is not None and col_idx is not None:
                try:
                    result = matrix_values[row_idx][col_idx]
                except (IndexError, TypeError):
                    result = default_value
            else:
                result = default_value

            # Type coercion based on result_type
            if result_type == '整数':
                try:
                    result = int(float(result))
                except (ValueError, TypeError):
                    pass
            elif result_type == '小数':
                try:
                    result = float(result)
                except (ValueError, TypeError):
                    pass

            context[result_variable] = result
            context['cross_decision_result'] = result

            return {'step': len(context.keys()), 'node': node.data.get('label', '交叉决策表'),
                    'status': 'success',
                    'input': f'row={row_variable}={row_val}, col={column_variable}={col_val}',
                    'output': f'{result_variable}={result}'}

        elif node_type == 'decision_tree':
            config = node.data.get('config', {})
            tree_nodes_raw = config.get('tree_nodes', '[]')
            root_node_id = config.get('root_node_id', 'root')
            default_value = config.get('default_value', '')
            default_result_variable = config.get('default_result_variable', 'decision_tree_result')
            max_depth = config.get('max_depth', 20)
            supported_operators_raw = config.get('supported_operators', '[]')

            try:
                tree_nodes = json.loads(tree_nodes_raw) if isinstance(tree_nodes_raw, str) else tree_nodes_raw
            except Exception:
                tree_nodes = []
            try:
                supported_operators = json.loads(supported_operators_raw) if isinstance(supported_operators_raw, str) else supported_operators_raw
            except Exception:
                supported_operators = []

            node_map = {n['id']: n for n in tree_nodes}

            op_map = {'大于等于': '>=', '小于等于': '<=', '等于': '==', '大于': '>', '小于': '<', '不等于': '!='}

            def evaluate_tree_node(tn, depth=0):
                if depth > max_depth:
                    return default_value, default_result_variable
                node_type_inner = tn.get('type', 'action')
                if node_type_inner == 'action':
                    result_val = tn.get('result_value', default_value)
                    result_var = tn.get('result_variable', default_result_variable)
                    result_source = tn.get('result_source', '固定值')
                    if result_source == '引用变量':
                        result_val = context.get(result_val, result_val)
                    elif result_source == '表达式':
                        def replace_tree_var(match):
                            vn = match.group(1)
                            vv = context.get(vn, '')
                            if isinstance(vv, str):
                                return f'"{vv}"'
                            return str(vv)
                        resolved = re.sub(r'\$\{(\w+)\}', replace_tree_var, str(result_val))
                        try:
                            result_val = simple_eval(resolved)
                        except Exception:
                            pass
                    return result_val, result_var

                # condition node
                variable = tn.get('variable', '')
                operator_cn = tn.get('operator', '等于')
                value_source = tn.get('value_source', '固定值')
                value = tn.get('value', '')
                true_child = tn.get('true_child', '')
                false_child = tn.get('false_child', '')

                context_val = context.get(variable)
                if context_val is None:
                    return default_value, default_result_variable

                # Resolve comparison value
                if value_source == '引用变量':
                    cmp_val = context.get(value, value)
                else:
                    cmp_val = value

                op_py = op_map.get(operator_cn, '==')

                try:
                    try:
                        cmp_v = float(cmp_val)
                        ctx_v = float(context_val)
                    except (ValueError, TypeError):
                        cmp_v = str(cmp_val)
                        ctx_v = str(context_val)
                    eval_result = simple_eval(f'{repr(ctx_v)} {op_py} {repr(cmp_v)}')
                except Exception:
                    eval_result = False

                next_id = true_child if eval_result else false_child
                if not next_id:
                    return default_value, default_result_variable
                next_node = node_map.get(next_id)
                if next_node is None:
                    return default_value, default_result_variable
                return evaluate_tree_node(next_node, depth + 1)

            root = node_map.get(root_node_id)
            if root is None:
                tree_result = default_value
                result_var = default_result_variable
            else:
                tree_result, result_var = evaluate_tree_node(root)

            context[result_var] = tree_result
            context['decision_tree_result'] = tree_result

            return {'step': len(context.keys()), 'node': node.data.get('label', '决策树'),
                    'status': 'success',
                    'input': f'root={root_node_id}, {len(tree_nodes)} nodes',
                    'output': f'{result_var}={tree_result}'}

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
