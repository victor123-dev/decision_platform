"""
DeerFlow-Inspired Agent System for Optimization Modeling

This module implements a lightweight agent system based on DeerFlow's design principles:
- Multi-step reasoning with tool calls
- Optimized model generation
- Parameter tuning and validation
- Integration with HiGHS solver
"""

from typing import List, Dict, Any, Optional, Callable
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from pydantic import BaseModel, Field
import json
import logging
import re

from app.services.ontology_context import OntologyContextProvider

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
- Never think or respond in English unless the user explicitly asks in English."""
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
- Never think or respond in English unless the user explicitly asks in English."""

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
    
    def reset(self):
        """Reset agent state"""
        self.state = AgentState()
