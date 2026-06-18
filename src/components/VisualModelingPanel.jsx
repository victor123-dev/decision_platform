import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Database, Variable, CheckCircle } from 'lucide-react';
import OntologyVariablePicker from './OntologyVariablePicker';
import VariableToken from './VariableToken';
import { normalizeCoefficient } from '../utils/variableUtils';

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

/** 判断系数是否为有意义的非零项（数值非零、或变量引用 $xxx） */
const isNonZeroCoeff = (c) => {
  if (c === 0 || c === '0' || c === null || c === undefined) return false;
  return true;
};

const PROBLEM_TYPE_OPTIONS = [
  { value: 'LP', label: 'LP', desc: '线性规划' },
  { value: 'IP', label: 'IP', desc: '整数规划' },
  { value: 'MIP', label: 'MIP', desc: '混合整数规划' },
];

/**
 * 优化类型选择器（可收缩）
 * 默认只显示标题和当前选中值，点击展开查看所有选项
 */
function ProblemTypeSelector({ problemType, setProblemType }) {
  const [expanded, setExpanded] = useState(false);
  const current = PROBLEM_TYPE_OPTIONS.find(o => o.value === problemType) || PROBLEM_TYPE_OPTIONS[0];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">优化类型</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
            {current.label}
            <span className="ml-1 text-blue-500 font-normal">{current.desc}</span>
          </span>
        </div>
        <ChevronRight
          size={14}
          className="text-slate-400 transition-transform duration-150"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
      </button>
      {expanded && (
        <div className="px-4 pb-3 flex items-center gap-5 border-t border-slate-100 pt-2.5">
          {PROBLEM_TYPE_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
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
      )}
    </div>
  );
}

/**
 * 可视化建模面板
 *
 * @param {Array} variables - 当前变量列表
 * @param {function} setVariables - 更新变量
 * @param {Array} objectives - 目标函数列表
 * @param {function} setObjectives - 更新目标函数列表
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
  objectives,
  setObjectives,
  constraints,
  setConstraints,
  problemType,
  setProblemType,
  ontologies,
  selectedOntologyId,
}) {
  const [showOntologyPicker, setShowOntologyPicker] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [objTermPickerOpen, setObjTermPickerOpen] = useState(null); // objective id whose picker is open
  const [constraintAddOpen, setConstraintAddOpen] = useState(null); // constraint id whose dropdown is open

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
    setShowOntologyPicker(false);
    setAddMenuOpen(false);
  };

  const handleAddCustomVariable = () => {
    const newVar = {
      id: `v-${Date.now()}`,
      name: '',
      nameEn: '',
      source: 'custom',
      type: 'continuous',
      lowerBound: 0,
      upperBound: null,
      description: '',
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

  /** 将已有的零系数变量添加到指定目标函数中（系数设为 1） */
  const handleAddObjectiveTerm = (objId, varId) => {
    setObjectives(objectives.map(o =>
      o.id === objId ? { ...o, coefficients: { ...o.coefficients, [varId]: 1 } } : o
    ));
    setObjTermPickerOpen(null);
  };

  /** 新建自定义变量并加入指定目标函数 */
  const handleAddCustomVariableToObjective = (objId) => {
    const newVar = {
      id: `v-${Date.now()}`,
      name: '',
      nameEn: '',
      source: 'custom',
      type: 'continuous',
      lowerBound: 0,
      upperBound: null,
      description: '',
    };
    setVariables([...variables, newVar]);
    setObjectives(objectives.map(o =>
      o.id === objId ? { ...o, coefficients: { ...o.coefficients, [newVar.id]: 1 } } : o
    ));
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
    <div className="p-6 space-y-6">
      {/* ── 区域1：优化类型选择（可收缩） ── */}
      <ProblemTypeSelector problemType={problemType} setProblemType={setProblemType} />

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
                        <div className="border-t border-slate-100" />
                        <button
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          onClick={() => {
                            handleAddCustomVariableToObjective(obj.id);
                            setObjTermPickerOpen(null);
                          }}
                        >
                          <Variable size={12} className="text-slate-400" />
                          新建自定义变量
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          onClick={() => {
                            setShowOntologyPicker(true);
                            setObjTermPickerOpen(null);
                          }}
                        >
                          <Database size={12} className="text-blue-500" />
                          从本体选择
                        </button>
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
                        <VariableToken variable={v} className="text-xs" />
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
              暂无目标函数，点击“添加目标函数”开始
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
                          <VariableToken variable={v} className="text-xs" />
                          <input
                            type="text"
                            className="w-20 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={c.coefficients?.[v.id] ?? 0}
                            onChange={e => updateConstraintCoefficient(c.id, v.id, e.target.value)}
                            placeholder="0"
                            title="支持输入数字或 $变量名 占位符"
                          />
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
              {variables.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 border-b border-slate-100">
                  <td className="px-4 py-2">
                    <input
                      className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!v.name ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                      value={v.name}
                      onChange={e => updateVariable(v.id, 'name', e.target.value)}
                      placeholder="中文名称（必填）"
                      required
                    />
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
                    {v.source === 'ontology' || v.ontologyRef ? (
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
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                    暂无变量，点击"添加变量"开始
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
