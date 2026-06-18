from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import json
import logging
from config.settings import settings
from app.deerflow import get_agent, initialize_agent, reset_agent
from app.deerflow.agent import OptimizationTools
from app.routers.ontology import list_ontologies


def _generate_fallback_model(full_description: str, model_type: str) -> Dict[str, Any]:
    model_json_str = OptimizationTools.generate_optimization_model.invoke({
        "business_description": full_description,
        "model_type": model_type
    })
    return json.loads(model_json_str)


def _normalize_model_definition(model_json: Dict[str, Any], full_description: str, model_type: str) -> Dict[str, Any]:
    model_json.setdefault("id", f"model-{abs(hash(full_description)) % 100000}")
    model_json.setdefault("name", "AI-Generated Model")
    model_json.setdefault("description", full_description)
    model_json.setdefault("problem_type", model_type)
    model_json.setdefault("status", "draft")
    model_json.setdefault("updated_at", "")
    model_json.setdefault("variables", [])
    model_json.setdefault("constraints", [])
    model_json.setdefault("objective", {"sense": "max", "coefficients": []})

    if model_json["problem_type"] not in ["LP", "MIP", "QP"]:
        model_json["problem_type"] = model_type

    for variable in model_json["variables"]:
        variable.setdefault("lower_bound", 0)
        variable.setdefault("upper_bound", None)
        variable.setdefault("is_integer", model_type == "MIP")

    for constraint in model_json["constraints"]:
        if constraint.get("operator") == "=":
            constraint["operator"] = "=="
        constraint.setdefault("name", "constraint")
        constraint.setdefault("expression", "")
        constraint.setdefault("operator", "<=")
        constraint.setdefault("rhs", 0)

    objective = model_json["objective"]
    if objective.get("sense") not in ["max", "min", "maximize", "minimize"]:
        objective["sense"] = "max"
    objective.setdefault("coefficients", [])
    return model_json


def _validate_generated_model(model_json: Dict[str, Any]) -> None:
    validation_result = OptimizationTools.validate_optimization_model.invoke({
        "model_json": json.dumps(model_json, ensure_ascii=False)
    })
    validation = json.loads(validation_result)
    if not validation.get("valid"):
        raise ValueError("; ".join(validation.get("errors", [])) or "模型结构校验失败")

logger = logging.getLogger(__name__)

router = APIRouter()

class AIModelingRequest(BaseModel):
    business_description: str = Field(description="业务描述")
    model_type: str = Field(description="模型类型", pattern="^(LP|MIP|QP)$", default="LP")
    constraints: Optional[str] = Field(None, description="约束条件描述")

class AIModelingResponse(BaseModel):
    success: bool = Field(description="是否成功")
    model_definition: Optional[Dict[str, Any]] = Field(None, description="生成的模型定义")
    parameters: Optional[Dict[str, Any]] = Field(None, description="建议参数")
    explanation: Optional[str] = Field(None, description="模型解释")
    error: Optional[str] = Field(None, description="错误信息")

class ParameterTuningRequest(BaseModel):
    model_id: str = Field(description="模型ID")
    current_params: Dict[str, Any] = Field(description="当前参数")
    performance_metrics: Dict[str, float] = Field(description="性能指标")

class ParameterTuningResponse(BaseModel):
    success: bool = Field(description="是否成功")
    suggested_params: Dict[str, Any] = Field(description="建议参数")
    expected_improvement: Optional[str] = Field(description="预期改进")

class AgentChatRequest(BaseModel):
    message: str = Field(description="用户消息")
    reset_conversation: bool = Field(default=False, description="是否重置对话")

class AgentStructuredChatRequest(BaseModel):
    message: str = Field(description="用户消息")
    reset_conversation: bool = Field(default=False, description="是否重置对话")
    ontology_id: Optional[str] = Field(default=None, description="指定本体ID，不指定则使用第一个可用本体")
    context: Optional[Dict[str, Any]] = Field(default=None, description="对话上下文，用于多轮补充信息")

class AgentConfirmChatRequest(BaseModel):
    draft: Dict[str, Any] = Field(description="用户确认的模型草案")
    ontology_id: Optional[str] = Field(default=None, description="指定本体ID，不指定则使用第一个可用本体")
    user_modified: bool = Field(default=False, description="用户是否手动调整过草案")

class AgentChatResponse(BaseModel):
    success: bool = Field(description="是否成功")
    response: str = Field(description="Agent响应")
    reasoning_content: str = Field(default="", description="思维链/推理过程")
    tool_calls: List[Dict[str, Any]] = Field(default_factory=list, description="调用的工具")
    tool_results: List[Dict[str, Any]] = Field(default_factory=list, description="工具执行结果")
    step: int = Field(description="当前步骤")

# Initialize agent on module load
initialize_agent()


@router.post("/chat", response_model=AgentChatResponse, tags=["AI辅助建模 - DeerFlow"])
async def agent_chat(request: AgentChatRequest):
    """
    DeerFlow Agent对话接口
    基于DeerFlow设计理念的AI助手，支持多轮对话和工具调用
    """
    try:
        agent = get_agent()
        
        if request.reset_conversation:
            reset_agent()
            agent = get_agent()
        
        result = agent.invoke(request.message)
        
        return AgentChatResponse(
            success=True,
            response=result.get("response", ""),
            reasoning_content=result.get("reasoning_content", ""),
            tool_calls=result.get("tool_calls", []),
            tool_results=result.get("tool_results", []),
            step=result.get("step", 0)
        )
    except Exception as e:
        logger.error(f"Agent chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/stream", tags=["AI辅助建模 - DeerFlow"])
async def agent_chat_stream(request: AgentChatRequest):
    """DeerFlow Agent流式对话接口，SSE返回思维链和响应内容"""
    try:
        agent = get_agent()
        
        if request.reset_conversation:
            reset_agent()
            agent = get_agent()
        
        return StreamingResponse(
            agent.invoke_stream(request.message),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            }
        )
    except Exception as e:
        logger.error(f"Agent chat stream error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/structured", tags=["AI辅助建模 - DeerFlow"])
async def agent_chat_structured_stream(request: AgentStructuredChatRequest):
    """
    DeerFlow Agent结构化流式对话接口（步骤 1-5）。
    返回 SSE 事件：step_start / step_content / step_end / model_draft / done / error
    """
    try:
        agent = get_agent()

        if request.reset_conversation:
            reset_agent()
            agent = get_agent()

        # 获取本体数据（用于业务实体识别和OR-DSL生成）
        ontologies = []
        try:
            all_ontologies = await list_ontologies()
            if request.ontology_id:
                ontologies = [o for o in all_ontologies if o.get("id") == request.ontology_id]
            if not ontologies and all_ontologies:
                ontologies = [all_ontologies[0]]
        except Exception as e:
            logger.warning(f"Failed to load ontology context for structured chat: {e}")
            ontologies = []

        return StreamingResponse(
            agent.invoke_structured_stream(request.message, ontologies=ontologies, context=request.context),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            }
        )
    except Exception as e:
        logger.error(f"Agent structured chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/confirm", tags=["AI辅助建模 - DeerFlow"])
async def agent_chat_confirm_stream(request: AgentConfirmChatRequest):
    """
    DeerFlow Agent结构化确认接口（步骤 6）。
    用户确认模型草案后，流式生成 OR-DSL 并回填。
    返回 SSE 事件：step_start / step_content / step_end / or_dsl / done / error
    """
    try:
        agent = get_agent()

        # 获取本体数据用于 OR-DSL 生成
        ontologies = []
        try:
            all_ontologies = await list_ontologies()
            if request.ontology_id:
                ontologies = [o for o in all_ontologies if o.get("id") == request.ontology_id]
            if not ontologies and all_ontologies:
                ontologies = [all_ontologies[0]]
        except Exception as e:
            logger.warning(f"Failed to load ontology context for confirm chat: {e}")
            ontologies = []

        return StreamingResponse(
            agent.invoke_generate_dsl_stream(request.draft, ontologies=ontologies),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            }
        )
    except Exception as e:
        logger.error(f"Agent confirm chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-model", response_model=AIModelingResponse, tags=["AI辅助建模 - DeerFlow"])
async def generate_model(request: AIModelingRequest):
    """
    使用DeerFlow Agent生成优化模型
    基于自然语言描述自动生成优化模型定义
    """
    logger.info(f"Starting model generation: type={request.model_type}, description_length={len(request.business_description)}")
    
    try:
        agent = get_agent()
        full_description = request.business_description
        if request.constraints:
            full_description += f"\n约束条件：{request.constraints}"

        explanation = "模型已生成"
        model_source = "fallback"
        
        try:
            if agent.llm_client:
                logger.debug("Attempting LLM-based model generation")
                model_json = agent.llm_client.generate_optimization_model(
                    business_description=full_description,
                    model_type=request.model_type
                )
                model_json = _normalize_model_definition(model_json, full_description, request.model_type)
                _validate_generated_model(model_json)
                explanation = "已通过 DeerFlow + AI 生成结构化优化模型"
                model_source = "llm"
                logger.info("LLM-based model generation successful")
            else:
                logger.info("LLM client not configured, using fallback template")
                model_json = _generate_fallback_model(full_description, request.model_type)
                model_json = _normalize_model_definition(model_json, full_description, request.model_type)
                explanation = "LLM 未配置，已使用本地 DeerFlow 模板生成模型"
        except Exception as llm_error:
            logger.warning(f"AI model generation failed ({type(llm_error).__name__}), using fallback: {str(llm_error)[:100]}")
            model_json = _generate_fallback_model(full_description, request.model_type)
            model_json = _normalize_model_definition(model_json, full_description, request.model_type)
            explanation = f"AI 生成失败，已使用本地 DeerFlow 模板兜底"

        logger.info(f"Model generation completed: source={model_source}, variables={len(model_json.get('variables', []))}, constraints={len(model_json.get('constraints', []))}")
        
        return AIModelingResponse(
            success=True,
            model_definition=model_json,
            explanation=explanation,
            error=None
        )
    
    except ValueError as e:
        logger.error(f"Model validation error: {e}")
        return AIModelingResponse(
            success=False,
            model_definition=None,
            explanation=None,
            error=f"模型验证失败: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Model generation error ({type(e).__name__}): {str(e)}", exc_info=True)
        return AIModelingResponse(
            success=False,
            model_definition=None,
            explanation=None,
            error=f"模型生成失败: {str(e)}"
        )


@router.post("/validate-model", tags=["AI辅助建模 - DeerFlow"])
async def validate_model(model_definition: Dict[str, Any]):
    """
    验证优化模型定义
    使用DeerFlow Agent的验证工具
    """
    try:
        model_json_str = json.dumps(model_definition, ensure_ascii=False)
        validation_result = OptimizationTools.validate_optimization_model.invoke({
            "model_json": model_json_str
        })
        
        return json.loads(validation_result)
    except Exception as e:
        logger.error(f"Model validation error: {e}")
        return {
            "valid": False,
            "errors": [str(e)],
            "warnings": []
        }


@router.post("/tune-parameters", response_model=ParameterTuningResponse, tags=["AI辅助建模 - DeerFlow"])
async def tune_parameters(request: ParameterTuningRequest):
    """
    参数调优建议
    基于DeerFlow Agent的分析能力
    """
    try:
        # Prepare model and metrics for tuning
        model_for_tuning = {
            "problem_type": "LP",
            "variables": [
                {"name": "x1", "lower_bound": 0, "upper_bound": 100},
                {"name": "x2", "lower_bound": 0, "upper_bound": 100}
            ],
            "constraints": []
        }
        
        metrics_json = json.dumps(request.performance_metrics)
        
        # Get tuning suggestions
        suggestions_json = OptimizationTools.suggest_parameter_tuning.invoke({
            "model_json": json.dumps(model_for_tuning),
            "performance_metrics": metrics_json
        })
        
        try:
            suggestions = json.loads(suggestions_json)
        except json.JSONDecodeError:
            suggestions = {"error": "Failed to parse suggestions"}
        
        return ParameterTuningResponse(
            success=True,
            suggested_params=suggestions.get("parameter_suggestions", {}),
            expected_improvement="基于性能指标的分析已生成调优建议"
        )
    
    except Exception as e:
        logger.error(f"Parameter tuning error: {e}")
        return ParameterTuningResponse(
            success=False,
            suggested_params={},
            expected_improvement=None
        )


@router.get("/status", tags=["AI辅助建模 - DeerFlow"])
async def get_agent_status():
    """
    获取DeerFlow Agent状态
    """
    try:
        agent = get_agent()
        return {
            "status": "ready",
            "llm_configured": bool(settings.llm_api_key),
            "current_step": agent.state.current_step,
            "message_count": len(agent.state.messages),
            "tool_count": len(agent.tools) if hasattr(agent, 'tools') else 0
        }
    except Exception as e:
        logger.error(f"Agent status error: {e}")
        return {
            "status": "error",
            "error": str(e)
        }


@router.post("/reset", tags=["AI辅助建模 - DeerFlow"])
async def reset_conversation():
    """
    重置DeerFlow Agent对话状态
    """
    try:
        reset_agent()
        return {"success": True, "message": "对话已重置"}
    except Exception as e:
        logger.error(f"Reset error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
