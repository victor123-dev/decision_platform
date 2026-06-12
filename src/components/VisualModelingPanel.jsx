import { useState } from 'react';
import { Plus, Trash2, ChevronDown, Database, Variable } from 'lucide-react';
import OntologyVariablePicker from './OntologyVariablePicker';

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

/**
 * 可视化建模面板
 *
 * @param {Array} variables - 当前变量列表
 * @param {function} setVariables - 更新变量
 * @param {object} objective - 目标函数
 * @param {function} setObjective - 更新目标函数
 * @param {Array} constraints - 约束条件
 * @param {function} setConstraints - 更新约束
 * @param {string} problemType - LP/MIP/IP
 * @param {function} setProblemType - 更新问题类型
 * @param {Array} ontologies - 本体数据
 * @param {string} selectedOntologyId - 关联本体ID
 */
export default function VisualModelingPanel({
  variables,
  setVariables,
  objective,
  setObjective,
  constraints,
  setConstraints,
  problemType,
  setProblemType,
  ontologies,
  selectedOntologyId,
}) {
  const [showOntologyPicker, setShowOntologyPicker] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

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
    setObjective({
      ...objective,
      coefficients: { ...objective.coefficients, [newVar.id]: 0 },
    });
    // 同时为每个约束添加默认系数0
    setConstraints(
      constraints.map(c => ({
        ...c,
        coefficients: { ...c.coefficients, [newVar.id]: 0 },
      }))
    );
    setShowOntologyPicker(false);
    setAddMenuOpen(false);
  };

  const handleAddCustomVariable = () => {
    const newVar = {
      id: `v-${Date.now()}`,
      name: '',
      source: 'custom',
      type: 'continuous',
      lowerBound: 0,
      upperBound: null,
      description: '',
    };
    setVariables([...variables, newVar]);
    setObjective({
      ...objective,
      coefficients: { ...objective.coefficients, [newVar.id]: 0 },
    });
    setConstraints(
      constraints.map(c => ({
        ...c,
        coefficients: { ...c.coefficients, [newVar.id]: 0 },
      }))
    );
    setAddMenuOpen(false);
  };

  const handleDeleteVariable = (varId) => {
    setVariables(variables.filter(v => v.id !== varId));
    // 从目标函数中移除
    const newCoeffs = { ...objective.coefficients };
    delete newCoeffs[varId];
    setObjective({ ...objective, coefficients: newCoeffs });
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

  /* ─── 约束操作 ─── */

  const handleAddConstraint = () => {
    const newConstraint = {
      id: `c-${Date.now()}`,
      name: '',
      coefficients: {},
      sense: '<=',
      rhs: 0,
    };
    // 为现有变量初始化系数
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
          ? { ...c, coefficients: { ...c.coefficients, [varId]: parseFloat(value) || 0 } }
          : c
      )
    );
  };

  const updateObjectiveCoefficient = (varId, value) => {
    setObjective({
      ...objective,
      coefficients: { ...objective.coefficients, [varId]: parseFloat(value) || 0 },
    });
  };

  /* ─── 渲染 ─── */

  return (
    <div className="p-6 space-y-6">
      {/* ── 区域1：问题类型选择 ── */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">问题类型</h3>
        <div className="flex items-center gap-6">
          {[
            { value: 'LP', label: 'LP', desc: '线性规划' },
            { value: 'MIP', label: 'MIP', desc: '混合整数规划' },
            { value: 'IP', label: 'IP', desc: '整数规划' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="problemType"
                value={opt.value}
                checked={problemType === opt.value}
                onChange={e => setProblemType(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">{opt.label}</span>
              <span className="text-xs text-slate-400">({opt.desc})</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── 区域2：决策变量管理 ── */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Variable size={15} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">决策变量</h3>
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
                    setShowOntologyPicker(!showOntologyPicker);
                    setAddMenuOpen(false);
                  }}
                >
                  <Database size={13} className="text-blue-500" />
                  从本体选择
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

        {/* 本体选择器面板 */}
        {showOntologyPicker && (
          <div className="border-b border-slate-200">
            <div className="flex items-center justify-between px-5 py-2 bg-blue-50">
              <span className="text-xs font-medium text-blue-700">选择本体属性添加为变量</span>
              <button
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={() => setShowOntologyPicker(false)}
              >
                收起
              </button>
            </div>
            <OntologyVariablePicker
              onSelect={handleAddFromOntology}
              selectedOntologyId={selectedOntologyId}
              className="border-0 shadow-none rounded-none max-h-[260px]"
            />
          </div>
        )}

        {/* 变量表格 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5">名称</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5">来源</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5">类型</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5">下界</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5">上界</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5 w-16">操作</th>
              </tr>
            </thead>
            <tbody>
              {variables.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 border-b border-slate-100">
                  <td className="px-4 py-2">
                    <input
                      className="w-full border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={v.name}
                      onChange={e => updateVariable(v.id, 'name', e.target.value)}
                      placeholder="变量名称"
                    />
                  </td>
                  <td className="px-4 py-2">
                    {v.source === 'ontology' ? (
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
              ))}
              {variables.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    暂无变量，点击"添加变量"开始
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 区域3：目标函数 ── */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-slate-700">目标函数</h3>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <select
            className="border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={objective?.sense || 'maximize'}
            onChange={e => setObjective({ ...objective, sense: e.target.value })}
          >
            <option value="maximize">最大化 (maximize)</option>
            <option value="minimize">最小化 (minimize)</option>
          </select>
          <span className="text-xs text-slate-400">
            设置每个变量在目标函数中的系数
          </span>
        </div>

        {variables.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">变量</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">类型</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-2">系数</th>
                </tr>
              </thead>
              <tbody>
                {variables.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50 border-b border-slate-100">
                    <td className="px-4 py-2 text-sm text-slate-700 font-medium">{v.name || v.id}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${VAR_TYPE_BADGE[v.type] || VAR_TYPE_BADGE.continuous}`}>
                        {VAR_TYPE_LABEL[v.type] || v.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="w-28 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={objective?.coefficients?.[v.id] ?? 0}
                        onChange={e => updateObjectiveCoefficient(v.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-sm text-slate-400 py-4">请先添加决策变量</div>
        )}
      </div>

      {/* ── 区域4：约束条件 ── */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">约束条件</h3>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1"
            onClick={handleAddConstraint}
          >
            <Plus size={12} /> 添加约束
          </button>
        </div>

        <div className="p-5 space-y-4">
          {constraints.map(c => (
            <div
              key={c.id}
              className="border border-slate-200 rounded-lg p-4 bg-slate-50/50"
            >
              <div className="flex items-center justify-between mb-3">
                <input
                  className="border border-slate-200 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={c.name || ''}
                  onChange={e => updateConstraint(c.id, 'name', e.target.value)}
                  placeholder="约束名称"
                  style={{ maxWidth: 200 }}
                />
                <button
                  className="text-red-500 hover:text-red-700 p-1"
                  onClick={() => handleDeleteConstraint(c.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* 系数行 */}
              {variables.length > 0 && (
                <div className="mb-3">
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(140px, 1fr))` }}>
                    {variables.map(v => (
                      <div key={v.id} className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500 truncate w-16 flex-shrink-0" title={v.name || v.id}>
                          {v.name || v.id}
                        </span>
                        <input
                          type="number"
                          className="flex-1 min-w-0 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={c.coefficients?.[v.id] ?? 0}
                          onChange={e => updateConstraintCoefficient(c.id, v.id, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* sense + RHS */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">结果</span>
                <select
                  className="border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={c.sense || '<='}
                  onChange={e => updateConstraint(c.id, 'sense', e.target.value)}
                >
                  {SENSE_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label} ({s.value})</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="w-28 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={c.rhs ?? 0}
                  onChange={e => updateConstraint(c.id, 'rhs', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          ))}

          {constraints.length === 0 && (
            <div className="text-center text-sm text-slate-400 py-6">
              暂无约束条件，点击"添加约束"开始
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
