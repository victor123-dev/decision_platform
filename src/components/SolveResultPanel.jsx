import { useState, useMemo, useCallback } from 'react';
import {
  X, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  BarChart3, Search, Copy, ChevronDown, ChevronUp, AlertTriangle,
  Info, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';

/* ══════════════════════════════════════════════
   状态配置
══════════════════════════════════════════════ */
const STATUS_CONFIG = {
  optimal: {
    bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700',
    bgSubtle: 'bg-emerald-50/70', dot: 'bg-emerald-500',
    label: '最优解', icon: CheckCircle,
    summaryBorder: 'border-l-emerald-400',
  },
  infeasible: {
    bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700',
    bgSubtle: 'bg-red-50/70', dot: 'bg-red-500',
    label: '无解', icon: XCircle,
    summaryBorder: 'border-l-red-400',
  },
  unbounded: {
    bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700',
    bgSubtle: 'bg-orange-50/70', dot: 'bg-orange-500',
    label: '无界', icon: TrendingUp,
    summaryBorder: 'border-l-orange-400',
  },
  unknown: {
    bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600',
    bgSubtle: 'bg-gray-50/70', dot: 'bg-gray-400',
    label: '未知', icon: AlertTriangle,
    summaryBorder: 'border-l-gray-400',
  },
};

const NOT_OPTIMAL_HINTS = {
  infeasible: {
    title: '约束条件不可行',
    desc: '当前约束条件之间存在矛盾，无法同时满足所有约束。请检查约束定义是否存在冲突。',
    actions: ['检查约束边界值', '确认变量范围设置', '尝试放宽部分约束'],
  },
  unbounded: {
    title: '目标函数无界',
    desc: '目标函数可以无限优化，缺少有效约束。请添加上界或下界约束来限制可行域。',
    actions: ['为决策变量添加边界', '检查目标函数方向', '添加资源约束'],
  },
  unknown: {
    title: '求解过程异常',
    desc: '求解器遇到未知错误，可能是模型定义有误或超出求解能力范围。',
    actions: ['检查模型定义完整性', '验证数据类型与范围', '尝试简化模型后再求解'],
  },
};

/* ══════════════════════════════════════════════
   子组件：内联复制按钮
══════════════════════════════════════════════ */
function InlineCopy({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(String(text)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 flex-shrink-0"
      title="复制"
    >
      {copied
        ? <CheckCircle size={11} className="text-emerald-500" />
        : <Copy size={11} />
      }
    </button>
  );
}

/* ══════════════════════════════════════════════
   子组件：排序指示
══════════════════════════════════════════════ */
function SortIcon({ field, sortBy, sortDir }) {
  if (sortBy !== field) return <ArrowUpDown size={11} className="text-gray-300 group-hover:text-gray-400" />;
  return sortDir === 'asc'
    ? <ArrowUp size={11} className="text-blue-600" />
    : <ArrowDown size={11} className="text-blue-600" />;
}

/* ══════════════════════════════════════════════
   主组件
══════════════════════════════════════════════ */
export default function SolveResultPanel({ result, onClose, onApply }) {
  const [varSearch, setVarSearch] = useState('');
  const [varFilter, setVarFilter] = useState('all');
  const [sortBy, setSortBy] = useState(null);   // 'nameEn' | 'value'
  const [sortDir, setSortDir] = useState('asc');
  const [constraintExpanded, setConstraintExpanded] = useState(true);
  const [modelExpanded, setModelExpanded] = useState(false);

  if (!result) return null;

  const statusConfig = STATUS_CONFIG[result.status] || STATUS_CONFIG.unknown;
  const StatusIcon = statusConfig.icon;
  const isOptimal = result.status === 'optimal';
  const primaryObj = result.objectives?.[0] || result.objective || {};
  const isMaximize = primaryObj.sense === 'maximize';

  /* ── 约束满足计算 ── */
  const constraintResults = useMemo(() => {
    if (!isOptimal || !result.constraints || !result.solution) return [];
    return result.constraints.map((c) => {
      let lhs = 0;
      for (const [varId, coeff] of Object.entries(c.coefficients)) {
        const varName = result.variables?.find(v => v.id === varId)?.name || varId;
        lhs += coeff * (result.solution[varName] || 0);
      }
      let satisfied = true, margin = 0;
      if (c.sense === '<=') { satisfied = lhs <= c.rhs + 0.0001; margin = c.rhs - lhs; }
      else if (c.sense === '>=') { satisfied = lhs >= c.rhs - 0.0001; margin = lhs - c.rhs; }
      else if (c.sense === '==') { satisfied = Math.abs(lhs - c.rhs) <= 0.0001; margin = Math.abs(lhs - c.rhs); }
      return {
        name: c.name,
        expression: `${lhs.toFixed(4)} ${c.sense} ${c.rhs}`,
        satisfied,
        margin: margin.toFixed(4),
        slack: c.sense === '<=' ? Math.max(0, c.rhs - lhs).toFixed(4) : 'N/A',
      };
    });
  }, [result, isOptimal]);

  /* ── 计算最大维度 maxDim ── */
  const maxDim = useMemo(() => {
    if (!result.variables) return 0;
    let max = 0;
    result.variables.forEach(v => {
      const d = v.dimension || '0D';
      const num = parseInt(d) || 0;
      if (num > max) max = num;
    });
    return Math.min(max, 3); // 最多支持3维
  }, [result.variables]);

  /* ── 变量列表（含元信息） ── */
  const variableList = useMemo(() => {
    if (!result.solution) return [];
    // 双重映射：中文名 → var, 英文名 → var
    const varByCn = {};
    const varByEn = {};
    result.variables?.forEach(v => {
      varByCn[v.name] = v;
      if (v.nameEn) varByEn[v.nameEn] = v;
    });
    return Object.entries(result.solution).map(([key, value]) => {
      const varInfo = varByCn[key] || varByEn[key] || {};
      const rawValue = typeof value === 'number' ? value : parseFloat(value);
      return {
        name: varInfo.name || key,           // 中文名称
        nameEn: varInfo.nameEn || '',         // 英文名称
        value: rawValue,
        type: varInfo.type || 'continuous',
        isZero: Math.abs(rawValue) < 0.00001,
        dimension: varInfo.dimension || '0D',  // 新增：维度信息
        indices: varInfo.indices || [],         // 新增：索引定义
      };
    });
  }, [result]);

  const totalVars = variableList.length;
  const nonZeroCount = variableList.filter(v => !v.isZero).length;

  /* ── 过滤 + 排序 ── */
  const filteredVars = useMemo(() => {
    let list = variableList.filter(v => {
      const searchLower = varSearch.toLowerCase();
      const matchSearch = v.name.toLowerCase().includes(searchLower)
        || v.nameEn.toLowerCase().includes(searchLower);
      if (varFilter === 'nonzero') return matchSearch && !v.isZero;
      if (varFilter === 'zero') return matchSearch && v.isZero;
      return matchSearch;
    });
    if (sortBy) {
      list = [...list].sort((a, b) => {
        const va = sortBy === 'nameEn' ? (a.nameEn || a.name) : a.value;
        const vb = sortBy === 'nameEn' ? (b.nameEn || b.name) : b.value;
        if (sortBy === 'nameEn') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        return sortDir === 'asc' ? va - vb : vb - va;
      });
    }
    return list;
  }, [variableList, varSearch, varFilter, sortBy, sortDir]);

  const handleSort = (field) => {
    setSortDir(prev => sortBy === field ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortBy(field);
  };

  const notOptimalHint = NOT_OPTIMAL_HINTS[result.status];

  /* ── 渲染 ── */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[94vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="求解结果"
      >

        {/* ══════════════════════════════════════
           顶部标题栏
        ══════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <BarChart3 size={18} className="opacity-80" />
            <div>
              <h2 className="text-sm font-semibold leading-tight">求解结果</h2>
              <p className="text-blue-200/80 text-[11px] leading-none mt-0.5">OR-Tools 求解器运算结果</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        {/* ══════════════════════════════════════
           紧凑摘要栏
        ══════════════════════════════════════ */}
        <div className={`px-5 sm:px-6 py-3 border-b border-gray-150 flex-shrink-0 bg-gradient-to-r ${statusConfig.bgSubtle} to-transparent`}>
          <div className="flex items-center gap-3 flex-wrap">

            {/* 状态标签 */}
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.bg} ${statusConfig.border}`}>
              <StatusIcon size={13} className={statusConfig.text} />
              <span className={statusConfig.text}>{statusConfig.label}</span>
            </span>

            <span className="text-gray-300 hidden sm:inline">|</span>

            {/* 目标函数值 */}
            <span className="inline-flex items-baseline gap-1">
              <span className="text-[11px] text-gray-400">目标值</span>
              <span className="text-sm font-bold text-gray-800 font-mono tabular-nums">
                {isOptimal ? (result.objective_value?.toFixed(4) ?? '—') : '—'}
              </span>
              {isMaximize
                ? <TrendingUp size={12} className="text-emerald-500 flex-shrink-0" />
                : <TrendingDown size={12} className="text-blue-400 flex-shrink-0" />
              }
              <span className="text-[10px] text-gray-400">{isMaximize ? '最大' : '最小'}</span>
            </span>

            <span className="text-gray-300 hidden sm:inline">|</span>

            {/* 求解时间 */}
            <span className="inline-flex items-baseline gap-1">
              <Clock size={11} className="text-gray-400" />
              <span className="text-[11px] text-gray-400">耗时</span>
              <span className="text-sm font-bold text-gray-800 font-mono tabular-nums">
                {result.solve_time != null ? `${result.solve_time.toFixed(4)}s` : '—'}
              </span>
            </span>

            <span className="text-gray-300 hidden sm:inline">|</span>

            {/* 迭代次数 */}
            <span className="inline-flex items-baseline gap-1">
              <span className="text-[11px] text-gray-400">迭代</span>
              <span className="text-sm font-bold text-gray-800 font-mono tabular-nums">
                {result.iterations ?? '—'}
              </span>
            </span>

            <span className="text-gray-300 hidden sm:inline">|</span>

            {/* 模型摘要（内联浓缩） */}
            <span className="inline-flex items-center gap-1">
              <span className="text-[11px] text-gray-400">
                {result.variables?.length ?? '?'} 变量 · {result.constraints?.length ?? '?'} 约束
              </span>
            </span>

          </div>
        </div>

        {/* ══════════════════════════════════════
           内容区域
        ══════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto">

          <div className="px-5 sm:px-6 pt-3 pb-5 space-y-3">

            {/* ── 非最优提示 ── */}
            {!isOptimal && notOptimalHint && (
              <div className={`rounded-xl border ${statusConfig.border} ${statusConfig.bg} p-4`}>
                <div className="flex items-start gap-3">
                  <StatusIcon size={20} className={`${statusConfig.text} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm ${statusConfig.text}`}>{notOptimalHint.title}</div>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notOptimalHint.desc}</p>
                    {notOptimalHint.actions.length > 0 && (
                      <div className="mt-2.5">
                        <div className="text-xs font-medium text-gray-500 mb-1">建议操作：</div>
                        <ul className="space-y-0.5">
                          {notOptimalHint.actions.map((a, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />{a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── 决策变量表格 ── */}
            {isOptimal && result.solution && (
              <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-0">
                {/* 表格工具栏 */}
                <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-200 flex items-center gap-3 flex-wrap">
                  {/* 标题 + 统计 */}
                  <h3 className="font-semibold text-gray-700 text-xs mr-auto">决策变量取值</h3>
                  <span className="text-[11px] text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                    {totalVars} 个变量
                  </span>
                  {nonZeroCount > 0 && (
                    <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
                      {nonZeroCount} 非零
                    </span>
                  )}

                  {/* 搜索 */}
                  <div className="relative w-36 sm:w-44">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索..."
                      value={varSearch}
                      onChange={e => setVarSearch(e.target.value)}
                      className="w-full pl-6.5 pr-2 py-1 text-[11px] border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    />
                  </div>

                  {/* 筛选 */}
                  <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-md overflow-hidden text-[11px]">
                    {[{ v: 'all', l: '全部' }, { v: 'nonzero', l: '非零' }, { v: 'zero', l: '零值' }].map(opt => (
                      <button key={opt.v} onClick={() => setVarFilter(opt.v)}
                        className={`px-2 py-1 transition-colors ${varFilter === opt.v ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 表格 */}
                <div className="overflow-auto max-h-[50vh] overscroll-contain">
                  <table className="w-full text-xs table-fixed">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-100/90 backdrop-blur-sm">
                        <th className="px-2 py-2 text-center text-[11px] font-medium text-gray-500 w-[38px]">#</th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500">
                          中文名称
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 cursor-pointer select-none group hover:text-gray-700 w-[140px]"
                          onClick={() => handleSort('nameEn')}>
                          <span className="inline-flex items-center gap-1">
                            英文名称 <SortIcon field="nameEn" sortBy={sortBy} sortDir={sortDir} />
                          </span>
                        </th>
                        {/* 动态索引列 */}
                        {maxDim >= 1 && (
                          <th className="px-2 py-2 text-center text-[11px] font-medium text-purple-500 w-[80px]">索引i</th>
                        )}
                        {maxDim >= 2 && (
                          <th className="px-2 py-2 text-center text-[11px] font-medium text-purple-500 w-[80px]">索引j</th>
                        )}
                        {maxDim >= 3 && (
                          <th className="px-2 py-2 text-center text-[11px] font-medium text-purple-500 w-[80px]">索引k</th>
                        )}
                        <th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500 cursor-pointer select-none group hover:text-gray-700 w-[112px]"
                          onClick={() => handleSort('value')}>
                          <span className="inline-flex items-center gap-1">
                            取值 <SortIcon field="value" sortBy={sortBy} sortDir={sortDir} />
                          </span>
                        </th>
                        <th className="px-2 py-2 text-center text-[11px] font-medium text-gray-500 w-[64px]">类型</th>
                        <th className="px-2 py-2 text-center text-[11px] font-medium text-gray-500 w-[48px]">复制</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredVars.length > 0 ? filteredVars.map((v, index) => {
                        // 解析维度数字
                        const dimNum = parseInt(v.dimension) || 0;
                        // 索引列显示内容生成器
                        const getIndexCell = (colIdx) => {
                          if (dimNum <= colIdx) return '—';
                          const idxDef = v.indices?.[colIdx];
                          if (!idxDef) return '—';
                          const alias = idxDef.alias || idxDef.nameEn || '';
                          const meaning = idxDef.businessMeaning || idxDef.name || '';
                          return alias
                            ? `${alias}${meaning ? ': ' + meaning : ''}`
                            : (meaning || '—');
                        };
                        return (
                          <tr key={v.nameEn || v.name}
                            className={`group transition-colors hover:bg-blue-50/60 ${v.isZero ? 'bg-gray-50/40 text-gray-400' : 'text-gray-700'}`}>
                            <td className="px-2 py-1.5 text-center text-gray-400 text-[11px] font-mono tabular-nums">{index + 1}</td>
                            <td className={`px-3 py-1.5 text-[11px] truncate ${v.isZero ? 'text-gray-400' : 'text-gray-700 font-medium'}`}
                              title={v.name}>
                              {v.name}
                            </td>
                            <td className={`px-3 py-1.5 font-mono text-[11px] ${v.isZero ? 'text-gray-400' : 'text-gray-700'}`}>
                              <span className="truncate block w-full" title={v.nameEn}>{v.nameEn || '—'}</span>
                            </td>
                            {/* 动态索引列内容 */}
                            {maxDim >= 1 && (
                              <td className="px-2 py-1.5 text-center text-[10px] font-mono text-purple-600 truncate" title={getIndexCell(0)}>
                                {getIndexCell(0)}
                              </td>
                            )}
                            {maxDim >= 2 && (
                              <td className="px-2 py-1.5 text-center text-[10px] font-mono text-purple-600 truncate" title={getIndexCell(1)}>
                                {getIndexCell(1)}
                              </td>
                            )}
                            {maxDim >= 3 && (
                              <td className="px-2 py-1.5 text-center text-[10px] font-mono text-purple-600 truncate" title={getIndexCell(2)}>
                                {getIndexCell(2)}
                              </td>
                            )}
                            <td className={`px-3 py-1.5 text-right font-mono text-[11px] font-semibold tabular-nums ${v.isZero ? 'text-gray-400' : 'text-amber-700'}`}>
                              {v.value.toFixed(4)}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span className={`text-[10px] font-medium rounded px-1.5 py-0.5 ${v.type === 'integer' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                {v.type === 'integer' ? '整数' : '连续'}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <InlineCopy text={v.value.toFixed(4)} />
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={6 + maxDim} className="px-4 py-12 text-center text-gray-400">
                            <Search size={20} className="mx-auto mb-2 opacity-50" />
                            <p className="text-xs">未找到匹配的变量</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 表格底部统计 */}
                <div className="bg-gray-50/50 px-4 py-2 border-t border-gray-150 text-[10px] text-gray-400 flex items-center justify-between">
                  <span>显示 {filteredVars.length} / {variableList.length} 个变量</span>
                  {sortBy && (
                    <span>排序：{sortBy === 'nameEn' ? '英文名' : '取值'} ({sortDir === 'asc' ? '升序' : '降序'})</span>
                  )}
                </div>
              </div>
            )}

            {/* ── 约束条件 ── */}
            {isOptimal && constraintResults.length > 0 && (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full bg-gray-50/80 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                  onClick={() => setConstraintExpanded(prev => !prev)}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-700 text-xs">约束条件满足情况</h3>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                      {constraintResults.filter(c => c.satisfied).length}/{constraintResults.length} 满足
                    </span>
                  </div>
                  {constraintExpanded ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                </button>
                {constraintExpanded && (
                  <div className="overflow-x-auto max-h-60 overscroll-contain">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-gray-50/90 backdrop-blur-sm">
                          <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 w-8">#</th>
                          <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500">约束</th>
                          <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 font-mono">表达式</th>
                          <th className="px-4 py-2 text-center text-[11px] font-medium text-gray-500 w-16">状态</th>
                          <th className="px-4 py-2 text-right text-[11px] font-medium text-gray-500 w-20">余量</th>
                          <th className="px-4 py-2 text-right text-[11px] font-medium text-gray-500 w-20">松弛</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {constraintResults.map((c, i) => (
                          <tr key={i} className={`hover:bg-gray-50/70 transition-colors ${!c.satisfied ? 'bg-red-50/40' : ''}`}>
                            <td className="px-4 py-2 text-gray-400 text-[11px]">{i + 1}</td>
                            <td className="px-4 py-2 font-medium text-gray-700 text-[11px]">{c.name}</td>
                            <td className="px-4 py-2 text-gray-500 font-mono text-[11px]">{c.expression}</td>
                            <td className="px-4 py-2 text-center">
                              {c.satisfied ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">
                                  <CheckCircle size={9} />满足
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-full px-1.5 py-0.5">
                                  <XCircle size={9} />违反
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-[11px] text-gray-600 tabular-nums">{c.margin}</td>
                            <td className="px-4 py-2 text-right font-mono text-[11px] text-gray-600 tabular-nums">{c.slack}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── 模型摘要（始终折叠，极小占用） ── */}
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <button
                className="w-full bg-gray-50/80 px-4 py-2.5 flex items-center gap-2 text-left hover:bg-gray-100 transition-colors"
                onClick={() => setModelExpanded(prev => !prev)}
              >
                <Info size={12} className="text-gray-400" />
                <h3 className="font-semibold text-gray-700 text-xs">模型摘要</h3>
                <span className="text-[10px] text-gray-400 ml-auto mr-2">
                  {result.variables?.length ?? '?'} 变量 · {result.constraints?.length ?? '?'} 约束
                  {' · '}
                  {result.variables?.some(v => v.type === 'integer') ? 'MIP' : 'LP'}
                </span>
                {modelExpanded ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
              </button>
              {modelExpanded && (
                <div className="px-4 py-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5">
                  {[
                    { l: '模型ID', v: result.model_id, m: true },
                    { l: '问题类型', v: result.variables?.some(v => v.type === 'integer') ? 'MIP（混合整数）' : 'LP（线性规划）' },
                    { l: '变量数', v: result.variables?.length ?? 0, m: true },
                    { l: '约束数', v: result.constraints?.length ?? 0, m: true },
                  ].map(item => (
                    <div key={item.l} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-400 text-[11px]">{item.l}</span>
                      <span className={`text-gray-700 text-[11px] font-medium ${item.m ? 'font-mono' : ''}`}>{String(item.v ?? '—')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════
           底部操作栏
        ══════════════════════════════════════ */}
        <div className="bg-gray-50 px-5 sm:px-6 py-3 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] text-gray-400">
            {isOptimal
              ? `${totalVars} 个变量 · ${nonZeroCount} 个非零值`
              : <span className={`${statusConfig.text} font-medium`}>{statusConfig.label} — 无法应用结果</span>
            }
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors"
            >
              关闭
            </button>
            {isOptimal && (
              <button
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors shadow-sm"
                onClick={onApply || onClose}
              >
                应用结果
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
