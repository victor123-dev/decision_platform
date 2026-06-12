import { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Send, Loader2, MessageSquare, Brain, CheckCircle, AlertCircle, RefreshCw, FileText, Copy, Download, Undo2, RotateCcw, X, Clock, ArrowUp, Bot, User, Zap } from 'lucide-react';
import { api } from '../api/apiClient';
import { saveConversation, createNewSession, updateConversationTitle, exportSession, importSession, generateSessionTitle } from '../utils/sessionStorage';
import { showToast } from './Toast';
import SessionList from './SessionList';

// ─ Ontology Data for Variable Source Matching ────────────────────────────
let _ontologyCache = null;
let _ontologyCacheTime = 0;
const ONTOLOGY_CACHE_TTL = 300000; // 5 min

async function fetchOntologyData() {
  if (_ontologyCache && Date.now() - _ontologyCacheTime < ONTOLOGY_CACHE_TTL) return _ontologyCache;
  try {
    const data = await api.get('/ontology/');
    _ontologyCache = data || [];
    _ontologyCacheTime = Date.now();
    return _ontologyCache;
  } catch { _ontologyCache = []; _ontologyCacheTime = Date.now(); return []; }
}

function buildOntologyLookup(ontologies) {
  const map = new Map();
  (ontologies || []).forEach(ont => {
    (ont.object_types || []).forEach(ot => {
      (ot.properties || []).forEach(prop => {
        const label = prop.label || prop.name;
        if (label) map.set(label, `${ont.name}.${ot.display_name}.${label}`);
      });
    });
  });
  return map;
}

// Business term synonym map: maps common business expressions to ontology standard labels
const ONTOLOGY_SYNONYMS = {
  '原材料': '物料', '原料': '物料', '材料': '物料',
  '库存量': '总数量', '库存水平': '总数量', '存货量': '总数量', '库存': '总数量',
  '计划量': '计划数量', '排产量': '计划数量', '生产量': '计划数量',
  '设备': '机台', '机器': '机台',
  '订单量': 'amount', '订货量': 'amount', '采购量': 'amount',
  '位置': 'location', '地点': 'location', '仓库位置': 'location',
  '等级': 'risk_level', '级别': 'risk_level',
  '名称': 'name', '名字': 'name',
  '类别': 'category', '分类': 'category', '类型': 'category',
  '产品': '产品名称', '货品': '产品名称',
  '任务': '生产任务', '工单任务': '生产任务',
  '物流': '物流单', '运输': '物流单', '配送': '物流单',
  '延期': '延期天数', '延迟': '延期天数',
  '供应商': '供应商名称', '供货商': '供应商名称',
  '客户': '客户名称',
};

function matchVariableToOntology(varName, lookup) {
  if (!varName || !lookup || lookup.size === 0) return null;
  for (const [label, path] of lookup) {
    if (varName.includes(label) || label.includes(varName)) return path;
    for (const [synonym, standardLabel] of Object.entries(ONTOLOGY_SYNONYMS)) {
      if (standardLabel === label && varName.includes(synonym)) return path;
    }
  }
  return null;
}

const AGENT_STAGES = {
  INITIAL: 'initial',
  CLARIFYING: 'clarifying',
  PROPOSING: 'proposing',
  REFINING: 'refining',
  CONFIRMING: 'confirming',
  COMPLETED: 'completed',
};


const SYSTEM_PROMPT = `
你是一位专业的优化建模专家助手。请遵循以下工作流程帮助用户构建数学优化模型：

## 角色：
- 你是精通线性规划、整数规划、混合整数规划的专家
- 擅长将业务问题转化为数学模型
- 能够理解复杂的业务需求并提出专业建议

## 工作流程：
1. **需求澄清**：通过提问了解用户的优化问题
   - 优化目标（最大化/最小化什么）
   - 决策变量（需要决定的变量）
   - 约束条件（资源限制、业务规则等）
   - 问题类型（LP/MIP/QP等）

2. **模型设计**：根据用户描述设计数学模型
   - 定义决策变量及其类型
   - 建立目标函数
   - 确定约束条件

3. **方案展示**：向用户展示模型方案并寻求反馈

4. **迭代优化**：根据用户反馈修改模型

5. **确认应用**：最终确认并输出结构化模型数据

## 输出格式要求：

### 模型JSON（必须）：
当你设计了优化模型（变量、目标、约束）时，必须在回复末尾输出JSON格式的模型定义：
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
    {"name": "产能约束", "description": "总产量不超过产能上限", "sense": "<=", "rhs": 100}
  ]
}
</MODEL_JSON>

## 注意事项：
- **语言要求：所有输出（包括思考推理、对话回复、JSON注释）必须使用中文**
- 请用中文交流，保持友好专业
- 每次提问只问一个问题，逐步澄清
- 如果用户描述不完整，主动追问缺失的信息
- 提供专业建议帮助用户完善模型

## 变量命名规范：
- 决策变量必须使用业务语义命名，如"产品产量"、"库存水平"、"运输量"
- 禁止使用 x1, x2 等数学符号作为变量名
- 约束条件也使用业务语义命名，如"产能约束"、"需求满足约束"
- 优先使用本体中定义的对象类型和属性标签来命名
- **CRITICAL**: 约束描述(description)和目标函数描述中引用的变量名，必须与决策变量(name)完全一致，不得缩写或改写。例如决策变量叫"产品正常生产量"，约束描述中必须写"产品正常生产量"而非"正常生产量"
`.trim();

// ─ Ontology Term Highlighter (for reasoning_content) ─────────────────────
function buildOntologyHighlightMap(lookup) {
  const map = new Map();
  for (const [label, path] of lookup) {
    if (!map.has(label)) map.set(label, { path, isSynonym: false });
    for (const [syn, stdLabel] of Object.entries(ONTOLOGY_SYNONYMS)) {
      if (stdLabel === label && !map.has(syn)) map.set(syn, { path, isSynonym: true });
    }
  }
  const directLabels = Array.from(lookup.keys());
  for (const [term, info] of map) {
    if (info.isSynonym) {
      for (const dl of directLabels) {
        if (dl !== term && dl.includes(term)) { map.delete(term); break; }
      }
    }
  }
  return map;
}

function highlightOntologyTerms(text, highlightMap) {
  if (!text || highlightMap.size === 0) return text;
  const sorted = [...highlightMap.entries()].sort((a, b) => b[0].length - a[0].length);
  let result = text;
  const placeholders = [];
  for (const [term, { path, isSynonym }] of sorted) {
    if (!result.includes(term)) continue;
    const color = isSynonym ? '#f59e0b' : '#3b82f6';
    const placeholder = `\x00PH${placeholders.length}\x00`;
    placeholders.push(
      `<span class="onto-tag" style="background:${color}15;color:${color}" title="${path}">`
      + `<span class="onto-dot" style="background:${color}"></span>`
      + `${term}</span>`
    );
    result = result.split(term).join(placeholder);
  }
  placeholders.forEach((html, i) => { result = result.replace(`\x00PH${i}\x00`, html); });
  return result;
}

// Clean reasoning content: remove MODEL_JSON blocks
function cleanReasoningContent(text) {
  if (!text) return '';
  // Remove <MODEL_JSON>...</MODEL_JSON> blocks
  let cleaned = text.replace(/<MODEL_JSON>[\s\S]*?<\/MODEL_JSON>/g, '');
  // Remove any stray JSON-like code fences
  cleaned = cleaned.replace(/```json[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  return cleaned.trim();
}

// ── Thinking Chain Panel with auto-scroll (smart follow / user-interrupt) ──
function ThinkingChainPanel({ thinking, highlightMap, isStreaming = false }) {
  if (!thinking) return null;
  const cleaned = cleanReasoningContent(thinking);
  if (!cleaned) return null;
  const highlighted = highlightOntologyTerms(cleaned, highlightMap);

  const contentRef = useRef(null);
  const [isOpen, setIsOpen] = useState(isStreaming);
  const [autoScroll, setAutoScroll] = useState(isStreaming);
  const prevThinkingRef = useRef(thinking);
  const prevIsOpenRef = useRef(isOpen);

  const scrollToBottom = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const checkIsAtBottom = useCallback(() => {
    const el = contentRef.current;
    if (!el) return true;
    const threshold = 5;
    return el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
  }, []);

  // Auto-scroll when thinking content grows and autoScroll is on
  useEffect(() => {
    const thinkingGrew = thinking.length > prevThinkingRef.current.length;
    prevThinkingRef.current = thinking;

    if (isOpen && autoScroll && thinkingGrew) {
      // Use requestAnimationFrame to ensure DOM has painted the new content
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToBottom);
      });
    }
  }, [thinking, isOpen, autoScroll, scrollToBottom]);

  // When panel opens while streaming, snap to bottom
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current && autoScroll) {
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToBottom);
      });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, autoScroll, scrollToBottom]);

  const handleToggle = useCallback((e) => {
    const open = e.target.open;
    setIsOpen(open);
    if (open && autoScroll) {
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToBottom);
      });
    }
  }, [autoScroll, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const atBottom = checkIsAtBottom();
    setAutoScroll(atBottom);
  }, [checkIsAtBottom]);

  return (
    <details
      className="agent-thinking-panel"
      style={{ marginBottom: 14 }}
      open={isStreaming || undefined}
      onToggle={handleToggle}
    >
      <summary>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Brain size={13} style={{ color: 'var(--primary)', opacity: 0.7 }} />
          <span>思考过程</span>
          {isStreaming && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 11, color: 'var(--primary)', fontWeight: 400,
            }}>
              <span className="agent-thinking-dots-mini">
                <span /><span /><span />
              </span>
              思考中…
            </span>
          )}
        </div>
        <span style={{
          fontSize: 11, color: 'var(--fg-4)', marginLeft: 'auto',
          whiteSpace: 'nowrap',
        }}>
          {isStreaming ? '实时生成' : ''}
        </span>
      </summary>
      <div
        ref={contentRef}
        className="thinking-content"
        onScroll={handleScroll}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </details>
  );
}

function formatTimestamp(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}


const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--seed-radius-sm)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

export default function AIAgentChat({ onModelConfirmed, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'agent',
      content: '您好！我是您的智能优化建模助手。请描述您的优化问题，我会帮您逐步构建数学模型。',
      stage: AGENT_STAGES.INITIAL,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(AGENT_STAGES.INITIAL);
  const [context, setContext] = useState({});
  const [currentProposal, setCurrentProposal] = useState(null);
  const [proposalHistory, setProposalHistory] = useState([]);
  const [selectedProposalIndex, setSelectedProposalIndex] = useState(-1);
  const [clarificationCount, setClarificationCount] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [showSessionList, setShowSessionList] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [editableProposal, setEditableProposal] = useState(null);
  const [userModified, setUserModified] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState(null);
  const [modifiedFields, setModifiedFields] = useState(new Set());
  const [ontologyLookup, setOntologyLookup] = useState(new Map());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchOntologyData().then(data => setOntologyLookup(buildOntologyLookup(data)));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (currentSession && messages.length > 0) {
      saveConversation({
        ...currentSession,
        messages: messages,
      });
    }
  }, [messages, currentSession]);

  const appendMessage = useCallback((message) => {
    setMessages(prev => [...prev, { ...message, timestamp: message.timestamp || new Date().toISOString() }]);
  }, []);

  const parseModelFromResponse = (content) => {
    const jsonMatch = content.match(/<MODEL_JSON>([\s\S]*?)<\/MODEL_JSON>/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        return null;
      }
    }
    const jsonBlockMatch = content.match(/\{[\s\S]*?"(?:problemType|variables|constraints)"[\s\S]*?\}/);
    if (jsonBlockMatch) {
      try {
        const parsed = JSON.parse(jsonBlockMatch[0]);
        if (parsed.variables || parsed.constraints || parsed.objective) {
          return parsed;
        }
      } catch {
        const startIdx = content.indexOf('{');
        if (startIdx !== -1) {
          let depth = 0;
          for (let i = startIdx; i < content.length; i++) {
            if (content[i] === '{') depth++;
            else if (content[i] === '}') depth--;
            if (depth === 0) {
              try {
                const parsed = JSON.parse(content.slice(startIdx, i + 1));
                if (parsed.variables || parsed.constraints || parsed.objective) {
                  return parsed;
                }
              } catch {}
              break;
            }
          }
        }
      }
    }
    return null;
  };

  const handleCopy = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      showToast('复制成功！', 'success', 2000);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      showToast('复制失败，请手动复制', 'error', 2000);
    }
  };

  const addProposalToHistory = (proposal) => {
    setProposalHistory(prev => {
      const next = [...prev, proposal];
      setSelectedProposalIndex(next.length - 1);
      return next;
    });
    setEditableProposal(JSON.parse(JSON.stringify(proposal)));
    setUserModified(false);
    setModifiedFields(new Set());
  };

  const syncEditableProposal = useCallback((proposal) => {
    if (proposal) {
      setEditableProposal(JSON.parse(JSON.stringify(proposal)));
      setUserModified(false);
      setModifiedFields(new Set());
    }
  }, []);

  const computeProposalDiff = useCallback(() => {
    const original = proposalHistory[selectedProposalIndex] || currentProposal;
    if (!original || !editableProposal) return null;
    const diffs = [];
    if (original.problemType !== editableProposal.problemType)
      diffs.push(`问题类型: ${original.problemType} → ${editableProposal.problemType}`);
    if (original.objective?.sense !== editableProposal.objective?.sense)
      diffs.push(`目标方向: ${original.objective?.sense} → ${editableProposal.objective?.sense}`);
    if (original.objective?.description !== editableProposal.objective?.description)
      diffs.push(`目标描述: "${original.objective?.description}" → "${editableProposal.objective?.description}"`);
    const origVars = original.variables || [];
    const editVars = editableProposal.variables || [];
    if (origVars.length !== editVars.length)
      diffs.push(`变量数量: ${origVars.length} → ${editVars.length}`);
    origVars.forEach((v, i) => {
      const ev = editVars[i];
      if (ev && v.name !== ev.name) diffs.push(`变量名: "${v.name}" → "${ev.name}"`);
      if (ev && v.type !== ev.type) diffs.push(`变量类型(${ev.name}): ${v.type} → ${ev.type}`);
      if (ev && v.lowerBound !== ev.lowerBound) diffs.push(`变量下界(${ev.name}): ${v.lowerBound} → ${ev.lowerBound}`);
      if (ev && v.upperBound !== ev.upperBound) diffs.push(`变量上界(${ev.name}): ${v.upperBound} → ${ev.upperBound}`);
    });
    const origCons = original.constraints || [];
    const editCons = editableProposal.constraints || [];
    if (origCons.length !== editCons.length)
      diffs.push(`约束数量: ${origCons.length} → ${editCons.length}`);
    origCons.forEach((c, i) => {
      const ec = editCons[i];
      if (ec && c.name !== ec.name) diffs.push(`约束名: "${c.name}" → "${ec.name}"`);
      if (ec && c.sense !== ec.sense) diffs.push(`约束方向(${ec.name}): ${c.sense} → ${ec.sense}`);
      if (ec && c.rhs !== ec.rhs) diffs.push(`约束右值(${ec.name}): ${c.rhs} → ${ec.rhs}`);
    });
    return diffs.length > 0 ? diffs : null;
  }, [editableProposal, selectedProposalIndex, proposalHistory, currentProposal]);

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    let session = currentSession;
    if (!session) {
      session = createNewSession();
      setCurrentSession(session);
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };
    appendMessage(userMessage);
    setInputValue('');
    setLoading(true);
    setApiError(null);

    if (session && !session.title && messages.length <= 1) {
      const newTitle = generateSessionTitle(inputValue.trim());
      updateConversationTitle(session.id, newTitle);
      setCurrentSession(prev => prev ? { ...prev, title: newTitle } : prev);
    }

    let agentMsgId = null;
    try {
      const userContext = { ...context };
      if (userModified && editableProposal) {
        const diffs = computeProposalDiff();
        if (diffs) {
          userContext.userModifications = diffs;
          userContext.currentEditableModel = editableProposal;
        }
      }

      const chatMessages = [
        { type: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ type: m.type, content: m.content })),
        { type: 'user', content: inputValue.trim() + (userContext.userModifications ? `\n\n[用户已手动调整模型，修改点：${userContext.userModifications.join('；')}]` : '') },
      ];

      agentMsgId = Date.now() + 1;
      appendMessage({
        id: agentMsgId,
        type: 'agent',
        content: '',
        reasoning_content: '',
        stage: stage,
        timestamp: new Date().toISOString(),
        streaming: true,
      });

      let fullContent = '';
      let fullReasoning = '';
      await api.qwen.chatStream(chatMessages, (field, text) => {
        if (field === 'reasoning_content') {
          fullReasoning += text;
        } else {
          fullContent += text;
        }
        setMessages(prev => prev.map(m =>
          m.id === agentMsgId ? { ...m, content: fullContent, reasoning_content: fullReasoning } : m
        ));
      });

      const parsedModel = parseModelFromResponse(fullContent);
      setMessages(prev => prev.map(m =>
        m.id === agentMsgId ? { ...m, streaming: false } : m
      ));

      if (parsedModel) {
        setCurrentProposal(parsedModel);
        addProposalToHistory(parsedModel);
        setStage(AGENT_STAGES.PROPOSING);
        setMessages(prev => prev.map(m =>
          m.id === agentMsgId ? {
            ...m,
            content: fullContent.replace(/<MODEL_JSON>[\s\S]*?<\/MODEL_JSON>/, '').trim() || '模型已构建完成！',
            proposal: parsedModel,
            stage: AGENT_STAGES.PROPOSING,
          } : m
        ));
      } else {
        if (stage === AGENT_STAGES.INITIAL || stage === AGENT_STAGES.CLARIFYING) {
          setStage(AGENT_STAGES.CLARIFYING);
          setClarificationCount(prev => prev + 1);
        } else if (stage === AGENT_STAGES.PROPOSING || stage === AGENT_STAGES.REFINING) {
          setStage(AGENT_STAGES.REFINING);
        }
      }
    } catch (error) {
      console.error('AI Service error:', error);
      setApiError(error.message);

      if (agentMsgId) {
        setMessages(prev => prev.filter(m => m.id !== agentMsgId));
      }

      const mockResponse = generateMockResponse(inputValue, stage, context);
      appendMessage({
        id: Date.now() + 1,
        type: 'agent',
        content: mockResponse.message,
        proposal: mockResponse.proposal,
        stage: mockResponse.stage,
        timestamp: new Date().toISOString(),
      });

      if (mockResponse.proposal) {
        setCurrentProposal(mockResponse.proposal);
        addProposalToHistory(mockResponse.proposal);
        setStage(mockResponse.stage === AGENT_STAGES.PROPOSING ? AGENT_STAGES.PROPOSING : stage);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMockResponse = (userInput, currentStage, currentContext) => {
    const objectives = ['最大化', '最小化', '最大', '最小', '优化', '提高', '降低'];
    const hasObjective = objectives.some(obj => userInput.includes(obj));

    if (currentStage === AGENT_STAGES.INITIAL || currentStage === AGENT_STAGES.CLARIFYING) {
      if (!currentContext.objective && !hasObjective) {
        return {
          message: '我注意到您的描述中没有明确优化目标。请问您是想最大化某个指标（如利润、效率），还是最小化某个指标（如成本、时间）？',
          stage: AGENT_STAGES.CLARIFYING,
        };
      }
      if (!currentContext.variables) {
        return {
          message: '好的，目标已明确。接下来想了解一下，这个问题中涉及哪些决策变量呢？例如产品产量、资源分配量等。',
          stage: AGENT_STAGES.CLARIFYING,
        };
      }
      if (!currentContext.constraints) {
        return {
          message: '了解了决策变量。现在想确认一下，有哪些约束条件需要考虑？比如资源限制、产能约束、需求约束等。',
          stage: AGENT_STAGES.CLARIFYING,
        };
      }
      return {
        message: '根据您提供的信息，我为您设计了一个优化模型方案：',
        proposal: generateMockProposal(currentContext, userInput),
        stage: AGENT_STAGES.PROPOSING,
      };
    }

    if (currentStage === AGENT_STAGES.PROPOSING || currentStage === AGENT_STAGES.REFINING) {
      const keywords = {
        change: ['修改', '更改', '调整', '变更'],
        add: ['添加', '增加', '新增'],
        remove: ['删除', '移除', '取消'],
        confirm: ['确认', '同意', '好', '是'],
      };

      if (keywords.confirm.some(k => userInput.includes(k)) && currentProposal) {
        return {
          message: '模型确认成功！即将应用到编辑页面。',
          proposal: currentProposal,
          stage: AGENT_STAGES.CONFIRMING,
        };
      }

      let message = '收到您的反馈，我来帮您调整模型。';
      if (keywords.change.some(k => userInput.includes(k))) {
        message = '好的，我来帮您修改模型。请具体说明需要修改哪一部分？';
      } else if (keywords.add.some(k => userInput.includes(k))) {
        message = '明白了，您想添加新的内容。是添加变量、约束，还是调整目标函数？';
      } else if (keywords.remove.some(k => userInput.includes(k))) {
        message = '了解。请告诉我需要删除哪个变量或约束？';
      }

      return {
        message,
        proposal: currentProposal ? currentProposal : generateMockProposal(currentContext, userInput),
        stage: AGENT_STAGES.REFINING,
      };
    }

    return { message: '感谢您的使用！', stage: AGENT_STAGES.COMPLETED };
  };

  const generateMockProposal = (context, userInput) => {
    const hasObjective = ['最大化', '最大', '提高'].some(k => userInput.includes(k));
    const defaultVars = [
      { id: 'v-1', name: '产量_A', type: 'continuous', lowerBound: 0, upperBound: 1000 },
      { id: 'v-2', name: '产量_B', type: 'continuous', lowerBound: 0, upperBound: 800 },
    ];
    const variables = context.variables
      ? context.variables.split(/[,，、\n]/).filter(v => v.trim()).map((v, i) => ({
          id: `v-${i + 1}`,
          name: v.trim(),
          type: 'continuous',
          lowerBound: 0,
          upperBound: null,
        }))
      : defaultVars;

    return {
      problemType: context.type || 'LP',
      objective: {
        sense: hasObjective ? 'maximize' : 'minimize',
        coefficients: variables.map((v, i) => ({
          variable: v.name,
          coefficient: Math.floor(Math.random() * 20) + 5,
        })),
      },
      variables,
      constraints: context.constraints
        ? context.constraints.split(/[,，、\n]/).filter(c => c.trim()).map((c, i) => ({
            id: `c-${i + 1}`,
            name: `约束_${i + 1}`,
            description: c.trim(),
            sense: '<=',
            rhs: 100,
          }))
        : [
            { id: 'c-1', name: '原材料约束', description: '原材料总量限制', sense: '<=', rhs: 500 },
            { id: 'c-2', name: '产能约束', description: '生产线产能限制', sense: '<=', rhs: 80 },
          ],
    };
  };

  const handleConfirm = () => {
    const proposal = editableProposal || proposalHistory[selectedProposalIndex] || currentProposal;
    if (!proposal) return;

    appendMessage({
      id: Date.now(),
      type: 'user',
      content: userModified ? '确认此模型（含手动调整）' : '确认此模型',
      timestamp: new Date().toISOString(),
    });

    setStage(AGENT_STAGES.CONFIRMING);

    setTimeout(() => {
      appendMessage({
        id: Date.now() + 1,
        type: 'agent',
        content: userModified
          ? '模型确认成功（已包含您的手动调整）！即将应用到编辑页面。'
          : '模型确认成功！即将应用到编辑页面。',
        stage: AGENT_STAGES.COMPLETED,
        timestamp: new Date().toISOString(),
      });

      setTimeout(() => {
        if (onModelConfirmed) {
          const modelData = {
            problemType: proposal.problemType,
            variables: proposal.variables.map(v => ({
              id: v.id || `v-${Date.now()}-${Math.random()}`,
              name: v.name,
              source: 'custom',
              type: v.type || 'continuous',
              lowerBound: v.lowerBound,
              upperBound: v.upperBound,
            })),
            objective: {
              sense: proposal.objective.sense,
              coefficients: (proposal.objective.coefficients || []).reduce((acc, c) => {
                acc[c.variable] = c.coefficient;
                return acc;
              }, {}),
            },
            constraints: proposal.constraints.map((c, idx) => ({
              id: c.id || `c-${Date.now()}-${idx}`,
              name: c.name,
              coefficients: {},
              sense: c.sense || '<=',
              rhs: c.rhs || 100,
            })),
          };
          onModelConfirmed(modelData);
        }
      }, 1000);
    }, 500);
  };

  const handleRegenerateLastMessage = async () => {
    const lastAgentIdx = [...messages].map((m, i) => m.type === 'agent' ? i : -1).filter(i => i >= 0).pop();
    if (lastAgentIdx === undefined || lastAgentIdx < 0) return;

    const lastUserIdx = [...messages].map((m, i) => m.type === 'user' ? i : -1).filter(i => i >= 0).pop();
    if (lastUserIdx === undefined || lastUserIdx < 0) return;

    const lastUserMessage = messages[lastUserIdx];
    setMessages(prev => prev.slice(0, lastAgentIdx));
    setLoading(true);
    setApiError(null);

    let regenMsgId = null;
    try {
      const prevMessages = messages.slice(0, lastAgentIdx);
      const chatMessages = [
        { type: 'system', content: SYSTEM_PROMPT },
        ...prevMessages.map(m => ({ type: m.type, content: m.content })),
        lastUserMessage,
      ];

      regenMsgId = Date.now();
      appendMessage({
        id: regenMsgId,
        type: 'agent',
        content: '',
        reasoning_content: '',
        stage: stage,
        timestamp: new Date().toISOString(),
        streaming: true,
      });

      let fullContent = '';
      let fullReasoning = '';
      await api.qwen.chatStream(chatMessages, (field, text) => {
        if (field === 'reasoning_content') {
          fullReasoning += text;
        } else {
          fullContent += text;
        }
        setMessages(prev => prev.map(m =>
          m.id === regenMsgId ? { ...m, content: fullContent, reasoning_content: fullReasoning } : m
        ));
      });

      const parsedModel = parseModelFromResponse(fullContent);
      setMessages(prev => prev.map(m =>
        m.id === regenMsgId ? { ...m, streaming: false } : m
      ));

      if (parsedModel) {
        setCurrentProposal(parsedModel);
        addProposalToHistory(parsedModel);
        setStage(AGENT_STAGES.PROPOSING);
        setMessages(prev => prev.map(m =>
          m.id === regenMsgId ? {
            ...m,
            content: fullContent.replace(/<MODEL_JSON>[\s\S]*?<\/MODEL_JSON>/, '').trim() || '模型已构建完成！',
            proposal: parsedModel,
            stage: AGENT_STAGES.PROPOSING,
          } : m
        ));
      }
    } catch (error) {
      console.error('AI Service error:', error);
      setApiError(error.message);
      if (regenMsgId) {
        setMessages(prev => prev.filter(m => m.id !== regenMsgId));
      }
      appendMessage({
        id: Date.now(),
        type: 'agent',
        content: '抱歉，重新生成时出现了错误，请再试一次。',
        stage: stage,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    if (messages.length <= 1) return;
    setMessages(prev => prev.slice(0, -2));
  };

  const handleNewSession = () => {
    setCurrentSession(null);
    setMessages([{
      id: 1,
      type: 'agent',
      content: '您好！我是您的智能优化建模助手。请描述您的优化问题，我会帮您逐步构建数学模型。',
      stage: AGENT_STAGES.INITIAL,
      timestamp: new Date().toISOString(),
    }]);
    setStage(AGENT_STAGES.INITIAL);
    setContext({});
    setCurrentProposal(null);
    setProposalHistory([]);
    setSelectedProposalIndex(-1);
    setClarificationCount(0);
    setShowSessionList(false);
    setEditableProposal(null);
    setUserModified(false);
    setModifiedFields(new Set());
  };

  const handleSelectSession = (session) => {
    setCurrentSession(session);
    setMessages(session.messages && session.messages.length > 0
      ? session.messages
      : [{
          id: 1,
          type: 'agent',
          content: '您好！我是您的智能优化建模助手。请描述您的优化问题，我会帮您逐步构建数学模型。',
          stage: AGENT_STAGES.INITIAL,
          timestamp: new Date().toISOString(),
        }]
    );
    setStage(AGENT_STAGES.INITIAL);
    setContext({});
    setCurrentProposal(null);
    setProposalHistory([]);
    setSelectedProposalIndex(-1);
    setShowSessionList(false);
    setEditableProposal(null);
    setUserModified(false);
    setModifiedFields(new Set());
  };

  const handleExportModel = () => {
    const proposal = editableProposal || proposalHistory[selectedProposalIndex] || currentProposal;
    if (!proposal) return;
    try {
      const json = JSON.stringify(proposal, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'model_proposal.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('模型已导出', 'success', 2000);
    } catch (err) {
      showToast('导出失败', 'error', 2000);
    }
  };

  const activeProposal = editableProposal || (selectedProposalIndex >= 0 ? proposalHistory[selectedProposalIndex] : currentProposal);

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Header
  // ══════════════════════════════════════════════════════════════════════════
  const renderHeader = () => (
    <div className="agent-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Icon with gradient and glow */}
        <div className="agent-header-icon">
          <Zap size={18} color="#fff" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="agent-header-title">智能建模助手</span>
            {/* Live status indicator */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 10,
              background: loading
                ? 'color-mix(in srgb, var(--primary) 10%, transparent)'
                : 'color-mix(in srgb, var(--success) 10%, transparent)',
              color: loading ? 'var(--primary)' : 'var(--success)',
              border: `1px solid ${loading
                ? 'color-mix(in srgb, var(--primary) 20%, transparent)'
                : 'color-mix(in srgb, var(--success) 20%, transparent)'}`,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: loading ? 'var(--primary)' : 'var(--success)',
                animation: loading ? 'agent-pulse-glow 2s ease-in-out infinite' : 'none',
                display: 'inline-block',
              }} />
              {loading ? '思考中' : '在线'}
            </span>
          </div>
          <div className="agent-header-subtitle">AI 驱动的优化建模专家</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={onClose}
          className="agent-close-btn"
          title="关闭"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Message Bubble
  // ══════════════════════════════════════════════════════════════════════════
  const renderMessage = (msg, index) => {
    const isAgent = msg.type === 'agent';
    const isLastAgent = isAgent && messages.slice().reverse().find(m => m.type === 'agent')?.id === msg.id;

    return (
      <div key={msg.id} style={{
        display: 'flex',
        flexDirection: isAgent ? 'row' : 'row-reverse',
        gap: 10,
        marginBottom: 18,
        animation: 'agent-fade-slide-in 0.3s ease-out',
        animationFillMode: 'both',
        animationDelay: '0s',
      }}>
        {/* Avatar */}
        {isAgent ? (
          <div className="agent-avatar">
            <Bot size={17} color="#fff" />
          </div>
        ) : (
          <div className="user-avatar">
            <User size={16} />
          </div>
        )}

        {/* Bubble Content */}
        <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column' }}>
          {(() => {
            if (!isAgent) {
              return (
                <div className="user-bubble" style={{ padding: '10px 16px' }}>
                  <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
              );
            }
            // Agent message with thinking chain — rendered OUTSIDE the bubble for visual separation
            const reasoningText = msg.reasoning_content || '';
            const highlightMap = buildOntologyHighlightMap(ontologyLookup);
            const isStreaming = msg.streaming === true;
            const reasoningSection = reasoningText ? (
              <ThinkingChainPanel
                thinking={reasoningText}
                highlightMap={highlightMap}
                isStreaming={isStreaming}
              />
            ) : null;
            // Show a "thinking started" placeholder when streaming but no reasoning yet
            const thinkingPlaceholder = (isStreaming && !reasoningText) ? (
              <details className="agent-thinking-panel" style={{ marginBottom: 14 }} open>
                <summary>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Brain size={13} style={{ color: 'var(--primary)', opacity: 0.5 }} />
                    <span style={{ color: 'var(--fg-3)' }}>准备思考…</span>
                    <span className="agent-thinking-dots-mini">
                      <span /><span /><span />
                    </span>
                  </div>
                </summary>
              </details>
            ) : null;
            return (
              <>
                {/* Thinking chain — separate panel above the output bubble */}
                {reasoningSection}
                {thinkingPlaceholder}
                {/* Main output bubble */}
                <div className="agent-bubble" style={{ padding: '12px 16px' }}>
                  <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap', color: 'var(--fg)' }}>
                    {msg.content}
                    {isStreaming && <span className="streaming-cursor" />}
                  </p>
                </div>
              </>
            );
          })()}

          {/* Timestamp + Actions Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isAgent ? 'flex-start' : 'flex-end',
            gap: 6,
            marginTop: 5,
            paddingLeft: 4,
            paddingRight: 4,
          }}>
            <span className="msg-timestamp">{formatTimestamp(msg.timestamp)}</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Copy button */}
              <button
                onClick={() => handleCopy(msg.content, msg.id)}
                className="msg-action-btn"
                style={{ color: copiedMessageId === msg.id ? 'var(--success)' : undefined }}
                title="复制"
              >
                {copiedMessageId === msg.id ? <CheckCircle size={12} /> : <Copy size={12} />}
              </button>

              {/* Regenerate button (last agent message only) */}
              {isAgent && isLastAgent && !loading && (
                <button
                  onClick={handleRegenerateLastMessage}
                  className="msg-action-btn"
                  title="重新生成"
                >
                  <RotateCcw size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Loading Indicator
  // ══════════════════════════════════════════════════════════════════════════
  const renderLoading = () => (
    <div style={{
      display: 'flex',
      gap: 10,
      marginBottom: 18,
      animation: 'agent-fade-slide-in 0.3s ease-out',
    }}>
      <div className="agent-avatar">
        <Bot size={17} color="#fff" />
      </div>
      <div className="agent-loading-bubble" style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div className="agent-thinking-dots">
          <span /><span /><span />
        </div>
        <span style={{ fontSize: 13, color: 'var(--fg-3)', fontWeight: 500 }}>正在分析...</span>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Proposal Panel (Right Side)
  // ══════════════════════════════════════════════════════════════════════════
  const inputStyleBase = {
    width: '100%',
    padding: '5px 10px',
    fontSize: 12,
    border: '1px solid var(--border)',
    borderRadius: 'var(--seed-radius-sm)',
    background: 'var(--surface-2)',
    color: 'var(--fg)',
    outline: 'none',
    fontFamily: "'JetBrains Mono', monospace",
    transition: 'all 0.15s ease',
  };

  const markModified = (field) => {
    setUserModified(true);
    setModifiedFields(prev => new Set([...prev, field]));
  };

  const updateEditableVar = (idx, field, value) => {
    setEditableProposal(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      next.variables[idx] = { ...next.variables[idx], [field]: value };
      return next;
    });
    markModified(`variables[${idx}].${field}`);
  };

  const updateEditableConstraint = (idx, field, value) => {
    setEditableProposal(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      next.constraints[idx] = { ...next.constraints[idx], [field]: value };
      return next;
    });
    markModified(`constraints[${idx}].${field}`);
  };

  const updateObjective = (field, value) => {
    setEditableProposal(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      next.objective = { ...next.objective, [field]: value };
      return next;
    });
    markModified(`objective.${field}`);
  };

  const addObjectiveCoeff = () => {
    setEditableProposal(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.objective.coefficients) next.objective.coefficients = [];
      next.objective.coefficients.push({ variable: '', coefficient: 1 });
      return next;
    });
    markModified('objective.coefficients.add');
  };

  const removeObjectCoeff = (idx) => {
    setEditableProposal(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      next.objective.coefficients.splice(idx, 1);
      return next;
    });
    markModified('objective.coefficients.remove');
  };

  const updateObjectCoeff = (idx, field, value) => {
    setEditableProposal(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      next.objective.coefficients[idx] = { ...next.objective.coefficients[idx], [field]: value };
      return next;
    });
    markModified(`objective.coefficients[${idx}].${field}`);
  };

  const addVariable = () => {
    setEditableProposal(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      next.variables.push({ id: `v-edit-${Date.now()}`, name: '新变量', type: 'continuous', lowerBound: 0, upperBound: null });
      return next;
    });
    markModified('variables.add');
  };

  const removeVariable = (idx) => {
    setEditableProposal(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      next.variables.splice(idx, 1);
      return next;
    });
    markModified('variables.remove');
  };

  const addConstraint = () => {
    setEditableProposal(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      next.constraints.push({ id: `c-edit-${Date.now()}`, name: '新约束', description: '', sense: '<=', rhs: 0 });
      return next;
    });
    markModified('constraints.add');
  };

  const removeConstraint = (idx) => {
    setEditableProposal(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      next.constraints.splice(idx, 1);
      return next;
    });
    markModified('constraints.remove');
  };

  const renderProposalPanel = () => {
    if (!activeProposal && proposalHistory.length === 0) return null;
    const proposal = activeProposal;
    if (!proposal) return null;

    const vars = proposal.variables || [];
    const cons = proposal.constraints || [];
    const obj = proposal.objective || {};

    return (
      <div className="proposal-panel">
        {/* Title + Version + Modified Badge */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: 'var(--seed-radius-sm)',
              background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 80%, var(--accent)))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px color-mix(in srgb, var(--primary) 20%, transparent)',
            }}>
              <FileText size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>模型方案</span>
            {userModified && (
              <span className="modified-badge">已修改</span>
            )}
          </div>
          {proposalHistory.length > 1 && (
            <select
              value={selectedProposalIndex}
              onChange={e => {
                const idx = Number(e.target.value);
                setSelectedProposalIndex(idx);
                const p = proposalHistory[idx];
                if (p) syncEditableProposal(p);
              }}
              className="proposal-version-select"
            >
              {proposalHistory.map((_, idx) => (
                <option key={idx} value={idx}>版本 {idx + 1}</option>
              ))}
            </select>
          )}
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Problem Type */}
          <div className="proposal-section-card">
            <div className="proposal-section-label">
              <span style={{
                width: 4, height: 4, borderRadius: '50%',
                background: 'var(--primary)', display: 'inline-block', flexShrink: 0,
              }} />
              问题类型
            </div>
            <select
              value={proposal.problemType || 'LP'}
              onChange={e => {
                setEditableProposal(prev => prev ? { ...prev, problemType: e.target.value } : prev);
                markModified('problemType');
              }}
              style={{
                fontSize: 12, fontWeight: 600, padding: '5px 12px',
                borderRadius: 20, border: '1px solid var(--border)',
                background: proposal.problemType === 'LP' ? '#dbeafe' : proposal.problemType === 'MIP' ? '#ffedd5' : '#fee2e2',
                color: proposal.problemType === 'LP' ? '#1d4ed8' : proposal.problemType === 'MIP' ? '#c2410c' : '#dc2626',
                cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
              }}
            >
              <option value="LP">LP · 线性规划</option>
              <option value="MIP">MIP · 混合整数</option>
              <option value="QP">QP · 二次规划</option>
            </select>
          </div>

          {/* Objective */}
          <div className="proposal-section-card">
            <div className="proposal-section-label">
              <span style={{
                width: 4, height: 4, borderRadius: '50%',
                background: 'var(--success)', display: 'inline-block', flexShrink: 0,
              }} />
              目标函数
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <select
                value={obj.sense || 'maximize'}
                onChange={e => updateObjective('sense', e.target.value)}
                className="proposal-select"
                style={{
                  background: obj.sense === 'maximize' ? '#dcfce7' : '#fee2e2',
                  color: obj.sense === 'maximize' ? 'var(--success)' : 'var(--danger)',
                  fontWeight: 600,
                }}
              >
                <option value="maximize">最大化</option>
                <option value="minimize">最小化</option>
              </select>
              <span style={{ fontSize: 12, color: 'var(--fg-3)', fontWeight: 500 }}>=</span>
            </div>
            {/* Coefficients */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {(obj.coefficients || []).map((coeff, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {idx > 0 && <span style={{ fontSize: 12, color: 'var(--fg-3)', width: 14, textAlign: 'center', fontWeight: 500 }}>+</span>}
                  <input
                    type="number"
                    value={coeff.coefficient ?? 1}
                    onChange={e => updateObjectCoeff(idx, 'coefficient', parseFloat(e.target.value) || 0)}
                    placeholder="系数"
                    className="proposal-field-input"
                    style={{ width: 64, fontSize: 12 }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>×</span>
                  <input
                    value={coeff.variable || ''}
                    onChange={e => updateObjectCoeff(idx, 'variable', e.target.value)}
                    placeholder="变量名"
                    className="proposal-field-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={() => removeObjectCoeff(idx)}
                    style={{
                      ...btnBase, padding: '3px 6px', background: 'transparent',
                      border: 'none', color: 'var(--fg-3)', fontSize: 16, lineHeight: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-3)'; }}
                    title="删除"
                  >×</button>
                </div>
              ))}
              <button
                onClick={addObjectiveCoeff}
                className="proposal-small-btn"
                style={{ marginTop: 2 }}
              >
                + 添加项
              </button>
            </div>
          </div>

          {/* Variables */}
          <div className="proposal-section-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="proposal-section-label" style={{ marginBottom: 0 }}>
                <span style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: 'var(--accent)', display: 'inline-block', flexShrink: 0,
                }} />
                决策变量 ({vars.length})
              </div>
              <button onClick={addVariable} className="proposal-small-btn">+ 添加</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {vars.map((v, idx) => (
                <div key={v.id || idx} className="proposal-var-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    {(() => {
                      const ontoPath = matchVariableToOntology(v.name, ontologyLookup);
                      return ontoPath ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredTooltip({ text: ontoPath, top: rect.top, left: rect.left + rect.width / 2 });
                          }}
                          onMouseLeave={() => setHoveredTooltip(null)}
                        >
                          <span style={{
                            width: 9, height: 9, borderRadius: 2,
                            background: '#3b82f6', display: 'inline-block', cursor: 'help',
                          }} />
                        </span>
                      ) : null;
                    })()}
                    <input
                      value={v.name || ''}
                      onChange={e => updateEditableVar(idx, 'name', e.target.value)}
                      placeholder="变量名"
                      className="proposal-field-input"
                      style={{ flex: 1 }}
                    />
                    <select
                      value={v.type || 'continuous'}
                      onChange={e => updateEditableVar(idx, 'type', e.target.value)}
                      className="proposal-select"
                      style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', paddingRight: 22 }}
                    >
                      <option value="continuous">连续</option>
                      <option value="integer">整数</option>
                      <option value="binary">二进制</option>
                    </select>
                    <button
                      onClick={() => removeVariable(idx)}
                      style={{
                        ...btnBase, padding: '3px 6px', background: 'transparent',
                        border: 'none', color: 'var(--fg-3)', fontSize: 16, lineHeight: 1,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-3)'; }}
                      title="删除变量"
                    >×</button>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 500, marginBottom: 2, display: 'block' }}>下界</label>
                      <input
                        type="number"
                        value={v.lowerBound ?? 0}
                        onChange={e => updateEditableVar(idx, 'lowerBound', parseFloat(e.target.value) || 0)}
                        className="proposal-field-input"
                        style={{ fontSize: 11 }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 500, marginBottom: 2, display: 'block' }}>上界</label>
                      <input
                        type="number"
                        value={v.upperBound ?? ''}
                        onChange={e => updateEditableVar(idx, 'upperBound', e.target.value === '' ? null : parseFloat(e.target.value))}
                        placeholder="∞"
                        className="proposal-field-input"
                        style={{ fontSize: 11 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="proposal-section-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="proposal-section-label" style={{ marginBottom: 0 }}>
                <span style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: 'var(--warning)', display: 'inline-block', flexShrink: 0,
                }} />
                约束条件 ({cons.length})
              </div>
              <button onClick={addConstraint} className="proposal-small-btn">+ 添加</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cons.map((c, idx) => (
                <div key={c.id || idx} className="proposal-var-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <input
                      value={c.name || ''}
                      onChange={e => updateEditableConstraint(idx, 'name', e.target.value)}
                      placeholder="约束名"
                      className="proposal-field-input"
                      style={{ flex: 1 }}
                    />
                    <select
                      value={c.sense || '<='}
                      onChange={e => updateEditableConstraint(idx, 'sense', e.target.value)}
                      className="proposal-select"
                      style={{ fontSize: 12, fontWeight: 600, padding: '4px 8px', paddingRight: 22, width: 52 }}
                    >
                      <option value="<=">≤</option>
                      <option value=">=">≥</option>
                      <option value="==">=</option>
                    </select>
                    <input
                      type="number"
                      value={c.rhs ?? 0}
                      onChange={e => updateEditableConstraint(idx, 'rhs', parseFloat(e.target.value) || 0)}
                      placeholder="右值"
                      className="proposal-field-input"
                      style={{ width: 64, fontSize: 12 }}
                    />
                    <button
                      onClick={() => removeConstraint(idx)}
                      style={{
                        ...btnBase, padding: '3px 6px', background: 'transparent',
                        border: 'none', color: 'var(--fg-3)', fontSize: 16, lineHeight: 1,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-3)'; }}
                      title="删除约束"
                    >×</button>
                  </div>
                  <input
                    value={c.description || ''}
                    onChange={e => updateEditableConstraint(idx, 'description', e.target.value)}
                    placeholder="约束描述（可选）"
                    className="proposal-field-input"
                    style={{ fontSize: 11, fontFamily: 'inherit' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <button
            onClick={handleConfirm}
            disabled={stage === AGENT_STAGES.COMPLETED}
            className="proposal-confirm-btn"
          >
            <CheckCircle size={16} />
            确认模型并应用
          </button>
          <button
            onClick={handleExportModel}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: '9px 0', borderRadius: 'var(--seed-radius-md)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--fg-2)', fontSize: 13, fontWeight: 500, gap: 6,
              cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 4%, var(--surface))';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--fg-2)';
              e.currentTarget.style.background = 'var(--surface)';
            }}
          >
            <Download size={15} />
            导出 JSON
          </button>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="agent-chat-container">
      {/* Keyframe animations injected here */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Header ── */}
      {renderHeader()}

      {/* ── Error Banner ── */}
      {apiError && (
        <div className="agent-error-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span style={{ minWidth: 0 }}>AI 服务暂时不可用，已切换到本地模式</span>
          </div>
          <button onClick={() => setApiError(null)}>
            知道了
          </button>
        </div>
      )}

      {/* ── Body: Sidebar + Chat + Proposal ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <SessionList
          currentSessionId={currentSession?.id}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
        />

        {/* ── Chat Column ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Messages */}
          <div className="agent-messages-area">
            {messages.map((msg, idx) => renderMessage(msg, idx))}
            {loading && !messages.some(m => m.streaming) && renderLoading()}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Area ── */}
          <div className="chat-input-wrapper">
            {messages.length > 1 && !loading && (
              <button
                onClick={handleUndo}
                className="chat-undo-btn"
                title="撤销上一轮对话"
              >
                <Undo2 size={17} />
              </button>
            )}

            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="输入您的优化问题或修改意见..."
              disabled={loading}
              className="chat-input-field"
            />

            <button
              onClick={handleSend}
              disabled={loading || !inputValue.trim()}
              className="chat-send-btn"
            >
              {loading ? (
                <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  <ArrowUp size={17} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Proposal Panel (Right Side) ── */}
        {renderProposalPanel()}
      </div>

      {/* ── Bottom Status Bar (Clarifying Stage) ── */}
      {stage === AGENT_STAGES.CLARIFYING && (
        <div className="agent-status-bar">
          <span className="status-dot-pulse" />
          <span>正在收集信息以构建模型 ({clarificationCount}/4 轮)</span>
        </div>
      )}

      {/* ── Portal Tooltip for Ontology Badges ── */}
      {hoveredTooltip && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          top: hoveredTooltip.top - 6,
          left: hoveredTooltip.left,
          transform: 'translate(-50%, -100%)',
          padding: '5px 10px',
          background: '#1e293b',
          color: '#f1f5f9',
          fontSize: 11,
          borderRadius: 6,
          whiteSpace: 'nowrap',
          zIndex: 100000,
          pointerEvents: 'none',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        }}>{hoveredTooltip.text}</div>,
        document.body
      )}
    </div>
  );
}
