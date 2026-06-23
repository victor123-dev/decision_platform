import { useMemo, useState, useCallback } from 'react';
import { Copy, CheckCircle, RefreshCw } from 'lucide-react';

/**
 * DSL 视图面板 — 实时同步版本
 *
 * 使用 useMemo 从可视化数据同步生成 DSL 代码，零延迟、无 API 调用。
 * 当 variables / objectives / constraints / problemType 任一变化时，
 * DSL 内容立即更新。
 */
export default function DslViewPanel({ variables, objectives, constraints, problemType, modelName, orDsl }) {
  const [copied, setCopied] = useState(false);

  /** 构建变量信息映射 varId → { name, indices } */
  const varInfoMap = useMemo(() => {
    const map = {};
    variables.forEach(v => {
      map[v.id] = {
        name: v.nameEn || v.name,
        indices: v.indices || []
      };
    });
    return map;
  }, [variables]);

  /** 将 coefficients 字典转为可读表达式字符串，多维变量带索引下标 */
  const buildExpr = useCallback((coefficients) => {
    const parts = [];
    for (const [varId, coeff] of Object.entries(coefficients || {})) {
      if (coeff === 0 || coeff === null || coeff === undefined) continue;
      const info = varInfoMap[varId];
      const baseName = info?.name || varId;
      const suffix = info?.indices?.length
        ? `[${info.indices.map(idx => typeof idx === 'string' ? idx : idx.alias).join(',')}]`
        : '';
      const name = `${baseName}${suffix}`;
      if (typeof coeff === 'string') {
        parts.push(coeff.startsWith('$') ? `${coeff}*${name}` : `${coeff}*${name}`);
        continue;
      }
      if (coeff === 1) parts.push(name);
      else if (coeff === -1) parts.push(`-${name}`);
      else parts.push(`${coeff}*${name}`);
    }
    return parts.join(' + ').replace(/\+ -/g, '- ') || '0';
  }, [varInfoMap]);

  /**
   * 核心：同步生成 DSL 中间表示
   * 优先使用外部传入的 orDsl（AI 生成），否则从可视化数据实时构建
   */
  const dsl = useMemo(() => {
    // 如果有 AI 生成的 OR-DSL，优先使用
    if (orDsl) return orDsl;

    // 无变量时返回 null
    if (!variables.length) return null;

    const primaryObj = (objectives || [])[0] || { sense: 'maximize', coefficients: {} };

    return {
      problemType: problemType || 'LP',
      name: modelName || 'Untitled',
      variables: variables.map(v => {
        const dslVar = {
          symbol: v.nameEn || v.name,
          name: v.name,
          domain: v.type || 'continuous',
          bounds: { lower: v.lowerBound ?? 0, upper: v.upperBound ?? null },
        };
        // 添加维度信息
        if (v.dimension) {
          dslVar.dimension = v.dimension;
        }
        // 添加索引信息（非0D变量）
        if (v.dimension && v.dimension !== '0D' && v.indices && v.indices.length > 0) {
          dslVar.indices = v.indices.map(idx => {
            const entry = { symbol: typeof idx === 'string' ? idx : idx.alias };
            if (idx.businessMeaning) entry.businessMeaning = idx.businessMeaning;
            // 从 indexMapping 获取本体绑定信息
            const mapping = (v.indexMapping || []).find(m => m.alias === entry.symbol);
            if (mapping && mapping.objectTypeId) {
              entry.ontologyBinding = {
                object: idx.objectTypeDisplayName || mapping.objectTypeId,
                property: mapping.propertyId || ''
              };
            }
            return entry;
          });
        }
        if (v.businessMeaning) dslVar.businessMeaning = v.businessMeaning;
        return dslVar;
      }),
      objectives: (objectives || []).map(o => ({
        name: o.name,
        sense: o.sense,
        expression: buildExpr(o.coefficients),
      })),
      objective: {
        sense: primaryObj.sense,
        expression: buildExpr(primaryObj.coefficients),
      },
      constraints: constraints.map(c => ({
        name: c.name,
        sense: c.sense,
        rhs: c.rhs,
        expression: buildExpr(c.coefficients),
      })),
    };
  }, [orDsl, variables, objectives, constraints, problemType, modelName, buildExpr]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(dsl, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded">OR-DSL</span>
          <span className="text-xs text-slate-400">JSON 中间表示</span>
          <span className="text-[10px] text-emerald-500/70 bg-emerald-500/10 px-1.5 py-0.5 rounded">实时同步</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="text-slate-400 hover:text-white p-1" title="复制">
            {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {dsl ? (
          <pre className="text-sm font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(dsl, null, 2)}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            请先定义变量和目标函数
          </div>
        )}
      </div>
    </div>
  );
}
