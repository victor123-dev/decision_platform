import { useEffect, useMemo, useState } from 'react';
import { Search, X, ChevronDown, ChevronRight, Loader2, AlertCircle, Package } from 'lucide-react';
import { api } from '../api/apiClient';

const DIMENSION_BADGE = {
  '0D': 'bg-slate-100 text-slate-600',
  '1D': 'bg-blue-100 text-blue-600',
  '2D': 'bg-purple-100 text-purple-600',
  '3D': 'bg-orange-100 text-orange-600',
};

const DOMAIN_BADGE = {
  continuous: 'bg-sky-100 text-sky-600',
  integer: 'bg-orange-100 text-orange-600',
  binary: 'bg-pink-100 text-pink-600',
};

const DOMAIN_LABEL = {
  continuous: '连续',
  integer: '整数',
  binary: '0-1',
};

/* ── 本体对象分类定义（与决策变量集页面一致） ── */
const ONTOLOGY_OBJECT_TYPES = [
  { id: 'obj-supplier', displayName: '供应商' },
  { id: 'obj-warehouse', displayName: '仓库' },
  { id: 'obj-order', displayName: '订单' },
  { id: 'obj-product', displayName: '产品' },
  { id: 'obj-customer', displayName: '客户' },
  { id: 'obj-material', displayName: '物料' },
  { id: 'obj-work-order', displayName: '工单' },
  { id: 'obj-risk', displayName: '风险' },
  { id: 'obj-inventory', displayName: '库存' },
  { id: 'obj-machine', displayName: '机台' },
  { id: 'obj-task', displayName: '生产任务' },
  { id: 'obj-logistics', displayName: '物流单' },
];

export default function VariableSetPickerModal({
  open,
  onClose,
  onConfirm,
  existingVariableIds = [],
}) {
  const [variableSets, setVariableSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isVisible, setIsVisible] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/mapping-sets/variable-sets/');
      const items = (res?.items ?? res ?? []).filter(Boolean);
      setVariableSets(items);
      // 初始展开所有对象类型组
      setExpandedGroups(Object.fromEntries(ONTOLOGY_OBJECT_TYPES.map(obj => [obj.id, true])));
    } catch (err) {
      console.error('加载变量集失败:', err);
      setError(err?.message || '加载变量集失败，请稍后重试');
      setVariableSets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setIsVisible(false);
      return;
    }
    setIsVisible(true);
    setSearchTerm('');
    setSelectedIds(new Set());
    setError(null);
    loadData();
  }, [open]);

  const isAdded = (variable) => {
    const ids = existingVariableIds || [];
    return (
      ids.includes(variable.symbol) ||
      ids.includes(variable.id) ||
      ids.includes(variable.name) ||
      (variable.nameEn && ids.includes(variable.nameEn))
    );
  };

  const toggleVariable = (variable) => {
    if (isAdded(variable)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(variable.id)) {
        next.delete(variable.id);
      } else {
        next.add(variable.id);
      }
      return next;
    });
  };

  const toggleGroupExpanded = (groupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  /* 按本体对象类型分组（与决策变量集页面一致） */
  const groupedByObjectType = useMemo(() => {
    const result = {};
    ONTOLOGY_OBJECT_TYPES.forEach(obj => { result[obj.id] = []; });

    variableSets.forEach(vs => {
      (vs.variables || []).forEach(v => {
        const involvedObjectIds = new Set();
        (v.indexMapping || []).forEach(im => {
          if (im.objectTypeId) involvedObjectIds.add(im.objectTypeId);
        });
        (v.ontologyRefs || []).forEach(ref => {
          if (ref.objectTypeId) involvedObjectIds.add(ref.objectTypeId);
        });
        if (v.directRef?.objectTypeId) involvedObjectIds.add(v.directRef.objectTypeId);

        involvedObjectIds.forEach(objId => {
          if (result[objId]) result[objId].push(v);
        });
      });
    });

    return result;
  }, [variableSets]);

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return ONTOLOGY_OBJECT_TYPES
      .map(obj => {
        const vars = (groupedByObjectType[obj.id] || []).filter(v => {
          if (!term) return true;
          return (v.name || '').toLowerCase().includes(term) ||
                 (v.nameEn || '').toLowerCase().includes(term);
        });
        return { ...obj, variables: vars };
      })
      .filter(group => group.variables.length > 0);
  }, [groupedByObjectType, searchTerm]);

  const selectedCount = selectedIds.size;

  const handleConfirm = () => {
    if (selectedCount === 0) return;
    // 从所有分组中收集选中的变量（去重）
    const seen = new Set();
    const selectedVariables = [];
    Object.values(groupedByObjectType).flat().forEach(v => {
      if (selectedIds.has(v.id) && !seen.has(v.id)) {
        seen.add(v.id);
        selectedVariables.push(v);
      }
    });
    onConfirm?.(selectedVariables);
    onClose?.();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden transform transition-all duration-200 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800">从变量集选择</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索变量名..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin mb-3" />
              <span className="text-sm">正在加载变量集...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <AlertCircle size={28} className="text-red-500 mb-3" />
              <span className="text-sm">{error}</span>
              <button
                onClick={loadData}
                className="mt-3 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                重试
              </button>
            </div>
          ) : variableSets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Package size={32} className="mb-3 opacity-50" />
              <span className="text-sm">暂无可用的决策变量集</span>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Search size={32} className="mb-3 opacity-50" />
              <span className="text-sm">未找到匹配的变量</span>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredGroups.map((group) => {
                const isExpanded = expandedGroups[group.id] !== false;
                return (
                  <div key={group.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleGroupExpanded(group.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown size={16} className="text-slate-500" />
                        ) : (
                          <ChevronRight size={16} className="text-slate-500" />
                        )}
                        <span className="text-sm font-semibold text-slate-700">
                          {group.displayName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {group.id}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({group.variables.length}个变量)
                        </span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="divide-y divide-slate-100">
                        {group.variables.map((v) => {
                          const added = isAdded(v);
                          const checked = selectedIds.has(v.id);
                          return (
                            <div
                              key={v.id}
                              className={`flex items-center gap-3 px-3 py-2.5 ${
                                added
                                  ? 'bg-slate-50/50 cursor-not-allowed'
                                  : 'hover:bg-slate-50 cursor-pointer'
                              }`}
                              onClick={() => toggleVariable(v)}
                            >
                              <input
                                type="checkbox"
                                checked={added || checked}
                                disabled={added}
                                onChange={() => toggleVariable(v)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-sm font-medium ${
                                      added ? 'text-slate-400' : 'text-slate-700'
                                    }`}
                                  >
                                    {v.name || v.symbol}
                                  </span>
                                  {v.nameEn && (
                                    <span className="text-xs text-slate-400 font-mono">
                                      {v.nameEn}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span
                                  className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                    DIMENSION_BADGE[v.dimension] || DIMENSION_BADGE['0D']
                                  }`}
                                >
                                  {v.dimension || '0D'}
                                </span>
                                <span
                                  className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                    DOMAIN_BADGE[v.domain] || 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {DOMAIN_LABEL[v.domain] || v.domain || '连续'}
                                </span>
                                {added && (
                                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                    已添加
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <span className="text-sm text-slate-600">
            已选 <span className="font-semibold text-slate-800">{selectedCount}</span> 个变量
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
