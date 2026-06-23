import { useState, useEffect, useMemo } from 'react';
import { X, Database, ChevronDown, ChevronRight, Info, Import, Plus, Search, Tag, Layers, Link2, Network, Trash2, Package, Users, Box, ClipboardList, Truck, Settings, AlertTriangle, Warehouse, ShoppingCart, Cog, ClipboardCheck } from 'lucide-react';
import { api } from '../api/apiClient';

const VARIABLE_COLOR = '#3b82f6';
const CONSTRAINT_COLOR = '#f59e0b';

/* ── 本体对象分类定义（供应链控制塔） ── */
const ONTOLOGY_OBJECT_TYPES = [
  { id: 'obj-supplier', name: 'supplier', displayName: '供应商', icon: Users, color: '#8b5cf6' },
  { id: 'obj-warehouse', name: 'warehouse', displayName: '仓库', icon: Warehouse, color: '#06b6d4' },
  { id: 'obj-order', name: 'order', displayName: '订单', icon: ShoppingCart, color: '#f97316' },
  { id: 'obj-product', name: 'product', displayName: '产品', icon: Box, color: '#10b981' },
  { id: 'obj-customer', name: 'customer', displayName: '客户', icon: Users, color: '#ec4899' },
  { id: 'obj-material', name: 'material', displayName: '物料', icon: Package, color: '#6366f1' },
  { id: 'obj-work-order', name: 'work_order', displayName: '工单', icon: ClipboardList, color: '#14b8a6' },
  { id: 'obj-risk', name: 'risk', displayName: '风险', icon: AlertTriangle, color: '#ef4444' },
  { id: 'obj-inventory', name: 'inventory', displayName: '库存', icon: Package, color: '#84cc16' },
  { id: 'obj-machine', name: 'machine', displayName: '机台', icon: Cog, color: '#0ea5e9' },
  { id: 'obj-task', name: 'task', displayName: '生产任务', icon: ClipboardCheck, color: '#a855f7' },
  { id: 'obj-logistics', name: 'logistics', displayName: '物流单', icon: Truck, color: '#f59e0b' },
];

const ONTOLOGY_NAME = '供应链控制塔';

/* ── 空模板工厂 ── */
const blankVariable = () => ({
  id: `dv-${Math.random().toString(36).slice(2, 10)}`,
  symbol: '', name: '', nameEn: '', nature: 'association', dimension: '1D', domain: 'continuous',
  indices: [], ontologyRefs: [], directRef: null, indexMapping: [],
  lowerBound: 0, upperBound: null, businessMeaning: '', unit: '', valueType: 'number',
  indicesConfig: [],
});
const blankConstraint = () => ({
  id: `ct-${Math.random().toString(36).slice(2, 10)}`,
  name: '', description: '', category: 'custom', expressionText: '',
  forEach: [], operator: '==', rhsValue: 0, hardness: 'hard',
  businessMeaning: '', relatedVariableSymbols: [],
});

export default function OntologyModelMappingModal({ onClose, highlightVariableId }) {
  const handleClose = () => {
    if (onClose) onClose();
    else window.dispatchEvent(new CustomEvent('close-mapping-modal'));
  };

  const [activeTab, setActiveTab] = useState('variables');
  const [variableSets, setVariableSets] = useState([]);
  const [constraintSets, setConstraintSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  /* ── 按对象分类的状态 ── */
  const [selectedObjectType, setSelectedObjectType] = useState(null);
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [highlightedItemId, setHighlightedItemId] = useState(null);

  /* ── 根据 highlightVariableId 定位变量 ── */
  useEffect(() => {
    if (!highlightVariableId || variableSets.length === 0) return;

    // 在所有变量集中查找匹配的变量
    let targetVar = null;
    let targetObjectTypeId = null;

    for (const vs of variableSets) {
      for (const v of (vs.variables || [])) {
        if (v.id === highlightVariableId || v.name === highlightVariableId || v.symbol === highlightVariableId) {
          targetVar = v;
          break;
        }
      }
      if (targetVar) break;
    }

    if (!targetVar) return;

    // 推断变量归属的对象类型
    const involvedObjectIds = new Set();
    (targetVar.indexMapping || []).forEach(im => { if (im.objectTypeId) involvedObjectIds.add(im.objectTypeId); });
    (targetVar.ontologyRefs || []).forEach(ref => { if (ref.objectTypeId) involvedObjectIds.add(ref.objectTypeId); });
    if (targetVar.directRef?.objectTypeId) involvedObjectIds.add(targetVar.directRef.objectTypeId);

    targetObjectTypeId = Array.from(involvedObjectIds).find(id => ONTOLOGY_OBJECT_TYPES.some(o => o.id === id));

    setActiveTab('variables');
    if (targetObjectTypeId) setSelectedObjectType(targetObjectTypeId);
    setHighlightedItemId(targetVar.id);
    setExpandedItems(prev => ({ ...prev, [`var-${targetVar.id}`]: true }));

    // 3 秒后取消高亮样式
    const timer = setTimeout(() => setHighlightedItemId(null), 3000);
    return () => clearTimeout(timer);
  }, [highlightVariableId, variableSets]);

  /* ── 新增相关状态 ── */
  const [showAddSetDialog, setShowAddSetDialog] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDesc, setNewSetDesc] = useState('');
  const [addingItemType, setAddingItemType] = useState(null);
  const [newItemForm, setNewItemForm] = useState(null);

  useEffect(() => { fetchData(); }, []);

  /* ── 数据加载 ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, cRes] = await Promise.all([
        api.get('/mapping-sets/variable-sets/').catch(() => ({ items: [] })),
        api.get('/mapping-sets/constraint-sets/').catch(() => ({ items: [] })),
      ]);
      const vItems = (vRes?.items || vRes || []).filter(Boolean);
      const cItems = (cRes?.items || cRes || []).filter(Boolean);
      setVariableSets(vItems);
      setConstraintSets(cItems);
    } catch (err) {
      console.error('加载映射集失败:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── 按本体对象分类重组变量数据 ── */
  const variablesByObjectType = useMemo(() => {
    const result = {};
    ONTOLOGY_OBJECT_TYPES.forEach(obj => { result[obj.id] = []; });

    variableSets.forEach(vs => {
      const variables = vs.variables || [];
      variables.forEach(v => {
        // 从 indexMapping 或 ontologyRefs 提取涉及的对象
        const involvedObjectIds = new Set();
        
        // 从 indexMapping 提取
        if (v.indexMapping && v.indexMapping.length > 0) {
          v.indexMapping.forEach(im => {
            if (im.objectTypeId) involvedObjectIds.add(im.objectTypeId);
          });
        }
        
        // 从 ontologyRefs 提取
        if (v.ontologyRefs && v.ontologyRefs.length > 0) {
          v.ontologyRefs.forEach(ref => {
            if (ref.objectTypeId) involvedObjectIds.add(ref.objectTypeId);
          });
        }
        
        // 从 directRef 提取
        if (v.directRef && v.directRef.objectTypeId) {
          involvedObjectIds.add(v.directRef.objectTypeId);
        }

        // 将变量添加到相关对象分类下
        involvedObjectIds.forEach(objId => {
          if (result[objId]) {
            result[objId].push({ ...v, _sourceSet: vs });
          }
        });
      });
    });

    return result;
  }, [variableSets]);

  /* ── 按本体对象分类重组约束数据 ── */
  const constraintsByObjectType = useMemo(() => {
    const result = {};
    ONTOLOGY_OBJECT_TYPES.forEach(obj => { result[obj.id] = []; });

    constraintSets.forEach(cs => {
      const constraints = cs.constraints || [];
      constraints.forEach(c => {
        // 从 forEach 提取涉及的对象
        const involvedObjectIds = new Set();
        
        if (c.forEach && c.forEach.length > 0) {
          c.forEach.forEach(fe => {
            if (fe.objectTypeId) involvedObjectIds.add(fe.objectTypeId);
          });
        }

        // 如果没有明确的对象引用，尝试从关联变量推断
        if (involvedObjectIds.size === 0 && c.relatedVariableSymbols) {
          // 查找相关变量获取对象信息
          c.relatedVariableSymbols.forEach(sym => {
            variableSets.forEach(vs => {
              const vars = vs.variables || [];
              const matchedVar = vars.find(v => v.symbol === sym);
              if (matchedVar) {
                if (matchedVar.indexMapping) {
                  matchedVar.indexMapping.forEach(im => {
                    if (im.objectTypeId) involvedObjectIds.add(im.objectTypeId);
                  });
                }
                if (matchedVar.ontologyRefs) {
                  matchedVar.ontologyRefs.forEach(ref => {
                    if (ref.objectTypeId) involvedObjectIds.add(ref.objectTypeId);
                  });
                }
              }
            });
          });
        }

        // 将约束添加到相关对象分类下
        involvedObjectIds.forEach(objId => {
          if (result[objId]) {
            result[objId].push({ ...c, _sourceSet: cs });
          }
        });
      });
    });

    return result;
  }, [constraintSets, variableSets]);

  const toggleExpand = (id) => setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));

  /* ── 获取当前选中对象的相关数据 ── */
  const currentObjectTypeData = useMemo(() => {
    if (!selectedObjectType) return null;
    const objType = ONTOLOGY_OBJECT_TYPES.find(o => o.id === selectedObjectType);
    if (!objType) return null;
    
    const items = activeTab === 'variables' 
      ? variablesByObjectType[selectedObjectType] || []
      : constraintsByObjectType[selectedObjectType] || [];
    
    return { objType, items };
  }, [selectedObjectType, activeTab, variablesByObjectType, constraintsByObjectType]);

  /* ── 搜索过滤 ── */
  const filteredObjectTypes = useMemo(() => {
    if (!searchTerm.trim()) return ONTOLOGY_OBJECT_TYPES;
    const term = searchTerm.toLowerCase();
    return ONTOLOGY_OBJECT_TYPES.filter(obj => {
      const name = obj.displayName.toLowerCase();
      const count = activeTab === 'variables' 
        ? (variablesByObjectType[obj.id] || []).length 
        : (constraintsByObjectType[obj.id] || []).length;
      return name.includes(term) || count > 0;
    });
  }, [searchTerm, activeTab, variablesByObjectType, constraintsByObjectType]);

  /* ── 新增集合 ── */
  const handleCreateSet = async () => {
    if (!newSetName.trim()) return alert('请输入名称');
    try {
      if (activeTab === 'variables') {
        const result = await api.post('/mapping-sets/variable-sets/', {
          name: newSetName.trim(), description: newSetDesc.trim(), variables: [],
        });
        setVariableSets(prev => [...prev, result]);
      } else {
        const result = await api.post('/mapping-sets/constraint-sets/', {
          name: newSetName.trim(), description: newSetDesc.trim(), constraints: [],
        });
        setConstraintSets(prev => [...prev, result]);
      }
      setNewSetName(''); setNewSetDesc('');
      setShowAddSetDialog(false);
    } catch (err) {
      alert('创建失败: ' + (err.message || err));
    }
  };

  /* ── 删除条目 ── */
  const handleDeleteCheckedItems = async () => {
    if (checkedItems.size === 0) return;
    if (!confirm(`确定删除选中的 ${checkedItems.size} 个条目？`)) return;
    
    try {
      for (const itemId of checkedItems) {
        if (activeTab === 'variables') {
          // 找到变量所属的集合
          for (const vs of variableSets) {
            const setId = vs._id || vs.id;
            const hasVar = (vs.variables || []).some(v => v.id === itemId);
            if (hasVar) {
              await api.del(`/mapping-sets/variable-sets/${setId}/variables/${itemId}`);
              break;
            }
          }
        } else {
          for (const cs of constraintSets) {
            const setId = cs._id || cs.id;
            const hasCon = (cs.constraints || []).some(c => c.id === itemId);
            if (hasCon) {
              await api.del(`/mapping-sets/constraint-sets/${setId}/constraints/${itemId}`);
              break;
            }
          }
        }
      }
      await fetchData();
      setCheckedItems(new Set());
    } catch (err) {
      alert('删除失败: ' + (err.message || err));
    }
  };

  /* ── 勾选条目 ── */
  const toggleCheck = (itemId) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId); else next.add(itemId);
      return next;
    });
  };
  const toggleCheckAll = (items) => {
    const allIds = items.map(it => it.id);
    const allChecked = allIds.every(id => checkedItems.has(id));
    if (allChecked) {
      setCheckedItems(prev => { const n = new Set(prev); allIds.forEach(id => n.delete(id)); return n; });
    } else {
      setCheckedItems(prev => { const n = new Set(prev); allIds.forEach(id => n.add(id)); return n; });
    }
  };

  /* ── 导入JSON ── */
  const handleImportJSON = async () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const endpoint = activeTab === 'variables' ? '/mapping-sets/variable-sets/' : '/mapping-sets/constraint-sets/';
        const result = await api.post(endpoint, data);
        if (activeTab === 'variables') setVariableSets(prev => [...prev, result]);
        else setConstraintSets(prev => [...prev, result]);
      } catch (err) { alert('导入失败: ' + err.message); }
    };
    input.click();
  };

  const isVarTab = activeTab === 'variables';

  /* ── 条目表单字段更新 ── */
  const updateFormItem = (field, value) => setNewItemForm(prev => ({ ...prev, [field]: value }));

  /* ── 新增条目 ── */
  const handleStartAddItem = () => {
    setAddingItemType(isVarTab ? 'variable' : 'constraint');
    setNewItemForm(isVarTab ? blankVariable() : blankConstraint());
  };

  const handleSaveNewItem = async () => {
    if (!selectedObjectType || !newItemForm) return;
    
    // 找到第一个相关的集合来添加
    try {
      if (addingItemType === 'variable') {
        if (!newItemForm.symbol.trim()) return alert('请输入变量符号');
        // 找到或创建一个集合
        let targetSet = variableSets[0];
        if (!targetSet) {
          targetSet = await api.post('/mapping-sets/variable-sets/', {
            name: `${ONTOLOGY_NAME}变量集`, variables: [],
          });
          setVariableSets(prev => [...prev, targetSet]);
        }
        const setId = targetSet._id || targetSet.id;
        await api.post(`/mapping-sets/variable-sets/${setId}/variables`, { variable: newItemForm });
      } else {
        if (!newItemForm.name.trim()) return alert('请输入约束名称');
        let targetSet = constraintSets[0];
        if (!targetSet) {
          targetSet = await api.post('/mapping-sets/constraint-sets/', {
            name: `${ONTOLOGY_NAME}约束集`, constraints: [],
          });
          setConstraintSets(prev => [...prev, targetSet]);
        }
        const setId = targetSet._id || targetSet.id;
        await api.post(`/mapping-sets/constraint-sets/${setId}/constraints`, { constraint: newItemForm });
      }
      await fetchData();
      setAddingItemType(null);
      setNewItemForm(null);
    } catch (err) {
      alert('添加失败: ' + (err.message || err));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full h-full flex flex-col" style={{ margin: '1.5rem', maxHeight: 'calc(100vh - 3rem)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center">
              <Database size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">本体-模型映射</h2>
              <p className="text-xs text-slate-500">按{ONTOLOGY_NAME}业务对象分类管理决策变量与约束条件</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/60">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 bg-slate-50">
          <button
            onClick={() => { setActiveTab('variables'); setSelectedObjectType(null); setCheckedItems(new Set()); setAddingItemType(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
              isVarTab ? 'bg-white text-blue-700 border-b-2 border-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <Layers size={15} />决策变量集
          </button>
          <button
            onClick={() => { setActiveTab('constraints'); setSelectedObjectType(null); setCheckedItems(new Set()); setAddingItemType(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
              !isVarTab ? 'bg-white text-amber-700 border-b-2 border-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <Tag size={15} />约束条件集
          </button>

          <div className="ml-auto flex items-center gap-2 pb-1">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="搜索对象..." className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 w-44"
              />
            </div>
            <button onClick={handleImportJSON} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50">
              <Import size={14} />导入JSON
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Left: Object Type Navigation */}
          <div className="w-[280px] border-r border-slate-200 overflow-y-auto bg-white">
            {loading ? (
              <div className="flex items-center justify-center h-40 text-slate-400"><div className="animate-pulse">加载中...</div></div>
            ) : (
              <div className="p-3">
                <div className="text-xs font-semibold text-slate-500 px-2 py-1.5 mb-1">{ONTOLOGY_NAME} · 业务对象</div>
                <div className="space-y-1">
                  {filteredObjectTypes.map(objType => {
                    const Icon = objType.icon;
                    const count = isVarTab 
                      ? (variablesByObjectType[objType.id] || []).length 
                      : (constraintsByObjectType[objType.id] || []).length;
                    const isSelected = selectedObjectType === objType.id;
                    
                    return (
                      <div
                        key={objType.id}
                        onClick={() => { setSelectedObjectType(objType.id); setCheckedItems(new Set()); setAddingItemType(null); }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${objType.color}15` }}
                        >
                          <Icon size={16} style={{ color: objType.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-700 truncate">{objType.displayName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{objType.id}</div>
                        </div>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                          count > 0 
                            ? isVarTab ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Detail */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-5">
            {!selectedObjectType ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Package size={32} className="mb-3 opacity-40" />
                <p className="text-sm">选择左侧业务对象查看相关{isVarTab ? '变量' : '约束'}</p>
              </div>
            ) : currentObjectTypeData && (
              <div>
                {/* Detail Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${currentObjectTypeData.objType.color}15` }}
                    >
                      <currentObjectTypeData.objType.icon size={20} style={{ color: currentObjectTypeData.objType.color }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        {ONTOLOGY_NAME} · {currentObjectTypeData.objType.displayName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        共 {currentObjectTypeData.items.length} 个相关{isVarTab ? '变量' : '约束'}
                      </p>
                    </div>
                  </div>
                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2">
                    {checkedItems.size > 0 && (
                      <button
                        onClick={handleDeleteCheckedItems}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={12} />删除选中 ({checkedItems.size})
                      </button>
                    )}
                    <button
                      onClick={handleStartAddItem}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-lg ${
                        isVarTab ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      <Plus size={12} />新增{isVarTab ? '变量' : '约束'}
                    </button>
                  </div>
                </div>

                {/* ═══ 新增条目表单 ═══ */}
                {addingItemType && newItemForm && (
                  <div className={`mb-4 rounded-lg border-2 p-4 ${isVarTab ? 'border-blue-300 bg-blue-50/50' : 'border-amber-300 bg-amber-50/50'}`}>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Plus size={14} className={isVarTab ? 'text-blue-600' : 'text-amber-600'} />
                      新增{addingItemType === 'variable' ? '决策变量' : '约束条件'}
                    </h4>
                    {addingItemType === 'variable' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">变量符号 *</label>
                          <input value={newItemForm.symbol} onChange={e => updateFormItem('symbol', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" placeholder="如 X_分配" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">中文名称 *</label>
                          <input value={newItemForm.name} onChange={e => updateFormItem('name', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" placeholder="如 工单机台分配" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">英文名称 *</label>
                          <input value={newItemForm.nameEn || ''} onChange={e => updateFormItem('nameEn', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 font-mono" placeholder="如 work_order_machine_assignment" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">变量性质</label>
                          <select value={newItemForm.nature} onChange={e => updateFormItem('nature', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400">
                            <option value="association">关联变量</option>
                            <option value="direct_ref">直引变量</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">变量类型</label>
                          <select value={newItemForm.domain} onChange={e => updateFormItem('domain', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400">
                            <option value="continuous">连续变量 (continuous)</option>
                            <option value="integer">整数变量 (integer)</option>
                            <option value="binary">二元变量 (binary)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">维度</label>
                          <select value={newItemForm.dimension} onChange={e => updateFormItem('dimension', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400">
                            <option value="0D">0D (标量)</option>
                            <option value="1D">1D</option>
                            <option value="2D">2D</option>
                            <option value="3D">3D</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">单位</label>
                          <input value={newItemForm.unit || ''} onChange={e => updateFormItem('unit', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" placeholder="如 件、小时" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-slate-500 mb-1">业务含义</label>
                          <input value={newItemForm.businessMeaning} onChange={e => updateFormItem('businessMeaning', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" placeholder="描述该变量的业务含义" />
                        </div>
                        {/* 索引配置区域：当维度为1D/2D/3D时显示 */}
                        {newItemForm.dimension !== '0D' && (() => {
                          const dimCount = newItemForm.dimension === '1D' ? 1 : newItemForm.dimension === '2D' ? 2 : 3;
                          const defaultAliases = ['i', 'j', 'k'];
                          // 确保 indicesConfig 数组长度匹配维度
                          const currentConfig = newItemForm.indicesConfig || [];
                          while (currentConfig.length < dimCount) {
                            currentConfig.push({ alias: defaultAliases[currentConfig.length], businessMeaning: '', objectTypeId: '' });
                          }
                          return (
                            <div className="col-span-2 border border-blue-200 rounded-lg p-3 bg-blue-50/40">
                              <label className="block text-xs font-medium text-blue-600 mb-2">索引配置（{newItemForm.dimension}）</label>
                              <div className="space-y-2">
                                {currentConfig.slice(0, dimCount).map((cfg, cfgIdx) => (
                                  <div key={cfgIdx} className="flex items-center gap-2">
                                    <span className="w-6 text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-1.5 py-1 rounded text-center">{cfg.alias}</span>
                                    <input
                                      value={cfg.businessMeaning}
                                      onChange={e => {
                                        const updated = [...currentConfig];
                                        updated[cfgIdx] = { ...updated[cfgIdx], businessMeaning: e.target.value };
                                        updateFormItem('indicesConfig', updated);
                                      }}
                                      className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                                      placeholder="业务涵义，如 工单编号"
                                    />
                                    <select
                                      value={cfg.objectTypeId || ''}
                                      onChange={e => {
                                        const updated = [...currentConfig];
                                        updated[cfgIdx] = { ...updated[cfgIdx], objectTypeId: e.target.value };
                                        updateFormItem('indicesConfig', updated);
                                      }}
                                      className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                                    >
                                      <option value=''>关联本体对象...</option>
                                      {ONTOLOGY_OBJECT_TYPES.map(obj => (
                                        <option key={obj.id} value={obj.id}>{obj.displayName}</option>
                                      ))}
                                    </select>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">约束名称 *</label>
                          <input value={newItemForm.name} onChange={e => updateFormItem('name', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400" placeholder="如 机台产能约束" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">分类</label>
                          <select value={newItemForm.category} onChange={e => updateFormItem('category', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400">
                            <option value="assignment">分配约束</option>
                            <option value="capacity">产能约束</option>
                            <option value="precedence">优先约束</option>
                            <option value="mutual_exclusion">互斥约束</option>
                            <option value="balance">平衡约束</option>
                            <option value="custom">自定义</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-slate-500 mb-1">表达式</label>
                          <input value={newItemForm.expressionText} onChange={e => updateFormItem('expressionText', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 font-mono" placeholder="如 sum(X[i,j]) <= C[j]" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-slate-500 mb-1">描述</label>
                          <input value={newItemForm.description} onChange={e => updateFormItem('description', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400" />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 mt-3">
                      <button onClick={() => { setAddingItemType(null); setNewItemForm(null); }}
                        className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">取消</button>
                      <button onClick={handleSaveNewItem}
                        className={`px-4 py-1.5 text-xs font-medium text-white rounded-lg ${isVarTab ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                        确认添加
                      </button>
                    </div>
                  </div>
                )}

                {/* ═══ 变量列表 ═══ */}
                {isVarTab && currentObjectTypeData.items.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={currentObjectTypeData.items.length > 0 && currentObjectTypeData.items.every(v => checkedItems.has(v.id))}
                        onChange={() => toggleCheckAll(currentObjectTypeData.items)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: VARIABLE_COLOR }} />
                        决策变量 ({currentObjectTypeData.items.length})
                      </h4>
                    </div>
                    {currentObjectTypeData.items.map((v, idx) => {
                      const expandKey = `var-${v.id || idx}`;
                      const isExpanded = expandedItems[expandKey];
                      const isChecked = checkedItems.has(v.id);
                      const isHighlighted = highlightedItemId === v.id;
                      // 生成关联属性摘要文本
                      const assocSummary = (v.associatedProperties || []).map(ap => {
                        const props = (ap.properties || []).map(p => p.displayName).join(',');
                        return `${ap.displayName}(${props})`;
                      }).join(' × ');
                      return (
                        <div key={v.id || idx} className={`bg-white rounded-lg border overflow-hidden transition-all ${isChecked ? 'border-red-300 bg-red-50/30' : isHighlighted ? 'border-blue-400 bg-blue-50 shadow-md ring-2 ring-blue-200' : 'border-slate-200'}`}>
                          <div className="flex items-center gap-2 px-4 py-2.5">
                            <input
                              type="checkbox" checked={isChecked} onChange={() => toggleCheck(v.id)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-red-500 focus:ring-red-400"
                              onClick={e => e.stopPropagation()}
                            />
                            <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => toggleExpand(expandKey)}>
                              {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                              <span className="text-sm font-semibold text-slate-700">{v.name || v.symbol}</span>
                              {v.nameEn && <span className="text-[11px] font-mono text-slate-400">({v.nameEn})</span>}
                              {v.indices && v.indices.length > 0 && (
                                <span className="text-xs text-slate-400">[{v.indices.map(idx => typeof idx === 'string' ? idx : idx.alias).join(', ')}]</span>
                              )}
                              {v.nature === 'direct_ref' && <span className="text-[9px] font-medium px-1 py-0.5 rounded bg-emerald-100 text-emerald-600">直引</span>}
                              {v.nature === 'association' && <span className="text-[9px] font-medium px-1 py-0.5 rounded bg-purple-100 text-purple-600">关联</span>}
                              <span className="ml-auto text-xs text-slate-400">{v.domain || 'continuous'}</span>
                            </div>
                          </div>
                          {/* 关联属性摘要行（始终可见） */}
                          {v.nature === 'association' && assocSummary && (
                            <div className="px-4 pb-2 -mt-1">
                              <span className="text-[11px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded inline-block">
                                关联: {assocSummary}
                              </span>
                            </div>
                          )}
                          {isExpanded && (
                            <div className="px-4 pb-3 border-t border-slate-100 pt-2 space-y-1.5">
                              <div className="flex items-center gap-2">
                                {v.nature === 'direct_ref' ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700"><Link2 size={10} />直引变量</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700"><Network size={10} />关联变量</span>
                                )}
                                <span className="text-[10px] text-slate-400">{v.dimension} | {v.domain}</span>
                                {v._sourceSet && (
                                  <span className="text-[10px] text-slate-400 ml-auto">来源: {v._sourceSet.name}</span>
                                )}
                              </div>
                              <div className="flex gap-2 text-xs"><span className="text-slate-400 w-20 flex-shrink-0">英文名称:</span><span className="text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded text-[11px]">{v.nameEn || '—'}</span></div>
                              <div className="flex gap-2 text-xs"><span className="text-slate-400 w-20 flex-shrink-0">中文名称:</span><span className="text-slate-700">{v.name || '—'}</span></div>
                              {v.businessMeaning && (
                                <div className="flex gap-2 text-xs"><span className="text-slate-400 w-20 flex-shrink-0">业务含义:</span><span className="text-slate-700">{v.businessMeaning}</span></div>
                              )}
                              {v.nature === 'direct_ref' && v.directRef && (
                                <div className="flex gap-2 text-xs">
                                  <span className="text-slate-400 w-20 flex-shrink-0">本体路径:</span>
                                  <span className="text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                                    {ONTOLOGY_NAME}.{v.directRef.displayName || `${v.directRef.objectTypeId}.${v.directRef.propertyId}`}
                                  </span>
                                </div>
                              )}
                              {/* 关联变量: 关联业务属性详情 */}
                              {v.nature === 'association' && v.associatedProperties && v.associatedProperties.length > 0 && (
                                <div className="text-xs">
                                  <span className="text-slate-400 block mb-1">关联业务属性:</span>
                                  <div className="space-y-1">
                                    {v.associatedProperties.map((ap, api) => (
                                      <div key={api} className="flex items-start gap-2">
                                        <span className="text-purple-600 font-medium w-16 flex-shrink-0">{ap.displayName}:</span>
                                        <div className="flex flex-wrap gap-1">
                                          {(ap.properties || []).map((p, pi) => (
                                            <span key={pi} className="text-[11px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">{p.displayName}</span>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* 关联变量: 索引映射表格 */}
                              {v.nature === 'association' && (
                                (() => {
                                  // 优先使用 indexMapping，否则从 indices 生成 fallback
                                  const mappings = (v.indexMapping && v.indexMapping.length > 0)
                                    ? v.indexMapping
                                    : (v.indices || []).map(idx => ({
                                        alias: typeof idx === 'string' ? idx : idx.alias,
                                        objectTypeId: typeof idx === 'string' ? null : idx.objectTypeId,
                                        businessMeaning: typeof idx === 'string' ? '' : (idx.businessMeaning || ''),
                                        propertyId: typeof idx === 'string' ? '' : (idx.propertyId || ''),
                                        role: typeof idx === 'string' ? '' : (idx.objectTypeDisplayName || ''),
                                      }));
                                  if (mappings.length === 0) return null;
                                  return (
                                    <div className="text-xs">
                                      <span className="text-slate-400 block mb-1">索引映射:</span>
                                      <table className="w-full border-collapse text-[11px]">
                                        <thead><tr className="bg-purple-50">
                                          <th className="text-left px-2 py-1 text-purple-600 font-semibold border border-purple-100">索引</th>
                                          <th className="text-left px-2 py-1 text-purple-600 font-semibold border border-purple-100">业务涵义</th>
                                          <th className="text-left px-2 py-1 text-purple-600 font-semibold border border-purple-100">关联对象</th>
                                          <th className="text-left px-2 py-1 text-purple-600 font-semibold border border-purple-100">主键属性</th>
                                          <th className="text-left px-2 py-1 text-purple-600 font-semibold border border-purple-100">角色</th>
                                        </tr></thead>
                                        <tbody>
                                          {mappings.map((im, imi) => (
                                            <tr key={imi}>
                                              <td className="px-2 py-1 font-mono text-purple-700 border border-slate-100">{im.alias}</td>
                                              <td className="px-2 py-1 text-slate-600 border border-slate-100">{im.businessMeaning || '—'}</td>
                                              <td className="px-2 py-1 text-slate-600 border border-slate-100">{ONTOLOGY_OBJECT_TYPES.find(o => o.id === im.objectTypeId)?.displayName || im.objectTypeId || '—'}</td>
                                              <td className="px-2 py-1 text-slate-600 font-mono border border-slate-100">{im.propertyId || '—'}</td>
                                              <td className="px-2 py-1 text-slate-500 border border-slate-100">{im.role || '—'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  );
                                })()
                              )}
                              {v.unit && <div className="flex gap-2 text-xs"><span className="text-slate-400 w-20 flex-shrink-0">单位:</span><span className="text-slate-700">{v.unit}</span></div>}
                              {(v.lowerBound !== undefined || v.upperBound !== undefined) && (
                                <div className="flex gap-2 text-xs"><span className="text-slate-400 w-20 flex-shrink-0">取值范围:</span>
                                  <span className="text-slate-700 font-mono">[{v.lowerBound ?? '-∞'}, {v.upperBound ?? '+∞'}]</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ═══ 约束列表 ═══ */}
                {!isVarTab && currentObjectTypeData.items.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={currentObjectTypeData.items.length > 0 && currentObjectTypeData.items.every(c => checkedItems.has(c.id))}
                        onChange={() => toggleCheckAll(currentObjectTypeData.items)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: CONSTRAINT_COLOR }} />
                        约束条件 ({currentObjectTypeData.items.length})
                      </h4>
                    </div>
                    {currentObjectTypeData.items.map((c, idx) => {
                      const expandKey = `con-${c.id || idx}`;
                      const isExpanded = expandedItems[expandKey];
                      const isChecked = checkedItems.has(c.id);
                      return (
                        <div key={c.id || idx} className={`bg-white rounded-lg border overflow-hidden transition-all ${isChecked ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
                          <div className="flex items-center gap-2 px-4 py-2.5">
                            <input
                              type="checkbox" checked={isChecked} onChange={() => toggleCheck(c.id)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-red-500 focus:ring-red-400"
                              onClick={e => e.stopPropagation()}
                            />
                            <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => toggleExpand(expandKey)}>
                              {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                              <span className="text-sm font-semibold text-slate-700">{c.name}</span>
                              {c.category && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{c.category}</span>}
                              <span className={`ml-auto text-xs font-medium px-1.5 py-0.5 rounded ${
                                c.hardness === 'hard' ? 'bg-red-100 text-red-600' : c.hardness === 'soft' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {c.hardness === 'hard' ? '硬约束' : c.hardness === 'soft' ? '软约束' : '约束'}
                              </span>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="px-4 pb-3 border-t border-slate-100 pt-2 space-y-1.5">
                              {c.expressionText && (
                                <div className="flex gap-2 text-xs"><span className="text-slate-400 w-20 flex-shrink-0">表达式:</span>
                                  <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">{c.expressionText}</code>
                                </div>
                              )}
                              {c.description && <div className="flex gap-2 text-xs"><span className="text-slate-400 w-20 flex-shrink-0">说明:</span><span className="text-slate-700">{c.description}</span></div>}
                              {c._sourceSet && (
                                <div className="flex gap-2 text-xs"><span className="text-slate-400 w-20 flex-shrink-0">来源:</span><span className="text-slate-500">{c._sourceSet.name}</span></div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 空状态 */}
                {currentObjectTypeData && currentObjectTypeData.items.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-60 text-slate-400">
                    <Info size={32} className="mb-3 opacity-40" />
                    <p className="text-sm">该业务对象暂无相关{isVarTab ? '变量' : '约束'}</p>
                    <button
                      onClick={handleStartAddItem}
                      className={`mt-3 flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-lg ${
                        isVarTab ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      <Plus size={12} />新增{isVarTab ? '变量' : '约束'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══ 新增集合弹窗（保留但不再主要使用） ═══ */}
        {showAddSetDialog && (
          <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-[440px] p-6">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus size={16} className={isVarTab ? 'text-blue-600' : 'text-amber-600'} />
                新增{isVarTab ? '决策变量集' : '约束条件集'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">名称 *</label>
                  <input value={newSetName} onChange={e => setNewSetName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                    placeholder={isVarTab ? '如：工单相关变量集' : '如：产能约束集'} autoFocus />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">描述</label>
                  <textarea value={newSetDesc} onChange={e => setNewSetDesc(e.target.value)} rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
                    placeholder="描述该集合的用途" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowAddSetDialog(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">取消</button>
                <button onClick={handleCreateSet}
                  className={`px-5 py-2 text-sm font-medium text-white rounded-lg ${isVarTab ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                  确认创建
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
