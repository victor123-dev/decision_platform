import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Upload, ChevronDown, ChevronUp, Trash2, Save } from 'lucide-react';
import { api } from '@/api/apiClient';

const typeBadgeMap = {
  string: 'badge-info',
  number: 'badge-primary',
  boolean: 'badge-success',
  date: 'badge-neutral',
};

const scopeBadgeMap = {
  global: 'badge-primary',
  flow: 'badge-info',
  session: 'badge-warning',
};

const scopeLabels = {
  global: '全局',
  flow: '流程级',
  session: '会话级',
};

export default function GlobalVariables(qoderProps) {
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('全部');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New variable form state
  const [newVar, setNewVar] = useState({
    name: '',
    dataType: 'string',
    defaultValue: '',
    scope: 'global',
    description: '',
  });

  const tabs = ['全部', '全局', '流程级', '会话级'];

  const loadVariables = async () => {
    try {
      const data = await api.get('/variables');
      setVariables(data);
    } catch (err) {
      console.error('加载变量失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVariables(); }, []);

  const filtered = variables.filter((v) => {
    if (activeTab === '全部') return true;
    const scopeKey = Object.keys(scopeLabels).find((k) => scopeLabels[k] === activeTab);
    return v.scope === (scopeKey || activeTab.toLowerCase());
  });

  const startEdit = (varId, field) => {
    setEditingCell({ varId, field });
    const v = variables.find((x) => x.id === varId);
    setEditValue(String(v?.[field] ?? ''));
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    const { varId, field } = editingCell;
    const v = variables.find((x) => x.id === varId);
    if (!v) return;
    try {
      await api.put(`/variables/${varId}`, { ...v, [field]: editValue });
      setVariables(variables.map((v) =>
        v.id === varId ? { ...v, [field]: editValue } : v
      ));
    } catch (err) {
      console.error('更新变量失败:', err);
    }
    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const deleteVar = async (id) => {
    try {
      await api.del(`/variables/${id}`);
      setVariables(variables.filter((v) => v.id !== id));
    } catch (err) {
      console.error('删除变量失败:', err);
    }
  };

  const addVariable = async () => {
    if (!newVar.name.trim()) return;
    try {
      const created = await api.post('/variables', {
        ...newVar,
        updatedAt: new Date().toISOString().slice(0, 10),
      });
      setVariables([...variables, created]);
      setNewVar({ name: '', dataType: 'string', defaultValue: '', scope: 'global', description: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error('创建变量失败:', err);
    }
  };

  const renderCell = (v, field) => {
    if (editingCell?.varId === v.id && editingCell?.field === field) {
      return (
        <input
          className="input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') cancelEdit();
          }}
          autoFocus
          style={{ padding: '3px 8px', fontSize: 12, margin: '-2px 0' }}
         data-qoder-id="qel-input-e3be4e30" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-e3be4e30&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:82,&quot;column&quot;:9}}"/>
      );
    }
    return null;
  };

  return (
    <div className={["page", qoderProps?.className].filter(Boolean).join(" ")} style={qoderProps?.style} data-qoder-id={qoderProps?.["data-qoder-id"]} data-qoder-source={qoderProps?.["data-qoder-source"]}>
      <div className="page-header" data-qoder-id="qel-page-header-8d42ead2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-header-8d42ead2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;page-header&quot;,&quot;loc&quot;:{&quot;line&quot;:101,&quot;column&quot;:7}}">
        <div data-qoder-id="qel-div-51ec77b3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-51ec77b3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:102,&quot;column&quot;:9}}">
          <h1 className="page-title" data-qoder-id="qel-page-title-169b67e1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-title-169b67e1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;page-title&quot;,&quot;loc&quot;:{&quot;line&quot;:103,&quot;column&quot;:11}}">全局变量管理</h1>
          <p className="page-subtitle" data-qoder-id="qel-page-subtitle-73a19c27" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-page-subtitle-73a19c27&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;page-subtitle&quot;,&quot;loc&quot;:{&quot;line&quot;:104,&quot;column&quot;:11}}">管理决策引擎中的全局配置变量和参数</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }} data-qoder-id="qel-div-52ec7946" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-52ec7946&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:106,&quot;column&quot;:9}}">
          <button className="btn" data-qoder-id="qel-btn-1e0fbd05" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-1e0fbd05&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:107,&quot;column&quot;:11}}">
            <Download size={14}  data-qoder-id="qel-download-fd0ba958" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-download-fd0ba958&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;download&quot;,&quot;loc&quot;:{&quot;line&quot;:108,&quot;column&quot;:13}}"/>
            导出
          </button>
          <button className="btn" data-qoder-id="qel-btn-91d8334e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-91d8334e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:111,&quot;column&quot;:11}}">
            <Upload size={14}  data-qoder-id="qel-upload-2831b875" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-upload-2831b875&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;upload&quot;,&quot;loc&quot;:{&quot;line&quot;:112,&quot;column&quot;:13}}"/>
            导入
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)} data-qoder-id="qel-btn-8fd83028" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-8fd83028&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:115,&quot;column&quot;:11}}">
            <Plus size={14}  data-qoder-id="qel-plus-3d871dcd" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-plus-3d871dcd&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;plus&quot;,&quot;loc&quot;:{&quot;line&quot;:116,&quot;column&quot;:13}}"/>
            新建变量
          </button>
        </div>
      </div>

      {/* Add variable form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: 16, animation: 'fade-in 0.2s ease-out' }} data-qoder-id="qel-card-65078b93" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-card-65078b93&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;card&quot;,&quot;loc&quot;:{&quot;line&quot;:124,&quot;column&quot;:9}}">
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', marginBottom: 12 }} data-qoder-id="qel-div-0947c01b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0947c01b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:125,&quot;column&quot;:11}}">新增变量</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr 120px', gap: 10, marginBottom: 10 }} data-qoder-id="qel-div-0a47c1ae" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0a47c1ae&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:126,&quot;column&quot;:11}}">
            <div data-qoder-id="qel-div-0b47c341" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0b47c341&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:127,&quot;column&quot;:13}}">
              <div style={{ fontSize: 11, color: 'var(--fg-4)', marginBottom: 3 }} data-qoder-id="qel-div-0447b83c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-0447b83c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:128,&quot;column&quot;:15}}">变量名</div>
              <input
                className="input"
                placeholder="variable_name"
                value={newVar.name}
                onChange={(e) => setNewVar({ ...newVar, name: e.target.value })}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
               data-qoder-id="qel-input-8d94d82b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-8d94d82b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:129,&quot;column&quot;:15}}"/>
            </div>
            <div data-qoder-id="qel-div-7e4f340f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7e4f340f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:137,&quot;column&quot;:13}}">
              <div style={{ fontSize: 11, color: 'var(--fg-4)', marginBottom: 3 }} data-qoder-id="qel-div-7d4f327c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7d4f327c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:138,&quot;column&quot;:15}}">类型</div>
              <select
                className="select"
                value={newVar.dataType}
                onChange={(e) => setNewVar({ ...newVar, dataType: e.target.value })}
                style={{ width: '100%' }}
               data-qoder-id="qel-select-5a21e7a9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-select-5a21e7a9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;select&quot;,&quot;loc&quot;:{&quot;line&quot;:139,&quot;column&quot;:15}}">
                <option value="string" data-qoder-id="qel-option-1f335c70" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-1f335c70&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:145,&quot;column&quot;:17}}">string</option>
                <option value="number" data-qoder-id="qel-option-26336775" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-26336775&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:146,&quot;column&quot;:17}}">number</option>
                <option value="boolean" data-qoder-id="qel-option-253365e2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-253365e2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:147,&quot;column&quot;:17}}">boolean</option>
                <option value="date" data-qoder-id="qel-option-2433644f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-2433644f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:148,&quot;column&quot;:17}}">date</option>
              </select>
            </div>
            <div data-qoder-id="qel-div-7b4f2f56" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7b4f2f56&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:151,&quot;column&quot;:13}}">
              <div style={{ fontSize: 11, color: 'var(--fg-4)', marginBottom: 3 }} data-qoder-id="qel-div-864f40a7" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-864f40a7&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:152,&quot;column&quot;:15}}">默认值</div>
              <input
                className="input"
                placeholder="默认值"
                value={newVar.defaultValue}
                onChange={(e) => setNewVar({ ...newVar, defaultValue: e.target.value })}
               data-qoder-id="qel-input-0d9c5d70" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-0d9c5d70&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:153,&quot;column&quot;:15}}"/>
            </div>
            <div data-qoder-id="qel-div-784cec06" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-784cec06&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:160,&quot;column&quot;:13}}">
              <div style={{ fontSize: 11, color: 'var(--fg-4)', marginBottom: 3 }} data-qoder-id="qel-div-794ced99" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-794ced99&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:161,&quot;column&quot;:15}}">作用域</div>
              <select
                className="select"
                value={newVar.scope}
                onChange={(e) => setNewVar({ ...newVar, scope: e.target.value })}
                style={{ width: '100%' }}
               data-qoder-id="qel-select-701fcbb4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-select-701fcbb4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;select&quot;,&quot;loc&quot;:{&quot;line&quot;:162,&quot;column&quot;:15}}">
                <option value="global" data-qoder-id="qel-option-1f311dd9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-1f311dd9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:168,&quot;column&quot;:17}}">全局</option>
                <option value="flow" data-qoder-id="qel-option-20311f6c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-20311f6c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:169,&quot;column&quot;:17}}">流程级</option>
                <option value="session" data-qoder-id="qel-option-213120ff" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-option-213120ff&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;option&quot;,&quot;loc&quot;:{&quot;line&quot;:170,&quot;column&quot;:17}}">会话级</option>
              </select>
            </div>
          </div>
          <div data-qoder-id="qel-div-7a4cef2c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7a4cef2c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:174,&quot;column&quot;:11}}">
            <div style={{ fontSize: 11, color: 'var(--fg-4)', marginBottom: 3 }} data-qoder-id="qel-div-7b4cf0bf" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-7b4cf0bf&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:175,&quot;column&quot;:13}}">描述</div>
            <input
              className="input"
              placeholder="变量描述"
              value={newVar.description}
              onChange={(e) => setNewVar({ ...newVar, description: e.target.value })}
             data-qoder-id="qel-input-189a302a" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-input-189a302a&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;input&quot;,&quot;loc&quot;:{&quot;line&quot;:176,&quot;column&quot;:13}}"/>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }} data-qoder-id="qel-div-814cfa31" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-814cfa31&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:183,&quot;column&quot;:11}}">
            <button className="btn btn-primary btn-sm" onClick={addVariable} data-qoder-id="qel-btn-ffd091b3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-ffd091b3&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:184,&quot;column&quot;:13}}">
              <Save size={12}  data-qoder-id="qel-save-e6ea35b4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-save-e6ea35b4&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;save&quot;,&quot;loc&quot;:{&quot;line&quot;:185,&quot;column&quot;:15}}"/>
              添加
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)} data-qoder-id="qel-btn-01d094d9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-01d094d9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:188,&quot;column&quot;:13}}">取消</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" data-qoder-id="qel-tabs-5920bec5" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tabs-5920bec5&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;tabs&quot;,&quot;loc&quot;:{&quot;line&quot;:194,&quot;column&quot;:7}}">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
           data-qoder-id="qel-button-1f93674d" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-button-1f93674d&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;button&quot;,&quot;loc&quot;:{&quot;line&quot;:196,&quot;column&quot;:11}}">
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--fg-3)' }}>加载中...</div>
      ) : (
      <>
      <div className="table-container" data-qoder-id="qel-table-container-f96f0b81" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-container-f96f0b81&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;table-container&quot;,&quot;loc&quot;:{&quot;line&quot;:207,&quot;column&quot;:7}}">
        <table className="table" data-qoder-id="qel-table-9a598193" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-table-9a598193&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;table&quot;,&quot;loc&quot;:{&quot;line&quot;:208,&quot;column&quot;:9}}">
          <thead data-qoder-id="qel-thead-da965f9c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-thead-da965f9c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;thead&quot;,&quot;loc&quot;:{&quot;line&quot;:209,&quot;column&quot;:11}}">
            <tr data-qoder-id="qel-tr-2535be35" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-2535be35&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:210,&quot;column&quot;:13}}">
              <th data-qoder-id="qel-th-19faffba" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-19faffba&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:211,&quot;column&quot;:15}}">变量名</th>
              <th data-qoder-id="qel-th-0cf8acac" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-0cf8acac&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:212,&quot;column&quot;:15}}">类型</th>
              <th data-qoder-id="qel-th-0df8ae3f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-0df8ae3f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:213,&quot;column&quot;:15}}">默认值</th>
              <th data-qoder-id="qel-th-0ef8afd2" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-0ef8afd2&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:214,&quot;column&quot;:15}}">作用域</th>
              <th data-qoder-id="qel-th-0ff8b165" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-0ff8b165&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:215,&quot;column&quot;:15}}">描述</th>
              <th style={{ width: 60, textAlign: 'center' }} data-qoder-id="qel-th-08f8a660" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-th-08f8a660&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;th&quot;,&quot;loc&quot;:{&quot;line&quot;:216,&quot;column&quot;:15}}">操作</th>
            </tr>
          </thead>
          <tbody data-qoder-id="qel-tbody-6dfe90cb" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tbody-6dfe90cb&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;tbody&quot;,&quot;loc&quot;:{&quot;line&quot;:219,&quot;column&quot;:11}}">
            {filtered.map((v) => (
              <tr key={v.id} data-qoder-id="qel-tr-25337f9e" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-tr-25337f9e&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;tr&quot;,&quot;loc&quot;:{&quot;line&quot;:221,&quot;column&quot;:15}}">
                <td
                  onClick={() => startEdit(v.id, 'name')}
                  style={{ cursor: 'pointer' }}
                 data-qoder-id="qel-td-35ab87d1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-35ab87d1&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:222,&quot;column&quot;:17}}">
                  {renderCell(v, 'name') || (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--fg)' }} data-qoder-id="qel-span-ba7b9a84" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-ba7b9a84&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:227,&quot;column&quot;:21}}">
                      {v.name}
                    </span>
                  )}
                </td>
                <td data-qoder-id="qel-td-2fab7e5f" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-2fab7e5f&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:232,&quot;column&quot;:17}}">
                  <span className={`badge ${typeBadgeMap[v.dataType] || 'badge-neutral'}`} data-qoder-id="qel-span-44832f87" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-44832f87&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:233,&quot;column&quot;:19}}">
                    {v.dataType}
                  </span>
                </td>
                <td
                  onClick={() => startEdit(v.id, 'defaultValue')}
                  style={{ cursor: 'pointer' }}
                 data-qoder-id="qel-td-a7b2f70c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-a7b2f70c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:237,&quot;column&quot;:17}}">
                  {renderCell(v, 'defaultValue') || (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} data-qoder-id="qel-span-468332ad" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-468332ad&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:242,&quot;column&quot;:21}}">
                      {v.defaultValue}
                    </span>
                  )}
                </td>
                <td data-qoder-id="qel-td-a9b2fa32" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-a9b2fa32&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:247,&quot;column&quot;:17}}">
                  <span className={`badge ${scopeBadgeMap[v.scope] || 'badge-neutral'}`} data-qoder-id="qel-span-4083293b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-4083293b&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:248,&quot;column&quot;:19}}">
                    {scopeLabels[v.scope] || v.scope}
                  </span>
                </td>
                <td
                  onClick={() => startEdit(v.id, 'description')}
                  style={{ cursor: 'pointer', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                 data-qoder-id="qel-td-a3b2f0c0" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-a3b2f0c0&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:252,&quot;column&quot;:17}}">
                  {renderCell(v, 'description') || (
                    <span style={{ color: 'var(--fg-3)', fontSize: 12 }} data-qoder-id="qel-span-42832c61" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-span-42832c61&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;span&quot;,&quot;loc&quot;:{&quot;line&quot;:257,&quot;column&quot;:21}}">{v.description}</span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }} data-qoder-id="qel-td-a5b2f3e6" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-td-a5b2f3e6&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;td&quot;,&quot;loc&quot;:{&quot;line&quot;:260,&quot;column&quot;:17}}">
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)', padding: '3px 6px' }}
                    onClick={() => deleteVar(v.id)}
                   data-qoder-id="qel-btn-8bcb5de9" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-btn-8bcb5de9&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;btn&quot;,&quot;loc&quot;:{&quot;line&quot;:261,&quot;column&quot;:19}}">
                    <Trash2 size={13}  data-qoder-id="qel-trash2-ae5da800" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-trash2-ae5da800&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;trash2&quot;,&quot;loc&quot;:{&quot;line&quot;:266,&quot;column&quot;:21}}"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state" data-qoder-id="qel-empty-state-55e69d08" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-empty-state-55e69d08&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;empty-state&quot;,&quot;loc&quot;:{&quot;line&quot;:276,&quot;column&quot;:9}}">
          <p data-qoder-id="qel-p-9e826229" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-9e826229&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:277,&quot;column&quot;:11}}">当前作用域下暂无变量</p>
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--fg-4)' }} data-qoder-id="qel-div-fe43319c" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-fe43319c&quot;,&quot;filePath&quot;:&quot;react-vite/src/pages/GlobalVariables.jsx&quot;,&quot;componentName&quot;:&quot;GlobalVariables&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:281,&quot;column&quot;:7}}">
        共 {filtered.length} 个变量
        {activeTab !== '全部' && ` (总计 ${variables.length} 个)`}
      </div>
      </>
      )}
    </div>
  );
}
