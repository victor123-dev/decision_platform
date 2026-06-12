"""
DeerFlow Agent Initialization Module

This module initializes the DeerFlow-inspired agent system for optimization modeling.
"""

import json
import logging
import re
from typing import Dict, Any, List
from app.deerflow.agent import DeerFlowAgent, OptimizationTools, AgentState
from config.settings import settings

logger = logging.getLogger(__name__)

# Global agent instance
_agent_instance: DeerFlowAgent = None


class LLMClient:
    """LLM client for integration with DeerFlow agent"""
    
    def __init__(self, api_key: str, base_url: str, model: str):
        self.api_key = api_key
        self.base_url = base_url
        self.model = model
    
    def chat(self, messages: List[Dict[str, str]], temperature: float = 0.7) -> Dict[str, str]:
        """Chat completion with the LLM. Returns dict with 'content' and 'reasoning_content'."""
        import requests
        
        if not self.api_key:
            logger.warning("LLM API key not configured")
            return {"content": "", "reasoning_content": ""}
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 4096,
            "enable_thinking": True  # Enable native thinking (DeerFlow pattern)
        }
        
        try:
            # Use session with trust_env=False to bypass system proxy (e.g. Clash)
            session = requests.Session()
            session.trust_env = False
            response = session.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=180
            )
            response.raise_for_status()
            result = response.json()
            msg = result['choices'][0]['message']
            return {
                "content": msg.get('content', ''),
                "reasoning_content": msg.get('reasoning_content', '')
            }
        except requests.Timeout:
            logger.error(f"LLM API call timed out (180s)")
            return {"content": "抱歉，AI 服务响应超时，请稍后重试。", "reasoning_content": ""}
        except Exception as e:
            logger.error(f"LLM API call failed: {e}")
            return {"content": "抱歉，AI 服务暂时不可用，请稍后重试。", "reasoning_content": ""}

    def chat_stream(self, messages: List[Dict[str, str]], temperature: float = 0.7):
        """Streaming chat completion. Yields (field, text) tuples where field is 'reasoning_content' or 'content'."""
        import requests
        
        if not self.api_key:
            logger.warning("LLM API key not configured")
            yield ("content", "LLM API key not configured")
            return
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 4096,
            "enable_thinking": True,
            "stream": True
        }
        
        try:
            session = requests.Session()
            session.trust_env = False
            response = session.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=180,
                stream=True
            )
            response.raise_for_status()
            
            for line in response.iter_lines():
                if not line:
                    continue
                line_str = line.decode('utf-8') if isinstance(line, bytes) else line
                if line_str.startswith('data: '):
                    payload = line_str[6:]
                    if payload.strip() == '[DONE]':
                        break
                    try:
                        chunk = json.loads(payload)
                        delta = chunk['choices'][0].get('delta', {})
                        if 'reasoning_content' in delta and delta['reasoning_content']:
                            yield ("reasoning_content", delta['reasoning_content'])
                        if 'content' in delta and delta['content']:
                            yield ("content", delta['content'])
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue
        except requests.Timeout:
            logger.error(f"LLM stream timed out (180s)")
            yield ("content", "抱歉，AI 服务响应超时，请稍后重试。")
        except Exception as e:
            logger.error(f"LLM stream failed: {e}")
            yield ("content", "抱歉，AI 服务暂时不可用，请稍后重试。")

    def generate_optimization_model(self, business_description: str, model_type: str = "LP") -> Dict[str, Any]:
        messages = [
            {
                "role": "system",
                "content": (
                    "你是运筹优化建模专家。请只返回一个 JSON 对象，不要返回 Markdown。"
                    "JSON 字段必须包含 id、name、description、problem_type、status、updated_at、variables、constraints、objective。"
                    "variables 是数组，每项包含 name、lower_bound、upper_bound、is_integer。"
                    "constraints 是数组，每项包含 name、expression、operator、rhs，operator 只能是 <=、>=、==。"
                    "objective 包含 sense 和 expression，sense 只能是 max 或 min。"
                    "表达式使用变量名、数字、*、+，例如 3*x1 + 2*x2。"
                )
            },
            {
                "role": "user",
                "content": f"模型类型：{model_type}\n业务描述：{business_description}"
            }
        ]
        result = self.chat(messages, temperature=0.2)
        content = result.get("content", "") if isinstance(result, dict) else result
        if not content:
            raise ValueError("LLM 未返回内容")
        return self._extract_json_object(content)

    @staticmethod
    def _extract_json_object(content: str) -> Dict[str, Any]:
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if not match:
                raise
            return json.loads(match.group(0))


def initialize_agent() -> DeerFlowAgent:
    """Initialize the DeerFlow agent with tools"""
    global _agent_instance
    
    if _agent_instance is not None:
        return _agent_instance
    
    # Create LLM client
    llm_client = None
    if settings.llm_api_key:
        llm_client = LLMClient(
            api_key=settings.llm_api_key,
            base_url=settings.llm_base_url,
            model=settings.llm_model
        )
        logger.info(f"LLM client initialized: {settings.llm_model}")
    else:
        logger.warning("LLM API key not configured - agent will use fallback mode")
    
    # Create tools
    tools = [
        OptimizationTools.generate_optimization_model,
        OptimizationTools.validate_optimization_model,
        OptimizationTools.suggest_parameter_tuning
    ]
    
    # Create agent
    _agent_instance = DeerFlowAgent(
        llm_client=llm_client,
        tools=tools
    )
    
    logger.info("DeerFlow agent initialized successfully")

    # Pre-load ontology context cache (non-blocking, failure doesn't affect agent)
    try:
        from app.services.ontology_context import OntologyContextProvider
        OntologyContextProvider.warm_up()
    except Exception as e:
        logger.warning(f"Ontology context pre-load failed: {e}")

    return _agent_instance


def get_agent() -> DeerFlowAgent:
    """Get the global agent instance"""
    global _agent_instance
    if _agent_instance is None:
        return initialize_agent()
    return _agent_instance


def reset_agent():
    """Reset the agent state"""
    global _agent_instance
    if _agent_instance:
        _agent_instance.reset()
        logger.info("Agent state reset")
