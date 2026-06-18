const API_BASE = '/api/v1';

const ERROR_MESSAGES = {
  400: '请求参数错误，请检查输入内容',
  401: '未授权访问，请重新登录',
  403: '权限不足，无法执行此操作',
  404: '请求的资源不存在',
  500: '服务器内部错误，请稍后重试',
  503: '服务暂时不可用，请稍后重试',
};

function getErrorMessage(status, detail) {
  if (detail) return detail;
  return ERROR_MESSAGES[status] || `HTTP 错误 ${status}`;
}

async function request(method, path, body) {
  const url = `${API_BASE}${path}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };
  
  if (body !== undefined) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = null;
    
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        if (!res.ok) {
          throw new Error(text.slice(0, 200) || getErrorMessage(res.status));
        }
        throw new Error('服务端返回了非 JSON 响应');
      }
    }
    
    if (!res.ok) {
      const detail = data?.detail || data?.message || data?.error;
      const errorMsg = typeof detail === 'string' ? detail : (typeof detail === 'object' ? JSON.stringify(detail) : getErrorMessage(res.status));
      const error = new Error(errorMsg);
      error.status = res.status;
      error.responseData = data;
      throw error;
    }
    
    if (res.status === 204 || !text) return null;
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('网络连接失败，请检查网络设置或稍后重试');
    }
    throw error;
  }
}

async function callQwenAPI(messages) {
  const chatMessages = messages.filter(msg => msg.type !== 'system');
  const userMessage = chatMessages[chatMessages.length - 1]?.content || '';
  
  console.log('DeerFlow Agent Request:', userMessage);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s timeout for LLM with thinking
    const response = await fetch('/api/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal: controller.signal,
      body: JSON.stringify({
        message: userMessage,
        reset_conversation: false,
      }),
    });
    clearTimeout(timeoutId);

    console.log('DeerFlow Agent Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeerFlow Agent Error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    console.log('DeerFlow Agent Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      return {
        content: data.response || '',
        reasoning_content: data.reasoning_content || '',
      };
    }
    throw new Error(data.error || 'Agent 响应失败');
  } catch (error) {
    console.error('DeerFlow Agent error:', error.message);
    throw error;
  }
}

async function callQwenAPIStream(messages, onChunk) {
  const chatMessages = messages.filter(msg => msg.type !== 'system');
  const userMessage = chatMessages[chatMessages.length - 1]?.content || '';
  
  console.log('DeerFlow Agent Stream Request:', userMessage);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000);
  
  try {
    const response = await fetch('/api/v1/ai/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      signal: controller.signal,
      body: JSON.stringify({ message: userMessage, reset_conversation: false }),
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const payload = trimmed.slice(6);
        if (payload === '[DONE]') return;
        
        try {
          const event = JSON.parse(payload);
          if (onChunk) onChunk(event.field, event.text);
        } catch (e) { /* skip malformed */ }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('网络连接失败，请检查网络设置');
    }
    throw error;
  }
}

async function callStructuredChatStream(message, onEvent, resetConversation = false, context = null, controller = null) {
  console.log('Structured Agent Stream Request:', message);

  const internalController = controller || new AbortController();
  const timeoutId = controller ? null : setTimeout(() => internalController.abort(), 180000);

  try {
    const body = { message, reset_conversation: resetConversation };
    if (context) {
      body.context = context;
    }
    const response = await fetch('/api/v1/ai/chat/structured', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      signal: internalController.signal,
      body: JSON.stringify(body),
    });
    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const payload = trimmed.slice(6);
        if (payload === '[DONE]') return;

        try {
          const event = JSON.parse(payload);
          if (onEvent) onEvent(event.event, event.payload);
        } catch (e) { /* skip malformed */ }
      }
    }
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('网络连接失败，请检查网络设置');
    }
    throw error;
  }
}

async function callConfirmGenerateDslStream(draft, userModified = false, onEvent, controller = null) {
  console.log('Confirm Generate DSL Stream Request:', draft?.name || 'model draft');

  const internalController = controller || new AbortController();
  const timeoutId = controller ? null : setTimeout(() => internalController.abort(), 180000);

  try {
    const response = await fetch('/api/v1/ai/chat/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      signal: internalController.signal,
      body: JSON.stringify({ draft, user_modified: userModified }),
    });
    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const payload = trimmed.slice(6);
        if (payload === '[DONE]') return;

        try {
          const event = JSON.parse(payload);
          if (onEvent) onEvent(event.event, event.payload);
        } catch (e) { /* skip malformed */ }
      }
    }
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('网络连接失败，请检查网络设置');
    }
    throw error;
  }
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
  qwen: {
    chat: callQwenAPI,
    chatStream: callQwenAPIStream,
    chatStructuredStream: callStructuredChatStream,
    confirmGenerateDslStream: callConfirmGenerateDslStream,
  },
};

export { getErrorMessage };