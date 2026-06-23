import { useState } from 'react';
import { Plus, Trash2, Variable, ToggleLeft, Timer, ChevronDown, X, ChevronRight } from 'lucide-react';

const VAR_TYPE_OPTIONS = [
  { value: 'continuous', label: '连续' },
  { value: 'integer', label: '整数' },
  { value: 'binary', label: '0-1' },
];

const DIM_OPTIONS = [
  { value: '0D', label: '0D' },
  { value: '1D', label: '1D' },
  { value: '2D', label: '2D' },
  { value: '3D', label: '3D' },
];

const ONTOLOGY_OBJECT_TYPES = [
  { id: 'obj-material', displayName: '物料' },
  { id: 'obj-warehouse', displayName: '仓库' },
  { id: 'obj-supplier', displayName: '供应商' },
  { id: 'obj-product', displayName: '产品' },
  { id: 'obj-order', displayName: '订单' },
  { id: 'obj-work-order', displayName: '工单' },
];

const GLOBAL_CONSTRAINT_TYPES = [
  { value: 'AllDifferent', label: '所有不同 (AllDifferent)', desc: '所有变量取不同值' },
  { value: 'NoOverlap', label: '无重叠 (NoOverlap)', desc: '区间变量不重叠' },
  { value: 'Cumulative', label: '累积 (Cumulative)', desc: '资源容量约束' },
];

const SENSE_OPTIONS = [
  { value: '<=', label: '≤' },
  { value: '>=', label: '≥' },
  { value: '==', label: '=' },
];

function VariableTable({ 
  title, 
  icon: Icon, 
  color, 
  vars, 
  setVars, 
  type: varType,
  showType = true,
  showBounds = true,
  showDimension = true,
}) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: '',
    nameEn: '',
    type: varType === 'bool' ? 'binary' : varType === 'int' ? 'integer' : 'continuous',
    lowerBound: varType === 'bool' ? 0 : 0,
    upperBound: varType === 'bool' ? 1 : (varType === 'int' ? 100 : null),
    dimension: '0D',
    indicesConfig: [],
    description: '',
  });
  const [expandedVar, setExpandedVar] = useState(null);

  const addVar = () => {
    const newVar = {
      id: `${varType}-${Date.now()}`,
      name: '',
      nameEn: '',
      type: varType === 'bool' ? 'binary' : varType === 'int' ? 'integer' : 'continuous',
      lowerBound: varType === 'bool' ? 0 : 0,
      upperBound: varType === 'bool' ? 1 : (varType === 'int' ? 100 : null),
      dimension: '0D',
      indices: [],
      indexMapping: [],
      description: '',
    };
    setVars([...vars, newVar]);
    setAddMenuOpen(false);
  };

  const removeVar = (id) => setVars(vars.filter(v => v.id !== id));

  const updateVar = (id, key, value) => {
    setVars(vars.map(v => v.id === id ? { ...v, [key]: value } : v));
  };

  const handleSubmit = () => {
    if (!customForm.name || !customForm.nameEn) {
      alert('请填写中文名称和英文名称');
      return;
    }
    const newVar = {
      id: `${varType}-${Date.now()}`,
      ...customForm,
      indices: customForm.dimension !== '0D' ? 
        customForm.indicesConfig.map((_, idx) => ({
          alias: ['i', 'j', 'k'][idx],
          businessMeaning: customForm.indicesConfig[idx]?.businessMeaning || '',
        })) : [],
      indexMapping: customForm.dimension !== '0D' ? 
        customForm.indicesConfig.map((cfg, idx) => ({
          alias: ['i', 'j', 'k'][idx],
          objectTypeId: cfg.objectTypeId || '',
        })) : [],
    };
    setVars([...vars, newVar]);
    setShowCustomForm(false);
    setCustomForm({
      name: '',
      nameEn: '',
      type: varType === 'bool' ? 'binary' : varType === 'int' ? 'integer' : 'continuous',
      lowerBound: varType === 'bool' ? 0 : 0,
      upperBound: varType === 'bool' ? 1 : (varType === 'int' ? 100 : null),
      dimension: '0D',
      indicesConfig: [],
      description: '',
    });
  };

  const isMultiDim = (v) => v.dimension && v.dimension !== '0D';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Icon size={15} className={color} />
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
            {vars.length}
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
                onClick={addVar}
              >
                <Variable size={13} className="text-slate-400" />
                自定义变量
              </button>
            </div>
          )}
        </div>
      </div>

      {showCustomForm && (
        <div className="border-b border-slate-200">
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-700">新增{title}</span>
            <button
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
              onClick={() => setShowCustomForm(false)}
            >
              <X size={15} />
            </button>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">中文名称 <span className="text-red-500">*</span></label>
                <input
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={customForm.name}
                  onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="中文名称"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">英文名称 <span className="text-red-500">*</span></label>
                <input
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={customForm.nameEn}
                  onChange={e => setCustomForm(f => ({ ...f, nameEn: e.target.value }))}
                  placeholder="English name"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {showType && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">类型</label>
                  <select
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customForm.type}
                    onChange={e => setCustomForm(f => ({ ...f, type: e.target.value }))}
                  >
                    {VAR_TYPE_OPTIONS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              )}
              {showBounds && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">下界</label>
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={customForm.lowerBound ?? ''}
                      onChange={e => setCustomForm(f => ({ ...f, lowerBound: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">上界</label>
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={customForm.upperBound ?? ''}
                      onChange={e => setCustomForm(f => ({ ...f, upperBound: e.target.value === '' ? null : parseFloat(e.target.value) }))}
                      placeholder="∞"
                    />
                  </div>
                </>
              )}
              {showDimension && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">维度</label>
                  <select
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={customForm.dimension}
                    onChange={e => {
                      const dim = e.target.value;
                      const dimCount = dim === '1D' ? 1 : dim === '2D' ? 2 : dim === '3D' ? 3 : 0;
                      const aliases = ['i', 'j', 'k'];
                      const newConfig = Array.from({ length: dimCount }, (_, idx) => ({
                        alias: aliases[idx],
                        businessMeaning: customForm.indicesConfig[idx]?.businessMeaning || '',
                        objectTypeId: customForm.indicesConfig[idx]?.objectTypeId || '',
                      }));
                      setCustomForm(f => ({ ...f, dimension: dim, indicesConfig: newConfig }));
                    }}
                  >
                    {DIM_OPTIONS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {customForm.dimension !== '0D' && showDimension && (
              <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/40">
                <label className="block text-xs font-medium text-blue-600 mb-2">索引配置（{customForm.dimension}）</label>
                <div className="space-y-2">
                  {customForm.indicesConfig.map((cfg, cfgIdx) => (
                    <div key={cfgIdx} className="flex items-center gap-2">
                      <span className="w-6 text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-1.5 py-1 rounded text-center flex-shrink-0">{cfg.alias}</span>
                      <input
                        value={cfg.businessMeaning}
                        onChange={e => {
                          const updated = [...customForm.indicesConfig];
                          updated[cfgIdx] = { ...updated[cfgIdx], businessMeaning: e.target.value };
                          setCustomForm(f => ({ ...f, indicesConfig: updated }));
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                        placeholder="业务涵义，如 工单编号"
                      />
                      <select
                        value={cfg.objectTypeId || ''}
                        onChange={e => {
                          const updated = [...customForm.indicesConfig];
                          updated[cfgIdx] = { ...updated[cfgIdx], objectTypeId: e.target.value };
                          setCustomForm(f => ({ ...f, indicesConfig: updated }));
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
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">描述（可选）</label>
              <input
                className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={customForm.description || ''}
                onChange={e => setCustomForm(f => ({ ...f, description: e.target.value }))}
                placeholder="描述信息"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                className="px-3 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                onClick={() => {
                  setShowCustomForm(false);
                  setCustomForm({
                    name: '',
                    nameEn: '',
                    type: varType === 'bool' ? 'binary' : varType === 'int' ? 'integer' : 'continuous',
                    lowerBound: varType === 'bool' ? 0 : 0,
                    upperBound: varType === 'bool' ? 1 : (varType === 'int' ? 100 : null),
                    dimension: '0D',
                    indicesConfig: [],
                    description: '',
                  });
                }}
              >
                取消
              </button>
              <button
                className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                onClick={handleSubmit}
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2 w-8"></th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">中文名称</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">英文名称</th>
              {showType && <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">类型</th>}
              {showBounds && (
                <>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">下界</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">上界</th>
                </>
              )}
              {showDimension && <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">维度</th>}
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">描述</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2 w-12">操作</th>
            </tr>
          </thead>
          <tbody>
            {vars.map(v => (
              <>
                <tr key={v.id} className="hover:bg-slate-50 border-b border-slate-100">
                  <td className="px-4 py-2">
                    {isMultiDim(v) && (
                      <button
                        className="p-1 hover:bg-slate-100 rounded"
                        onClick={() => setExpandedVar(expandedVar === v.id ? null : v.id)}
                      >
                        <ChevronRight 
                          size={14} 
                          className={`text-slate-400 transition-transform ${expandedVar === v.id ? 'rotate-90' : ''}`} 
                        />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={v.name || ''}
                      onChange={e => updateVar(v.id, 'name', e.target.value)}
                      placeholder="中文名称"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-slate-200 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={v.nameEn || ''}
                      onChange={e => updateVar(v.id, 'nameEn', e.target.value)}
                      placeholder="English name"
                    />
                  </td>
                  {showType && (
                    <td className="px-4 py-2">
                      <select
                        className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={v.type || (varType === 'bool' ? 'binary' : varType === 'int' ? 'integer' : 'continuous')}
                        onChange={e => updateVar(v.id, 'type', e.target.value)}
                      >
                        {VAR_TYPE_OPTIONS.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </td>
                  )}
                  {showBounds && (
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="w-20 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={v.lowerBound ?? ''}
                          onChange={e => updateVar(v.id, 'lowerBound', e.target.value === '' ? null : parseFloat(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          className="w-20 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={v.upperBound ?? ''}
                          onChange={e => updateVar(v.id, 'upperBound', e.target.value === '' ? null : parseFloat(e.target.value))}
                        />
                      </td>
                    </>
                  )}
                  {showDimension && (
                    <td className="px-4 py-2">
                      <select
                        className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={v.dimension || '0D'}
                        onChange={e => {
                          const dim = e.target.value;
                          const dimCount = dim === '1D' ? 1 : dim === '2D' ? 2 : dim === '3D' ? 3 : 0;
                          const aliases = ['i', 'j', 'k'];
                          const newIndices = Array.from({ length: dimCount }, (_, idx) => ({
                            alias: aliases[idx],
                            businessMeaning: '',
                          }));
                          const newMapping = Array.from({ length: dimCount }, (_, idx) => ({
                            alias: aliases[idx],
                            objectTypeId: '',
                          }));
                          updateVar(v.id, 'dimension', dim);
                          updateVar(v.id, 'indices', newIndices);
                          updateVar(v.id, 'indexMapping', newMapping);
                        }}
                      >
                        {DIM_OPTIONS.map(d => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={v.description || ''}
                      onChange={e => updateVar(v.id, 'description', e.target.value)}
                      placeholder="描述"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-red-500 hover:text-red-700 p-1" onClick={() => removeVar(v.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
                {expandedVar === v.id && isMultiDim(v) && (
                  <tr>
                    <td colSpan={showType ? (showBounds ? 9 : 7) : (showBounds ? 8 : 6)} className="bg-blue-50/40 px-4 py-3">
                      <div className="ml-6 space-y-2">
                        {(v.indexMapping || []).map((mapping, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-6 text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-1.5 py-1 rounded text-center flex-shrink-0">
                              {['i', 'j', 'k'][idx]}
                            </span>
                            <input
                              className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                              value={v.indices?.[idx]?.businessMeaning || ''}
                              onChange={e => {
                                const newIndices = [...(v.indices || [])];
                                newIndices[idx] = { ...newIndices[idx], businessMeaning: e.target.value };
                                updateVar(v.id, 'indices', newIndices);
                              }}
                              placeholder="业务涵义"
                            />
                            <select
                              className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                              value={mapping.objectTypeId || ''}
                              onChange={e => {
                                const newMapping = [...(v.indexMapping || [])];
                                newMapping[idx] = { ...newMapping[idx], objectTypeId: e.target.value };
                                updateVar(v.id, 'indexMapping', newMapping);
                              }}
                            >
                              <option value="">关联本体对象...</option>
                              {ONTOLOGY_OBJECT_TYPES.map(obj => (
                                <option key={obj.id} value={obj.id}>{obj.displayName}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {vars.length === 0 && (
              <tr>
                <td colSpan={showType ? (showBounds ? 9 : 7) : (showBounds ? 8 : 6)} className="px-4 py-6 text-center text-sm text-slate-400">
                  暂无{title}，点击"添加变量"开始
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LinearConstraintsSection({ linearConstraints, setLinearConstraints, intVars, boolVars }) {
  const allVars = [
    ...intVars.map(v => ({ id: v.id, name: v.name || v.nameEn || v.id, type: 'int' })),
    ...boolVars.map(v => ({ id: v.id, name: v.name || v.nameEn || v.id, type: 'bool' })),
  ];

  const addConstraint = () => {
    setLinearConstraints([...linearConstraints, {
      id: `lc-${Date.now()}`,
      name: '',
      terms: [{ varId: '', coefficient: 1 }],
      sense: '<=',
      rhs: 0,
    }]);
  };
  const removeConstraint = (id) => setLinearConstraints(linearConstraints.filter(c => c.id !== id));
  const updateConstraint = (id, key, value) => {
    setLinearConstraints(linearConstraints.map(c => c.id === id ? { ...c, [key]: value } : c));
  };
  const updateTerm = (constraintId, termIdx, key, value) => {
    setLinearConstraints(linearConstraints.map(c => {
      if (c.id !== constraintId) return c;
      const newTerms = [...c.terms];
      newTerms[termIdx] = { ...newTerms[termIdx], [key]: value };
      return { ...c, terms: newTerms };
    }));
  };
  const addTerm = (constraintId) => {
    setLinearConstraints(linearConstraints.map(c => {
      if (c.id !== constraintId) return c;
      return { ...c, terms: [...c.terms, { varId: '', coefficient: 1 }] };
    }));
  };
  const removeTerm = (constraintId, termIdx) => {
    setLinearConstraints(linearConstraints.map(c => {
      if (c.id !== constraintId) return c;
      const newTerms = c.terms.filter((_, i) => i !== termIdx);
      return { ...c, terms: newTerms.length > 0 ? newTerms : [{ varId: '', coefficient: 1 }] };
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">线性约束</h3>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1 text-xs font-medium flex items-center gap-1"
          onClick={addConstraint}
        >
          <Plus size={12} /> 添加约束
        </button>
      </div>
      <div className="p-4 space-y-3">
        {linearConstraints.map(c => (
          <div key={c.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <input
                className="border border-slate-200 rounded px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={c.name || ''}
                onChange={e => updateConstraint(c.id, 'name', e.target.value)}
                placeholder="约束名称"
                style={{ maxWidth: 180 }}
              />
              <button className="text-red-400 hover:text-red-600 p-0.5" onClick={() => removeConstraint(c.id)}>
                <Trash2 size={13} />
              </button>
            </div>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1.5">
              {c.terms.map((term, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  {idx > 0 && <span className="text-slate-400 font-medium text-xs">+</span>}
                  <input
                    type="number"
                    className="w-16 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    value={term.coefficient ?? 1}
                    onChange={e => updateTerm(c.id, idx, 'coefficient', parseFloat(e.target.value) || 0)}
                    placeholder="系数"
                  />
                  <span className="text-slate-500 text-xs">·</span>
                  <select
                    className="border border-slate-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={term.varId || ''}
                    onChange={e => updateTerm(c.id, idx, 'varId', e.target.value)}
                  >
                    <option value="">选择变量</option>
                    {allVars.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.type === 'int' ? '整数' : '布尔'})
                      </option>
                    ))}
                  </select>
                  {c.terms.length > 1 && (
                    <button className="text-red-400 hover:text-red-600" onClick={() => removeTerm(c.id, idx)}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
              <button
                className="text-blue-500 hover:text-blue-700 text-xs font-medium flex items-center gap-0.5"
                onClick={() => addTerm(c.id)}
              >
                <Plus size={11} /> 添加项
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
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
          </div>
        ))}
        {linearConstraints.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-4">
            暂无线性约束，点击"添加约束"开始
          </div>
        )}
      </div>
    </div>
  );
}

function GlobalConstraintsSection({ globalConstraints, setGlobalConstraints, intVars, boolVars, intervalVars }) {
  const allVars = [
    ...intVars.map(v => ({ id: v.id, name: v.name || v.nameEn || v.id, type: 'int' })),
    ...boolVars.map(v => ({ id: v.id, name: v.name || v.nameEn || v.id, type: 'bool' })),
    ...intervalVars.map(v => ({ id: v.id, name: v.name || v.nameEn || v.id, type: 'interval' })),
  ];

  const addGlobalConstraint = () => {
    setGlobalConstraints([...globalConstraints, {
      id: `gc-${Date.now()}`,
      name: '',
      type: 'AllDifferent',
      variableIds: [],
      capacity: null,
    }]);
  };
  const removeGlobalConstraint = (id) => setGlobalConstraints(globalConstraints.filter(c => c.id !== id));
  const updateGlobalConstraint = (id, key, value) => {
    setGlobalConstraints(globalConstraints.map(c => c.id === id ? { ...c, [key]: value } : c));
  };
  const toggleVarInConstraint = (constraintId, varId) => {
    setGlobalConstraints(globalConstraints.map(c => {
      if (c.id !== constraintId) return c;
      const currentIds = c.variableIds || [];
      const newIds = currentIds.includes(varId)
        ? currentIds.filter(id => id !== varId)
        : [...currentIds, varId];
      return { ...c, variableIds: newIds };
    }));
  };

  const getCompatibleVars = (constraintType) => {
    if (constraintType === 'NoOverlap') {
      return allVars.filter(v => v.type === 'interval');
    }
    if (constraintType === 'Cumulative') {
      return allVars;
    }
    return allVars.filter(v => v.type === 'int' || v.type === 'bool');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">全局约束</h3>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1 text-xs font-medium flex items-center gap-1"
          onClick={addGlobalConstraint}
        >
          <Plus size={12} /> 添加全局约束
        </button>
      </div>
      <div className="p-4 space-y-3">
        {globalConstraints.map(c => {
          const compatibleVars = getCompatibleVars(c.type);
          const constraintTypeDef = GLOBAL_CONSTRAINT_TYPES.find(t => t.value === c.type);
          return (
            <div key={c.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input
                    className="border border-slate-200 rounded px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={c.name || ''}
                    onChange={e => updateGlobalConstraint(c.id, 'name', e.target.value)}
                    placeholder="约束名称"
                    style={{ maxWidth: 160 }}
                  />
                  <select
                    className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={c.type}
                    onChange={e => updateGlobalConstraint(c.id, 'type', e.target.value)}
                  >
                    {GLOBAL_CONSTRAINT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <button className="text-red-400 hover:text-red-600 p-0.5" onClick={() => removeGlobalConstraint(c.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
              {constraintTypeDef && (
                <p className="text-xs text-slate-400 mb-2">{constraintTypeDef.desc}</p>
              )}
              <div className="mb-2">
                <p className="text-xs font-medium text-slate-500 mb-1">关联变量</p>
                <div className="flex flex-wrap gap-1.5">
                  {compatibleVars.length > 0 ? compatibleVars.map(v => {
                    const isSelected = (c.variableIds || []).includes(v.id);
                    return (
                      <button
                        key={v.id}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                        onClick={() => toggleVarInConstraint(c.id, v.id)}
                      >
                        {v.name}
                        <span className="ml-1 text-[10px] text-slate-400">({v.type === 'int' ? '整数' : v.type === 'bool' ? '布尔' : '区间'})</span>
                      </button>
                    );
                  }) : (
                    <span className="text-xs text-slate-400 italic">无兼容变量</span>
                  )}
                </div>
              </div>
              {c.type === 'Cumulative' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">容量 (capacity)</span>
                  <input
                    type="number"
                    className="w-20 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={c.capacity ?? ''}
                    onChange={e => updateGlobalConstraint(c.id, 'capacity', e.target.value === '' ? null : parseInt(e.target.value) || 0)}
                    placeholder="容量"
                  />
                </div>
              )}
            </div>
          );
        })}
        {globalConstraints.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-4">
            暂无全局约束，点击"添加全局约束"开始
          </div>
        )}
      </div>
    </div>
  );
}

function ObjectiveSection({ objective, setObjective, intVars, boolVars }) {
  const allVars = [
    ...intVars.map(v => ({ id: v.id, name: v.name || v.nameEn || v.id, type: 'int' })),
    ...boolVars.map(v => ({ id: v.id, name: v.name || v.nameEn || v.id, type: 'bool' })),
  ];

  const updateCoefficient = (varId, value) => {
    setObjective({
      ...objective,
      coefficients: {
        ...objective.coefficients,
        [varId]: parseFloat(value) || 0,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">目标函数</h3>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <select
            className="border border-slate-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={objective?.sense || 'minimize'}
            onChange={e => setObjective({ ...objective, sense: e.target.value })}
          >
            <option value="minimize">最小化</option>
            <option value="maximize">最大化</option>
          </select>
          <span className="text-xs text-slate-400">选择变量并配置系数</span>
        </div>
        {allVars.length > 0 ? (
          <div className="flex flex-wrap gap-x-2 gap-y-1.5">
            {allVars.map((v, idx) => (
              <div key={v.id} className="flex items-center gap-1">
                {idx > 0 && <span className="text-slate-400 font-medium text-xs">+</span>}
                <input
                  type="number"
                  className="w-16 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                  value={objective?.coefficients?.[v.id] ?? 0}
                  onChange={e => updateCoefficient(v.id, e.target.value)}
                  placeholder="系数"
                />
                <span className="text-slate-500 text-xs">·</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  v.type === 'int' ? 'bg-orange-100 text-orange-700' : 'bg-pink-100 text-pink-700'
                }`}>
                  {v.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 py-2">请先添加变量</div>
        )}
      </div>
    </div>
  );
}

export default function CPSatConfigPanel({
  intVars, setIntVars,
  boolVars, setBoolVars,
  intervalVars, setIntervalVars,
  linearConstraints, setLinearConstraints,
  globalConstraints, setGlobalConstraints,
  objective, setObjective,
}) {
  return (
    <div className="space-y-6">
      <VariableTable
        title="整数变量"
        icon={Variable}
        color="text-orange-500"
        vars={intVars}
        setVars={setIntVars}
        type="int"
        showType={false}
        showBounds={true}
        showDimension={true}
      />
      <VariableTable
        title="布尔变量"
        icon={ToggleLeft}
        color="text-pink-500"
        vars={boolVars}
        setVars={setBoolVars}
        type="bool"
        showType={false}
        showBounds={false}
        showDimension={true}
      />
      <VariableTable
        title="区间变量"
        icon={Timer}
        color="text-violet-500"
        vars={intervalVars}
        setVars={setIntervalVars}
        type="interval"
        showType={false}
        showBounds={true}
        showDimension={false}
      />
      <ObjectiveSection objective={objective} setObjective={setObjective} intVars={intVars} boolVars={boolVars} />
      <LinearConstraintsSection linearConstraints={linearConstraints} setLinearConstraints={setLinearConstraints} intVars={intVars} boolVars={boolVars} />
      <GlobalConstraintsSection globalConstraints={globalConstraints} setGlobalConstraints={setGlobalConstraints} intVars={intVars} boolVars={boolVars} intervalVars={intervalVars} />
    </div>
  );
}
