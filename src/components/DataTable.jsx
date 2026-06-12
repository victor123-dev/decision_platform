import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  ChevronLeft, ChevronRight,
  Search, Download, Filter, X,
  Plus, Edit2, Trash2, AlertCircle, CheckCircle
} from 'lucide-react';

// 列名中文映射
const columnNameMap = {
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

// 数据格式化
const formatValue = (key, value) => {
  if (value === null || value === undefined) return '-';
  
  // 金额格式化
  if (key.includes('price') || key.includes('amount') || key.includes('cost')) {
    return typeof value === 'number' ? `¥${value.toLocaleString()}` : value;
  }
  
  // 百分比格式化
  if (key.includes('rate') || key.includes('efficiency') || key.includes('ratio')) {
    return typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : value;
  }
  
  // 日期格式化
  if (key.includes('date') || key.includes('time')) {
    return value;
  }
  
  // 数字格式化
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  
  return String(value);
};

// 排序图标组件
const SortIcon = ({ direction }) => {
  if (direction === 'asc') return <ChevronUp size={14} className="text-blue-600" />;
  if (direction === 'desc') return <ChevronDown size={14} className="text-blue-600" />;
  return <ChevronsUpDown size={14} className="text-slate-400" />;
};

export default function DataTable({ 
  data = [], 
  columns = [], 
  title = '',
  searchable = true,
  sortable = true,
  paginated = true,
  pageSize = 10,
  showIndex = true,
  exportable = true,
  emptyMessage = '暂无数据',
  onAdd,
  onEdit,
  onDelete,
  editable = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 获取列配置
  const columnConfigs = useMemo(() => {
    if (columns.length > 0) return columns;
    if (data.length === 0) return [];
    return Object.keys(data[0]).map(key => ({
      key,
      label: columnNameMap[key] || key,
      sortable: true,
      filterable: true,
      width: 'auto'
    }));
  }, [data, columns]);

  // 搜索过滤
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // 搜索
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(term)
        )
      );
    }
    
    // 筛选
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => 
          String(item[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });
    
    return result;
  }, [data, searchTerm, filters]);

  // 排序
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // 分页
  const totalPages = paginated ? Math.ceil(sortedData.length / pageSize) : 1;
  const paginatedData = paginated 
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  // 处理排序
  const handleSort = useCallback((key) => {
    if (!sortable) return;
    
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key, direction: 'asc' };
    });
  }, [sortable]);

  // 显示通知
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // 处理删除确认
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget || !onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget);
      showNotification('success', '删除成功');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      showNotification('error', `删除失败: ${error.message || '未知错误'}`);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, onDelete, showNotification]);

  // 处理编辑
  const handleEdit = useCallback((item) => {
    if (onEdit) {
      onEdit(item);
    }
  }, [onEdit]);

  // 处理新增
  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
    }
  }, [onAdd]);

  // 导出CSV
  const handleExport = useCallback(() => {
    const headers = columnConfigs.map(col => col.label);
    const rows = sortedData.map(item => 
      columnConfigs.map(col => {
        const value = item[col.key];
        if (value === null || value === undefined) return '';
        return String(value).includes(',') ? `"${value}"` : value;
      })
    );
    
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || '数据'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [columnConfigs, sortedData, title]);

  // 渲染分页
  const renderPagination = () => {
    if (!paginated || totalPages <= 1) return null;
    
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white">
        <div className="text-sm text-slate-500">
          共 {sortedData.length} 条记录，第 {currentPage}/{totalPages} 页
        </div>
        <div className="flex items-center gap-1">
          <button
            className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          
          {start > 1 && (
            <>
              <button
                className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 text-sm"
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>
              {start > 2 && <span className="px-1 text-slate-400">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              className={`px-3 py-1 rounded border text-sm ${
                page === currentPage
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          
          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}
              <button
                className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 text-sm"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* 工具栏 */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {title && (
              <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
            )}
            <span className="text-xs text-slate-500">
              {sortedData.length} 条记录
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 搜索框 */}
            {searchable && (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                />
                {searchTerm && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setSearchTerm('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
            
            {/* 新增按钮 */}
            {editable && onAdd && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5 text-sm font-medium flex items-center gap-1 shadow-sm"
                onClick={handleAdd}
              >
                <Plus size={14} />
                新增
              </button>
            )}
            
            {/* 筛选按钮 */}
            <button
              className={`px-3 py-1.5 border rounded-md text-sm flex items-center gap-1 ${
                showFilters 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={14} />
              筛选
            </button>
            
            {/* 导出按钮 */}
            {exportable && (
              <button
                className="px-3 py-1.5 border border-slate-200 rounded-md text-sm hover:bg-slate-50 text-slate-700 flex items-center gap-1"
                onClick={handleExport}
              >
                <Download size={14} />
                导出
              </button>
            )}
          </div>
        </div>
        
        {/* 筛选行 */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex flex-wrap gap-3">
              {columnConfigs.filter(col => col.filterable !== false).map(col => (
                <div key={col.key} className="flex-1 min-w-[150px]">
                  <label className="block text-xs text-slate-500 mb-1">{col.label}</label>
                  <input
                    type="text"
                    placeholder={`筛选${col.label}...`}
                    value={filters[col.key] || ''}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, [col.key]: e.target.value }));
                      setCurrentPage(1);
                    }}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            {Object.values(filters).some(v => v) && (
              <button
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                onClick={() => {
                  setFilters({});
                  setCurrentPage(1);
                }}
              >
                清除所有筛选
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {showIndex && (
                <th className="w-12 px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  #
                </th>
              )}
              {columnConfigs.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${
                    col.sortable !== false && sortable ? 'cursor-pointer hover:bg-slate-100' : ''
                  }`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {col.sortable !== false && sortable && (
                      <SortIcon direction={sortConfig.key === col.key ? sortConfig.direction : null} />
                    )}
                  </div>
                </th>
              ))}
              {editable && (
                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  操作
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-slate-50 transition-colors"
                >
                  {showIndex && (
                    <td className="px-3 py-1 text-center text-xs text-slate-400 font-mono">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                  )}
                  {columnConfigs.map(col => (
                    <td 
                      key={col.key} 
                      className="px-4 py-1 text-sm text-slate-700 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis"
                      title={String(item[col.key])}
                    >
                      {formatValue(col.key, item[col.key])}
                    </td>
                  ))}
                  {editable && (
                    <td className="px-3 py-1 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors"
                          onClick={() => handleEdit(item)}
                          title="编辑"
                        >
                          编辑
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          className="text-red-600 hover:text-red-800 text-xs font-medium px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors"
                          onClick={() => {
                            setDeleteTarget(item);
                            setShowDeleteConfirm(true);
                          }}
                          title="删除"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columnConfigs.length + (showIndex ? 1 : 0) + (editable ? 1 : 0)} 
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* 分页 */}
      {renderPagination()}
      
      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">确认删除</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              确定要删除这条记录吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
                disabled={isDeleting}
              >
                取消
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    删除中...
                  </>
                ) : (
                  '确认删除'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 通知提示 */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <AlertCircle size={20} className="text-red-600" />
            )}
            <p className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
            <button
              className="ml-auto text-slate-400 hover:text-slate-600"
              onClick={() => setNotification(null)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}