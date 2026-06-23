import { useState } from 'react';
import { ChevronRight, Zap } from 'lucide-react';

const SOLVING_STRATEGIES = [
  { value: 'exact', label: '精确求解', desc: 'CP-SAT', detail: '保证全局最优，小规模问题首选', colorClass: 'bg-emerald-100 text-emerald-700', descColorClass: 'text-emerald-500' },
  { value: 'sa', label: '模拟退火', desc: 'SA', detail: '大规模调度/组合问题，接近最优', colorClass: 'bg-orange-100 text-orange-700', descColorClass: 'text-orange-500' },
  { value: 'ga', label: '遗传算法', desc: 'GA', detail: '多目标优化、复杂组合问题', colorClass: 'bg-purple-100 text-purple-700', descColorClass: 'text-purple-500' },
  { value: 'ts', label: '禁忌搜索', desc: 'TS', detail: '调度/分配问题，快速收敛', colorClass: 'bg-blue-100 text-blue-700', descColorClass: 'text-blue-500' },
];

/**
 * 求解策略选择器（可收缩）
 * 默认只显示标题和当前选中值，点击展开查看所有选项
 */
export default function SolvingStrategySelector({ solvingStrategy, setSolvingStrategy }) {
  const [expanded, setExpanded] = useState(false);
  const current = SOLVING_STRATEGIES.find(o => o.value === solvingStrategy) || SOLVING_STRATEGIES[0];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">求解策略</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${current.colorClass}`}>
            {current.label}
            <span className={`ml-1 font-normal ${current.descColorClass}`}>{current.desc}</span>
          </span>
        </div>
        <ChevronRight
          size={14}
          className="text-slate-400 transition-transform duration-150"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
      </button>
      {expanded && (
        <div className="px-4 pb-3 border-t border-slate-100 pt-2.5">
          <div className="space-y-2">
            {SOLVING_STRATEGIES.map(opt => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer border ${
                  solvingStrategy === opt.value
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="solvingStrategy"
                  value={opt.value}
                  checked={solvingStrategy === opt.value}
                  onChange={e => setSolvingStrategy(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                  <span className="text-xs text-slate-500 ml-1">— {opt.desc}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{opt.detail}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
