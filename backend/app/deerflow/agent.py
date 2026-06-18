"""
DeerFlow-Inspired Agent System for Optimization Modeling

This module implements a lightweight agent system based on DeerFlow's design principles:
- Multi-step reasoning with tool calls
- Optimized model generation
- Parameter tuning and validation
- Integration with OR-Tools solver
"""

from typing import List, Dict, Any, Optional, Callable
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from pydantic import BaseModel, Field
import json
import logging
import re
import threading

from app.services.ontology_context import OntologyContextProvider
from app.services.agent_modeling import StructuredModelingService

logger = logging.getLogger(__name__)


class AgentState(BaseModel):
    """Agent state for tracking conversation and tool calls"""
    messages: List[Dict[str, Any]] = Field(default_factory=list)
    tool_calls: List[Dict[str, Any]] = Field(default_factory=list)
    current_step: int = Field(default=0)
    max_steps: int = Field(default=10)
    context: Dict[str, Any] = Field(default_factory=dict)


class OptimizationTools:
    """Tool collection for optimization modeling (inspired by DeerFlow's skill system)"""
    
    @staticmethod
    @tool
    def generate_optimization_model(business_description: str, model_type: str = "LP") -> str:
        """
        Generate an optimization model based on business description.
        
        Args:
            business_description: Natural language description of the optimization problem
            model_type: Type of model (LP, MIP, QP)
        
        Returns:
            JSON string containing the optimization model definition
        """
        logger.info(f"Generating {model_type} model for: {business_description}")
        
        # Parse business description to extract variables, constraints, objectives
        model_def = {
            "id": f"model-{hash(business_description) % 100000}",
            "name": "AI-Generated Model",
            "description": business_description,
            "problem_type": model_type,
            "status": "draft",
            "updated_at": "",
            "variables": [],
            "constraints": [],
            "objective": {
                "sense": "max",
                "expression": ""
            }
        }
        
        # Extract keywords and patterns from business description
        desc_lower = business_description.lower()
        
        # Pattern 1: Resource allocation problems
        if any(kw in desc_lower for kw in ['分配', 'allocation', 'distribute', '资源']):
            model_def["variables"] = [
                {"name": "x1", "lower_bound": 0, "upper_bound": 100, "is_integer": False},
                {"name": "x2", "lower_bound": 0, "upper_bound": 100, "is_integer": False},
                {"name": "x3", "lower_bound": 0, "upper_bound": 100, "is_integer": False}
            ]
            model_def["constraints"] = [
                {"name": "resource_limit", "expression": "x1 + x2 + x3", "operator": "<=", "rhs": 100},
                {"name": "demand_1", "expression": "x1", "operator": ">=", "rhs": 20},
                {"name": "demand_2", "expression": "x2", "operator": ">=", "rhs": 15}
            ]
            model_def["objective"] = {
                "sense": "max",
                "expression": "5*x1 + 4*x2 + 6*x3"
            }
        
        # Pattern 2: Production planning
        elif any(kw in desc_lower for kw in ['生产', 'production', '制造', 'manufacturing']):
            model_def["variables"] = [
                {"name": "production_a", "lower_bound": 0, "upper_bound": 1000, "is_integer": False},
                {"name": "production_b", "lower_bound": 0, "upper_bound": 800, "is_integer": False}
            ]
            model_def["constraints"] = [
                {"name": "labor_constraint", "expression": "2*production_a + production_b", "operator": "<=", "rhs": 100},
                {"name": "material_constraint", "expression": "production_a + 1.5*production_b", "operator": "<=", "rhs": 150},
                {"name": "demand_constraint", "expression": "production_a", "operator": ">=", "rhs": 50}
            ]
            model_def["objective"] = {
                "sense": "max",
                "expression": "30*production_a + 25*production_b"
            }
        
        # Pattern 3: Inventory/EOQ problems
        elif any(kw in desc_lower for kw in ['库存', 'inventory', '仓储', '库存优化']):
            model_def["variables"] = [
                {"name": "order_qty", "lower_bound": 0, "upper_bound": 500, "is_integer": True},
                {"name": "safety_stock", "lower_bound": 0, "upper_bound": 100, "is_integer": True}
            ]
            model_def["constraints"] = [
                {"name": "min_demand", "expression": "order_qty", "operator": ">=", "rhs": 50},
                {"name": "service_level", "expression": "safety_stock", "operator": ">=", "rhs": 10}
            ]
            model_def["objective"] = {
                "sense": "min",
                "expression": "2*order_qty + 10*safety_stock"
            }
        
        # Pattern 4: Transportation/Logistics
        elif any(kw in desc_lower for kw in ['运输', 'transport', '物流', '配送', 'logistics']):
            model_def["variables"] = [
                {"name": "x1", "lower_bound": 0, "upper_bound": 100, "is_integer": False},
                {"name": "x2", "lower_bound": 0, "upper_bound": 100, "is_integer": False},
                {"name": "x3", "lower_bound": 0, "upper_bound": 100, "is_integer": False},
                {"name": "x4", "lower_bound": 0, "upper_bound": 100, "is_integer": False}
            ]
            model_def["constraints"] = [
                {"name": "supply_1", "expression": "x1 + x2", "operator": "<=", "rhs": 80},
                {"name": "supply_2", "expression": "x3 + x4", "operator": "<=", "rhs": 60},
                {"name": "demand_1", "expression": "x1 + x3", "operator": ">=", "rhs": 50},
                {"name": "demand_2", "expression": "x2 + x4", "operator": ">=", "rhs": 40}
            ]
            model_def["objective"] = {
                "sense": "min",
                "expression": "4*x1 + 6*x2 + 5*x3 + 8*x4"
            }
        
        # Default pattern
        else:
            model_def["variables"] = [
                {"name": "x1", "lower_bound": 0, "upper_bound": 100, "is_integer": False},
                {"name": "x2", "lower_bound": 0, "upper_bound": 100, "is_integer": False}
            ]
            model_def["constraints"] = [
                {"name": "constraint_1", "expression": "x1 + x2", "operator": "<=", "rhs": 50},
                {"name": "constraint_2", "expression": "x1", "operator": ">=", "rhs": 10}
            ]
            model_def["objective"] = {
                "sense": "max",
                "expression": "3*x1 + 2*x2"
            }
        
        return json.dumps(model_def, ensure_ascii=False, indent=2)
    
    @staticmethod
    @tool
    def validate_optimization_model(model_json: str) -> str:
        """
        Validate an optimization model definition.
        
        Args:
            model_json: JSON string of the optimization model
        
        Returns:
            Validation result in JSON format
        """
        try:
            model = json.loads(model_json)
            errors = []
            warnings = []
            
            # Check required fields
            if "variables" not in model:
                errors.append("Missing 'variables' field")
            elif not isinstance(model["variables"], list):
                errors.append("'variables' must be a list")
            
            if "constraints" not in model:
                errors.append("Missing 'constraints' field")
            elif not isinstance(model["constraints"], list):
                errors.append("'constraints' must be a list")
            
            if "objective" not in model:
                errors.append("Missing 'objective' field")
            elif not isinstance(model["objective"], dict):
                errors.append("'objective' must be a dictionary")
            elif "expression" not in model.get("objective", {}):
                errors.append("'objective' missing 'expression' field")
            
            # Validate variables
            if "variables" in model:
                var_names = set()
                for i, var in enumerate(model["variables"]):
                    if "name" not in var:
                        errors.append(f"Variable {i} missing 'name'")
                    else:
                        if var["name"] in var_names:
                            errors.append(f"Duplicate variable name: {var['name']}")
                        var_names.add(var["name"])
                        
                    if "lower_bound" in var and "upper_bound" in var:
                        if var["lower_bound"] > var["upper_bound"]:
                            warnings.append(f"Variable {i}: lower_bound > upper_bound")
            
            # Validate constraints
            if "constraints" in model:
                for i, constraint in enumerate(model["constraints"]):
                    if "expression" not in constraint:
                        errors.append(f"Constraint {i} missing 'expression'")
                    if "operator" not in constraint:
                        errors.append(f"Constraint {i} missing 'operator'")
                    if constraint.get("operator") not in ["<=", ">=", "=="]:
                        errors.append(f"Constraint {i} has invalid operator")
                    if "rhs" not in constraint:
                        errors.append(f"Constraint {i} missing 'rhs'")
            
            result = {
                "valid": len(errors) == 0,
                "errors": errors,
                "warnings": warnings
            }
            
            return json.dumps(result, ensure_ascii=False)
        
        except json.JSONDecodeError as e:
            return json.dumps({
                "valid": False,
                "errors": [f"Invalid JSON: {str(e)}"],
                "warnings": []
            })
    
    @staticmethod
    @tool
    def suggest_parameter_tuning(model_json: str, performance_metrics: str) -> str:
        """
        Suggest parameter tuning based on performance metrics.
        
        Args:
            model_json: JSON string of the optimization model
            performance_metrics: JSON string of performance metrics
        
        Returns:
            Tuning suggestions in JSON format
        """
        try:
            model = json.loads(model_json)
            metrics = json.loads(performance_metrics)
            
            suggestions = {
                "variable_adjustments": [],
                "constraint_adjustments": [],
                "parameter_suggestions": {}
            }
            
            # Analyze constraints
            if "constraints" in model:
                for constraint in model["constraints"]:
                    if constraint.get("operator") == ">=":
                        suggestions["constraint_adjustments"].append({
                            "name": constraint.get("name", "unknown"),
                            "suggestion": "Consider relaxing this constraint if solution is infeasible",
                            "action": "Reduce RHS by 5-10%"
                        })
                    elif constraint.get("operator") == "<=":
                        suggestions["constraint_adjustments"].append({
                            "name": constraint.get("name", "unknown"),
                            "suggestion": "Check if this is a hard constraint",
                            "action": "Keep as is or evaluate business impact"
                        })
            
            # Suggest based on problem type
            if model.get("problem_type") == "MIP":
                suggestions["parameter_suggestions"] = {
                    "time_limit": 300,
                    "mip_gap": 0.01,
                    "heuristic_fraction": 0.2,
                    "emphasis": "balanced"
                }
            else:
                suggestions["parameter_suggestions"] = {
                    "time_limit": 60,
                    "primal_feasibility_tolerance": 1e-8,
                    "dual_feasibility_tolerance": 1e-8
                }
            
            return json.dumps(suggestions, ensure_ascii=False, indent=2)
        
        except Exception as e:
            return json.dumps({
                "error": f"Failed to generate suggestions: {str(e)}"
            })


class DeerFlowAgent:
    """
    DeerFlow-inspired Agent for Optimization Modeling
    
    This agent implements:
    - Multi-step reasoning (similar to DeerFlow's Lead Agent)
    - Tool orchestration
    - Context management
    - LLM integration for optimization problems
    """
    
    def __init__(self, llm_client: Any, tools: Optional[List] = None):
        self.llm_client = llm_client
        self.tools = tools or []
        self.state = AgentState()
        self.modeling_service = StructuredModelingService(llm_client)
        
    def add_message(self, role: str, content: str):
        """Add a message to the conversation history"""
        self.state.messages.append({
            "role": role,
            "content": content
        })
    
    def invoke(self, input_message: str) -> Dict[str, Any]:
        """
        Main agent invocation method (similar to DeerFlow's agent.run())
        
        Args:
            input_message: User input message
        
        Returns:
            Agent response with tool calls and results
        """
        self.add_message("user", input_message)
        
        # Step 1: LLM generates response with potential tool calls
        response = self._generate_response(input_message)
        
        # Step 2: Process tool calls
        if response.get("tool_calls"):
            self.state.tool_calls.extend(response["tool_calls"])
            for tool_call in response["tool_calls"]:
                tool_result = self._execute_tool_call(tool_call)
                response["tool_results"] = response.get("tool_results", [])
                response["tool_results"].append({
                    "tool": tool_call["name"],
                    "result": tool_result
                })
        
        # Step 3: Generate final response
        self.state.current_step += 1
        
        return {
            "response": response.get("content") or "",
            "reasoning_content": response.get("reasoning_content") or "",
            "tool_calls": response.get("tool_calls", []),
            "tool_results": response.get("tool_results", []),
            "step": self.state.current_step,
            "state": self.state.dict()
        }
    
    def invoke_stream(self, input_message: str):
        """Streaming agent invocation. Yields SSE event dicts."""
        import json as _json
        self.add_message("user", input_message)
        
        # Build messages with system prompt
        ontology_context = OntologyContextProvider.get_ontology_context()
        system_prompt = """You are an expert optimization modeling assistant inspired by DeerFlow.
You help users create and optimize mathematical models for decision-making problems.

Available tools:
- generate_optimization_model: Generate optimization models from business descriptions
- validate_optimization_model: Validate model definitions
- suggest_parameter_tuning: Suggest parameter tuning based on performance

When the user describes a business problem:
1. Use generate_optimization_model to create a model
2. Use validate_optimization_model to verify the model
3. Suggest improvements if needed

## CRITICAL OUTPUT FORMAT:

### Model JSON (REQUIRED):
When you have designed an optimization model (variables, objective, constraints), you MUST output the model as a JSON block wrapped in <MODEL_JSON> tags. This is REQUIRED for every response that involves model design.

Example format:
<MODEL_JSON>
{
  "problemType": "LP",
  "objective": {
    "sense": "maximize",
    "coefficients": [
      {"variable": "产品A产量", "coefficient": 10},
      {"variable": "产品B产量", "coefficient": 15}
    ]
  },
  "variables": [
    {"name": "产品A产量", "type": "continuous", "lowerBound": 0, "upperBound": null}
  ],
  "constraints": [
    {"name": "产能上限约束", "description": "资源约束", "sense": "<=", "rhs": 100}
  ]
}
</MODEL_JSON>

Rules:
- problemType: one of "LP", "MIP", "QP"
- objective.sense: "maximize" or "minimize"
- variables[].type: "continuous", "integer", or "binary"
- constraints[].sense: "<=", ">=", or "=="
- Always include ALL variables, constraints, and objective in the JSON
- Output the JSON even if the model is preliminary - the user can edit it
- CRITICAL: Variable names in constraint descriptions and objective description MUST exactly match the decision variable names. Do NOT abbreviate or rephrase variable names.

{ontology_section}

CRITICAL LANGUAGE RULES:
- Your thinking process (reasoning) MUST be in Chinese (Simplified). Think in Chinese.
- Your response to the user MUST be in Chinese (Simplified).
- Only keep professional/technical terms in English (e.g. variable names like 'PHO', 'PHI', model types like 'LP', 'MIP').
- Never think or respond in English unless the user explicitly asks in English.

CRITICAL THINKING RULES:
- Your thinking process MUST be concise and brief. Avoid long technical analysis.
- Only output thinking content that is meaningful to the user. Do NOT output internal processing details, API calls, JSON structure analysis, or technical implementation details.
- For multi-turn conversations (follow-up questions, modifications, clarifications), keep thinking VERY short - just briefly confirm understanding and provide the solution. Do NOT repeat the full analysis process.
- Do NOT output raw JSON data, variable definition lists, or constraint condition lists in your thinking process.
- Focus on conclusions and recommendations, not intermediate reasoning steps."""
        system_prompt = system_prompt.replace("{ontology_section}", ontology_context)
        
        messages = [
            {"role": "system", "content": system_prompt},
            *[{"role": m["role"], "content": m["content"]} for m in self.state.messages]
        ]
        
        if self.llm_client:
            for field, text in self.llm_client.chat_stream(messages):
                yield f"data: {_json.dumps({'field': field, 'text': text}, ensure_ascii=False)}\n\n"
        else:
            yield f"data: {_json.dumps({'field': 'content', 'text': 'LLM client not configured.'}, ensure_ascii=False)}\n\n"
        
        yield "data: [DONE]\n\n"
        self.state.current_step += 1
    
    def _generate_response(self, message: str) -> Dict[str, Any]:
        """Generate LLM response with tool call planning"""
        # Dynamically inject ontology context for business-meaningful variable names
        ontology_context = OntologyContextProvider.get_ontology_context()

        system_prompt = """You are an expert optimization modeling assistant inspired by DeerFlow.
You help users create and optimize mathematical models for decision-making problems.

Available tools:
- generate_optimization_model: Generate optimization models from business descriptions
- validate_optimization_model: Validate model definitions
- suggest_parameter_tuning: Suggest parameter tuning based on performance

When the user describes a business problem:
1. Use generate_optimization_model to create a model
2. Use validate_optimization_model to verify the model
3. Suggest improvements if needed

## CRITICAL OUTPUT FORMAT:

### Model JSON (REQUIRED):
When you have designed an optimization model (variables, objective, constraints), you MUST output the model as a JSON block wrapped in <MODEL_JSON> tags. This is REQUIRED for every response that involves model design.

Example format:
<MODEL_JSON>
{
  "problemType": "LP",
  "objective": {
    "sense": "maximize",
    "coefficients": [
      {"variable": "产品A产量", "coefficient": 10},
      {"variable": "产品B产量", "coefficient": 15}
    ]
  },
  "variables": [
    {"name": "产品A产量", "type": "continuous", "lowerBound": 0, "upperBound": null}
  ],
  "constraints": [
    {"name": "产能上限约束", "description": "资源约束", "sense": "<=", "rhs": 100}
  ]
}
</MODEL_JSON>

Rules:
- problemType: one of "LP", "MIP", "QP"
- objective.sense: "maximize" or "minimize"
- variables[].type: "continuous", "integer", or "binary"
- constraints[].sense: "<=", ">=", or "=="
- Always include ALL variables, constraints, and objective in the JSON
- Output the JSON even if the model is preliminary - the user can edit it
- CRITICAL: Variable names in constraint descriptions and objective description MUST exactly match the decision variable names. Do NOT abbreviate or rephrase variable names.

{ontology_section}

CRITICAL LANGUAGE RULES:
- Your thinking process (reasoning) MUST be in Chinese (Simplified). Think in Chinese.
- Your response to the user MUST be in Chinese (Simplified).
- Only keep professional/technical terms in English (e.g. variable names like 'PHO', 'PHI', model types like 'LP', 'MIP').
- Never think or respond in English unless the user explicitly asks in English.

CRITICAL THINKING RULES:
- Your thinking process MUST be concise and brief. Avoid long technical analysis.
- Only output thinking content that is meaningful to the user. Do NOT output internal processing details, API calls, JSON structure analysis, or technical implementation details.
- For multi-turn conversations (follow-up questions, modifications, clarifications), keep thinking VERY short - just briefly confirm understanding and provide the solution. Do NOT repeat the full analysis process.
- Do NOT output raw JSON data, variable definition lists, or constraint condition lists in your thinking process.
- Focus on conclusions and recommendations, not intermediate reasoning steps."""

        # Inject ontology context (empty string if unavailable)
        system_prompt = system_prompt.replace("{ontology_section}", ontology_context)
        
        # Build messages for LLM
        messages = [
            {"role": "system", "content": system_prompt},
            *[{"role": m["role"], "content": m["content"]} for m in self.state.messages]
        ]
        
        # Call LLM
        if self.llm_client:
            llm_result = self.llm_client.chat(messages)
            # Handle both dict (with reasoning_content) and string returns
            if isinstance(llm_result, dict):
                return {
                    "content": llm_result.get("content", ""),
                    "reasoning_content": llm_result.get("reasoning_content", "")
                }
            else:
                return {"content": llm_result}
        else:
            return {
                "content": "LLM client not configured. Please check your API settings.",
                "tool_calls": []
            }
    
    def _execute_tool_call(self, tool_call: Dict[str, Any]) -> str:
        """Execute a tool call"""
        tool_name = tool_call.get("name")
        args = tool_call.get("arguments", {})
        
        # Find the tool
        tool = None
        for t in self.tools:
            if hasattr(t, "name") and t.name == tool_name:
                tool = t
                break
        
        if tool:
            try:
                return tool.invoke(args)
            except Exception as e:
                return f"Tool execution error: {str(e)}"
        else:
            return f"Tool not found: {tool_name}"
    
    def invoke_structured_stream(self, input_message: str, ontologies: Optional[List[Dict[str, Any]]] = None,
                                 context: Optional[Dict[str, Any]] = None):
        """
        结构化流式建模调用（带可行性评估的9步流程）。
        输出事件类型：
        - feasibility_start
        - feasibility_assessing
        - feasibility_result: {complete, elements, missing_elements, questions, suggestion}
        - clarification_needed: {questions, missing_elements}
        - step_start:  {step, title}
        - step_content:{step, text, payload}
        - step_end:    {step, status}
        - model_draft: {draft}
        - done
        """
        import json as _json

        self.add_message("user", input_message)

        def _emit(event_type: str, payload: Dict[str, Any]):
            yield f"data: {_json.dumps({'event': event_type, 'payload': payload}, ensure_ascii=False)}\n\n"

        def _run_with_heartbeat(fn, step_id: int, step_title: str, interval: float = 2.0):
            """将阻塞操作放入线程执行，期间每 interval 秒发一次心跳 step_content。
            返回 fn 的返回值。如有异常会重新抛出。
            """
            result_box = [None]
            error_box = [None]

            def _worker():
                try:
                    result_box[0] = fn()
                except Exception as e:
                    error_box[0] = e

            t = threading.Thread(target=_worker)
            t.start()
            hb = 0
            while t.is_alive():
                t.join(timeout=interval)
                if t.is_alive():
                    hb += 1
                    yield from _emit("step_content", {
                        "step": step_id,
                        "text": f"{step_title}，已等待 {int(hb * interval)} 秒...",
                        "payload": {},
                    })
            if error_box[0]:
                raise error_box[0]
            return result_box[0]

        try:
            # ═══════════════════════════════════════════════════════════════════
            # 前置：建模可行性评估
            # ═══════════════════════════════════════════════════════════════════
            yield from _emit("feasibility_start", {"phase": "feasibility_assessment"})
            yield from _emit("feasibility_assessing", {
                "text": "正在评估需求完整性：系数、决策变量、目标函数、约束条件、取值范围...",
            })

            # 在可行性评估期间保持心跳，避免 LLM 二次确认时长导致前端长时间无响应
            assessment_result = [None]
            assessment_error = [None]

            def _assess_feasibility():
                try:
                    assessment_result[0] = self.modeling_service.assess_modeling_feasibility(input_message, context, ontologies)
                except Exception as e:
                    assessment_error[0] = e

            assess_thread = threading.Thread(target=_assess_feasibility)
            assess_thread.start()
            heartbeat_count = 0
            _assess_hb_messages = [
                "正在进行规则匹配评估…",
                "正在调用本体推断补充缺失要素…",
                "正在进行深度可行性评估，请稍候…",
                "仍在评估中，已等待 8 秒，请耐心等待…",
            ]
            while assess_thread.is_alive():
                assess_thread.join(timeout=2.0)
                if assess_thread.is_alive():
                    msg_idx = min(heartbeat_count, len(_assess_hb_messages) - 1)
                    msg = _assess_hb_messages[msg_idx]
                    if heartbeat_count >= len(_assess_hb_messages):
                        msg = f"仍在评估中，已等待 {heartbeat_count * 2} 秒…"
                    heartbeat_count += 1
                    yield from _emit("feasibility_assessing", {"text": msg})

            if assessment_error[0]:
                raise assessment_error[0]
            assessment = assessment_result[0]

            yield from _emit("feasibility_result", assessment)

            if assessment.get("complete", False):
                yield from _emit("step_content", {
                    "step": 0,
                    "text": "建模可行性评估通过，开始执行建模步骤。",
                    "payload": {},
                })

            if not assessment.get("complete", False):
                # 要素不完整，需要引导用户补充
                yield from _emit("clarification_needed", {
                    "questions": assessment.get("questions", []),
                    "missing_elements": assessment.get("missing_elements", []),
                    "suggestion": assessment.get("suggestion", ""),
                    "issues": assessment.get("issues", []),
                })
                yield from _emit("done", {"phase": "clarification_needed"})
                return

            # ═══════════════════════════════════════════════════════════════════
            # Step 1: 识别业务语义
            # ═══════════════════════════════════════════════════════════════════
            yield from _emit("step_start", {"step": 1, "title": "识别业务语义"})
            yield from _emit("step_content", {
                "step": 1,
                "text": "正在分析业务描述，识别涉及的对象、动作、关系和关键字段...",
                "payload": {},
            })
            yield from _emit("step_content", {
                "step": 1,
                "text": "正在调用大模型识别业务语义，请稍候...",
                "payload": {},
            })

            # 在 LLM 调用期间保持心跳，让用户实时看到步骤仍在推进
            entities_result = [None]
            entities_error = [None]

            def _extract_entities():
                try:
                    entities_result[0] = self.modeling_service.extract_business_entities(input_message, ontologies)
                except Exception as e:
                    entities_error[0] = e

            extract_thread = threading.Thread(target=_extract_entities)
            extract_thread.start()
            heartbeat_count = 0
            _step1_hb_messages = [
                "大模型正在理解业务语义，请稍候…",
                "正在从描述中提取对象、动作、关系…",
                "大模型仍在分析中，已等待 6 秒…",
            ]
            while extract_thread.is_alive():
                extract_thread.join(timeout=2.0)
                if extract_thread.is_alive():
                    msg_idx = min(heartbeat_count, len(_step1_hb_messages) - 1)
                    msg = _step1_hb_messages[msg_idx]
                    if heartbeat_count >= len(_step1_hb_messages):
                        msg = f"大模型正在识别业务语义，已等待 {heartbeat_count * 2} 秒…"
                    heartbeat_count += 1
                    yield from _emit("step_content", {
                        "step": 1,
                        "text": msg,
                        "payload": {},
                    })

            if entities_error[0]:
                raise entities_error[0]
            entities = entities_result[0]
            yield from _emit("step_content", {
                "step": 1,
                "text": f"识别到业务对象：{', '.join(entities.get('objects', []))}；动作：{', '.join(entities.get('actions', []))}",
                "payload": {"entities": entities},
            })
            yield from _emit("step_end", {"step": 1, "status": "success"})

            object_type_ids = entities.get("objectTypeIds", [])

            # ═══════════════════════════════════════════════════════════════════
            # Step 2: 确认系数
            # ═══════════════════════════════════════════════════════════════════
            yield from _emit("step_start", {"step": 2, "title": "确认系数"})
            yield from _emit("step_content", {
                "step": 2,
                "text": "正在查询本体映射，匹配决策变量集与约束模板...",
                "payload": {},
            })

            # match_variable_sets 涉及 MongoDB 查询，可能较慢
            matched_vars = yield from _run_with_heartbeat(
                lambda: self.modeling_service.match_variable_sets(object_type_ids, entities),
                step_id=2, step_title="正在查询本体映射"
            )
            matched_cons = self.modeling_service.match_constraint_sets(matched_vars, object_type_ids)

            yield from _emit("step_content", {
                "step": 2,
                "text": f"已匹配 {len(matched_vars)} 组决策变量模板，{len(matched_cons)} 组约束模板，正在识别系数...",
                "payload": {},
            })

            # identify_coefficients 可能涉及 LLM 调用
            coeff_result = yield from _run_with_heartbeat(
                lambda: self.modeling_service.identify_coefficients(entities, matched_vars, matched_cons, input_message),
                step_id=2, step_title="正在识别已知系数与上游参数"
            )
            coefficients = coeff_result.get("coefficients", [])
            yield from _emit("step_content", {
                "step": 2,
                "text": f"{coeff_result.get('summary', '')}。常数可直接使用，上游参数请在运行时绑定。",
                "payload": {"coefficients": coefficients},
            })
            yield from _emit("step_end", {"step": 2, "status": "success"})

            # ═══════════════════════════════════════════════════════════════════
            # Step 3: 确认决策变量
            # ═══════════════════════════════════════════════════════════════════
            yield from _emit("step_start", {"step": 3, "title": "确认决策变量"})
            yield from _emit("step_content", {
                "step": 3,
                "text": "正在根据业务对象匹配需要求解的未知量...",
                "payload": {},
            })
            var_result = self.modeling_service.confirm_variables(matched_vars)
            variables = var_result.get("variables", [])
            var_names = [v.get("name", "") for v in variables]
            yield from _emit("step_content", {
                "step": 3,
                "text": f"{var_result.get('summary', '')}：{', '.join(var_names[:6])}{' 等' if len(var_names) > 6 else ''}",
                "payload": {"variables": variables},
            })
            yield from _emit("step_end", {"step": 3, "status": "success"})

            # ═══════════════════════════════════════════════════════════════════
            # Step 4: 确认目标函数
            # ═══════════════════════════════════════════════════════════════════
            yield from _emit("step_start", {"step": 4, "title": "确认目标函数"})
            yield from _emit("step_content", {
                "step": 4,
                "text": "正在根据业务语义推断优化目标...",
                "payload": {},
            })
            obj_result = self.modeling_service.confirm_objective(entities, variables)
            objective = obj_result.get("objective", {})
            yield from _emit("step_content", {
                "step": 4,
                "text": f"{obj_result.get('summary', '')}，目标变量：{', '.join([c.get('variable', '') for c in objective.get('coefficients', [])])}",
                "payload": {"objective": objective},
            })
            yield from _emit("step_end", {"step": 4, "status": "success"})

            # ═══════════════════════════════════════════════════════════════════
            # Step 5: 确认约束条件
            # ═══════════════════════════════════════════════════════════════════
            yield from _emit("step_start", {"step": 5, "title": "确认约束条件"})
            yield from _emit("step_content", {
                "step": 5,
                "text": "正在根据决策变量和业务对象匹配常态化约束模板...",
                "payload": {},
            })
            con_result = self.modeling_service.confirm_constraints(matched_cons, variables)
            constraints = con_result.get("constraints", [])
            con_names = [c.get("name", "") for c in constraints]
            yield from _emit("step_content", {
                "step": 5,
                "text": f"{con_result.get('summary', '')}：{', '.join(con_names[:6])}{' 等' if len(con_names) > 6 else ''}",
                "payload": {"constraints": constraints},
            })
            yield from _emit("step_end", {"step": 5, "status": "success"})

            # ═══════════════════════════════════════════════════════════════════
            # Step 6: 确认取值范围
            # ═══════════════════════════════════════════════════════════════════
            yield from _emit("step_start", {"step": 6, "title": "确认取值范围"})
            yield from _emit("step_content", {
                "step": 6,
                "text": "正在整理每个决策变量的上下界与类型...",
                "payload": {},
            })
            bound_result = self.modeling_service.confirm_bounds(variables)
            bounds = bound_result.get("bounds", [])
            yield from _emit("step_content", {
                "step": 6,
                "text": f"{bound_result.get('summary', '')}，可在右侧面板进一步调整。",
                "payload": {"bounds": bounds},
            })
            yield from _emit("step_end", {"step": 6, "status": "success"})

            # ═══════════════════════════════════════════════════════════════════
            # Step 7: 完善模型
            # ═══════════════════════════════════════════════════════════════════
            yield from _emit("step_start", {"step": 7, "title": "完善模型"})
            yield from _emit("step_content", {
                "step": 7,
                "text": "正在整合系数、变量、目标、约束和取值范围，补充优化类型...",
                "payload": {},
            })
            refined = self.modeling_service.refine_model(
                variables, objective, constraints, coefficients, input_message, entities
            )
            yield from _emit("step_content", {
                "step": 7,
                "text": f"已完善模型：问题类型 {refined.get('problemType', 'LP')}，目标方向 {objective.get('sense', 'minimize')}。",
                "payload": {
                    "problemType": refined.get("problemType"),
                    "objectiveSense": objective.get("sense"),
                },
            })
            yield from _emit("step_end", {"step": 7, "status": "success"})

            # ═══════════════════════════════════════════════════════════════════
            # Step 8: 生成建模草案
            # ═══════════════════════════════════════════════════════════════════
            yield from _emit("step_start", {"step": 8, "title": "生成建模草案"})
            yield from _emit("step_content", {
                "step": 8,
                "text": "正在生成建模草案...",
                "payload": {},
            })
            draft = self.modeling_service.build_model_draft(refined)
            yield from _emit("step_content", {
                "step": 8,
                "text": f"已生成包含 {len(draft.get('variables', []))} 个变量和 {len(draft.get('constraints', []))} 个约束的建模草案，请在右侧面板确认或调整。",
                "payload": {"draftSummary": {
                    "variableCount": len(draft.get("variables", [])),
                    "constraintCount": len(draft.get("constraints", [])),
                }},
            })
            yield from _emit("model_draft", {"draft": draft, "summary": draft.get("summary", "")})
            yield from _emit("step_end", {"step": 8, "status": "success"})

            self.state.current_step += 1
            yield from _emit("done", {"step": 8})

        except Exception as e:
            logger.error(f"Structured modeling error: {e}", exc_info=True)
            yield from _emit("error", {"message": str(e)})

    def invoke_generate_dsl_stream(self, draft: Dict[str, Any], ontologies: Optional[List[Dict[str, Any]]] = None):
        """
        结构化流式生成 OR-DSL（Step 9）。
        输出事件类型：
        - step_start:  {step, title}
        - step_content:{step, text, payload}
        - step_end:    {step, status}
        - or_dsl:      {orDsl, modelData}
        - done
        - error
        """
        import json as _json

        def _emit(event_type: str, payload: Dict[str, Any]):
            yield f"data: {_json.dumps({'event': event_type, 'payload': payload}, ensure_ascii=False)}\n\n"

        try:
            yield from _emit("step_start", {"step": 9, "title": "生成OR-DSL"})

            variables = draft.get("variables", [])
            constraints = draft.get("constraints", [])
            objective = draft.get("objective", {})

            yield from _emit("step_content", {
                "step": 9,
                "text": f"接收模型草案：{len(variables)} 个变量、{len(constraints)} 个约束、目标方向 {objective.get('sense', 'minimize')}。",
                "payload": {
                    "variableCount": len(variables),
                    "constraintCount": len(constraints),
                    "objectiveSense": objective.get("sense", "minimize"),
                },
            })

            yield from _emit("step_content", {
                "step": 9,
                "text": "正在将变量、约束和目标函数转换为 OR-DSL 中间表示...",
                "payload": {},
            })

            or_dsl = self.modeling_service.generate_or_dsl_for_draft(draft, ontologies)

            yield from _emit("step_content", {
                "step": 9,
                "text": "OR-DSL 已生成，正在进行最终校验...",
                "payload": {"orDslPreview": or_dsl},
            })

            yield from _emit("or_dsl", {
                "orDsl": or_dsl,
                "summary": draft.get("summary", ""),
                "modelData": {
                    "problemType": draft.get("problemType", "LP"),
                    "variables": variables,
                    "objective": objective,
                    "constraints": constraints,
                },
            })

            yield from _emit("step_end", {"step": 9, "status": "success"})
            self.state.current_step += 1
            yield from _emit("done", {"step": 9})

        except Exception as e:
            logger.error(f"Generate OR-DSL stream error: {e}", exc_info=True)
            yield from _emit("error", {"message": str(e)})

    def reset(self):
        """Reset agent state"""
        self.state = AgentState()
        if hasattr(self, 'modeling_service'):
            self.modeling_service = StructuredModelingService(self.llm_client)
