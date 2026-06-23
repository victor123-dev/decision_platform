import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const PROBLEM_TYPE_OPTIONS = [
  { value: 'LP', label: 'LP', desc: '线性规划', detail: '连续变量 + 线性约束', colorClass: 'bg-blue-100 text-blue-700', descColorClass: 'text-blue-500' },
  { value: 'MIP', label: 'MIP', desc: '混合整数规划', detail: '整数/0-1/连续变量 + 线性约束', colorClass: 'bg-blue-100 text-blue-700', descColorClass: 'text-blue-500' },
  { value: 'IP', label: 'IP', desc: '整数规划', detail: '整数/0-1变量 + 线性约束（兼容模式，等同 MIP）', colorClass: 'bg-blue-100 text-blue-700', descColorClass: 'text-blue-500' },
  { value: 'CP_SAT', label: 'CP-SAT', desc: '约束满足', detail: '整数/布尔/区间变量 + 全局约束', colorClass: 'bg-emerald-100 text-emerald-700', descColorClass: 'text-emerald-500' },
];

/**
 * 优化类型选择器（可收缩）
 * 默认只显示标题和当前选中值，点击展开查看所有选项
 */
export default function ProblemTypeSelector({ problemType, setProblemType }) {
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
            {PROBLEM_TYPE_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer border ${
                  problemType === opt.value
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="problemType"
                  value={opt.value}
                  checked={problemType === opt.value}
                  onChange={e => setProblemType(e.target.value)}
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
