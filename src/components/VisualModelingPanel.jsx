import { useState, Fragment } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Database, Variable, CheckCircle, X } from 'lucide-react';
import VariableSetPickerModal from './VariableSetPickerModal';
import VariableToken from './VariableToken';
import { normalizeCoefficient } from '../utils/variableUtils';
import ProblemTypeSelector from './optimization/ProblemTypeSelector';
import CPSatConfigPanel from './optimization/CPSatConfigPanel';
import SolverConfigPanel from './optimization/SolverConfigPanel';
import SolvingStrategySelector from './optimization/SolvingStrategySelector';

const VAR_TYPE_OPTIONS = [
  { value: 'continuous', label: '连续' },
  { value: 'integer', label: '整数' },
  { value: 'binary', label: '0-1' },
];

const VAR_TYPE_BADGE = {
  continuous: 'bg-sky-100 text-sky-700',
  integer: 'bg-orange-100 text-orange-700',
  binary: 'bg-pink-100 text-pink-700',
};

const VAR_TYPE_LABEL = {
  continuous: '连续',
  integer: '整数',
  binary: '0-1',
};

const SENSE_OPTIONS = [
  { value: '<=', label: '≤' },
  { value: '>=', label: '≥' },
  { value: '==', label: '=' },
];

const ONTOLOGY_OBJECT_TYPES = [
  { id: 'obj-supplier', displayName: '供应商' },
  { id: 'obj-warehouse', displayName: '仓库' },
  { id: 'obj-order', displayName: '订单' },
  { id: 'obj-product', displayName: '产品' },
  { id: 'obj-customer', displayName: '客户' },
  { id: 'obj-machine', displayName: '机台' },
  { id: 'obj-work-order', displayName: '工单' },
  { id: 'obj-process', displayName: '工序' },
  { id: 'obj-material', displayName: '物料' },
  { id: 'obj-transport', displayName: '运输路线' },
  { id: 'obj-schedule', displayName: '排程计划' },
];

const DIM_OPTIONS = [
  { value: '0D', label: '0D（标量）' },
  { value: '1D', label: '1D（一维）' },
  { value: '2D', label: '2D（二维）' },
  { value: '3D', label: '3D（三维）' },
];

/** 判断系数是否为有意义的非零项（数值非零、或变量引用 $xxx） */
const isNonZeroCoeff = (c) => {
  if (c === 0 || c === '0' || c === null || c === undefined) return false;
  return true;
};

/**
 * 可视化建模面板
 *
 * @param {Array} variables - 当前变量列表
 * @param {function} setVariables - 更新变量
 * @param {Array} objectives - 目标函数列表
 * @param {function} setObjectives - 更新目标函数列表
 * @param {Array} constraints - 约束条件
 * @param {function} setConstraints - 更新约束
 * @param {string} problemType - LP/MIP/IP/CP_SAT
 * @param {function} setProblemType - 更新问题类型
 * @param {Array} ontologies - 本体数据
 * @param {string} selectedOntologyId - 关联本体ID
 * @param {Array} intVars - CP-SAT 整数变量
 * @param {function} setIntVars - 更新 CP-SAT 整数变量
 * @param {Array} boolVars - CP-SAT 布尔变量
 * @param {function} setBoolVars - 更新 CP-SAT 布尔变量
 * @param {Array} intervalVars - CP-SAT 区间变量
 * @param {function} setIntervalVars - 更新 CP-SAT 区间变量
 * @param {Array} cpLinearConstraints - CP-SAT 线性约束
 * @param {function} setCpLinearConstraints - 更新 CP-SAT 线性约束
 * @param {Array} globalConstraints - CP-SAT 全局约束
 * @param {function} setGlobalConstraints - 更新 CP-SAT 全局约束
 * @param {Object} cpsatObjective - CP-SAT 目标函数
 * @param {function} setCpsatObjective - 更新 CP-SAT 目标函数
 * @param {Object} solverConfig - 求解器配置
 * @param {function} setSolverConfig - 更新求解器配置
 */
export default function VisualModelingPanel({
  variables,
  setVariables,
  objectives,
  setObjectives,
  constraints,
  setConstraints,
  problemType,
  setProblemType,
  ontologies,
  selectedOntologyId,
  // CP-SAT 新增 props
  intVars,
  setIntVars,
  boolVars,
  setBoolVars,
  intervalVars,
  setIntervalVars,
  cpLinearConstraints,
  setCpLinearConstraints,
  globalConstraints,
  setGlobalConstraints,
  cpsatObjective,
  setCpsatObjective,
  solverConfig,
  setSolverConfig,
}) {
  const [showVariableSetPicker, setShowVariableSetPicker] = useState(false);
  const [showCustomVarForm, setShowCustomVarForm] = useState(false);
  const [customVarForm, setCustomVarForm] = useState({
    name: '', nameEn: '', type: 'continuous',
    lowerBound: 0, upperBound: null,
    dimension: '0D', indicesConfig: [],
  });
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [objTermPickerOpen, setObjTermPickerOpen] = useState(null); // objective id whose picker is open
  const [constraintAddOpen, setConstraintAddOpen] = useState(null); // constraint id whose dropdown is open
  const [expandedVars, setExpandedVars] = useState({}); // varId -> boolean
  const [filterFormOpen, setFilterFormOpen] = useState(null); // 格式: "varId:alias" 或 null
  const [filterFormData, setFilterFormData] = useState({ property: '', operator: '=', value: '' });
  const [filterLogicOperator, setFilterLogicOperator] = useState({}); // { "varId:alias": "AND" | "OR" }

  const toggleVarExpanded = (varId) => {
    setExpandedVars(prev => ({ ...prev, [varId]: !prev[varId] }));
  };

  /** 是否为多维变量（非0D） */
  const isMultiDim = (v) => v.dimension && v.dimension !== '0D' && v.indices && v.indices.length > 0;

  const isCpSat = problemType === 'CP_SAT';
  const isLpOrMip = !isCpSat;

  /* ─── 变量操作 ─── */

  const handleAddFromOntology = (selection) => {
    const newVar = {
      id: `v-${Date.now()}`,
      name: selection.fieldName,
      source: 'ontology',
      ontologyRef: {
        ontologyId: selection.ontologyId,
        objectId: selection.objectId,
        fieldId: selection.fieldId,
      },
      type: 'continuous',
      lowerBound: 0,
      upperBound: null,
      description: `${selection.objectName}.${selection.fieldName}`,
    };
    setVariables([...variables, newVar]);
    // 将新变量加入第一个目标函数，系数=1
    if (objectives.length > 0) {
      setObjectives(objectives.map((o, i) =>
        i === 0 ? { ...o, coefficients: { ...o.coefficients, [newVar.id]: 1 } } : o
      ));
    }
    setAddMenuOpen(false);
  };

  const handleAddFromVariableSet = (selectedVars) => {
    const newVars = selectedVars.map((v, index) => {
      const dimension = v.dimension || '0D';
      const indexMapping = v.indexMapping || [];

      // 检测是否为非0维变量且已关联本体对象
      const isNonZeroDim = dimension !== '0D';
      const hasOntologyBinding = indexMapping.some(m => m.objectTypeId && m.objectTypeId.trim() !== '');
      const shouldLinkOntology = isNonZeroDim && hasOntologyBinding;

      return {
        id: `v-${Date.now()}-${index}`,
        name: v.name,
        nameEn: v.nameEn,
        symbol: v.symbol,
        source: shouldLinkOntology ? 'ontology' : 'variable_set',
        type: v.domain || 'continuous',
        lowerBound: v.lowerBound ?? 0,
        upperBound: v.upperBound ?? null,
        nature: v.nature,
        dimension,
        domain: v.domain,
        indices: v.indices || [],
        indexMapping: shouldLinkOntology
          ? indexMapping.map(m => ({ ...m, sourceType: m.sourceType || 'ontology' }))
          : indexMapping,
        businessMeaning: v.businessMeaning,
        ontologyRef: v.ontologyRef,
        ontologyRefs: v.ontologyRefs || [],
        associatedProperties: v.associatedProperties || [],
      };
    });
    setVariables([...variables, ...newVars]);
    // 将新变量加入第一个目标函数
    if (objectives.length > 0 && newVars.length > 0) {
      const newCoeffs = {};
      newVars.forEach(nv => { newCoeffs[nv.id] = 1; });
      setObjectives(objectives.map((o, i) =>
        i === 0 ? { ...o, coefficients: { ...o.coefficients, ...newCoeffs } } : o
      ));
    }
    setShowVariableSetPicker(false);
  };

  const handleAddCustomVariable = () => {
    setShowCustomVarForm(true);
    setAddMenuOpen(false);
  };

  const handleSubmitCustomVariable = () => {
    const dimCount = customVarForm.dimension === '1D' ? 1 : customVarForm.dimension === '2D' ? 2 : customVarForm.dimension === '3D' ? 3 : 0;
    const indices = customVarForm.indicesConfig.slice(0, dimCount).map(cfg => ({
      alias: cfg.alias,
      setName: cfg.businessMeaning || '',
      businessMeaning: cfg.businessMeaning || '',
      objectTypeId: cfg.objectTypeId || '',
      objectTypeDisplayName: ONTOLOGY_OBJECT_TYPES.find(o => o.id === cfg.objectTypeId)?.displayName || '',
    }));
    const indexMapping = indices.filter(idx => idx.objectTypeId).map(idx => ({
      alias: idx.alias,
      objectTypeId: idx.objectTypeId,
      propertyId: '',
      role: '索引',
      businessMeaning: idx.businessMeaning,
    }));
    const newVar = {
      id: `v-${Date.now()}`,
      name: customVarForm.name,
      nameEn: customVarForm.nameEn,
      source: 'custom',
      type: customVarForm.type,
      lowerBound: customVarForm.lowerBound,
      upperBound: customVarForm.upperBound,
      dimension: customVarForm.dimension,
      nature: dimCount > 0 ? 'association' : 'direct_ref',
      domain: customVarForm.type,
      indices: indices,
      indexMapping: indexMapping,
    };
    setVariables([...variables, newVar]);
    if (objectives.length > 0) {
      setObjectives(objectives.map((o, i) =>
        i === 0 ? { ...o, coefficients: { ...o.coefficients, [newVar.id]: 1 } } : o
      ));
    }
    setShowCustomVarForm(false);
    setCustomVarForm({ name: '', nameEn: '', type: 'continuous', lowerBound: 0, upperBound: null, dimension: '0D', indicesConfig: [] });
    setAddMenuOpen(false);
  };

  /** 将已有的零系数变量添加到指定目标函数中（系数设为 1） */
  const handleAddObjectiveTerm = (objId, varId) => {
    setObjectives(objectives.map(o =>
      o.id === objId ? { ...o, coefficients: { ...o.coefficients, [varId]: 1 } } : o
    ));
    setObjTermPickerOpen(null);
  };

  /** 将变量添加到指定约束中（系数设为 1） */
  const handleAddConstraintTerm = (constraintId, varId) => {
    setConstraints(
      constraints.map(c =>
        c.id === constraintId
          ? { ...c, coefficients: { ...c.coefficients, [varId]: 1 } }
          : c
      )
    );
    setConstraintAddOpen(null);
  };

  const handleDeleteVariable = (varId) => {
    setVariables(variables.filter(v => v.id !== varId));
    // 从所有目标函数中移除
    setObjectives(objectives.map(o => {
      const nc = { ...o.coefficients };
      delete nc[varId];
      return { ...o, coefficients: nc };
    }));
    // 从约束中移除
    setConstraints(
      constraints.map(c => {
        const nc = { ...c.coefficients };
        delete nc[varId];
        return { ...c, coefficients: nc };
      })
    );
  };

  const updateVariable = (varId, key, value) => {
    setVariables(variables.map(v => (v.id === varId ? { ...v, [key]: value } : v)));
  };

  const updateIndexMapping = (varId, idxAlias, updates) => {
    setVariables(variables.map(v => {
      if (v.id !== varId) return v;
      const newMapping = (v.indexMapping || []).map(m =>
        m.alias === idxAlias ? { ...m, ...updates } : m
      );
      if (!newMapping.find(m => m.alias === idxAlias)) {
        const idx = (v.indices || []).find(i => i.alias === idxAlias);
        newMapping.push({
          alias: idxAlias,
          objectTypeId: idx?.objectTypeId || '',
          propertyId: '',
          role: '索引',
          businessMeaning: idx?.businessMeaning || '',
          sourceType: idx?.objectTypeId ? 'ontology' : 'manual',
          ...updates,
        });
      }
      return { ...v, indexMapping: newMapping };
    }));
  };

  const getObjectProperties = (objectTypeId) => {
    if (!ontologies || !ontologies.length) return [];
    
    const objTypeName = objectTypeId?.replace('obj-', '') || '';
    const objTypeNameUpper = objTypeName.charAt(0).toUpperCase() + objTypeName.slice(1);
    
    for (const onto of ontologies) {
      const objectTypes = onto.object_types || onto.objectTypes || [];
      for (const obj of objectTypes) {
        const objId = obj.id || '';
        const objName = obj.name || '';
        const objDisplayName = obj.displayName || obj.display_name || '';
        
        const isMatch = objId === objectTypeId || 
                        objName === objTypeName || 
                        objName === objectTypeId ||
                        objName === objTypeNameUpper ||
                        objDisplayName === objectTypeId ||
                        objDisplayName.replace(/\s/g, '').toLowerCase() === objTypeName;
        
        if (isMatch) {
          const properties = obj.properties || obj.fields || [];
          return properties.map(p => ({
            name: p.name || p.field_id || '',
            type: p.type || p.data_type || 'string',
            description: p.description || p.name || '',
            displayName: p.description || p.name || p.field_id || ''
          }));
        }
      }
    }
    return [];
  };

  /* ─── 约束操作 ─── */

  const handleAddConstraint = () => {
    const newConstraint = {
      id: `c-${Date.now()}`,
      name: '',
      coefficients: {},
      sense: '<=',
      rhs: 0,
    };
    // 初始化为空约束，用户通过"添加变量"按钮逐个添加
    variables.forEach(v => {
      newConstraint.coefficients[v.id] = 0;
    });
    setConstraints([...constraints, newConstraint]);
  };

  const handleDeleteConstraint = (constraintId) => {
    setConstraints(constraints.filter(c => c.id !== constraintId));
  };

  const updateConstraint = (constraintId, key, value) => {
    setConstraints(
      constraints.map(c => (c.id === constraintId ? { ...c, [key]: value } : c))
    );
  };

  const updateConstraintCoefficient = (constraintId, varId, value) => {
    setConstraints(
      constraints.map(c =>
        c.id === constraintId
          ? { ...c, coefficients: { ...c.coefficients, [varId]: normalizeCoefficient(value) } }
          : c
      )
    );
  };

  /* ─── 目标函数操作 ─── */

  const handleAddObjective = () => {
    const newObj = {
      id: `obj-${Date.now()}`,
      name: `目标函数${objectives.length + 1}`,
      sense: 'minimize',
      coefficients: {},
    };
    setObjectives([...objectives, newObj]);
  };

  const handleDeleteObjective = (objId) => {
    setObjectives(objectives.filter(o => o.id !== objId));
  };

  const updateObjective = (objId, key, value) => {
    setObjectives(objectives.map(o => (o.id === objId ? { ...o, [key]: value } : o)));
  };

  const updateObjectiveCoefficient = (objId, varId, value) => {
    setObjectives(objectives.map(o =>
      o.id === objId ? { ...o, coefficients: { ...o.coefficients, [varId]: normalizeCoefficient(value) } } : o
    ));
  };

  /* ─── 渲染 ─── */

  return (
    <div className="w-full p-6 space-y-6 overflow-x-auto">
      {/* ── 区域1：优化类型选择（可收缩） ── */}
      <ProblemTypeSelector problemType={problemType} setProblemType={setProblemType} />

      {/* ── CP-SAT 配置面板 ── */}
      {isCpSat && (
        <CPSatConfigPanel
          intVars={intVars} setIntVars={setIntVars}
          boolVars={boolVars} setBoolVars={setBoolVars}
          intervalVars={intervalVars} setIntervalVars={setIntervalVars}
          linearConstraints={cpLinearConstraints} setLinearConstraints={setCpLinearConstraints}
          globalConstraints={globalConstraints} setGlobalConstraints={setGlobalConstraints}
          objective={cpsatObjective} setObjective={setCpsatObjective}
        />
      )}

      {/* ── LP/MIP 配置面板 ── */}
      {isLpOrMip && (<>

      {/* ── 区域4：取值范围（变量管理） ── */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Variable size={15} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">取值范围</h3>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
              {variables.length}
            </span>
          </div>
          <div className="relative">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1"
              onClick={() => setAddMenuOpen(!addMenuOpen)}
            >
              <Plus size={12} /> 添加变量
              <ChevronDown size={12} />
            </button>
            {addMenuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-10">
                <button
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  onClick={() => {
                    setShowVariableSetPicker(true);
                    setAddMenuOpen(false);
                  }}
                >
                  <Database size={13} className="text-blue-500" />
                  从变量集选择
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                  onClick={handleAddCustomVariable}
                >
                  <Variable size={13} className="text-slate-400" />
                  自定义变量
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 自定义变量表单 */}
        {showCustomVarForm && (
          <div className="border-b border-slate-200">
            <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-700">新增自定义变量</span>
              <button
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                onClick={() => setShowCustomVarForm(false)}
              >
                <X size={15} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              {/* 基本属性行 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">中文名称 <span className="text-red-500">*</span></label>
                  <input
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={customVarForm.name}
                    onChange={e => setCustomVarForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="中文名称"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">英文名称 <span className="text-red-500">*</span></label>
                  <input
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={customVarForm.nameEn}
                    onChange={e => setCustomVarForm(f => ({ ...f, nameEn: e.target.value }))}
                    placeholder="English name"
                  />
                </div>
              </div>
              {/* 类型、边界、维度行 */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">类型</label>
                  <select
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customVarForm.type}
                    onChange={e => setCustomVarForm(f => ({ ...f, type: e.target.value }))}
                  >
                    {VAR_TYPE_OPTIONS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">下界</label>
                  <input
                    type="number"
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customVarForm.lowerBound ?? ''}
                    onChange={e => setCustomVarForm(f => ({ ...f, lowerBound: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">上界</label>
                  <input
                    type="number"
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customVarForm.upperBound ?? ''}
                    onChange={e => setCustomVarForm(f => ({ ...f, upperBound: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                    placeholder="∞"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">维度</label>
                  <select
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customVarForm.dimension}
                    onChange={e => {
                      const dim = e.target.value;
                      const dimCount = dim === '1D' ? 1 : dim === '2D' ? 2 : dim === '3D' ? 3 : 0;
                      const aliases = ['i', 'j', 'k'];
                      const newConfig = Array.from({ length: dimCount }, (_, idx) => ({
                        alias: aliases[idx],
                        businessMeaning: customVarForm.indicesConfig[idx]?.businessMeaning || '',
                        objectTypeId: customVarForm.indicesConfig[idx]?.objectTypeId || '',
                      }));
                      setCustomVarForm(f => ({ ...f, dimension: dim, indicesConfig: newConfig }));
                    }}
                  >
                    {DIM_OPTIONS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* 索引配置区域 */}
              {customVarForm.dimension !== '0D' && (
                <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/40">
                  <label className="block text-xs font-medium text-blue-600 mb-2">索引配置（{customVarForm.dimension}）</label>
                  <div className="space-y-2">
                    {customVarForm.indicesConfig.map((cfg, cfgIdx) => (
                      <div key={cfgIdx} className="flex items-center gap-2">
                        <span className="w-6 text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-1.5 py-1 rounded text-center flex-shrink-0">{cfg.alias}</span>
                        <input
                          value={cfg.businessMeaning}
                          onChange={e => {
                            const updated = [...customVarForm.indicesConfig];
                            updated[cfgIdx] = { ...updated[cfgIdx], businessMeaning: e.target.value };
                            setCustomVarForm(f => ({ ...f, indicesConfig: updated }));
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                          placeholder="业务涵义，如 工单编号"
                        />
                        <select
                          value={cfg.objectTypeId || ''}
                          onChange={e => {
                            const updated = [...customVarForm.indicesConfig];
                            updated[cfgIdx] = { ...updated[cfgIdx], objectTypeId: e.target.value };
                            setCustomVarForm(f => ({ ...f, indicesConfig: updated }));
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                        >
                          <option value="">关联本体对象...</option>
                          {ONTOLOGY_OBJECT_TYPES.map(obj => (
                            <option key={obj.id} value={obj.id}>{obj.displayName}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* 操作按钮 */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  className="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                  onClick={() => {
                    setShowCustomVarForm(false);
                    setCustomVarForm({ name: '', nameEn: '', type: 'continuous', lowerBound: 0, upperBound: null, dimension: '0D', indicesConfig: [] });
                  }}
                >
                  取消
                </button>
                <button
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!customVarForm.name || !customVarForm.nameEn}
                  onClick={handleSubmitCustomVariable}
                >
                  添加变量
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 变量表格 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5">
                  <span className="text-red-500 mr-0.5">*</span>中文名称
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5">
                  <span className="text-red-500 mr-0.5">*</span>英文名称
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5">来源</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5">类型</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5">下界</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5">上界</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5 w-16">操作</th>
              </tr>
            </thead>
            <tbody>
              {variables.map(v => {
                const multiDim = isMultiDim(v);
                const expanded = !!expandedVars[v.id];
                const indexAliases = multiDim ? v.indices.map(idx => idx.alias).join(',') : null;
                return (
                  <Fragment key={v.id}>
                    <tr className="hover:bg-slate-50 border-b border-slate-100">
                      {/* 中文名称列：含展开箭头和索引下标 */}
                      <td className="px-4 py-2">
                        <div className="flex items-start gap-1">
                          {multiDim && (
                            <button
                              className="flex-shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded mt-1"
                              onClick={() => toggleVarExpanded(v.id)}
                              title={expanded ? '折叠索引详情' : '展开索引详情'}
                            >
                              {expanded
                                ? <ChevronDown size={13} />
                                : <ChevronRight size={13} />}
                            </button>
                          )}
                          {!multiDim && <div className="w-[17px] flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <input
                              className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!v.name ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                              value={v.name}
                              onChange={e => updateVariable(v.id, 'name', e.target.value)}
                              placeholder="中文名称（必填）"
                              required
                            />
                            {multiDim && (
                              <span className="text-xs text-slate-400 font-mono ml-1">[{indexAliases}]</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          className={`w-full border rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!v.nameEn ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                          value={v.nameEn || ''}
                          onChange={e => updateVariable(v.id, 'nameEn', e.target.value)}
                          placeholder="English name (required)"
                          required
                        />
                      </td>
                      <td className="px-4 py-2">
                        {v.source === 'variable_set' ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                            变量集
                          </span>
                        ) : v.source === 'ontology' || v.ontologyRef ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                            本体
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            自定义
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <select
                          className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={v.type}
                          onChange={e => updateVariable(v.id, 'type', e.target.value)}
                        >
                          {VAR_TYPE_OPTIONS.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="w-20 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={v.lowerBound ?? ''}
                          onChange={e => updateVariable(v.id, 'lowerBound', e.target.value === '' ? null : parseFloat(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="w-20 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={v.upperBound ?? ''}
                          onChange={e => updateVariable(v.id, 'upperBound', e.target.value === '' ? null : parseFloat(e.target.value))}
                          placeholder="∞"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          className="text-red-500 hover:text-red-700 p-1"
                          onClick={() => handleDeleteVariable(v.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                    {/* 索引详情展开行 */}
                    {multiDim && expanded && (
                      <tr key={`${v.id}-indices`} className="border-b border-slate-100">
                        <td colSpan={7} className="px-0 py-0">
                          <div className="bg-slate-50 border-t border-slate-100 px-10 py-2.5">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                              索引详情 · {v.dimension}
                            </div>
                            <div className="space-y-2">
                              {v.indices.map((idx) => {
                                const mapping = v.indexMapping?.find(m => m.alias === idx.alias);
                                const objectDisplay = idx.objectTypeDisplayName || idx.objectTypeId || '';
                                const propertyId = mapping?.propertyId || '';
                                const businessMeaning = idx.businessMeaning || mapping?.businessMeaning || '';
                                const sourceType = mapping?.sourceType || (idx.objectTypeId ? 'ontology' : 'manual');
                                const filters = mapping?.filters || [];
                                const manualValues = mapping?.manualValues || [];
                                const manualText = manualValues.join(', ');
                                const filterOpenKey = `${v.id}:${idx.alias}`;
                                const isFilterOpen = filterFormOpen === filterOpenKey;
                                const properties = getObjectProperties(idx.objectTypeId);
                                return (
                                  <div key={idx.alias} className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="font-mono text-blue-600 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 text-[11px] min-w-[22px] text-center">
                                        {idx.alias}
                                      </span>
                                      <span className="text-slate-400">→</span>
                                      <span className="text-slate-700 font-medium">{idx.setName || objectDisplay || '未命名集合'}</span>
                                      {objectDisplay && propertyId && (
                                        <span className="text-slate-400 font-mono text-[10px]">({objectDisplay}.{propertyId})</span>
                                      )}
                                      {businessMeaning && (
                                        <span className="text-slate-400 text-[10px] italic">— {businessMeaning}</span>
                                      )}
                                    </div>
                                    <div className="ml-6 pl-2 border-l-2 border-slate-200 space-y-1.5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-500">来源:</span>
                                        <select
                                          className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                          value={sourceType}
                                          onChange={e => updateIndexMapping(v.id, idx.alias, { sourceType: e.target.value })}
                                        >
                                          <option value="ontology">本体关联</option>
                                          <option value="manual">手动数组</option>
                                        </select>
                                      </div>
                                      {sourceType === 'ontology' && (
                                        <div className="space-y-1.5">
                                          {/* 已有筛选条件列表（多选模式） */}
                                          {filters.length > 0 && (
                                            <div className="space-y-1">
                                              {filters.map((f, fi) => (
                                                <div key={fi} className="flex items-center gap-1">
                                                  {fi > 0 && (
                                                    <select
                                                      className="border border-slate-200 rounded px-1 py-0.5 text-[9px] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-blue-600 w-12"
                                                      value={f.logicOperator || 'AND'}
                                                      onChange={e => {
                                                        const newFilters = filters.map((ff, ii) =>
                                                          ii === fi ? { ...ff, logicOperator: e.target.value } : ff
                                                        );
                                                        updateIndexMapping(v.id, idx.alias, { filters: newFilters });
                                                      }}
                                                    >
                                                      <option value="AND">与</option>
                                                      <option value="OR">或</option>
                                                    </select>
                                                  )}
                                                  {fi === 0 && <span className="w-12" />}
                                                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-[10px]">
                                                    {f.property} {f.operator} {f.value}
                                                    <button
                                                      className="hover:text-amber-900"
                                                      onClick={() => {
                                                        const newFilters = filters.filter((_, i) => i !== fi);
                                                        updateIndexMapping(v.id, idx.alias, { filters: newFilters });
                                                      }}
                                                      title="删除筛选"
                                                    >
                                                      <X size={10} />
                                                    </button>
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          {/* 添加筛选按钮 */}
                                          {!isFilterOpen && (
                                            <button
                                              className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-700 ml-12"
                                              onClick={() => {
                                                setFilterFormOpen(filterOpenKey);
                                                setFilterFormData({ property: '', operator: '=', value: '' });
                                              }}
                                            >
                                              <Plus size={10} /> 添加筛选条件
                                            </button>
                                          )}
                                          {/* 筛选条件输入表单 */}
                                          {isFilterOpen && (
                                            <div className="flex items-center gap-1.5 ml-12">
                                              <select
                                                className="w-40 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                                value={filterFormData.property}
                                                onChange={e => setFilterFormData(d => ({ ...d, property: e.target.value }))}
                                              >
                                                <option value="">选择属性</option>
                                                {properties.map(p => (
                                                  <option key={p.name} value={p.name}>
                                                    {p.description || p.name}（{p.name}）
                                                  </option>
                                                ))}
                                              </select>
                                              <select
                                                className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                                value={filterFormData.operator}
                                                onChange={e => setFilterFormData(d => ({ ...d, operator: e.target.value }))}
                                              >
                                                {['=', '!=', '>', '<', '>=', '<=', 'in'].map(op => (
                                                  <option key={op} value={op}>{op}</option>
                                                ))}
                                              </select>
                                              <input
                                                type="text"
                                                className="w-28 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="值"
                                                value={filterFormData.value}
                                                onChange={e => setFilterFormData(d => ({ ...d, value: e.target.value }))}
                                              />
                                              <button
                                                className="text-emerald-600 hover:text-emerald-700"
                                                title="确认"
                                                onClick={() => {
                                                  if (!filterFormData.property) return;
                                                  updateIndexMapping(v.id, idx.alias, { filters: [...filters, filterFormData] });
                                                  setFilterFormOpen(null);
                                                  setFilterFormData({ property: '', operator: '=', value: '' });
                                                }}
                                              >
                                                <CheckCircle size={12} />
                                              </button>
                                              <button
                                                className="text-slate-400 hover:text-slate-600"
                                                title="取消"
                                                onClick={() => setFilterFormOpen(null)}
                                              >
                                                <X size={12} />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {sourceType === 'manual' && (
                                        <input
                                          type="text"
                                          className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          placeholder="输入索引值，用逗号分隔（如 WO-001, WO-002, WO-003）"
                                          value={manualText}
                                          onChange={e => {
                                            const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                            updateIndexMapping(v.id, idx.alias, { manualValues: arr });
                                          }}
                                        />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {variables.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                    暂无变量，点击"添加变量"开始
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 区域2：目标函数（支持多个） ── */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">目标函数</h3>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1 text-xs font-medium flex items-center gap-1"
            onClick={handleAddObjective}
          >
            <Plus size={12} /> 添加目标函数
          </button>
        </div>

        <div className="p-4 space-y-3">
          {objectives.map((obj, objIdx) => (
            <div key={obj.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              {/* 目标函数名称 + 方向 + 操作按钮 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input
                    className="border border-slate-200 rounded px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={obj.name || ''}
                    onChange={e => updateObjective(obj.id, 'name', e.target.value)}
                    placeholder="目标函数名称"
                    style={{ maxWidth: 160 }}
                  />
                  <select
                    className="border border-slate-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={obj.sense || 'maximize'}
                    onChange={e => updateObjective(obj.id, 'sense', e.target.value)}
                  >
                    <option value="maximize">最大化</option>
                    <option value="minimize">最小化</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* 添加变量下拉 - 始终显示所有取值范围中的变量 */}
                  <div className="relative">
                    <button
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded px-1.5 py-0.5 text-xs font-medium flex items-center gap-0.5"
                      onClick={() => setObjTermPickerOpen(objTermPickerOpen === obj.id ? null : obj.id)}
                    >
                      <Plus size={11} /> 添加变量
                    </button>
                    {objTermPickerOpen === obj.id && (
                      <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
                        {variables.length > 0 ? (
                          <>
                            <div className="px-3 py-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-wider border-b border-slate-100">
                              取值范围中的变量 ({variables.length})
                            </div>
                            {variables.map(v => {
                              const alreadyAdded = isNonZeroCoeff(obj.coefficients?.[v.id]);
                              return (
                                <button
                                  key={v.id}
                                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${
                                    alreadyAdded
                                      ? 'text-slate-400 cursor-default'
                                      : 'text-slate-700 hover:bg-blue-50 cursor-pointer'
                                  }`}
                                  disabled={alreadyAdded}
                                  onClick={() => !alreadyAdded && handleAddObjectiveTerm(obj.id, v.id)}
                                >
                                  {alreadyAdded ? (
                                    <CheckCircle size={10} className="text-slate-300 flex-shrink-0" />
                                  ) : (
                                    <Plus size={10} className="text-blue-500 flex-shrink-0" />
                                  )}
                                  <span className="truncate">{v.name || v.id}</span>
                                  {alreadyAdded && (
                                    <span className="text-[10px] text-slate-300 ml-auto">已添加</span>
                                  )}
                                </button>
                              );
                            })}
                          </>
                        ) : (
                          <div className="px-3 py-2 text-xs text-slate-400 italic">取值范围中暂无变量</div>
                        )}
                      </div>
                    )}
                  </div>
                  {objectives.length > 1 && (
                    <button
                      className="text-red-400 hover:text-red-600 p-0.5"
                      onClick={() => handleDeleteObjective(obj.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* 系数 + 变量表达式 */}
              {variables.length > 0 ? (
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1.5">
                  <span className="text-xs font-semibold text-emerald-600 mr-1">{obj.sense === 'maximize' ? 'max' : 'min'}</span>
                  <span className="text-xs font-semibold text-amber-600 mr-1">z{objIdx + 1}</span>
                  <span className="text-xs text-slate-400 mr-1">=</span>
                  {(() => {
                    const nonZeroVars = variables.filter(v => isNonZeroCoeff(obj.coefficients?.[v.id]));
                    if (nonZeroVars.length === 0) {
                      return <span className="text-xs text-slate-400 italic">请添加变量</span>;
                    }
                    return nonZeroVars.map((v, idx) => (
                      <div key={v.id} className="flex items-center gap-1">
                        {idx > 0 && <span className="text-slate-400 font-medium text-xs">+</span>}
                        <input
                          type="text"
                          className="w-16 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                          value={obj.coefficients?.[v.id] ?? 0}
                          onChange={e => updateObjectiveCoefficient(obj.id, v.id, e.target.value)}
                          placeholder="系数"
                          title="支持输入数字或 $变量名 占位符"
                        />
                        <span className="text-slate-400 text-xs">·</span>
                        <VariableToken variable={v} className="text-xs" showIndices={true} />
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 py-2">请先添加决策变量</div>
              )}
            </div>
          ))}

          {objectives.length === 0 && (
            <div className="text-center text-sm text-slate-400 py-4">
              暂无目标函数，点击"添加目标函数"开始
            </div>
          )}
        </div>
      </div>


      {/* ── 区域3：约束条件（紧凑排版） ── */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">约束条件</h3>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1 text-xs font-medium flex items-center gap-1"
            onClick={handleAddConstraint}
          >
            <Plus size={12} /> 添加约束
          </button>
        </div>

        <div className="p-4 space-y-3">
          {constraints.map(c => (
            <div
              key={c.id}
              className="border border-slate-200 rounded-lg p-3 bg-slate-50/50"
            >
              {/* 约束名称 + 操作按钮 */}
              <div className="flex items-center justify-between mb-2">
                <input
                  className="border border-slate-200 rounded px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={c.name || ''}
                  onChange={e => updateConstraint(c.id, 'name', e.target.value)}
                  placeholder="约束名称"
                  style={{ maxWidth: 180 }}
                />
                <div className="flex items-center gap-1.5">
                  {/* 添加变量到此约束 - 始终显示所有取值范围中的变量 */}
                  <div className="relative">
                    <button
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded px-1.5 py-0.5 text-xs font-medium flex items-center gap-0.5"
                      onClick={() => setConstraintAddOpen(constraintAddOpen === c.id ? null : c.id)}
                    >
                      <Plus size={11} /> 添加变量
                    </button>
                    {constraintAddOpen === c.id && (
                      <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
                        {variables.length > 0 ? (
                          <>
                            <div className="px-3 py-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-wider border-b border-slate-100">
                              取值范围中的变量 ({variables.length})
                            </div>
                            {variables.map(v => {
                              const alreadyAdded = isNonZeroCoeff(c.coefficients?.[v.id]);
                              return (
                                <button
                                  key={v.id}
                                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${
                                    alreadyAdded
                                      ? 'text-slate-400 cursor-default'
                                      : 'text-slate-700 hover:bg-blue-50 cursor-pointer'
                                  }`}
                                  disabled={alreadyAdded}
                                  onClick={() => !alreadyAdded && handleAddConstraintTerm(c.id, v.id)}
                                >
                                  {alreadyAdded ? (
                                    <CheckCircle size={10} className="text-slate-300 flex-shrink-0" />
                                  ) : (
                                    <Plus size={10} className="text-blue-500 flex-shrink-0" />
                                  )}
                                  <span className="truncate">{v.name || v.id}</span>
                                  {alreadyAdded && (
                                    <span className="text-[10px] text-slate-300 ml-auto">已添加</span>
                                  )}
                                </button>
                              );
                            })}
                          </>
                        ) : (
                          <div className="px-3 py-2 text-xs text-slate-400 italic">取值范围中暂无变量</div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    className="text-red-400 hover:text-red-600 p-0.5"
                    onClick={() => handleDeleteConstraint(c.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* 系数 + sense + RHS 单行紧凑排列 */}
              {variables.length > 0 && (
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1.5">
                  {(() => {
                    const nonZeroVars = variables.filter(v => isNonZeroCoeff(c.coefficients?.[v.id]));
                    const items = [];
                    nonZeroVars.forEach((v, idx) => {
                      items.push(
                        <div key={v.id} className="flex items-center gap-1">
                          {idx > 0 && <span className="text-slate-400 font-medium text-xs">+</span>}
                          <input
                            type="text"
                            className="w-20 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={c.coefficients?.[v.id] ?? 0}
                            onChange={e => updateConstraintCoefficient(c.id, v.id, e.target.value)}
                            placeholder="0"
                            title="支持输入数字或 $变量名 占位符"
                          />
                          <span className="text-slate-500 text-xs">·</span>
                          <VariableToken variable={v} className="text-xs" showIndices={true} />
                        </div>
                      );
                    });
                    return items;
                  })()}
                  {variables.length > 0 && variables.filter(v => isNonZeroCoeff(c.coefficients?.[v.id])).length === 0 && (
                    <span className="text-xs text-slate-400 italic">所有变量系数均为 0</span>
                  )}
                  <span className="text-xs text-slate-400 ml-1">结果</span>
                  <select
                    className="border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={c.sense || '<='}
                    onChange={e => updateConstraint(c.id, 'sense', e.target.value)}
                  >
                    {SENSE_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="w-20 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={c.rhs ?? 0}
                    onChange={e => updateConstraint(c.id, 'rhs', parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}

              {/* 无变量时只显示 sense + RHS */}
              {variables.length === 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">结果</span>
                  <select
                    className="border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={c.sense || '<='}
                    onChange={e => updateConstraint(c.id, 'sense', e.target.value)}
                  >
                    {SENSE_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="w-20 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={c.rhs ?? 0}
                    onChange={e => updateConstraint(c.id, 'rhs', parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>
          ))}

          {constraints.length === 0 && (
            <div className="text-center text-sm text-slate-400 py-4">
              暂无约束条件，点击"添加约束"开始
            </div>
          )}
        </div>
      </div>

      </>)}

      {/* ── 求解策略选择器（仅 CP-SAT） ── */}
      {isCpSat && (
        <SolvingStrategySelector
          solvingStrategy={solverConfig?.solvingStrategy || 'exact'}
          setSolvingStrategy={(val) => setSolverConfig({ ...solverConfig, solvingStrategy: val })}
        />
      )}

      {/* ── 求解器参数（所有类型通用） ── */}
      <SolverConfigPanel
        problemType={problemType}
        solverConfig={solverConfig}
        setSolverConfig={setSolverConfig}
        solvingStrategy={solverConfig?.solvingStrategy || 'exact'}
      />

      {/* 变量集选择弹窗 */}
      <VariableSetPickerModal
        open={showVariableSetPicker}
        onClose={() => setShowVariableSetPicker(false)}
        onConfirm={handleAddFromVariableSet}
        existingVariableIds={variables.map(v => v.symbol || v.name || v.id)}
      />
    </div>
  );
}
