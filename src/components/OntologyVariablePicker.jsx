import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ChevronDown, Search, Database, Circle, Loader2 } from 'lucide-react';
import { api } from '../api/apiClient';

/**
 * 数据类型 → 颜色映射
 */
const dataTypeColorMap = {
  string: 'blue',
  text: 'blue',
  integer: 'green',
  int: 'green',
  float: 'green',
  boolean: 'amber',
  date: 'purple',
  datetime: 'purple',
  enum: 'slate',
};

function getDataTypeColor(dataType) {
  return dataTypeColorMap[dataType] || 'slate';
}

/** 数据类型对应的 Tailwind 圆点颜色 */
const dotColorClass = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  slate: 'bg-slate-400',
};

/** 数据类型对应的 badge 样式 */
const badgeColorClass = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  purple: 'bg-purple-100 text-purple-700',
  slate: 'bg-slate-100 text-slate-600',
};

/**
 * 将 API 返回的本体数据映射为组件内部结构
 * API: object_types[].properties[] → 内部: objectTypes[].fields[]
 */
function mapApiOntology(apiOnt) {
  return {
    id: apiOnt.id,
    name: apiOnt.name,
    description: apiOnt.description || '',
    objectTypes: (apiOnt.object_types || []).map(ot => ({
      id: ot.id,
      name: ot.name,
      displayName: ot.display_name || ot.name,
      description: ot.description || '',
      fields: (ot.properties || []).map((prop, idx) => ({
        field_id: prop.name || `field-${ot.id}-${idx}`,
        name: prop.description || prop.name,
        data_type: prop.type || 'string',
        description: prop.description || '',
      })),
    })),
  };
}

/**
 * 本体树形选择器 —— 从本体模型中选取属性字段作为优化求解模型的决策变量
 *
 * @param {function} onSelect - 选中属性字段时的回调
 *   回调参数: { ontologyId, ontologyName, objectId, objectName, fieldId, fieldName, dataType }
 * @param {string} [selectedOntologyId] - 可选，限定只展示某个本体
 * @param {string} [className] - 容器额外样式类
 */
export default function OntologyVariablePicker({ onSelect, selectedOntologyId, className = '' }) {
  const [ontologies, setOntologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOntologies, setExpandedOntologies] = useState({});
  const [expandedObjects, setExpandedObjects] = useState({});
  const [selectedFieldId, setSelectedFieldId] = useState(null);

  // 从 API 加载本体列表
  useEffect(() => {
    let cancelled = false;
    async function fetchOntologies() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get('/ontology/');
        if (!cancelled) {
          const mapped = (data || []).map(mapApiOntology);
          // 如果限定了 selectedOntologyId，只保留该本体
          setOntologies(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || '加载本体数据失败');
          setOntologies([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchOntologies();
    return () => { cancelled = true; };
  }, []);

  // 过滤本体列表
  const filteredOntologies = useMemo(() => {
    let list = ontologies;
    if (selectedOntologyId) {
      list = list.filter(o => o.id === selectedOntologyId);
    }
    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase();
    return list
      .map(ont => {
        const matchedObjects = (ont.objectTypes || [])
          .map(ot => {
            const matchedFields = (ot.fields || []).filter(
              f => f.name.toLowerCase().includes(term) || f.field_id.toLowerCase().includes(term)
            );
            const objectMatched = ot.displayName.toLowerCase().includes(term) || ot.name.toLowerCase().includes(term);
            if (objectMatched) return ot; // 对象名匹配时保留所有字段
            if (matchedFields.length > 0) return { ...ot, fields: matchedFields };
            return null;
          })
          .filter(Boolean);

        const ontologyMatched = ont.name.toLowerCase().includes(term);
        if (ontologyMatched) return ont; // 本体名匹配时保留所有内容
        if (matchedObjects.length > 0) return { ...ont, objectTypes: matchedObjects };
        return null;
      })
      .filter(Boolean);
  }, [ontologies, selectedOntologyId, searchTerm]);

  // 切换本体展开
  const toggleOntology = (ontId) => {
    setExpandedOntologies(prev => ({ ...prev, [ontId]: !prev[ontId] }));
  };

  // 切换对象展开
  const toggleObject = (objId) => {
    setExpandedObjects(prev => ({ ...prev, [objId]: !prev[objId] }));
  };

  // 点击字段
  const handleFieldClick = (ont, obj, field) => {
    setSelectedFieldId(field.field_id);
    onSelect?.({
      ontologyId: ont.id,
      ontologyName: ont.name,
      objectId: obj.id,
      objectName: obj.displayName,
      fieldId: field.field_id,
      fieldName: field.name,
      dataType: field.data_type,
    });
  };

  // Loading 状态
  if (loading) {
    return (
      <div className={`flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
        <div className="px-3 py-2.5 border-b border-slate-200">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索对象或字段..."
              disabled
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center py-10">
          <Loader2 size={20} className="animate-spin text-blue-500" />
          <span className="ml-2 text-sm text-slate-400">加载本体数据...</span>
        </div>
      </div>
    );
  }

  // Error 状态
  if (error) {
    return (
      <div className={`flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
        <div className="px-3 py-2.5 border-b border-slate-200">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索对象或字段..."
              disabled
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-10 px-4">
          <span className="text-sm text-red-500 mb-2">加载失败</span>
          <span className="text-xs text-slate-400 text-center">{error}</span>
          <button
            className="mt-3 text-xs text-blue-600 hover:text-blue-700 underline"
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
      {/* 搜索框 */}
      <div className="px-3 py-2.5 border-b border-slate-200">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索对象或字段..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* 树形列表 */}
      <div className="flex-1 overflow-y-auto py-1">
        {filteredOntologies.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-slate-400">无匹配结果</div>
        )}
        {filteredOntologies.map(ont => {
          const isOntExpanded = expandedOntologies[ont.id] ?? true;
          return (
            <div key={ont.id}>
              {/* 第一层：本体 */}
              <button
                className="w-full flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => toggleOntology(ont.id)}
              >
                {isOntExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                <span className="truncate">{ont.name}</span>
                <span className="ml-auto text-xs font-normal text-slate-400">{(ont.objectTypes || []).length} 对象</span>
              </button>

              {/* 展开的子树 */}
              {isOntExpanded && (ont.objectTypes || []).map(ot => {
                const isObjExpanded = expandedObjects[ot.id] ?? true;
                return (
                  <div key={ot.id}>
                    {/* 第二层：业务对象 */}
                    <button
                      className="w-full flex items-center gap-1.5 pl-7 pr-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                      onClick={() => toggleObject(ot.id)}
                    >
                      {isObjExpanded ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
                      <Database size={13} className="text-blue-500" />
                      <span className="truncate">{ot.displayName}</span>
                      <span className="ml-auto text-xs text-slate-400">{(ot.fields || []).length}</span>
                    </button>

                    {/* 第三层：属性字段 */}
                    {isObjExpanded && (ot.fields || []).map(field => {
                      const color = getDataTypeColor(field.data_type);
                      const isSelected = selectedFieldId === field.field_id;
                      return (
                        <div
                          key={field.field_id}
                          className={`flex items-center gap-2 pl-11 pr-3 py-1.5 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                          }`}
                          onClick={() => handleFieldClick(ont, ot, field)}
                        >
                          <Circle size={8} className={`flex-shrink-0 ${dotColorClass[color]}`} fill="currentColor" />
                          <span className={`text-sm truncate ${isSelected ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                            {field.name}
                          </span>
                          <span className={`ml-auto flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${badgeColorClass[color]}`}>
                            {field.data_type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
