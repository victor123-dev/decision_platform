import React, { useState, useRef, useEffect } from 'react';
import { getVariableColorClass, getOntologyPath, hasOntologyRef } from '../utils/variableUtils';

/**
 * VariableToken
 * 用于在 Agent 消息、右侧面板、约束表达式等处展示决策变量
 * - 统一展示中文名（variable.name），标注色块
 * - 点击可触发 onClick（如打开本体-模型映射弹窗并定位到对应变量）
 * - hover 时用气泡展示该变量的详细信息（来自决策变量集的变量详情）
 */
export default function VariableToken({
  variable,
  label,
  ontologyName,
  className = '',
  onClick,
  showPath = true,
  showIndices = false,
}) {
  const displayLabel = label || variable?.name || variable?.symbol || '';
  const colorClass = getVariableColorClass(variable);
  const path = showPath ? getOntologyPath(variable, { ontologyName }) : '';
  const clickable = typeof onClick === 'function';
  const hasRef = hasOntologyRef(variable);

  const indices = variable?.indices || [];
  const hasIndices = showIndices && indices.length > 0 && variable?.dimension !== '0D';

  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
  const tokenRef = useRef(null);

  useEffect(() => {
    if (!showTooltip) return;
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target) &&
          tokenRef.current && !tokenRef.current.contains(e.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTooltip]);

  const natureLabel = variable?.nature === 'direct_ref' ? '直引变量' : variable?.nature === 'association' ? '关联变量' : '';

  return (
    <span
      ref={tokenRef}
      className={`variable-token ${colorClass} ${clickable ? 'variable-token-clickable' : ''} ${className}`}
      title={path || displayLabel}
      onClick={(e) => {
        if (clickable) onClick(e);
        else if (variable) setShowTooltip(!showTooltip);
      }}
      onMouseEnter={() => variable && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {hasRef && <span className="variable-token-dot" />}
      {displayLabel}
      {hasIndices && (
        <span className="text-[10px] text-slate-400 font-mono ml-0.5">
          [{indices.map(idx => typeof idx === 'string' ? idx : idx.alias).join(',')}]
        </span>
      )}

      {/* Hover 气泡：展示变量详细信息 */}
      {showTooltip && variable && (
        <span
          ref={tooltipRef}
          className="variable-tooltip"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="variable-tooltip-header">
            <span className={`variable-tooltip-badge ${variable.nature === 'direct_ref' ? 'badge-direct' : 'badge-assoc'}`}>
              {natureLabel || '变量'}
            </span>
            {variable.dimension && <span className="variable-tooltip-dim">{variable.dimension} | {variable.domain || 'continuous'}</span>}
          </div>
          <table className="variable-tooltip-table">
            <tbody>
              <tr><td className="vt-label">中文名称</td><td className="vt-value">{variable.name || '—'}</td></tr>
              <tr><td className="vt-label">英文名称</td><td className="vt-value vt-mono">{variable.nameEn || '—'}</td></tr>
              {variable.businessMeaning && (
                <tr><td className="vt-label">业务含义</td><td className="vt-value">{variable.businessMeaning}</td></tr>
              )}
              {variable.unit && (
                <tr><td className="vt-label">单位</td><td className="vt-value">{variable.unit}</td></tr>
              )}
              {path && (
                <tr><td className="vt-label">本体路径</td><td className="vt-value vt-mono vt-path">{path}</td></tr>
              )}
              {indices.length > 0 && variable?.dimension !== '0D' && (
                <tr>
                  <td className="vt-label">索引下标</td>
                  <td className="vt-value vt-mono">
                    {indices.map(idx => typeof idx === 'string' ? idx : idx.alias).join(', ')}
                    <span className="text-slate-400 ml-1">({variable.dimension})</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </span>
      )}
    </span>
  );
}

/**
 * VariableTokenGroup
 * 将一组变量名文本中的变量自动渲染为 VariableToken
 * text: 原始文本，如 "x1 + $系数 * x2"
 * variableMap: { name -> variable } 映射
 */
export function VariableTokenGroup({ text, variableMap = {}, onVariableClick, ontologyName }) {
  if (!text) return null;

  // 匹配变量占位符：$变量名 或 variableMap 中的变量名
  const variableNames = Object.keys(variableMap).filter(Boolean).sort((a, b) => b.length - a.length);
  const escapedNames = variableNames.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = escapedNames.length > 0
    ? new RegExp(`(\\$[A-Za-z0-9_\\u4e00-\\u9fa5]+|${escapedNames.join('|')})`, 'g')
    : new RegExp('(\\$[A-Za-z0-9_\\u4e00-\\u9fa5]+)', 'g');

  const parts = text.split(pattern);

  return (
    <span className="variable-token-group">
      {parts.map((part, idx) => {
        const isPlaceholder = part.startsWith('$');
        const varName = isPlaceholder ? part.slice(1) : part;
        const matchedVar = variableMap[varName] || variableMap[part];

        if (matchedVar || (isPlaceholder && variableMap[varName])) {
          return (
            <VariableToken
              key={`${part}-${idx}`}
              variable={matchedVar || { name: varName }}
              label={part}
              ontologyName={ontologyName}
              onClick={onVariableClick ? () => onVariableClick(matchedVar || { name: varName }) : undefined}
            />
          );
        }
        return <span key={`${part}-${idx}`}>{part}</span>;
      })}
    </span>
  );
}
