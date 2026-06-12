import { useMemo } from 'react';
import { CheckCircle, AlertCircle, Variable, Target, Shield } from 'lucide-react';

/* ─── Helpers ─── */

/** 构建变量名映射: varId → name */
function buildVarNameMap(variables) {
  const map = {};
  (variables || []).forEach(v => { map[v.id] = v.name || v.id; });
  return map;
}

/** 将系数对象格式化为数学表达式 */
function formatExpression(coefficients, varNameMap) {
  if (!coefficients) return '';
  const entries = Object.entries(coefficients).filter(([, c]) => c !== 0);
  if (entries.length === 0) return '0';

  return entries.map(([varId, coeff], idx) => {
    const name = varNameMap[varId] || varId;
    if (idx === 0) {
      // 第一项
      if (coeff === 1) return name;
      if (coeff === -1) return `-${name}`;
      return `${coeff}·${name}`;
    }
    // 后续项
    if (coeff > 0) {
      if (coeff === 1) return ` + ${name}`;
      return ` + ${coeff}·${name}`;
    }
    if (coeff < 0) {
      const abs = Math.abs(coeff);
      if (abs === 1) return ` - ${name}`;
      return ` - ${abs}·${name}`;
    }
    return '';
  }).join('');
}

/** 约束 sense 映射为数学符号 */
const SENSE_SYMBOL = {
  '<=': '≤',
  '>=': '≥',
  '==': '=',
};

/** 问题类型 badge 样式 */
const PROBLEM_TYPE_STYLE = {
  LP: 'bg-emerald-100 text-emerald-700',
  MIP: 'bg-amber-100 text-amber-700',
  IP: 'bg-purple-100 text-purple-700',
};

/** 变量类型 badge 样式 */
const VAR_TYPE_STYLE = {
  continuous: 'bg-sky-100 text-sky-700',
  integer: 'bg-orange-100 text-orange-700',
  binary: 'bg-pink-100 text-pink-700',
};

const VAR_TYPE_LABEL = {
  continuous: '连续',
  integer: '整数',
  binary: '0-1',
};

/* ─── Card 1: 数学模型表达式 ─── */

function MathExpressionCard({ variables, objective, constraints, problemType }) {
  const varNameMap = useMemo(() => buildVarNameMap(variables), [variables]);
  const senseLabel = objective?.sense === 'maximize' ? 'max' : 'min';
  const objExpr = useMemo(
    () => formatExpression(objective?.coefficients, varNameMap),
    [objective, varNameMap]
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden h-full flex flex-col">
      {/* 卡片头 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Target size={15} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">数学模型</span>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${PROBLEM_TYPE_STYLE[problemType] || 'bg-slate-100 text-slate-600'}`}>
          {problemType || 'LP'}
        </span>
      </div>

      {/* 表达式区域 - 深色终端风格 */}
      <div className="bg-slate-900 text-green-400 font-mono text-xs leading-6 p-4 overflow-y-auto overflow-x-auto flex-1">
        {/* 目标函数 */}
        <div>
          <span className="text-emerald-300">{senseLabel}</span>{' '}
          <span className="text-yellow-400">z</span>{' '}
          <span className="text-slate-400">=</span>{' '}
          {objExpr || <span className="text-slate-500 italic">未定义</span>}
        </div>

        {/* s.t. */}
        {(constraints || []).length > 0 && (
          <div className="text-emerald-300 mt-2">s.t.</div>
        )}

        {/* 约束条件 */}
        {(constraints || []).map((c, idx) => {
          const expr = formatExpression(c.coefficients, varNameMap);
          const symbol = SENSE_SYMBOL[c.sense] || c.sense;
          return (
            <div key={c.id || idx} className="ml-3">
              <span className="text-blue-400">{c.name}:</span>{' '}
              <span className="text-green-300">{expr || <span className="text-slate-500 italic">空</span>}</span>
              {' '}
              <span className="text-yellow-400">{symbol}</span>{' '}
              <span className="text-purple-400">{c.rhs}</span>
            </div>
          );
        })}

        {/* 变量类型说明 */}
        {(variables || []).length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-700">
            <div className="text-emerald-300 text-[10px] mb-2">where</div>
            <div className="flex flex-wrap gap-2">
              {variables.map(v => (
                <span key={v.id} className="text-[10px]">
                  <span className="text-green-300">{v.name}</span>
                  <span className="text-slate-400"> ∈ </span>
                  <span className={v.type === 'integer' ? 'text-orange-400' : 'text-cyan-400'}>
                    {v.type === 'integer' ? 'ℤ' : 'ℝ'}
                    {v.lowerBound !== undefined && v.lowerBound !== null && (
                      <span className="text-slate-400">₊</span>
                    )}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {(!objective?.coefficients || Object.keys(objective.coefficients).length === 0) &&
          (!constraints || constraints.length === 0) && (
          <div className="text-slate-500 italic text-center py-4">
            暂无模型定义
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Card 2: 变量映射表 ─── */

function VariableMappingCard({ variables }) {
  const vars = variables || [];

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
      {/* 卡片头 */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Variable size={15} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">变量映射</span>
        </div>
        <span className="text-xs text-slate-400">{vars.length} 个变量</span>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto overflow-y-auto max-h-[300px]">
        {vars.length > 0 ? (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-slate-50 text-slate-500">
                <th className="text-left font-medium px-4 py-2 sticky left-0 bg-slate-50">变量名</th>
                <th className="text-left font-medium px-4 py-2">来源</th>
                <th className="text-left font-medium px-4 py-2">类型</th>
                <th className="text-left font-medium px-4 py-2">范围</th>
              </tr>
            </thead>
            <tbody>
              {vars.map(v => (
                <tr key={v.id} className="border-t border-slate-50 hover:bg-slate-25">
                  <td className="px-4 py-2 font-medium text-slate-700 sticky left-0 bg-white">{v.name || v.id}</td>
                  <td className="px-4 py-2">
                    {v.ontologyRef ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                        本体:{v.ontologyRef}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        自定义
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${VAR_TYPE_STYLE[v.type] || VAR_TYPE_STYLE.continuous}`}>
                      {VAR_TYPE_LABEL[v.type] || v.type || '连续'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-500 whitespace-nowrap">
                    [{v.lowerBound ?? '-∞'}, {v.upperBound ?? '+∞'}]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-xs text-slate-400 py-6">暂无变量</div>
        )}
      </div>
    </div>
  );
}

/* ─── Card 3: 模型验证 ─── */

function ValidationCard({ variables, objective, constraints }) {
  const varIdSet = useMemo(() => {
    const set = new Set();
    (variables || []).forEach(v => set.add(v.id));
    return set;
  }, [variables]);

  const checks = useMemo(() => {
    const hasVariables = (variables || []).length > 0;
    const hasObjective = objective?.coefficients &&
      Object.values(objective.coefficients).some(c => c !== 0);
    const hasConstraints = (constraints || []).length > 0;

    // 检查约束中引用的变量是否都已定义
    let allVarsDefined = true;
    const undefinedVarIds = new Set();
    (constraints || []).forEach(c => {
      if (c.coefficients) {
        Object.keys(c.coefficients).forEach(varId => {
          if (!varIdSet.has(varId)) {
            allVarsDefined = false;
            undefinedVarIds.add(varId);
          }
        });
      }
    });

    return [
      { label: '至少有1个决策变量', passed: hasVariables },
      { label: '目标函数已定义（至少1个非零系数）', passed: !!hasObjective },
      { label: '至少有1个约束条件', passed: hasConstraints },
      { label: '约束中引用的变量都已定义', passed: allVarsDefined },
    ];
  }, [variables, objective, constraints, varIdSet]);

  const allPassed = checks.every(c => c.passed);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* 卡片头 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Shield size={15} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">验证状态</span>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${allPassed ? 'text-emerald-600' : 'text-amber-600'}`}>
          {allPassed ? (
            <><CheckCircle size={13} /> 模型有效</>
          ) : (
            <><AlertCircle size={13} /> 模型不完整</>
          )}
        </span>
      </div>

      {/* 验证规则列表 */}
      <div className="px-4 py-3 space-y-2">
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            {check.passed ? (
              <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
            )}
            <span className={check.passed ? 'text-slate-600' : 'text-slate-500'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

/**
 * @param {Array} variables - 决策变量列表
 *   每项: { id, name, source, ontologyRef?, type, lowerBound, upperBound }
 * @param {object} objective - 目标函数 { sense: 'maximize'|'minimize', coefficients: { varId: number } }
 * @param {Array} constraints - 约束条件列表
 *   每项: { id, name, coefficients: { varId: number }, sense: '<='|'>='|'==', rhs: number }
 * @param {string} problemType - 'LP'|'MIP'|'IP'
 */
export default function MathPreviewPanel({ variables, objective, constraints, problemType }) {
  return (
    <div className="flex flex-col h-full p-3 bg-slate-50 gap-4">
      {/* 数学模型卡片 - 占据剩余全部可用高度 */}
      <div className="flex-1 min-h-0">
        <MathExpressionCard
          variables={variables}
          objective={objective}
          constraints={constraints}
          problemType={problemType}
        />
      </div>
      
      {/* 验证状态卡片 - 固定在底部 */}
      <div className="flex-shrink-0">
        <ValidationCard
          variables={variables}
          objective={objective}
          constraints={constraints}
        />
      </div>
    </div>
  );
}
