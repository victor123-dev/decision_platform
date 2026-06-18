import React from 'react';
import { getOntologyPath, hasOntologyRef } from '../utils/variableUtils';

/**
 * OntologyBadge
 * 用于展示变量/系数对应的本体语义路径的小徽章
 * - hover 展示完整路径
 * - 点击可触发 onClick（如打开本体-模型映射弹窗）
 */
export default function OntologyBadge({
  variable,
  ontologyName,
  className = '',
  showIcon = true,
  onClick,
  children,
}) {
  if (!hasOntologyRef(variable)) {
    return children || null;
  }

  const path = getOntologyPath(variable, { ontologyName });
  const clickable = typeof onClick === 'function';

  return (
    <span
      className={`ontology-badge ${clickable ? 'ontology-badge-clickable' : ''} ${className}`}
      title={path}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {showIcon && (
        <svg className="ontology-badge-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      )}
      {children}
    </span>
  );
}
