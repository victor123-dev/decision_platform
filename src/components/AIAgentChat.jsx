import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import ReactDOM from 'react-dom';
import { Send, Loader2, MessageSquare, Brain, CheckCircle, CheckCircle2, AlertCircle, RefreshCw, FileText, Copy, Download, Undo2, RotateCcw, X, Clock, ArrowUp, Bot, User, Zap } from 'lucide-react';
import { api } from '../api/apiClient';
import { saveConversation, createNewSession, updateConversationTitle, exportSession, importSession, generateSessionTitle, appendToSession } from '../utils/sessionStorage';
import { showToast } from './Toast';
import SessionList from './SessionList';
import OntologyModelMappingModal from './OntologyModelMappingModal';
import GuidedFeasibilityWizard from './GuidedFeasibilityWizard';
import VariableToken, { VariableTokenGroup } from './VariableToken';
import { buildVariableMap, normalizeCoefficient, getOntologyPath } from '../utils/variableUtils';

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

// Multi-color mapping for ontology object types
const ONTOLOGY_COLORS = {
  '供应商': '#3b82f6',   // blue
  '客户': '#10b981',     // green
  '物料': '#f59e0b',     // amber
  '工单': '#8b5cf6',     // purple
  '产品': '#ec4899',     // pink
  '风险': '#ef4444',     // red
  '库存': '#06b6d4',     // cyan
  '机台': '#f97316',     // orange
  '生产任务': '#6366f1', // indigo
  '物流单': '#14b8a6',   // teal
  'default': '#64748b',  // slate
};

function getOntologyColor(ontoPath) {
  if (!ontoPath) return ONTOLOGY_COLORS.default;
  for (const [objType, color] of Object.entries(ONTOLOGY_COLORS)) {
    if (ontoPath.includes(objType)) return color;
  }
  return ONTOLOGY_COLORS.default;
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
你是一位专业的优化建模专家助手。请遵循以下结构化工作流程帮助用户构建数学优化模型：

## 角色：
- 你是精通线性规划、整数规划、混合整数规划的专家
- 擅长将业务问题转化为数学模型
- 能够理解复杂的业务需求并提出专业建议
- 精通供应链控制塔本体模型（供应商/客户/物料/工单/产品/风险/库存/机台/生产任务/物流单）

## 思考推理规范（极其重要）：
- **简洁明了**：思考过程必须简洁，避免冗长的技术分析
- **用户视角**：只输出对用户有意义的思考内容，禁止输出内部处理细节、API调用过程、JSON结构分析等技术性内容
- **多轮对话**：当用户进行多轮对话（修改、追问、补充）时，思考过程应该更加简短，只需简要确认理解并给出方案，不需要重复完整的分析流程
- **禁止输出原始数据**：思考过程中禁止输出JSON格式数据、变量定义列表、约束条件列表等结构化数据
- **聚焦结论**：直接给出结论和建议，而不是展示推理的中间步骤

## 结构化工作流程（必须严格按步骤执行）：

### Step 1: 识别业务对象
- 分析用户描述，识别涉及的本体对象类型（如：机台、工单、物料等）
- 列出每个对象的关键属性

### Step 2: 匹配决策变量集
- 根据识别的对象，推荐对应的决策变量（参考变量集模板）
- 为每个变量关联本体引用：ontologyRef = { objectType, property }
- 说明每个变量的业务含义

### Step 3: 匹配约束条件集
- 根据识别的对象和变量，推荐常态化约束模板
- 约束分类：硬约束(hard)/软约束(soft)
- 为软约束建议惩罚权重

### Step 4: 补充完善
- 根据用户特定需求补充额外的变量或约束
- 确认目标函数方向与系数

### Step 5: 生成模型草案
- 输出完整的模型JSON（见下方格式要求）
- 包含ontologyRef本体引用信息

### Step 6: 用户确认
- 等待用户审核、调整方案面板中的参数
- 根据用户修改重新生成

### Step 7: 输出最终OR-DSL
- 确认后输出结构化OR-DSL JSON，用于回填编辑器

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
    {
      "name": "产品A产量",
      "type": "continuous",
      "lowerBound": 0,
      "upperBound": null,
      "ontologyRef": {"objectType": "生产任务", "property": "计划数量"},
      "businessMeaning": "产品A在各产线的生产数量"
    }
  ],
  "constraints": [
    {
      "name": "产能约束",
      "description": "总产量不超过产能上限",
      "sense": "<=",
      "rhs": 100,
      "category": "capacity",
      "hardness": "hard"
    }
  ]
}
</MODEL_JSON>

## 注意事项：
- **语言要求：所有输出（包括思考推理、对话回复、JSON注释）必须使用中文**
- 请用中文交流，保持友好专业
- 每次提问只问一个问题，逐步澄清
- 如果用户描述不完整，主动追问缺失的信息
- 提供专业建议帮助用户完善模型
- **思维链中涉及本体术语时，请在术语后加括号标注归属路径，如：机台（供应链控制塔.机台.设备编号）**

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

function getOntologyPathColor(path) {
  if (!path) return ONTOLOGY_COLORS.default;
  for (const [objType, color] of Object.entries(ONTOLOGY_COLORS)) {
    if (path.includes(objType)) return color;
  }
  return ONTOLOGY_COLORS.default;
}

function highlightOntologyTerms(text, highlightMap) {
  if (!text || highlightMap.size === 0) return text;
  const sorted = [...highlightMap.entries()].sort((a, b) => b[0].length - a[0].length);
  let result = text;
  const placeholders = [];
  for (const [term, { path, isSynonym }] of sorted) {
    if (!result.includes(term)) continue;
    const color = getOntologyPathColor(path);
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

// React 组件：将文本中的本体术语渲染为带颜色标签 + hover tooltip
function OntologyHighlightedText({ text, lookup, onHover }) {
  if (!text || !lookup || lookup.size === 0) return <span>{text}</span>;

  const segments = useMemo(() => {
    const highlightMap = buildOntologyHighlightMap(lookup);
    const sorted = [...highlightMap.entries()].sort((a, b) => b[0].length - a[0].length);

    // 构建带占位符的分段
    let segments = [{ text, highlighted: false }];
    sorted.forEach(([term, { path, isSynonym }]) => {
      const color = getOntologyPathColor(path);
      const nextSegments = [];
      segments.forEach(seg => {
        if (seg.highlighted) {
          nextSegments.push(seg);
          return;
        }
        let idx = seg.text.indexOf(term);
        let rest = seg.text;
        while (idx !== -1) {
          if (idx > 0) nextSegments.push({ text: rest.slice(0, idx), highlighted: false });
          nextSegments.push({
            text: term,
            highlighted: true,
            path,
            color,
            isSynonym,
          });
          rest = rest.slice(idx + term.length);
          idx = rest.indexOf(term);
        }
        if (rest) nextSegments.push({ text: rest, highlighted: false });
      });
      segments = nextSegments;
    });
    return segments;
  }, [text, lookup]);

  return (
    <span>
      {segments.map((seg, i) => {
        if (!seg.highlighted) return <span key={i}>{seg.text}</span>;
        return (
          <span
            key={i}
            className="onto-tag-inline"
            style={{
              background: `${seg.color}15`,
              color: seg.color,
              borderRadius: 4,
              padding: '0 4px',
              cursor: 'help',
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              if (onHover) onHover({ text: seg.path, top: rect.top, left: rect.left + rect.width / 2 });
            }}
            onMouseLeave={() => onHover && onHover(null)}
          >
            <span className="onto-dot" style={{ background: seg.color }} />
            {seg.text}
          </span>
        );
      })}
    </span>
  );
}

// Strip MODEL_JSON blocks and incomplete tags from display content
function stripModelJson(text) {
  let s = text.replace(/<MODEL_JSON>[\s\S]*?<\/MODEL_JSON>/g, '');
  const openIdx = s.indexOf('<MODEL_JSON');
  if (openIdx !== -1) s = s.slice(0, openIdx);
  return s.trim();
}

// Clean reasoning content: remove technical/internal content for user-friendly display
function cleanReasoningContent(text) {
  if (!text) return '';
  // Remove <MODEL_JSON>...</MODEL_JSON> blocks
  let cleaned = text.replace(/<MODEL_JSON>[\s\S]*?<\/MODEL_JSON>/g, '');
  // Remove any stray JSON-like code fences
  cleaned = cleaned.replace(/```json[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  // Remove JSON fragments (lines starting with { } [ ] or containing "key":)
  cleaned = cleaned.split('\n').filter(line => {
    const t = line.trim();
    if (!t) return true;
    // Remove pure JSON lines
    if (/^[{}[\]],?\s*$/.test(t)) return false;
    if (/^"[^"]+"\s*:\s*/.test(t)) return false;
    if (/^\s*"[^"]+"\s*,?\s*$/.test(t) && t.length > 5) return false;
    // Remove tool call / function call patterns
    if (/^(Calling|Invoking|Executing|Using)\s+(tool|function|API)/i.test(t)) return false;
    // Remove internal step markers like "Step 1:", "步骤1:" when followed by technical content
    if (/^(Step\s*\d+|步骤\s*\d+)\s*[:：]\s*(识别|匹配|生成|验证|构建)/i.test(t) && t.length < 40) return false;
    return true;
  }).join('\n');
  // Truncate overly long reasoning to max 1500 chars
  if (cleaned.length > 1500) {
    cleaned = cleaned.slice(0, 1500) + '\n…';
  }
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
        dangerouslySetInnerHTML={{ __html: isStreaming ? highlighted + '<span class="streaming-cursor"></span>' : highlighted }}
      />
    </details>
  );
}

// ── Structured Thinking Chain Panel ─────────────────────────────────────
const STRUCTURED_STEPS = [
  { id: 1, title: '识别业务语义' },
  { id: 2, title: '确认系数' },
  { id: 3, title: '确认决策变量' },
  { id: 4, title: '确认目标函数' },
  { id: 5, title: '确认约束条件' },
  { id: 6, title: '确认取值范围' },
  { id: 7, title: '完善模型' },
  { id: 8, title: '生成建模草案' },
  { id: 9, title: '生成OR-DSL' },
];

// 单个步骤项 —— memo 确保仅当该步骤数据变化时才重新渲染，避免其他步骤更新时的级联重绘
const StepItem = memo(function StepItem({ stepId, title, step, currentStep, isStreaming, lookup }) {
  const status = step?.status || (stepId < currentStep ? 'success' : 'pending');
  const isCurrent = stepId === currentStep;
  const isDone = status === 'success';
  const isWarning = status === 'warning';

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isDone ? 'var(--success)' : isWarning ? 'var(--warning)' : isCurrent ? 'var(--primary)' : 'var(--surface-3)',
          color: isDone || isWarning || isCurrent ? '#fff' : 'var(--fg-3)',
          fontSize: 10, fontWeight: 700, zIndex: 1,
          border: `2px solid ${isDone ? 'var(--success)' : isWarning ? 'var(--warning)' : isCurrent ? 'var(--primary)' : 'var(--border)'}`,
        }} className={isCurrent && isStreaming ? 'step-circle-active' : ''}>
          {isDone ? <CheckCircle2 size={12} /> : isWarning ? '!' : stepId}
        </div>
        {stepId < 9 && (
          <div style={{
            position: 'absolute',
            left: '50%', transform: 'translateX(-50%)',
            top: 22, bottom: -8,
            width: 2,
            background: stepId < currentStep ? 'var(--success)' : 'var(--border)',
          }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: isCurrent ? 600 : 500,
          color: isCurrent ? 'var(--primary)' : 'var(--fg)',
        }}>
          {title}
        </div>
        {step?.text && (
          <div className={step.status === 'running' ? 'step-text-streaming' : ''} style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2, lineHeight: 1.5 }}>
            <OntologyHighlightedText text={step.text} lookup={lookup} onHover={() => {}} />
            {step.status === 'running' && isStreaming && <span className="streaming-cursor" />}
          </div>
        )}
        {step?.payload?.missingElements && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {step.payload.missingElements.map((e, i) => (
              <span key={i} style={{
                fontSize: 10, padding: '2px 6px', borderRadius: 4,
                background: 'var(--warning-bg, #fff7ed)', color: 'var(--warning)',
                border: '1px solid var(--warning)',
              }}>{e}</span>
            ))}
          </div>
        )}
        {step?.payload?.matchedVariables && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {step.payload.matchedVariables.slice(0, 6).map((v, i) => (
              <span key={i} style={{
                fontSize: 10, padding: '2px 6px', borderRadius: 4,
                background: 'var(--surface-2)', color: 'var(--fg-2)',
                border: '1px solid var(--border)',
              }}>{v.name || v.symbol}</span>
            ))}
          </div>
        )}
        {step?.payload?.matchedConstraints && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {step.payload.matchedConstraints.slice(0, 6).map((c, i) => (
              <span key={i} style={{
                fontSize: 10, padding: '2px 6px', borderRadius: 4,
                background: 'var(--surface-2)', color: 'var(--fg-2)',
                border: '1px solid var(--border)',
              }}>{c.name}</span>
            ))}
          </div>
        )}
        {step?.payload?.variables && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {step.payload.variables.slice(0, 6).map((v, i) => (
              <span key={i} style={{
                fontSize: 10, padding: '2px 6px', borderRadius: 4,
                background: 'var(--surface-2)', color: 'var(--fg-2)',
                border: '1px solid var(--border)',
              }}>{v.name || v.symbol}</span>
            ))}
          </div>
        )}
        {step?.payload?.constraints && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {step.payload.constraints.slice(0, 6).map((c, i) => (
              <span key={i} style={{
                fontSize: 10, padding: '2px 6px', borderRadius: 4,
                background: 'var(--surface-2)', color: 'var(--fg-2)',
                border: '1px solid var(--border)',
              }}>{c.name}</span>
            ))}
          </div>
        )}
        {step?.payload?.coefficients && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {step.payload.coefficients.slice(0, 6).map((c, i) => (
              <span key={i} style={{
                fontSize: 10, padding: '2px 6px', borderRadius: 4,
                background: 'var(--surface-2)', color: 'var(--fg-2)',
                border: '1px solid var(--border)',
              }}>{c.name}{c.value !== null && c.value !== undefined ? `=${c.value}` : ''}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

const StructuredThinkingChain = memo(function StructuredThinkingChain({ steps, currentStep, isStreaming, lookup }) {
  if (!steps || steps.length === 0) return null;

  const feasibilityStep = steps.find(s => s.step === 0);
  // 预构建 stepId → step 数据映射，避免在渲染时重复 find
  const stepMap = useMemo(() => {
    const m = new Map();
    steps.forEach(s => m.set(s.step, s));
    return m;
  }, [steps]);

  return (
    <div className="agent-thinking-panel" style={{ marginBottom: 14, padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Brain size={13} style={{ color: 'var(--primary)', opacity: 0.7 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)' }}>Agent 建模步骤</span>
        {isStreaming && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 11, color: 'var(--primary)', fontWeight: 400,
          }}>
            <span className="agent-thinking-dots-mini"><span /><span /><span /></span>
            执行中…
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 4 }}>
        {feasibilityStep && (
          <StepItem
            stepId={0}
            title="建模可行性评估"
            step={feasibilityStep}
            currentStep={currentStep}
            isStreaming={isStreaming}
            lookup={lookup}
          />
        )}
        {STRUCTURED_STEPS.map(stepDef => (
          <StepItem
            key={stepDef.id}
            stepId={stepDef.id}
            title={stepDef.title}
            step={stepMap.get(stepDef.id)}
            currentStep={currentStep}
            isStreaming={isStreaming}
            lookup={lookup}
          />
        ))}
      </div>
    </div>
  );
});

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
  const [highlightVariableId, setHighlightVariableId] = useState(null);
  const [showMappingModal, setShowMappingModal] = useState(false);

  // 结构化建模步骤状态
  const [structuredSteps, setStructuredSteps] = useState([]);
  const [structuredCurrentStep, setStructuredCurrentStep] = useState(0);
  const [structuredStreaming, setStructuredStreaming] = useState(false);
  const [useStructuredMode, setUseStructuredMode] = useState(true);
  const [assessmentContext, setAssessmentContext] = useState({ history: [] });
  const [pendingClarification, setPendingClarification] = useState(null);

  // 结构化步骤批量更新（ref + requestAnimationFrame，减少 SSE 事件导致的重渲染）
  const structuredStepsRef = useRef([]);
  const stepsBufferRef = useRef(null);
  const stepsRafRef = useRef(null);

  useEffect(() => {
    structuredStepsRef.current = structuredSteps;
  }, [structuredSteps]);

  const flushStructuredSteps = useCallback(() => {
    stepsRafRef.current = null;
    if (stepsBufferRef.current !== null) {
      structuredStepsRef.current = stepsBufferRef.current;
      setStructuredSteps(stepsBufferRef.current);
      stepsBufferRef.current = null;
    }
  }, []);

  const setStructuredStepsBatched = useCallback((updater) => {
    const base = stepsBufferRef.current !== null ? stepsBufferRef.current : structuredStepsRef.current;
    const next = typeof updater === 'function' ? updater(base) : updater;
    stepsBufferRef.current = next;
    if (stepsRafRef.current === null) {
      stepsRafRef.current = requestAnimationFrame(flushStructuredSteps);
    }
  }, [flushStructuredSteps]);

  const resetStructuredSteps = useCallback(() => {
    if (stepsRafRef.current !== null) {
      cancelAnimationFrame(stepsRafRef.current);
      stepsRafRef.current = null;
    }
    structuredStepsRef.current = [];
    stepsBufferRef.current = null;
    setStructuredSteps([]);
  }, []);

  useEffect(() => {
    return () => {
      if (stepsRafRef.current !== null) {
        cancelAnimationFrame(stepsRafRef.current);
        stepsRafRef.current = null;
      }
    };
  }, []);

  // 用于支持“新建会话后台任务继续”的 AbortController
  const activeControllerRef = useRef(null);
  const backgroundTaskRef = useRef(null);
  // 流式 token 节流的 rAF 引用（避免每个 token 都触发 setMessages 重建数组）
  const streamRafRef = useRef(null);
  const currentSessionRef = useRef(currentSession);

  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

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

  const handleSend = async (overrideMessage) => {
    const messageText = (overrideMessage || inputValue).trim();
    if (!messageText || loading) return;

    let session = currentSession;
    if (!session) {
      session = createNewSession();
      setCurrentSession(session);
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    appendMessage(userMessage);
    if (!overrideMessage) setInputValue('');
    setLoading(true);
    setApiError(null);

    if (session && !session.title && messages.length <= 1) {
      const newTitle = generateSessionTitle(messageText);
      updateConversationTitle(session.id, newTitle);
      setCurrentSession(prev => prev ? { ...prev, title: newTitle } : prev);
    }

    let agentMsgId = null;
    try {
      // 结构化建模模式：可行性评估 → 9步建模流程
      if (useStructuredMode && stage !== AGENT_STAGES.PROPOSING && stage !== AGENT_STAGES.REFINING) {
        // 判断是新的建模请求还是补充信息
        const isClarification = pendingClarification !== null;
        const currentContext = isClarification ? assessmentContext : { history: [] };

        agentMsgId = Date.now() + 1;
        appendMessage({
          id: agentMsgId,
          type: 'agent',
          content: isClarification
            ? '收到补充信息，正在重新评估建模可行性...'
            : '正在按本体建模流程为您构建模型方案...',
          reasoning_content: '',
          stage: AGENT_STAGES.PROPOSING,
          timestamp: new Date().toISOString(),
          streaming: false,
          structuredMode: true,
        });

        resetStructuredSteps();
        setStructuredCurrentStep(0);
        setStructuredStreaming(true);

        let finalDraft = null;
        let clarification = null;
        let feasibilityComplete = false;
        const requestSessionId = currentSessionRef.current?.id;

        activeControllerRef.current = new AbortController();
        const controller = activeControllerRef.current;

        await api.qwen.chatStructuredStream(
          messageText,
          (event, payload) => {
            // 如果用户已切换会话，当前任务是后台任务，只保存结果到原会话，不更新当前 UI
            const isBackgroundTask = currentSessionRef.current?.id !== requestSessionId;

            if (event === 'feasibility_start') {
              // 可行性评估开始
            } else if (event === 'feasibility_assessing') {
              if (isBackgroundTask) return;
              setStructuredStepsBatched(prev => [
                ...prev,
                { step: 0, text: payload.text, status: 'running', payload: {} },
              ]);
            } else if (event === 'feasibility_result') {
              feasibilityComplete = payload.complete;
              if (!payload.complete) {
                if (isBackgroundTask) return;
                setStructuredStepsBatched(prev => {
                  const next = prev.filter(s => s.step !== 0);
                  return [...next, {
                    step: 0,
                    text: `建模要素不完整，缺少：${(payload.missing_elements || []).join('、') || '—'}`,
                    status: 'warning',
                    payload: { missingElements: payload.missing_elements, elements: payload.elements },
                  }];
                });
              } else {
                if (isBackgroundTask) return;
                setStructuredStepsBatched(prev => {
                  const next = prev.filter(s => s.step !== 0);
                  return [...next, { step: 0, text: '建模可行性评估通过，开始执行建模步骤。', status: 'success', payload: {} }];
                });
              }
            } else if (event === 'clarification_needed') {
              clarification = {
                questions: payload.questions || [],
                missingElements: payload.missing_elements || [],
                suggestion: payload.suggestion || '',
                issues: payload.issues || [],
              };
            } else if (event === 'step_start') {
              if (isBackgroundTask) return;
              setStructuredCurrentStep(payload.step);
            } else if (event === 'step_content') {
              if (isBackgroundTask) return;
              setStructuredStepsBatched(prev => {
                const next = prev.filter(s => s.step !== payload.step);
                return [...next, { step: payload.step, text: payload.text, status: 'running', payload: payload.payload || {} }];
              });
            } else if (event === 'step_end') {
              if (isBackgroundTask) return;
              setStructuredStepsBatched(prev => {
                const next = prev.filter(s => s.step !== payload.step);
                const existing = prev.find(s => s.step === payload.step);
                return [...next, { ...(existing || { step: payload.step, text: '' }), status: payload.status }];
              });
            } else if (event === 'model_draft') {
              finalDraft = payload.draft;

              // 后台任务完成时，将结果追加到原会话
              if (isBackgroundTask && requestSessionId && payload.draft) {
                const summary = payload.summary || payload.draft?.summary || '模型草案已生成';
                appendToSession(requestSessionId, [
                  {
                    id: Date.now(),
                    type: 'agent',
                    content: `${summary}（后台任务完成）`,
                    proposal: payload.draft,
                    stage: AGENT_STAGES.PROPOSING,
                    timestamp: new Date().toISOString(),
                  },
                ]);
                backgroundTaskRef.current = null;
              }
            }
          },
          false,
          currentContext,
          controller
        );

        setStructuredStreaming(false);
        activeControllerRef.current = null;

        // 更新评估上下文历史
        const newHistoryEntry = { role: 'user', content: messageText };
        const assistantEntry = clarification
          ? { role: 'assistant', content: `需要补充信息：${(clarification.questions || []).join('；')}` }
          : finalDraft
            ? { role: 'assistant', content: '建模可行性评估通过，已生成模型草案。' }
            : { role: 'assistant', content: '建模流程执行完毕。' };

        setAssessmentContext(prev => ({
          history: [...(prev?.history || []), newHistoryEntry, assistantEntry].slice(-10),
        }));

        if (clarification) {
          // 需要用户补充信息，使用分步引导向导
          setPendingClarification(clarification);
          setStage(AGENT_STAGES.CLARIFYING);
          setMessages(prev => prev.map(m =>
            m.id === agentMsgId ? {
              ...m,
              content: '建模要素尚不完整，请按向导补充信息。',
              stage: AGENT_STAGES.CLARIFYING,
              structuredMode: true,
              wizard: true,
              clarification: clarification,
            } : m
          ));
          setLoading(false);
          return;
        }

        // 清除待补充状态
        setPendingClarification(null);

        if (finalDraft) {
          setCurrentProposal(finalDraft);
          addProposalToHistory(finalDraft);
          setStage(AGENT_STAGES.PROPOSING);
          const summary = finalDraft.summary || `已生成${finalDraft.problemType || 'LP'}模型，共 ${finalDraft.variables?.length || 0} 个变量、${finalDraft.constraints?.length || 0} 个约束。`;
          setMessages(prev => prev.map(m =>
            m.id === agentMsgId ? {
              ...m,
              content: `${summary}\n\n识别到业务对象：${(finalDraft._entities?.objects || []).join('、') || '—'}。请在右侧面板确认或调整。`,
              proposal: finalDraft,
              stage: AGENT_STAGES.PROPOSING,
            } : m
          ));
        } else {
          setMessages(prev => prev.filter(m => m.id !== agentMsgId));
          // 结构化失败，降级到普通对话模式
          setUseStructuredMode(false);
          // 继续执行下方的普通对话逻辑
        }

        if (finalDraft) {
          setLoading(false);
          return;
        }
      }

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
        { type: 'user', content: messageText + (userContext.userModifications ? `\n\n[用户已手动调整模型，修改点：${userContext.userModifications.join('；')}]` : '') },
      ];

      if (!agentMsgId) {
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
      }

      let fullContent = '';
      let fullReasoning = '';
      let streamDirty = false;
      // Helper: strip MODEL_JSON and incomplete tags from display content
      const stripMJ = stripModelJson;

      // rAF 节流：每个动画帧最多触发一次 setMessages，避免每个 token 都重建整个消息数组
      const flushStreamFrame = () => {
        streamRafRef.current = null;
        if (!streamDirty) return;
        streamDirty = false;
        const displayContent = stripMJ(fullContent);
        setMessages(prev => prev.map(m =>
          m.id === agentMsgId ? { ...m, content: displayContent || '正在构建模型…', reasoning_content: fullReasoning } : m
        ));
      };

      await api.qwen.chatStream(chatMessages, (field, text) => {
        if (field === 'reasoning_content') {
          fullReasoning += text;
        } else {
          fullContent += text;
        }
        streamDirty = true;
        if (streamRafRef.current === null) {
          streamRafRef.current = requestAnimationFrame(flushStreamFrame);
        }
      });

      // 流结束后确保最后一帧已刷新
      if (streamRafRef.current !== null) {
        cancelAnimationFrame(streamRafRef.current);
        streamRafRef.current = null;
      }
      {
        const displayContent = stripMJ(fullContent);
        setMessages(prev => prev.map(m =>
          m.id === agentMsgId ? { ...m, content: displayContent || '正在构建模型…', reasoning_content: fullReasoning } : m
        ));
      }

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

  const handleConfirm = async () => {
    const proposal = editableProposal || proposalHistory[selectedProposalIndex] || currentProposal;
    if (!proposal) return;

    appendMessage({
      id: Date.now(),
      type: 'user',
      content: userModified ? '确认此模型（含手动调整）' : '确认此模型',
      timestamp: new Date().toISOString(),
    });

    setStage(AGENT_STAGES.CONFIRMING);

    // Step 9: 流式生成 OR-DSL
    setStructuredCurrentStep(9);
    setStructuredStreaming(true);
    setStructuredStepsBatched(prev => [
      ...prev.filter(s => s.step !== 9),
      { step: 9, text: '正在将确认的模型草案转换为 OR-DSL...', status: 'running' },
    ]);

    let orDsl = null;
    let dslError = null;

    try {
      // 构建符合后端期望的 draft 结构
      const draft = {
        name: proposal.name || 'AI生成模型',
        description: proposal.description || '',
        problemType: proposal.problemType || 'LP',
        variables: (proposal.variables || []).map(v => ({
          id: v.id || `v-${Date.now()}-${Math.random()}`,
          name: v.name,
          nameEn: v.nameEn || '',
          nature: v.nature || 'custom',
          type: v.type || 'continuous',
          lowerBound: v.lowerBound ?? 0,
          upperBound: v.upperBound ?? null,
          ontologyRef: v.ontologyRef,
          ontologyPath: v.ontologyPath || getOntologyPath(v),
          dimension: v.dimension || '',
          domain: v.domain || v.type || 'continuous',
          businessMeaning: v.businessMeaning || '',
          unit: v.unit || '',
        })),
        objective: proposal.objective || { sense: 'minimize', coefficients: [] },
        constraints: (proposal.constraints || []).map((c, idx) => ({
          id: c.id || `c-${Date.now()}-${idx}`,
          name: c.name,
          description: c.description || '',
          sense: c.sense || '<=',
          rhs: c.rhs ?? 0,
          coefficients: c.coefficients || {},
        })),
      };

      await api.qwen.confirmGenerateDslStream(draft, userModified, (event, payload) => {
        if (event === 'step_start') {
          setStructuredCurrentStep(payload.step);
        } else if (event === 'step_content') {
          setStructuredStepsBatched(prev => {
            const next = prev.filter(s => s.step !== payload.step);
            return [...next, { step: payload.step, text: payload.text, status: 'running', payload: payload.payload || {} }];
          });
        } else if (event === 'step_end') {
          setStructuredStepsBatched(prev => {
            const next = prev.filter(s => s.step !== payload.step);
            const existing = prev.find(s => s.step === payload.step);
            return [...next, { ...(existing || { step: payload.step, text: '' }), status: payload.status }];
          });
        } else if (event === 'or_dsl') {
          orDsl = payload.orDsl || null;
        } else if (event === 'error') {
          dslError = payload.message || 'OR-DSL 生成失败';
        }
      });
    } catch (err) {
      console.error('OR-DSL 生成失败:', err);
      dslError = err.message || 'OR-DSL 生成失败';
    } finally {
      setStructuredStreaming(false);
    }

    if (dslError) {
      showToast(`OR-DSL 生成失败：${dslError}，但仍会回填基础模型`, 'warning', 4000);
    }

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
              nameEn: v.nameEn || '',
              nature: v.nature || 'custom',
              source: 'custom',
              type: v.type || 'continuous',
              lowerBound: v.lowerBound,
              upperBound: v.upperBound,
              ontologyRef: v.ontologyRef,
              ontologyPath: v.ontologyPath || getOntologyPath(v),
              dimension: v.dimension || '',
              domain: v.domain || v.type || 'continuous',
              businessMeaning: v.businessMeaning || '',
              unit: v.unit || '',
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
              coefficients: c.coefficients || {},
              sense: c.sense || '<=',
              rhs: c.rhs ?? 0,
            })),
            orDsl,
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
        const displayContent = stripModelJson(fullContent);
        setMessages(prev => prev.map(m =>
          m.id === regenMsgId ? { ...m, content: displayContent || '正在构建模型…', reasoning_content: fullReasoning } : m
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
    // 如果当前有正在执行的结构化建模任务，让它在后台继续运行
    if (activeControllerRef.current && structuredStreaming) {
      backgroundTaskRef.current = {
        controller: activeControllerRef.current,
        sessionId: currentSession?.id,
        startedAt: Date.now(),
      };
      activeControllerRef.current = null;
      showToast('已创建新会话，原任务将在后台继续执行', 'info', 3000);
    }

    const newSession = createNewSession();
    setCurrentSession(newSession);
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
    setPendingClarification(null);
    resetStructuredSteps();
    setStructuredCurrentStep(0);
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

            // 结构化建模模式：展示步骤化思维链
            const isStructured = msg.structuredMode === true;
            const structuredSection = isStructured ? (
              <StructuredThinkingChain
                steps={structuredSteps}
                currentStep={structuredCurrentStep}
                isStreaming={structuredStreaming}
                lookup={ontologyLookup}
              />
            ) : null;

            const reasoningSection = (!isStructured && reasoningText) ? (
              <ThinkingChainPanel
                thinking={reasoningText}
                highlightMap={highlightMap}
                isStreaming={isStreaming}
              />
            ) : null;
            // Show a "thinking started" placeholder when streaming but no reasoning yet
            const thinkingPlaceholder = (!isStructured && isStreaming && !reasoningText) ? (
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
                {/* Structured thinking chain */}
                {structuredSection}
                {/* Thinking chain — separate panel above the output bubble */}
                {reasoningSection}
                {thinkingPlaceholder}
                {/* Main output bubble */}
                <div className="agent-bubble" style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap', color: 'var(--fg)' }}>
                    {isStructured ? (
                      msg.wizard && msg.clarification ? (
                        <GuidedFeasibilityWizard
                          issues={msg.clarification.issues || []}
                          suggestion={msg.clarification.suggestion || ''}
                          loading={loading}
                          onSubmit={(fullText) => {
                            setPendingClarification(null);
                            handleSend(fullText);
                          }}
                          onCancel={() => {
                            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, wizard: false } : m));
                            setPendingClarification(null);
                          }}
                        />
                      ) : (
                        <>
                          <VariableTokenGroup
                            text={msg.content}
                            variableMap={buildVariableMap(msg.proposal?.variables || [])}
                            ontologyName="本体模型"
                            onVariableClick={(variable) => {
                              setHighlightVariableId(variable?.id || variable?.name);
                              setShowMappingModal(true);
                            }}
                          />
                          {isStreaming && <span className="streaming-cursor" />}
                        </>
                      )
                    ) : (
                      <>{msg.content}{isStreaming && <span className="streaming-cursor" />}</>
                    )}
                  </div>
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
      <div className="proposal-panel" style={{ flex: '0 0 40%', width: 'auto' }}>
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
          <div className="proposal-section-card" style={{ padding: '8px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="proposal-section-label" style={{ marginBottom: 0 }}>
                <span style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: 'var(--primary)', display: 'inline-block', flexShrink: 0,
                }} />
                优化类型
              </div>
              <select
                value={proposal.problemType || 'LP'}
                onChange={e => {
                  setEditableProposal(prev => prev ? { ...prev, problemType: e.target.value } : prev);
                  markModified('problemType');
                }}
                style={{
                  fontSize: 12, fontWeight: 600, padding: '4px 12px',
                  borderRadius: 20, border: '1px solid var(--border)',
                  background: proposal.problemType === 'LP' ? '#dbeafe' : proposal.problemType === 'IP' ? '#ffedd5' : '#fee2e2',
                  color: proposal.problemType === 'LP' ? '#1d4ed8' : proposal.problemType === 'IP' ? '#c2410c' : '#dc2626',
                  cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
                }}
              >
                <option value="LP">LP(线性规划)</option>
                <option value="IP">IP(整数规划)</option>
                <option value="MIP">MIP(混合整数规划)</option>
              </select>
            </div>
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
            {/* Coefficients - horizontal flow (filter out zero-coefficient terms) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
              {(obj.coefficients || [])
                .map((coeff, origIdx) => ({ coeff, origIdx }))
                .filter(({ coeff }) => {
                  const c = coeff.coefficient;
                  // Keep: variable references ($paramName), non-zero numbers, undefined/null (default to 1)
                  if (c === 0) return false;
                  if (typeof c === 'string' && c.startsWith('$')) return true;
                  return true;
                })
                .map(({ coeff, origIdx }, displayIdx) => {
                const matchedVar = (proposal.variables || []).find(v => v.name === coeff.variable);
                const coeffVal = String(coeff.coefficient ?? 1);
                const isVarRef = coeffVal.startsWith('$');
                return (
                  <div key={origIdx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {displayIdx > 0 && (
                      <span style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 600, width: 14, textAlign: 'center' }}>
                        {coeffVal.startsWith('-') ? '−' : '+'}
                      </span>
                    )}
                    <input
                      type="text"
                      value={coeff.coefficient ?? 1}
                      onChange={e => updateObjectCoeff(origIdx, 'coefficient', normalizeCoefficient(e.target.value))}
                      placeholder="系数或$变量"
                      className="proposal-field-input"
                      style={{
                        width: 72, fontSize: 12,
                        ...(isVarRef ? { color: 'var(--accent)', fontStyle: 'italic', fontWeight: 600 } : {}),
                      }}
                      title="支持输入数字或 $变量名 引用其他变量"
                    />
                    {isVarRef && <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>$</span>}
                    <span style={{ fontSize: 13, color: 'var(--fg-3)', fontWeight: 500, fontFamily: 'serif' }}>·</span>
                    {matchedVar ? (
                      <VariableToken
                        variable={matchedVar}
                        className="proposal-var-token"
                        onClick={() => {
                          setHighlightVariableId(matchedVar.id || matchedVar.name);
                          setShowMappingModal(true);
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--fg)', fontWeight: 500 }}>{coeff.variable || '未命名'}</span>
                    )}
                    <button
                      onClick={() => removeObjectCoeff(origIdx)}
                      style={{
                        ...btnBase, padding: '2px 5px', background: 'transparent',
                        border: 'none', color: 'var(--fg-3)', fontSize: 13, lineHeight: 1,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-3)'; }}
                      title="删除此项"
                    >✕</button>
                  </div>
                );
              })}
              <button
                onClick={addObjectiveCoeff}
                className="proposal-small-btn"
              >
                + 添加项
              </button>
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
              {cons.map((c, idx) => {
                const activeVars = (proposal.variables || []).filter(v => {
                  const cv = c.coefficients?.[v.name];
                  return cv !== undefined && cv !== 0 && cv !== null;
                });
                return (
                  <div key={c.id || idx} className="proposal-var-row">
                    {/* Header: name + delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <input
                        value={c.name || ''}
                        onChange={e => updateEditableConstraint(idx, 'name', e.target.value)}
                        placeholder="约束名"
                        className="proposal-field-input"
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={() => removeConstraint(idx)}
                        style={{
                          ...btnBase, padding: '2px 5px', background: 'transparent',
                          border: 'none', color: 'var(--fg-3)', fontSize: 13, lineHeight: 1,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-3)'; }}
                        title="删除约束"
                      >✕</button>
                    </div>
                    {/* Expression: coefficients ± sense rhs */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 6 }}>
                      {activeVars.length === 0 && <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>暂无系数</span>}
                      {(proposal.variables || []).map((v, vIdx) => {
                        const coeff = c.coefficients?.[v.name] ?? 0;
                        const coeffStr = String(coeff);
                        if (!coeff || coeff === 0) return null;
                        const isVarRef = coeffStr.startsWith('$');
                        const isFirst = activeVars[0]?.name === v.name;
                        const isNeg = coeffStr.startsWith('-');
                        return (
                          <div key={v.id || vIdx} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            {!isFirst && (
                              <span style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 600, margin: '0 2px' }}>
                                {isNeg ? '−' : '+'}
                              </span>
                            )}
                            {isFirst && isNeg && (
                              <span style={{ fontSize: 13, color: 'var(--fg-2)', fontWeight: 600, marginRight: 2 }}>−</span>
                            )}
                            <input
                              type="text"
                              value={coeff}
                              onChange={e => {
                                const nextCoeffs = { ...(c.coefficients || {}) };
                                const val = normalizeCoefficient(e.target.value);
                                if (val === null || val === 0) {
                                  delete nextCoeffs[v.name];
                                } else {
                                  nextCoeffs[v.name] = val;
                                }
                                updateEditableConstraint(idx, 'coefficients', nextCoeffs);
                              }}
                              placeholder="系数"
                              className="proposal-field-input"
                              style={{
                                width: 64, fontSize: 11,
                                ...(isVarRef ? { color: 'var(--accent)', fontStyle: 'italic', fontWeight: 600 } : {}),
                              }}
                              title="支持输入数字或 $变量名 引用其他变量"
                            />
                            {isVarRef && <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>$</span>}
                            <span style={{ fontSize: 13, color: 'var(--fg-3)', fontWeight: 500, fontFamily: 'serif' }}>·</span>
                            <VariableToken
                              variable={v}
                              className="proposal-var-token-sm"
                              onClick={() => {
                                setHighlightVariableId(v.id || v.name);
                                setShowMappingModal(true);
                              }}
                            />
                          </div>
                        );
                      })}
                      {/* sense + rhs */}
                      <span style={{ fontSize: 15, color: 'var(--fg-2)', fontWeight: 700, margin: '0 6px', fontFamily: 'serif' }}>
                        {c.sense === '<=' ? '≤' : c.sense === '>=' ? '≥' : '='}
                      </span>
                      <input
                        type="number"
                        value={c.rhs ?? 0}
                        onChange={e => updateEditableConstraint(idx, 'rhs', parseFloat(e.target.value) || 0)}
                        placeholder="右值"
                        className="proposal-field-input"
                        style={{ width: 68, fontSize: 12 }}
                      />
                    </div>
                    <input
                      value={c.description || ''}
                      onChange={e => updateEditableConstraint(idx, 'description', e.target.value)}
                      placeholder="约束描述（可选）"
                      className="proposal-field-input"
                      style={{ fontSize: 11, fontFamily: 'inherit', marginTop: 4 }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Variables / Bounds */}
          <div className="proposal-section-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="proposal-section-label" style={{ marginBottom: 0 }}>
                <span style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: 'var(--accent)', display: 'inline-block', flexShrink: 0,
                }} />
                取值范围 ({vars.length})
              </div>
              <button onClick={addVariable} className="proposal-small-btn">+ 添加</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {vars.map((v, idx) => (
                <div key={v.id || idx} className="proposal-var-row" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <VariableToken
                    variable={v}
                    className="proposal-var-token"
                    onClick={() => {
                      setHighlightVariableId(v.id || v.name);
                      setShowMappingModal(true);
                    }}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <label style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 500 }}>下界</label>
                    <input
                      type="number"
                      value={v.lowerBound ?? 0}
                      onChange={e => updateEditableVar(idx, 'lowerBound', parseFloat(e.target.value) || 0)}
                      className="proposal-field-input"
                      style={{ width: 72, fontSize: 11 }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <label style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 500 }}>上界</label>
                    <input
                      type="number"
                      value={v.upperBound ?? ''}
                      onChange={e => updateEditableVar(idx, 'upperBound', e.target.value === '' ? null : parseFloat(e.target.value))}
                      placeholder="∞"
                      className="proposal-field-input"
                      style={{ width: 72, fontSize: 11 }}
                    />
                  </div>
                  <button
                    onClick={() => removeVariable(idx)}
                    style={{
                      ...btnBase, padding: '2px 5px', background: 'transparent',
                      border: 'none', color: 'var(--fg-3)', fontSize: 13, lineHeight: 1,
                      marginLeft: 'auto',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-3)'; }}
                    title="删除变量"
                  >✕</button>
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

        {/*  Chat Column ── */}
        <div style={{ flex: (activeProposal || proposalHistory.length > 0) ? '0 0 50%' : 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Messages */}
          <div className="agent-messages-area">
            {messages.map((msg, idx) => renderMessage(msg, idx))}
            {loading && !messages.some(m => m.streaming) && !structuredStreaming && renderLoading()}
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

      {/* ── Ontology Mapping Modal ── */}
      {showMappingModal && (
        <OntologyModelMappingModal
          onClose={() => setShowMappingModal(false)}
          highlightVariableId={highlightVariableId}
        />
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
