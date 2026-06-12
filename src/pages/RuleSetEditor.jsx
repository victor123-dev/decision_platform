import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  GripVertical,
  Save,
  Plus,
  X,
  ChevronRight,
  History,
  Settings,
  ListChecks,
  Trash2,
} from 'lucide-react';
import { api } from '@/api/apiClient';

const statusMap = {
  active: { className: 'badge-success', label: '活跃' },
  editing: { className: 'badge-warning', label: '编辑中' },
  draft: { className: 'badge-neutral', label: '草稿' },
};

const tabs = [
  { key: 'rules', label: '规则列表', icon: ListChecks },
  { key: 'properties', label: '属性设置', icon: Settings },
  { key: 'versions', label: '版本历史', icon: History },
];

/* ---------- inline style helpers ---------- */
const conditionBlock = {
  background: 'rgba(59,130,246,0.08)',
  borderLeft: '3px solid #3b82f6',
  borderRadius: 'var(--seed-radius-sm)',
  padding: '8px 12px',
  marginBottom: 6,
};
const thenBlock = {
  background: 'rgba(34,197,94,0.08)',
  borderLeft: '3px solid #22c55e',
  borderRadius: 'var(--seed-radius-sm)',
  padding: '8px 12px',
  marginBottom: 6,
};
const elseBlock = {
  background: 'rgba(239,68,68,0.08)',
  borderLeft: '3px solid #ef4444',
  borderRadius: 'var(--seed-radius-sm)',
  padding: '8px 12px',
  marginBottom: 6,
};
const blockLabel = (color) => ({
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.06em',
  color,
  marginBottom: 2,
  textTransform: 'uppercase',
});
const codeText = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 12,
  color: 'var(--fg-2)',
  wordBreak: 'break-all',
};

export default function RuleSetEditor(qoderProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [ruleSet, setRuleSet] = useState(null);
  const [loading, setLoading] = useState(id && id !== 'new');

  useEffect(() => {
    if (id && id !== 'new') {
      api.get(`/rulesets/${id}`).then(data => { setRuleSet(data); setLoading(false); }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  const [rules, setRules] = useState([]);
  const [ruleSetName, setRuleSetName] = useState('');
  const [activeTab, setActiveTab] = useState('rules');
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState({
    condition: '',
    thenAction: '',
    elseAction: '',
  });

  // Sync state when ruleSet loads
  useEffect(() => {
    if (ruleSet) {
      setRules(ruleSet.rules ? ruleSet.rules.map((r) => ({ ...r })) : []);
      setRuleSetName(ruleSet.name || '');
      setSelectedRuleId(ruleSet.rules?.[0]?.id ?? null);
    }
  }, [ruleSet]);

  const handleSave = async () => {
    try {
      await api.put(`/rulesets/${id}`, { ...ruleSet, name: ruleSetName, rules });
      alert('保存成功');
    } catch (err) {
      alert('保存失败: ' + err.message);
    }
  };

  if (loading) {
    return <div className="page" style={{ textAlign: 'center', padding: 48, color: 'var(--fg-4)' }}>加载中...</div>;
  }

  /* derived */
  const selectedRule = rules.find((r) => r.id === selectedRuleId) ?? null;
  const st = statusMap[ruleSet?.status] ?? statusMap.draft;

  /* handlers */
  const toggleRule = (ruleId) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const updateSelectedRule = (field, value) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === selectedRuleId ? { ...r, [field]: value } : r
      )
    );
  };

  const handleAddRule = () => {
    if (!newRule.condition.trim()) return;
    const nextPriority = rules.length + 1;
    const added = {
      id: `r-new-${Date.now()}`,
      name: `新规则 #${nextPriority}`,
      condition: newRule.condition,
      thenAction: newRule.thenAction,
      elseAction: newRule.elseAction,
      enabled: true,
      priority: nextPriority,
    };
    setRules((prev) => [...prev, added]);
    setSelectedRuleId(added.id);
    setNewRule({ condition: '', thenAction: '', elseAction: '' });
    setShowAddForm(false);
  };

  /* ---- Not found guard ---- */
  if (!ruleSet) {
    return (
      <div className={["page", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
        <div className="empty-state" data-qoder-id="qel-empty-state-9d01dfaf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-state-9d01dfaf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;empty-state&quot;,&quot;loc&quot;:{&quot;line&quot;:128,&quot;column&quot;:9}}">
          <ListChecks size={40}  data-qoder-id="qel-listchecks-60289804" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-listchecks-60289804&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;listchecks&quot;,&quot;loc&quot;:{&quot;line&quot;:129,&quot;column&quot;:11}}"/>
          <p data-qoder-id="qel-p-b149c977" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-b149c977&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:130,&quot;column&quot;:11}}">未找到该规则集</p>
          <button
            className="btn btn-ghost"
            style={{ marginTop: 12 }}
            onClick={() => navigate('/rulesets')}
           data-qoder-id="qel-btn-59a66c06" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-59a66c06&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:131,&quot;column&quot;:11}}">
            <ArrowLeft size={14}  data-qoder-id="qel-arrowleft-fe9e82fd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-arrowleft-fe9e82fd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;arrowleft&quot;,&quot;loc&quot;:{&quot;line&quot;:136,&quot;column&quot;:13}}"/> 返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }} data-qoder-id="qel-page-07ca6d4e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-07ca6d4e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;page&quot;,&quot;loc&quot;:{&quot;line&quot;:144,&quot;column&quot;:5}}">
      {/* ===== Top Bar ===== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
        }}
       data-qoder-id="qel-div-3a0bb32f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-3a0bb32f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:146,&quot;column&quot;:7}}">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/rulesets')}
          data-tooltip="返回列表"
         data-qoder-id="qel-btn-65a67eea" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-65a67eea&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:157,&quot;column&quot;:9}}">
          <ArrowLeft size={16}  data-qoder-id="qel-arrowleft-96768fd8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-arrowleft-96768fd8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;arrowleft&quot;,&quot;loc&quot;:{&quot;line&quot;:162,&quot;column&quot;:11}}"/>
        </button>

        <input
          className="input"
          value={ruleSetName}
          onChange={(e) => setRuleSetName(e.target.value)}
          style={{
            flex: 1,
            maxWidth: 360,
            fontWeight: 600,
            fontSize: 15,
            background: 'transparent',
            border: '1px solid transparent',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.background = 'rgba(0,0,0,0.02)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'transparent';
            e.target.style.background = 'transparent';
          }}
         data-qoder-id="qel-input-ae54256b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-ae54256b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:165,&quot;column&quot;:9}}"/>

        <span className="badge badge-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }} data-qoder-id="qel-badge-b6753b09" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-b6753b09&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:187,&quot;column&quot;:9}}">
          {ruleSet.version}
        </span>
        <span className={`badge ${st.className}`} data-qoder-id="qel-span-beb470f9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-beb470f9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:190,&quot;column&quot;:9}}">{st.label}</span>

        <div style={{ marginLeft: 'auto' }} data-qoder-id="qel-div-657c1a00" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-657c1a00&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:192,&quot;column&quot;:9}}">
          <button className="btn btn-primary" onClick={handleSave} data-qoder-id="qel-btn-d4061825" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-d4061825&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:193,&quot;column&quot;:11}}">
            <Save size={14}  data-qoder-id="qel-save-a91980a0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-save-a91980a0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;save&quot;,&quot;loc&quot;:{&quot;line&quot;:194,&quot;column&quot;:13}}"/>
            保存
          </button>
        </div>
      </div>

      {/* ===== Tab Bar ===== */}
      <div style={{ padding: '0 20px', flexShrink: 0 }} data-qoder-id="qel-div-687c1eb9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-687c1eb9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:201,&quot;column&quot;:7}}">
        <div className="tabs" data-qoder-id="qel-tabs-24652ae1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tabs-24652ae1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;tabs&quot;,&quot;loc&quot;:{&quot;line&quot;:202,&quot;column&quot;:9}}">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                className={`tab ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
               data-qoder-id="qel-button-46f46d4f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-46f46d4f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:206,&quot;column&quot;:15}}">
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }} data-qoder-id="qel-span-4dbc0ddb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-4dbc0ddb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:211,&quot;column&quot;:17}}">
                  <Icon size={14}  data-qoder-id="qel-icon-a37aade2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-icon-a37aade2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;icon&quot;,&quot;loc&quot;:{&quot;line&quot;:212,&quot;column&quot;:19}}"/>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Main content ===== */}
      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }} data-qoder-id="qel-div-fd83c50d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fd83c50d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:223,&quot;column&quot;:9}}">
          {/* Rules list (left) */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }} data-qoder-id="qel-div-fc83c37a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fc83c37a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:225,&quot;column&quot;:11}}">
            {rules.map((rule, idx) => {
              const isSelected = rule.id === selectedRuleId;
              return (
                <div
                  key={rule.id}
                  className="card"
                  onClick={() => setSelectedRuleId(rule.id)}
                  style={{
                    marginBottom: 10,
                    cursor: 'pointer',
                    opacity: rule.enabled ? 1 : 0.5,
                    borderColor: isSelected
                      ? 'var(--primary)'
                      : 'var(--border)',
                    transition: 'border-color 0.15s ease, opacity 0.15s ease',
                  }}
                 data-qoder-id="qel-card-85a81bb0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-85a81bb0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:229,&quot;column&quot;:17}}">
                  {/* Rule header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 10,
                    }}
                   data-qoder-id="qel-div-f683ba08" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f683ba08&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:244,&quot;column&quot;:19}}">
                    <GripVertical
                      size={16}
                      style={{ color: 'var(--fg-4)', cursor: 'grab', flexShrink: 0 }}
                     data-qoder-id="qel-gripvertical-939a3545" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-gripvertical-939a3545&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;gripvertical&quot;,&quot;loc&quot;:{&quot;line&quot;:252,&quot;column&quot;:21}}"/>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--fg-4)',
                        fontFamily: "'JetBrains Mono', monospace",
                        minWidth: 24,
                      }}
                     data-qoder-id="qel-span-52bc15ba" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-52bc15ba&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:256,&quot;column&quot;:21}}">
                      #{idx + 1}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--fg)',
                        flex: 1,
                      }}
                     data-qoder-id="qel-span-45bc0143" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-45bc0143&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:267,&quot;column&quot;:21}}">
                      {rule.name}
                    </span>

                    {/* Priority indicator */}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--fg-4)',
                        background: 'var(--surface-3)',
                        padding: '2px 6px',
                        borderRadius: 'var(--seed-radius-xs)',
                      }}
                     data-qoder-id="qel-span-44bbffb0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-44bbffb0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:279,&quot;column&quot;:21}}">
                      P{rule.priority}
                    </span>

                    {/* Enable toggle */}
                    <button
                      className={`toggle ${rule.enabled ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRule(rule.id);
                      }}
                     data-qoder-id="qel-button-b9f99f86" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-b9f99f86&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:293,&quot;column&quot;:21}}"/>
                  </div>

                  {/* IF / THEN / ELSE blocks */}
                  <div style={{ paddingLeft: 24 }} data-qoder-id="qel-div-f6817b71" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f6817b71&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:303,&quot;column&quot;:19}}">
                    {/* IF */}
                    <div style={conditionBlock} data-qoder-id="qel-div-f38176b8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f38176b8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:305,&quot;column&quot;:21}}">
                      <div style={blockLabel('#3b82f6')} data-qoder-id="qel-div-f481784b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f481784b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:306,&quot;column&quot;:23}}">IF</div>
                      <div style={codeText} data-qoder-id="qel-div-f981802a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f981802a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:307,&quot;column&quot;:23}}">{rule.condition}</div>
                    </div>

                    {/* THEN */}
                    {rule.thenAction && (
                      <div style={thenBlock} data-qoder-id="qel-div-fa8181bd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fa8181bd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:312,&quot;column&quot;:23}}">
                        <div style={blockLabel('#22c55e')} data-qoder-id="qel-div-f7817d04" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f7817d04&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:313,&quot;column&quot;:25}}">THEN</div>
                        <div style={codeText} data-qoder-id="qel-div-f8817e97" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f8817e97&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:314,&quot;column&quot;:25}}">{rule.thenAction}</div>
                      </div>
                    )}

                    {/* ELSE */}
                    {rule.elseAction && (
                      <div style={elseBlock} data-qoder-id="qel-div-ed816d46" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ed816d46&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:320,&quot;column&quot;:23}}">
                        <div style={blockLabel('#ef4444')} data-qoder-id="qel-div-ee816ed9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ee816ed9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:321,&quot;column&quot;:25}}">ELSE</div>
                        <div style={codeText} data-qoder-id="qel-div-f774b111" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f774b111&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:322,&quot;column&quot;:25}}">{rule.elseAction}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add new rule */}
            <div className="divider"  data-qoder-id="qel-divider-52fe6920" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-divider-52fe6920&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;divider&quot;,&quot;loc&quot;:{&quot;line&quot;:331,&quot;column&quot;:13}}"/>
            {!showAddForm ? (
              <button
                className="btn btn-ghost"
                onClick={() => setShowAddForm(true)}
                style={{ width: '100%', justifyContent: 'center' }}
               data-qoder-id="qel-btn-5efea431" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-5efea431&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:333,&quot;column&quot;:15}}">
                <Plus size={14}  data-qoder-id="qel-plus-2c0b05f8" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-2c0b05f8&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:338,&quot;column&quot;:17}}"/>
                添加新规则
              </button>
            ) : (
              <div className="card" style={{ marginBottom: 10 }} data-qoder-id="qel-card-19a2f47e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-19a2f47e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:342,&quot;column&quot;:15}}">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                 data-qoder-id="qel-div-fa74b5ca" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fa74b5ca&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:343,&quot;column&quot;:17}}">
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }} data-qoder-id="qel-span-d3c15dfb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-d3c15dfb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:351,&quot;column&quot;:19}}">
                    新规则
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowAddForm(false)}
                   data-qoder-id="qel-btn-61fea8ea" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-61fea8ea&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:354,&quot;column&quot;:19}}">
                    <X size={14}  data-qoder-id="qel-x-65ff38bd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-x-65ff38bd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;x&quot;,&quot;loc&quot;:{&quot;line&quot;:358,&quot;column&quot;:21}}"/>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} data-qoder-id="qel-div-ee74a2e6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-ee74a2e6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:362,&quot;column&quot;:17}}">
                  <div data-qoder-id="qel-div-f1726908" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f1726908&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:363,&quot;column&quot;:19}}">
                    <div className="prop-label" data-qoder-id="qel-prop-label-347fe81c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-347fe81c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:364,&quot;column&quot;:21}}">条件 (IF)</div>
                    <input
                      className="input"
                      placeholder="例: ${amount} > 10000"
                      value={newRule.condition}
                      onChange={(e) =>
                        setNewRule((prev) => ({ ...prev, condition: e.target.value }))
                      }
                     data-qoder-id="qel-input-a75ea7c2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-a75ea7c2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:365,&quot;column&quot;:21}}"/>
                  </div>
                  <div data-qoder-id="qel-div-f4726dc1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f4726dc1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:374,&quot;column&quot;:19}}">
                    <div className="prop-label" data-qoder-id="qel-prop-label-317fe363" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-317fe363&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:375,&quot;column&quot;:21}}">执行动作 (THEN)</div>
                    <input
                      className="input"
                      placeholder="例: risk_level = 'high'"
                      value={newRule.thenAction}
                      onChange={(e) =>
                        setNewRule((prev) => ({ ...prev, thenAction: e.target.value }))
                      }
                     data-qoder-id="qel-input-a25e9fe3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-a25e9fe3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:376,&quot;column&quot;:21}}"/>
                  </div>
                  <div data-qoder-id="qel-div-f772727a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-f772727a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:385,&quot;column&quot;:19}}">
                    <div className="prop-label" data-qoder-id="qel-prop-label-327fe4f6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-327fe4f6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:386,&quot;column&quot;:21}}">否则 (ELSE)</div>
                    <input
                      className="input"
                      placeholder="可选"
                      value={newRule.elseAction}
                      onChange={(e) =>
                        setNewRule((prev) => ({ ...prev, elseAction: e.target.value }))
                      }
                     data-qoder-id="qel-input-ad5eb134" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-ad5eb134&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:387,&quot;column&quot;:21}}"/>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleAddRule}
                    style={{ alignSelf: 'flex-end' }}
                   data-qoder-id="qel-btn-5ffc672d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-5ffc672d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:396,&quot;column&quot;:19}}">
                    <Plus size={13}  data-qoder-id="qel-plus-9b1031e3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-9b1031e3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:401,&quot;column&quot;:21}}"/>
                    添加
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ===== Right side panel ===== */}
          <div
            style={{
              width: 280,
              minWidth: 280,
              borderLeft: '1px solid var(--border)',
              background: 'var(--surface)',
              overflowY: 'auto',
              flexShrink: 0,
            }}
           data-qoder-id="qel-div-6279d6b0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-6279d6b0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:410,&quot;column&quot;:11}}">
            {selectedRule ? (
              <>
                <div className="prop-section" data-qoder-id="qel-prop-section-06912131" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-06912131&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:422,&quot;column&quot;:17}}">
                  <div className="prop-section-title" data-qoder-id="qel-prop-section-title-5481715b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-5481715b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:423,&quot;column&quot;:19}}">规则属性</div>

                  <div className="prop-row" data-qoder-id="qel-prop-row-8b4140de" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-8b4140de&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:425,&quot;column&quot;:19}}">
                    <div className="prop-label" data-qoder-id="qel-prop-label-c07875bb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-c07875bb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:426,&quot;column&quot;:21}}">规则名称</div>
                    <input
                      className="input"
                      value={selectedRule.name}
                      onChange={(e) => updateSelectedRule('name', e.target.value)}
                     data-qoder-id="qel-input-b5657991" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-b5657991&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:427,&quot;column&quot;:21}}"/>
                  </div>

                  <div className="prop-row" data-qoder-id="qel-prop-row-8a413f4b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-8a413f4b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:434,&quot;column&quot;:19}}">
                    <div className="prop-label" data-qoder-id="qel-prop-label-bb786ddc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-bb786ddc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:435,&quot;column&quot;:21}}">优先级</div>
                    <input
                      className="input"
                      type="number"
                      min={1}
                      value={selectedRule.priority}
                      onChange={(e) =>
                        updateSelectedRule('priority', Number(e.target.value))
                      }
                     data-qoder-id="qel-input-ae656e8c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-ae656e8c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:436,&quot;column&quot;:21}}"/>
                  </div>

                  <div className="prop-row" data-qoder-id="qel-prop-row-75435cd3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-75435cd3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:447,&quot;column&quot;:19}}">
                    <div className="prop-label" data-qoder-id="qel-prop-label-c87ac0ea" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-c87ac0ea&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:448,&quot;column&quot;:21}}">描述</div>
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="输入规则描述..."
                      style={{ resize: 'vertical' }}
                      onChange={(e) =>
                        updateSelectedRule('description', e.target.value)
                      }
                     data-qoder-id="qel-input-48941448" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-48941448&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:449,&quot;column&quot;:21}}"/>
                  </div>

                  <div className="prop-row" data-qoder-id="qel-prop-row-76435e66" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-76435e66&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:460,&quot;column&quot;:19}}">
                    <div className="prop-label" data-qoder-id="qel-prop-label-c57abc31" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-c57abc31&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:461,&quot;column&quot;:21}}">标签</div>
                    <input
                      className="input"
                      placeholder="用逗号分隔"
                      value={ruleSet.tags.join(', ')}
                      readOnly
                     data-qoder-id="qel-input-b6633c8d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-b6633c8d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:462,&quot;column&quot;:21}}"/>
                  </div>
                </div>

                <div className="prop-section" data-qoder-id="qel-prop-section-f88ecc90" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-f88ecc90&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:471,&quot;column&quot;:17}}">
                  <div className="prop-section-title" data-qoder-id="qel-prop-section-title-5883b63e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-5883b63e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:472,&quot;column&quot;:19}}">启用状态</div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                   data-qoder-id="qel-div-7577b602" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7577b602&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:473,&quot;column&quot;:19}}">
                    <span style={{ fontSize: 13, color: 'var(--fg-2)' }} data-qoder-id="qel-span-c8c38b41" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-c8c38b41&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:480,&quot;column&quot;:21}}">
                      {selectedRule.enabled ? '已启用' : '已禁用'}
                    </span>
                    <button
                      className={`toggle ${selectedRule.enabled ? 'active' : ''}`}
                      onClick={() => toggleRule(selectedRule.id)}
                     data-qoder-id="qel-button-c40af865" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-c40af865&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:483,&quot;column&quot;:21}}"/>
                  </div>
                </div>

                <div className="prop-section" data-qoder-id="qel-prop-section-7fa9e492" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-7fa9e492&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:490,&quot;column&quot;:17}}">
                  <div className="prop-section-title" data-qoder-id="qel-prop-section-title-435ec456" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-435ec456&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:491,&quot;column&quot;:19}}">条件详情</div>
                  <div className="code-block" style={{ fontSize: 11 }} data-qoder-id="qel-code-block-9d388d7a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-code-block-9d388d7a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;code-block&quot;,&quot;loc&quot;:{&quot;line&quot;:492,&quot;column&quot;:19}}">
                    {selectedRule.condition}
                  </div>
                </div>

                <div className="prop-section" data-qoder-id="qel-prop-section-7ca9dfd9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-7ca9dfd9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-section&quot;,&quot;loc&quot;:{&quot;line&quot;:497,&quot;column&quot;:17}}">
                  <div className="prop-section-title" data-qoder-id="qel-prop-section-title-465ec90f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-465ec90f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:498,&quot;column&quot;:19}}">操作</div>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      setRules((prev) => prev.filter((r) => r.id !== selectedRuleId));
                      setSelectedRuleId(rules[0]?.id ?? null);
                    }}
                   data-qoder-id="qel-btn-e31bf611" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-e31bf611&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:499,&quot;column&quot;:19}}">
                    <Trash2 size={13}  data-qoder-id="qel-trash2-e299c668" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-trash2-e299c668&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;trash2&quot;,&quot;loc&quot;:{&quot;line&quot;:507,&quot;column&quot;:21}}"/>
                    删除规则
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ padding: '40px 16px' }} data-qoder-id="qel-empty-state-3d0bc2cf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-state-3d0bc2cf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;empty-state&quot;,&quot;loc&quot;:{&quot;line&quot;:513,&quot;column&quot;:15}}">
                <ChevronRight size={32}  data-qoder-id="qel-chevronright-012b5a84" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-chevronright-012b5a84&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;chevronright&quot;,&quot;loc&quot;:{&quot;line&quot;:514,&quot;column&quot;:17}}"/>
                <p data-qoder-id="qel-p-d0083a90" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-d0083a90&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:515,&quot;column&quot;:17}}">选择一条规则查看属性</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== Properties Tab ===== */}
      {activeTab === 'properties' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }} data-qoder-id="qel-div-7a68b357" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7a68b357&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:524,&quot;column&quot;:9}}">
          <div className="card" style={{ maxWidth: 640 }} data-qoder-id="qel-card-0d9c25d5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-0d9c25d5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:525,&quot;column&quot;:11}}">
            <div className="prop-section-title" data-qoder-id="qel-prop-section-title-44610480" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-44610480&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:526,&quot;column&quot;:13}}">规则集属性</div>

            <div className="prop-row" data-qoder-id="qel-prop-row-8d347811" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-8d347811&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:528,&quot;column&quot;:13}}">
              <div className="prop-label" data-qoder-id="qel-prop-label-b089a5ac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-b089a5ac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:529,&quot;column&quot;:15}}">名称</div>
              <input
                className="input"
                value={ruleSetName}
                onChange={(e) => setRuleSetName(e.target.value)}
               data-qoder-id="qel-input-a3408c62" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-a3408c62&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:530,&quot;column&quot;:15}}"/>
            </div>

            <div className="prop-row" data-qoder-id="qel-prop-row-8a347358" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-8a347358&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:537,&quot;column&quot;:13}}">
              <div className="prop-label" data-qoder-id="qel-prop-label-b589ad8b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-b589ad8b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:538,&quot;column&quot;:15}}">描述</div>
              <textarea
                className="input"
                rows={3}
                defaultValue={ruleSet.description}
                style={{ resize: 'vertical' }}
               data-qoder-id="qel-input-3f7173db" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-3f7173db&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:539,&quot;column&quot;:15}}"/>
            </div>

            <div style={{ display: 'flex', gap: 12 }} data-qoder-id="qel-div-8a672334" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8a672334&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:547,&quot;column&quot;:13}}">
              <div className="prop-row" style={{ flex: 1 }} data-qoder-id="qel-prop-row-5977063c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-5977063c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:548,&quot;column&quot;:15}}">
                <div className="prop-label" data-qoder-id="qel-prop-label-98d40d9b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-98d40d9b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:549,&quot;column&quot;:17}}">版本</div>
                <input className="input" defaultValue={ruleSet.version} readOnly  data-qoder-id="qel-input-c6748af1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-c6748af1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:550,&quot;column&quot;:17}}"/>
              </div>
              <div className="prop-row" style={{ flex: 1 }} data-qoder-id="qel-prop-row-56770183" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-56770183&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:552,&quot;column&quot;:15}}">
                <div className="prop-label" data-qoder-id="qel-prop-label-9dd4157a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-9dd4157a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:553,&quot;column&quot;:17}}">状态</div>
                <input className="input" defaultValue={st.label} readOnly  data-qoder-id="qel-input-c9748faa" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-c9748faa&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:554,&quot;column&quot;:17}}"/>
              </div>
            </div>

            <div className="prop-row" data-qoder-id="qel-prop-row-57770316" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-57770316&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:558,&quot;column&quot;:13}}">
              <div className="prop-label" data-qoder-id="qel-prop-label-92d40429" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-92d40429&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:559,&quot;column&quot;:15}}">创建者</div>
              <input className="input" defaultValue={ruleSet.creator} readOnly  data-qoder-id="qel-input-bc747b33" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-bc747b33&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:560,&quot;column&quot;:15}}"/>
            </div>

            <div className="prop-row" data-qoder-id="qel-prop-row-5474bfc6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-5474bfc6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:563,&quot;column&quot;:13}}">
              <div className="prop-label" data-qoder-id="qel-prop-label-95d1ca4b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-95d1ca4b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:564,&quot;column&quot;:15}}">标签</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }} data-qoder-id="qel-div-8e696817" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-8e696817&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:565,&quot;column&quot;:15}}">
                {ruleSet.tags.map((tag) => (
                  <span key={tag} className="badge badge-info" data-qoder-id="qel-badge-e4849dd9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-e4849dd9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:567,&quot;column&quot;:19}}">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="prop-row" data-qoder-id="qel-prop-row-5874c612" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-row-5874c612&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-row&quot;,&quot;loc&quot;:{&quot;line&quot;:574,&quot;column&quot;:13}}">
              <div className="prop-label" data-qoder-id="qel-prop-label-99d1d097" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-label-99d1d097&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-label&quot;,&quot;loc&quot;:{&quot;line&quot;:575,&quot;column&quot;:15}}">最后更新</div>
              <span style={{ fontSize: 13, color: 'var(--fg-3)' }} data-qoder-id="qel-span-f508ff7f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-f508ff7f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:576,&quot;column&quot;:15}}">
                {ruleSet.updatedAt}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== Version History Tab ===== */}
      {activeTab === 'versions' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }} data-qoder-id="qel-div-89696038" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-89696038&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:586,&quot;column&quot;:9}}">
          <div className="card" style={{ maxWidth: 640 }} data-qoder-id="qel-card-3eaec474" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-3eaec474&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:587,&quot;column&quot;:11}}">
            <div className="prop-section-title" data-qoder-id="qel-prop-section-title-d1e2cc95" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-prop-section-title-d1e2cc95&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;prop-section-title&quot;,&quot;loc&quot;:{&quot;line&quot;:588,&quot;column&quot;:13}}">版本历史</div>
            <div className="table-container" data-qoder-id="qel-table-container-2d3ca65f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-container-2d3ca65f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;table-container&quot;,&quot;loc&quot;:{&quot;line&quot;:589,&quot;column&quot;:13}}">
              <table className="table" data-qoder-id="qel-table-03b605e5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-03b605e5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:590,&quot;column&quot;:15}}">
                <thead data-qoder-id="qel-thead-b81b7f10" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-b81b7f10&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:591,&quot;column&quot;:17}}">
                  <tr data-qoder-id="qel-tr-3766b477" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-3766b477&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:592,&quot;column&quot;:19}}">
                    <th data-qoder-id="qel-th-bc5c4796" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-bc5c4796&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:593,&quot;column&quot;:21}}">版本</th>
                    <th data-qoder-id="qel-th-bd5c4929" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-bd5c4929&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:594,&quot;column&quot;:21}}">操作人</th>
                    <th data-qoder-id="qel-th-ba5c4470" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-ba5c4470&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:595,&quot;column&quot;:21}}">时间</th>
                    <th data-qoder-id="qel-th-bb5c4603" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-bb5c4603&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:596,&quot;column&quot;:21}}">状态</th>
                  </tr>
                </thead>
                <tbody data-qoder-id="qel-tbody-28373e72" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-28373e72&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:599,&quot;column&quot;:17}}">
                  <tr data-qoder-id="qel-tr-3166ab05" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-3166ab05&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:600,&quot;column&quot;:19}}">
                    <td data-qoder-id="qel-td-b3982453" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-b3982453&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:601,&quot;column&quot;:21}}">
                      <code
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 12,
                          color: 'var(--fg-2)',
                        }}
                       data-qoder-id="qel-code-438aa586" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-code-438aa586&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;code&quot;,&quot;loc&quot;:{&quot;line&quot;:602,&quot;column&quot;:23}}">
                        {ruleSet.version}
                      </code>
                    </td>
                    <td data-qoder-id="qel-td-b5982779" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-b5982779&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:612,&quot;column&quot;:21}}">{ruleSet.creator}</td>
                    <td style={{ color: 'var(--fg-3)', fontSize: 12 }} data-qoder-id="qel-td-b49825e6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-b49825e6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:613,&quot;column&quot;:21}}">
                      {ruleSet.updatedAt}
                    </td>
                    <td data-qoder-id="qel-td-b7982a9f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-b7982a9f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:616,&quot;column&quot;:21}}">
                      <span className={`badge ${st.className}`} data-qoder-id="qel-span-020d9124" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-020d9124&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:617,&quot;column&quot;:23}}">当前版本</span>
                    </td>
                  </tr>
                  <tr data-qoder-id="qel-tr-a4699ea5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-a4699ea5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:620,&quot;column&quot;:19}}">
                    <td data-qoder-id="qel-td-b8982c32" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-b8982c32&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:621,&quot;column&quot;:21}}">
                      <code
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 12,
                          color: 'var(--fg-4)',
                        }}
                       data-qoder-id="qel-code-4c8ab3b1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-code-4c8ab3b1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;code&quot;,&quot;loc&quot;:{&quot;line&quot;:622,&quot;column&quot;:23}}">
                        v1.0
                      </code>
                    </td>
                    <td data-qoder-id="qel-td-ba982f58" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-ba982f58&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:632,&quot;column&quot;:21}}">{ruleSet.creator}</td>
                    <td style={{ color: 'var(--fg-4)', fontSize: 12 }} data-qoder-id="qel-td-399b35dc" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-399b35dc&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:633,&quot;column&quot;:21}}">
                      2026-04-10 09:00
                    </td>
                    <td data-qoder-id="qel-td-3a9b376f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-3a9b376f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:636,&quot;column&quot;:21}}">
                      <span className="badge badge-neutral" data-qoder-id="qel-badge-7d90c7a7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-badge-7d90c7a7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/RuleSetEditor.jsx&quot;,&quot;componentName&quot;:&quot;RuleSetEditor&quot;,&quot;elementRole&quot;:&quot;badge&quot;,&quot;loc&quot;:{&quot;line&quot;:637,&quot;column&quot;:23}}">已归档</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
