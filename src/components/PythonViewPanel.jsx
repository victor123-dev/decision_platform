import { useMemo, useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

/**
 * Python 视图面板 — 实时同步版本
 *
 * 使用 useMemo 从可视化数据同步生成 Python 代码，零延迟、无 API 调用。
 * 当 variables / objectives / constraints / problemType 任一变化时，
 * Python 代码立即更新。
 */
export default function PythonViewPanel({ variables, objectives, constraints, problemType, modelName }) {
  const [copied, setCopied] = useState(false);

  const safeVar = (name) => (name || 'x').replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, 'v_$1');
  const fmtNum = (n) => (Number.isInteger(n) || n === Math.floor(n)) ? String(Math.round(n)) : String(n);

  /** 构建变量名映射 varId → 英文名 */
  const varMap = useMemo(() => {
    const map = {};
    variables.forEach(v => { map[v.id] = v.nameEn || v.name; });
    return map;
  }, [variables]);

  /** 将 coefficients 字典转为 Python 代数表达式 */
  const buildExpr = (coefficients) => {
    const terms = [];
    for (const [varId, coeff] of Object.entries(coefficients || {})) {
      if (Math.abs(coeff) < 1e-10) continue;
      terms.push({ name: safeVar(varMap[varId] || varId), coeff });
    }
    if (terms.length === 0) return '0';
    const parts = [];
    terms.forEach((t, i) => {
      if (i === 0) {
        if (t.coeff === 1) parts.push(t.name);
        else if (t.coeff === -1) parts.push(`-${t.name}`);
        else parts.push(`${fmtNum(t.coeff)} * ${t.name}`);
      } else {
        if (t.coeff > 0) {
          parts.push(t.coeff === 1 ? `+ ${t.name}` : `+ ${fmtNum(t.coeff)} * ${t.name}`);
        } else {
          const absC = Math.abs(t.coeff);
          parts.push(absC === 1 ? `- ${t.name}` : `- ${fmtNum(absC)} * ${t.name}`);
        }
      }
    });
    return parts.join(' ');
  };

  /**
   * 核心：同步生成 Python 代码
   * 从可视化数据实时构建，零延迟
   */
  const code = useMemo(() => {
    if (!variables.length) return '';

    // Helper: objectTypeId → 集合大小参数名 (obj-work-order → n_work_orders)
    const setParamName = (objectTypeId) => {
      const base = objectTypeId.replace(/^obj-/, '').replace(/-/g, '_');
      return `n_${base}s`;
    };

    // 从所有变量的 indices 中收集不重复的集合
    const setMap = new Map(); // objectTypeId → { setName, param, alias, businessMeaning, objectTypeDisplayName, propertyId }
    variables.forEach(v => {
      (v.indices || []).forEach(idx => {
        if (idx.objectTypeId && !setMap.has(idx.objectTypeId)) {
          const mapping = (v.indexMapping || []).find(m => m.alias === idx.alias);
          setMap.set(idx.objectTypeId, {
            setName: idx.setName,
            param: setParamName(idx.objectTypeId),
            alias: idx.alias,
            businessMeaning: idx.businessMeaning || idx.objectTypeDisplayName || '',
            objectTypeDisplayName: idx.objectTypeDisplayName || '',
            propertyId: mapping?.propertyId || '',
          });
        }
      });
    });

    let code = `"""\n模型名称: ${modelName || 'Untitled'}\n自动生成 — 基于 OR-Tools 线性规划求解器\n"""\n\n`;
    code += `from ortools.linear_solver import pywraplp\n\n\n`;
    code += `def solve_model():\n`;
    code += `    """构建并求解优化模型"""\n`;
    code += `    # 创建求解器 (SCIP > CBC 回退)\n`;
    code += `    solver = pywraplp.Solver.CreateSolver('SCIP')\n`;
    code += `    if not solver:\n`;
    code += `        solver = pywraplp.Solver.CreateSolver('CBC')\n`;
    code += `    if not solver:\n`;
    code += `        raise RuntimeError('无法创建 OR-Tools 求解器')\n\n`;

    // ── 集合大小参数 ──
    if (setMap.size > 0) {
      code += `    # ─── 集合大小参数 ───\n`;
      for (const info of setMap.values()) {
        code += `    ${info.param} = 10  # TODO: 由数据决定\n`;
      }
      code += `\n`;
    }

    // ── 决策变量 ──
    code += `    # ─── 决策变量 ───\n`;
    variables.forEach(v => {
      const enName = v.nameEn || v.name;
      const sv = safeVar(enName);
      const lb = v.lowerBound ?? 0;
      const ub = v.upperBound != null ? v.upperBound : null;
      const ubStr = ub !== null ? fmtNum(ub) : 'solver.infinity()';
      const lbStr = fmtNum(lb);
      const dim = v.dimension || '0D';
      const indices = v.indices || [];
      const indexMapping = v.indexMapping || [];

      if (dim === '0D' || indices.length === 0) {
        // 0D: 单变量
        code += `    # ${enName}: ${v.businessMeaning || enName}\n`;
        if (v.type === 'binary') {
          code += `    ${sv} = solver.BoolVar('${enName}')\n`;
        } else if (v.type === 'integer') {
          code += `    ${sv} = solver.IntVar(${lbStr}, ${ubStr}, '${enName}')\n`;
        } else {
          code += `    ${sv} = solver.NumVar(${lbStr}, ${ubStr}, '${enName}')\n`;
        }
      } else {
        // 多维变量: 1D / 2D / 3D
        const aliasList = indices.map(idx => idx.alias);
        const aliasStr = aliasList.join(',');

        // 注释: 变量描述
        code += `    # ${sv}[${aliasStr}]: ${v.businessMeaning || enName}\n`;

        // 注释: 索引说明
        const indexComments = indices.map(idx => {
          const mapping = indexMapping.find(m => m.alias === idx.alias);
          const propId = mapping?.propertyId || '';
          const propPart = propId ? `, ${propId}` : '';
          return `${idx.alias} ∈ ${idx.setName} (${idx.businessMeaning || idx.objectTypeDisplayName}${propPart})`;
        });
        code += `    # ${indexComments.join(', ')}\n`;

        // 字典初始化
        code += `    ${sv} = {}\n`;

        // 嵌套循环
        indices.forEach((idx, i) => {
          const paramInfo = setMap.get(idx.objectTypeId);
          const param = paramInfo?.param || '10';
          const loopIndent = '    '.repeat(i + 1);
          const comment = idx.businessMeaning || idx.objectTypeDisplayName || '';
          code += `${loopIndent}for ${idx.alias} in range(${param}):  # ${idx.alias} = ${comment}\n`;
        });

        // 变量创建
        const innerIndent = '    '.repeat(indices.length + 1);
        const keyStr = aliasList.join(', ');
        const fStr = aliasList.map(a => `{${a}}`).join('_');

        if (v.type === 'binary') {
          code += `${innerIndent}${sv}[${keyStr}] = solver.BoolVar(f'${sv}_${fStr}')\n`;
        } else if (v.type === 'integer') {
          code += `${innerIndent}${sv}[${keyStr}] = solver.IntVar(${lbStr}, ${ubStr}, f'${sv}_${fStr}')\n`;
        } else {
          code += `${innerIndent}${sv}[${keyStr}] = solver.NumVar(${lbStr}, ${ubStr}, f'${sv}_${fStr}')\n`;
        }
      }
    });

    // ── 目标函数 ──
    const primaryObj = (objectives || [])[0] || { sense: 'maximize', coefficients: {} };
    code += `\n    # ─── 目标函数（${primaryObj.sense === 'minimize' ? '最小化' : '最大化'}）───\n`;
    const objExpr = buildExpr(primaryObj.coefficients);
    if (primaryObj.sense === 'minimize') {
      code += `    solver.Minimize(${objExpr})\n`;
    } else {
      code += `    solver.Maximize(${objExpr})\n`;
    }

    // ── 约束条件 ──
    code += `\n    # ─── 约束条件 ───\n`;
    constraints.forEach((c, idx) => {
      const lhs = buildExpr(c.coefficients);
      const senseOp = c.sense === '>=' ? '>=' : c.sense === '==' ? '==' : '<=';
      const cVar = `c${idx + 1}`;
      code += `    ${cVar} = solver.Add(\n`;
      code += `        ${lhs} ${senseOp} ${fmtNum(c.rhs)},\n`;
      code += `        '${c.name}')\n`;
    });

    // ── 求解与结果 ──
    code += `\n    # ─── 求解 ───\n`;
    code += `    status = solver.Solve()\n\n`;
    code += `    # ─── 输出结果 ───\n`;
    code += `    if status == pywraplp.Solver.OPTIMAL:\n`;
    code += `        print(f'目标函数值: {solver.Objective().Value():.6f}')\n`;
    code += `        print(f'求解时间:   {solver.wall_time() / 1000:.4f} 秒')\n`;
    code += `        print()\n`;
    code += `        print('最优解:')\n`;
    variables.forEach(v => {
      const enName = v.nameEn || v.name;
      const sv = safeVar(enName);
      const dim = v.dimension || '0D';
      const indices = v.indices || [];

      if (dim === '0D' || indices.length === 0) {
        // 0D: 直接打印
        code += `        print(f'  ${enName} = {${sv}.solution_value():.6f}')\n`;
      } else if (dim === '1D') {
        // 1D: 循环打印
        const idx0 = indices[0];
        const paramInfo = setMap.get(idx0.objectTypeId);
        const param = paramInfo?.param || '10';
        code += `        print('  ${enName}:')\n`;
        code += `        for ${idx0.alias} in range(${param}):\n`;
        code += `            print(f'    [{${idx0.alias}}] = {${sv}[${idx0.alias}].solution_value():.6f}')\n`;
      } else {
        // 2D/3D: 嵌套循环打印非零值
        const aliasList = indices.map(idx => idx.alias);
        const keyStr = aliasList.join(', ');
        const fKeyStr = aliasList.map(a => `{${a}}`).join(',');

        code += `        print('  ${enName} (非零值):')\n`;
        indices.forEach((idx, i) => {
          const paramInfo = setMap.get(idx.objectTypeId);
          const param = paramInfo?.param || '10';
          const loopIndent = '        ' + '    '.repeat(i);
          code += `${loopIndent}for ${idx.alias} in range(${param}):\n`;
        });

        const valIndent = '        ' + '    '.repeat(indices.length);
        code += `${valIndent}val = ${sv}[${keyStr}].solution_value()\n`;
        code += `${valIndent}if abs(val) > 1e-6:\n`;
        code += `${valIndent}    print(f'    [${fKeyStr}] = {val:.6f}')\n`;
      }
    });
    code += `\n    elif status == pywraplp.Solver.INFEASIBLE:\n`;
    code += `        print('模型无解（约束不可行）')\n`;
    code += `    elif status == pywraplp.Solver.UNBOUNDED:\n`;
    code += `        print('模型无界')\n`;
    code += `    elif status == pywraplp.Solver.NOT_SOLVED:\n`;
    code += `        print('模型未求解')\n`;
    code += `    else:\n`;
    code += `        print(f'求解状态码: {status}')\n`;
    code += `\n\n`;
    code += `if __name__ == '__main__':\n`;
    code += `    solve_model()\n`;

    return code;
  }, [variables, objectives, constraints, problemType, modelName, varMap]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Syntax highlighting (simple)
  function highlightPython(code) {
    if (!code) return '';
    let html = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html = html.replace(/(#[^\n]*)/g, '<span class="py-comment">$1</span>');
    html = html.replace(/(f?"[^"]*"|f?'[^']*')/g, '<span class="py-string">$1</span>');
    const keywords = ['from', 'import', 'def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'print', 'math'];
    keywords.forEach(kw => {
      html = html.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '<span class="py-keyword">$1</span>');
    });
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="py-number">$1</span>');
    return html;
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-[#313244]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">Python</span>
          <span className="text-xs text-[#6c7086]">OR-Tools 求解器代码</span>
          <span className="text-[10px] text-emerald-400/70 bg-emerald-400/10 px-1.5 py-0.5 rounded">实时同步</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="text-[#6c7086] hover:text-white p-1" title="复制">
            {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <style>{`
          .py-comment { color: #6c7086; font-style: italic; }
          .py-string { color: #a6e3a1; }
          .py-keyword { color: #cba6f7; font-weight: 600; }
          .py-number { color: #fab387; }
        `}</style>
        {code ? (
          <pre className="text-[13px] font-mono text-[#cdd6f4] leading-[1.7] whitespace-pre-wrap">
            <code dangerouslySetInnerHTML={{ __html: highlightPython(code) }} />
          </pre>
        ) : (
          <div className="flex items-center justify-center h-40 text-[#6c7086] text-sm">
            请先定义变量和目标函数
          </div>
        )}
      </div>
    </div>
  );
}
