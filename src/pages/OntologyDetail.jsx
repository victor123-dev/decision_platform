import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OntologyGraph from '../components/OntologyGraph';
import PropertyPanel from '../components/PropertyPanel';
import {
  ArrowLeft, Plus, Circle, GitBranch, Zap, Edit2, Trash2,
  ChevronRight, Upload, Check, Database, Link2, X, Table,
} from 'lucide-react';
import { api } from '@/api/apiClient';
import { instanceData as mockInstanceData } from '../data/instanceData';
import DataTable from '../components/DataTable';

/* ───────────────── Modal Component ───────────────── */
// 实例数据列名中文映射
const instanceColumnLabelMap = {
  product_id: '产品ID',
  product_name: '产品名称',
  product_type: '产品类型',
  standard_cycle_time: '标准周期时间',
  routing_steps: '工艺步骤',
  unit_of_measure: '计量单位',
  setup_group: '工序组',
  material_id: '物料ID',
  material_name: '物料名称',
  material_type: '物料类型',
  unit_price: '单价',
  stock_qty: '库存数量',
  supplier_id: '供应商ID',
  supplier_name: '供应商名称',
  supplier_type: '供应商类型',
  contact_person: '联系人',
  contact_phone: '联系电话',
  contact_email: '联系邮箱',
  phone: '电话',
  email: '邮箱',
  address: '地址',
  status: '状态',
  customer_id: '客户ID',
  customer_name: '客户名称',
  customer_level: '客户等级',
  customer_order_id: '客户订单ID',
  customer_po_number: '客户PO号',
  industry: '行业',
  industry_position: '行业地位',
  order_id: '订单ID',
  order_date: '订单日期',
  quantity: '数量',
  total_amount: '总金额',
  warehouse_id: '仓库ID',
  warehouse_name: '仓库名称',
  capacity: '容量',
  current_stock: '当前库存',
  machine_id: '设备ID',
  machine_name: '设备名称',
  machine_type: '设备类型',
  machine_type_required: '所需设备类型',
  capacity_per_hour: '每小时产能',
  max_capacity_per_hour: '最大时产能',
  rated_speed_per_hour: '额定速度/时',
  efficiency: '效率',
  efficiency_factor: '效率系数',
  maintenance_date: '维护日期',
  operator_id: '操作员ID',
  operator_name: '操作员名称',
  skill_level: '技能等级',
  shift: '班次',
  shift_id: '班次ID',
  shift_name: '班次名称',
  defect_id: '缺陷ID',
  defect_type: '缺陷类型',
  defect_count: '缺陷数量',
  detection_date: '检测日期',
  severity: '严重程度',
  id: 'ID',
  description: '说明',
  version: '版本',
  title: '标题',
  priority: '优先级',
  created_at: '创建时间',
  updated_at: '更新时间',
  created_by: '创建人',
  last_updated: '最后更新',
  last_updated_at: '最后更新时间',
  assigned_to: '指派给',
  assigned_machine_id: '分配设备ID',
  is_active: '是否激活',
  is_critical: '是否关键',
  is_hold: '是否暂停',
  is_night_shift: '是否夜班',
  is_preferred: '是否首选',
  is_workday: '是否工作日',
  keywords: '关键词',
  location: '位置',
  region: '区域',
  country: '国家',
  note: '备注',
  result: '结果',
  approval_status: '审批状态',
  operation_type: '操作类型',
  transaction_id: '事务ID',
  transaction_type: '事务类型',
  transaction_time: '事务时间',
  log_id: '日志ID',
  schedule_id: '排程ID',
  schedule_date: '排程日期',
  calendar_id: '日历ID',
  calendar_date: '日历日期',
  work_order_id: '工单ID',
  work_order_type: '工单类型',
  wom_id: '工单主ID',
  work_center_id: '工作中心ID',
  work_center_name: '工作中心名称',
  work_center_type: '工作中心类型',
  line_id: '产线ID',
  route_id: '工艺路线ID',
  route_name: '工艺路线名称',
  bom_id: 'BOM ID',
  lot_id: '批次ID',
  lot_quantity: '批次数量',
  lot_size: '批量',
  lot_status: '批次状态',
  step_id: '步骤ID',
  step_name: '步骤名称',
  current_step_id: '当前步骤ID',
  sequence_no: '序号',
  task_id: '任务ID',
  running_task_id: '运行任务ID',
  running_wo_id: '运行工单ID',
  wo_op_id: '工单操作ID',
  planned_start: '计划开始',
  planned_end: '计划结束',
  planned_start_date: '计划开始日期',
  planned_end_date: '计划结束日期',
  planned_start_time: '计划开始时间',
  planned_end_time: '计划结束时间',
  planned_quantity: '计划数量',
  planned_capacity: '计划产能',
  actual_start: '实际开始',
  actual_end: '实际结束',
  actual_start_date: '实际开始日期',
  actual_start_time: '实际开始时间',
  actual_end_time: '实际结束时间',
  actual_quantity: '实际数量',
  actual_completion_date: '实际完成日期',
  actual_delivery_date: '实际交货日期',
  actual_arrival_date: '实际到货日期',
  actual_efficiency: '实际效率',
  actual_efficiency_avg: '平均实际效率',
  actual_yield: '实际良率',
  actual_yield_avg: '平均实际良率',
  expected_output_qty: '预期产出量',
  actual_output_qty: '实际产出量',
  completed_output_qty: '完成产出量',
  completed_quantity: '完成数量',
  completed_orders: '完成订单数',
  completed_time: '完成时间',
  required_quantity: '需求数量',
  required_date: '需求日期',
  required_input_qty: '需求投入量',
  shortage_quantity: '缺料数量',
  allocated_quantity: '分配数量',
  available_quantity: '可用数量',
  available_hours: '可用工时',
  available_balance_after: '变动后可用余额',
  reserved_quantity: '预留数量',
  reserved_balance_after: '变动后预留余额',
  balance_after: '变动后余额',
  received_quantity: '已收数量',
  shipped_quantity: '已发数量',
  in_transit_quantity: '在途数量',
  consumed_quantity: '已消耗数量',
  scrap_qty: '报废数量',
  scrap_quantity: '报废量',
  scrapped_qty: '报废数量',
  rework_qty: '返工数量',
  inspect_qty: '检验数量',
  pass_qty: '合格数量',
  concession_qty: '让步数量',
  sample_count: '样本数',
  setup_time_minutes: '换型时间(分钟)',
  setup_time_actual: '实际换型时间',
  setup_completed: '换型完成',
  setup_type: '换型类型',
  wait_time_hours: '等待工时',
  wait_time_actual: '实际等待时间',
  load_hours: '负荷工时',
  total_load_hours: '总负荷工时',
  standard_time_hours: '标准工时',
  processing_start_time: '加工开始时间',
  queue_start_time: '排队开始时间',
  start_time: '开始时间',
  end_time: '结束时间',
  status_time: '状态时间',
  executed_time: '执行时间',
  requested_time: '请求时间',
  inspection_id: '检验ID',
  inspection_type: '检验类型',
  inspection_time: '检验时间',
  inspector: '检验员',
  inventory_id: '库存ID',
  fg_inv_id: '成品库存ID',
  po_id: '采购单ID',
  transfer_id: '转移ID',
  transfer_reason: '转移原因',
  from_location: '来源位置',
  to_location: '目标位置',
  from_product_id: '来源产品ID',
  to_product_id: '目标产品ID',
  from_wom_id: '来源工单主ID',
  to_wom_id: '目标工单主ID',
  from_work_order_id: '来源工单ID',
  to_work_order_id: '目标工单ID',
  related_wom_id: '关联工单主ID',
  related_work_order_id: '关联工单ID',
  related_doc_id: '关联文档ID',
  related_doc_type: '关联文档类型',
  related_document_id: '关联单据ID',
  related_document_type: '关联单据类型',
  substitute_material_id: '替代物料ID',
  substitute_priority: '替代优先级',
  quantity_per_unit: '单位数量',
  sm_id: '替代物料主ID',
  ms_id: '物料替代主ID',
  matrix_id: '矩阵ID',
  capability_id: '能力ID',
  capacity_uom: '产能单位',
  shipping_address: '发货地址',
  ship_date: '发货日期',
  tracking_number: '物流单号',
  carrier_name: '承运商',
  logistics_id: '物流ID',
  transport_time_hours: '运输时间(时)',
  lead_time_days: '前置时间(天)',
  lead_time_stddev_days: '前置时间标准差(天)',
  avg_lead_time_days: '平均前置时间(天)',
  safety_stock_level: '安全库存',
  reorder_point: '再订货点',
  eoq: '经济订购量',
  min_order_qty: '最小订购量',
  max_order_qty: '最大订购量',
  min_order_quantity: '最小订单量',
  min_batch_qty: '最小批量',
  max_batch_qty: '最大批量',
  payment_terms: '付款条款',
  credit_limit: '信用额度',
  special_price: '特价',
  quality_grade: '质量等级',
  quality_level: '质量水平',
  quality_requirement: '质量要求',
  packaging_requirement: '包装要求',
  material_ready_offset_hours: '物料齐套偏移(时)',
  material_issued: '物料已发',
  bottleneck_machine_id: '瓶颈设备ID',
  bottleneck_work_center_id: '瓶颈工作中心ID',
  utilization_rate: '利用率',
  oee: 'OEE',
  yield_rate: '良率',
  yield_rate_standard: '标准良率',
  total_orders: '总订单数',
  total_quantity: '总量',
  impact_level: '影响等级',
  impact_scope: '影响范围',
  estimated_impact_days: '预计影响天数',
  delay_days: '延迟天数',
  delay_reason: '延迟原因',
  risk_id: '风险ID',
  risk_category: '风险类别',
  risk_level: '风险等级',
  mitigation_plan: '缓解方案',
  event_date: '事件日期',
  direct: '方向',
  disposition: '处置方式',
  confidence_score: '置信度',
  reliability_score: '可靠性评分',
  potential: '潜力',
  source_name: '来源名称',
  source_url: '来源链接',
  raw_content: '原始内容',
  trigger_source: '触发来源',
  affected_products: '受影响产品',
  affected_materials: '受影响物料',
  resolved_at: '解决时间',
  association_type: '关联类型',
  consumed_pattern: '消耗模式',
  consumption_pattern: '消耗模式'
};

const getColumnLabel = (col) => instanceColumnLabelMap[col] || col;
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

/* ───────────────── Main Component ───────────────── */
export default function OntologyDetail() {
  const navigate = useNavigate();
  const { wsId, id } = useParams();

  console.log('Route params:', { wsId, id });

  // Ontology state (loaded from API)
  const [ontology, setOntology] = useState(null);
  const [loading, setLoading] = useState(true);

  // 将后端 snake_case 字段映射为前端 camelCase
  const mapObjectType = (ot) => ({
    ...ot,
    displayName: ot.display_name || ot.displayName || '',
    fields: ot.fields || (ot.properties || []).map(p => ({
      field_id: p.field_id || p.name,
      name: p.name,
      data_type: p.type || p.data_type || 'string',
      description: p.description || '',
      required: p.required || false,
      is_enum: p.is_enum || false,
      enum_values: p.enum_values || [],
    })),
  });

  const mapLinkType = (lt) => ({
    ...lt,
    displayName: lt.display_name || lt.displayName || '',
    cardinality: lt.cardinality || 'one-to-many',
    source_key: lt.source_key || '',
    target_key: lt.target_key || '',
    intermediate_model: lt.intermediate_model || null,
    intermediate_source_key: lt.intermediate_source_key || null,
    intermediate_target_key: lt.intermediate_target_key || null,
  });

  const mapActionType = (at) => ({
    ...at,
    displayName: at.display_name || at.displayName || '',
    action_type: at.action_type || 'object',
    operation: at.operation || 'update_object',
    target_model_id: at.target_model_id || at.targetModelId || null,
    target_link_id: at.target_link_id || at.targetLinkId || null,
    parameters: at.parameters || at.input_schema || [],
    submission_criteria: at.submission_criteria || at.output_schema || [],
    function_code: at.function_code || null,
  });

  const mapOntology = (data) => {
    if (!data || typeof data !== 'object') {
      console.error('Invalid ontology data:', data);
      return null;
    }
    const mapped = {
      ...data,
      objectTypes: (data.object_types || data.objectTypes || []).map(mapObjectType),
      linkTypes: (data.link_types || data.linkTypes || []).map(mapLinkType),
      actionTypes: (data.action_types || data.actionTypes || []).map(mapActionType),
      updatedAt: data.updated_at || data.updatedAt || '',
    };
    console.log('Mapped ontology:', mapped);
    return mapped;
  };

  const loadOntology = async () => {
    try {
      setLoading(true);
      console.log('Loading ontology with id:', id);
      const data = await api.get(`/ontology/${id}`);
      console.log('API response:', data);
      const mapped = mapOntology(data);
      console.log('Mapped ontology:', mapped);
      setOntology(mapped);
      setObjectTypes(mapped?.objectTypes || []);
      setLinkTypes(mapped?.linkTypes || []);
      setActionTypes(mapped?.actionTypes || []);
      loadMockInstanceData();
    } catch (err) {
      console.error('加载本体失败:', err);
      console.error('Error status:', err.status);
      console.error('Error response:', err.responseData);
    } finally {
      setLoading(false);
    }
  };

  const loadMockInstanceData = () => {
    setInstanceData(mockInstanceData);
  };

  useEffect(() => {
    loadOntology();
  }, [id]);

  // Tab state
  const [activeTab, setActiveTab] = useState('ontology-view');

  // Object states
  const [objectTypes, setObjectTypes] = useState([]);
  const [objectView, setObjectView] = useState('list');
  const [editingObject, setEditingObject] = useState(null);
  const [objectModal, setObjectModal] = useState(null); // null | 'add'
  const [fieldModal, setFieldModal] = useState(null); // null | { mode, field, index }

  // Relation states
  const [linkTypes, setLinkTypes] = useState([]);
  const [relationView, setRelationView] = useState('list');
  const [editingRelation, setEditingRelation] = useState(null);
  const [relationForm, setRelationForm] = useState({});

  // Action states
  const [actionTypes, setActionTypes] = useState([]);
  const [actionView, setActionView] = useState('list');
  const [editingAction, setEditingAction] = useState(null);
  const [actionStep, setActionStep] = useState(0);
  const [actionForm, setActionForm] = useState({});

  // Instance data states
  const [instanceData, setInstanceData] = useState({});
  const [activeSheet, setActiveSheet] = useState(null);
  const [instanceEditModal, setInstanceEditModal] = useState(null); // null | 'add' | 'edit'
  const [instanceEditForm, setInstanceEditForm] = useState({});
  const [instanceEditTarget, setInstanceEditTarget] = useState(null);
  const [instanceEditLoading, setInstanceEditLoading] = useState(false);

  // Selection state for property panel
  const [selectedItem, setSelectedItem] = useState(null);

  // ─── Helpers ───
  const statusBadge = (status) => {
    if (status === 'active') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">运行中</span>;
    if (status === 'draft') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">草稿</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{status}</span>;
  };

  const cardinalityLabel = (c) => {
    const m = { 'one-to-one': '一对一', 'one-to-many': '一对多', 'many-to-one': '多对一', 'many-to-many': '多对多' };
    return m[c] || c;
  };

  const cardinalityBadge = (c) => {
    const colors = { 'one-to-one': 'bg-blue-100 text-blue-700', 'one-to-many': 'bg-purple-100 text-purple-700', 'many-to-one': 'bg-amber-100 text-amber-700', 'many-to-many': 'bg-rose-100 text-rose-700' };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[c] || 'bg-slate-100 text-slate-600'}`}>{cardinalityLabel(c)}</span>;
  };

  const actionTypeLabel = (t) => {
    const m = { object: '对象行动', link: '关系行动', function: '函数行动' };
    return m[t] || t;
  };

  const actionTypeBadge = (t) => {
    const colors = { object: 'bg-blue-100 text-blue-700', link: 'bg-purple-100 text-purple-700', function: 'bg-amber-100 text-amber-700' };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[t] || 'bg-slate-100 text-slate-600'}`}>{actionTypeLabel(t)}</span>;
  };

  const toPascalCase = (str) => str.replace(/(^|[\s_-])(.)/g, (_, _sep, c) => c.toUpperCase()).replace(/[\s_-]/g, '');

  // ─── Instance data handlers ───
  const handleInstanceAdd = useCallback(() => {
    setInstanceEditModal('add');
    setInstanceEditForm({});
    setInstanceEditTarget(null);
  }, []);

  const handleInstanceEdit = useCallback((item) => {
    setInstanceEditModal('edit');
    setInstanceEditForm({ ...item });
    setInstanceEditTarget(item);
  }, []);

  const handleInstanceDelete = useCallback(async (item) => {
    const currentSheet = activeSheet || Object.keys(instanceData)[0];
    if (!currentSheet || !instanceData[currentSheet]) return;
    await new Promise(resolve => setTimeout(resolve, 500));
    setInstanceData(prev => ({
      ...prev,
      [currentSheet]: prev[currentSheet].filter(record => record !== item)
    }));
  }, [activeSheet, instanceData]);

  const handleInstanceFormSubmit = useCallback(async () => {
    const currentSheet = activeSheet || Object.keys(instanceData)[0];
    if (!currentSheet) return;
    setInstanceEditLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (instanceEditModal === 'add') {
        setInstanceData(prev => ({
          ...prev,
          [currentSheet]: [...(prev[currentSheet] || []), instanceEditForm]
        }));
      } else if (instanceEditModal === 'edit' && instanceEditTarget) {
        setInstanceData(prev => ({
          ...prev,
          [currentSheet]: prev[currentSheet].map(record =>
            record === instanceEditTarget ? { ...instanceEditForm } : record
          )
        }));
      }
      setInstanceEditModal(null);
      setInstanceEditForm({});
      setInstanceEditTarget(null);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setInstanceEditLoading(false);
    }
  }, [activeSheet, instanceData, instanceEditModal, instanceEditForm, instanceEditTarget]);

  const getInstanceColumns = useCallback(() => {
    const currentSheet = activeSheet || Object.keys(instanceData)[0];
    if (!currentSheet || !instanceData[currentSheet] || instanceData[currentSheet].length === 0) return [];
    return Object.keys(instanceData[currentSheet][0]);
  }, [activeSheet, instanceData]);

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-slate-500">加载本体数据中...</p>
        </div>
      </div>
    );
  }

  // ─── Empty state ───
  if (!ontology) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-slate-500 mb-3">未找到该本体</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium" onClick={() => navigate(`/w/${wsId}/ontology`)}>返回</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'ontology-view', label: '本体视图', icon: Circle },
    { key: 'business-objects', label: '业务对象', icon: Database },
    { key: 'object-relations', label: '对象关系', icon: Link2 },
    { key: 'actions', label: '行动', icon: Zap },
    { key: 'instance-data', label: '实例数据', icon: Table },
  ];

  // ═══════════════════════════════════════════════════════════════
  // TAB 1: 本体视图
  // ═══════════════════════════════════════════════════════════════
  const renderOntologyView = () => {
    const selectedId = selectedItem?.data?.id || null;

    return (
      <div className="flex flex-col flex-1 min-h-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200">
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1" onClick={() => {
            const newId = `ot-${Date.now()}`;
            const newObj = { id: newId, name: 'NewObject', displayName: '新对象', description: '', primary_key_id: '', fields: [], properties: [], position: { x: 200 + Math.random() * 400, y: 200 + Math.random() * 200 } };
            setEditingObject(newObj);
            setObjectView('edit');
            setActiveTab('business-objects');
          }}>
            <Plus size={12} /> 新增对象
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1" onClick={() => {
            if (objectTypes.length < 2) {
              alert('请至少创建两个业务对象后再创建关系');
              return;
            }
            const newId = `lk-${Date.now()}`;
            const newLink = { 
              id: newId, 
              name: 'new_relation', 
              displayName: '新关系', 
              description: '', 
              source: objectTypes[0]?.id || '', 
              target: objectTypes[1]?.id || objectTypes[0]?.id || '', 
              cardinality: 'one-to-many',
              source_key: '',
              target_key: '',
              intermediate_model: null,
              intermediate_source_key: null,
              intermediate_target_key: null
            };
            setEditingRelation(newLink);
            setRelationForm(newLink);
            setRelationView('edit');
            setActiveTab('object-relations');
          }}>
            <Link2 size={12} /> 新增关系
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1" onClick={() => {
            const newId = `act-${Date.now()}`;
            const newAction = {
              id: newId,
              name: 'NewAction',
              displayName: '新行动',
              description: '',
              action_type: 'object',
              operation: 'update_object',
              target_model_id: objectTypes[0]?.id || null,
              target_link_id: null,
              parameters: [],
              submission_criteria: [],
              function_code: null,
              targetObjectType: null,
              position: { x: 300 + Math.random() * 300, y: 300 + Math.random() * 100 },
            };
            setEditingAction(newAction);
            setActionForm({ ...newAction });
            setActionStep(0);
            setActionView('edit');
            setActiveTab('actions');
          }}>
            <Zap size={12} /> 新增行动
          </button>
        </div>
        {/* Graph + Property Panel */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 min-w-0">
            <OntologyGraph
              objectTypes={objectTypes}
              actionTypes={actionTypes}
              linkTypes={linkTypes}
              onSelect={setSelectedItem}
              selectedId={selectedId}
            />
          </div>
          <PropertyPanel
            selectedItem={selectedItem}
            objectTypes={objectTypes}
            actionTypes={actionTypes}
            linkTypes={linkTypes}
            onClose={() => setSelectedItem(null)}
            onEdit={(item) => {
              if (item.type === 'business_model') {
                const obj = objectTypes.find(o => o.id === item.data.id);
                if (obj) { setEditingObject({ ...obj }); setObjectView('edit'); setActiveTab('business-objects'); }
              } else if (item.type === 'action') {
                const act = actionTypes.find(a => a.id === item.data.id);
                if (act) { setEditingAction(act); setActionForm({ ...act }); setActionStep(0); setActionView('edit'); setActiveTab('actions'); }
              } else if (item.type === 'link') {
                const link = linkTypes.find(l => l.id === item.data.id);
                if (link) { setEditingRelation(link); setRelationForm({ ...link }); setRelationView('edit'); setActiveTab('object-relations'); }
              }
            }}
            onDelete={(item) => {
              if (!item) return;
              if (item.type === 'business_model') {
                setObjectTypes(prev => prev.filter(o => o.id !== item.data.id));
              } else if (item.type === 'action') {
                setActionTypes(prev => prev.filter(a => a.id !== item.data.id));
              } else if (item.type === 'link') {
                setLinkTypes(prev => prev.filter(l => l.id !== item.data.id));
              }
              setSelectedItem(null);
            }}
            onFieldEdit={(objectId, fieldIdx) => {
              const obj = objectTypes.find(o => o.id === objectId);
              if (!obj) return;
              const field = (obj.fields || [])[fieldIdx];
              if (!field) return;
              setEditingObject({ ...obj });
              setObjectView('edit');
              setActiveTab('business-objects');
              // Open field modal after a short delay to ensure edit view is rendered
              setTimeout(() => {
                setFieldModal({ mode: 'edit', field: { ...field }, index: fieldIdx });
              }, 50);
            }}
            onFieldDelete={(objectId, fieldIdx) => {
              setObjectTypes(prev => prev.map(o => {
                if (o.id !== objectId) return o;
                const updatedFields = [...(o.fields || [])];
                updatedFields.splice(fieldIdx, 1);
                return { ...o, fields: updatedFields };
              }));
              setSelectedItem(prev => {
                if (!prev || prev.type !== 'business_model' || prev.data.id !== objectId) return prev;
                const updatedFields = [...(prev.data.fields || [])];
                updatedFields.splice(fieldIdx, 1);
                return { ...prev, data: { ...prev.data, fields: updatedFields } };
              });
            }}
          />
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB 2: 业务对象
  // ═══════════════════════════════════════════════════════════════
  const renderBusinessObjects = () => {
    if (objectView === 'edit' && editingObject) return renderObjectEdit();

    return (
      <div className="p-6">
        {/* Action bar */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">业务对象列表</h2>
          <div className="flex items-center gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium flex items-center gap-1" onClick={() => {
              const newId = `ot-${Date.now()}`;
              const newObj = { id: newId, name: 'NewObject', displayName: '新对象', description: '', primary_key_id: '', fields: [], properties: [], position: { x: 300, y: 200 } };
              setEditingObject(newObj);
              setObjectView('edit');
            }}>
              <Plus size={14} /> 新增对象
            </button>
            <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md px-4 py-2 text-sm flex items-center gap-1">
              <Upload size={14} /> 导入对象
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">对象ID</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">对象名称</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">说明</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">主键ID</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">字段数</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {objectTypes.map(ot => (
                <tr key={ot.id} className="hover:bg-slate-50 border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{ot.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{ot.displayName}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{ot.description}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{ot.primary_key_id || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">{(ot.fields || []).length}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1" onClick={() => { setEditingObject({ ...ot }); setObjectView('edit'); }}>
                        <Edit2 size={12} /> 编辑
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1" onClick={() => setObjectTypes(prev => prev.filter(o => o.id !== ot.id))}>
                        <Trash2 size={12} /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {objectTypes.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">暂无业务对象</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderObjectEdit = () => {
    const obj = editingObject;
    if (!obj) return null;
    const fields = obj.fields || [];

    const updateObj = (key, val) => setEditingObject(prev => ({ ...prev, [key]: val }));
    const saveObject = () => {
      if (!obj.displayName?.trim()) {
        alert('请填写对象名称');
        return;
      }
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(obj.name)) {
        alert('对象ID格式不正确，应以字母开头，只能包含字母、数字和下划线');
        return;
      }
      const isNew = !objectTypes.find(o => o.id === obj.id);
      if (isNew) {
        setObjectTypes(prev => [...prev, obj]);
      } else {
        setObjectTypes(prev => prev.map(o => o.id === obj.id ? obj : o));
      }
      setObjectView('list');
      setEditingObject(null);
    };

    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md px-3 py-1.5 text-sm flex items-center gap-1" onClick={() => { setObjectView('list'); setEditingObject(null); }}>
            <ArrowLeft size={14} /> 返回列表
          </button>
          <h2 className="text-base font-semibold text-slate-700">编辑对象: {obj.displayName}</h2>
        </div>

        {/* Basic info card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">基本信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">对象ID</label>
              <input className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" value={obj.id} readOnly />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">对象名称</label>
              <input className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={obj.displayName} onChange={e => updateObj('displayName', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">说明</label>
              <textarea className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={2} value={obj.description} onChange={e => updateObj('description', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">主键ID</label>
              <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={obj.primary_key_id || ''} onChange={e => updateObj('primary_key_id', e.target.value)}>
                <option value="">-- 选择主键 --</option>
                {fields.map(f => <option key={f.field_id} value={f.field_id}>{f.field_id} ({f.name})</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Fields card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">属性字段</h3>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1" onClick={() => {
              const newField = { field_id: `field-${Date.now()}`, name: '新字段', data_type: 'string', description: '', required: false, is_enum: false, enum_values: [] };
              setEditingObject(prev => ({ ...prev, fields: [...(prev.fields || []), newField] }));
            }}>
              <Plus size={12} /> 添加字段
            </button>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">field_id</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">名称</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">数据类型</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">说明</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">必填</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">枚举</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f, idx) => (
                <tr key={f.field_id} className="hover:bg-slate-50 border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">{f.field_id}</td>
                  <td className="px-3 py-2 text-sm text-slate-700">{f.name}</td>
                  <td className="px-3 py-2"><span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">{f.data_type}</span></td>
                  <td className="px-3 py-2 text-sm text-slate-500 max-w-[200px] truncate">{f.description}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${f.required ? 'bg-green-500' : 'bg-slate-300'}`} />
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">{f.is_enum ? (f.enum_values || []).join(', ') : '-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-700 text-xs" onClick={() => setFieldModal({ mode: 'edit', field: { ...f }, index: idx })}>编辑</button>
                      <button className="text-red-600 hover:text-red-700 text-xs" onClick={() => {
                        setEditingObject(prev => ({ ...prev, fields: prev.fields.filter((_, i) => i !== idx) }));
                      }}>删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {fields.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-400">暂无字段</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 py-2 text-sm font-medium" onClick={saveObject}>保存</button>
        </div>

        {/* Field edit modal */}
        <Modal open={fieldModal !== null} title={fieldModal?.mode === 'edit' ? '编辑字段' : '添加字段'} onClose={() => setFieldModal(null)}>
          {fieldModal && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">field_id</label>
                <input className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={fieldModal.field.field_id} onChange={e => setFieldModal(prev => ({ ...prev, field: { ...prev.field, field_id: e.target.value } }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">名称</label>
                <input className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={fieldModal.field.name} onChange={e => setFieldModal(prev => ({ ...prev, field: { ...prev.field, name: e.target.value } }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">数据类型</label>
                <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={fieldModal.field.data_type} onChange={e => setFieldModal(prev => ({ ...prev, field: { ...prev.field, data_type: e.target.value } }))}>
                  {['string', 'integer', 'float', 'boolean', 'date', 'datetime', 'text'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">说明</label>
                <input className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={fieldModal.field.description} onChange={e => setFieldModal(prev => ({ ...prev, field: { ...prev.field, description: e.target.value } }))} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={fieldModal.field.required} onChange={e => setFieldModal(prev => ({ ...prev, field: { ...prev.field, required: e.target.checked } }))} className="rounded border-slate-300" />
                <label className="text-sm text-slate-600">必填</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={fieldModal.field.is_enum} onChange={e => setFieldModal(prev => ({ ...prev, field: { ...prev.field, is_enum: e.target.checked } }))} className="rounded border-slate-300" />
                <label className="text-sm text-slate-600">枚举</label>
              </div>
              {fieldModal.field.is_enum && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">枚举值 (逗号分隔)</label>
                  <input className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={(fieldModal.field.enum_values || []).join(', ')} onChange={e => setFieldModal(prev => ({ ...prev, field: { ...prev.field, enum_values: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } }))} />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md px-4 py-2 text-sm" onClick={() => setFieldModal(null)}>取消</button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium" onClick={() => {
                  const updatedFields = [...(editingObject.fields || [])];
                  updatedFields[fieldModal.index] = fieldModal.field;
                  setEditingObject(prev => ({ ...prev, fields: updatedFields }));
                  setFieldModal(null);
                }}>保存</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB 3: 对象关系
  // ═══════════════════════════════════════════════════════════════
  const renderObjectRelations = () => {
    if (relationView === 'edit') return renderRelationEdit();

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">对象关系列表</h2>
          <div className="flex items-center gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium flex items-center gap-1" onClick={() => {
              const newLink = { id: `lk-${Date.now()}`, name: 'new_relation', displayName: '新关系', description: '', source: objectTypes[0]?.id || '', target: objectTypes[1]?.id || objectTypes[0]?.id || '', cardinality: 'one-to-many', source_key: '', target_key: '', intermediate_model: null, intermediate_source_key: null, intermediate_target_key: null };
              setEditingRelation(newLink);
              setRelationForm(newLink);
              setRelationView('edit');
            }}>
              <Plus size={14} /> 新增关系
            </button>
            <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md px-4 py-2 text-sm flex items-center gap-1">
              <Upload size={14} /> 导入关系
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">关系ID</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">关系名称</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">说明</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">关系类型</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {linkTypes.map(lt => (
                <tr key={lt.id} className="hover:bg-slate-50 border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{lt.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{lt.displayName}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{lt.description}</td>
                  <td className="px-4 py-3">{cardinalityBadge(lt.cardinality)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1" onClick={() => {
                        setEditingRelation(lt);
                        setRelationForm({ ...lt });
                        setRelationView('edit');
                      }}>
                        <Edit2 size={12} /> 编辑
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1" onClick={() => setLinkTypes(prev => prev.filter(l => l.id !== lt.id))}>
                        <Trash2 size={12} /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {linkTypes.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">暂无关系</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRelationEdit = () => {
    const isNew = !linkTypes.find(l => l.id === relationForm.id);
    const isManyToMany = relationForm.cardinality === 'many-to-many';
    const intermediateObj = objectTypes.find(o => o.id === relationForm.intermediate_model);

    const saveRelation = () => {
      if (!relationForm.displayName?.trim()) {
        alert('请填写关系名称');
        return;
      }
      if (!relationForm.source) {
        alert('请选择源对象');
        return;
      }
      if (!relationForm.target) {
        alert('请选择目标对象');
        return;
      }
      if (relationForm.source === relationForm.target) {
        alert('源对象和目标对象不能相同');
        return;
      }
      if (relationForm.cardinality === 'many-to-many' && !relationForm.intermediate_model) {
        alert('多对多关系需要选择中间表');
        return;
      }
      if (isNew) {
        setLinkTypes(prev => [...prev, relationForm]);
      } else {
        setLinkTypes(prev => prev.map(l => l.id === relationForm.id ? relationForm : l));
      }
      setRelationView('list');
      setEditingRelation(null);
      setRelationForm({});
    };

    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md px-3 py-1.5 text-sm flex items-center gap-1" onClick={() => { setRelationView('list'); setEditingRelation(null); setRelationForm({}); }}>
            <ArrowLeft size={14} /> 返回列表
          </button>
          <h2 className="text-base font-semibold text-slate-700">{isNew ? '新增关系' : `编辑关系: ${relationForm.displayName}`}</h2>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">基本信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">关系ID</label>
              <input className={`w-full border border-slate-200 rounded-md px-3 py-2 text-sm ${isNew ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-slate-50 text-slate-500 cursor-not-allowed'}`} value={relationForm.id || ''} readOnly={!isNew} onChange={e => isNew && setRelationForm(prev => ({ ...prev, id: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">关系名称</label>
              <input className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={relationForm.displayName || ''} onChange={e => setRelationForm(prev => ({ ...prev, displayName: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">说明</label>
              <textarea className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={2} value={relationForm.description || ''} onChange={e => setRelationForm(prev => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-2">关系类型</label>
              <div className="flex items-center gap-4">
                {[{ value: 'one-to-one', label: '一对一' }, { value: 'one-to-many', label: '一对多' }, { value: 'many-to-one', label: '多对一' }, { value: 'many-to-many', label: '多对多' }].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="cardinality" value={opt.value} checked={relationForm.cardinality === opt.value} onChange={e => setRelationForm(prev => ({ ...prev, cardinality: e.target.value }))} className="text-blue-600" />
                    <span className="text-sm text-slate-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">源对象</label>
              <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={relationForm.source || ''} onChange={e => setRelationForm(prev => ({ ...prev, source: e.target.value }))}>
                <option value="">-- 选择源对象 --</option>
                {objectTypes.map(o => <option key={o.id} value={o.id}>{o.displayName} ({o.name})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">目标对象</label>
              <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={relationForm.target || ''} onChange={e => setRelationForm(prev => ({ ...prev, target: e.target.value }))}>
                <option value="">-- 选择目标对象 --</option>
                {objectTypes.map(o => <option key={o.id} value={o.id}>{o.displayName} ({o.name})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">外键属性</label>
              <input className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={relationForm.target_key || ''} onChange={e => setRelationForm(prev => ({ ...prev, target_key: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Many-to-many dynamic section */}
        {isManyToMany && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6 border-l-4 border-l-blue-500">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">多对多关联配置</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">中间表</label>
                <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={relationForm.intermediate_model || ''} onChange={e => setRelationForm(prev => ({ ...prev, intermediate_model: e.target.value }))}>
                  <option value="">-- 选择中间表 --</option>
                  {objectTypes.map(o => <option key={o.id} value={o.id}>{o.displayName} ({o.name})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">中间表关联源对象外键属性</label>
                <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={relationForm.intermediate_source_key || ''} onChange={e => setRelationForm(prev => ({ ...prev, intermediate_source_key: e.target.value }))}>
                  <option value="">-- 选择字段 --</option>
                  {(intermediateObj?.fields || []).map(f => <option key={f.field_id} value={f.field_id}>{f.name} ({f.field_id})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">中间表关联目标对象属性</label>
                <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={relationForm.intermediate_target_key || ''} onChange={e => setRelationForm(prev => ({ ...prev, intermediate_target_key: e.target.value }))}>
                  <option value="">-- 选择字段 --</option>
                  {(intermediateObj?.fields || []).map(f => <option key={f.field_id} value={f.field_id}>{f.name} ({f.field_id})</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 py-2 text-sm font-medium" onClick={saveRelation}>保存</button>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // TAB 4: 行动
  // ═══════════════════════════════════════════════════════════════
  const renderActions = () => {
    if (actionView === 'edit') return renderActionEdit();

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">行动列表</h2>
          <div className="flex items-center gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium flex items-center gap-1" onClick={() => {
              const newAction = {
                id: `act-${Date.now()}`, name: 'NewAction', displayName: '新行动', description: '',
                action_type: 'object', operation: 'update_object',
                target_model_id: objectTypes[0]?.id || null, target_link_id: null,
                parameters: [], submission_criteria: [], function_code: null,
                targetObjectType: null, position: { x: 300, y: 300 },
              };
              setEditingAction(newAction);
              setActionForm({ ...newAction });
              setActionStep(0);
              setActionView('edit');
            }}>
              <Plus size={14} /> 新增行动
            </button>
            <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md px-4 py-2 text-sm flex items-center gap-1">
              <Upload size={14} /> 导入行动
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">行动ID</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">行动名称</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">说明</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">类型</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {actionTypes.map(at => (
                <tr key={at.id} className="hover:bg-slate-50 border-b border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{at.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{at.displayName}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{at.description}</td>
                  <td className="px-4 py-3">{actionTypeBadge(at.action_type)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1" onClick={() => {
                        setEditingAction(at);
                        setActionForm({ ...at });
                        setActionStep(0);
                        setActionView('edit');
                      }}>
                        <Edit2 size={12} /> 编辑
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1" onClick={() => setActionTypes(prev => prev.filter(a => a.id !== at.id))}>
                        <Trash2 size={12} /> 删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {actionTypes.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">暂无行动</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderActionEdit = () => {
    const isNew = !actionTypes.find(a => a.id === actionForm.id);
    const manyToManyLinks = linkTypes.filter(l => l.cardinality === 'many-to-many');
    const steps = ['基础配置', '行动类型', '参数配置', '提交条件'];

    const stepIndicator = (
      <div className="flex items-center mb-8">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                i < actionStep ? 'bg-green-500 text-white' :
                i === actionStep ? 'bg-blue-600 text-white' :
                'bg-slate-200 text-slate-500'
              }`}>
                {i < actionStep ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs ${i === actionStep ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${i < actionStep ? 'bg-green-500' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>
    );

    const renderStepContent = () => {
      if (actionStep === 0) {
        return (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">基础配置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">行动ID</label>
                <input className={`w-full border border-slate-200 rounded-md px-3 py-2 text-sm ${isNew ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-slate-50 text-slate-500 cursor-not-allowed'}`} value={actionForm.id || ''} readOnly={!isNew} onChange={e => { if (isNew) setActionForm(prev => ({ ...prev, id: e.target.value, name: toPascalCase(e.target.value) })); }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">API名称 (自动生成)</label>
                <input className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed" value={actionForm.name || ''} readOnly />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">名称 <span className="text-red-500">*</span></label>
                <input className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={actionForm.displayName || ''} onChange={e => setActionForm(prev => ({ ...prev, displayName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">说明</label>
                <textarea className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={3} value={actionForm.description || ''} onChange={e => setActionForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
            </div>
          </div>
        );
      }

      if (actionStep === 1) {
        const typeCards = [
          { value: 'object', label: '对象行动', desc: '对业务对象执行创建/更新/删除操作', icon: Database },
          { value: 'link', label: '关系行动', desc: '对多对多关系执行创建/删除操作', icon: Link2 },
          { value: 'function', label: '函数行动', desc: '执行自定义函数逻辑', icon: Zap },
        ];

        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">行动类型</h3>
              <div className="grid grid-cols-3 gap-4">
                {typeCards.map(tc => (
                  <div
                    key={tc.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${actionForm.action_type === tc.value ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'}`}
                    onClick={() => setActionForm(prev => ({ ...prev, action_type: tc.value }))}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <tc.icon size={18} className={actionForm.action_type === tc.value ? 'text-blue-600' : 'text-slate-400'} />
                      <span className={`text-sm font-medium ${actionForm.action_type === tc.value ? 'text-blue-700' : 'text-slate-700'}`}>{tc.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">{tc.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic fields based on type */}
            {actionForm.action_type === 'object' && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">对象行动配置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">操作</label>
                    <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={actionForm.operation || 'update_object'} onChange={e => setActionForm(prev => ({ ...prev, operation: e.target.value }))}>
                      <option value="create_object">创建对象</option>
                      <option value="update_object">更新对象</option>
                      <option value="delete_object">删除对象</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">目标模型</label>
                    <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={actionForm.target_model_id || ''} onChange={e => setActionForm(prev => ({ ...prev, target_model_id: e.target.value }))}>
                      <option value="">-- 选择对象 --</option>
                      {objectTypes.map(o => <option key={o.id} value={o.id}>{o.displayName} ({o.name})</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {actionForm.action_type === 'link' && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">关系行动配置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">操作</label>
                    <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={actionForm.operation || 'create_link'} onChange={e => setActionForm(prev => ({ ...prev, operation: e.target.value }))}>
                      <option value="create_link">创建关系</option>
                      <option value="delete_link">删除关系</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">目标关系</label>
                    <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={actionForm.target_link_id || ''} onChange={e => setActionForm(prev => ({ ...prev, target_link_id: e.target.value }))}>
                      <option value="">-- 选择关系 --</option>
                      {manyToManyLinks.map(l => <option key={l.id} value={l.id}>{l.displayName} ({l.name})</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {actionForm.action_type === 'function' && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">函数行动配置</h3>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">代码</label>
                  <textarea
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm font-mono bg-slate-900 text-green-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={12}
                    value={actionForm.function_code || ''}
                    onChange={e => setActionForm(prev => ({ ...prev, function_code: e.target.value }))}
                    placeholder="// 在此编写函数代码..."
                  />
                </div>
              </div>
            )}
          </div>
        );
      }

      if (actionStep === 2) {
        const params = actionForm.parameters || [];
        return (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">参数配置</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1" onClick={() => {
                setActionForm(prev => ({ ...prev, parameters: [...(prev.parameters || []), { name: '', type: 'string', required: false, default_value: '', description: '' }] }));
              }}>
                <Plus size={12} /> 添加参数
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">name</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">type</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">required</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">default_value</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">description</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {params.map((p, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="px-3 py-2"><input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={p.name} onChange={e => { const np = [...params]; np[idx] = { ...np[idx], name: e.target.value }; setActionForm(prev => ({ ...prev, parameters: np })); }} /></td>
                    <td className="px-3 py-2">
                      <select className="border border-slate-200 rounded px-2 py-1 text-xs" value={p.type} onChange={e => { const np = [...params]; np[idx] = { ...np[idx], type: e.target.value }; setActionForm(prev => ({ ...prev, parameters: np })); }}>
                        {['string', 'integer', 'float', 'boolean'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input type="checkbox" checked={p.required} onChange={e => { const np = [...params]; np[idx] = { ...np[idx], required: e.target.checked }; setActionForm(prev => ({ ...prev, parameters: np })); }} className="rounded" />
                    </td>
                    <td className="px-3 py-2"><input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={p.default_value || ''} onChange={e => { const np = [...params]; np[idx] = { ...np[idx], default_value: e.target.value }; setActionForm(prev => ({ ...prev, parameters: np })); }} /></td>
                    <td className="px-3 py-2"><input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={p.description || ''} onChange={e => { const np = [...params]; np[idx] = { ...np[idx], description: e.target.value }; setActionForm(prev => ({ ...prev, parameters: np })); }} /></td>
                    <td className="px-3 py-2">
                      <button className="text-red-500 hover:text-red-700 text-xs" onClick={() => setActionForm(prev => ({ ...prev, parameters: prev.parameters.filter((_, i) => i !== idx) }))}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {params.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-xs text-slate-400">暂无参数</td></tr>
                )}
              </tbody>
            </table>
          </div>
        );
      }

      if (actionStep === 3) {
        const criteria = actionForm.submission_criteria || [];
        const paramNames = (actionForm.parameters || []).map(p => p.name);
        return (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">提交条件</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1" onClick={() => {
                setActionForm(prev => ({ ...prev, submission_criteria: [...(prev.submission_criteria || []), { field: '', condition: 'not_empty', value: '', description: '' }] }));
              }}>
                <Plus size={12} /> 添加条件
              </button>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">field</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">condition</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">value</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">description</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((c, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="px-3 py-2">
                      <select className="border border-slate-200 rounded px-2 py-1 text-xs" value={c.field} onChange={e => { const nc = [...criteria]; nc[idx] = { ...nc[idx], field: e.target.value }; setActionForm(prev => ({ ...prev, submission_criteria: nc })); }}>
                        <option value="">-- 选择 --</option>
                        {paramNames.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select className="border border-slate-200 rounded px-2 py-1 text-xs" value={c.condition} onChange={e => { const nc = [...criteria]; nc[idx] = { ...nc[idx], condition: e.target.value }; setActionForm(prev => ({ ...prev, submission_criteria: nc })); }}>
                        {['not_empty', 'in', 'greater_than', 'less_than', 'equals'].map(co => <option key={co} value={co}>{co}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2"><input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={c.value || ''} onChange={e => { const nc = [...criteria]; nc[idx] = { ...nc[idx], value: e.target.value }; setActionForm(prev => ({ ...prev, submission_criteria: nc })); }} /></td>
                    <td className="px-3 py-2"><input className="w-full border border-slate-200 rounded px-2 py-1 text-xs" value={c.description || ''} onChange={e => { const nc = [...criteria]; nc[idx] = { ...nc[idx], description: e.target.value }; setActionForm(prev => ({ ...prev, submission_criteria: nc })); }} /></td>
                    <td className="px-3 py-2">
                      <button className="text-red-500 hover:text-red-700 text-xs" onClick={() => setActionForm(prev => ({ ...prev, submission_criteria: prev.submission_criteria.filter((_, i) => i !== idx) }))}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {criteria.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-400">暂无提交条件</td></tr>
                )}
              </tbody>
            </table>
          </div>
        );
      }
      return null;
    };

    const saveAction = () => {
      if (!actionForm.displayName?.trim()) {
        alert('请填写行动名称');
        return;
      }
      if (!actionForm.action_type) {
        alert('请选择行动类型');
        return;
      }
      if (actionForm.action_type === 'object' && !actionForm.target_model_id) {
        alert('对象行动需要选择目标模型');
        return;
      }
      if (actionForm.action_type === 'link' && !actionForm.target_link_id) {
        alert('关系行动需要选择目标关系');
        return;
      }
      if (actionForm.action_type === 'function' && !actionForm.function_code?.trim()) {
        alert('函数行动需要填写代码');
        return;
      }
      if (isNew) {
        setActionTypes(prev => [...prev, actionForm]);
      } else {
        setActionTypes(prev => prev.map(a => a.id === actionForm.id ? actionForm : a));
      }
      setActionView('list');
      setEditingAction(null);
      setActionForm({});
    };

    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md px-3 py-1.5 text-sm flex items-center gap-1" onClick={() => { setActionView('list'); setEditingAction(null); setActionForm({}); }}>
            <ArrowLeft size={14} /> 返回列表
          </button>
          <h2 className="text-base font-semibold text-slate-700">{isNew ? '新增行动' : `编辑行动: ${editingAction?.displayName || actionForm.displayName}`}</h2>
        </div>

        {stepIndicator}
        {renderStepContent()}

        {/* Bottom navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md px-4 py-2 text-sm"
            onClick={() => setActionStep(prev => Math.max(0, prev - 1))}
            disabled={actionStep === 0}
            style={actionStep === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            上一步
          </button>
          {actionStep < 3 ? (
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium" onClick={() => setActionStep(prev => Math.min(3, prev + 1))}>
              下一步
            </button>
          ) : (
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium" onClick={saveAction}>
              保存
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderInstanceData = () => {
    const objectTypes = Object.keys(instanceData).filter(key => key && instanceData[key] && instanceData[key].length > 0);
    const totalRecords = Object.values(instanceData).reduce((sum, arr) => sum + (arr?.length || 0), 0);
    const currentSheet = activeSheet || objectTypes[0];

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-700">实例数据</h2>
            <span className="text-xs text-slate-400">{objectTypes.length} 种对象 · {totalRecords.toLocaleString()} 条记录</span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-2.5 py-1 text-xs font-medium flex items-center gap-1">
            <Plus size={12} /> 导入
          </button>
        </div>

        {/* Sheet tabs */}
        <div className="bg-white border-b border-slate-200 px-4 flex overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
          {objectTypes.map(typeName => (
            <button
              key={typeName}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                currentSheet === typeName
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
              }`}
              onClick={() => setActiveSheet(typeName)}
            >
              {typeName}
              <span className="ml-1 text-[10px] text-slate-400">({instanceData[typeName]?.length || 0})</span>
            </button>
          ))}
        </div>

        {/* Table content */}
        <div className="flex-1 min-h-0 overflow-auto p-3 bg-slate-50">
          {currentSheet && instanceData[currentSheet] ? (
            <DataTable
              data={instanceData[currentSheet]}
              searchable={true}
              sortable={true}
              paginated={true}
              pageSize={50}
              showIndex={true}
              exportable={true}
              editable={true}
              onAdd={handleInstanceAdd}
              onEdit={handleInstanceEdit}
              onDelete={handleInstanceDelete}
              emptyMessage={`${currentSheet}暂无数据`}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
              <Database size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">暂无对象类实例数据</p>
              <p className="text-sm text-slate-400 mt-1">点击上方按钮导入实例数据</p>
            </div>
          )}
        </div>

        {/* Instance Edit Modal */}
        <Modal
          open={instanceEditModal !== null}
          onClose={() => {
            setInstanceEditModal(null);
            setInstanceEditForm({});
            setInstanceEditTarget(null);
          }}
          title={instanceEditModal === 'add' ? `新增${currentSheet || ''}实例` : `编辑${currentSheet || ''}实例`}
        >
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {getInstanceColumns().map(col => (
              <div key={col}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{getColumnLabel(col)}</label>
                <input
                  type="text"
                  value={instanceEditForm[col] ?? ''}
                  onChange={(e) => setInstanceEditForm(prev => ({ ...prev, [col]: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`请输入${getColumnLabel(col)}`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
            <button
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              onClick={() => {
                setInstanceEditModal(null);
                setInstanceEditForm({});
                setInstanceEditTarget(null);
              }}
            >
              取消
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleInstanceFormSubmit}
              disabled={instanceEditLoading}
            >
              {instanceEditLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </button>
          </div>
        </Modal>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // Main render
  // ═══════════════════════════════════════════════════════════════
  const renderContent = () => {
    switch (activeTab) {
      case 'ontology-view': return renderOntologyView();
      case 'business-objects': return renderBusinessObjects();
      case 'object-relations': return renderObjectRelations();
      case 'actions': return renderActions();
      case 'instance-data': return renderInstanceData();
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 86px)' }}>
      {/* Top toolbar */}
      <div className="h-[44px] min-h-[44px] bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button className="text-slate-500 hover:text-slate-700 p-1" onClick={() => navigate(`/w/${wsId}/ontology`)}>
            <ArrowLeft size={14} />
          </button>
          <h1 className="text-sm font-semibold text-slate-700">{ontology.name}</h1>
          {statusBadge(ontology.status)}
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-slate-200 flex">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-700 border-b-2 border-transparent'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            <div className="flex items-center gap-1.5">
              <tab.icon size={14} />
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className={`flex-1 min-h-0 bg-slate-50 ${activeTab === 'ontology-view' || activeTab === 'instance-data' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>
        {renderContent()}
      </div>
    </div>
  );
}
