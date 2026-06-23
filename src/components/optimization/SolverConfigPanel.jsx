import { useState } from 'react';
import { Settings } from 'lucide-react';

const CP_SAT_SEARCH_STRATEGIES = [
  { value: 'automatic', label: '自动' },
  { value: 'fixed', label: '固定顺序' },
  { value: 'choose_first', label: '优先选择' },
];

/* 各启发式策略的参数定义 */
const STRATEGY_PARAMS = {
  sa: [
    { key: 'saInitialTemp', label: '初始温度', default: 1000, isFloat: false },
    { key: 'saCoolingRate', label: '冷却系数', default: 0.995, isFloat: true },
    { key: 'saMinTemp', label: '最低温度', default: 0.01, isFloat: true },
    { key: 'saMaxIterations', label: '最大迭代次数', default: 10000, isFloat: false },
  ],
  ga: [
    { key: 'gaPopulationSize', label: '种群大小', default: 100, isFloat: false },
    { key: 'gaGenerations', label: '进化代数', default: 200, isFloat: false },
    { key: 'gaCrossoverProb', label: '交叉概率', default: 0.9, isFloat: true },
    { key: 'gaMutationProb', label: '变异概率', default: 0.1, isFloat: true },
  ],
  ts: [
    { key: 'tsTabuLength', label: '禁忌长度', default: 7, isFloat: false },
    { key: 'tsMaxIterations', label: '最大迭代次数', default: 5000, isFloat: false },
    { key: 'tsNeighborhoodSize', label: '邻域大小', default: 20, isFloat: false },
  ],
};

/* 折叠摘要文本 */
function getCpSatSummary(solvingStrategy, cfg) {
  switch (solvingStrategy) {
    case 'sa':
      return `初始温度 ${cfg?.saInitialTemp ?? 1000} / 迭代 ${cfg?.saMaxIterations ?? 10000}`;
    case 'ga':
      return `种群 ${cfg?.gaPopulationSize ?? 100} / 代数 ${cfg?.gaGenerations ?? 200}`;
    case 'ts':
      return `禁忌长度 ${cfg?.tsTabuLength ?? 7} / 迭代 ${cfg?.tsMaxIterations ?? 5000}`;
    default:
      return `${cfg?.numWorkers ?? 4} 线程 / ${cfg?.timeLimitSeconds ?? 60}s`;
  }
}

/**
 * 求解器参数配置面板
 * 根据 problemType 显示不同的参数选项
 * CP-SAT 模式下根据 solvingStrategy 显示不同算法参数
 */
export default function SolverConfigPanel({ problemType, solverConfig, setSolverConfig, solvingStrategy = 'exact' }) {
  const [expanded, setExpanded] = useState(false);

  const updateConfig = (key, value) => {
    setSolverConfig({ ...solverConfig, [key]: value });
  };

  const isCpSat = problemType === 'CP_SAT';
  const strategy = solvingStrategy || 'exact';
  const strategyParams = STRATEGY_PARAMS[strategy];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">求解器参数</span>
          {!expanded && (
            <span className="text-xs text-slate-400">
              {isCpSat
                ? getCpSatSummary(strategy, solverConfig)
                : `${solverConfig?.timeLimitSeconds ?? 60}s${problemType === 'MIP' ? ` / Gap ${solverConfig?.mipGap ?? 0.001}` : ''}`
              }
            </span>
          )}
        </div>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
          {isCpSat ? (
            <>
              {/* CP-SAT 精确求解参数 */}
              {strategy === 'exact' && (
                <>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-slate-600 w-24 flex-shrink-0">时间限制 (秒)</label>
                    <input
                      type="number"
                      min={1}
                      className="w-24 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={solverConfig?.timeLimitSeconds ?? 60}
                      onChange={e => updateConfig('timeLimitSeconds', parseInt(e.target.value) || 60)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-slate-600 w-24 flex-shrink-0">并行线程数</label>
                    <input
                      type="number"
                      min={1}
                      max={64}
                      className="w-24 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={solverConfig?.numWorkers ?? 4}
                      onChange={e => updateConfig('numWorkers', parseInt(e.target.value) || 4)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-slate-600 w-24 flex-shrink-0">搜索策略</label>
                    <select
                      className="border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={solverConfig?.searchStrategy || 'automatic'}
                      onChange={e => updateConfig('searchStrategy', e.target.value)}
                    >
                      {CP_SAT_SEARCH_STRATEGIES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-slate-600 w-24 flex-shrink-0">解数量限制</label>
                    <input
                      type="number"
                      min={1}
                      className="w-24 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={solverConfig?.solutionCount ?? 1}
                      onChange={e => updateConfig('solutionCount', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </>
              )}

              {/* 启发式算法参数（SA / GA / TS） */}
              {strategyParams && strategyParams.map(param => (
                <div key={param.key} className="flex items-center gap-3">
                  <label className="text-xs font-medium text-slate-600 w-24 flex-shrink-0">{param.label}</label>
                  <input
                    type="number"
                    min={0}
                    step={param.isFloat ? 0.001 : 1}
                    className="w-24 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={solverConfig?.[param.key] ?? param.default}
                    onChange={e => updateConfig(param.key, param.isFloat ? (parseFloat(e.target.value) || param.default) : (parseInt(e.target.value) || param.default))}
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              {/* LP/MIP 参数 */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-600 w-24 flex-shrink-0">时间限制 (秒)</label>
                <input
                  type="number"
                  min={1}
                  className="w-24 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={solverConfig?.timeLimitSeconds ?? 60}
                  onChange={e => updateConfig('timeLimitSeconds', parseInt(e.target.value) || 60)}
                />
              </div>
              {(problemType === 'MIP' || problemType === 'IP') && (
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-slate-600 w-24 flex-shrink-0">MIP Gap</label>
                  <input
                    type="number"
                    min={0}
                    step={0.001}
                    className="w-24 border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={solverConfig?.mipGap ?? 0.001}
                    onChange={e => updateConfig('mipGap', parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
