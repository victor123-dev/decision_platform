const STORAGE_KEY = 'ai_agent_conversations';

export function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getConversations() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveConversation(conversation) {
  try {
    const conversations = getConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = {
        ...conversation,
        updatedAt: new Date().toISOString(),
      };
    } else {
      conversations.unshift({
        ...conversation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(0, 50)));
    return conversations;
  } catch {
    return [];
  }
}

export function deleteConversation(sessionId) {
  try {
    const conversations = getConversations().filter(c => c.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    return conversations;
  } catch {
    return [];
  }
}

export function clearAllConversations() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch {
    return [];
  }
}

export function getConversationById(sessionId) {
  const conversations = getConversations();
  return conversations.find(c => c.id === sessionId);
}

export function appendToSession(sessionId, messages) {
  if (!sessionId || !Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  const conversations = getConversations();
  const index = conversations.findIndex(c => c.id === sessionId);
  if (index < 0) return null;

  const conversation = conversations[index];
  conversation.messages = [...(conversation.messages || []), ...messages];
  conversation.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  return conversation;
}

export function getDefaultSession() {
  const conversations = getConversations();
  if (conversations.length > 0) {
    return conversations[0];
  }
  
  return createNewSession();
}

export function createNewSession() {
  const sessionId = generateSessionId();
  const newConversation = {
    id: sessionId,
    title: '',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    model: 'optimization',
  };
  
  saveConversation(newConversation);
  return newConversation;
}

export function generateSessionTitle(content) {
  if (!content || typeof content !== 'string') {
    return '未命名会话';
  }
  
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return '未命名会话';
  }
  
  if (trimmed.length <= 30) {
    return trimmed;
  }
  
  const firstSentence = trimmed.split(/[。！？\n]/)[0] || trimmed;
  const summary = firstSentence.length <= 30 ? firstSentence : firstSentence.substring(0, 30) + '...';
  
  return summary;
}

export function updateConversationTitle(sessionId, title) {
  const conversations = getConversations();
  const index = conversations.findIndex(c => c.id === sessionId);
  
  if (index >= 0) {
    conversations[index].title = title;
    conversations[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    return conversations[index];
  }
  
  return null;
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  
  return date.toLocaleDateString('zh-CN');
}

export function exportSession(sessionId) {
  const session = getConversationById(sessionId);
  if (!session) return null;

  return {
    id: session.id,
    title: session.title,
    messages: session.messages,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export function importSession(jsonData) {
  if (!jsonData || !Array.isArray(jsonData.messages)) return null;

  const newSessionId = generateSessionId();
  const newSession = {
    id: newSessionId,
    title: jsonData.title || '导入的会话',
    messages: jsonData.messages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveConversation(newSession);
  return newSession;
}