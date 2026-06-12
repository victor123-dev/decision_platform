import { X, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const STATUS_STYLE = {
  optimal: { bg: 'bg-green-100', text: 'text-green-700', label: '最优解', icon: CheckCircle },
  infeasible: { bg: 'bg-red-100', text: 'text-red-700', label: '无解', icon: XCircle },
  unbounded: { bg: 'bg-orange-100', text: 'text-orange-700', label: '无界', icon: TrendingUp },
  unknown: { bg: 'bg-gray-100', text: 'text-gray-700', label: '未知', icon: XCircle },
};

export default function SolveResultPanel({ result, onClose }) {
  if (!result) return null;

  const statusStyle = STATUS_STYLE[result.status] || STATUS_STYLE.unknown;
  const StatusIcon = statusStyle.icon;
  const isOptimal = result.status === 'optimal';

  const calculateConstraintSatisfaction = () => {
    if (!isOptimal || !result.constraints || !result.solution) return [];
    
    return result.constraints.map((c, index) => {
      let lhs = 0;
      for (const [varId, coeff] of Object.entries(c.coefficients)) {
        const varName = result.variables.find(v => v.id === varId)?.name || varId;
        lhs += coeff * (result.solution[varName] || 0);
      }
      
      let satisfied = true;
      let margin = 0;
      if (c.sense === '<=') {
        satisfied = lhs <= c.rhs + 0.0001;
        margin = c.rhs - lhs;
      } else if (c.sense === '>=') {
        satisfied = lhs >= c.rhs - 0.0001;
        margin = lhs - c.rhs;
      } else if (c.sense === '==') {
        satisfied = Math.abs(lhs - c.rhs) <= 0.0001;
        margin = Math.abs(lhs - c.rhs);
      }
      
      return {
        name: c.name,
        expression: `${lhs.toFixed(4)} ${c.sense} ${c.rhs}`,
        satisfied,
        margin: margin.toFixed(4),
        slack: c.sense === '<=' ? Math.max(0, c.rhs - lhs).toFixed(4) : 'N/A',
      };
    });
  };

  const constraintResults = calculateConstraintSatisfaction();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">求解结果</h2>
              <p className="text-blue-100 text-sm">HiGHS求解器运算结果</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Card */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`${statusStyle.bg} rounded-lg p-4 text-center`}>
              <StatusIcon size={28} className={`mx-auto mb-2 ${statusStyle.text}`} />
              <div className={`font-semibold ${statusStyle.text}`}>{statusStyle.label}</div>
              <div className="text-xs text-gray-500 mt-1">求解状态</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">目标函数值</div>
              <div className="text-2xl font-bold text-emerald-600">
                {isOptimal ? result.objective_value?.toFixed(4) : '-'}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {result.objective?.sense === 'maximize' ? (
                  <TrendingUp size={14} className="text-emerald-500" />
                ) : (
                  <TrendingDown size={14} className="text-blue-500" />
                )}
                <span className="text-xs text-gray-500">
                  {result.objective?.sense === 'maximize' ? '最大化' : '最小化'}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <Clock size={12} />
                求解时间
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {result.solve_time?.toFixed(4)}s
              </div>
              <div className="text-xs text-gray-500 mt-1">
                迭代次数: {result.iterations || '-'}
              </div>
            </div>
          </div>

          {/* Solution Variables */}
          {isOptimal && result.solution && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">决策变量取值</h3>
                <p className="text-sm text-gray-500">最优解对应的各变量取值</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(result.solution).map(([name, value]) => (
                    <div
                      key={name}
                      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100"
                    >
                      <div className="text-xs text-amber-600 font-medium mb-1">{name}</div>
                      <div className="text-xl font-bold text-amber-700">
                        {typeof value === 'number' ? value.toFixed(4) : value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Constraint Satisfaction */}
          {isOptimal && constraintResults.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">约束条件满足情况</h3>
                <p className="text-sm text-gray-500">各约束条件的实际取值与松弛变量</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">约束名称</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">表达式</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">满足</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">余量</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">松弛变量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {constraintResults.map((c, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{c.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{c.expression}</td>
                        <td className="px-4 py-3 text-center">
                          {c.satisfied ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <CheckCircle size={14} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <XCircle size={14} />
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600 font-mono">{c.margin}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600 font-mono">{c.slack}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Model Summary */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700">模型摘要</h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">模型ID</span>
                <span className="font-mono text-gray-700">{result.model_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">变量数量</span>
                <span className="font-mono text-gray-700">{result.variables?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">约束数量</span>
                <span className="font-mono text-gray-700">{result.constraints?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">问题类型</span>
                <span className="font-mono text-gray-700">{result.variables?.some(v => v.type === 'integer') ? 'MIP' : 'LP'}</span>
              </div>
            </div>
          </div>

          {/* Not Optimal Message */}
          {!isOptimal && (
            <div className={`${statusStyle.bg} rounded-lg p-4`}>
              <div className="flex items-center gap-3">
                <StatusIcon size={24} className={statusStyle.text} />
                <div>
                  <div className={`font-semibold ${statusStyle.text}`}>求解未获得最优解</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {result.status === 'infeasible' && '约束条件不可行，请检查约束定义。'}
                    {result.status === 'unbounded' && '目标函数无界，请添加约束条件限制。'}
                    {result.status === 'unknown' && '求解过程异常，请检查模型定义。'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-md px-4 py-2 text-sm font-medium"
          >
            关闭
          </button>
          {isOptimal && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium"
              onClick={onClose}
            >
              应用结果
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
