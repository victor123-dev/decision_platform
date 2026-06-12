import { useState, useMemo } from 'react';
import {
  Edit2, ChevronDown, ChevronRight, Database, Key,
  FileType, Hash, Text, ToggleLeft, Calendar, Box,
  Layers, Trash2
} from 'lucide-react';

/* ─── Data-type icons ─── */
const TYPE_ICONS = {
  string: Text,
  integer: Hash,
  float: Hash,
  boolean: ToggleLeft,
  date: Calendar,
  datetime: Calendar,
  text: FileType,
};

function FieldTypeIcon({ type }) {
  const Icon = TYPE_ICONS[type?.toLowerCase()] || Box;
  return <Icon size={14} className="text-slate-400" />;
}

/* ─── Empty state ─── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 px-6">
      <Database size={48} className="text-slate-300 mb-4" />
      <p className="text-sm">未选中任何对象</p>
      <p className="text-xs mt-1">点击图谱中的节点查看属性</p>
    </div>
  );
}

/* ─── Read-only field row ─── */
function FormRow({ label, value, required, isTextarea }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-slate-500 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {isTextarea ? (
        <div className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 bg-slate-50 min-h-[60px] whitespace-pre-wrap">
          {value || <span className="text-slate-300">—</span>}
        </div>
      ) : (
        <div className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 bg-slate-50 truncate">
          {value || <span className="text-slate-300">—</span>}
        </div>
      )}
    </div>
  );
}

/* ─── Collapsible section ─── */
function CollapsibleSection({ title, subtitle, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-100">
      <button
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{title}</span>
          {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
        </div>
        {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? '2000px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="px-5 pb-4">{children}</div>
      </div>
    </div>
  );
}

/* ─── Object property panel ─── */
function ObjectPanel({ objectType, onFieldEdit, onFieldDelete }) {
  const fields = objectType.fields || [];

  return (
    <>
      <div className="px-5 py-5 border-b border-slate-100">
        <FormRow label="模型ID" value={objectType.id} />
        <FormRow label="API名称" value={objectType.name} />
        <FormRow label="中文名称" value={objectType.displayName} required />
        <FormRow label="中文说明" value={objectType.description} isTextarea />
        <FormRow label="主键ID" value={objectType.primary_key_id} />
        <FormRow label="数据源" value="本地SQLite数据库" />
      </div>

      <CollapsibleSection title="字段列表" subtitle={`(${fields.length} 个字段)`}>
        <div className="space-y-2">
          {fields.map((f, idx) => (
            <div key={f.field_id} className="border border-slate-200 rounded-lg p-3 bg-white hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{f.name}</span>
                  {objectType.primary_key_id === f.field_id && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                      <Key size={10} className="mr-0.5" />主键
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-xs text-blue-600 hover:text-blue-700 px-1"
                    onClick={() => onFieldEdit?.(objectType.id, idx)}
                  >
                    编辑
                  </button>
                  <button
                    className="text-xs text-red-500 hover:text-red-700 px-1"
                    onClick={() => onFieldDelete?.(objectType.id, idx)}
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FieldTypeIcon type={f.data_type} />
                  ID: {f.field_id} | 类型: {f.data_type}
                </span>
              </div>
              {f.description && (
                <p className="text-xs text-slate-400 mt-1">{f.description}</p>
              )}
              {f.is_enum && f.enum_values?.length > 0 && (
                <p className="text-xs text-slate-400 mt-1">枚举: {f.enum_values.join(', ')}</p>
              )}
            </div>
          ))}
          {fields.length === 0 && (
            <div className="text-center text-xs text-slate-400 py-4">暂无字段</div>
          )}
        </div>
      </CollapsibleSection>
    </>
  );
}

/* ─── Action property panel ─── */
function ActionPanel({ actionType, objectTypesMap }) {
  const params = actionType.parameters || [];
  const criteria = actionType.submission_criteria || [];

  const actionTypeLabel = {
    object: '对象行动',
    link: '关系行动',
    function: '函数行动',
  }[actionType.action_type] || actionType.action_type;

  const targetModelName = objectTypesMap[actionType.target_model_id]?.displayName || actionType.target_model_id || '—';

  return (
    <>
      <div className="px-5 py-5 border-b border-slate-100">
        <FormRow label="名称" value={actionType.displayName} required />
        <FormRow label="说明" value={actionType.description} isTextarea />
        <FormRow label="行动类型" value={actionTypeLabel} required />
        {actionType.action_type === 'function' && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-500 mb-1">函数代码</label>
            <div className="w-full border border-slate-200 rounded-md px-3 py-2 text-xs text-green-600 bg-slate-900 font-mono min-h-[120px] whitespace-pre-wrap overflow-auto">
              {actionType.function_code || <span className="text-slate-500">// 暂无代码</span>}
            </div>
          </div>
        )}
        {actionType.action_type === 'object' && (
          <>
            <FormRow label="操作" value={actionType.operation} />
            <FormRow label="目标模型" value={targetModelName} />
          </>
        )}
      </div>

      <CollapsibleSection title="参数配置" subtitle={`(${params.length} 个参数)`} defaultOpen={params.length > 0}>
        <div className="space-y-2">
          {params.map((p, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{p.name || `参数 ${idx + 1}`}</span>
                <span className="text-xs text-slate-400">{p.type}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{p.description || '—'}</p>
              {p.required && <span className="text-[10px] text-red-500">必填</span>}
            </div>
          ))}
          {params.length === 0 && (
            <div className="text-center text-xs text-slate-400 py-4">暂无参数</div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="提交条件" subtitle={`(${criteria.length} 个条件)`} defaultOpen={criteria.length > 0}>
        <div className="space-y-2">
          {criteria.map((c, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-white">
              <span className="text-sm font-medium text-slate-700">{c.field || `条件 ${idx + 1}`}</span>
              <p className="text-xs text-slate-500 mt-1">{c.condition} {c.value && `: ${c.value}`}</p>
            </div>
          ))}
          {criteria.length === 0 && (
            <div className="text-center text-xs text-slate-400 py-4">暂无条件</div>
          )}
        </div>
      </CollapsibleSection>
    </>
  );
}

/* ─── Link property panel ─── */
function LinkPanel({ linkType, objectTypesMap }) {
  const cardinalityLabel = {
    'one-to-one': '一对一',
    'one-to-many': '一对多',
    'many-to-one': '多对一',
    'many-to-many': '多对多',
  }[linkType.cardinality] || linkType.cardinality;

  return (
    <div className="px-5 py-5">
      <FormRow label="关系ID" value={linkType.id} />
      <FormRow label="关系名称" value={linkType.displayName} />
      <FormRow label="说明" value={linkType.description} isTextarea />
      <FormRow label="关系类型" value={cardinalityLabel} />
      <FormRow label="源对象" value={objectTypesMap[linkType.source]?.displayName || linkType.source} />
      <FormRow label="目标对象" value={objectTypesMap[linkType.target]?.displayName || linkType.target} />
      <FormRow label="源键" value={linkType.source_key} />
      <FormRow label="目标键" value={linkType.target_key} />
      {linkType.intermediate_model && (
        <>
          <FormRow label="中间模型" value={objectTypesMap[linkType.intermediate_model]?.displayName || linkType.intermediate_model} />
          <FormRow label="中间源键" value={linkType.intermediate_source_key} />
          <FormRow label="中间目标键" value={linkType.intermediate_target_key} />
        </>
      )}
    </div>
  );
}

/* ─── Main PropertyPanel ─── */
export default function PropertyPanel({
  selectedItem,
  objectTypes = [],
  actionTypes = [],
  linkTypes = [],
  onClose,
  onEdit,
  onDelete,
  onFieldEdit,
  onFieldDelete,
}) {
  const isOpen = selectedItem !== null;

  const objectTypesMap = useMemo(() => {
    const map = {};
    objectTypes.forEach(o => { map[o.id] = o; });
    return map;
  }, [objectTypes]);

  const title = useMemo(() => {
    if (!selectedItem) return '';
    if (selectedItem.type === 'business_model') return '业务模型属性';
    if (selectedItem.type === 'action') return '行动属性';
    if (selectedItem.type === 'link') return '关系属性';
    return '属性';
  }, [selectedItem]);

  const panelContent = useMemo(() => {
    if (!selectedItem) return null;
    const { type, data } = selectedItem;

    if (type === 'business_model') {
      const obj = objectTypesMap[data.id];
      if (!obj) return null;
      return <ObjectPanel objectType={obj} onFieldEdit={onFieldEdit} onFieldDelete={onFieldDelete} />;
    }

    if (type === 'action') {
      const act = actionTypes.find(a => a.id === data.id);
      if (!act) return null;
      return <ActionPanel actionType={act} objectTypesMap={objectTypesMap} />;
    }

    if (type === 'link') {
      const link = linkTypes.find(l => l.id === data.id);
      if (!link) return <LinkPanel linkType={data} objectTypesMap={objectTypesMap} />;
      return <LinkPanel linkType={link} objectTypesMap={objectTypesMap} />;
    }

    return null;
  }, [selectedItem, objectTypesMap, actionTypes, linkTypes, onFieldEdit, onFieldDelete]);

  return (
    <div
      className={`flex-shrink-0 h-full bg-white border-l border-slate-200 shadow-lg transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${
        isOpen ? 'w-[360px] opacity-100' : 'w-0 opacity-0'
      }`}
      style={{ minWidth: isOpen ? 360 : 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {isOpen && (
          <div className="flex items-center gap-2">
            <button
              className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1"
              onClick={() => onEdit?.(selectedItem)}
            >
              <Edit2 size={12} /> 编辑
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isOpen ? panelContent : <EmptyState />}
      </div>

      {/* Bottom delete button (visible when open) */}
      {isOpen && selectedItem && (
        <div className="px-5 py-3 border-t border-slate-100 flex-shrink-0">
          <button
            className="w-full flex items-center justify-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md px-4 py-2 text-sm transition-colors"
            onClick={() => onDelete?.(selectedItem)}
          >
            <Trash2 size={14} /> 删除
          </button>
        </div>
      )}
    </div>
  );
}
