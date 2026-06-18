// =============================================================================
// Decision Intelligence Platform - Mock Data
// Comprehensive mock data for credit scoring, risk control, supply chain scenarios
// =============================================================================

// ---------------------------------------------------------------------------
// Dashboard KPIs
// ---------------------------------------------------------------------------
export const dashboardKPIs = [
  { label: '决策执行总数', value: '12,847', delta: '+12.5%', positive: true, period: '本月' },
  { label: '决策成功率', value: '97.3%', delta: '+0.8%', positive: true, period: '本月' },
  { label: '活跃规则集', value: '23', delta: '+3', positive: true, period: '较上月' },
  { label: '在线决策流', value: '8', delta: '-1', positive: false, period: '较上月' },
];

// ---------------------------------------------------------------------------
// Execution trend data for recharts LineChart - 7 days of data
// ---------------------------------------------------------------------------
export const executionTrend = [
  { date: '05-28', executions: 1820, success: 1768, failed: 52 },
  { date: '05-29', executions: 1935, success: 1891, failed: 44 },
  { date: '05-30', executions: 2104, success: 2058, failed: 46 },
  { date: '05-31', executions: 1756, success: 1712, failed: 44 },
  { date: '06-01', executions: 2290, success: 2230, failed: 60 },
  { date: '06-02', executions: 1847, success: 1801, failed: 46 },
  { date: '06-03', executions: 2095, success: 2043, failed: 52 },
];

// ---------------------------------------------------------------------------
// Rule hit rate data for recharts PieChart
// ---------------------------------------------------------------------------
export const ruleHitRate = [
  { name: '命中', value: 68, fill: '#0ea5e9' },
  { name: '未命中', value: 24, fill: '#334155' },
  { name: '异常', value: 8, fill: '#ef4444' },
];

// ---------------------------------------------------------------------------
// Top 5 flows data for recharts BarChart
// ---------------------------------------------------------------------------
export const topFlows = [
  { name: '信用评分流', executions: 4520 },
  { name: '风控决策流', executions: 3180 },
  { name: '订单审核流', executions: 2340 },
  { name: '库存补货流', executions: 1890 },
  { name: '供应商评估流', executions: 1240 },
];

// ---------------------------------------------------------------------------
// Recent executions timeline
// ---------------------------------------------------------------------------
export const recentExecutions = [
  { id: 'exec-001', flow: '信用评分决策流', status: 'success', time: '14:32:18', duration: '1.2s', result: '通过' },
  { id: 'exec-002', flow: '风控决策流', status: 'success', time: '14:31:45', duration: '0.8s', result: '批准' },
  { id: 'exec-003', flow: '订单审核流', status: 'warning', time: '14:30:22', duration: '2.1s', result: '需人工审核' },
  { id: 'exec-004', flow: '信用评分决策流', status: 'success', time: '14:29:55', duration: '1.0s', result: '拒绝' },
  { id: 'exec-005', flow: '库存补货流', status: 'failed', time: '14:28:33', duration: '5.0s', result: '超时' },
  { id: 'exec-006', flow: '供应商评估流', status: 'success', time: '14:27:10', duration: '1.5s', result: 'A级' },
  { id: 'exec-007', flow: '风控决策流', status: 'success', time: '14:26:48', duration: '0.9s', result: '通过' },
  { id: 'exec-008', flow: '信用评分决策流', status: 'success', time: '14:25:12', duration: '1.1s', result: '通过' },
];

// ---------------------------------------------------------------------------
// Rule sets - 6 rule sets with business meaning
// ---------------------------------------------------------------------------
export const ruleSets = [
  {
    id: 'rs-001',
    name: '个人信用评分规则',
    description: '基于个人征信数据计算信用评分',
    ruleCount: 8,
    tags: ['风控', '信贷'],
    creator: '张工',
    version: 'v2.3',
    updatedAt: '2026-06-02 16:30',
    checkedOutBy: null,
    status: 'active',
    rules: [
      { id: 'r-001', name: '年龄校验', condition: '${age} >= 18 && ${age} <= 65', thenAction: 'score = 10', elseAction: 'score = 0', enabled: true, priority: 1 },
      { id: 'r-002', name: '收入评估', condition: '${monthly_income} > 8000', thenAction: 'score = score + 20', elseAction: 'score = score + 5', enabled: true, priority: 2 },
      { id: 'r-003', name: '负债率检查', condition: '${debt_ratio} < 0.4', thenAction: 'score = score + 15', elseAction: 'score = score - 10', enabled: true, priority: 3 },
      { id: 'r-004', name: '征信查询次数', condition: '${credit_inquiries_30d} < 5', thenAction: 'score = score + 10', elseAction: 'score = score - 5', enabled: true, priority: 4 },
      { id: 'r-005', name: '历史逾期记录', condition: '${overdue_count_12m} == 0', thenAction: 'score = score + 25', elseAction: 'score = score - 15', enabled: true, priority: 5 },
      { id: 'r-006', name: '工作稳定性', condition: '${employment_years} >= 2', thenAction: 'score = score + 10', elseAction: 'score = score + 0', enabled: true, priority: 6 },
      { id: 'r-007', name: '房产加分', condition: '${has_property} == true', thenAction: 'score = score + 10', elseAction: '', enabled: false, priority: 7 },
      { id: 'r-008', name: '最终评级', condition: '${score} >= 80', thenAction: 'level = "A"', elseAction: '${score} >= 60 ? level = "B" : level = "C"', enabled: true, priority: 8 },
    ],
  },
  {
    id: 'rs-002',
    name: '反欺诈交易规则',
    description: '识别可疑交易并触发风控动作',
    ruleCount: 5,
    tags: ['风控', '反欺诈'],
    creator: '李工',
    version: 'v1.8',
    updatedAt: '2026-06-01 09:15',
    checkedOutBy: null,
    status: 'active',
    rules: [
      { id: 'r-101', name: '大额交易预警', condition: '${transaction_amount} > 50000', thenAction: 'risk_level = "high"', elseAction: '', enabled: true, priority: 1 },
      { id: 'r-102', name: '短时间频繁交易', condition: '${transactions_1h} > 10', thenAction: 'risk_level = "high"', elseAction: '', enabled: true, priority: 2 },
      { id: 'r-103', name: '异地交易检查', condition: '${ip_city} != ${registered_city}', thenAction: 'risk_level = "medium"', elseAction: '', enabled: true, priority: 3 },
      { id: 'r-104', name: '夜间交易', condition: '${hour} >= 23 || ${hour} <= 5', thenAction: 'risk_score = risk_score + 20', elseAction: '', enabled: true, priority: 4 },
      { id: 'r-105', name: '黑名单匹配', condition: '${merchant_id} in blacklist', thenAction: 'action = "block"', elseAction: '', enabled: true, priority: 5 },
    ],
  },
  {
    id: 'rs-003',
    name: '订单自动审核规则',
    description: '自动审批符合条件的采购订单',
    ruleCount: 4,
    tags: ['供应链', '订单'],
    creator: '王工',
    version: 'v1.2',
    updatedAt: '2026-05-28 14:20',
    checkedOutBy: '王工',
    status: 'editing',
    rules: [
      { id: 'r-201', name: '小额自动审批', condition: '${order_amount} < 5000', thenAction: 'auto_approve = true', elseAction: '', enabled: true, priority: 1 },
      { id: 'r-202', name: '优选供应商放行', condition: '${supplier_tier} == "gold"', thenAction: 'auto_approve = true', elseAction: '', enabled: true, priority: 2 },
      { id: 'r-203', name: '预算检查', condition: '${order_amount} <= ${remaining_budget}', thenAction: 'budget_ok = true', elseAction: 'budget_ok = false', enabled: true, priority: 3 },
      { id: 'r-204', name: '重复订单检测', condition: '${duplicate_orders_7d} > 0', thenAction: 'flag = "duplicate"', elseAction: '', enabled: true, priority: 4 },
    ],
  },
  {
    id: 'rs-004',
    name: '库存补货规则',
    description: '根据库存水位自动触发补货建议',
    ruleCount: 3,
    tags: ['供应链', '库存'],
    creator: '赵工',
    version: 'v1.0',
    updatedAt: '2026-05-25 11:00',
    checkedOutBy: null,
    status: 'active',
    rules: [
      { id: 'r-301', name: '安全库存预警', condition: '${current_stock} < ${safety_stock}', thenAction: 'reorder = true', elseAction: '', enabled: true, priority: 1 },
      { id: 'r-302', name: '经济订货量计算', condition: '${reorder} == true', thenAction: 'order_qty = ${eoq_formula}', elseAction: 'order_qty = 0', enabled: true, priority: 2 },
      { id: 'r-303', name: '供应商选择', condition: '${category} == "A"', thenAction: 'supplier = ${primary_supplier}', elseAction: 'supplier = ${secondary_supplier}', enabled: true, priority: 3 },
    ],
  },
  {
    id: 'rs-005',
    name: '供应商评分规则',
    description: '综合评估供应商表现并分级',
    ruleCount: 4,
    tags: ['供应链', '供应商'],
    creator: '张工',
    version: 'v2.0',
    updatedAt: '2026-05-20 10:45',
    checkedOutBy: null,
    status: 'active',
    rules: [
      { id: 'r-401', name: '交货准时率', condition: '${on_time_rate} >= 0.95', thenAction: 'delivery_score = 30', elseAction: 'delivery_score = ${on_time_rate} * 30', enabled: true, priority: 1 },
      { id: 'r-402', name: '质量合格率', condition: '${quality_rate} >= 0.98', thenAction: 'quality_score = 30', elseAction: 'quality_score = ${quality_rate} * 30', enabled: true, priority: 2 },
      { id: 'r-403', name: '价格竞争力', condition: '${price_rank} <= 3', thenAction: 'price_score = 25', elseAction: 'price_score = 15', enabled: true, priority: 3 },
      { id: 'r-404', name: '响应速度', condition: '${avg_response_hours} < 24', thenAction: 'service_score = 15', elseAction: 'service_score = 8', enabled: true, priority: 4 },
    ],
  },
  {
    id: 'rs-006',
    name: '营销优惠券规则',
    description: '根据用户画像发放定向优惠券',
    ruleCount: 3,
    tags: ['营销', '用户'],
    creator: '陈工',
    version: 'v1.1',
    updatedAt: '2026-05-18 16:30',
    checkedOutBy: null,
    status: 'draft',
    rules: [
      { id: 'r-501', name: '新用户欢迎券', condition: '${days_since_register} < 7', thenAction: 'coupon = "NEW20"', elseAction: '', enabled: true, priority: 1 },
      { id: 'r-502', name: '高价值用户回馈', condition: '${total_spent} > 10000', thenAction: 'coupon = "VIP15"', elseAction: '', enabled: true, priority: 2 },
      { id: 'r-503', name: '沉睡用户唤醒', condition: '${days_since_last_order} > 30', thenAction: 'coupon = "BACK10"', elseAction: '', enabled: false, priority: 3 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Decision flows with full node/edge data
// ---------------------------------------------------------------------------
export const decisionFlows = [
  {
    id: 'flow-001',
    name: '信用评分决策流',
    description: '完整的个人信贷信用评分流程，包含数据获取、规则评估、模型预测和结果输出',
    nodeCount: 10,
    tags: ['信贷', '风控'],
    updatedAt: '2026-06-02 14:20',
    checkedOutBy: null,
    status: 'active',
    nodes: [
      { id: 'n1', type: 'interface', position: { x: 50, y: 200 }, data: { label: '开始', config: {} } },
      { id: 'n2', type: 'data_view', position: { x: 250, y: 200 }, data: { label: '获取征信数据', config: { url: '/api/credit/report', method: 'GET' } } },
      { id: 'n3', type: 'script', position: { x: 450, y: 200 }, data: { label: '数据清洗转换', config: { format: 'JSON' } } },
      { id: 'n4', type: 'rules', position: { x: 650, y: 120 }, data: { label: '基础规则评估', config: { rulesetId: 'rs-001' } } },
      { id: 'n5', type: 'ml_model', position: { x: 650, y: 300 }, data: { label: 'ML风险模型', config: { modelId: 'mdl-001', format: 'ONNX' } } },
      { id: 'n6', type: 'asynchronous', position: { x: 870, y: 200 }, data: { label: '合并评分', config: { strategy: 'weighted_avg' } } },
      { id: 'n7', type: 'if', position: { x: 1070, y: 200 }, data: { label: '评分判断', config: { condition: '${final_score} >= 60' } } },
      { id: 'n8', type: 'script', position: { x: 1270, y: 120 }, data: { label: '生成审批建议', config: { fileId: 'cf-001' } } },
      { id: 'n9', type: 'notification', position: { x: 1270, y: 300 }, data: { label: '记录拒绝原因', config: { level: 'WARN' } } },
      { id: 'n10', type: 'end', position: { x: 1470, y: 200 }, data: { label: '结束', config: {} } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4' },
      { id: 'e4', source: 'n3', target: 'n5' },
      { id: 'e5', source: 'n4', target: 'n6' },
      { id: 'e6', source: 'n5', target: 'n6' },
      { id: 'e7', source: 'n6', target: 'n7' },
      { id: 'e8', source: 'n7', target: 'n8', sourceHandle: 'yes', label: '通过' },
      { id: 'e9', source: 'n7', target: 'n9', sourceHandle: 'no', label: '拒绝' },
      { id: 'e10', source: 'n8', target: 'n10' },
      { id: 'e11', source: 'n9', target: 'n10' },
    ],
  },
  {
    id: 'flow-002',
    name: '反欺诈交易监控流',
    description: '实时交易风控流程，支持规则+模型双重校验',
    nodeCount: 7,
    tags: ['风控', '反欺诈'],
    updatedAt: '2026-06-01 09:30',
    checkedOutBy: null,
    status: 'active',
    nodes: [
      { id: 'n1', type: 'interface', position: { x: 50, y: 150 }, data: { label: '交易事件', config: {} } },
      { id: 'n2', type: 'rules', position: { x: 250, y: 150 }, data: { label: '反欺诈规则', config: { rulesetId: 'rs-002' } } },
      { id: 'n3', type: 'if', position: { x: 470, y: 150 }, data: { label: '风险等级', config: { condition: '${risk_level} == "high"' } } },
      { id: 'n4', type: 'ml_model', position: { x: 690, y: 80 }, data: { label: '欺诈检测模型', config: { modelId: 'mdl-002' } } },
      { id: 'n5', type: 'notification', position: { x: 690, y: 250 }, data: { label: '安全交易日志', config: { level: 'INFO' } } },
      { id: 'n6', type: 'subprocess', position: { x: 910, y: 80 }, data: { label: '人工审核子流程', config: { subflowId: 'flow-004' } } },
      { id: 'n7', type: 'end', position: { x: 1110, y: 150 }, data: { label: '处理完成', config: {} } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4', sourceHandle: 'yes', label: '高风险' },
      { id: 'e4', source: 'n3', target: 'n5', sourceHandle: 'no', label: '正常' },
      { id: 'e5', source: 'n4', target: 'n6' },
      { id: 'e6', source: 'n5', target: 'n7' },
      { id: 'e7', source: 'n6', target: 'n7' },
    ],
  },
  {
    id: 'flow-003',
    name: '自动订单审核流',
    description: '采购订单自动审批与人工复核流程',
    nodeCount: 6,
    tags: ['供应链', '订单'],
    updatedAt: '2026-05-28 11:00',
    checkedOutBy: null,
    status: 'draft',
    nodes: [
      { id: 'n1', type: 'interface', position: { x: 50, y: 150 }, data: { label: '新订单', config: {} } },
      { id: 'n2', type: 'rules', position: { x: 250, y: 150 }, data: { label: '订单审核规则', config: { rulesetId: 'rs-003' } } },
      { id: 'n3', type: 'if', position: { x: 470, y: 150 }, data: { label: '是否自动审批', config: { condition: '${auto_approve} == true' } } },
      { id: 'n4', type: 'script', position: { x: 690, y: 80 }, data: { label: '自动审批处理', config: { fileId: 'cf-002' } } },
      { id: 'n5', type: 'notification', position: { x: 690, y: 250 }, data: { label: '转人工审核', config: { level: 'WARN' } } },
      { id: 'n6', type: 'end', position: { x: 910, y: 150 }, data: { label: '订单处理完成', config: {} } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4', sourceHandle: 'yes', label: '自动' },
      { id: 'e4', source: 'n3', target: 'n5', sourceHandle: 'no', label: '人工' },
      { id: 'e5', source: 'n4', target: 'n6' },
      { id: 'e6', source: 'n5', target: 'n6' },
    ],
  },
  {
    id: 'flow-004',
    name: '库存智能补货流',
    description: '基于库存水位的自动补货决策',
    nodeCount: 5,
    tags: ['供应链', '库存'],
    updatedAt: '2026-05-25 15:30',
    checkedOutBy: null,
    status: 'active',
    nodes: [],
    edges: [],
  },
  {
    id: 'flow-005',
    name: 'n8n增强决策流（实验）',
    description: '基于 n8n 节点体系增强的决策流程，包含数据过滤、多路分支、HTTP请求、数据转换等新增节点，用于验证改造效果',
    nodeCount: 14,
    tags: ['实验', 'n8n增强'],
    updatedAt: '2026-06-10 10:00',
    checkedOutBy: null,
    status: 'draft',
    nodes: [
      { id: 'n1', type: 'manual_trigger', position: { x: 50, y: 200 }, data: { label: '手动触发', config: { description: '点击按钮启动流程' } } },
      { id: 'n2', type: 'http_request', position: { x: 250, y: 200 }, data: { label: '获取外部数据', config: { ontology_model: '客户360', business_object: 'Order / 订单', relation: '客户下单 (places)', property_fields: '订单ID, 订单金额, 订单状态, 下单时间', action_binding: '无', access_mode: '查询对象' } } },
      { id: 'n3', type: 'filter', position: { x: 450, y: 200 }, data: { label: '数据过滤', config: { ontology_model: '客户360', business_object: 'Order / 订单', filter_property: '订单金额', filter_operator: '大于', filter_value: '1000', combine_logic: 'AND' } } },
      { id: 'n4', type: 'edit_fields', position: { x: 650, y: 200 }, data: { label: '字段标准化', config: { ontology_model: '客户360', source_object: 'Order / 订单', source_properties: '订单金额, 订单状态', target_object: 'Order / 订单', target_properties: 'amount, status', mapping_mode: '属性直接映射', mapping_expression: '' } } },
      { id: 'n5', type: 'sort', position: { x: 850, y: 200 }, data: { label: '按金额排序', config: { ontology_model: '客户360', business_object: 'Order / 订单', sort_property: '订单金额', sort_direction: '降序 (DESC)' } } },
      { id: 'n6', type: 'remove_duplicates', position: { x: 1050, y: 200 }, data: { label: '去除重复', config: { ontology_model: '客户360', business_object: 'Order / 订单', dedupe_property: '订单ID', dedupe_strategy: '保留首条' } } },
      { id: 'n7', type: 'switch', position: { x: 1250, y: 200 }, data: { label: '风险等级分支', config: { mode: '规则匹配', number_of_outputs: 3 } } },
      { id: 'n8', type: 'rules', position: { x: 1470, y: 100 }, data: { label: '高风险规则', config: { rulesetId: 'rs-001' } } },
      { id: 'n9', type: 'code', position: { x: 1470, y: 200 }, data: { label: '中风险处理', config: { language: 'JavaScript', execution_mode: '每项执行一次' } } },
      { id: 'n10', type: 'no_op', position: { x: 1470, y: 300 }, data: { label: '低风险跳过', config: {} } },
      { id: 'n11', type: 'merge', position: { x: 1690, y: 200 }, data: { label: '合并结果', config: { mode: '追加' } } },
      { id: 'n12', type: 'summarize', position: { x: 1890, y: 200 }, data: { label: '结果汇总', config: { ontology_model: '客户360', business_object: 'Order / 订单', group_property: '订单状态', aggregate_property: '订单金额', aggregate_action: '求和' } } },
      { id: 'n13', type: 'date_time', position: { x: 2090, y: 200 }, data: { label: '添加时间戳', config: { ontology_model: '客户360', business_object: 'Order / 订单', time_property: '下单时间', operation: '获取当前日期', output_format: 'YYYY-MM-DD HH:mm:ss', offset_value: 0, offset_unit: '天' } } },
      { id: 'n14', type: 'end', position: { x: 2290, y: 200 }, data: { label: '结束', config: {} } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4' },
      { id: 'e4', source: 'n4', target: 'n5' },
      { id: 'e5', source: 'n5', target: 'n6' },
      { id: 'e6', source: 'n6', target: 'n7' },
      { id: 'e7', source: 'n7', target: 'n8', sourceHandle: 'a', label: '高风险' },
      { id: 'e8', source: 'n7', target: 'n9', sourceHandle: 'b', label: '中风险' },
      { id: 'e9', source: 'n7', target: 'n10', sourceHandle: 'c', label: '低风险' },
      { id: 'e10', source: 'n8', target: 'n11' },
      { id: 'e11', source: 'n9', target: 'n11' },
      { id: 'e12', source: 'n10', target: 'n11' },
      { id: 'e13', source: 'n11', target: 'n12' },
      { id: 'e14', source: 'n12', target: 'n13' },
      { id: 'e15', source: 'n13', target: 'n14' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Lookup tables
// ---------------------------------------------------------------------------
export const lookupTables = [
  {
    id: 'lt-001',
    name: '城市风险等级表',
    description: '各城市对应的风险等级系数',
    entryCount: 320,
    columnCount: 4,
    updatedAt: '2026-05-30 10:00',
    columns: [
      { name: 'city_code', type: 'string', label: '城市编码' },
      { name: 'city_name', type: 'string', label: '城市名称' },
      { name: 'risk_level', type: 'number', label: '风险等级' },
      { name: 'coefficient', type: 'number', label: '风险系数' },
    ],
    rows: [
      { city_code: 'BJ', city_name: '北京', risk_level: 1, coefficient: 1.2 },
      { city_code: 'SH', city_name: '上海', risk_level: 1, coefficient: 1.15 },
      { city_code: 'GZ', city_name: '广州', risk_level: 2, coefficient: 1.05 },
      { city_code: 'SZ', city_name: '深圳', risk_level: 1, coefficient: 1.1 },
      { city_code: 'CD', city_name: '成都', risk_level: 2, coefficient: 1.0 },
      { city_code: 'HZ', city_name: '杭州', risk_level: 2, coefficient: 1.05 },
      { city_code: 'WH', city_name: '武汉', risk_level: 3, coefficient: 0.95 },
      { city_code: 'NJ', city_name: '南京', risk_level: 2, coefficient: 1.0 },
    ],
  },
  {
    id: 'lt-002',
    name: '行业分类表',
    description: '标准行业分类编码',
    entryCount: 86,
    columnCount: 3,
    updatedAt: '2026-05-25 14:20',
  },
  {
    id: 'lt-003',
    name: '供应商等级配置',
    description: '供应商分级标准和权益配置',
    entryCount: 12,
    columnCount: 5,
    updatedAt: '2026-05-20 09:00',
  },
  {
    id: 'lt-004',
    name: '利率基准表',
    description: '各期限贷款基准利率',
    entryCount: 24,
    columnCount: 3,
    updatedAt: '2026-05-15 11:30',
  },
];

// ---------------------------------------------------------------------------
// Code files
// ---------------------------------------------------------------------------
export const codeFiles = [
  {
    id: 'cf-001',
    name: 'credit_score_calculator.py',
    language: 'Python',
    size: '2.4 KB',
    updatedAt: '2026-06-01 16:00',
    description: '信用评分综合计算函数',
    lines: 87,
    code: `def calculate_final_score(rule_score, model_score, weight_rule=0.4, weight_model=0.6):
    """综合计算最终信用评分"""
    final = rule_score * weight_rule + model_score * weight_model
    final = max(0, min(100, final))  # 限制在0-100范围
    
    if final >= 80:
        grade = "A"
    elif final >= 60:
        grade = "B"
    elif final >= 40:
        grade = "C"
    else:
        grade = "D"
    
    return {
        "final_score": round(final, 2),
        "grade": grade,
        "approved": final >= 60,
        "risk_level": "low" if final >= 70 else "medium" if final >= 50 else "high"
    }`,
  },
  {
    id: 'cf-002',
    name: 'order_auto_approver.py',
    language: 'Python',
    size: '1.8 KB',
    updatedAt: '2026-05-28 10:30',
    description: '订单自动审批处理逻辑',
    lines: 62,
  },
  {
    id: 'cf-003',
    name: 'fraud_feature_engineering.py',
    language: 'Python',
    size: '3.1 KB',
    updatedAt: '2026-05-26 14:00',
    description: '反欺诈特征工程',
    lines: 112,
  },
  {
    id: 'cf-004',
    name: 'inventory_eoq_calculator.py',
    language: 'Python',
    size: '1.2 KB',
    updatedAt: '2026-05-22 09:15',
    description: '经济订货量(EOQ)计算',
    lines: 45,
  },
];

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------
export const models = [
  {
    id: 'mdl-001',
    name: '信贷风险评分模型',
    format: 'ONNX',
    version: 'v3.2',
    accuracy: 0.946,
    recall: 0.921,
    f1: 0.933,
    status: 'active',
    updatedAt: '2026-05-30 16:00',
    description: '基于XGBoost的个人信贷风险评估模型',
    inputs: [
      { name: 'age', type: 'int' },
      { name: 'income', type: 'float' },
      { name: 'debt_ratio', type: 'float' },
      { name: 'credit_history_months', type: 'int' },
      { name: 'overdue_count', type: 'int' },
    ],
    outputs: [
      { name: 'risk_score', type: 'float' },
      { name: 'risk_level', type: 'string' },
    ],
    versions: [
      { version: 'v3.2', date: '2026-05-30', accuracy: 0.946, status: 'active' },
      { version: 'v3.1', date: '2026-04-15', accuracy: 0.938, status: 'archived' },
      { version: 'v3.0', date: '2026-03-01', accuracy: 0.925, status: 'archived' },
    ],
    sparkline: [0.912, 0.918, 0.925, 0.931, 0.938, 0.946],
  },
  {
    id: 'mdl-002',
    name: '交易欺诈检测模型',
    format: 'ONNX',
    version: 'v2.1',
    accuracy: 0.971,
    recall: 0.895,
    f1: 0.931,
    status: 'active',
    updatedAt: '2026-05-28 11:00',
    description: '基于深度学习的实时交易欺诈检测',
    inputs: [
      { name: 'amount', type: 'float' },
      { name: 'merchant_category', type: 'int' },
      { name: 'time_of_day', type: 'int' },
      { name: 'distance_from_home', type: 'float' },
    ],
    outputs: [
      { name: 'fraud_probability', type: 'float' },
    ],
    versions: [
      { version: 'v2.1', date: '2026-05-28', accuracy: 0.971, status: 'active' },
      { version: 'v2.0', date: '2026-04-10', accuracy: 0.963, status: 'archived' },
    ],
    sparkline: [0.945, 0.952, 0.958, 0.963, 0.968, 0.971],
  },
  {
    id: 'mdl-003',
    name: '需求预测模型',
    format: 'Python',
    version: 'v1.5',
    accuracy: 0.892,
    recall: 0.878,
    f1: 0.885,
    status: 'active',
    updatedAt: '2026-05-20 09:30',
    description: '基于时间序列的库存需求预测',
    sparkline: [0.865, 0.872, 0.881, 0.886, 0.889, 0.892],
  },
  {
    id: 'mdl-004',
    name: '客户流失预测模型',
    format: 'PMML',
    version: 'v1.0',
    accuracy: 0.856,
    recall: 0.834,
    f1: 0.845,
    status: 'draft',
    updatedAt: '2026-05-15 14:00',
    description: '基于随机森林的客户流失概率预测',
    sparkline: [0.830, 0.838, 0.845, 0.849, 0.853, 0.856],
  },
];

// ---------------------------------------------------------------------------
// Global variables
// ---------------------------------------------------------------------------
export const globalVariables = [
  { id: 'v-001', name: 'max_loan_amount', dataType: 'number', defaultValue: '500000', scope: 'global', description: '单笔贷款最大额度', updatedAt: '2026-05-30' },
  { id: 'v-002', name: 'risk_threshold', dataType: 'number', defaultValue: '0.6', scope: 'global', description: '风险评分阈值', updatedAt: '2026-05-28' },
  { id: 'v-003', name: 'auto_approve_limit', dataType: 'number', defaultValue: '50000', scope: 'global', description: '自动审批金额上限', updatedAt: '2026-05-25' },
  { id: 'v-004', name: 'blacklist_version', dataType: 'string', defaultValue: 'v2026.06', scope: 'global', description: '黑名单数据版本', updatedAt: '2026-06-01' },
  { id: 'v-005', name: 'enable_fraud_model', dataType: 'boolean', defaultValue: 'true', scope: 'global', description: '是否启用反欺诈模型', updatedAt: '2026-05-28' },
  { id: 'v-006', name: 'credit_score_weight', dataType: 'number', defaultValue: '0.4', scope: 'flow', description: '规则评分权重', updatedAt: '2026-05-20' },
  { id: 'v-007', name: 'model_score_weight', dataType: 'number', defaultValue: '0.6', scope: 'flow', description: '模型评分权重', updatedAt: '2026-05-20' },
  { id: 'v-008', name: 'review_required', dataType: 'boolean', defaultValue: 'false', scope: 'session', description: '是否需要人工复核', updatedAt: '2026-05-18' },
  { id: 'v-009', name: 'order_timeout_hours', dataType: 'number', defaultValue: '48', scope: 'flow', description: '订单审批超时时间(小时)', updatedAt: '2026-05-15' },
  { id: 'v-010', name: 'notification_email', dataType: 'string', defaultValue: 'risk-team@optdev.com', scope: 'global', description: '风控团队通知邮箱', updatedAt: '2026-05-10' },
];

// ---------------------------------------------------------------------------
// Test scenarios
// ---------------------------------------------------------------------------
export const testScenarios = [
  {
    id: 'ts-001',
    name: '标准信用评分 - 优质客户',
    flowId: 'flow-001',
    flowName: '信用评分决策流',
    lastRun: '2026-06-03 14:00',
    status: 'passed',
    inputs: { age: 32, monthly_income: 25000, debt_ratio: 0.15, credit_inquiries_30d: 1, overdue_count_12m: 0, employment_years: 5, has_property: true },
    result: { final_score: 92, grade: 'A', approved: true },
    trace: [
      { step: 1, node: '开始', status: 'success', duration: '0ms', input: '-', output: '触发执行' },
      { step: 2, node: '获取征信数据', status: 'success', duration: '230ms', input: '{ applicantId: "A001" }', output: '{ age: 32, income: 25000, ... }' },
      { step: 3, node: '数据清洗转换', status: 'success', duration: '45ms', input: '原始数据', output: '标准化JSON' },
      { step: 4, node: '基础规则评估', status: 'success', duration: '12ms', input: '8条规则', output: 'rule_score = 95' },
      { step: 5, node: 'ML风险模型', status: 'success', duration: '180ms', input: '特征向量[5]', output: 'model_score = 90.2' },
      { step: 6, node: '合并评分', status: 'success', duration: '2ms', input: 'rule=95, model=90.2', output: 'final = 92.1' },
      { step: 7, node: '评分判断', status: 'success', duration: '1ms', input: 'final_score=92.1', output: '通过 (>=60)' },
      { step: 8, node: '生成审批建议', status: 'success', duration: '35ms', input: 'score=92.1', output: 'approved=true, grade=A' },
      { step: 9, node: '结束', status: 'success', duration: '0ms', input: '-', output: '执行完成' },
    ],
  },
  {
    id: 'ts-002',
    name: '高风险交易检测',
    flowId: 'flow-002',
    flowName: '反欺诈交易监控流',
    lastRun: '2026-06-03 13:45',
    status: 'passed',
    inputs: { transaction_amount: 68000, transactions_1h: 12, ip_city: '深圳', registered_city: '北京', hour: 2, merchant_id: 'M-445' },
    result: { risk_level: 'high', action: 'review' },
    trace: [
      { step: 1, node: '交易事件', status: 'success', duration: '0ms', input: '-', output: '新交易触发' },
      { step: 2, node: '反欺诈规则', status: 'success', duration: '8ms', input: '5条规则', output: 'risk_level = "high"' },
      { step: 3, node: '风险等级', status: 'success', duration: '1ms', input: 'risk_level=high', output: '路由: 高风险' },
      { step: 4, node: '欺诈检测模型', status: 'success', duration: '150ms', input: '特征向量[4]', output: 'fraud_prob = 0.78' },
      { step: 5, node: '人工审核子流程', status: 'success', duration: '1200ms', input: 'prob=0.78', output: '待审核' },
      { step: 6, node: '处理完成', status: 'success', duration: '0ms', input: '-', output: '执行完成' },
    ],
  },
  {
    id: 'ts-003',
    name: '拒绝场景 - 低信用客户',
    flowId: 'flow-001',
    flowName: '信用评分决策流',
    lastRun: '2026-06-02 18:30',
    status: 'passed',
    inputs: { age: 22, monthly_income: 4500, debt_ratio: 0.65, credit_inquiries_30d: 8, overdue_count_12m: 3, employment_years: 0.5, has_property: false },
    result: { final_score: 28, grade: 'D', approved: false },
    trace: [],
  },
  {
    id: 'ts-004',
    name: '正常交易放行',
    flowId: 'flow-002',
    flowName: '反欺诈交易监控流',
    lastRun: '2026-06-02 16:20',
    status: 'passed',
    inputs: { transaction_amount: 580, transactions_1h: 2, ip_city: '北京', registered_city: '北京', hour: 14, merchant_id: 'M-102' },
    result: { risk_level: 'low', action: 'pass' },
    trace: [],
  },
  {
    id: 'ts-005',
    name: '超时失败场景',
    flowId: 'flow-003',
    flowName: '自动订单审核流',
    lastRun: '2026-06-01 10:15',
    status: 'failed',
    inputs: { order_amount: 120000, supplier_tier: 'silver', remaining_budget: 50000 },
    result: { error: 'Execution timeout after 5000ms' },
    trace: [],
  },
  {
    id: 'ts-006',
    name: '信用评分 - 中等客户',
    flowId: 'flow-001',
    flowName: '信用评分决策流',
    lastRun: '2026-06-04 09:30',
    status: 'passed',
    inputs: { age: 28, monthly_income: 12000, debt_ratio: 0.35, credit_inquiries_30d: 3, overdue_count_12m: 1, employment_years: 3, has_property: false },
    result: { final_score: 65, grade: 'C', approved: true },
    trace: [
      { step: 1, node: '开始', status: 'success', duration: '0ms', input: '-', output: '触发执行' },
      { step: 2, node: '获取征信数据', status: 'success', duration: '210ms', input: '{ applicantId: "A006" }', output: '{ age: 28, income: 12000, ... }' },
      { step: 3, node: '数据清洗转换', status: 'success', duration: '38ms', input: '原始数据', output: '标准化JSON' },
      { step: 4, node: '基础规则评估', status: 'success', duration: '15ms', input: '8条规则', output: 'rule_score = 68' },
      { step: 5, node: 'ML风险模型', status: 'success', duration: '165ms', input: '特征向量[5]', output: 'model_score = 63.5' },
      { step: 6, node: '合并评分', status: 'success', duration: '2ms', input: 'rule=68, model=63.5', output: 'final = 65.3' },
      { step: 7, node: '评分判断', status: 'success', duration: '1ms', input: 'final_score=65.3', output: '通过 (>=60)' },
      { step: 8, node: '生成审批建议', status: 'success', duration: '28ms', input: 'score=65.3', output: 'approved=true, grade=C' },
      { step: 9, node: '结束', status: 'success', duration: '0ms', input: '-', output: '执行完成' },
    ],
  },
  {
    id: 'ts-007',
    name: '信用评分 - 边界客户',
    flowId: 'flow-001',
    flowName: '信用评分决策流',
    lastRun: '2026-06-04 10:15',
    status: 'passed',
    inputs: { age: 25, monthly_income: 8000, debt_ratio: 0.50, credit_inquiries_30d: 5, overdue_count_12m: 2, employment_years: 1.5, has_property: false },
    result: { final_score: 45, grade: 'D', approved: false },
    trace: [
      { step: 1, node: '开始', status: 'success', duration: '0ms', input: '-', output: '触发执行' },
      { step: 2, node: '获取征信数据', status: 'success', duration: '195ms', input: '{ applicantId: "A007" }', output: '{ age: 25, income: 8000, ... }' },
      { step: 3, node: '数据清洗转换', status: 'success', duration: '42ms', input: '原始数据', output: '标准化JSON' },
      { step: 4, node: '基础规则评估', status: 'warning', duration: '18ms', input: '8条规则', output: 'rule_score = 48' },
      { step: 5, node: 'ML风险模型', status: 'success', duration: '172ms', input: '特征向量[5]', output: 'model_score = 43.1' },
      { step: 6, node: '合并评分', status: 'success', duration: '2ms', input: 'rule=48, model=43.1', output: 'final = 45.1' },
      { step: 7, node: '评分判断', status: 'warning', duration: '1ms', input: 'final_score=45.1', output: '拒绝 (<60)' },
      { step: 8, node: '生成审批建议', status: 'success', duration: '30ms', input: 'score=45.1', output: 'approved=false, grade=D' },
      { step: 9, node: '结束', status: 'success', duration: '0ms', input: '-', output: '执行完成' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Execution history (for What-If comparison feature)
// ---------------------------------------------------------------------------
export const executionHistory = [
  { id: 'eh-001', scenarioId: 'ts-001', scenarioName: '标准信用评分 - 优质客户', flowId: 'flow-001', runAt: '2026-06-03 14:00', inputs: { age: 32, monthly_income: 25000, debt_ratio: 0.15, credit_inquiries_30d: 1, overdue_count_12m: 0, employment_years: 5, has_property: true }, result: { final_score: 92, grade: 'A', approved: true }, duration: '505ms' },
  { id: 'eh-002', scenarioId: 'ts-003', scenarioName: '拒绝场景 - 低信用客户', flowId: 'flow-001', runAt: '2026-06-03 11:20', inputs: { age: 22, monthly_income: 4500, debt_ratio: 0.65, credit_inquiries_30d: 8, overdue_count_12m: 3, employment_years: 0.5, has_property: false }, result: { final_score: 28, grade: 'D', approved: false }, duration: '480ms' },
  { id: 'eh-003', scenarioId: 'ts-006', scenarioName: '信用评分 - 中等客户', flowId: 'flow-001', runAt: '2026-06-04 09:30', inputs: { age: 28, monthly_income: 12000, debt_ratio: 0.35, credit_inquiries_30d: 3, overdue_count_12m: 1, employment_years: 3, has_property: false }, result: { final_score: 65, grade: 'C', approved: true }, duration: '459ms' },
  { id: 'eh-004', scenarioId: 'ts-002', scenarioName: '高风险交易检测', flowId: 'flow-002', runAt: '2026-06-03 13:45', inputs: { transaction_amount: 68000, transactions_1h: 12, ip_city: '深圳', registered_city: '北京', hour: 2, merchant_id: 'M-445' }, result: { risk_level: 'high', action: 'review' }, duration: '1359ms' },
  { id: 'eh-005', scenarioId: 'ts-007', scenarioName: '信用评分 - 边界客户', flowId: 'flow-001', runAt: '2026-06-04 10:15', inputs: { age: 25, monthly_income: 8000, debt_ratio: 0.50, credit_inquiries_30d: 5, overdue_count_12m: 2, employment_years: 1.5, has_property: false }, result: { final_score: 45, grade: 'D', approved: false }, duration: '460ms' },
  { id: 'eh-006', scenarioId: 'ts-001', scenarioName: '标准信用评分 - 优质客户(参数调整)', flowId: 'flow-001', runAt: '2026-06-04 15:00', inputs: { age: 32, monthly_income: 30000, debt_ratio: 0.10, credit_inquiries_30d: 0, overdue_count_12m: 0, employment_years: 8, has_property: true }, result: { final_score: 96, grade: 'A', approved: true }, duration: '498ms' },
];

// ---------------------------------------------------------------------------
// Publish targets
// ---------------------------------------------------------------------------
export const publishTargets = [
  { id: 'pub-001', endpoint: '/api/v2/credit-score', type: 'REST API', status: 'active', deployedAt: '2026-06-01 10:00', calls24h: 4520, version: 'v2.3', env: 'production' },
  { id: 'pub-002', endpoint: '/api/v2/fraud-detect', type: 'REST API', status: 'active', deployedAt: '2026-05-30 14:30', calls24h: 3180, version: 'v2.1', env: 'production' },
  { id: 'pub-003', endpoint: '/api/v2/order-review', type: 'REST API', status: 'deploying', deployedAt: null, calls24h: 0, version: 'v1.2', env: 'staging' },
  { id: 'pub-004', endpoint: '/api/v2/inventory-reorder', type: 'REST API', status: 'stopped', deployedAt: '2026-05-20 09:00', calls24h: 0, version: 'v1.0', env: 'development' },
  { id: 'pub-005', endpoint: '/api/v1/credit-score', type: 'REST API', status: 'active', deployedAt: '2026-04-15 16:00', calls24h: 890, version: 'v2.2', env: 'production' },
];

// ---------------------------------------------------------------------------
// Publish history
// ---------------------------------------------------------------------------
export const publishHistory = [
  { id: 'ph-001', action: '部署', flow: '信用评分决策流', version: 'v2.3', env: 'production', user: '张工', time: '2026-06-01 10:00', status: 'success' },
  { id: 'ph-002', action: '部署', flow: '反欺诈交易监控流', version: 'v2.1', env: 'production', user: '李工', time: '2026-05-30 14:30', status: 'success' },
  { id: 'ph-003', action: '回滚', flow: '自动订单审核流', version: 'v1.1 -> v1.0', env: 'staging', user: '王工', time: '2026-05-28 16:00', status: 'success' },
  { id: 'ph-004', action: '部署', flow: '库存智能补货流', version: 'v1.0', env: 'development', user: '赵工', time: '2026-05-25 09:00', status: 'failed' },
  { id: 'ph-005', action: '部署', flow: '信用评分决策流', version: 'v2.2', env: 'production', user: '张工', time: '2026-04-15 16:00', status: 'success' },
];

// ---------------------------------------------------------------------------
// Node type definitions for the flow editor palette
// Based on Aera Process Builder — 7 categories, 19 node types
// ---------------------------------------------------------------------------
export const nodeTypeDefinitions = [
  {
    category: '流程控制',
    items: [
      { type: 'interface', label: '流程接口', icon: 'PlayCircle', color: '#3b82f6', shape: 'circle' },
      { type: 'script', label: '脚本', icon: 'Code', color: '#3b82f6', shape: 'rect' },
      { type: 'if', label: '条件判断', icon: 'GitBranch', color: '#eab308', shape: 'diamond' },
      { type: 'filter', label: '数据过滤', icon: 'Target', color: '#f59e0b', shape: 'rect' },
      { type: 'switch', label: '多路分支', icon: 'Route', color: '#d97706', shape: 'diamond' },
      { type: 'merge', label: '数据合并', icon: 'GitMerge', color: '#0891b2', shape: 'rect' },
      { type: 'loop_items', label: '批量循环', icon: 'RefreshCw', color: '#ca8a04', shape: 'diamond' },
      { type: 'compare_data', label: '数据对比', icon: 'ArrowRightLeft', color: '#7c3aed', shape: 'rect' },
      { type: 'stop_error', label: '终止与错误', icon: 'AlertTriangle', color: '#dc2626', shape: 'rect' },
      { type: 'while', label: 'While 循环', icon: 'RefreshCw', color: '#eab308', shape: 'diamond' },
      { type: 'do_while', label: 'Do While 循环', icon: 'RefreshCw', color: '#b91c1c', shape: 'diamond' },
    ],
  },
  {
    category: '核心能力',
    items: [
      { type: 'http_request', label: 'HTTP 请求', icon: 'Globe', color: '#0284c7', shape: 'rect' },
      { type: 'code', label: '代码执行', icon: 'Code', color: '#4f46e5', shape: 'rect' },
      { type: 'manual_trigger', label: '手动触发', icon: 'PlayCircle', color: '#16a34a', shape: 'circle' },
      { type: 'schedule_trigger', label: '定时触发', icon: 'Clock', color: '#0d9488', shape: 'circle' },
      { type: 'webhook', label: 'Webhook', icon: 'Webhook', color: '#7c3aed', shape: 'rect' },
      { type: 'no_op', label: '空操作', icon: 'ArrowRightLeft', color: '#94a3b8', shape: 'rect' },
    ],
  },
  {
    category: '数据转换',
    items: [
      { type: 'edit_fields', label: '字段编辑', icon: 'Settings', color: '#2563eb', shape: 'rect' },
      { type: 'item_lists', label: '列表处理', icon: 'ClipboardList', color: '#0369a1', shape: 'rect' },
      { type: 'date_time', label: '日期时间', icon: 'Clock', color: '#059669', shape: 'rect' },
      { type: 'aggregate', label: '数据聚合', icon: 'BarChart3', color: '#7c3aed', shape: 'rect' },
      { type: 'sort', label: '数据排序', icon: 'ArrowDownUp', color: '#6366f1', shape: 'rect' },
      { type: 'remove_duplicates', label: '去重', icon: 'Sparkles', color: '#8b5cf6', shape: 'rect' },
      { type: 'limit', label: '数据限制', icon: 'Minimize2', color: '#a855f7', shape: 'rect' },
      { type: 'split_out', label: '列表拆分', icon: 'Expand', color: '#d946ef', shape: 'rect' },
      { type: 'summarize', label: '数据汇总', icon: 'LineChart', color: '#ec4899', shape: 'rect' },
    ],
  },
  {
    category: '用户交互',
    items: [
      { type: 'ui_screen', label: 'UI 界面', icon: 'Monitor', color: '#ef4444', shape: 'rect' },
      { type: 'notification', label: '通知', icon: 'Bell', color: '#22c55e', shape: 'rect' },
    ],
  },
  {
    category: '异步与等待',
    items: [
      { type: 'stream', label: '数据流', icon: 'Radio', color: '#22c55e', shape: 'rect' },
      { type: 'asynchronous', label: '异步执行', icon: 'Zap', color: '#22c55e', shape: 'rect' },
      { type: 'wait', label: '等待', icon: 'Clock', color: '#f97316', shape: 'rect' },
    ],
  },
  {
    category: '智能计算',
    items: [
      { type: 'ml_model', label: '机器学习模型', icon: 'Brain', color: '#1e40af', shape: 'rect' },
      { type: 'forecast_model', label: '智能预测模型', icon: 'BarChart3', color: '#0d9488', shape: 'rect' },
      { type: 'optimization_model', label: '优化求解模型', icon: 'Activity', color: '#d97706', shape: 'rect' },
      { type: 'rules', label: '业务规则', icon: 'ListChecks', color: '#7c3aed', shape: 'rect' },
    ],
  },
  {
    category: '流程复用',
    items: [
      { type: 'subprocess', label: '子流程', icon: 'FolderSync', color: '#06b6d4', shape: 'rect' },
    ],
  },
  {
    category: '代理',
    items: [
      { type: 'agent_team', label: 'Agent 团队', icon: 'Users', color: '#3b82f6', shape: 'rect' },
    ],
  },
  {
    category: '本体',
    items: [
      { type: 'object_access', label: '对象访问', icon: 'Boxes', color: '#06b6d4', shape: 'rect' },
      { type: 'action', label: '行动', icon: 'Zap', color: '#f97316', shape: 'rect' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Node property definitions — data-driven property panel for each node type
// Based on Aera Process Builder — Chinese labels
// ---------------------------------------------------------------------------
export const nodePropertyDefinitions = {
  // --- 流程控制 ---
  interface: {
    sections: [
      { title: '接口配置', fields: [
        { key: 'interface_name', label: '接口名称', type: 'text', placeholder: 'Supply Resilience Recommendation' },
        { key: 'input_params', label: '输入参数定义', type: 'textarea', placeholder: '参数名, 数据类型, 默认值, 必填...' },
        { key: 'trigger_type', label: '触发方式', type: 'select', options: ['手动', '定时', '事件驱动'], defaultValue: '手动' },
        { key: 'output_params', label: '输出参数定义', type: 'textarea', placeholder: '输出参数...' },
      ]},
    ],
  },
  script: {
    sections: [
      { title: '脚本配置', fields: [
        { key: 'execution_mode', label: '执行模式', type: 'select', options: ['所有项执行一次', '每项执行一次'], defaultValue: '所有项执行一次' },
        { key: 'script_language', label: '脚本语言', type: 'select', options: ['Python', 'JavaScript', 'Groovy'], defaultValue: 'Python' },
        { key: 'script_body', label: '脚本内容', type: 'textarea', placeholder: '输入脚本代码...' },
        { key: 'input_variables', label: '输入变量绑定', type: 'textarea', placeholder: '变量绑定...' },
        { key: 'output_mapping', label: '输出变量映射', type: 'textarea', placeholder: '输出映射...' },
        { key: 'timeout', label: '执行超时 (ms)', type: 'number', defaultValue: 5000 },
        { key: 'on_error', label: '错误处理策略', type: 'select', options: ['继续', '终止', '重试'], defaultValue: '终止' },
        { key: 'retry_count', label: '重试次数', type: 'number', defaultValue: 0 },
        { key: 'retry_interval', label: '重试间隔 (ms)', type: 'number', defaultValue: 1000 },
      ]},
      { title: '通用设置', fields: [
        { key: 'always_output_data', label: '始终输出数据', type: 'boolean', defaultValue: false },
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  if: {
    sections: [
      { title: '条件判断配置', fields: [
        { key: 'condition', label: '条件表达式', type: 'text', placeholder: '${score} >= 60' },
        { key: 'conditions', label: '条件组合', type: 'textarea', placeholder: '多条件组合配置（支持 AND/OR 逻辑）...' },
        { key: 'combine_logic', label: '组合逻辑', type: 'select', options: ['AND', 'OR'], defaultValue: 'AND' },
        { key: 'true_label', label: '真分支标签', type: 'text', placeholder: 'YES' },
        { key: 'false_label', label: '假分支标签', type: 'text', placeholder: 'NO' },
        { key: 'ignore_case', label: '忽略大小写', type: 'boolean', defaultValue: true },
        { key: 'convert_types', label: '类型自动转换', type: 'boolean', defaultValue: false },
        { key: 'description', label: '条件描述', type: 'textarea', placeholder: '描述条件逻辑...' },
      ]},
      { title: '通用设置', fields: [
        { key: 'always_output_data', label: '始终输出数据', type: 'boolean', defaultValue: false },
        { key: 'execute_once', label: '仅执行一次', type: 'boolean', defaultValue: false },
        { key: 'on_error', label: '错误处理策略', type: 'select', options: ['终止工作流', '继续', '继续(使用错误输出)'], defaultValue: '终止工作流' },
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  while: {
    sections: [
      { title: 'While 循环配置', fields: [
        { key: 'loop_condition', label: '循环条件', type: 'text', placeholder: '${counter} < ${max_count}' },
        { key: 'max_iterations', label: '最大迭代次数', type: 'number', defaultValue: 100 },
        { key: 'loop_variable', label: '循环变量', type: 'text', placeholder: 'counter' },
      ]},
    ],
  },
  do_while: {
    sections: [
      { title: 'Do While 循环配置', fields: [
        { key: 'loop_condition', label: '循环条件', type: 'text', placeholder: '${status} != "completed"' },
        { key: 'max_iterations', label: '最大迭代次数', type: 'number', defaultValue: 100 },
        { key: 'loop_variable', label: '循环变量', type: 'text', placeholder: 'iteration_count' },
      ]},
    ],
  },
  // --- 用户交互 ---
  ui_screen: {
    sections: [
      { title: 'UI 界面配置', fields: [
        { key: 'screen_template', label: '屏幕模板', type: 'text', placeholder: 'approval_form_v2' },
        { key: 'data_binding', label: '展示数据绑定', type: 'textarea', placeholder: '上下文数据绑定...' },
        { key: 'input_fields', label: '用户输入字段', type: 'textarea', placeholder: '需要用户填写的字段列表...' },
        { key: 'button_actions', label: '按钮动作', type: 'select', options: ['确认/取消', '批准/拒绝/委派', '自定义'], defaultValue: '确认/取消' },
        { key: 'access_control', label: '权限控制', type: 'textarea', placeholder: '可查看此界面的角色...' },
        { key: 'timeout', label: '等待超时', type: 'text', placeholder: '如 24h / 3d，为空则不超时' },
        { key: 'on_timeout', label: '超时处理', type: 'select', options: ['继续', '终止', '跳过', '委派他人'], defaultValue: '继续' },
        { key: 'escalation', label: '升级策略', type: 'textarea', placeholder: '超时未响应时的升级路径...' },
      ]},
    ],
  },
  notification: {
    sections: [
      { title: '通知配置', fields: [
        { key: 'channel', label: '通知渠道', type: 'select', options: ['Email', '应用内', 'Push', 'SMS'], defaultValue: 'Email' },
        { key: 'recipients', label: '接收人', type: 'textarea', placeholder: '用户/用户组/角色...' },
        { key: 'template', label: '通知模板', type: 'textarea', placeholder: '消息内容模板...' },
        { key: 'priority', label: '优先级', type: 'select', options: ['高', '中', '低'], defaultValue: '中' },
        { key: 'context_data', label: '关联数据', type: 'textarea', placeholder: '通知中引用的流程变量...' },
      ]},
    ],
  },
  // --- 异步与等待 ---
  stream: {
    sections: [
      { title: '数据流配置', fields: [
        { key: 'stream_type', label: '流类型', type: 'select', options: ['输入流', '输出流'], defaultValue: '输入流' },
        { key: 'source_target', label: '数据源/目标', type: 'select', options: ['Kafka', 'Event Hub', '内部消息总线'], defaultValue: 'Kafka' },
        { key: 'message_format', label: '消息格式', type: 'select', options: ['JSON', 'Avro', 'Protobuf'], defaultValue: 'JSON' },
        { key: 'batch_size', label: '批处理大小', type: 'number', defaultValue: 100 },
        { key: 'consumption_mode', label: '消费模式', type: 'select', options: ['实时', '微批'], defaultValue: '实时' },
        { key: 'error_handling', label: '错误处理', type: 'select', options: ['跳过错误消息', '死信队列', '重试', '终止流'], defaultValue: '跳过错误消息' },
        { key: 'retry_policy', label: '重试策略', type: 'text', placeholder: '如: 3次重试, 指数退避 1s/2s/4s' },
        { key: 'offset_strategy', label: '偏移量策略', type: 'select', options: ['最新', '最早', '指定时间戳'], defaultValue: '最新' },
      ]},
    ],
  },
  asynchronous: {
    sections: [
      { title: '异步执行配置', fields: [
        { key: 'async_task', label: '异步任务', type: 'text', placeholder: '子流程或任务引用' },
        { key: 'callback', label: '回调处理', type: 'textarea', placeholder: '异步完成后的回调逻辑...' },
        { key: 'timeout', label: '超时设置 (ms)', type: 'number', defaultValue: 30000 },
        { key: 'retry_policy', label: '失败重试', type: 'text', placeholder: '3 次重试，5 秒退避' },
      ]},
    ],
  },
  wait: {
    sections: [
      { title: '等待配置', fields: [
        { key: 'wait_type', label: '等待类型', type: 'select', options: ['定时等待', '事件等待', '信号等待', 'Webhook回调', '表单提交'], defaultValue: '定时等待' },
        { key: 'resume_mode', label: '恢复方式', type: 'select', options: ['时间间隔后', '指定时间', 'Webhook调用时', '表单提交时'], defaultValue: '时间间隔后' },
        { key: 'duration', label: '等待时长', type: 'text', placeholder: '30s / 0 2 * * *' },
        { key: 'amount', label: '等待时间量', type: 'number', defaultValue: 1 },
        { key: 'unit', label: '时间单位', type: 'select', options: ['秒', '分钟', '小时', '天'], defaultValue: '小时' },
        { key: 'wait_condition', label: '等待条件', type: 'text', placeholder: '${approval_status} == "done"' },
        { key: 'on_timeout', label: '超时处理', type: 'select', options: ['继续', '终止', '通知'], defaultValue: '终止' },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  // --- 智能计算 ---
  ml_model: {
    sections: [
      { title: '机器学习模型配置', fields: [
        { key: 'model_ref', label: '模型引用', type: 'text', placeholder: 'mdl-001' },
        { key: 'model_type', label: '模型类型', type: 'select', options: ['分类', '回归', '聚类', 'NLP'], defaultValue: '分类' },
        { key: 'feature_mapping', label: '输入特征映射', type: 'textarea', placeholder: '输入数据到模型特征的映射...' },
        { key: 'output_mapping', label: '输出结果映射', type: 'textarea', placeholder: '模型输出到流程变量的映射...' },
        { key: 'confidence_threshold', label: '置信度阈值', type: 'number', defaultValue: 0.7 },
        { key: 'compute_resource', label: '计算资源', type: 'select', options: ['CPU', 'GPU'], defaultValue: 'CPU' },
      ]},
    ],
  },
  forecast_model: {
    sections: [
      { title: '智能预测模型配置', fields: [
        { key: 'model_ref', label: '模型引用', type: 'text', placeholder: 'fc-001' },
        { key: 'forecast_type', label: '预测类型', type: 'select', options: ['时间序列', '趋势预测', '异常预测', '需求预测'], defaultValue: '时间序列' },
        { key: 'input_data', label: '输入数据源', type: 'textarea', placeholder: '历史数据及特征变量...' },
        { key: 'forecast_horizon', label: '预测周期', type: 'text', placeholder: '30天' },
        { key: 'output_mapping', label: '输出结果映射', type: 'textarea', placeholder: '预测结果到流程变量的映射...' },
        { key: 'accuracy_threshold', label: '准确率阈值', type: 'number', defaultValue: 0.85 },
      ]},
    ],
  },
  optimization_model: {
    sections: [
      { title: '优化求解模型配置', fields: [
        { key: 'model_ref', label: '模型引用', type: 'text', placeholder: 'opt-001' },
        { key: 'objective', label: '目标函数', type: 'select', options: ['最小化成本', '最大化收益', '最短路径', '资源最优分配'], defaultValue: '最小化成本' },
        { key: 'constraints', label: '约束条件', type: 'textarea', placeholder: '优化约束条件列表...' },
        { key: 'decision_variables', label: '决策变量', type: 'textarea', placeholder: '需要优化的变量...' },
        { key: 'output_mapping', label: '输出结果映射', type: 'textarea', placeholder: '最优解到流程变量的映射...' },
        { key: 'solver', label: '求解器', type: 'select', options: ['线性规划', '整数规划', '启发式', '遗传算法'], defaultValue: '线性规划' },
      ]},
    ],
  },
  rules: {
    sections: [
      { title: '业务规则配置', fields: [
        { key: 'ruleset_ref', label: '规则集引用', type: 'text', placeholder: 'rs-001' },
        { key: 'rule_inputs', label: '规则输入', type: 'textarea', placeholder: '规则评估所需的输入数据...' },
        { key: 'rule_outputs', label: '规则输出', type: 'textarea', placeholder: '规则执行结果...' },
        { key: 'rule_version', label: '规则版本', type: 'text', placeholder: 'v2.3' },
        { key: 'conflict_resolution', label: '冲突解决策略', type: 'select', options: ['首次匹配', '优先级', '评分'], defaultValue: '首次匹配' },
      ]},
    ],
  },
  // --- 流程复用 ---
  subprocess: {
    sections: [
      { title: '子流程配置', fields: [
        { key: 'source', label: '工作流来源', type: 'select', options: ['数据库', '自定义'], defaultValue: '数据库' },
        { key: 'subprocess_ref', label: '子流程引用', type: 'text', placeholder: 'flow-004' },
        { key: 'input_mapping', label: '输入参数映射', type: 'textarea', placeholder: 'parent_var → child_var' },
        { key: 'workflow_inputs', label: '工作流输入参数', type: 'textarea', placeholder: '传递给子工作流的输入参数映射...' },
        { key: 'output_mapping', label: '输出参数映射', type: 'textarea', placeholder: 'child_result → parent_result' },
        { key: 'execution_mode', label: '执行模式', type: 'select', options: ['同步', '异步'], defaultValue: '同步' },
        { key: 'timeout', label: '执行超时 (ms)', type: 'number', defaultValue: 30000 },
        { key: 'on_error', label: '错误处理策略', type: 'select', options: ['继续', '终止', '重试', '跳过'], defaultValue: '终止' },
        { key: 'retry_on_fail', label: '失败时重试', type: 'boolean', defaultValue: false },
        { key: 'retry_count', label: '重试次数', type: 'number', defaultValue: 0 },
        { key: 'retry_interval', label: '重试间隔 (ms)', type: 'number', defaultValue: 1000 },
        { key: 'propagate_context', label: '上下文透传', type: 'select', options: ['全量透传', '仅传入映射变量', '隔离'], defaultValue: '仅传入映射变量' },
      ]},
      { title: '通用设置', fields: [
        { key: 'always_output_data', label: '始终输出数据', type: 'boolean', defaultValue: false },
        { key: 'execute_once', label: '仅执行一次', type: 'boolean', defaultValue: false },
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  // --- 代理 ---
  agent_team: {
    sections: [
      { title: 'Agent 团队配置', fields: [
        { key: 'agent_team_ref', label: 'Agent Team 引用', type: 'text', placeholder: 'team-risk-analysis' },
        { key: 'task_description', label: '任务描述', type: 'textarea', placeholder: '自然语言描述任务...' },
        { key: 'input_context', label: '输入上下文', type: 'textarea', placeholder: '传递给 Agent Team 的上下文数据...' },
        { key: 'output_mapping', label: '输出接收', type: 'textarea', placeholder: 'Agent 执行结果的接收变量...' },
        { key: 'llm_config', label: 'LLM 配置', type: 'select', options: ['GPT-4', 'Claude', 'Gemini', '自定义'], defaultValue: 'GPT-4' },
        { key: 'max_rounds', label: '最大迭代轮次', type: 'number', defaultValue: 5 },
        { key: 'human_in_loop', label: '人工审批点', type: 'select', options: ['始终', '高风险时', '从不'], defaultValue: '高风险时' },
        { key: 'timeout', label: '执行超时 (ms)', type: 'number', defaultValue: 60000 },
        { key: 'max_tokens', label: '最大 Token 数', type: 'number', defaultValue: 4096 },
        { key: 'temperature', label: 'Temperature', type: 'number', defaultValue: 0.3 },
        { key: 'on_error', label: '错误处理策略', type: 'select', options: ['重试', '降级到人工', '终止流程'], defaultValue: '重试' },
      ]},
    ],
  },
  // --- 本体 ---
  object_access: {
    sections: [
      { title: '对象访问配置', fields: [
        { key: 'ontology_ref', label: '本体引用', type: 'text', placeholder: 'ont-customer-360' },
        { key: 'object_type', label: '对象类型', type: 'text', placeholder: 'Customer' },
        { key: 'access_mode', label: '访问模式', type: 'select', options: ['查询', '创建', '更新', '删除'], defaultValue: '查询' },
        { key: 'filter_condition', label: '过滤条件', type: 'textarea', placeholder: '对象查询条件...' },
        { key: 'field_selection', label: '字段选择', type: 'textarea', placeholder: '需要访问的字段列表...' },
        { key: 'output_variable', label: '输出变量', type: 'text', placeholder: 'query_result' },
      ]},
    ],
  },
  action: {
    sections: [
      { title: '行动配置', fields: [
        { key: 'action_type', label: '行动类型', type: 'select', options: ['触发事件', '调用服务', '状态变更', '消息推送'], defaultValue: '触发事件' },
        { key: 'action_target', label: '行动目标', type: 'text', placeholder: '目标系统或服务名称...' },
        { key: 'input_params', label: '输入参数', type: 'textarea', placeholder: '行动所需的参数...' },
        { key: 'output_mapping', label: '输出映射', type: 'textarea', placeholder: '行动结果到流程变量的映射...' },
        { key: 'error_handling', label: '错误处理', type: 'select', options: ['重试', '跳过', '终止流程', '通知'], defaultValue: '重试' },
        { key: 'retry_count', label: '重试次数', type: 'number', defaultValue: 3 },
      ]},
    ],
  },
  // --- 新增流程控制节点 ---
  filter: {
    sections: [
      { title: '本体属性过滤', fields: [
        { key: 'ontology_model', label: '本体模型', type: 'select', options: ['客户360', '供应链网络'], defaultValue: '' },
        { key: 'business_object', label: '业务对象', type: 'select', options: ['Customer / 客户', 'Order / 订单', 'Product / 产品', 'Payment / 支付', 'OrderProduct / 订单产品明细'], defaultValue: '' },
        { key: 'filter_property', label: '属性字段', type: 'select', options: ['客户ID', '客户名称', '信用等级', '订单金额', '订单状态', '下单时间', '产品名称', '单价', '库存数量', '支付金额', '支付时间'], defaultValue: '' },
        { key: 'filter_operator', label: '条件算子', type: 'select', options: ['等于', '不等于', '大于', '小于', '大于等于', '小于等于', '包含', '为空', '不为空'], defaultValue: '大于' },
        { key: 'filter_value', label: '条件值', type: 'text', placeholder: '输入过滤阈值（支持数字、文本，多条件可串联过滤节点）...' },
        { key: 'combine_logic', label: '组合逻辑', type: 'select', options: ['AND', 'OR'], defaultValue: 'AND' },
      ]},
      { title: '通用设置', fields: [
        { key: 'always_output_data', label: '始终输出数据', type: 'boolean', defaultValue: false },
        { key: 'on_error', label: '错误处理策略', type: 'select', options: ['终止工作流', '继续', '继续(使用错误输出)'], defaultValue: '终止工作流' },
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  switch: {
    sections: [
      { title: '多路分支配置', fields: [
        { key: 'mode', label: '路由模式', type: 'select', options: ['规则匹配', '表达式'], defaultValue: '规则匹配' },
        { key: 'number_of_outputs', label: '输出数量', type: 'number', defaultValue: 4 },
        { key: 'output_index', label: '输出索引表达式', type: 'text', placeholder: '={{}} (表达式模式时使用)' },
        { key: 'rules', label: '匹配规则', type: 'textarea', placeholder: '为每个输出配置匹配规则...' },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  merge: {
    sections: [
      { title: '数据合并配置', fields: [
        { key: 'mode', label: '合并模式', type: 'select', options: ['追加', '组合', 'SQL查询', '选择分支'], defaultValue: '追加' },
        { key: 'number_inputs', label: '输入数量', type: 'number', defaultValue: 2 },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  loop_items: {
    sections: [
      { title: '批量循环配置', fields: [
        { key: 'batch_size', label: '批次大小', type: 'number', defaultValue: 1 },
        { key: 'reset', label: '重新从头开始', type: 'boolean', defaultValue: false },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  compare_data: {
    sections: [
      { title: '数据对比配置', fields: [
        { key: 'fields_to_match', label: '匹配字段', type: 'textarea', placeholder: '配置用于配对的匹配字段...' },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  stop_error: {
    sections: [
      { title: '终止与错误配置', fields: [
        { key: 'error_type', label: '错误类型', type: 'select', options: ['错误消息', '错误对象'], defaultValue: '错误消息' },
        { key: 'error_message', label: '错误消息', type: 'text', placeholder: '输入错误消息文本...' },
        { key: 'error_object', label: '错误对象', type: 'textarea', placeholder: 'JSON 错误对象...' },
      ]},
    ],
  },
  // --- 核心能力节点 ---
  http_request: {
    sections: [
      { title: '本体数据源', fields: [
        { key: 'ontology_model', label: '本体模型', type: 'select', options: ['客户360', '供应链网络'], defaultValue: '' },
        { key: 'business_object', label: '业务对象', type: 'select', options: ['Customer / 客户', 'Order / 订单', 'Product / 产品', 'Payment / 支付', 'OrderProduct / 订单产品明细'], defaultValue: '' },
        { key: 'relation', label: '关系', type: 'select', options: ['客户下单 (places)', '订单包含 (contains)', '订单支付 (pays)', '订单产品 (order_products)'], defaultValue: '' },
        { key: 'property_fields', label: '属性字段', type: 'textarea', placeholder: '选择需要获取的本体属性字段，如：客户ID, 客户名称, 信用等级...' },
        { key: 'action_binding', label: '行动', type: 'select', options: ['无', '审批订单 (ApproveOrder)', '风险评估 (RiskAssessment)', '添加订单产品 (AddOrderProduct)'], defaultValue: '无' },
        { key: 'access_mode', label: '访问模式', type: 'select', options: ['查询对象', '遍历关系', '执行行动'], defaultValue: '查询对象' },
      ]},
      { title: '通用设置', fields: [
        { key: 'retry_on_fail', label: '失败时重试', type: 'boolean', defaultValue: false },
        { key: 'max_tries', label: '最大重试次数', type: 'number', defaultValue: 3 },
        { key: 'on_error', label: '错误处理策略', type: 'select', options: ['终止工作流', '继续', '继续(使用错误输出)'], defaultValue: '终止工作流' },
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  code: {
    sections: [
      { title: '代码执行配置', fields: [
        { key: 'execution_mode', label: '执行模式', type: 'select', options: ['所有项执行一次', '每项执行一次'], defaultValue: '所有项执行一次' },
        { key: 'language', label: '编程语言', type: 'select', options: ['JavaScript', 'Python'], defaultValue: 'JavaScript' },
        { key: 'javascript_code', label: 'JavaScript 代码', type: 'textarea', placeholder: '// 输入 JavaScript 代码...' },
        { key: 'python_code', label: 'Python 代码', type: 'textarea', placeholder: '# 输入 Python 代码...' },
      ]},
      { title: '通用设置', fields: [
        { key: 'timeout', label: '执行超时 (ms)', type: 'number', defaultValue: 5000 },
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  manual_trigger: {
    sections: [
      { title: '手动触发配置', fields: [
        { key: 'description', label: '触发说明', type: 'textarea', placeholder: '描述此触发器的用途...' },
      ]},
    ],
  },
  schedule_trigger: {
    sections: [
      { title: '定时触发配置', fields: [
        { key: 'rule', label: '时间规则', type: 'textarea', placeholder: '配置 Cron 表达式或时间间隔...' },
        { key: 'trigger_at', label: '触发方式', type: 'select', options: ['Cron 表达式', '固定间隔', '每日定时'], defaultValue: '固定间隔' },
        { key: 'interval', label: '间隔时间', type: 'text', placeholder: '如: 5m, 1h, 1d' },
        { key: 'cron_expression', label: 'Cron 表达式', type: 'text', placeholder: '0 9 * * 1-5' },
      ]},
    ],
  },
  webhook: {
    sections: [
      { title: 'Webhook 配置', fields: [
        { key: 'http_method', label: 'HTTP 方法', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], defaultValue: 'GET' },
        { key: 'path', label: 'Webhook 路径', type: 'text', placeholder: '/my-webhook-path' },
        { key: 'authentication', label: '认证方式', type: 'select', options: ['无', '基础认证', '摘要认证', '请求头认证'], defaultValue: '无' },
        { key: 'respond', label: '响应模式', type: 'select', options: ['立即响应', '最后节点完成时', '使用响应节点'], defaultValue: '立即响应' },
      ]},
    ],
  },
  no_op: {
    sections: [
      { title: '空操作配置', fields: [
        { key: 'description', label: '说明', type: 'textarea', placeholder: '此节点不执行任何操作，用作流程占位符...' },
      ]},
    ],
  },
  // --- 数据转换节点 ---
  edit_fields: {
    sections: [
      { title: '本体属性映射', fields: [
        { key: 'ontology_model', label: '本体模型', type: 'select', options: ['客户360', '供应链网络'], defaultValue: '' },
        { key: 'source_object', label: '源业务对象', type: 'select', options: ['Customer / 客户', 'Order / 订单', 'Product / 产品', 'Payment / 支付', 'OrderProduct / 订单产品明细'], defaultValue: '' },
        { key: 'source_properties', label: '源属性字段', type: 'textarea', placeholder: '选择源对象的属性字段...' },
        { key: 'target_object', label: '目标业务对象', type: 'select', options: ['Customer / 客户', 'Order / 订单', 'Product / 产品', 'Payment / 支付', 'OrderProduct / 订单产品明细'], defaultValue: '' },
        { key: 'target_properties', label: '目标属性字段', type: 'textarea', placeholder: '映射到目标对象的属性字段...' },
        { key: 'mapping_mode', label: '映射模式', type: 'select', options: ['属性直接映射', '关系遍历映射', '表达式映射'], defaultValue: '属性直接映射' },
        { key: 'mapping_expression', label: '映射表达式', type: 'textarea', placeholder: '当映射模式为"表达式映射"时，填写转换表达式...' },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  item_lists: {
    sections: [
      { title: '列表处理配置', fields: [
        { key: 'operation', label: '操作类型', type: 'select', options: ['合并项目', '限制数量', '去除重复', '排序', '拆分项目', '汇总'], defaultValue: '合并项目' },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  date_time: {
    sections: [
      { title: '本体时间属性', fields: [
        { key: 'ontology_model', label: '本体模型', type: 'select', options: ['客户360', '供应链网络'], defaultValue: '' },
        { key: 'business_object', label: '业务对象', type: 'select', options: ['Customer / 客户', 'Order / 订单', 'Product / 产品', 'Payment / 支付', 'OrderProduct / 订单产品明细'], defaultValue: '' },
        { key: 'time_property', label: '时间属性字段', type: 'select', options: ['注册日期', '下单时间', '支付时间'], defaultValue: '' },
        { key: 'operation', label: '时间操作', type: 'select', options: ['获取当前日期', '计算日期差', '格式化日期', '日期偏移'], defaultValue: '获取当前日期' },
        { key: 'output_format', label: '输出格式', type: 'text', placeholder: 'YYYY-MM-DD HH:mm:ss' },
        { key: 'offset_value', label: '偏移量', type: 'number', defaultValue: 1 },
        { key: 'offset_unit', label: '偏移单位', type: 'select', options: ['天', '小时', '分钟', '月', '年'], defaultValue: '天' },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  aggregate: {
    sections: [
      { title: '数据聚合配置', fields: [
        { key: 'fields', label: '聚合字段', type: 'textarea', placeholder: '需要聚合的字段列表...' },
        { key: 'aggregate_mode', label: '聚合模式', type: 'select', options: ['合并所有字段', '选择字段'], defaultValue: '合并所有字段' },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  sort: {
    sections: [
      { title: '本体属性排序', fields: [
        { key: 'ontology_model', label: '本体模型', type: 'select', options: ['客户360', '供应链网络'], defaultValue: '' },
        { key: 'business_object', label: '业务对象', type: 'select', options: ['Customer / 客户', 'Order / 订单', 'Product / 产品', 'Payment / 支付', 'OrderProduct / 订单产品明细'], defaultValue: '' },
        { key: 'sort_property', label: '排序属性字段', type: 'select', options: ['客户ID', '客户名称', '信用等级', '订单金额', '订单状态', '下单时间', '产品名称', '单价', '库存数量', '支付金额', '支付时间'], defaultValue: '' },
        { key: 'sort_direction', label: '排序方向', type: 'select', options: ['升序 (ASC)', '降序 (DESC)'], defaultValue: '降序 (DESC)' },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  remove_duplicates: {
    sections: [
      { title: '本体属性去重', fields: [
        { key: 'ontology_model', label: '本体模型', type: 'select', options: ['客户360', '供应链网络'], defaultValue: '' },
        { key: 'business_object', label: '业务对象', type: 'select', options: ['Customer / 客户', 'Order / 订单', 'Product / 产品', 'Payment / 支付', 'OrderProduct / 订单产品明细'], defaultValue: '' },
        { key: 'dedupe_property', label: '去重属性字段', type: 'select', options: ['客户ID', '订单ID', '产品ID', '支付ID', '明细ID'], defaultValue: '' },
        { key: 'dedupe_strategy', label: '去重策略', type: 'select', options: ['保留首条', '保留末条'], defaultValue: '保留首条' },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  limit: {
    sections: [
      { title: '数据限制配置', fields: [
        { key: 'max_items', label: '最大项目数', type: 'number', defaultValue: 10 },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  split_out: {
    sections: [
      { title: '列表拆分配置', fields: [
        { key: 'field_to_split', label: '拆分字段', type: 'text', placeholder: '包含数组的字段名...' },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
  summarize: {
    sections: [
      { title: '本体属性汇总', fields: [
        { key: 'ontology_model', label: '本体模型', type: 'select', options: ['客户360', '供应链网络'], defaultValue: '' },
        { key: 'business_object', label: '业务对象', type: 'select', options: ['Customer / 客户', 'Order / 订单', 'Product / 产品', 'Payment / 支付', 'OrderProduct / 订单产品明细'], defaultValue: '' },
        { key: 'group_property', label: '分组属性字段', type: 'textarea', placeholder: '按哪些属性字段分组...' },
        { key: 'aggregate_property', label: '聚合属性字段', type: 'select', options: ['订单金额', '支付金额', '单价', '库存数量', '数量', '小计金额'], defaultValue: '' },
        { key: 'aggregate_action', label: '聚合行动', type: 'select', options: ['求和', '计数', '平均值', '最大值', '最小值'], defaultValue: '求和' },
      ]},
      { title: '通用设置', fields: [
        { key: 'notes', label: '节点备注', type: 'textarea', placeholder: '备注信息...' },
      ]},
    ],
  },
};

// ============ Ontology 本体模型数据 ============
export const ontologies = [
  {
    id: 'ont-001',
    name: '客户360',
    description: '客户全生命周期语义模型，整合客户、订单、产品与支付关系',
    status: 'active',
    updatedAt: '2026-06-08 14:30',
    creator: '张工',
    objectTypes: [
      {
        id: 'ot-001',
        name: 'Customer',
        displayName: '客户',
        description: '企业客户实体',
        primary_key_id: 'field-cust-001',
        fields: [
          { field_id: 'field-cust-001', name: '客户ID', data_type: 'string', description: '客户唯一标识', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-cust-002', name: '客户名称', data_type: 'string', description: '客户公司名称', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-cust-003', name: '信用等级', data_type: 'string', description: '客户信用评级', required: false, is_enum: true, enum_values: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B'] },
          { field_id: 'field-cust-004', name: '联系电话', data_type: 'string', description: '主要联系电话', required: false, is_enum: false, enum_values: [] },
          { field_id: 'field-cust-005', name: '注册日期', data_type: 'date', description: '客户注册日期', required: true, is_enum: false, enum_values: [] },
        ],
        properties: [
          { name: 'customer_id', type: 'string', description: '客户唯一标识' },
          { name: 'name', type: 'string', description: '客户名称' },
          { name: 'email', type: 'string', description: '邮箱地址' },
          { name: 'level', type: 'enum', description: '客户等级(A/B/C/D)' },
          { name: 'created_at', type: 'datetime', description: '注册时间' },
        ],
        position: { x: 300, y: 100 },
      },
      {
        id: 'ot-002',
        name: 'Order',
        displayName: '订单',
        description: '客户交易订单',
        primary_key_id: 'field-ord-001',
        fields: [
          { field_id: 'field-ord-001', name: '订单ID', data_type: 'string', description: '订单唯一标识', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-ord-002', name: '订单金额', data_type: 'float', description: '订单总金额', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-ord-003', name: '订单状态', data_type: 'string', description: '订单当前状态', required: true, is_enum: true, enum_values: ['待审批', '已审批', '已发货', '已完成', '已取消'] },
          { field_id: 'field-ord-004', name: '下单时间', data_type: 'datetime', description: '订单创建时间', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-ord-005', name: '备注', data_type: 'text', description: '订单备注信息', required: false, is_enum: false, enum_values: [] },
          { field_id: 'field-ord-006', name: '客户ID', data_type: 'string', description: '关联客户的外键', required: true, is_enum: false, enum_values: [] },
        ],
        properties: [
          { name: 'order_id', type: 'string', description: '订单唯一标识' },
          { name: 'amount', type: 'float', description: '订单金额' },
          { name: 'status', type: 'enum', description: '订单状态(待审批/已审批/已发货/已完成/已取消)' },
          { name: 'order_date', type: 'datetime', description: '下单时间' },
          { name: 'remark', type: 'string', description: '备注' },
          { name: 'customer_id', type: 'string', description: '关联客户的外键' },
        ],
        position: { x: 600, y: 100 },
      },
      {
        id: 'ot-003',
        name: 'Product',
        displayName: '产品',
        description: '企业产品目录',
        primary_key_id: 'field-prod-001',
        fields: [
          { field_id: 'field-prod-001', name: '产品ID', data_type: 'string', description: '产品唯一标识', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-prod-002', name: '产品名称', data_type: 'string', description: '产品名称', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-prod-003', name: '单价', data_type: 'float', description: '产品单价', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-prod-004', name: '类别', data_type: 'string', description: '产品所属类别', required: false, is_enum: true, enum_values: ['电子产品', '办公用品', '原材料', '服务'] },
          { field_id: 'field-prod-005', name: '库存数量', data_type: 'integer', description: '当前库存数量', required: false, is_enum: false, enum_values: [] },
        ],
        properties: [
          { name: 'product_id', type: 'string', description: '产品唯一标识' },
          { name: 'product_name', type: 'string', description: '产品名称' },
          { name: 'price', type: 'float', description: '产品单价' },
          { name: 'category', type: 'enum', description: '产品类别(电子产品/办公用品/原材料/服务)' },
          { name: 'stock_quantity', type: 'int', description: '库存数量' },
        ],
        position: { x: 900, y: 100 },
      },
      {
        id: 'ot-004',
        name: 'Payment',
        displayName: '支付',
        description: '订单支付记录',
        primary_key_id: 'field-pay-001',
        fields: [
          { field_id: 'field-pay-001', name: '支付ID', data_type: 'string', description: '支付唯一标识', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-pay-002', name: '支付金额', data_type: 'float', description: '实际支付金额', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-pay-003', name: '支付方式', data_type: 'string', description: '支付方式', required: true, is_enum: true, enum_values: ['银行转账', '信用卡', '支付宝', '微信支付'] },
          { field_id: 'field-pay-004', name: '支付时间', data_type: 'datetime', description: '支付完成时间', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-pay-005', name: '支付状态', data_type: 'string', description: '支付当前状态', required: false, is_enum: true, enum_values: ['待支付', '已支付', '已退款'] },
          { field_id: 'field-pay-006', name: '订单ID', data_type: 'string', description: '关联订单的外键', required: true, is_enum: false, enum_values: [] },
        ],
        properties: [
          { name: 'payment_id', type: 'string', description: '支付唯一标识' },
          { name: 'amount', type: 'float', description: '支付金额' },
          { name: 'method', type: 'enum', description: '支付方式(银行转账/信用卡/支付宝/微信支付)' },
          { name: 'paid_at', type: 'datetime', description: '支付时间' },
          { name: 'status', type: 'enum', description: '支付状态(待支付/已支付/已退款)' },
          { name: 'order_id', type: 'string', description: '关联订单的外键' },
        ],
        position: { x: 150, y: 350 },
      },
      {
        id: 'ot-005',
        name: 'OrderProduct',
        displayName: '订单产品明细',
        description: '订单与产品多对多中间表',
        primary_key_id: 'field-op-001',
        fields: [
          { field_id: 'field-op-001', name: '明细ID', data_type: 'string', description: '明细唯一标识', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-op-002', name: '订单ID', data_type: 'string', description: '关联订单的外键', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-op-003', name: '产品ID', data_type: 'string', description: '关联产品的外键', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-op-004', name: '数量', data_type: 'integer', description: '购买数量', required: true, is_enum: false, enum_values: [] },
          { field_id: 'field-op-005', name: '小计金额', data_type: 'float', description: '小计金额(单价×数量)', required: false, is_enum: false, enum_values: [] },
        ],
        properties: [
          { name: 'id', type: 'string', description: '明细唯一标识' },
          { name: 'order_id', type: 'string', description: '关联订单ID' },
          { name: 'product_id', type: 'string', description: '关联产品ID' },
          { name: 'quantity', type: 'int', description: '购买数量' },
          { name: 'subtotal', type: 'float', description: '小计金额' },
        ],
        position: { x: 750, y: 300 },
      },
    ],
    actionTypes: [
      {
        id: 'act-001',
        name: 'ApproveOrder',
        displayName: '审批订单',
        description: '对客户订单执行审批操作',
        targetObjectType: 'ot-002',
        action_type: 'object',
        operation: 'update_object',
        target_model_id: 'ot-002',
        target_link_id: null,
        parameters: [
          { name: 'order_id', type: 'string', required: true, default_value: '', description: '订单ID' },
          { name: 'approve_status', type: 'string', required: true, default_value: '已审批', description: '审批结果', is_enum: true, enum_values: ['已审批', '已拒绝'] },
          { name: 'approve_comment', type: 'string', required: false, default_value: '', description: '审批意见' },
        ],
        submission_criteria: [
          { field: 'order_id', condition: 'not_empty', value: '', description: '订单ID不能为空' },
          { field: 'approve_status', condition: 'in', value: '已审批,已拒绝', description: '审批状态必须有效' },
        ],
        function_code: null,
        position: { x: 500, y: 100 },
      },
      {
        id: 'act-002',
        name: 'RiskAssessment',
        displayName: '风险评估',
        description: '对客户订单执行风险评估计算',
        targetObjectType: 'ot-002',
        action_type: 'function',
        operation: 'execute_function',
        target_model_id: null,
        target_link_id: null,
        parameters: [
          { name: 'customer_id', type: 'string', required: true, default_value: '', description: '客户ID' },
          { name: 'order_id', type: 'string', required: true, default_value: '', description: '订单ID' },
          { name: 'amount', type: 'float', required: true, default_value: '', description: '订单金额' },
        ],
        submission_criteria: [
          { field: 'customer_id', condition: 'not_empty', value: '', description: '客户ID不能为空' },
          { field: 'order_id', condition: 'not_empty', value: '', description: '订单ID不能为空' },
          { field: 'amount', condition: 'greater_than', value: '0', description: '订单金额必须大于0' },
        ],
        function_code: `function assessRisk(customerId, orderId, amount) {
  // 获取客户信用等级
  const customer = getCustomer(customerId);
  let riskScore = 0;

  // 信用等级评估
  const creditRiskMap = { 'AAA': 0, 'AA': 10, 'A': 20, 'BBB': 40, 'BB': 60, 'B': 80 };
  riskScore += creditRiskMap[customer.credit_level] || 50;

  // 订单金额评估 (金额越大风险越高)
  if (amount > 100000) riskScore += 30;
  else if (amount > 50000) riskScore += 20;
  else if (amount > 10000) riskScore += 10;

  // 返回风险等级
  if (riskScore >= 70) return { level: '高风险', action: '需人工审核' };
  if (riskScore >= 40) return { level: '中风险', action: '建议关注' };
  return { level: '低风险', action: '自动通过' };
}`,
        position: { x: 300, y: 500 },
      },
      {
        id: 'act-003',
        name: 'AddOrderProduct',
        displayName: '添加订单产品',
        description: '为订单添加产品明细',
        targetObjectType: 'ot-005',
        action_type: 'link',
        operation: 'create_link',
        target_model_id: null,
        target_link_id: 'lk-004',
        parameters: [
          { name: 'order_id', type: 'string', required: true, default_value: '', description: '订单ID' },
          { name: 'product_id', type: 'string', required: true, default_value: '', description: '产品ID' },
          { name: 'quantity', type: 'integer', required: true, default_value: '1', description: '数量' },
          { name: 'subtotal', type: 'float', required: false, default_value: '', description: '小计金额' },
        ],
        submission_criteria: [
          { field: 'order_id', condition: 'not_empty', value: '', description: '订单ID不能为空' },
          { field: 'product_id', condition: 'not_empty', value: '', description: '产品ID不能为空' },
          { field: 'quantity', condition: 'greater_than', value: '0', description: '数量必须大于0' },
        ],
        function_code: null,
        position: { x: 500, y: 350 },
      },
    ],
    linkTypes: [
      {
        id: 'lk-001',
        name: 'places',
        displayName: '客户下单',
        description: '客户与订单一对多关系',
        source: 'ot-001',
        target: 'ot-002',
        cardinality: 'one-to-many',
        source_key: 'field-cust-001',
        target_key: 'field-ord-006',
        intermediate_model: null,
        intermediate_source_key: null,
        intermediate_target_key: null,
      },
      {
        id: 'lk-002',
        name: 'contains',
        displayName: '订单包含',
        description: '订单与产品包含关系(逻辑关系，物理实现通过lk-004)',
        source: 'ot-002',
        target: 'ot-003',
        cardinality: 'one-to-many',
        source_key: 'field-ord-001',
        target_key: null,
        intermediate_model: null,
        intermediate_source_key: null,
        intermediate_target_key: null,
      },
      {
        id: 'lk-003',
        name: 'pays',
        displayName: '订单支付',
        description: '订单与支付一对多关系',
        source: 'ot-002',
        target: 'ot-004',
        cardinality: 'one-to-many',
        source_key: 'field-ord-001',
        target_key: 'field-pay-006',
        intermediate_model: null,
        intermediate_source_key: null,
        intermediate_target_key: null,
      },
      {
        id: 'lk-004',
        name: 'order_products',
        displayName: '订单产品',
        description: '订单与产品多对多关系',
        source: 'ot-002',
        target: 'ot-003',
        cardinality: 'many-to-many',
        source_key: 'field-ord-001',
        target_key: 'field-prod-001',
        intermediate_model: 'ot-005',
        intermediate_source_key: 'field-op-002',
        intermediate_target_key: 'field-op-003',
      },
    ],
  },
  {
    id: 'ont-002',
    name: '供应链网络',
    description: '供应链上下游关系模型，涵盖供应商、仓储与物流运输',
    status: 'draft',
    updatedAt: '2026-06-04 14:30',
    creator: '李工',
    objectTypes: [
      {
        id: 'ot-101',
        name: 'Supplier',
        displayName: '供应商',
        description: '上游供应商实体',
        properties: [
          { name: 'supplier_id', type: 'string', description: '供应商唯一标识' },
          { name: 'company_name', type: 'string', description: '公司名称' },
          { name: 'rating', type: 'float', description: '供应商评分(0-5)' },
          { name: 'is_active', type: 'boolean', description: '是否活跃' },
        ],
        position: { x: 200, y: 100 },
      },
      {
        id: 'ot-102',
        name: 'Warehouse',
        displayName: '仓库',
        description: '仓储设施节点',
        properties: [
          { name: 'warehouse_id', type: 'string', description: '仓库唯一标识' },
          { name: 'location', type: 'string', description: '仓库地理位置' },
          { name: 'capacity', type: 'int', description: '最大容量(件)' },
          { name: 'utilization', type: 'float', description: '当前利用率(0-1)' },
        ],
        position: { x: 600, y: 100 },
      },
      {
        id: 'ot-103',
        name: 'Shipment',
        displayName: '运输单',
        description: '物流运输单据',
        properties: [
          { name: 'shipment_id', type: 'string', description: '运输单唯一标识' },
          { name: 'destination', type: 'string', description: '目的地' },
          { name: 'weight', type: 'float', description: '货物重量(kg)' },
          { name: 'shipped_at', type: 'datetime', description: '发货时间' },
        ],
        position: { x: 1000, y: 100 },
      },
    ],
    actionTypes: [
      {
        id: 'act-101',
        name: 'ReorderStock',
        displayName: '补货',
        description: '向供应商发起补货请求',
        targetObjectType: 'ot-102',
        position: { x: 400, y: 350 },
      },
      {
        id: 'act-102',
        name: 'RouteShipment',
        displayName: '路由分配',
        description: '为运输单分配最优物流路线',
        targetObjectType: 'ot-103',
        position: { x: 800, y: 350 },
      },
    ],
    linkTypes: [
      {
        id: 'lk-101',
        name: 'supplies',
        displayName: '供货',
        description: 'Supplier 向 Warehouse 供货',
        source: 'ot-101',
        target: 'ot-102',
      },
      {
        id: 'lk-102',
        name: 'dispatches',
        displayName: '发运',
        description: 'Warehouse 发运 Shipment',
        source: 'ot-102',
        target: 'ot-103',
      },
      {
        id: 'lk-103',
        name: 'reorders',
        displayName: '补货关联',
        description: 'ReorderStock 补货至 Warehouse',
        source: 'act-101',
        target: 'ot-102',
      },
      {
        id: 'lk-104',
        name: 'routes',
        displayName: '路由关联',
        description: 'RouteShipment 路由分配 Shipment',
        source: 'act-102',
        target: 'ot-103',
      },
    ],
  },
  {
  id: 'ont-003',
  name: '供应链控制塔',
  description: '供应链全链路语义模型，整合产品、物料、工艺路线、机台设备、供应商、客户、工单、采购订单、排程、库存、质量、物流、风险等全链路业务实体，包含35个业务对象、85条关系定义和18个业务行动',
  status: 'published',
  updatedAt: '2026-06-08 14:30',
  creator: '数据架构师',
  objectTypes: [
    {
      id: 'ot-sc-001',
      name: 'Product',
      displayName: '产品',
      description: '半导体封装测试产品定义',
      primary_key_id: 'product_id',
      fields: [
        {
          field_id: 'product_id',
          name: '产品ID',
          data_type: 'string',
          description: '产品唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'product_name',
          name: '产品名称',
          data_type: 'string',
          description: '产品名称',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'product_type',
          name: '产品类型',
          data_type: 'string',
          description: '产品类型（枚举：成品）',
          required: true,
          is_enum: true,
          enum_values: [
            '成品'
          ]
        },
        {
          field_id: 'standard_cycle_time',
          name: '标准周期(小时)',
          data_type: 'float',
          description: '标准生产周期（单位：小时）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'routing_steps',
          name: '工序数',
          data_type: 'integer',
          description: '工艺路线工序数量',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'setup_group',
          name: '换线组',
          data_type: 'string',
          description: '换线组（用于排程优化，同组工单可合并）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'unit_of_measure',
          name: '计量单位',
          data_type: 'string',
          description: '计量单位（如：PCS/片/千克/米）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_active',
          name: '是否激活',
          data_type: 'boolean',
          description: '是否启用（True=启用，False=停用）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'created_at',
          name: '创建时间',
          data_type: 'datetime',
          description: '创建时间（系统自动生成）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'product_id',
          type: 'string',
          description: '产品唯一标识符'
        },
        {
          name: 'product_name',
          type: 'string',
          description: '产品名称'
        },
        {
          name: 'product_type',
          type: 'string',
          description: '产品类型（枚举：成品）'
        },
        {
          name: 'standard_cycle_time',
          type: 'float',
          description: '标准生产周期（单位：小时）'
        },
        {
          name: 'routing_steps',
          type: 'integer',
          description: '工艺路线工序数量'
        },
        {
          name: 'setup_group',
          type: 'string',
          description: '换线组（用于排程优化，同组工单可合并）'
        },
        {
          name: 'unit_of_measure',
          type: 'string',
          description: '计量单位（如：PCS/片/千克/米）'
        },
        {
          name: 'is_active',
          type: 'boolean',
          description: '是否启用（True=启用，False=停用）'
        },
        {
          name: 'created_at',
          type: 'datetime',
          description: '创建时间（系统自动生成）'
        }
      ],
      position: {
        x: 100,
        y: 80
      }
    },
    {
      id: 'ot-sc-002',
      name: 'Material',
      displayName: '物料',
      description: '生产所需的原材料和辅料',
      primary_key_id: 'material_id',
      fields: [
        {
          field_id: 'material_id',
          name: '物料ID',
          data_type: 'string',
          description: '物料唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_name',
          name: '物料名称',
          data_type: 'string',
          description: '物料名称',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_type',
          name: '物料类型',
          data_type: 'string',
          description: '物料类型（枚举：原材料/辅料）',
          required: true,
          is_enum: true,
          enum_values: [
            '原材料',
            '辅料'
          ]
        },
        {
          field_id: 'unit_of_measure',
          name: '计量单位',
          data_type: 'string',
          description: '计量单位（如：PCS/片/千克/米）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'safety_stock_level',
          name: '安全库存',
          data_type: 'float',
          description: '安全库存水平（低于此值触发预警）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'reorder_point',
          name: 'Reorder点',
          data_type: 'float',
          description: '再订购点（低于此值触发采购）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'lot_size',
          name: '订购批量',
          data_type: 'float',
          description: '订购批量（每次采购的标准数量）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'eoq',
          name: '经济订购量',
          data_type: 'float',
          description: '经济订购量（Economic Order Quantity，最优采购批量）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'annual_demand',
          name: '年需求量',
          data_type: 'float',
          description: '年需求量（用于EOQ计算）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'holding_cost_rate',
          name: '持有成本率',
          data_type: 'float',
          description: '持有成本率（库存成本占物料价值的比例）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_active',
          name: '是否激活',
          data_type: 'boolean',
          description: '是否启用（True=启用，False=停用）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'created_at',
          name: '创建时间',
          data_type: 'datetime',
          description: '创建时间（系统自动生成）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'material_id',
          type: 'string',
          description: '物料唯一标识符'
        },
        {
          name: 'material_name',
          type: 'string',
          description: '物料名称'
        },
        {
          name: 'material_type',
          type: 'string',
          description: '物料类型（枚举：原材料/辅料）'
        },
        {
          name: 'unit_of_measure',
          type: 'string',
          description: '计量单位（如：PCS/片/千克/米）'
        },
        {
          name: 'safety_stock_level',
          type: 'float',
          description: '安全库存水平（低于此值触发预警）'
        },
        {
          name: 'reorder_point',
          type: 'float',
          description: '再订购点（低于此值触发采购）'
        },
        {
          name: 'lot_size',
          type: 'float',
          description: '订购批量（每次采购的标准数量）'
        },
        {
          name: 'eoq',
          type: 'float',
          description: '经济订购量（Economic Order Quantity，最优采购批量）'
        },
        {
          name: 'annual_demand',
          type: 'float',
          description: '年需求量（用于EOQ计算）'
        },
        {
          name: 'holding_cost_rate',
          type: 'float',
          description: '持有成本率（库存成本占物料价值的比例）'
        },
        {
          name: 'is_active',
          type: 'boolean',
          description: '是否启用（True=启用，False=停用）'
        },
        {
          name: 'created_at',
          type: 'datetime',
          description: '创建时间（系统自动生成）'
        }
      ],
      position: {
        x: 360,
        y: 80
      }
    },
    {
      id: 'ot-sc-003',
      name: 'WorkCenter',
      displayName: '工作中心',
      description: '产能资源池',
      primary_key_id: 'work_center_id',
      fields: [
        {
          field_id: 'work_center_id',
          name: '工作中心ID',
          data_type: 'string',
          description: '工作中心唯一标识符（主键）',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'work_center_name',
          name: '工作中心名称',
          data_type: 'string',
          description: '工作中心名称',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'work_center_type',
          name: '类型',
          data_type: 'string',
          description: '工作中心类型（枚举：接收/加工/检验/测试/辅助/出货）',
          required: true,
          is_enum: true,
          enum_values: [
            '接收',
            '加工',
            '检验',
            '测试',
            '辅助',
            '出货'
          ]
        },
        {
          field_id: 'capacity_uom',
          name: '产能单位',
          data_type: 'string',
          description: '产能计量单位（如：小时/片/批次）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_active',
          name: '是否激活',
          data_type: 'boolean',
          description: '是否启用（True=启用，False=停用）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'work_center_id',
          type: 'string',
          description: '工作中心唯一标识符（主键）'
        },
        {
          name: 'work_center_name',
          type: 'string',
          description: '工作中心名称'
        },
        {
          name: 'work_center_type',
          type: 'string',
          description: '工作中心类型（枚举：接收/加工/检验/测试/辅助/出货）'
        },
        {
          name: 'capacity_uom',
          type: 'string',
          description: '产能计量单位（如：小时/片/批次）'
        },
        {
          name: 'is_active',
          type: 'boolean',
          description: '是否启用（True=启用，False=停用）'
        }
      ],
      position: {
        x: 620,
        y: 80
      }
    },
    {
      id: 'ot-sc-004',
      name: 'Machine',
      displayName: '机台设备',
      description: '具体生产设备',
      primary_key_id: 'machine_id',
      fields: [
        {
          field_id: 'machine_id',
          name: '机台ID',
          data_type: 'string',
          description: '机台唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'machine_name',
          name: '机台名称',
          data_type: 'string',
          description: '机台名称',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'machine_type',
          name: '机台类型',
          data_type: 'string',
          description: '机台类型（枚举：自动/半自动/手动）',
          required: true,
          is_enum: true,
          enum_values: [
            '自动',
            '半自动',
            '手动'
          ]
        },
        {
          field_id: 'work_center_id',
          name: '所属工作中心ID',
          data_type: 'string',
          description: '所属工作中心ID（外键关联work_center表）',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'max_capacity_per_hour',
          name: '最大产能(片/小时)',
          data_type: 'float',
          description: '最大产能（单位：片/小时）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '机台状态（枚举：在线/离线/维护中/故障/待机）',
          required: false,
          is_enum: true,
          enum_values: [
            '在线',
            '离线',
            '维护中',
            '故障',
            '待机'
          ]
        },
        {
          field_id: 'current_product_id',
          name: '当前生产产品ID',
          data_type: 'string',
          description: '当前加工产品ID',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'current_setup_group',
          name: '当前换线组',
          data_type: 'string',
          description: '当前换线组状态',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'last_maintenance_date',
          name: '上次维护日期',
          data_type: 'date',
          description: '上次维护日期',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'next_maintenance_date',
          name: '下次维护日期',
          data_type: 'date',
          description: '下次维护日期（到期需安排保养）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_active',
          name: '是否启用',
          data_type: 'boolean',
          description: '是否启用（True=启用，False=停用）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'machine_id',
          type: 'string',
          description: '机台唯一标识符'
        },
        {
          name: 'machine_name',
          type: 'string',
          description: '机台名称'
        },
        {
          name: 'machine_type',
          type: 'string',
          description: '机台类型（枚举：自动/半自动/手动）'
        },
        {
          name: 'work_center_id',
          type: 'string',
          description: '所属工作中心ID（外键关联work_center表）'
        },
        {
          name: 'max_capacity_per_hour',
          type: 'float',
          description: '最大产能（单位：片/小时）'
        },
        {
          name: 'status',
          type: 'string',
          description: '机台状态（枚举：在线/离线/维护中/故障/待机）'
        },
        {
          name: 'current_product_id',
          type: 'string',
          description: '当前加工产品ID'
        },
        {
          name: 'current_setup_group',
          type: 'string',
          description: '当前换线组状态'
        },
        {
          name: 'last_maintenance_date',
          type: 'date',
          description: '上次维护日期'
        },
        {
          name: 'next_maintenance_date',
          type: 'date',
          description: '下次维护日期（到期需安排保养）'
        },
        {
          name: 'is_active',
          type: 'boolean',
          description: '是否启用（True=启用，False=停用）'
        }
      ],
      position: {
        x: 880,
        y: 80
      }
    },
    {
      id: 'ot-sc-005',
      name: 'ProcessRoute',
      displayName: '工艺路线',
      description: '产品的标准生产工艺（每个产品独立路线）',
      primary_key_id: 'route_id',
      fields: [
        {
          field_id: 'route_id',
          name: '路线ID',
          data_type: 'string',
          description: '工艺路线唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'product_id',
          name: '产品ID',
          data_type: 'string',
          description: '产品唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'route_name',
          name: '路线名称',
          data_type: 'string',
          description: '工艺路线名称',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'version',
          name: '版本',
          data_type: 'string',
          description: '版本号（格式：v1.0/v2.0）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_active',
          name: '是否激活',
          data_type: 'boolean',
          description: '是否启用（True=启用，False=停用）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'effective_date',
          name: '生效日期',
          data_type: 'date',
          description: '生效日期',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'expiry_date',
          name: '失效日期',
          data_type: 'date',
          description: '失效日期（过期后不可使用）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'route_id',
          type: 'string',
          description: '工艺路线唯一标识符'
        },
        {
          name: 'product_id',
          type: 'string',
          description: '产品唯一标识符'
        },
        {
          name: 'route_name',
          type: 'string',
          description: '工艺路线名称'
        },
        {
          name: 'version',
          type: 'string',
          description: '版本号（格式：v1.0/v2.0）'
        },
        {
          name: 'is_active',
          type: 'boolean',
          description: '是否启用（True=启用，False=停用）'
        },
        {
          name: 'effective_date',
          type: 'date',
          description: '生效日期'
        },
        {
          name: 'expiry_date',
          type: 'date',
          description: '失效日期（过期后不可使用）'
        }
      ],
      position: {
        x: 1140,
        y: 80
      }
    },
    {
      id: 'ot-sc-006',
      name: 'RouteStep',
      displayName: '工序',
      description: '工艺路线的具体步骤，包含时间、良率、设备要求',
      primary_key_id: 'step_id',
      fields: [
        {
          field_id: 'step_id',
          name: '工序ID',
          data_type: 'string',
          description: '工序唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'route_id',
          name: '所属路线ID',
          data_type: 'string',
          description: '工艺路线唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'sequence_no',
          name: '工序序号',
          data_type: 'integer',
          description: '工序序号（执行顺序，从1开始）',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'step_name',
          name: '工序名称',
          data_type: 'string',
          description: '工序名称',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'operation_type',
          name: '操作类型',
          data_type: 'string',
          description: '操作类型（枚举：加工/检验）',
          required: false,
          is_enum: true,
          enum_values: [
            '加工',
            '检验'
          ]
        },
        {
          field_id: 'standard_time_hours',
          name: '标准工时(小时)',
          data_type: 'float',
          description: '标准工时（单位：小时）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'machine_type_required',
          name: '所需工作中心ID',
          data_type: 'string',
          description: '所需机台类型',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'setup_time_minutes',
          name: '换线时间(分钟)',
          data_type: 'integer',
          description: '换线/准备时间（单位：分钟）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_ready_offset_hours',
          name: '物料准备偏移(小时)',
          data_type: 'float',
          description: '物料准备提前时间（单位：小时，工序开始前物料需到位的时间）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'yield_rate_standard',
          name: '标准良率',
          data_type: 'float',
          description: '标准良率（目标良率，如0.98表示98%）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_critical',
          name: '是否关键工序',
          data_type: 'boolean',
          description: '是否关键工序（True=关键路径，影响整体交期）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'wait_time_hours',
          name: '等待时间(小时)',
          data_type: 'float',
          description: '工序间等待时间（如固化/冷却时间，单位：小时）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'transport_time_hours',
          name: '转运时间(小时)',
          data_type: 'float',
          description: '转运时间（到下一工作中心的时间，单位：小时）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'min_batch_qty',
          name: '最小批量',
          data_type: 'float',
          description: '最小批量（合批排程的最小数量）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'max_batch_qty',
          name: '最大批量',
          data_type: 'float',
          description: '最大批量（单次加工的最大数量约束）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'step_id',
          type: 'string',
          description: '工序唯一标识符'
        },
        {
          name: 'route_id',
          type: 'string',
          description: '工艺路线唯一标识符'
        },
        {
          name: 'sequence_no',
          type: 'integer',
          description: '工序序号（执行顺序，从1开始）'
        },
        {
          name: 'step_name',
          type: 'string',
          description: '工序名称'
        },
        {
          name: 'operation_type',
          type: 'string',
          description: '操作类型（枚举：加工/检验）'
        },
        {
          name: 'standard_time_hours',
          type: 'float',
          description: '标准工时（单位：小时）'
        },
        {
          name: 'machine_type_required',
          type: 'string',
          description: '所需机台类型'
        },
        {
          name: 'setup_time_minutes',
          type: 'integer',
          description: '换线/准备时间（单位：分钟）'
        },
        {
          name: 'material_ready_offset_hours',
          type: 'float',
          description: '物料准备提前时间（单位：小时，工序开始前物料需到位的时间）'
        },
        {
          name: 'yield_rate_standard',
          type: 'float',
          description: '标准良率（目标良率，如0.98表示98%）'
        },
        {
          name: 'is_critical',
          type: 'boolean',
          description: '是否关键工序（True=关键路径，影响整体交期）'
        },
        {
          name: 'wait_time_hours',
          type: 'float',
          description: '工序间等待时间（如固化/冷却时间，单位：小时）'
        },
        {
          name: 'transport_time_hours',
          type: 'float',
          description: '转运时间（到下一工作中心的时间，单位：小时）'
        },
        {
          name: 'min_batch_qty',
          type: 'float',
          description: '最小批量（合批排程的最小数量）'
        },
        {
          name: 'max_batch_qty',
          type: 'float',
          description: '最大批量（单次加工的最大数量约束）'
        }
      ],
      position: {
        x: 1400,
        y: 80
      }
    },
    {
      id: 'ot-sc-007',
      name: 'MachineCapability',
      displayName: '机台能力矩阵',
      description: '机台-产品能力矩阵，决定哪些机台能生产哪些产品',
      primary_key_id: 'capability_id',
      fields: [
        {
          field_id: 'capability_id',
          name: '能力ID',
          data_type: 'string',
          description: '能力矩阵唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'machine_id',
          name: '机台ID',
          data_type: 'string',
          description: '机台唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'product_id',
          name: '产品ID',
          data_type: 'string',
          description: '产品唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'efficiency_factor',
          name: '效率因子',
          data_type: 'float',
          description: '效率因子（如1.0表示标准效率，1.2表示120%效率）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'setup_time_minutes',
          name: '换线时间(分钟)',
          data_type: 'integer',
          description: '换线/准备时间（单位：分钟）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'yield_rate',
          name: '良率',
          data_type: 'float',
          description: '实际良率（历史统计良率）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_preferred',
          name: '是否首选',
          data_type: 'boolean',
          description: '是否首选机台（True=优先分配任务）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'rated_speed_per_hour',
          name: '额定速度(片/小时)',
          data_type: 'float',
          description: '额定速度（单位：片/小时）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'effective_date',
          name: '生效日期',
          data_type: 'date',
          description: '生效日期',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_efficiency_avg',
          name: '实际效率均值',
          data_type: 'float',
          description: '实际效率均值（基于历史任务统计）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_yield_avg',
          name: '实际良率均值',
          data_type: 'float',
          description: '实际良率均值（基于历史任务统计）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'sample_count',
          name: '样本数量',
          data_type: 'integer',
          description: '统计样本数量（用于计算均值）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'last_updated_at',
          name: '最后更新时间',
          data_type: 'datetime',
          description: '最后更新时间（OEE数据更新时间）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'capability_id',
          type: 'string',
          description: '能力矩阵唯一标识符'
        },
        {
          name: 'machine_id',
          type: 'string',
          description: '机台唯一标识符'
        },
        {
          name: 'product_id',
          type: 'string',
          description: '产品唯一标识符'
        },
        {
          name: 'efficiency_factor',
          type: 'float',
          description: '效率因子（如1.0表示标准效率，1.2表示120%效率）'
        },
        {
          name: 'setup_time_minutes',
          type: 'integer',
          description: '换线/准备时间（单位：分钟）'
        },
        {
          name: 'yield_rate',
          type: 'float',
          description: '实际良率（历史统计良率）'
        },
        {
          name: 'is_preferred',
          type: 'boolean',
          description: '是否首选机台（True=优先分配任务）'
        },
        {
          name: 'rated_speed_per_hour',
          type: 'float',
          description: '额定速度（单位：片/小时）'
        },
        {
          name: 'effective_date',
          type: 'date',
          description: '生效日期'
        },
        {
          name: 'actual_efficiency_avg',
          type: 'float',
          description: '实际效率均值（基于历史任务统计）'
        },
        {
          name: 'actual_yield_avg',
          type: 'float',
          description: '实际良率均值（基于历史任务统计）'
        },
        {
          name: 'sample_count',
          type: 'integer',
          description: '统计样本数量（用于计算均值）'
        },
        {
          name: 'last_updated_at',
          type: 'datetime',
          description: '最后更新时间（OEE数据更新时间）'
        }
      ],
      position: {
        x: 1660,
        y: 80
      }
    },
    {
      id: 'ot-sc-008',
      name: 'SetupMatrix',
      displayName: '换线矩阵',
      description: '产品间切换的换线时间定义',
      primary_key_id: 'matrix_id',
      fields: [
        {
          field_id: 'matrix_id',
          name: '矩阵ID',
          data_type: 'string',
          description: '换线矩阵唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'machine_id',
          name: '机台ID',
          data_type: 'string',
          description: '机台唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'from_product_id',
          name: '切换前产品ID',
          data_type: 'string',
          description: '切换前产品ID',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'to_product_id',
          name: '切换后产品ID',
          data_type: 'string',
          description: '切换后产品ID',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'setup_time_minutes',
          name: '换线时间(分钟)',
          data_type: 'integer',
          description: '换线/准备时间（单位：分钟）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'setup_type',
          name: '换线类型',
          data_type: 'string',
          description: '换线类型（枚举：换模）',
          required: false,
          is_enum: true,
          enum_values: [
            '换模'
          ]
        },
        {
          field_id: 'is_active',
          name: '是否激活',
          data_type: 'boolean',
          description: '是否启用（True=启用，False=停用）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'matrix_id',
          type: 'string',
          description: '换线矩阵唯一标识符'
        },
        {
          name: 'machine_id',
          type: 'string',
          description: '机台唯一标识符'
        },
        {
          name: 'from_product_id',
          type: 'string',
          description: '切换前产品ID'
        },
        {
          name: 'to_product_id',
          type: 'string',
          description: '切换后产品ID'
        },
        {
          name: 'setup_time_minutes',
          type: 'integer',
          description: '换线/准备时间（单位：分钟）'
        },
        {
          name: 'setup_type',
          type: 'string',
          description: '换线类型（枚举：换模）'
        },
        {
          name: 'is_active',
          type: 'boolean',
          description: '是否启用（True=启用，False=停用）'
        }
      ],
      position: {
        x: 100,
        y: 380
      }
    },
    {
      id: 'ot-sc-009',
      name: 'ShiftPattern',
      displayName: '班次模式',
      description: '班次定义（日班/夜班），包含工作时间、效率因子',
      primary_key_id: 'shift_id',
      fields: [
        {
          field_id: 'shift_id',
          name: '班次ID',
          data_type: 'string',
          description: '班次唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'shift_name',
          name: '班次名称',
          data_type: 'string',
          description: '班次名称（如：早班/中班/夜班）',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'start_time',
          name: '开始时间',
          data_type: 'string',
          description: '开始时间（格式：HH:MM，如08:00）',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'end_time',
          name: '结束时间',
          data_type: 'string',
          description: '结束时间（格式：HH:MM，如17:00）',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'available_hours',
          name: '可用工时',
          data_type: 'float',
          description: '可用工时（单位：小时）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'efficiency_factor',
          name: '效率因子',
          data_type: 'float',
          description: '效率因子（如1.0表示标准效率，1.2表示120%效率）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_active',
          name: '是否激活',
          data_type: 'boolean',
          description: '是否启用（True=启用，False=停用）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'shift_id',
          type: 'string',
          description: '班次唯一标识符'
        },
        {
          name: 'shift_name',
          type: 'string',
          description: '班次名称（如：早班/中班/夜班）'
        },
        {
          name: 'start_time',
          type: 'string',
          description: '开始时间（格式：HH:MM，如08:00）'
        },
        {
          name: 'end_time',
          type: 'string',
          description: '结束时间（格式：HH:MM，如17:00）'
        },
        {
          name: 'available_hours',
          type: 'float',
          description: '可用工时（单位：小时）'
        },
        {
          name: 'efficiency_factor',
          type: 'float',
          description: '效率因子（如1.0表示标准效率，1.2表示120%效率）'
        },
        {
          name: 'is_active',
          type: 'boolean',
          description: '是否启用（True=启用，False=停用）'
        }
      ],
      position: {
        x: 360,
        y: 380
      }
    },
    {
      id: 'ot-sc-010',
      name: 'Supplier',
      displayName: '供应商',
      description: '物料供应商',
      primary_key_id: 'supplier_id',
      fields: [
        {
          field_id: 'supplier_id',
          name: '供应商ID',
          data_type: 'string',
          description: '供应商唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'supplier_name',
          name: '供应商名称',
          data_type: 'string',
          description: '供应商名称',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'supplier_type',
          name: '合作类型',
          data_type: 'string',
          description: '合作类型（枚举：战略合作/直供/进口/备选）',
          required: false,
          is_enum: true,
          enum_values: [
            '战略合作',
            '直供',
            '进口',
            '备选'
          ]
        },
        {
          field_id: 'country',
          name: '国家/地区',
          data_type: 'string',
          description: '国家/地区（如：中国/美国/日本/台湾）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'industry_position',
          name: '行业地位',
          data_type: 'string',
          description: '行业地位（如：全球前三/国内领先/区域主要供应商）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'avg_lead_time_days',
          name: '平均交期(天)',
          data_type: 'integer',
          description: '平均交期（单位：天，从下单到收货的平均时间）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'reliability_score',
          name: '可靠度评分',
          data_type: 'float',
          description: '可靠度评分（0-1之间，越高越可靠）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'min_order_quantity',
          name: '最小订购量',
          data_type: 'float',
          description: '最小订购量（MOQ，低于此数量不接受订单）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'lead_time_stddev_days',
          name: '交期标准差(天)',
          data_type: 'float',
          description: '交期标准差（天，衡量交期稳定性）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_active',
          name: '是否激活',
          data_type: 'boolean',
          description: '是否启用（True=启用，False=停用）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'supplier_id',
          type: 'string',
          description: '供应商唯一标识符'
        },
        {
          name: 'supplier_name',
          type: 'string',
          description: '供应商名称'
        },
        {
          name: 'supplier_type',
          type: 'string',
          description: '合作类型（枚举：战略合作/直供/进口/备选）'
        },
        {
          name: 'country',
          type: 'string',
          description: '国家/地区（如：中国/美国/日本/台湾）'
        },
        {
          name: 'industry_position',
          type: 'string',
          description: '行业地位（如：全球前三/国内领先/区域主要供应商）'
        },
        {
          name: 'avg_lead_time_days',
          type: 'integer',
          description: '平均交期（单位：天，从下单到收货的平均时间）'
        },
        {
          name: 'reliability_score',
          type: 'float',
          description: '可靠度评分（0-1之间，越高越可靠）'
        },
        {
          name: 'min_order_quantity',
          type: 'float',
          description: '最小订购量（MOQ，低于此数量不接受订单）'
        },
        {
          name: 'lead_time_stddev_days',
          type: 'float',
          description: '交期标准差（天，衡量交期稳定性）'
        },
        {
          name: 'is_active',
          type: 'boolean',
          description: '是否启用（True=启用，False=停用）'
        }
      ],
      position: {
        x: 620,
        y: 380
      }
    },
    {
      id: 'ot-sc-011',
      name: 'SupplierMaterial',
      displayName: '供应商物料清单',
      description: '供应商能供应的物料及其价格、交期、最小订购量',
      primary_key_id: 'sm_id',
      fields: [
        {
          field_id: 'sm_id',
          name: '关系ID',
          data_type: 'string',
          description: '供应商物料关系唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'supplier_id',
          name: '供应商ID',
          data_type: 'string',
          description: '供应商唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_id',
          name: '物料ID',
          data_type: 'string',
          description: '物料唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'unit_price',
          name: '单价',
          data_type: 'float',
          description: '订单单价（单位：元）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'lead_time_days',
          name: '交期(天)',
          data_type: 'integer',
          description: '交期（单位：天）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'min_order_qty',
          name: '最小订购量',
          data_type: 'float',
          description: '最小订购量（MOQ，供应商要求的最小采购数量）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'max_order_qty',
          name: '最大订购量',
          data_type: 'float',
          description: '最大订购量（供应商单次最大供货能力）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_preferred',
          name: '是否首选供应商',
          data_type: 'boolean',
          description: '是否首选供应商（True=优先采购）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'effective_date',
          name: '生效日期',
          data_type: 'date',
          description: '生效日期',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'expiry_date',
          name: '失效日期',
          data_type: 'date',
          description: '失效日期（过期后不可使用）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'sm_id',
          type: 'string',
          description: '供应商物料关系唯一标识符'
        },
        {
          name: 'supplier_id',
          type: 'string',
          description: '供应商唯一标识符'
        },
        {
          name: 'material_id',
          type: 'string',
          description: '物料唯一标识符'
        },
        {
          name: 'unit_price',
          type: 'float',
          description: '订单单价（单位：元）'
        },
        {
          name: 'lead_time_days',
          type: 'integer',
          description: '交期（单位：天）'
        },
        {
          name: 'min_order_qty',
          type: 'float',
          description: '最小订购量（MOQ，供应商要求的最小采购数量）'
        },
        {
          name: 'max_order_qty',
          type: 'float',
          description: '最大订购量（供应商单次最大供货能力）'
        },
        {
          name: 'is_preferred',
          type: 'boolean',
          description: '是否首选供应商（True=优先采购）'
        },
        {
          name: 'effective_date',
          type: 'date',
          description: '生效日期'
        },
        {
          name: 'expiry_date',
          type: 'date',
          description: '失效日期（过期后不可使用）'
        }
      ],
      position: {
        x: 880,
        y: 380
      }
    },
    {
      id: 'ot-sc-012',
      name: 'MaterialSubstitute',
      displayName: '物料可用替代料',
      description: '物料缺料时可用的替代料关系',
      primary_key_id: 'ms_id',
      fields: [
        {
          field_id: 'ms_id',
          name: '替代关系ID',
          data_type: 'string',
          description: '物料替代关系唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_id',
          name: '原物料ID',
          data_type: 'string',
          description: '物料唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'substitute_material_id',
          name: '替代物料ID',
          data_type: 'string',
          description: '替代物料ID',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'substitute_priority',
          name: '替代优先级',
          data_type: 'integer',
          description: '替代优先级（数字越小优先级越高）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'quality_grade',
          name: '质量等级',
          data_type: 'string',
          description: '质量等级（枚举：同等级/略低）',
          required: false,
          is_enum: true,
          enum_values: [
            '同等级',
            '略低'
          ]
        },
        {
          field_id: 'approval_status',
          name: '审批状态',
          data_type: 'string',
          description: '审批状态（枚举：已批准/待审批/已拒绝）',
          required: false,
          is_enum: true,
          enum_values: [
            '已批准',
            '待审批',
            '已拒绝'
          ]
        },
        {
          field_id: 'cost_delta_percent',
          name: '成本差异(%)',
          data_type: 'float',
          description: '成本差异百分比（正数表示更贵，负数表示更便宜）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'ms_id',
          type: 'string',
          description: '物料替代关系唯一标识符'
        },
        {
          name: 'material_id',
          type: 'string',
          description: '物料唯一标识符'
        },
        {
          name: 'substitute_material_id',
          type: 'string',
          description: '替代物料ID'
        },
        {
          name: 'substitute_priority',
          type: 'integer',
          description: '替代优先级（数字越小优先级越高）'
        },
        {
          name: 'quality_grade',
          type: 'string',
          description: '质量等级（枚举：同等级/略低）'
        },
        {
          name: 'approval_status',
          type: 'string',
          description: '审批状态（枚举：已批准/待审批/已拒绝）'
        },
        {
          name: 'cost_delta_percent',
          type: 'float',
          description: '成本差异百分比（正数表示更贵，负数表示更便宜）'
        }
      ],
      position: {
        x: 1140,
        y: 380
      }
    },
    {
      id: 'ot-sc-013',
      name: 'Bom',
      displayName: '物料清单',
      description: '产品由哪些物料组成及用量',
      primary_key_id: 'bom_id',
      fields: [
        {
          field_id: 'bom_id',
          name: 'BOM ID',
          data_type: 'string',
          description: 'BOM唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'product_id',
          name: '产品ID',
          data_type: 'string',
          description: '产品唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_id',
          name: '物料ID',
          data_type: 'string',
          description: '物料唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'step_id',
          name: '消耗工序ID',
          data_type: 'string',
          description: '工序唯一标识符',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'quantity_per_unit',
          name: '单位用量',
          data_type: 'float',
          description: '单位用量（生产1个产品需要的物料数量）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_critical',
          name: '是否关键物料',
          data_type: 'boolean',
          description: '是否关键物料（True=缺料会导致停产）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'consumption_pattern',
          name: '消耗模式',
          data_type: 'string',
          description: '消耗模式（枚举：工序开始时消耗/按比例消耗）',
          required: false,
          is_enum: true,
          enum_values: [
            '工序开始时消耗',
            '按比例消耗'
          ]
        },
        {
          field_id: 'version',
          name: '版本',
          data_type: 'string',
          description: '版本号（格式：v1.0/v2.0）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'effective_date',
          name: '生效日期',
          data_type: 'date',
          description: '生效日期',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'expiry_date',
          name: '失效日期',
          data_type: 'date',
          description: '失效日期（过期后不可使用）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'bom_id',
          type: 'string',
          description: 'BOM唯一标识符'
        },
        {
          name: 'product_id',
          type: 'string',
          description: '产品唯一标识符'
        },
        {
          name: 'material_id',
          type: 'string',
          description: '物料唯一标识符'
        },
        {
          name: 'step_id',
          type: 'string',
          description: '工序唯一标识符'
        },
        {
          name: 'quantity_per_unit',
          type: 'float',
          description: '单位用量（生产1个产品需要的物料数量）'
        },
        {
          name: 'is_critical',
          type: 'boolean',
          description: '是否关键物料（True=缺料会导致停产）'
        },
        {
          name: 'consumption_pattern',
          type: 'string',
          description: '消耗模式（枚举：工序开始时消耗/按比例消耗）'
        },
        {
          name: 'version',
          type: 'string',
          description: '版本号（格式：v1.0/v2.0）'
        },
        {
          name: 'effective_date',
          type: 'date',
          description: '生效日期'
        },
        {
          name: 'expiry_date',
          type: 'date',
          description: '失效日期（过期后不可使用）'
        }
      ],
      position: {
        x: 1400,
        y: 380
      }
    },
    {
      id: 'ot-sc-014',
      name: 'Customer',
      displayName: '客户',
      description: '客户主数据',
      primary_key_id: 'customer_id',
      fields: [
        {
          field_id: 'customer_id',
          name: '客户ID',
          data_type: 'string',
          description: '客户唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'customer_name',
          name: '客户名称',
          data_type: 'string',
          description: '客户名称',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'customer_level',
          name: '客户等级',
          data_type: 'string',
          description: '客户等级（枚举：VIP/重要/普通）',
          required: false,
          is_enum: true,
          enum_values: [
            'VIP',
            '重要',
            '普通'
          ]
        },
        {
          field_id: 'industry',
          name: '行业类别',
          data_type: 'string',
          description: '所属行业（如：汽车电子/消费电子/工业控制/通信）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'credit_limit',
          name: '信用额度(万元)',
          data_type: 'float',
          description: '信用额度（单位：万元）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'payment_terms',
          name: '付款条件',
          data_type: 'string',
          description: '付款条件（如：月结30天/货到付款/预付50%）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'contact_person',
          name: '联系人',
          data_type: 'string',
          description: '联系人姓名',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'contact_phone',
          name: '联系电话',
          data_type: 'string',
          description: '联系电话',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'contact_email',
          name: '联系邮箱',
          data_type: 'string',
          description: '联系邮箱',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'address',
          name: '地址',
          data_type: 'text',
          description: '地址',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'country',
          name: '国家',
          data_type: 'string',
          description: '国家/地区（如：中国/美国/日本/台湾）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'region',
          name: '地区',
          data_type: 'string',
          description: '地区（枚举：大陆/台湾/欧美/亚太）',
          required: false,
          is_enum: true,
          enum_values: [
            '大陆',
            '台湾',
            '欧美',
            '亚太'
          ]
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '客户状态（枚举：活跃/暂停/关闭）',
          required: false,
          is_enum: true,
          enum_values: [
            '活跃',
            '暂停',
            '关闭'
          ]
        },
        {
          field_id: 'note',
          name: '备注',
          data_type: 'text',
          description: '备注说明',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'customer_id',
          type: 'string',
          description: '客户唯一标识符'
        },
        {
          name: 'customer_name',
          type: 'string',
          description: '客户名称'
        },
        {
          name: 'customer_level',
          type: 'string',
          description: '客户等级（枚举：VIP/重要/普通）'
        },
        {
          name: 'industry',
          type: 'string',
          description: '所属行业（如：汽车电子/消费电子/工业控制/通信）'
        },
        {
          name: 'credit_limit',
          type: 'float',
          description: '信用额度（单位：万元）'
        },
        {
          name: 'payment_terms',
          type: 'string',
          description: '付款条件（如：月结30天/货到付款/预付50%）'
        },
        {
          name: 'contact_person',
          type: 'string',
          description: '联系人姓名'
        },
        {
          name: 'contact_phone',
          type: 'string',
          description: '联系电话'
        },
        {
          name: 'contact_email',
          type: 'string',
          description: '联系邮箱'
        },
        {
          name: 'address',
          type: 'text',
          description: '地址'
        },
        {
          name: 'country',
          type: 'string',
          description: '国家/地区（如：中国/美国/日本/台湾）'
        },
        {
          name: 'region',
          type: 'string',
          description: '地区（枚举：大陆/台湾/欧美/亚太）'
        },
        {
          name: 'status',
          type: 'string',
          description: '客户状态（枚举：活跃/暂停/关闭）'
        },
        {
          name: 'note',
          type: 'text',
          description: '备注说明'
        }
      ],
      position: {
        x: 1660,
        y: 380
      }
    },
    {
      id: 'ot-sc-015',
      name: 'CustomerProduct',
      displayName: '客户可购产品清单',
      description: '客户可购买的产品清单及特定价格、交期、质量等级',
      primary_key_id: 'id',
      fields: [
        {
          field_id: 'id',
          name: 'ID',
          data_type: 'integer',
          description: '唯一标识符（主键）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'customer_id',
          name: '客户ID',
          data_type: 'string',
          description: '客户唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'product_id',
          name: '产品ID',
          data_type: 'string',
          description: '产品唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'special_price',
          name: '客户特定价格',
          data_type: 'float',
          description: '客户特定价格（覆盖标准价格）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'min_order_qty',
          name: '最小订单量',
          data_type: 'float',
          description: '最小订单量（客户级别的最小订购数量）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'lead_time_days',
          name: '特定交期(天)',
          data_type: 'integer',
          description: '交期（单位：天）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'quality_level',
          name: '质量等级',
          data_type: 'string',
          description: '质量等级要求（枚举：标准/车规/工规/军规）',
          required: false,
          is_enum: true,
          enum_values: [
            '标准',
            '车规',
            '工规',
            '军规'
          ]
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '客户产品关系状态（枚举：有效/已停用）',
          required: false,
          is_enum: true,
          enum_values: [
            '有效',
            '已停用'
          ]
        }
      ],
      properties: [
        {
          name: 'id',
          type: 'integer',
          description: '唯一标识符（主键）'
        },
        {
          name: 'customer_id',
          type: 'string',
          description: '客户唯一标识符'
        },
        {
          name: 'product_id',
          type: 'string',
          description: '产品唯一标识符'
        },
        {
          name: 'special_price',
          type: 'float',
          description: '客户特定价格（覆盖标准价格）'
        },
        {
          name: 'min_order_qty',
          type: 'float',
          description: '最小订单量（客户级别的最小订购数量）'
        },
        {
          name: 'lead_time_days',
          type: 'integer',
          description: '交期（单位：天）'
        },
        {
          name: 'quality_level',
          type: 'string',
          description: '质量等级要求（枚举：标准/车规/工规/军规）'
        },
        {
          name: 'status',
          type: 'string',
          description: '客户产品关系状态（枚举：有效/已停用）'
        }
      ],
      position: {
        x: 100,
        y: 680
      }
    },
    {
      id: 'ot-sc-016',
      name: 'CustomerOrder',
      displayName: '客户订单',
      description: '客户采购订单，包含产品、数量、交期、优先级',
      primary_key_id: 'order_id',
      fields: [
        {
          field_id: 'order_id',
          name: '订单ID',
          data_type: 'string',
          description: '订单唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'customer_id',
          name: '客户ID',
          data_type: 'string',
          description: '客户唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'customer_name',
          name: '客户名称',
          data_type: 'string',
          description: '客户名称',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'customer_po_number',
          name: '客户采购订单号',
          data_type: 'string',
          description: '客户采购订单号（客户方的订单编号）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'product_id',
          name: '产品ID',
          data_type: 'string',
          description: '产品唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'quantity',
          name: '订单数量',
          data_type: 'float',
          description: '数量',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'unit_price',
          name: '订单单价',
          data_type: 'float',
          description: '订单单价（单位：元）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'order_date',
          name: '下单日期',
          data_type: 'datetime',
          description: '下单日期',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'required_date',
          name: '要求交期',
          data_type: 'datetime',
          description: '要求交货日期',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'priority',
          name: '优先级',
          data_type: 'integer',
          description: '订单优先级（数字越小优先级越高，1-5范围：1=紧急/3=普通/5=宽松）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '订单状态（枚举：已确认/部分发货/已发货/已取消/重工中）',
          required: false,
          is_enum: true,
          enum_values: [
            '已确认',
            '部分发货',
            '已发货',
            '已取消',
            '重工中'
          ]
        },
        {
          field_id: 'shipping_address',
          name: '发货地址',
          data_type: 'text',
          description: '收货地址',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'quality_requirement',
          name: '质量要求',
          data_type: 'string',
          description: '质量要求（如：AQL 0.65/零缺陷）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'packaging_requirement',
          name: '包装要求',
          data_type: 'string',
          description: '包装要求（如：防静电包装/真空包装）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'note',
          name: '备注',
          data_type: 'text',
          description: '备注说明',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'order_id',
          type: 'string',
          description: '订单唯一标识符'
        },
        {
          name: 'customer_id',
          type: 'string',
          description: '客户唯一标识符'
        },
        {
          name: 'customer_name',
          type: 'string',
          description: '客户名称'
        },
        {
          name: 'customer_po_number',
          type: 'string',
          description: '客户采购订单号（客户方的订单编号）'
        },
        {
          name: 'product_id',
          type: 'string',
          description: '产品唯一标识符'
        },
        {
          name: 'quantity',
          type: 'float',
          description: '数量'
        },
        {
          name: 'unit_price',
          type: 'float',
          description: '订单单价（单位：元）'
        },
        {
          name: 'order_date',
          type: 'datetime',
          description: '下单日期'
        },
        {
          name: 'required_date',
          type: 'datetime',
          description: '要求交货日期'
        },
        {
          name: 'priority',
          type: 'integer',
          description: '订单优先级（数字越小优先级越高，1-5范围：1=紧急/3=普通/5=宽松）'
        },
        {
          name: 'status',
          type: 'string',
          description: '订单状态（枚举：已确认/部分发货/已发货/已取消/重工中）'
        },
        {
          name: 'shipping_address',
          type: 'text',
          description: '收货地址'
        },
        {
          name: 'quality_requirement',
          type: 'string',
          description: '质量要求（如：AQL 0.65/零缺陷）'
        },
        {
          name: 'packaging_requirement',
          type: 'string',
          description: '包装要求（如：防静电包装/真空包装）'
        },
        {
          name: 'note',
          type: 'text',
          description: '备注说明'
        }
      ],
      position: {
        x: 360,
        y: 680
      }
    },
    {
      id: 'ot-sc-017',
      name: 'WorkOrder',
      displayName: '工单',
      description: '由客户订单生成的生产计划，仿真核心驱动对象',
      primary_key_id: 'work_order_id',
      fields: [
        {
          field_id: 'work_order_id',
          name: '工单ID',
          data_type: 'string',
          description: '工单唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'customer_order_id',
          name: '关联订单ID',
          data_type: 'string',
          description: '关联客户订单ID',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'product_id',
          name: '产品ID',
          data_type: 'string',
          description: '产品唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'work_order_type',
          name: '工单类型',
          data_type: 'string',
          description: '工单类型（枚举：正常/重工）',
          required: false,
          is_enum: true,
          enum_values: [
            '正常',
            '重工'
          ]
        },
        {
          field_id: 'planned_quantity',
          name: '计划投入量',
          data_type: 'float',
          description: '计划投入量（含过量投入，考虑良率损耗）',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'expected_output_qty',
          name: '预期产出量',
          data_type: 'float',
          description: '预期产出量（订单需求数量）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'planned_start_date',
          name: '计划开始日期',
          data_type: 'datetime',
          description: '计划开始日期',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'planned_completion_date',
          name: '计划完成日期',
          data_type: 'datetime',
          description: '计划完成日期',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_start_date',
          name: '实际开始日期',
          data_type: 'datetime',
          description: '实际开始日期',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_completion_date',
          name: '实际完成日期',
          data_type: 'datetime',
          description: '实际完成日期',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '工单状态（枚举：生产中/已完成/已取消）',
          required: false,
          is_enum: true,
          enum_values: [
            '生产中',
            '已完成',
            '已取消'
          ]
        },
        {
          field_id: 'priority',
          name: '优先级',
          data_type: 'integer',
          description: '工单优先级（继承自订单优先级）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'setup_group',
          name: '换线组',
          data_type: 'string',
          description: '换线组（用于排程优化，同组工单可合并）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'current_step_id',
          name: '当前工序ID',
          data_type: 'string',
          description: '当前执行工序ID',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'completed_quantity',
          name: '实际产出量',
          data_type: 'float',
          description: '实际产出量（良品数量）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'scrapped_quantity',
          name: '报废数量',
          data_type: 'float',
          description: '报废数量（不良品且不可返工）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'note',
          name: '备注',
          data_type: 'text',
          description: '备注说明',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'created_at',
          name: '创建时间',
          data_type: 'datetime',
          description: '创建时间（系统自动生成）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'work_order_id',
          type: 'string',
          description: '工单唯一标识符'
        },
        {
          name: 'customer_order_id',
          type: 'string',
          description: '关联客户订单ID'
        },
        {
          name: 'product_id',
          type: 'string',
          description: '产品唯一标识符'
        },
        {
          name: 'work_order_type',
          type: 'string',
          description: '工单类型（枚举：正常/重工）'
        },
        {
          name: 'planned_quantity',
          type: 'float',
          description: '计划投入量（含过量投入，考虑良率损耗）'
        },
        {
          name: 'expected_output_qty',
          type: 'float',
          description: '预期产出量（订单需求数量）'
        },
        {
          name: 'planned_start_date',
          type: 'datetime',
          description: '计划开始日期'
        },
        {
          name: 'planned_completion_date',
          type: 'datetime',
          description: '计划完成日期'
        },
        {
          name: 'actual_start_date',
          type: 'datetime',
          description: '实际开始日期'
        },
        {
          name: 'actual_completion_date',
          type: 'datetime',
          description: '实际完成日期'
        },
        {
          name: 'status',
          type: 'string',
          description: '工单状态（枚举：生产中/已完成/已取消）'
        },
        {
          name: 'priority',
          type: 'integer',
          description: '工单优先级（继承自订单优先级）'
        },
        {
          name: 'setup_group',
          type: 'string',
          description: '换线组（用于排程优化，同组工单可合并）'
        },
        {
          name: 'current_step_id',
          type: 'string',
          description: '当前执行工序ID'
        },
        {
          name: 'completed_quantity',
          type: 'float',
          description: '实际产出量（良品数量）'
        },
        {
          name: 'scrapped_quantity',
          type: 'float',
          description: '报废数量（不良品且不可返工）'
        },
        {
          name: 'note',
          type: 'text',
          description: '备注说明'
        },
        {
          name: 'created_at',
          type: 'datetime',
          description: '创建时间（系统自动生成）'
        }
      ],
      position: {
        x: 620,
        y: 680
      }
    },
    {
      id: 'ot-sc-018',
      name: 'WorkOrderOperation',
      displayName: '工单工序',
      description: '工单的工序级计划，排程算法的直接操作对象',
      primary_key_id: 'wo_op_id',
      fields: [
        {
          field_id: 'wo_op_id',
          name: '工单工序ID',
          data_type: 'string',
          description: '工单工序唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'work_order_id',
          name: '工单ID',
          data_type: 'string',
          description: '工单唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'step_id',
          name: '工序ID',
          data_type: 'string',
          description: '工序唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'sequence_no',
          name: '工序序号',
          data_type: 'integer',
          description: '工序序号（执行顺序，从1开始）',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'planned_start',
          name: '计划开始时间',
          data_type: 'datetime',
          description: '计划开始时间',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'planned_end',
          name: '计划结束时间',
          data_type: 'datetime',
          description: '计划结束时间',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_start',
          name: '实际开始时间',
          data_type: 'datetime',
          description: '实际开始时间',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_end',
          name: '实际结束时间',
          data_type: 'datetime',
          description: '实际结束时间',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'required_input_qty',
          name: '需求投入量',
          data_type: 'float',
          description: '需求投入量（考虑良率后的实际投入数量）',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'completed_output_qty',
          name: '实际产出量',
          data_type: 'float',
          description: '实际产出量（良品数量）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'scrapped_qty',
          name: '报废量',
          data_type: 'float',
          description: '报废数量',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'assigned_machine_id',
          name: '分配机台ID',
          data_type: 'string',
          description: '分配机台ID（外键关联machine表）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '工单工序状态（枚举：已完成/已排程/待开工）',
          required: false,
          is_enum: true,
          enum_values: [
            '已完成',
            '已排程',
            '待开工'
          ]
        },
        {
          field_id: 'is_rework',
          name: '是否重工序',
          data_type: 'boolean',
          description: '是否重工序（True=重工工序，用于追溯和统计）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'setup_completed',
          name: '换线是否完成',
          data_type: 'boolean',
          description: '换线/准备是否完成（True=已完成）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_issued',
          name: '物料是否发放',
          data_type: 'boolean',
          description: '物料是否已发放（True=物料已领用）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'wo_op_id',
          type: 'string',
          description: '工单工序唯一标识符'
        },
        {
          name: 'work_order_id',
          type: 'string',
          description: '工单唯一标识符'
        },
        {
          name: 'step_id',
          type: 'string',
          description: '工序唯一标识符'
        },
        {
          name: 'sequence_no',
          type: 'integer',
          description: '工序序号（执行顺序，从1开始）'
        },
        {
          name: 'planned_start',
          type: 'datetime',
          description: '计划开始时间'
        },
        {
          name: 'planned_end',
          type: 'datetime',
          description: '计划结束时间'
        },
        {
          name: 'actual_start',
          type: 'datetime',
          description: '实际开始时间'
        },
        {
          name: 'actual_end',
          type: 'datetime',
          description: '实际结束时间'
        },
        {
          name: 'required_input_qty',
          type: 'float',
          description: '需求投入量（考虑良率后的实际投入数量）'
        },
        {
          name: 'completed_output_qty',
          type: 'float',
          description: '实际产出量（良品数量）'
        },
        {
          name: 'scrapped_qty',
          type: 'float',
          description: '报废数量'
        },
        {
          name: 'assigned_machine_id',
          type: 'string',
          description: '分配机台ID（外键关联machine表）'
        },
        {
          name: 'status',
          type: 'string',
          description: '工单工序状态（枚举：已完成/已排程/待开工）'
        },
        {
          name: 'is_rework',
          type: 'boolean',
          description: '是否重工序（True=重工工序，用于追溯和统计）'
        },
        {
          name: 'setup_completed',
          type: 'boolean',
          description: '换线/准备是否完成（True=已完成）'
        },
        {
          name: 'material_issued',
          type: 'boolean',
          description: '物料是否已发放（True=物料已领用）'
        }
      ],
      position: {
        x: 880,
        y: 680
      }
    },
    {
      id: 'ot-sc-019',
      name: 'WorkOrderMaterial',
      displayName: '工单物料需求',
      description: '工单工序的物料需求明细，MRP运算的直接对象',
      primary_key_id: 'wom_id',
      fields: [
        {
          field_id: 'wom_id',
          name: '工单物料需求ID',
          data_type: 'string',
          description: '工单物料需求唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'work_order_id',
          name: '工单ID',
          data_type: 'string',
          description: '工单唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'wo_op_id',
          name: '工单工序ID',
          data_type: 'string',
          description: '工单工序唯一标识符',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_id',
          name: '物料ID',
          data_type: 'string',
          description: '物料唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'required_quantity',
          name: '需求数量',
          data_type: 'float',
          description: '需求数量',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'allocated_quantity',
          name: '已分配数量',
          data_type: 'float',
          description: '已分配数量（已从库存预留）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'consumed_quantity',
          name: '已消耗数量',
          data_type: 'float',
          description: '已消耗数量（已实际使用）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'shortage_quantity',
          name: '缺料数量',
          data_type: 'float',
          description: '缺料数量（需求-已分配）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'required_date',
          name: '需求日期',
          data_type: 'datetime',
          description: '物料需求日期（工序计划开始时间）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '工单物料状态（枚举：待分配/已消耗/已齐套/已取消/部分分配/缺料）',
          required: false,
          is_enum: true,
          enum_values: [
            '待分配',
            '已消耗',
            '已齐套',
            '已齐套',
            '部分分配',
            '缺料'
          ]
        },
        {
          field_id: 'note',
          name: '备注',
          data_type: 'text',
          description: '备注说明',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'wom_id',
          type: 'string',
          description: '工单物料需求唯一标识符'
        },
        {
          name: 'work_order_id',
          type: 'string',
          description: '工单唯一标识符'
        },
        {
          name: 'wo_op_id',
          type: 'string',
          description: '工单工序唯一标识符'
        },
        {
          name: 'material_id',
          type: 'string',
          description: '物料唯一标识符'
        },
        {
          name: 'required_quantity',
          type: 'float',
          description: '需求数量'
        },
        {
          name: 'allocated_quantity',
          type: 'float',
          description: '已分配数量（已从库存预留）'
        },
        {
          name: 'consumed_quantity',
          type: 'float',
          description: '已消耗数量（已实际使用）'
        },
        {
          name: 'shortage_quantity',
          type: 'float',
          description: '缺料数量（需求-已分配）'
        },
        {
          name: 'required_date',
          type: 'datetime',
          description: '物料需求日期（工序计划开始时间）'
        },
        {
          name: 'status',
          type: 'string',
          description: '工单物料状态（枚举：待分配/已消耗/已齐套/已取消/部分分配/缺料）'
        },
        {
          name: 'note',
          type: 'text',
          description: '备注说明'
        }
      ],
      position: {
        x: 1140,
        y: 680
      }
    },
    {
      id: 'ot-sc-020',
      name: 'PurchaseOrder',
      displayName: '采购订单',
      description: '向供应商下达的采购订单',
      primary_key_id: 'po_id',
      fields: [
        {
          field_id: 'po_id',
          name: '采购订单ID',
          data_type: 'string',
          description: '采购订单唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'supplier_id',
          name: '供应商ID',
          data_type: 'string',
          description: '供应商唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'order_date',
          name: '下单日期',
          data_type: 'datetime',
          description: '下单日期',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'expected_delivery_date',
          name: '预期交货日期',
          data_type: 'datetime',
          description: '期望交货日期',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_delivery_date',
          name: '实际交货日期',
          data_type: 'datetime',
          description: '实际交货日期',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '采购订单状态（枚举：已入库/已创建）',
          required: false,
          is_enum: true,
          enum_values: [
            '已入库',
            '已创建'
          ]
        },
        {
          field_id: 'total_amount',
          name: '总金额',
          data_type: 'float',
          description: '总金额（单位：元）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'created_by',
          name: '创建者',
          data_type: 'string',
          description: '创建人（如：SYSTEM/MRP/用户名）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'note',
          name: '备注',
          data_type: 'text',
          description: '备注说明',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'po_id',
          type: 'string',
          description: '采购订单唯一标识符'
        },
        {
          name: 'supplier_id',
          type: 'string',
          description: '供应商唯一标识符'
        },
        {
          name: 'order_date',
          type: 'datetime',
          description: '下单日期'
        },
        {
          name: 'expected_delivery_date',
          type: 'datetime',
          description: '期望交货日期'
        },
        {
          name: 'actual_delivery_date',
          type: 'datetime',
          description: '实际交货日期'
        },
        {
          name: 'status',
          type: 'string',
          description: '采购订单状态（枚举：已入库/已创建）'
        },
        {
          name: 'total_amount',
          type: 'float',
          description: '总金额（单位：元）'
        },
        {
          name: 'created_by',
          type: 'string',
          description: '创建人（如：SYSTEM/MRP/用户名）'
        },
        {
          name: 'note',
          type: 'text',
          description: '备注说明'
        }
      ],
      position: {
        x: 1400,
        y: 680
      }
    },
    {
      id: 'ot-sc-021',
      name: 'PurchaseOrderLine',
      displayName: '采购订单行',
      description: '采购订单的物料明细行（一个PO可包含多种物料）',
      primary_key_id: 'line_id',
      fields: [
        {
          field_id: 'line_id',
          name: '订单行ID',
          data_type: 'string',
          description: '唯一标识符（主键）',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'po_id',
          name: '采购订单ID',
          data_type: 'string',
          description: '采购订单唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_id',
          name: '物料ID',
          data_type: 'string',
          description: '物料唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'quantity',
          name: '采购数量',
          data_type: 'float',
          description: '数量',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'unit_price',
          name: '单价',
          data_type: 'float',
          description: '订单单价（单位：元）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'received_quantity',
          name: '已收货数量',
          data_type: 'float',
          description: '已收货数量',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '采购订单行状态（枚举：待收货/部分到货/全部到货）',
          required: false,
          is_enum: true,
          enum_values: [
            '待收货',
            '部分到货',
            '全部到货'
          ]
        },
        {
          field_id: 'related_work_order_id',
          name: '关联工单ID',
          data_type: 'string',
          description: '关联工单ID',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'related_wom_id',
          name: '关联工单物料需求ID',
          data_type: 'string',
          description: '关联工单物料需求ID',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'line_id',
          type: 'string',
          description: '唯一标识符（主键）'
        },
        {
          name: 'po_id',
          type: 'string',
          description: '采购订单唯一标识符'
        },
        {
          name: 'material_id',
          type: 'string',
          description: '物料唯一标识符'
        },
        {
          name: 'quantity',
          type: 'float',
          description: '数量'
        },
        {
          name: 'unit_price',
          type: 'float',
          description: '订单单价（单位：元）'
        },
        {
          name: 'received_quantity',
          type: 'float',
          description: '已收货数量'
        },
        {
          name: 'status',
          type: 'string',
          description: '采购订单行状态（枚举：待收货/部分到货/全部到货）'
        },
        {
          name: 'related_work_order_id',
          type: 'string',
          description: '关联工单ID'
        },
        {
          name: 'related_wom_id',
          type: 'string',
          description: '关联工单物料需求ID'
        }
      ],
      position: {
        x: 1660,
        y: 680
      }
    },
    {
      id: 'ot-sc-022',
      name: 'WipLot',
      displayName: '在制品批次',
      description: 'Lot批量生产追踪（25片/批），新能源汽车Tier1行业标准',
      primary_key_id: 'lot_id',
      fields: [
        {
          field_id: 'lot_id',
          name: '批次ID',
          data_type: 'string',
          description: '批次唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'work_order_id',
          name: '工单ID',
          data_type: 'string',
          description: '工单唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'product_id',
          name: '产品ID',
          data_type: 'string',
          description: '产品唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'lot_size',
          name: '批次大小',
          data_type: 'float',
          description: '批次大小（标准25片/批）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'current_step_id',
          name: '当前工序ID',
          data_type: 'string',
          description: '当前执行工序ID',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'current_machine_id',
          name: '当前机台ID',
          data_type: 'string',
          description: '当前加工机台ID（外键关联machine表）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'lot_quantity',
          name: '批次数量',
          data_type: 'float',
          description: '批次数量',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_quantity',
          name: '实际数量',
          data_type: 'float',
          description: '实际数量',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'lot_status',
          name: '批次状态',
          data_type: 'string',
          description: '批次状态（枚举：排队中/加工中/已完成）',
          required: false,
          is_enum: true,
          enum_values: [
            '排队中',
            '加工中',
            '已完成'
          ]
        },
        {
          field_id: 'queue_start_time',
          name: '排队开始时间',
          data_type: 'datetime',
          description: '排队开始时间',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'processing_start_time',
          name: '加工开始时间',
          data_type: 'datetime',
          description: '加工开始时间',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'completed_time',
          name: '完工时间',
          data_type: 'datetime',
          description: '完工时间',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'hold_reason',
          name: 'Hold原因',
          data_type: 'string',
          description: '冻结原因（如：待检验/质量问题/客户暂停）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'priority',
          name: '优先级',
          data_type: 'integer',
          description: '优先级（数字越小优先级越高，1-10范围）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'created_at',
          name: '创建时间',
          data_type: 'datetime',
          description: '创建时间（系统自动生成）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'lot_id',
          type: 'string',
          description: '批次唯一标识符'
        },
        {
          name: 'work_order_id',
          type: 'string',
          description: '工单唯一标识符'
        },
        {
          name: 'product_id',
          type: 'string',
          description: '产品唯一标识符'
        },
        {
          name: 'lot_size',
          type: 'float',
          description: '批次大小（标准25片/批）'
        },
        {
          name: 'current_step_id',
          type: 'string',
          description: '当前执行工序ID'
        },
        {
          name: 'current_machine_id',
          type: 'string',
          description: '当前加工机台ID（外键关联machine表）'
        },
        {
          name: 'lot_quantity',
          type: 'float',
          description: '批次数量'
        },
        {
          name: 'actual_quantity',
          type: 'float',
          description: '实际数量'
        },
        {
          name: 'lot_status',
          type: 'string',
          description: '批次状态（枚举：排队中/加工中/已完成）'
        },
        {
          name: 'queue_start_time',
          type: 'datetime',
          description: '排队开始时间'
        },
        {
          name: 'processing_start_time',
          type: 'datetime',
          description: '加工开始时间'
        },
        {
          name: 'completed_time',
          type: 'datetime',
          description: '完工时间'
        },
        {
          name: 'hold_reason',
          type: 'string',
          description: '冻结原因（如：待检验/质量问题/客户暂停）'
        },
        {
          name: 'priority',
          type: 'integer',
          description: '优先级（数字越小优先级越高，1-10范围）'
        },
        {
          name: 'created_at',
          type: 'datetime',
          description: '创建时间（系统自动生成）'
        }
      ],
      position: {
        x: 100,
        y: 980
      }
    },
    {
      id: 'ot-sc-023',
      name: 'ProductionTask',
      displayName: '生产任务',
      description: '机台级别的任务执行记录',
      primary_key_id: 'task_id',
      fields: [
        {
          field_id: 'task_id',
          name: '任务ID',
          data_type: 'string',
          description: '生产任务唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'wo_op_id',
          name: '工单工序ID',
          data_type: 'string',
          description: '工单工序唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'work_order_id',
          name: '工单ID',
          data_type: 'string',
          description: '工单唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'machine_id',
          name: '机台ID',
          data_type: 'string',
          description: '机台唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'lot_id',
          name: '批次ID',
          data_type: 'string',
          description: '批次唯一标识符',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'planned_start_time',
          name: '计划开始时间',
          data_type: 'datetime',
          description: '计划开始时间',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'planned_end_time',
          name: '计划结束时间',
          data_type: 'datetime',
          description: '计划结束时间',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_start_time',
          name: '实际开始时间',
          data_type: 'datetime',
          description: '实际开始时间',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_end_time',
          name: '实际结束时间',
          data_type: 'datetime',
          description: '实际结束时间',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'planned_quantity',
          name: '计划数量',
          data_type: 'float',
          description: '计划数量',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_quantity',
          name: '实际数量',
          data_type: 'float',
          description: '实际数量',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'scrap_quantity',
          name: '报废数量',
          data_type: 'float',
          description: '报废数量',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_efficiency',
          name: '实际效率',
          data_type: 'float',
          description: '实际效率（相对于标准效率的比例）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_yield',
          name: '实际良率',
          data_type: 'float',
          description: '实际良率（良品/总投入）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'setup_time_actual',
          name: '实际换线时间',
          data_type: 'float',
          description: '实际换线时间（单位：分钟）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'wait_time_actual',
          name: '实际等待时间',
          data_type: 'float',
          description: '实际等待时间（含排队+转运，单位：小时）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'shift_id',
          name: '班次ID',
          data_type: 'string',
          description: '班次唯一标识符',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_night_shift',
          name: '是否夜班',
          data_type: 'boolean',
          description: '是否夜班（True=夜班）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '生产任务状态（枚举：已排程/待执行/执行中/已完成/已取消/已延期）',
          required: false,
          is_enum: true,
          enum_values: [
            '已排程',
            '待执行',
            '执行中',
            '已完成',
            '已取消',
            '已延期'
          ]
        },
        {
          field_id: 'note',
          name: '备注',
          data_type: 'text',
          description: '备注说明',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'task_id',
          type: 'string',
          description: '生产任务唯一标识符'
        },
        {
          name: 'wo_op_id',
          type: 'string',
          description: '工单工序唯一标识符'
        },
        {
          name: 'work_order_id',
          type: 'string',
          description: '工单唯一标识符'
        },
        {
          name: 'machine_id',
          type: 'string',
          description: '机台唯一标识符'
        },
        {
          name: 'lot_id',
          type: 'string',
          description: '批次唯一标识符'
        },
        {
          name: 'planned_start_time',
          type: 'datetime',
          description: '计划开始时间'
        },
        {
          name: 'planned_end_time',
          type: 'datetime',
          description: '计划结束时间'
        },
        {
          name: 'actual_start_time',
          type: 'datetime',
          description: '实际开始时间'
        },
        {
          name: 'actual_end_time',
          type: 'datetime',
          description: '实际结束时间'
        },
        {
          name: 'planned_quantity',
          type: 'float',
          description: '计划数量'
        },
        {
          name: 'actual_quantity',
          type: 'float',
          description: '实际数量'
        },
        {
          name: 'scrap_quantity',
          type: 'float',
          description: '报废数量'
        },
        {
          name: 'actual_efficiency',
          type: 'float',
          description: '实际效率（相对于标准效率的比例）'
        },
        {
          name: 'actual_yield',
          type: 'float',
          description: '实际良率（良品/总投入）'
        },
        {
          name: 'setup_time_actual',
          type: 'float',
          description: '实际换线时间（单位：分钟）'
        },
        {
          name: 'wait_time_actual',
          type: 'float',
          description: '实际等待时间（含排队+转运，单位：小时）'
        },
        {
          name: 'shift_id',
          type: 'string',
          description: '班次唯一标识符'
        },
        {
          name: 'is_night_shift',
          type: 'boolean',
          description: '是否夜班（True=夜班）'
        },
        {
          name: 'status',
          type: 'string',
          description: '生产任务状态（枚举：已排程/待执行/执行中/已完成/已取消/已延期）'
        },
        {
          name: 'note',
          type: 'text',
          description: '备注说明'
        }
      ],
      position: {
        x: 360,
        y: 980
      }
    },
    {
      id: 'ot-sc-024',
      name: 'MaterialTransfer',
      displayName: '物料调拨',
      description: '工单间的物料挪用记录，缺料时的应急策略',
      primary_key_id: 'transfer_id',
      fields: [
        {
          field_id: 'transfer_id',
          name: '调拨ID',
          data_type: 'string',
          description: '调拨单唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_id',
          name: '物料ID',
          data_type: 'string',
          description: '物料唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'from_work_order_id',
          name: '来源工单ID',
          data_type: 'string',
          description: '调拨来源工单ID（从哪个工单调出）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'to_work_order_id',
          name: '目标工单ID',
          data_type: 'string',
          description: '调拨目标工单ID（调入到哪个工单）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'from_location',
          name: '来源仓库',
          data_type: 'string',
          description: '来源仓库/位置',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'to_location',
          name: '目标仓库',
          data_type: 'string',
          description: '目标仓库/位置',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'from_wom_id',
          name: '来源工单物料需求ID',
          data_type: 'string',
          description: '调出工单物料需求ID（from_work_order的物料需求）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'to_wom_id',
          name: '目标工单物料需求ID',
          data_type: 'string',
          description: '调入工单物料需求ID（to_work_order的物料需求）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'quantity',
          name: '调拨数量',
          data_type: 'float',
          description: '调拨数量（实际转移的物料数量）',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'transfer_reason',
          name: '调拨原因',
          data_type: 'string',
          description: '调拨原因（如：缺料挪用/紧急调拨/仓库调整）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'trigger_source',
          name: '触发来源',
          data_type: 'string',
          description: '触发来源（如：MRP运算/人工创建/系统自动）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'requested_time',
          name: '申请时间',
          data_type: 'datetime',
          description: '申请时间',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'executed_time',
          name: '执行时间',
          data_type: 'datetime',
          description: '执行时间（实际调拨完成时间）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '调拨单状态（枚举：已执行）',
          required: false,
          is_enum: true,
          enum_values: [
            '已执行'
          ]
        },
        {
          field_id: 'approved_by',
          name: '批准人',
          data_type: 'string',
          description: '审批人',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'note',
          name: '备注',
          data_type: 'text',
          description: '备注说明',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'transfer_id',
          type: 'string',
          description: '调拨单唯一标识符'
        },
        {
          name: 'material_id',
          type: 'string',
          description: '物料唯一标识符'
        },
        {
          name: 'from_work_order_id',
          type: 'string',
          description: '调拨来源工单ID（从哪个工单调出）'
        },
        {
          name: 'to_work_order_id',
          type: 'string',
          description: '调拨目标工单ID（调入到哪个工单）'
        },
        {
          name: 'from_location',
          type: 'string',
          description: '来源仓库/位置'
        },
        {
          name: 'to_location',
          type: 'string',
          description: '目标仓库/位置'
        },
        {
          name: 'from_wom_id',
          type: 'string',
          description: '调出工单物料需求ID（from_work_order的物料需求）'
        },
        {
          name: 'to_wom_id',
          type: 'string',
          description: '调入工单物料需求ID（to_work_order的物料需求）'
        },
        {
          name: 'quantity',
          type: 'float',
          description: '调拨数量（实际转移的物料数量）'
        },
        {
          name: 'transfer_reason',
          type: 'string',
          description: '调拨原因（如：缺料挪用/紧急调拨/仓库调整）'
        },
        {
          name: 'trigger_source',
          type: 'string',
          description: '触发来源（如：MRP运算/人工创建/系统自动）'
        },
        {
          name: 'requested_time',
          type: 'datetime',
          description: '申请时间'
        },
        {
          name: 'executed_time',
          type: 'datetime',
          description: '执行时间（实际调拨完成时间）'
        },
        {
          name: 'status',
          type: 'string',
          description: '调拨单状态（枚举：已执行）'
        },
        {
          name: 'approved_by',
          type: 'string',
          description: '审批人'
        },
        {
          name: 'note',
          type: 'text',
          description: '备注说明'
        }
      ],
      position: {
        x: 620,
        y: 980
      }
    },
    {
      id: 'ot-sc-025',
      name: 'WorkCalendar',
      displayName: '工作日历',
      description: '每个工作中心每天的班次安排（日班/夜班/休息）',
      primary_key_id: 'calendar_id',
      fields: [
        {
          field_id: 'calendar_id',
          name: '日历ID',
          data_type: 'string',
          description: '日历记录唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'calendar_date',
          name: '日期',
          data_type: 'date',
          description: '日历日期',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'work_center_id',
          name: '工作中心ID',
          data_type: 'string',
          description: '工作中心ID（外键关联work_center表）',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'shift_id',
          name: '班次ID',
          data_type: 'string',
          description: '班次唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_workday',
          name: '是否工作日',
          data_type: 'boolean',
          description: '是否工作日（True=工作日，False=休息日）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'available_hours',
          name: '可用工时',
          data_type: 'float',
          description: '可用工时（单位：小时）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'planned_capacity',
          name: '计划产能',
          data_type: 'float',
          description: '计划产能（单位：片/班次）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'note',
          name: '备注',
          data_type: 'text',
          description: '备注说明',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'calendar_id',
          type: 'string',
          description: '日历记录唯一标识符'
        },
        {
          name: 'calendar_date',
          type: 'date',
          description: '日历日期'
        },
        {
          name: 'work_center_id',
          type: 'string',
          description: '工作中心ID（外键关联work_center表）'
        },
        {
          name: 'shift_id',
          type: 'string',
          description: '班次唯一标识符'
        },
        {
          name: 'is_workday',
          type: 'boolean',
          description: '是否工作日（True=工作日，False=休息日）'
        },
        {
          name: 'available_hours',
          type: 'float',
          description: '可用工时（单位：小时）'
        },
        {
          name: 'planned_capacity',
          type: 'float',
          description: '计划产能（单位：片/班次）'
        },
        {
          name: 'note',
          type: 'text',
          description: '备注说明'
        }
      ],
      position: {
        x: 880,
        y: 980
      }
    },
    {
      id: 'ot-sc-026',
      name: 'Inventory',
      displayName: '原材料库存',
      description: '物料的实时库存状态',
      primary_key_id: 'inventory_id',
      fields: [
        {
          field_id: 'inventory_id',
          name: '库存ID',
          data_type: 'string',
          description: '库存记录唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_id',
          name: '物料ID',
          data_type: 'string',
          description: '物料唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'location',
          name: '仓库位置',
          data_type: 'string',
          description: '仓库/位置（如：主仓库/线边仓/成品仓）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'total_quantity',
          name: '总数量',
          data_type: 'float',
          description: '总数量（可用+预留）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'available_quantity',
          name: '可用数量',
          data_type: 'float',
          description: '可用数量（可被分配的数量）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'reserved_quantity',
          name: '预留数量',
          data_type: 'float',
          description: '预留数量（已分配但未领用）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'in_transit_quantity',
          name: '在途数量',
          data_type: 'float',
          description: '在途数量（已采购但未到货，不可用）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'last_updated',
          name: '最后更新时间',
          data_type: 'datetime',
          description: '最后更新时间',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'inventory_id',
          type: 'string',
          description: '库存记录唯一标识符'
        },
        {
          name: 'material_id',
          type: 'string',
          description: '物料唯一标识符'
        },
        {
          name: 'location',
          type: 'string',
          description: '仓库/位置（如：主仓库/线边仓/成品仓）'
        },
        {
          name: 'total_quantity',
          type: 'float',
          description: '总数量（可用+预留）'
        },
        {
          name: 'available_quantity',
          type: 'float',
          description: '可用数量（可被分配的数量）'
        },
        {
          name: 'reserved_quantity',
          type: 'float',
          description: '预留数量（已分配但未领用）'
        },
        {
          name: 'in_transit_quantity',
          type: 'float',
          description: '在途数量（已采购但未到货，不可用）'
        },
        {
          name: 'last_updated',
          type: 'datetime',
          description: '最后更新时间'
        }
      ],
      position: {
        x: 1140,
        y: 980
      }
    },
    {
      id: 'ot-sc-027',
      name: 'InventoryTransaction',
      displayName: '库存事务',
      description: '所有库存变动的业务事件记录（消耗、入库、调拨、预留）',
      primary_key_id: 'transaction_id',
      fields: [
        {
          field_id: 'transaction_id',
          name: '事务ID',
          data_type: 'string',
          description: '事务流水唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_id',
          name: '物料ID',
          data_type: 'string',
          description: '物料唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'transaction_type',
          name: '事务类型',
          data_type: 'string',
          description: '事务类型（枚举：出库/IQC入库/取消释放/生产消耗/盘点亏损/盘点盈余/调拨出库/采购入库/预留）',
          required: true,
          is_enum: true,
          enum_values: [
            '出库',
            'IQC入库',
            '取消释放',
            '生产消耗',
            '盘点亏损',
            '盘点盈余',
            '调拨出库',
            '采购入库',
            '预留'
          ]
        },
        {
          field_id: 'quantity',
          name: '变动数量',
          data_type: 'float',
          description: '数量',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'balance_after',
          name: '变动后总库存',
          data_type: 'float',
          description: '事务后总数量',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'available_balance_after',
          name: '变动后可用库存',
          data_type: 'float',
          description: '事务后可用数量',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'reserved_balance_after',
          name: '变动后预留库存',
          data_type: 'float',
          description: '事务后预留数量',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'related_document_type',
          name: '关联单据类型',
          data_type: 'string',
          description: '关联单据类型（如：WorkOrder/PurchaseOrder/Transfer）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'related_document_id',
          name: '关联单据ID',
          data_type: 'string',
          description: '关联单据ID（根据related_document_type关联不同表）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'from_work_order_id',
          name: '来源工单ID',
          data_type: 'string',
          description: '库存事务来源工单ID（出库时）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'to_work_order_id',
          name: '目标工单ID',
          data_type: 'string',
          description: '库存事务目标工单ID（入库时）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'transaction_time',
          name: '事务时间',
          data_type: 'datetime',
          description: '事务发生时间',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'description',
          name: '事务说明',
          data_type: 'text',
          description: '事务说明（详细描述本次库存变动原因）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'created_by',
          name: '创建者',
          data_type: 'string',
          description: '创建人（如：SYSTEM/MRP/用户名）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'transaction_id',
          type: 'string',
          description: '事务流水唯一标识符'
        },
        {
          name: 'material_id',
          type: 'string',
          description: '物料唯一标识符'
        },
        {
          name: 'transaction_type',
          type: 'string',
          description: '事务类型（枚举：出库/IQC入库/取消释放/生产消耗/盘点亏损/盘点盈余/调拨出库/采购入库/预留）'
        },
        {
          name: 'quantity',
          type: 'float',
          description: '数量'
        },
        {
          name: 'balance_after',
          type: 'float',
          description: '事务后总数量'
        },
        {
          name: 'available_balance_after',
          type: 'float',
          description: '事务后可用数量'
        },
        {
          name: 'reserved_balance_after',
          type: 'float',
          description: '事务后预留数量'
        },
        {
          name: 'related_document_type',
          type: 'string',
          description: '关联单据类型（如：WorkOrder/PurchaseOrder/Transfer）'
        },
        {
          name: 'related_document_id',
          type: 'string',
          description: '关联单据ID（根据related_document_type关联不同表）'
        },
        {
          name: 'from_work_order_id',
          type: 'string',
          description: '库存事务来源工单ID（出库时）'
        },
        {
          name: 'to_work_order_id',
          type: 'string',
          description: '库存事务目标工单ID（入库时）'
        },
        {
          name: 'transaction_time',
          type: 'datetime',
          description: '事务发生时间'
        },
        {
          name: 'description',
          type: 'text',
          description: '事务说明（详细描述本次库存变动原因）'
        },
        {
          name: 'created_by',
          type: 'string',
          description: '创建人（如：SYSTEM/MRP/用户名）'
        }
      ],
      position: {
        x: 1400,
        y: 980
      }
    },
    {
      id: 'ot-sc-028',
      name: 'FinishedGoodsInventory',
      displayName: '成品库存',
      description: '完工产品的库存（区别于原材料）',
      primary_key_id: 'fg_inv_id',
      fields: [
        {
          field_id: 'fg_inv_id',
          name: '成品库存ID',
          data_type: 'string',
          description: '成品库存唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'product_id',
          name: '产品ID',
          data_type: 'string',
          description: '产品唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'location',
          name: '仓库位置',
          data_type: 'string',
          description: '仓库/位置（如：主仓库/线边仓/成品仓）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'total_quantity',
          name: '总数量',
          data_type: 'float',
          description: '总数量（可用+预留）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'available_quantity',
          name: '可用数量',
          data_type: 'float',
          description: '可用数量（可被分配的数量）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'reserved_quantity',
          name: '预留数量',
          data_type: 'float',
          description: '预留数量（已分配但未领用）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'shipped_quantity',
          name: '已发货数量',
          data_type: 'float',
          description: '已发货数量（累计出库数量）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'last_updated',
          name: '最后更新时间',
          data_type: 'datetime',
          description: '最后更新时间',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'fg_inv_id',
          type: 'string',
          description: '成品库存唯一标识符'
        },
        {
          name: 'product_id',
          type: 'string',
          description: '产品唯一标识符'
        },
        {
          name: 'location',
          type: 'string',
          description: '仓库/位置（如：主仓库/线边仓/成品仓）'
        },
        {
          name: 'total_quantity',
          type: 'float',
          description: '总数量（可用+预留）'
        },
        {
          name: 'available_quantity',
          type: 'float',
          description: '可用数量（可被分配的数量）'
        },
        {
          name: 'reserved_quantity',
          type: 'float',
          description: '预留数量（已分配但未领用）'
        },
        {
          name: 'shipped_quantity',
          type: 'float',
          description: '已发货数量（累计出库数量）'
        },
        {
          name: 'last_updated',
          type: 'datetime',
          description: '最后更新时间'
        }
      ],
      position: {
        x: 1660,
        y: 980
      }
    },
    {
      id: 'ot-sc-029',
      name: 'QualityInspection',
      displayName: '质量检验记录',
      description: 'IQC/IPQC/FQC等各类检验记录',
      primary_key_id: 'inspection_id',
      fields: [
        {
          field_id: 'inspection_id',
          name: '检验ID',
          data_type: 'string',
          description: '检验记录唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'inspection_type',
          name: '检验类型',
          data_type: 'string',
          description: '检验类型（枚举：FQC出货检验/IQC入料/IQC来料检验/首件检验）',
          required: true,
          is_enum: true,
          enum_values: [
            'FQC出货检验',
            'IQC入料',
            'IQC来料检验',
            '首件检验'
          ]
        },
        {
          field_id: 'wo_op_id',
          name: '工单工序ID',
          data_type: 'string',
          description: '工单工序唯一标识符',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'lot_id',
          name: '批次ID',
          data_type: 'string',
          description: '批次唯一标识符',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'machine_id',
          name: '机台ID',
          data_type: 'string',
          description: '机台唯一标识符',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'po_id',
          name: '采购订单ID',
          data_type: 'string',
          description: '采购订单唯一标识符',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_id',
          name: '物料ID',
          data_type: 'string',
          description: '物料唯一标识符',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'related_doc_type',
          name: '关联单据类型',
          data_type: 'string',
          description: '关联单据类型（枚举：WorkOrderOperation/PurchaseOrder/CustomerOrder）',
          required: false,
          is_enum: true,
          enum_values: [
            'WorkOrderOperation',
            'PurchaseOrder',
            'CustomerOrder'
          ]
        },
        {
          field_id: 'related_doc_id',
          name: '关联单据ID',
          data_type: 'string',
          description: '关联单据ID（根据related_doc_type关联不同表）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'inspection_time',
          name: '检验时间',
          data_type: 'datetime',
          description: '检验时间',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'inspect_qty',
          name: '检验数量',
          data_type: 'float',
          description: '检验数量',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'pass_qty',
          name: '合格数量',
          data_type: 'float',
          description: '合格数量',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'rework_qty',
          name: '返工数量',
          data_type: 'float',
          description: '返工数量（可修复的不良品）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'scrap_qty',
          name: '报废数量',
          data_type: 'float',
          description: '报废数量（不可修复的不良品）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'concession_qty',
          name: '让步接收数量',
          data_type: 'float',
          description: '让步接收数量（不合格但可接受）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'result',
          name: '结果',
          data_type: 'string',
          description: '检验结果（枚举：合格/返工/报废/不合格/让步接收/不合格-部分/拒收部分）',
          required: false,
          is_enum: true,
          enum_values: [
            '合格',
            '返工',
            '报废',
            '不合格',
            '让步接收',
            '不合格-部分',
            '拒收部分'
          ]
        },
        {
          field_id: 'disposition',
          name: '处置说明',
          data_type: 'string',
          description: '处置说明（如何处理不合格品）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'is_hold',
          name: '是否Hold',
          data_type: 'boolean',
          description: '是否冻结（True=批次被冻结，不可流转）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'inspector',
          name: '检验员',
          data_type: 'string',
          description: '检验员（如：QC-AUTO/QC-张三）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'note',
          name: '备注',
          data_type: 'text',
          description: '备注说明',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'inspection_id',
          type: 'string',
          description: '检验记录唯一标识符'
        },
        {
          name: 'inspection_type',
          type: 'string',
          description: '检验类型（枚举：FQC出货检验/IQC入料/IQC来料检验/首件检验）'
        },
        {
          name: 'wo_op_id',
          type: 'string',
          description: '工单工序唯一标识符'
        },
        {
          name: 'lot_id',
          type: 'string',
          description: '批次唯一标识符'
        },
        {
          name: 'machine_id',
          type: 'string',
          description: '机台唯一标识符'
        },
        {
          name: 'po_id',
          type: 'string',
          description: '采购订单唯一标识符'
        },
        {
          name: 'material_id',
          type: 'string',
          description: '物料唯一标识符'
        },
        {
          name: 'related_doc_type',
          type: 'string',
          description: '关联单据类型（枚举：WorkOrderOperation/PurchaseOrder/CustomerOrder）'
        },
        {
          name: 'related_doc_id',
          type: 'string',
          description: '关联单据ID（根据related_doc_type关联不同表）'
        },
        {
          name: 'inspection_time',
          type: 'datetime',
          description: '检验时间'
        },
        {
          name: 'inspect_qty',
          type: 'float',
          description: '检验数量'
        },
        {
          name: 'pass_qty',
          type: 'float',
          description: '合格数量'
        },
        {
          name: 'rework_qty',
          type: 'float',
          description: '返工数量（可修复的不良品）'
        },
        {
          name: 'scrap_qty',
          type: 'float',
          description: '报废数量（不可修复的不良品）'
        },
        {
          name: 'concession_qty',
          type: 'float',
          description: '让步接收数量（不合格但可接受）'
        },
        {
          name: 'result',
          type: 'string',
          description: '检验结果（枚举：合格/返工/报废/不合格/让步接收/不合格-部分/拒收部分）'
        },
        {
          name: 'disposition',
          type: 'string',
          description: '处置说明（如何处理不合格品）'
        },
        {
          name: 'is_hold',
          type: 'boolean',
          description: '是否冻结（True=批次被冻结，不可流转）'
        },
        {
          name: 'inspector',
          type: 'string',
          description: '检验员（如：QC-AUTO/QC-张三）'
        },
        {
          name: 'note',
          type: 'text',
          description: '备注说明'
        }
      ],
      position: {
        x: 100,
        y: 1280
      }
    },
    {
      id: 'ot-sc-030',
      name: 'Schedule',
      displayName: '排程汇总',
      description: '每日产能负荷统计快照，支持产能分析和瓶颈识别',
      primary_key_id: 'schedule_id',
      fields: [
        {
          field_id: 'schedule_id',
          name: '排程ID',
          data_type: 'string',
          description: '排程汇总唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'schedule_date',
          name: '排程日期',
          data_type: 'date',
          description: '排程日期',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'total_load_hours',
          name: '总负荷工时',
          data_type: 'float',
          description: '总负荷工时（单位：小时）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'utilization_rate',
          name: '设备利用率',
          data_type: 'float',
          description: '设备利用率（实际工时/可用工时）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'bottleneck_machine_id',
          name: '瓶颈机台ID',
          data_type: 'string',
          description: '瓶颈机台ID（负荷最高的机台）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'bottleneck_work_center_id',
          name: '瓶颈工作中心ID',
          data_type: 'string',
          description: '瓶颈工作中心ID（负荷最高的工作中心）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'total_orders',
          name: '总订单数',
          data_type: 'integer',
          description: '总订单数',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'completed_orders',
          name: '完成订单数',
          data_type: 'integer',
          description: '已完成订单数',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'created_at',
          name: '创建时间',
          data_type: 'datetime',
          description: '创建时间（系统自动生成）',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'schedule_id',
          type: 'string',
          description: '排程汇总唯一标识符'
        },
        {
          name: 'schedule_date',
          type: 'date',
          description: '排程日期'
        },
        {
          name: 'total_load_hours',
          type: 'float',
          description: '总负荷工时（单位：小时）'
        },
        {
          name: 'utilization_rate',
          type: 'float',
          description: '设备利用率（实际工时/可用工时）'
        },
        {
          name: 'bottleneck_machine_id',
          type: 'string',
          description: '瓶颈机台ID（负荷最高的机台）'
        },
        {
          name: 'bottleneck_work_center_id',
          type: 'string',
          description: '瓶颈工作中心ID（负荷最高的工作中心）'
        },
        {
          name: 'total_orders',
          type: 'integer',
          description: '总订单数'
        },
        {
          name: 'completed_orders',
          type: 'integer',
          description: '已完成订单数'
        },
        {
          name: 'created_at',
          type: 'datetime',
          description: '创建时间（系统自动生成）'
        }
      ],
      position: {
        x: 360,
        y: 1280
      }
    },
    {
      id: 'ot-sc-031',
      name: 'MachineStatusLog',
      displayName: '机台状态日志',
      description: '机台状态变迁记录（运行、停机、维护、故障），用于OEE分析',
      primary_key_id: 'log_id',
      fields: [
        {
          field_id: 'log_id',
          name: '日志ID',
          data_type: 'string',
          description: '日志唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'machine_id',
          name: '机台ID',
          data_type: 'string',
          description: '机台唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status_time',
          name: '状态时间',
          data_type: 'datetime',
          description: '状态记录时间',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '机台状态（枚举：恢复/换线/故障/空闲/维护/运行）',
          required: true,
          is_enum: true,
          enum_values: [
            '恢复',
            '换线',
            '故障',
            '空闲',
            '维护',
            '运行'
          ]
        },
        {
          field_id: 'product_id',
          name: '生产产品ID',
          data_type: 'string',
          description: '当前加工产品ID（status=在线时有效）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'running_wo_id',
          name: '运行工单ID',
          data_type: 'string',
          description: '运行中工单ID',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'running_task_id',
          name: '运行任务ID',
          data_type: 'string',
          description: '运行中任务ID',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'oee',
          name: 'OEE指标',
          data_type: 'float',
          description: '设备综合效率（Overall Equipment Effectiveness）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'note',
          name: '备注',
          data_type: 'text',
          description: '备注说明',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'log_id',
          type: 'string',
          description: '日志唯一标识符'
        },
        {
          name: 'machine_id',
          type: 'string',
          description: '机台唯一标识符'
        },
        {
          name: 'status_time',
          type: 'datetime',
          description: '状态记录时间'
        },
        {
          name: 'status',
          type: 'string',
          description: '机台状态（枚举：恢复/换线/故障/空闲/维护/运行）'
        },
        {
          name: 'product_id',
          type: 'string',
          description: '当前加工产品ID（status=在线时有效）'
        },
        {
          name: 'running_wo_id',
          type: 'string',
          description: '运行中工单ID'
        },
        {
          name: 'running_task_id',
          type: 'string',
          description: '运行中任务ID'
        },
        {
          name: 'oee',
          type: 'float',
          description: '设备综合效率（Overall Equipment Effectiveness）'
        },
        {
          name: 'note',
          type: 'text',
          description: '备注说明'
        }
      ],
      position: {
        x: 620,
        y: 1280
      }
    },
    {
      id: 'ot-sc-032',
      name: 'ExternalSupplyChainRisk',
      displayName: '外部供应链风险',
      description: '通过舆情监控获取的外部风险事件。supplier_id字段记录主要受影响方（1个），如需记录多个关联供应商及其影响程度，使用SupplierRiskAssociation对象',
      primary_key_id: 'risk_id',
      fields: [
        {
          field_id: 'risk_id',
          name: '风险ID',
          data_type: 'string',
          description: '风险事件唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'supplier_id',
          name: '主要受影响供应商ID',
          data_type: 'string',
          description: '风险事件的直接责任方或主要受影响方（1个）。如需记录多个关联供应商，使用SupplierRiskAssociation对象',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'customer_id',
          name: '关联客户ID',
          data_type: 'string',
          description: '客户唯一标识符',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_id',
          name: '关联物料ID',
          data_type: 'string',
          description: '物料唯一标识符',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'risk_category',
          name: '风险类别',
          data_type: 'string',
          description: '风险类别（枚举：自然灾害/政治事件/财务风险/质量风险/法律风险/运营风险）',
          required: true,
          is_enum: true,
          enum_values: [
            '自然灾害',
            '政治事件',
            '财务风险',
            '质量风险',
            '法律风险',
            '运营风险'
          ]
        },
        {
          field_id: 'risk_level',
          name: '风险等级',
          data_type: 'string',
          description: '风险等级（枚举：严重/高/中/低）',
          required: true,
          is_enum: true,
          enum_values: [
            '严重',
            '高',
            '中',
            '低'
          ]
        },
        {
          field_id: 'title',
          name: '风险标题',
          data_type: 'string',
          description: '风险事件标题',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'description',
          name: '风险描述',
          data_type: 'text',
          description: '风险事件描述',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'source_url',
          name: '信息来源URL',
          data_type: 'text',
          description: '信息来源URL（舆情原文链接）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'source_name',
          name: '信息来源名称',
          data_type: 'string',
          description: '信息来源名称（如：Reuters/Bloomberg/新华社）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'impact_scope',
          name: '影响范围',
          data_type: 'string',
          description: '影响范围（枚举：全球/区域/局部）',
          required: false,
          is_enum: true,
          enum_values: [
            '全球',
            '区域',
            '局部'
          ]
        },
        {
          field_id: 'estimated_impact_days',
          name: '预估影响天数',
          data_type: 'integer',
          description: '预估影响天数',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'affected_materials',
          name: '受影响物料',
          data_type: 'array',
          description: '受影响物料的ID列表',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'affected_products',
          name: '受影响产品',
          data_type: 'array',
          description: '受影响产品ID列表',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'event_date',
          name: '事件发生日期',
          data_type: 'date',
          description: '事件发生日期',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'detected_at',
          name: '检测时间',
          data_type: 'datetime',
          description: '检测时间（系统捕获舆情时间）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status',
          name: '处理状态',
          data_type: 'string',
          description: '风险处理状态（枚举：新发现/分析中/缓解中/已解决/已忽略）',
          required: false,
          is_enum: true,
          enum_values: [
            '新发现',
            '分析中',
            '缓解中',
            '已解决',
            '已忽略'
          ]
        },
        {
          field_id: 'assigned_to',
          name: '负责人',
          data_type: 'string',
          description: '负责人（处理该风险的责任人）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'mitigation_plan',
          name: '缓解计划',
          data_type: 'text',
          description: '缓解计划（应对措施说明）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'resolved_at',
          name: '解决时间',
          data_type: 'datetime',
          description: '解决时间',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'confidence_score',
          name: 'AI置信度',
          data_type: 'float',
          description: 'AI分析置信度（0.0-1.0，越高越可信）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'keywords',
          name: '关键词',
          data_type: 'array',
          description: '关键词列表',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'raw_content',
          name: '原始舆情内容',
          data_type: 'text',
          description: '原始舆情内容（完整新闻/报告文本）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'created_at',
          name: '创建时间',
          data_type: 'datetime',
          description: '记录创建时间',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'updated_at',
          name: '更新时间',
          data_type: 'datetime',
          description: '记录更新时间',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'risk_id',
          type: 'string',
          description: '风险事件唯一标识符'
        },
        {
          name: 'supplier_id',
          type: 'string',
          description: '风险事件的直接责任方或主要受影响方（1个）。如需记录多个关联供应商，使用SupplierRiskAssociation对象'
        },
        {
          name: 'customer_id',
          type: 'string',
          description: '客户唯一标识符'
        },
        {
          name: 'material_id',
          type: 'string',
          description: '物料唯一标识符'
        },
        {
          name: 'risk_category',
          type: 'string',
          description: '风险类别（枚举：自然灾害/政治事件/财务风险/质量风险/法律风险/运营风险）'
        },
        {
          name: 'risk_level',
          type: 'string',
          description: '风险等级（枚举：严重/高/中/低）'
        },
        {
          name: 'title',
          type: 'string',
          description: '风险事件标题'
        },
        {
          name: 'description',
          type: 'text',
          description: '风险事件描述'
        },
        {
          name: 'source_url',
          type: 'text',
          description: '信息来源URL（舆情原文链接）'
        },
        {
          name: 'source_name',
          type: 'string',
          description: '信息来源名称（如：Reuters/Bloomberg/新华社）'
        },
        {
          name: 'impact_scope',
          type: 'string',
          description: '影响范围（枚举：全球/区域/局部）'
        },
        {
          name: 'estimated_impact_days',
          type: 'integer',
          description: '预估影响天数'
        },
        {
          name: 'affected_materials',
          type: 'array',
          description: '受影响物料的ID列表'
        },
        {
          name: 'affected_products',
          type: 'array',
          description: '受影响产品ID列表'
        },
        {
          name: 'event_date',
          type: 'date',
          description: '事件发生日期'
        },
        {
          name: 'detected_at',
          type: 'datetime',
          description: '检测时间（系统捕获舆情时间）'
        },
        {
          name: 'status',
          type: 'string',
          description: '风险处理状态（枚举：新发现/分析中/缓解中/已解决/已忽略）'
        },
        {
          name: 'assigned_to',
          type: 'string',
          description: '负责人（处理该风险的责任人）'
        },
        {
          name: 'mitigation_plan',
          type: 'text',
          description: '缓解计划（应对措施说明）'
        },
        {
          name: 'resolved_at',
          type: 'datetime',
          description: '解决时间'
        },
        {
          name: 'confidence_score',
          type: 'float',
          description: 'AI分析置信度（0.0-1.0，越高越可信）'
        },
        {
          name: 'keywords',
          type: 'array',
          description: '关键词列表'
        },
        {
          name: 'raw_content',
          type: 'text',
          description: '原始舆情内容（完整新闻/报告文本）'
        },
        {
          name: 'created_at',
          type: 'datetime',
          description: '记录创建时间'
        },
        {
          name: 'updated_at',
          type: 'datetime',
          description: '记录更新时间'
        }
      ],
      position: {
        x: 880,
        y: 1280
      }
    },
    {
      id: 'ot-sc-033',
      name: 'SupplierRiskAssociation',
      displayName: '供应商风险关联',
      description: '供应商与风险事件的多对多关联表，记录风险波及影响链。支持direct/indirect/potential三种关联类型，独立记录每个供应商的影响程度',
      primary_key_id: 'id',
      fields: [
        {
          field_id: 'id',
          name: '自增ID',
          data_type: 'integer',
          description: '唯一标识符（主键）',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'supplier_id',
          name: '供应商ID',
          data_type: 'string',
          description: '供应商唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'risk_id',
          name: '风险ID',
          data_type: 'string',
          description: '风险事件唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'association_type',
          name: '关联类型',
          data_type: 'string',
          description: '关联类型（枚举：直接/间接/潜在）',
          required: false,
          is_enum: true,
          enum_values: [
            '直接',
            '间接',
            '潜在'
          ]
        },
        {
          field_id: 'impact_level',
          name: '影响程度',
          data_type: 'string',
          description: '影响程度（枚举：严重/高/中/低）',
          required: false,
          is_enum: true,
          enum_values: [
            '严重',
            '高',
            '中',
            '低'
          ]
        },
        {
          field_id: 'note',
          name: '备注',
          data_type: 'text',
          description: '备注说明',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'created_at',
          name: '创建时间',
          data_type: 'datetime',
          description: '记录创建时间',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'id',
          type: 'integer',
          description: '唯一标识符（主键）'
        },
        {
          name: 'supplier_id',
          type: 'string',
          description: '供应商唯一标识符'
        },
        {
          name: 'risk_id',
          type: 'string',
          description: '风险事件唯一标识符'
        },
        {
          name: 'association_type',
          type: 'string',
          description: '关联类型（枚举：直接/间接/潜在）'
        },
        {
          name: 'impact_level',
          type: 'string',
          description: '影响程度（枚举：严重/高/中/低）'
        },
        {
          name: 'note',
          type: 'text',
          description: '备注说明'
        },
        {
          name: 'created_at',
          type: 'datetime',
          description: '记录创建时间'
        }
      ],
      position: {
        x: 1140,
        y: 1280
      }
    },
    {
      id: 'ot-sc-034',
      name: 'Logistics',
      displayName: '物流单',
      description: '物料运输物流追踪记录，关联采购订单与供应商，记录运输状态及异常',
      primary_key_id: 'logistics_id',
      fields: [
        {
          field_id: 'logistics_id',
          name: '物流单ID',
          data_type: 'string',
          description: '物流单唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'po_id',
          name: '采购订单ID',
          data_type: 'string',
          description: '关联的采购订单编号',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'supplier_id',
          name: '供应商ID',
          data_type: 'string',
          description: '发货供应商唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'carrier_name',
          name: '承运商名称',
          data_type: 'string',
          description: '负责运输的物流公司名称',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'tracking_number',
          name: '物流单号',
          data_type: 'string',
          description: '承运商提供的运单追踪编号',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'material_id',
          name: '物料ID',
          data_type: 'string',
          description: '运输物料的唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'quantity',
          name: '数量',
          data_type: 'float',
          description: '本次运输的物料数量',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'ship_date',
          name: '发货日期',
          data_type: 'date',
          description: '货物实际发出的日期',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'expected_arrival_date',
          name: '预计到达日期',
          data_type: 'date',
          description: '承运商承诺的到货日期',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'actual_arrival_date',
          name: '实际到达日期',
          data_type: 'date',
          description: '货物实际送达的日期',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '物流单当前状态',
          required: true,
          is_enum: true,
          enum_values: [
            '待发货',
            '已发货',
            '运输中',
            '已到达',
            '已签收',
            '已取消',
            '异常'
          ]
        },
        {
          field_id: 'delay_days',
          name: '延期天数',
          data_type: 'integer',
          description: '实际到达日期与预计到达日期的差值（正数为延期）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'delay_reason',
          name: '延期原因',
          data_type: 'string',
          description: '物流延期的具体原因说明',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'note',
          name: '备注',
          data_type: 'string',
          description: '其他需要说明的信息',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'logistics_id',
          type: 'string',
          description: '物流单唯一标识符'
        },
        {
          name: 'po_id',
          type: 'string',
          description: '关联的采购订单编号'
        },
        {
          name: 'supplier_id',
          type: 'string',
          description: '发货供应商唯一标识符'
        },
        {
          name: 'carrier_name',
          type: 'string',
          description: '负责运输的物流公司名称'
        },
        {
          name: 'tracking_number',
          type: 'string',
          description: '承运商提供的运单追踪编号'
        },
        {
          name: 'material_id',
          type: 'string',
          description: '运输物料的唯一标识符'
        },
        {
          name: 'quantity',
          type: 'float',
          description: '本次运输的物料数量'
        },
        {
          name: 'ship_date',
          type: 'date',
          description: '货物实际发出的日期'
        },
        {
          name: 'expected_arrival_date',
          type: 'date',
          description: '承运商承诺的到货日期'
        },
        {
          name: 'actual_arrival_date',
          type: 'date',
          description: '货物实际送达的日期'
        },
        {
          name: 'status',
          type: 'string',
          description: '物流单当前状态'
        },
        {
          name: 'delay_days',
          type: 'integer',
          description: '实际到达日期与预计到达日期的差值（正数为延期）'
        },
        {
          name: 'delay_reason',
          type: 'string',
          description: '物流延期的具体原因说明'
        },
        {
          name: 'note',
          type: 'string',
          description: '其他需要说明的信息'
        }
      ],
      position: {
        x: 1400,
        y: 1280
      }
    },
    {
      id: 'ot-sc-035',
      name: 'ScheduleDetail',
      displayName: '排程明细',
      description: '工单级别的排程计划明细，记录每个工单在具体机台上的排程安排',
      primary_key_id: 'detail_id',
      fields: [
        {
          field_id: 'detail_id',
          name: '排程明细ID',
          data_type: 'string',
          description: '排程明细唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'schedule_id',
          name: '排程ID',
          data_type: 'string',
          description: '关联的主排程单唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'work_order_id',
          name: '工单ID',
          data_type: 'string',
          description: '关联的生产工单唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'customer_order_id',
          name: '客户订单ID',
          data_type: 'string',
          description: '关联的客户销售订单编号',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'product_id',
          name: '产品ID',
          data_type: 'string',
          description: '待生产产品的唯一标识符',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'work_center_id',
          name: '工作中心ID',
          data_type: 'string',
          description: '生产任务所属的工作中心ID',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'machine_id',
          name: '机台ID',
          data_type: 'string',
          description: '分配的具体生产设备ID',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'planned_start',
          name: '计划开始时间',
          data_type: 'datetime',
          description: '生产任务计划开始的时间',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'planned_end',
          name: '计划结束时间',
          data_type: 'datetime',
          description: '生产任务计划完成的时间',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'load_hours',
          name: '负荷工时',
          data_type: 'float',
          description: '该任务占用设备的有效工时',
          required: true,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'priority',
          name: '优先级',
          data_type: 'integer',
          description: '生产任务优先级（数值越小优先级越高）',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'status',
          name: '状态',
          data_type: 'string',
          description: '排程明细当前执行状态',
          required: true,
          is_enum: true,
          enum_values: [
            '待排程',
            '已排程',
            '执行中',
            '已暂停',
            '已完成',
            '已取消',
            '异常'
          ]
        },
        {
          field_id: 'customer_id',
          name: '客户ID',
          data_type: 'string',
          description: '关联的客户唯一标识符',
          required: false,
          is_enum: false,
          enum_values: []
        },
        {
          field_id: 'note',
          name: '备注',
          data_type: 'string',
          description: '其他需要说明的排程信息',
          required: false,
          is_enum: false,
          enum_values: []
        }
      ],
      properties: [
        {
          name: 'detail_id',
          type: 'string',
          description: '排程明细唯一标识符'
        },
        {
          name: 'schedule_id',
          type: 'string',
          description: '关联的主排程单唯一标识符'
        },
        {
          name: 'work_order_id',
          type: 'string',
          description: '关联的生产工单唯一标识符'
        },
        {
          name: 'customer_order_id',
          type: 'string',
          description: '关联的客户销售订单编号'
        },
        {
          name: 'product_id',
          type: 'string',
          description: '待生产产品的唯一标识符'
        },
        {
          name: 'work_center_id',
          type: 'string',
          description: '生产任务所属的工作中心ID'
        },
        {
          name: 'machine_id',
          type: 'string',
          description: '分配的具体生产设备ID'
        },
        {
          name: 'planned_start',
          type: 'datetime',
          description: '生产任务计划开始的时间'
        },
        {
          name: 'planned_end',
          type: 'datetime',
          description: '生产任务计划完成的时间'
        },
        {
          name: 'load_hours',
          type: 'float',
          description: '该任务占用设备的有效工时'
        },
        {
          name: 'priority',
          type: 'integer',
          description: '生产任务优先级（数值越小优先级越高）'
        },
        {
          name: 'status',
          type: 'string',
          description: '排程明细当前执行状态'
        },
        {
          name: 'customer_id',
          type: 'string',
          description: '关联的客户唯一标识符'
        },
        {
          name: 'note',
          type: 'string',
          description: '其他需要说明的排程信息'
        }
      ],
      position: {
        x: 1660,
        y: 1280
      }
    }
  ],
  linkTypes: [
    {
      id: 'R1_has_route',
      name: 'r1_has_route',
      displayName: '产品定义工艺路线',
      description: '产品对应的工艺路线定义（支持多版本）',
      source: 'ot-sc-001',
      target: 'ot-sc-005',
      cardinality: 'one-to-many',
      source_key: 'product_id',
      target_key: 'product_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R2_has_steps',
      name: 'r2_has_steps',
      displayName: '工艺路线包含工序',
      description: '一条工艺路线包含80-120道工序',
      source: 'ot-sc-005',
      target: 'ot-sc-006',
      cardinality: 'one-to-many',
      source_key: 'route_id',
      target_key: 'route_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R3_has_bom',
      name: 'r3_has_bom',
      displayName: '产品物料组成',
      description: '产品由哪些物料组成及用量',
      source: 'ot-sc-001',
      target: 'ot-sc-002',
      cardinality: 'many-to-many',
      source_key: 'product_id',
      target_key: 'material_id',
      intermediate_model: 'ot-sc-013',
      intermediate_source_key: 'product_id',
      intermediate_target_key: 'material_id'
    },
    {
      id: 'R3_1_product_has_bom',
      name: 'r3_1_product_has_bom',
      displayName: '产品BOM组成明细',
      description: '产品的BOM组成明细',
      source: 'ot-sc-001',
      target: 'ot-sc-013',
      cardinality: 'one-to-many',
      source_key: 'product_id',
      target_key: 'product_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R3_2_bom_has_material',
      name: 'r3_2_bom_has_material',
      displayName: 'BOM对应物料',
      description: 'BOM明细对应的物料',
      source: 'ot-sc-013',
      target: 'ot-sc-002',
      cardinality: 'many-to-one',
      source_key: 'material_id',
      target_key: 'material_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R3_3_step_has_bom',
      name: 'r3_3_step_has_bom',
      displayName: '工序消耗物料',
      description: '工序消耗的物料BOM',
      source: 'ot-sc-006',
      target: 'ot-sc-013',
      cardinality: 'one-to-many',
      source_key: 'step_id',
      target_key: 'step_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R4_belongs_to',
      name: 'r4_belongs_to',
      displayName: '机台所属工作中心',
      description: '每台机台属于一个工作中心',
      source: 'ot-sc-004',
      target: 'ot-sc-003',
      cardinality: 'many-to-one',
      source_key: 'work_center_id',
      target_key: 'work_center_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R5_capable_of',
      name: 'r5_capable_of',
      displayName: '机台可加工产品',
      description: '机台能生产哪些产品及效率',
      source: 'ot-sc-004',
      target: 'ot-sc-001',
      cardinality: 'many-to-many',
      source_key: 'machine_id',
      target_key: 'product_id',
      intermediate_model: 'ot-sc-007',
      intermediate_source_key: 'machine_id',
      intermediate_target_key: 'product_id'
    },
    {
      id: 'R5_1_machine_has_capability',
      name: 'r5_1_machine_has_capability',
      displayName: '机台产品能力配置',
      description: '机台的产品能力配置',
      source: 'ot-sc-004',
      target: 'ot-sc-007',
      cardinality: 'one-to-many',
      source_key: 'machine_id',
      target_key: 'machine_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R5_2_product_has_capability',
      name: 'r5_2_product_has_capability',
      displayName: '产品可被机台加工',
      description: '产品可在哪些机台生产',
      source: 'ot-sc-001',
      target: 'ot-sc-007',
      cardinality: 'one-to-many',
      source_key: 'product_id',
      target_key: 'product_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R6_setup_between',
      name: 'r6_setup_between',
      displayName: '产品切换需换线',
      description: '产品A切换到产品B需要的换线时间',
      source: 'ot-sc-001',
      target: 'ot-sc-001',
      cardinality: 'many-to-many',
      source_key: 'product_id',
      target_key: 'product_id',
      intermediate_model: 'ot-sc-008',
      intermediate_source_key: 'from_product_id',
      intermediate_target_key: 'to_product_id'
    },
    {
      id: 'R6_1_machine_has_setup',
      name: 'r6_1_machine_has_setup',
      displayName: '机台换线配置',
      description: '机台的产品换线时间配置',
      source: 'ot-sc-004',
      target: 'ot-sc-008',
      cardinality: 'one-to-many',
      source_key: 'machine_id',
      target_key: 'machine_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R6_2_product_from_setup',
      name: 'r6_2_product_from_setup',
      displayName: '产品切换前需换线',
      description: '产品作为切换前对象的换线时间',
      source: 'ot-sc-001',
      target: 'ot-sc-008',
      cardinality: 'one-to-many',
      source_key: 'product_id',
      target_key: 'from_product_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R6_3_product_to_setup',
      name: 'r6_3_product_to_setup',
      displayName: '产品切换后需换线',
      description: '产品作为切换后对象的换线时间',
      source: 'ot-sc-001',
      target: 'ot-sc-008',
      cardinality: 'one-to-many',
      source_key: 'product_id',
      target_key: 'to_product_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R7_supplies',
      name: 'r7_supplies',
      displayName: '供应商可供应物料',
      description: '供应商能供应哪些物料及价格、交期',
      source: 'ot-sc-010',
      target: 'ot-sc-002',
      cardinality: 'many-to-many',
      source_key: 'supplier_id',
      target_key: 'material_id',
      intermediate_model: 'ot-sc-011',
      intermediate_source_key: 'supplier_id',
      intermediate_target_key: 'material_id'
    },
    {
      id: 'R7_1_supplier_has_material',
      name: 'r7_1_supplier_has_material',
      displayName: '供应商物料清单',
      description: '供应商能供应的物料清单',
      source: 'ot-sc-010',
      target: 'ot-sc-011',
      cardinality: 'one-to-many',
      source_key: 'supplier_id',
      target_key: 'supplier_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R7_2_material_has_supplier',
      name: 'r7_2_material_has_supplier',
      displayName: '物料可选供应商',
      description: '物料可由哪些供应商供应',
      source: 'ot-sc-002',
      target: 'ot-sc-011',
      cardinality: 'one-to-many',
      source_key: 'material_id',
      target_key: 'material_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R8_substitutes',
      name: 'r8_substitutes',
      displayName: '物料可用替代料',
      description: '物料缺料时可用哪些替代料',
      source: 'ot-sc-002',
      target: 'ot-sc-002',
      cardinality: 'many-to-many',
      source_key: 'material_id',
      target_key: 'material_id',
      intermediate_model: 'ot-sc-012',
      intermediate_source_key: 'material_id',
      intermediate_target_key: 'substitute_material_id'
    },
    {
      id: 'R8_1_material_has_substitute',
      name: 'r8_1_material_has_substitute',
      displayName: '物料替代清单',
      description: '物料的可用替代料',
      source: 'ot-sc-002',
      target: 'ot-sc-012',
      cardinality: 'one-to-many',
      source_key: 'material_id',
      target_key: 'material_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R8_2_material_is_substitute',
      name: 'r8_2_material_is_substitute',
      displayName: '物料可作为替代料',
      description: '物料可作为哪些物料的替代料',
      source: 'ot-sc-002',
      target: 'ot-sc-012',
      cardinality: 'one-to-many',
      source_key: 'material_id',
      target_key: 'substitute_material_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R8_5_customer_has_products',
      name: 'r8_5_customer_has_products',
      displayName: '客户可购产品清单',
      description: '客户可购买的产品清单及特定价格、交期',
      source: 'ot-sc-014',
      target: 'ot-sc-015',
      cardinality: 'one-to-many',
      source_key: 'customer_id',
      target_key: 'customer_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R8_6_cp_to_product',
      name: 'r8_6_cp_to_product',
      displayName: '客户产品关联产品',
      description: '客户产品关系关联的产品',
      source: 'ot-sc-015',
      target: 'ot-sc-001',
      cardinality: 'many-to-one',
      source_key: 'product_id',
      target_key: 'product_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R8_7_customer_has_orders',
      name: 'r8_7_customer_has_orders',
      displayName: '客户采购订单',
      description: '客户的所有采购订单',
      source: 'ot-sc-014',
      target: 'ot-sc-016',
      cardinality: 'one-to-many',
      source_key: 'customer_id',
      target_key: 'customer_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R8_8_order_to_product',
      name: 'r8_8_order_to_product',
      displayName: '订单订购产品',
      description: '订单订购的产品',
      source: 'ot-sc-016',
      target: 'ot-sc-001',
      cardinality: 'many-to-one',
      source_key: 'product_id',
      target_key: 'product_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R8_9_cp_validates_order',
      name: 'r8_9_cp_validates_order',
      displayName: '客户产品验证订单',
      description: '客户只能订购其产品信息表中定义的产品',
      source: 'ot-sc-015',
      target: 'ot-sc-016',
      cardinality: 'one-to-many',
      source_key: 'id',
      target_key: 'customer_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R9_generates_wo',
      name: 'r9_generates_wo',
      displayName: '订单生成工单',
      description: '每个客户订单生成一个工单',
      source: 'ot-sc-016',
      target: 'ot-sc-017',
      cardinality: 'one-to-one',
      source_key: 'order_id',
      target_key: 'customer_order_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R9_1_product_has_orders',
      name: 'r9_1_product_has_orders',
      displayName: '产品被客户订购',
      description: '产品被哪些客户订单订购',
      source: 'ot-sc-001',
      target: 'ot-sc-016',
      cardinality: 'one-to-many',
      source_key: 'product_id',
      target_key: 'product_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R10_has_operations',
      name: 'r10_has_operations',
      displayName: '工单包含工序',
      description: '工单包含多个工序（从工艺路线展开）',
      source: 'ot-sc-017',
      target: 'ot-sc-018',
      cardinality: 'one-to-many',
      source_key: 'work_order_id',
      target_key: 'work_order_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R10_1_product_has_work_orders',
      name: 'r10_1_product_has_work_orders',
      displayName: '产品生成工单',
      description: '产品对应的生产工单',
      source: 'ot-sc-001',
      target: 'ot-sc-017',
      cardinality: 'one-to-many',
      source_key: 'product_id',
      target_key: 'product_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R10_2_step_has_work_orders',
      name: 'r10_2_step_has_work_orders',
      displayName: '工序执行工单',
      description: '工序当前正在执行的工单',
      source: 'ot-sc-006',
      target: 'ot-sc-017',
      cardinality: 'one-to-many',
      source_key: 'step_id',
      target_key: 'current_step_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R10_3_wo_has_materials',
      name: 'r10_3_wo_has_materials',
      displayName: '工单物料需求',
      description: '工单需要的物料清单',
      source: 'ot-sc-017',
      target: 'ot-sc-019',
      cardinality: 'one-to-many',
      source_key: 'work_order_id',
      target_key: 'work_order_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R10_4_step_has_wo_operations',
      name: 'r10_4_step_has_wo_operations',
      displayName: '工序实例化工单工序',
      description: '工序定义对应的工单工序实例',
      source: 'ot-sc-006',
      target: 'ot-sc-018',
      cardinality: 'one-to-many',
      source_key: 'step_id',
      target_key: 'step_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R11_requires_material',
      name: 'r11_requires_material',
      displayName: '工序物料需求',
      description: '工序需要哪些物料及需求量',
      source: 'ot-sc-018',
      target: 'ot-sc-002',
      cardinality: 'many-to-many',
      source_key: 'wo_op_id',
      target_key: 'material_id',
      intermediate_model: 'ot-sc-019',
      intermediate_source_key: 'wo_op_id',
      intermediate_target_key: 'material_id'
    },
    {
      id: 'R11_1_wo_op_has_materials',
      name: 'r11_1_wo_op_has_materials',
      displayName: '工单工序需求物料',
      description: '工单工序需要的物料',
      source: 'ot-sc-018',
      target: 'ot-sc-019',
      cardinality: 'one-to-many',
      source_key: 'wo_op_id',
      target_key: 'wo_op_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R12_executed_by',
      name: 'r12_executed_by',
      displayName: '工序分配机台执行',
      description: '工序分配到哪台机台执行（N:N关系）',
      source: 'ot-sc-018',
      target: 'ot-sc-004',
      cardinality: 'many-to-many',
      source_key: 'wo_op_id',
      target_key: 'machine_id',
      intermediate_model: 'ot-sc-023',
      intermediate_source_key: 'wo_op_id',
      intermediate_target_key: 'machine_id'
    },
    {
      id: 'R12_1_wo_op_has_tasks',
      name: 'r12_1_wo_op_has_tasks',
      displayName: '工序分解生产任务',
      description: '工单工序分解的生产任务',
      source: 'ot-sc-018',
      target: 'ot-sc-023',
      cardinality: 'one-to-many',
      source_key: 'wo_op_id',
      target_key: 'wo_op_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R12_2_wo_has_tasks',
      name: 'r12_2_wo_has_tasks',
      displayName: '工单包含生产任务',
      description: '工单包含的所有生产任务',
      source: 'ot-sc-017',
      target: 'ot-sc-023',
      cardinality: 'one-to-many',
      source_key: 'work_order_id',
      target_key: 'work_order_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R12_3_machine_has_tasks',
      name: 'r12_3_machine_has_tasks',
      displayName: '机台执行生产任务',
      description: '机台执行的生产任务',
      source: 'ot-sc-004',
      target: 'ot-sc-023',
      cardinality: 'one-to-many',
      source_key: 'machine_id',
      target_key: 'machine_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R13_tracks_lot',
      name: 'r13_tracks_lot',
      displayName: '工单拆分批次',
      description: '工单拆分为多个Lot批次（每25片一批）',
      source: 'ot-sc-017',
      target: 'ot-sc-022',
      cardinality: 'one-to-many',
      source_key: 'work_order_id',
      target_key: 'work_order_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R13_1_product_has_lots',
      name: 'r13_1_product_has_lots',
      displayName: '产品在制品批次',
      description: '产品的在制品批次',
      source: 'ot-sc-001',
      target: 'ot-sc-022',
      cardinality: 'one-to-many',
      source_key: 'product_id',
      target_key: 'product_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R13_2_step_has_lots',
      name: 'r13_2_step_has_lots',
      displayName: '工序在制品批次',
      description: '工序当前正在加工的批次',
      source: 'ot-sc-006',
      target: 'ot-sc-022',
      cardinality: 'one-to-many',
      source_key: 'step_id',
      target_key: 'current_step_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R13_3_machine_has_lots',
      name: 'r13_3_machine_has_lots',
      displayName: '机台加工在制品',
      description: '机台正在加工的批次',
      source: 'ot-sc-004',
      target: 'ot-sc-022',
      cardinality: 'one-to-many',
      source_key: 'machine_id',
      target_key: 'current_machine_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R13_4_lot_has_tasks',
      name: 'r13_4_lot_has_tasks',
      displayName: '批次对应生产任务',
      description: '批次对应的生产任务',
      source: 'ot-sc-022',
      target: 'ot-sc-023',
      cardinality: 'one-to-many',
      source_key: 'lot_id',
      target_key: 'lot_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R13_5_shift_has_tasks',
      name: 'r13_5_shift_has_tasks',
      displayName: '班次生产任务安排',
      description: '班次内的生产任务',
      source: 'ot-sc-009',
      target: 'ot-sc-023',
      cardinality: 'one-to-many',
      source_key: 'shift_id',
      target_key: 'shift_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R14_has_inventory',
      name: 'r14_has_inventory',
      displayName: '物料实时库存',
      description: '物料的实时库存状态',
      source: 'ot-sc-002',
      target: 'ot-sc-026',
      cardinality: 'one-to-one',
      source_key: 'material_id',
      target_key: 'material_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R15_has_fg_inventory',
      name: 'r15_has_fg_inventory',
      displayName: '产品成品库存',
      description: '产品的成品库存状态',
      source: 'ot-sc-001',
      target: 'ot-sc-028',
      cardinality: 'one-to-one',
      source_key: 'product_id',
      target_key: 'product_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R16_triggers_po',
      name: 'r16_triggers_po',
      displayName: '物料缺料触发采购',
      description: '物料缺料触发采购订单',
      source: 'ot-sc-019',
      target: 'ot-sc-020',
      cardinality: 'many-to-many',
      source_key: 'wom_id',
      target_key: 'po_id',
      intermediate_model: 'ot-sc-021',
      intermediate_source_key: 'related_wom_id',
      intermediate_target_key: 'po_id'
    },
    {
      id: 'R16_1_po_has_lines',
      name: 'r16_1_po_has_lines',
      displayName: '采购订单包含采购行',
      description: '采购订单的物料明细行',
      source: 'ot-sc-020',
      target: 'ot-sc-021',
      cardinality: 'one-to-many',
      source_key: 'po_id',
      target_key: 'po_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R16_2_wo_has_po_line',
      name: 'r16_2_wo_has_po_line',
      displayName: '工单关联采购行',
      description: '工单关联的采购订单行',
      source: 'ot-sc-017',
      target: 'ot-sc-021',
      cardinality: 'one-to-many',
      source_key: 'work_order_id',
      target_key: 'related_work_order_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R16_3_material_has_po_lines',
      name: 'r16_3_material_has_po_lines',
      displayName: '物料被采购行订购',
      description: '物料的采购订单行',
      source: 'ot-sc-002',
      target: 'ot-sc-021',
      cardinality: 'one-to-many',
      source_key: 'material_id',
      target_key: 'material_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R16_4_wom_has_po_lines',
      name: 'r16_4_wom_has_po_lines',
      displayName: '物料需求触发采购行',
      description: '工单物料需求触发的采购订单行',
      source: 'ot-sc-019',
      target: 'ot-sc-021',
      cardinality: 'one-to-many',
      source_key: 'wom_id',
      target_key: 'related_wom_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_triggers_inspection',
      name: 'r17_triggers_inspection',
      displayName: '生产任务触发检验',
      description: '工单工序完成后触发质量检验',
      source: 'ot-sc-018',
      target: 'ot-sc-029',
      cardinality: 'one-to-many',
      source_key: 'wo_op_id',
      target_key: 'wo_op_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_1_wo_op_has_inspections',
      name: 'r17_1_wo_op_has_inspections',
      displayName: '工单工序质量检验',
      description: '工单工序的质量检验记录',
      source: 'ot-sc-018',
      target: 'ot-sc-029',
      cardinality: 'one-to-many',
      source_key: 'wo_op_id',
      target_key: 'wo_op_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_2_lot_has_inspections',
      name: 'r17_2_lot_has_inspections',
      displayName: '批次质量检验',
      description: '批次的质量检验记录',
      source: 'ot-sc-022',
      target: 'ot-sc-029',
      cardinality: 'one-to-many',
      source_key: 'lot_id',
      target_key: 'lot_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_3_machine_has_inspections',
      name: 'r17_3_machine_has_inspections',
      displayName: '机台加工质量检验',
      description: '机台相关的检验记录',
      source: 'ot-sc-004',
      target: 'ot-sc-029',
      cardinality: 'one-to-many',
      source_key: 'machine_id',
      target_key: 'machine_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_4_po_has_inspections',
      name: 'r17_4_po_has_inspections',
      displayName: '采购订单来料检验',
      description: '采购订单的来料检验记录',
      source: 'ot-sc-020',
      target: 'ot-sc-029',
      cardinality: 'one-to-many',
      source_key: 'po_id',
      target_key: 'po_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_5_material_has_inspections',
      name: 'r17_5_material_has_inspections',
      displayName: '物料质量检验',
      description: '物料的质量检验记录',
      source: 'ot-sc-002',
      target: 'ot-sc-029',
      cardinality: 'one-to-many',
      source_key: 'material_id',
      target_key: 'material_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_6_supplier_has_orders',
      name: 'r17_6_supplier_has_orders',
      displayName: '供应商接收采购订单',
      description: '供应商的采购订单',
      source: 'ot-sc-010',
      target: 'ot-sc-020',
      cardinality: 'one-to-many',
      source_key: 'supplier_id',
      target_key: 'supplier_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_7_material_has_transactions',
      name: 'r17_7_material_has_transactions',
      displayName: '物料库存流水',
      description: '物料的库存变动记录',
      source: 'ot-sc-002',
      target: 'ot-sc-027',
      cardinality: 'one-to-many',
      source_key: 'material_id',
      target_key: 'material_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_8_wo_from_transactions',
      name: 'r17_8_wo_from_transactions',
      displayName: '工单库存调出',
      description: '工单作为调出方的库存事务',
      source: 'ot-sc-017',
      target: 'ot-sc-027',
      cardinality: 'one-to-many',
      source_key: 'work_order_id',
      target_key: 'from_work_order_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_9_wo_to_transactions',
      name: 'r17_9_wo_to_transactions',
      displayName: '工单库存调入',
      description: '工单作为调入方的库存事务',
      source: 'ot-sc-017',
      target: 'ot-sc-027',
      cardinality: 'one-to-many',
      source_key: 'work_order_id',
      target_key: 'to_work_order_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_10_wom_from_transfers',
      name: 'r17_10_wom_from_transfers',
      displayName: '工单物料需求调出',
      description: '工单物料需求作为调出方',
      source: 'ot-sc-019',
      target: 'ot-sc-024',
      cardinality: 'one-to-many',
      source_key: 'wom_id',
      target_key: 'from_wom_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_11_wom_to_transfers',
      name: 'r17_11_wom_to_transfers',
      displayName: '工单物料需求调入',
      description: '工单物料需求作为调入方',
      source: 'ot-sc-019',
      target: 'ot-sc-024',
      cardinality: 'one-to-many',
      source_key: 'wom_id',
      target_key: 'to_wom_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_12_workcenter_has_calendar',
      name: 'r17_12_workcenter_has_calendar',
      displayName: '工作中心班次安排',
      description: '工作中心的每日班次安排',
      source: 'ot-sc-003',
      target: 'ot-sc-025',
      cardinality: 'one-to-many',
      source_key: 'work_center_id',
      target_key: 'work_center_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_13_shift_has_calendar',
      name: 'r17_13_shift_has_calendar',
      displayName: '班次日历安排',
      description: '班次的日历安排',
      source: 'ot-sc-009',
      target: 'ot-sc-025',
      cardinality: 'one-to-many',
      source_key: 'shift_id',
      target_key: 'shift_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_14_machine_has_schedule',
      name: 'r17_14_machine_has_schedule',
      displayName: '机台产能负荷统计',
      description: '机台的每日产能负荷统计',
      source: 'ot-sc-004',
      target: 'ot-sc-030',
      cardinality: 'one-to-many',
      source_key: 'machine_id',
      target_key: 'bottleneck_machine_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_15_workcenter_has_schedule',
      name: 'r17_15_workcenter_has_schedule',
      displayName: '工作中心产能负荷统计',
      description: '工作中心的每日产能负荷统计',
      source: 'ot-sc-003',
      target: 'ot-sc-030',
      cardinality: 'one-to-many',
      source_key: 'work_center_id',
      target_key: 'bottleneck_work_center_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_16_material_has_transfer',
      name: 'r17_16_material_has_transfer',
      displayName: '物料工间调拨',
      description: '物料的工间调拨记录',
      source: 'ot-sc-002',
      target: 'ot-sc-024',
      cardinality: 'one-to-many',
      source_key: 'material_id',
      target_key: 'material_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_17_wo_from_transfer',
      name: 'r17_17_wo_from_transfer',
      displayName: '工单作为调出方',
      description: '工单作为调出方的物料调拨',
      source: 'ot-sc-017',
      target: 'ot-sc-024',
      cardinality: 'one-to-many',
      source_key: 'work_order_id',
      target_key: 'from_work_order_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R17_18_wo_to_transfer',
      name: 'r17_18_wo_to_transfer',
      displayName: '工单作为调入方',
      description: '工单作为调入方的物料调拨',
      source: 'ot-sc-017',
      target: 'ot-sc-024',
      cardinality: 'one-to-many',
      source_key: 'work_order_id',
      target_key: 'to_work_order_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R30_machine_has_status_log',
      name: 'r30_machine_has_status_log',
      displayName: '机台运行状态记录',
      description: '机台的状态变迁记录（运行、停机、维护、故障），用于OEE分析',
      source: 'ot-sc-004',
      target: 'ot-sc-031',
      cardinality: 'one-to-many',
      source_key: 'machine_id',
      target_key: 'machine_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R31_product_in_status_log',
      name: 'r31_product_in_status_log',
      displayName: '机台日志生产产品',
      description: '机台状态日志中记录的生产产品',
      source: 'ot-sc-031',
      target: 'ot-sc-001',
      cardinality: 'many-to-one',
      source_key: 'product_id',
      target_key: 'product_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R32_supplier_has_risk',
      name: 'r32_supplier_has_risk',
      displayName: '供应商遭遇风险事件',
      description: '供应商作为主要受影响方的风险事件',
      source: 'ot-sc-010',
      target: 'ot-sc-032',
      cardinality: 'one-to-many',
      source_key: 'supplier_id',
      target_key: 'supplier_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R33_customer_has_risk',
      name: 'r33_customer_has_risk',
      displayName: '客户遭遇风险事件',
      description: '客户关联的外部风险事件（需求变化、财务危机、行业政策等）',
      source: 'ot-sc-014',
      target: 'ot-sc-032',
      cardinality: 'one-to-many',
      source_key: 'customer_id',
      target_key: 'customer_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R34_supplier_risk_link',
      name: 'r34_supplier_risk_link',
      displayName: '供应商风险关联清单',
      description: '供应商与风险事件的波及影响链（支持direct/indirect/potential三种关联类型）。用于查询供应商受哪些风险波及，及其影响程度',
      source: 'ot-sc-010',
      target: 'ot-sc-033',
      cardinality: 'one-to-many',
      source_key: 'supplier_id',
      target_key: 'supplier_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R18_has_logistics',
      name: 'r18_has_logistics',
      displayName: '采购订单包含物流单',
      description: '一张采购订单对应多条物流到货单据',
      source: 'ot-sc-034',
      target: 'ot-sc-020',
      cardinality: 'many-to-one',
      source_key: 'po_id',
      target_key: 'po_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R18_1_supplier_has_logistics',
      name: 'r18_1_supplier_has_logistics',
      displayName: '供应商发货物流单',
      description: '供应商名下生成多条发货物流记录',
      source: 'ot-sc-034',
      target: 'ot-sc-010',
      cardinality: 'many-to-one',
      source_key: 'supplier_id',
      target_key: 'supplier_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R18_2_material_has_logistics',
      name: 'r18_2_material_has_logistics',
      displayName: '物料关联运输物流',
      description: '物料存在多条到货、在途物流单据',
      source: 'ot-sc-034',
      target: 'ot-sc-002',
      cardinality: 'many-to-one',
      source_key: 'material_id',
      target_key: 'material_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R19_has_detail',
      name: 'r19_has_detail',
      displayName: '排程汇总包含排程明细',
      description: '一份排程汇总快照包含多条生产明细排程',
      source: 'ot-sc-035',
      target: 'ot-sc-030',
      cardinality: 'many-to-one',
      source_key: 'schedule_id',
      target_key: 'schedule_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R19_1_wo_has_schedule_detail',
      name: 'r19_1_wo_has_schedule_detail',
      displayName: '工单绑定排程明细',
      description: '生产工单生成对应一条排程明细记录',
      source: 'ot-sc-035',
      target: 'ot-sc-017',
      cardinality: 'many-to-one',
      source_key: 'work_order_id',
      target_key: 'work_order_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R19_2_order_has_schedule_detail',
      name: 'r19_2_order_has_schedule_detail',
      displayName: '客户订单关联排程明细',
      description: '溯源关联原始客户销售订单，用于交期管控',
      source: 'ot-sc-035',
      target: 'ot-sc-016',
      cardinality: 'many-to-one',
      source_key: 'customer_order_id',
      target_key: 'customer_order_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R19_3_product_has_schedule_detail',
      name: 'r19_3_product_has_schedule_detail',
      displayName: '产品关联排程明细',
      description: '产品对应多条生产排程明细记录',
      source: 'ot-sc-035',
      target: 'ot-sc-001',
      cardinality: 'many-to-one',
      source_key: 'product_id',
      target_key: 'product_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R19_4_wc_has_schedule_detail',
      name: 'r19_4_wc_has_schedule_detail',
      displayName: '工作中心包含排程明细',
      description: '工作中心下归集所有产能排程任务明细',
      source: 'ot-sc-035',
      target: 'ot-sc-003',
      cardinality: 'many-to-one',
      source_key: 'work_center_id',
      target_key: 'work_center_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R19_5_machine_has_schedule_detail',
      name: 'r19_5_machine_has_schedule_detail',
      displayName: '机台分配排程明细',
      description: '机台挂载多条生产排程明细，用于负荷计算',
      source: 'ot-sc-035',
      target: 'ot-sc-004',
      cardinality: 'many-to-one',
      source_key: 'machine_id',
      target_key: 'machine_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    },
    {
      id: 'R19_6_customer_has_schedule_detail',
      name: 'r19_6_customer_has_schedule_detail',
      displayName: '客户关联排程明细',
      description: '归集该客户所有生产排程任务明细',
      source: 'ot-sc-035',
      target: 'ot-sc-014',
      cardinality: 'many-to-one',
      source_key: 'customer_id',
      target_key: 'customer_id',
      intermediate_model: null,
      intermediate_source_key: null,
      intermediate_target_key: null
    }
  ],
  actionTypes: [
    {
      id: 'create_external_supply_chain_risk',
      name: 'CreateExternalSupplyChainRisk',
      displayName: '新增外部供应链风险数据',
      description: '新增通过舆情监控获取的外部风险事件数据',
      targetObjectType: 'ot-sc-032',
      action_type: 'object',
      operation: 'create_object',
      target_model_id: 'ot-sc-032',
      target_link_id: null,
      parameters: [
        {
          name: 'risk_id',
          type: 'string',
          required: true,
          default_value: '',
          description: '风险事件唯一标识符'
        },
        {
          name: 'supplier_id',
          type: 'string',
          required: false,
          default_value: '',
          description: '风险事件的直接责任方或主要受影响方（1个）。如需记录多个关联供应商，使用SupplierRiskAssociation对象'
        },
        {
          name: 'customer_id',
          type: 'string',
          required: false,
          default_value: '',
          description: '客户唯一标识符'
        },
        {
          name: 'material_id',
          type: 'string',
          required: false,
          default_value: '',
          description: '物料唯一标识符'
        },
        {
          name: 'risk_category',
          type: 'string',
          required: true,
          is_enum: true,
          enum_values: [
            '自然灾害',
            '政治事件',
            '财务风险',
            '质量风险',
            '法律风险',
            '运营风险'
          ],
          default_value: '',
          description: '风险类别（枚举：自然灾害/政治事件/财务风险/质量风险/法律风险/运营风险）'
        },
        {
          name: 'risk_level',
          type: 'string',
          required: true,
          is_enum: true,
          enum_values: [
            '严重',
            '高',
            '中',
            '低'
          ],
          default_value: '',
          description: '风险等级（枚举：严重/高/中/低）'
        },
        {
          name: 'title',
          type: 'string',
          required: true,
          default_value: '',
          description: '风险事件标题'
        },
        {
          name: 'description',
          type: 'string',
          required: true,
          default_value: '',
          description: '风险事件描述'
        },
        {
          name: 'source_url',
          type: 'string',
          required: false,
          default_value: '',
          description: '信息来源URL（舆情原文链接）'
        },
        {
          name: 'source_name',
          type: 'string',
          required: false,
          default_value: '',
          description: '信息来源名称（如：Reuters/Bloomberg/新华社）'
        },
        {
          name: 'impact_scope',
          type: 'string',
          required: false,
          is_enum: true,
          enum_values: [
            '全球',
            '区域',
            '局部'
          ],
          default_value: '',
          description: '影响范围（枚举：全球/区域/局部）'
        },
        {
          name: 'estimated_impact_days',
          type: 'integer',
          required: false,
          default_value: '',
          description: '预估影响天数'
        },
        {
          name: 'affected_materials',
          type: 'array',
          required: false,
          default_value: '',
          description: '受影响物料的ID列表'
        },
        {
          name: 'affected_products',
          type: 'array',
          required: false,
          default_value: '',
          description: '受影响产品ID列表'
        },
        {
          name: 'event_date',
          type: 'date',
          required: false,
          default_value: '',
          description: '事件发生日期'
        },
        {
          name: 'detected_at',
          type: 'datetime',
          required: false,
          default_value: '',
          description: '检测时间（系统捕获舆情时间）'
        },
        {
          name: 'status',
          type: 'string',
          required: false,
          is_enum: true,
          enum_values: [
            '新发现',
            '分析中',
            '缓解中',
            '已解决',
            '已忽略'
          ],
          default_value: '',
          description: '风险处理状态（枚举：新发现/分析中/缓解中/已解决/已忽略）'
        },
        {
          name: 'assigned_to',
          type: 'string',
          required: false,
          default_value: '',
          description: '负责人（处理该风险的责任人）'
        },
        {
          name: 'mitigation_plan',
          type: 'string',
          required: false,
          default_value: '',
          description: '缓解计划（应对措施说明）'
        },
        {
          name: 'resolved_at',
          type: 'datetime',
          required: false,
          default_value: '',
          description: '解决时间'
        },
        {
          name: 'confidence_score',
          type: 'float',
          required: false,
          default_value: '',
          description: 'AI分析置信度（0.0-1.0，越高越可信）'
        },
        {
          name: 'keywords',
          type: 'array',
          required: false,
          default_value: '',
          description: '关键词列表'
        },
        {
          name: 'raw_content',
          type: 'string',
          required: false,
          default_value: '',
          description: '原始舆情内容（完整新闻/报告文本）'
        },
        {
          name: 'created_at',
          type: 'datetime',
          required: false,
          default_value: '',
          description: '记录创建时间'
        },
        {
          name: 'updated_at',
          type: 'datetime',
          required: false,
          default_value: '',
          description: '记录更新时间'
        }
      ],
      submission_criteria: [],
      function_code: null,
      position: {
        x: 100,
        y: 1880
      }
    },
    {
      id: 'create_supplier_risk_association',
      name: 'CreateSupplierRiskAssociation',
      displayName: '新增供应商与风险事件信息',
      description: '新增供应商与风险事件的多对多关联数据，记录风险波及影响链。支持direct/indirect/potential三种关联类型，独立记录每个供应商的影响程度',
      targetObjectType: 'ot-sc-033',
      action_type: 'object',
      operation: 'create_object',
      target_model_id: 'ot-sc-033',
      target_link_id: null,
      parameters: [
        {
          name: 'supplier_id',
          type: 'string',
          required: true,
          default_value: '',
          description: '供应商唯一标识符'
        },
        {
          name: 'risk_id',
          type: 'string',
          required: true,
          default_value: '',
          description: '风险事件唯一标识符'
        },
        {
          name: 'association_type',
          type: 'string',
          required: false,
          is_enum: true,
          enum_values: [
            '直接',
            '间接',
            '潜在'
          ],
          default_value: '',
          description: '关联类型（枚举：直接/间接/潜在）'
        },
        {
          name: 'impact_level',
          type: 'string',
          required: false,
          is_enum: true,
          enum_values: [
            '严重',
            '高',
            '中',
            '低'
          ],
          default_value: '',
          description: '影响程度（枚举：严重/高/中/低）'
        },
        {
          name: 'note',
          type: 'string',
          required: false,
          default_value: '',
          description: '备注说明'
        },
        {
          name: 'created_at',
          type: 'datetime',
          required: false,
          default_value: '',
          description: '记录创建时间'
        }
      ],
      submission_criteria: [],
      function_code: null,
      position: {
        x: 380,
        y: 1880
      }
    },
    {
      id: 'update_external_supply_chain_risk',
      name: 'UpdateExternalSupplyChainRisk',
      displayName: '更新外部供应链风险数据',
      description: '更新外部风险事件数据中的处理状态、缓解计划等信息',
      targetObjectType: 'ot-sc-032',
      action_type: 'object',
      operation: 'update_object',
      target_model_id: 'ot-sc-032',
      target_link_id: null,
      parameters: [
        {
          name: 'risk_id',
          type: 'string',
          required: true,
          default_value: '',
          description: '风险事件唯一标识符',
          is_enum: false,
          enum_values: []
        },
        {
          name: 'status',
          type: 'string',
          required: false,
          default_value: '',
          description: '风险处理状态（枚举：新发现/分析中/缓解中/已解决/已忽略）',
          is_enum: true,
          enum_values: [
            '新发现',
            '分析中',
            '缓解中',
            '已解决',
            '已忽略'
          ]
        },
        {
          name: 'mitigation_plan',
          type: 'string',
          required: false,
          default_value: '',
          description: '缓解计划（应对措施说明）',
          is_enum: false,
          enum_values: []
        }
      ],
      submission_criteria: [],
      function_code: null,
      position: {
        x: 660,
        y: 1880
      }
    },
    {
      id: 'predict_material_shortage',
      name: 'PredictMaterialShortage',
      displayName: '缺料预测',
      description: '预测未来指定天数内哪些物料会出现短缺。当需要检查物料供应风险、回答\'未来X天哪些物料会缺货\'或评估采购紧迫性时使用。输出按严重程度分级的缺料清单、影响工单及行动建议。',
      targetObjectType: 'ot-sc-002',
      action_type: 'function',
      operation: 'custom',
      target_model_id: 'ot-sc-002',
      target_link_id: null,
      parameters: [
        {
          name: 'forecast_days',
          type: 'integer',
          required: false,
          description: '预测天数范围。短期用7天，中期用30天。默认30天'
        },
        {
          name: 'material_ids',
          type: 'array',
          required: false,
          description: '指定要检查的物料ID列表。为空则检查所有物料。示例：[\'MAT-DIE-BGA\', \'MAT-EMC-QFN\']'
        },
        {
          name: 'safety_stock_threshold',
          type: 'float',
          required: false,
          description: '统一安全库存阈值（覆盖物料自身设置）。为空则使用各物料定义的安全库存'
        }
      ],
      submission_criteria: [],
      function_code: `# 缺料预测函数实现 - 使用 Ontology SDK + OR-Tools（批量查询优化版）
import json
from datetime import datetime, timedelta
from ortools.linear_solver import pywraplp

# 使用 SDK
from my_ontology_sdk import OntologyClient

def execute_predict_material_shortage(parameters):
    """
    缺料预测 - LP模型（批量查询优化版 + 静态缺料检测）
    
    【改进算法】双阶段缺料检测：
    阶段1 - 静态缺料检测：检查当前库存是否低于安全库存（即使未来无需求）
    阶段2 - 动态缺料预测：基于LP模型预测未来需求导致的缺料
    
    数学模型（动态预测）:
    - 决策变量: I[m,t]库存量, G[m,t]缺料量
    - 目标函数: Minimize ΣG[m,t]（虚拟目标，实际值由约束决定）
    - 约束条件:
      1. 库存平衡: I[m,t] = I[m,t-1] + R[m,t] - D[m,t]
      2. 缺料计算: G[m,t] >= safety_stock - I[m,t]
      3. 非负约束: G[m,t] >= 0
    
    优化内容:
    1. 【关键】批量查询所有物料、库存、工单、采购订单数据（避免N+1查询）
    2. 预计算每天的需求和到货量，避免重复查询
    3. 预构建工单日期映射，快速查找影响工单
    4. 【新增】静态缺料检测：即使未来无需求，当前库存不足也会报警
    """
    try:
        # 1. 解析参数
        forecast_days = parameters.get("forecast_days", 30)
        material_ids = parameters.get("material_ids", [])
        safety_stock_threshold = parameters.get("safety_stock_threshold")
        
        # 2. 初始化SDK客户端
        client = OntologyClient("http://localhost:8080", api_key="your-api-key")
        
        # ============================================================
        # 【批量查询优化】核心数据加载阶段
        # 原方案: 循环中逐条查询（N次API调用）
        # 优化后: 使用 __in 批量查询（仅1次API调用）
        # ============================================================
        
        # 3. 批量查询物料数据
        if material_ids:
            # 使用 material_id__in 批量查询指定物料
            materials = client.models.Material.find(material_id__in=material_ids)
        else:
            # 查询所有物料
            materials = client.models.Material.find()
        
        if not materials:
            return {"success": False, "error": "没有找到物料数据"}
        
        materials_list = list(materials)
        material_id_list = [m.material_id for m in materials_list]
        
        # 4. 批量查询所有库存数据（原方案: 循环N次，现: 1次批量查询）
        all_inventories = client.models.Inventory.find(material_id__in=material_id_list)
        inventory_map = {inv.material_id: inv.available_quantity for inv in all_inventories}
        
        # 5. 批量查询所有工单物料需求
        all_woms = client.models.WorkOrderMaterial.find(material_id__in=material_id_list)
        
        # 6. 批量查询所有工单工序
        # 提取所有工单工序ID，一次性查询
        wo_op_ids = list(set([wom.wo_op_id for wom in all_woms if hasattr(wom, 'wo_op_id') and wom.wo_op_id]))
        all_wo_ops = {}
        if wo_op_ids:
            for wo_op in client.models.WorkOrderOperation.find(wo_op_id__in=wo_op_ids):
                all_wo_ops[wo_op.wo_op_id] = wo_op
        
        # 7. 批量查询所有工单
        wo_ids = list(set([wom.work_order_id for wom in all_woms]))
        all_work_orders = {}
        if wo_ids:
            for wo in client.models.WorkOrder.find(work_order_id__in=wo_ids):
                all_work_orders[wo.work_order_id] = wo
        
        # 8. 批量查询所有采购订单行
        all_po_lines = client.models.PurchaseOrderLine.find(material_id__in=material_id_list)
        
        # 9. 批量查询所有采购订单
        po_ids = list(set([line.po_id for line in all_po_lines if hasattr(line, 'po_id') and line.po_id]))
        all_pos = {}
        if po_ids:
            for po in client.models.PurchaseOrder.find(po_id__in=po_ids):
                all_pos[po.po_id] = po
        
        # 10. 创建LP求解器（GLOP是纯线性规划求解器，速度快）
        solver = pywraplp.Solver.CreateSolver('GLOP')
        if not solver:
            return {"success": False, "error": "无法创建求解器"}
        
        # 11. 预计算每天的需求和到货量（使用内存数据，无API调用）
        days = range(forecast_days)
        today = datetime(2026, 4, 26)
        # TODO today = datetime.now()
        
        # 需求缓存: demand_cache[material_id][day] = demand_qty
        demand_cache = {}
        for m in materials_list:
            demand_cache[m.material_id] = {t: 0 for t in days}
        
        # 遍历所有工单物料需求，按日期聚合
        for wom in all_woms:
            demand_qty = wom.required_quantity or 0
            if demand_qty == 0:
                continue
            
            material_id = wom.material_id
            if material_id not in demand_cache:
                continue
            
            planned_date = None
            
            # 优先使用工序计划开始时间
            if hasattr(wom, 'wo_op_id') and wom.wo_op_id and wom.wo_op_id in all_wo_ops:
                wo_op = all_wo_ops[wom.wo_op_id]
                if wo_op.planned_start:
                    planned_date = datetime.fromisoformat(wo_op.planned_start) if isinstance(wo_op.planned_start, str) else wo_op.planned_start
                elif wo_op.planned_end:
                    planned_date = datetime.fromisoformat(wo_op.planned_end) if isinstance(wo_op.planned_end, str) else wo_op.planned_end
            
            # 其次使用工单计划日期
            if not planned_date and hasattr(wom, 'work_order_id') and wom.work_order_id in all_work_orders:
                wo = all_work_orders[wom.work_order_id]
                if wo.planned_start_date:
                    planned_date = datetime.fromisoformat(wo.planned_start_date) if isinstance(wo.planned_start_date, str) else wo.planned_start_date
                elif wo.planned_completion_date:
                    planned_date = datetime.fromisoformat(wo.planned_completion_date) if isinstance(wo.planned_completion_date, str) else wo.planned_completion_date
            
            if planned_date:
                days_diff = (planned_date - today).days
                if days_diff in demand_cache[material_id]:
                    demand_cache[material_id][days_diff] += demand_qty
            else:
                # 无计划日期，默认当天需求
                demand_cache[material_id][0] += demand_qty
        
        # 到货缓存: receipt_cache[material_id][day] = receipt_qty
        receipt_cache = {}
        for m in materials_list:
            receipt_cache[m.material_id] = {t: 0 for t in days}
        
        # 遍历所有采购订单行，按日期聚合到货量
        for line in all_po_lines:
            if line.status not in ['待收货', '部分到货']:
                continue
            
            material_id = line.material_id
            if material_id not in receipt_cache:
                continue
            
            if hasattr(line, 'po_id') and line.po_id and line.po_id in all_pos:
                po = all_pos[line.po_id]
                if po.expected_delivery_date:
                    delivery_date = datetime.fromisoformat(po.expected_delivery_date) if isinstance(po.expected_delivery_date, str) else po.expected_delivery_date
                    days_diff = (delivery_date - today).days
                    
                    if days_diff in receipt_cache[material_id]:
                        receipt_cache[material_id][days_diff] += line.quantity - (line.received_quantity or 0)
        
        # 12. 创建决策变量
        inventory = {}  # I[m,t]: 物料m在第t天的库存
        shortage = {}   # G[m,t]: 物料m在第t天的缺料量
        
        for m in materials_list:
            current_inv = inventory_map.get(m.material_id, 0)
            
            # 初始库存 (t=0) 固定为当前库存
            inventory[m.material_id, 0] = solver.NumVar(0, 1000000, f'inv_{m.material_id}_0')
            inventory[m.material_id, 0].ub = current_inv
            inventory[m.material_id, 0].lb = current_inv
            
            for t in days:
                if t > 0:
                    inventory[m.material_id, t] = solver.NumVar(
                        0, 1000000, f'inv_{m.material_id}_{t}'
                    )
                
                shortage[m.material_id, t] = solver.NumVar(
                    0, 1000000, f'short_{m.material_id}_{t}'
                )
        
        # 13. 添加约束
        
        # 约束1: 库存平衡方程 I[m,t] = I[m,t-1] + receipt - demand
        for m in materials_list:
            for t in days:
                if t == 0:
                    continue
                
                demand = demand_cache[m.material_id][t]
                receipt = receipt_cache[m.material_id][t]
                
                solver.Add(
                    inventory[m.material_id, t] == 
                    inventory[m.material_id, t-1] + receipt - demand
                )
        
        # 约束2: 缺料量计算 G[m,t] >= safety_stock - I[m,t]
        for m in materials_list:
            safety_stock = safety_stock_threshold if safety_stock_threshold else (m.safety_stock_level or 0)
            
            for t in days:
                solver.Add(
                    shortage[m.material_id, t] >= safety_stock - inventory[m.material_id, t]
                )
        
        # 14. 目标函数：最小化总缺料量
        objective = solver.Objective()
        for m in materials_list:
            for t in days:
                objective.SetCoefficient(shortage[m.material_id, t], 1)
        objective.SetMinimization()
        
        # 15. 求解
        solver.SetTimeLimit(5000)
        solver.EnableOutput()
        status = solver.Solve()
        
        # 16. 解析结果
        if status != pywraplp.Solver.OPTIMAL:
            return {"success": False, "error": "求解失败"}
        
        # 【批量优化】预构建工单日期映射，避免结果解析时的循环查询
        wo_date_map = {}
        for wo_id, wo in all_work_orders.items():
            wo_date = None
            if wo.planned_start_date:
                wo_date = datetime.fromisoformat(wo.planned_start_date) if isinstance(wo.planned_start_date, str) else wo.planned_start_date
            elif wo.planned_completion_date:
                wo_date = datetime.fromisoformat(wo.planned_completion_date) if isinstance(wo.planned_completion_date, str) else wo.planned_completion_date
            
            if wo_date:
                days_diff = (wo_date - today).days
                if days_diff not in wo_date_map:
                    wo_date_map[days_diff] = []
                wo_date_map[days_diff].append({
                    "work_order_id": wo.work_order_id,
                    "product_id": wo.product_id,
                    "status": wo.status
                })
        
        shortages = []
        critical_count = 0
        warning_count = 0
        
        # ============================================================
        # 【改进算法】第一阶段：静态缺料检测（当前库存 vs 安全库存）
        # 即使未来没有需求，只要当前库存低于安全库存就报警
        # ============================================================
        static_shortage_count = 0
        for m in materials_list:
            safety_stock = safety_stock_threshold if safety_stock_threshold else (m.safety_stock_level or 0)
            current_inv = inventory_map.get(m.material_id, 0)
            
            # 如果安全库存设置有效且当前库存不足
            if safety_stock > 0 and current_inv < safety_stock:
                gap = safety_stock - current_inv
                static_shortage_count += 1
                
                # 严重程度分级
                severity_ratio = gap / safety_stock if safety_stock > 0 else 1
                if severity_ratio > 2:
                    severity = "critical"
                    critical_count += 1
                elif severity_ratio > 1:
                    severity = "warning"
                    warning_count += 1
                else:
                    severity = "info"
                                
                shortages.append({
                    "material_id": m.material_id,
                    "material_name": m.material_name,
                    "date_offset_days": 0,  # 当前立即缺料
                    "shortage_qty": round(gap, 2),
                    "inventory_level": round(current_inv, 2),
                    "safety_stock": safety_stock,
                    "severity": severity,
                    "shortage_type": "static",  # 标记为静态缺料
                    "affected_work_orders": [],  # 静态缺料暂不关联工单
                    "description": f"当前库存({current_inv})低于安全库存({safety_stock})"
                })
        
        # ============================================================
        # 【原有逻辑】第二阶段：动态缺料预测（LP求解器结果）
        # 基于未来需求和到货预测未来30天的缺料情况
        # ============================================================
        dynamic_shortage_count = 0
        
        for m in materials_list:
            for t in days:
                gap = shortage[m.material_id, t].solution_value()
                inv_level = inventory[m.material_id, t].solution_value()
                
                # 过滤微小缺料（数值误差）
                if gap > 0.1:
                    safety_stock = safety_stock_threshold if safety_stock_threshold else (m.safety_stock_level or 0)
                    
                    # 避免重复：如果静态检测已报告t=0的缺料，跳过动态检测的t=0
                    if t == 0:
                        already_reported = any(
                            s["material_id"] == m.material_id and s["date_offset_days"] == 0 
                            for s in shortages
                        )
                        if already_reported:
                            continue
                    
                    dynamic_shortage_count += 1
                    
                    # 严重程度分级
                    if safety_stock > 0:
                        severity_ratio = gap / safety_stock
                        if severity_ratio > 2:
                            severity = "critical"
                            critical_count += 1
                        elif severity_ratio > 1:
                            severity = "warning"
                            warning_count += 1
                        else:
                            severity = "info"
                    else:
                        severity = "warning"
                        warning_count += 1
                    
                    # 从预构建的映射中获取影响工单（O(1)查找）
                    affected_wos = wo_date_map.get(t, [])[:5]
                    
                    shortages.append({
                        "material_id": m.material_id,
                        "material_name": m.material_name,
                        "date_offset_days": t,
                        "shortage_qty": round(gap, 2),
                        "inventory_level": round(inv_level, 2),
                        "safety_stock": safety_stock,
                        "severity": severity,
                        "shortage_type": "dynamic",  # 标记为动态缺料
                        "affected_work_orders": affected_wos,
                        "description": f"第{t}天预测缺料（需求驱动）"
                    })
        
        # 生成行动建议
        recommendations = []
        if critical_count > 0:
            critical_items = [s["material_id"] for s in shortages if s["severity"] == "critical"][:5]
            # 区分静态和动态紧急缺料
            static_critical = [s["material_id"] for s in shortages if s["severity"] == "critical" and s.get("shortage_type") == "static"]
            dynamic_critical = [s["material_id"] for s in shortages if s["severity"] == "critical" and s.get("shortage_type") == "dynamic"]
            
            recommendation_text = "发现 {} 个严重缺料点（缺口超过安全库存2倍）".format(critical_count)
            if static_critical:
                recommendation_text += "，其中 {} 个为当前库存不足".format(len(static_critical))
            if dynamic_critical:
                recommendation_text += "，{} 个为未来需求预测".format(len(dynamic_critical))
            
            recommendations.append({
                "priority": "urgent",
                "action": "立即启动紧急采购流程",
                "reason": recommendation_text,
                "materials": critical_items
            })
        if warning_count > 0:
            static_warning = [s["material_id"] for s in shortages if s["severity"] == "warning" and s.get("shortage_type") == "static"]
            dynamic_warning = [s["material_id"] for s in shortages if s["severity"] == "warning" and s.get("shortage_type") == "dynamic"]
            
            recommendation_text = "发现 {} 个预警缺料点（缺口超过安全库存）".format(warning_count)
            if static_warning:
                recommendation_text += "，其中 {} 个为当前库存不足".format(len(static_warning))
            if dynamic_warning:
                recommendation_text += "，{} 个为未来需求预测".format(len(dynamic_warning))
            
            recommendations.append({
                "priority": "normal",
                "action": "安排常规采购补货",
                "reason": recommendation_text,
                "materials": [s["material_id"] for s in shortages if s["severity"] == "warning"][:10]
            })
        
        # 按严重程度排序
        severity_order = {"critical": 0, "warning": 1, "info": 2}
        shortages.sort(key=lambda x: (severity_order.get(x["severity"], 3), x["date_offset_days"]))
        
        # 防上下文膨胀：只返回前20条详情，其余汇总
        max_details = 20
        shortage_details_returned = shortages[:max_details]
        truncated_count = max(0, len(shortages) - max_details)
        
        # 统计静态/动态缺料数量
        static_shortages = [s for s in shortages if s.get("shortage_type") == "static"]
        dynamic_shortages = [s for s in shortages if s.get("shortage_type") == "dynamic"]
        
        result = {
            "forecast_days": forecast_days,
            "total_shortages": len(shortages),
            "critical_count": critical_count,
            "warning_count": warning_count,
            "shortage_details": shortage_details_returned,
            "truncated_count": truncated_count,
            "recommendations": recommendations,
            "generated_at": datetime.now().isoformat()
        }
        
        # 构建详细消息
        message_parts = ["缺料预测完成"]
        if static_shortages:
            message_parts.append("当前库存不足{}个物料".format(len(static_shortages)))
        if dynamic_shortages:
            message_parts.append("未来需求预测{}个缺料点".format(len(dynamic_shortages)))
        message_parts.append("严重{}个，预警{}个".format(critical_count, warning_count))
        
        return {
            "success": True,
            "message": "，".join(message_parts),
            "result": result
        }
        
    except Exception as e:
        return {"success": False, "error": f"执行失败: {str(e)}"}


result = execute_predict_material_shortage(parameters)
`,
      position: {
        x: 940,
        y: 1880
      }
    },
    {
      id: 'calculate_ctp',
      name: 'CalculateCTP',
      displayName: '机台可用能力承诺(CTP)计算',
      description: '计算指定产品和数量的最早可承诺交付日期。当客户询问\'什么时候能交货\'、需要承诺交期或评估订单可行性时使用。返回预计交付日期、瓶颈工序、可用机台及产能分析。',
      targetObjectType: 'ot-sc-016',
      action_type: 'function',
      operation: 'custom',
      target_model_id: 'ot-sc-016',
      target_link_id: null,
      parameters: [
        {
          name: 'product_id',
          type: 'string',
          required: true,
          description: '产品ID。示例：\'BGA-CPU\''
        },
        {
          name: 'quantity',
          type: 'float',
          required: true,
          description: '订单数量。支持浮点数，系统自动向上取整为整数'
        }
      ],
      submission_criteria: [],
      function_code: `# 机台可用能力承诺(CTP)计算 - 使用 Ontology SDK + OR-Tools（批量查询优化版）
import json
from datetime import datetime
from ortools.linear_solver import pywraplp
from my_ontology_sdk import OntologyClient

def execute_calculate_ctp(parameters):
    """
    机台可用能力承诺(CTP)计算 - LP模型（批量查询优化版）
    
    功能:
    基于机台能力和工序时间，计算产品订单的最早可承诺交付日期
    
    数学模型:
    - 决策变量: D（交付日期，分钟）
    - 目标函数: Minimize D
    - 约束条件:
      1. D >= Σ(工序时间 × QTY / 机台可用能力)
      2. D >= 机台最早可用时间 + 加工时间
    
    优化内容:
    1. 【关键】批量查询所有机台和能力数据（避免N+1查询）
    2. 预计算工序总加工时间，减少循环中的重复计算
    """
    try:
        # 1. 解析参数
        product_id = parameters.get("product_id")
        quantity_raw = parameters.get("quantity")
        
        if not product_id:
            return {"success": False, "error": "请提供产品ID"}
        if quantity_raw is None or quantity_raw <= 0:
            return {"success": False, "error": "请提供有效的订单数量"}
        
        # 类型转换：支持浮点数输入，向上取整为整数
        import math
        quantity = int(math.ceil(float(quantity_raw)))
        
        # 2. 初始化SDK客户端
        client = OntologyClient("http://localhost:8080", api_key="your-api-key")
        
        # ============================================================
        # 【批量查询优化】核心数据加载阶段
        # 原方案: 循环中逐条查询机台能力（N×M次API调用）
        # 优化后: 批量查询机台能力（仅1次API调用）
        # ============================================================
        
        # 3. 批量查询所有机台
        all_machines = client.models.Machine.find(is_active=True)
        if not all_machines:
            return {"success": False, "error": "没有找到机台数据"}
        all_machines = list(all_machines)
        
        # 4. 批量查询机台能力
        # 原方案: for machine in machines: caps = client.models.MachineCapability.find(machine_id=m.machine_id, product_id=product_id)
        # 优化后: 一次性查询所有机台的能力，用__in批量查询
        all_caps = client.models.MachineCapability.find(
            product_id=product_id,
            machine_id__in=[m.machine_id for m in all_machines]
        )
        
        # 构建能力集合，用于快速查找
        capable_machine_ids = set([cap.machine_id for cap in all_caps])
        # 构建机台字典
        machines_dict = {m.machine_id: m for m in all_machines}
        # 构建机台能力字典（按机台ID索引）
        capability_dict = {cap.machine_id: cap for cap in all_caps}
        # 过滤出有能力的机台
        machines_with_capability = [m for m in all_machines if m.machine_id in capable_machine_ids]
        
        if not machines_with_capability:
            return {
                "success": False,
                "error": f"没有找到能够生产产品 {product_id} 的机台"
            }
        
        # 5. 查询产品工艺路线
        process_routes = client.models.ProcessRoute.find(product_id=product_id)
        if not process_routes:
            return {"success": False, "error": f"没有找到产品 {product_id} 的工艺路线"}
        
        # 获取工艺路线ID（取第一个）
        process_route = process_routes[0]
        route_id = process_route.route_id
        
        # 6. 查询工艺路线步骤
        route_steps = client.models.RouteStep.find(route_id=route_id)
        if not route_steps:
            return {"success": False, "error": f"工艺路线 {route_id} 没有工序步骤"}
        
        route_steps = sorted(route_steps, key=lambda x: x.sequence_no or 0)
        
        # 7. 计算每个步骤的加工时间
        step_times = []
        total_standard_time = 0
        
        for step in route_steps:
            standard_time = step.standard_time_hours or 0
            total_standard_time += standard_time
            step_times.append({
                "step_id": step.step_id,
                "sequence_no": step.sequence_no,
                "standard_time_hours": standard_time,
                "machine_type_required": step.machine_type_required
            })
        
        # 8. 创建LP求解器（GLOP是纯线性规划求解器，速度快）
        solver = pywraplp.Solver.CreateSolver('GLOP')
        if not solver:
            return {"success": False, "error": "无法创建求解器"}
        
        # 9. 创建决策变量
        
        # 交付时间变量（分钟）
        delivery_time = solver.NumVar(0, 1000000, 'delivery_time')
        
        # 每个机台的加工时间变量
        machine_process_times = {}
        for machine in machines_with_capability:
            # 检查机台是否属于所需的工序类型
            can_process = False
            for step in route_steps:
                if machine.work_center_id == step.machine_type_required:
                    can_process = True
                    break
            
            if can_process:
                machine_process_times[machine.machine_id] = solver.NumVar(
                    0, 1000000, f'machine_time_{machine.machine_id}'
                )
        
        # 10. 添加约束
        
        # 约束1: 交付时间 >= 所有机台加工时间的最大值
        for machine_id, var in machine_process_times.items():
            solver.Add(delivery_time >= var)
        
        # 约束2: 每个机台的加工时间 = Σ(步骤时间 × 数量) / 机台可用能力
        # 简化计算：使用标准加工时间
        for machine in machines_with_capability:
            if machine.machine_id not in machine_process_times:
                continue
            
            total_time = 0
            for step in step_times:
                if machine.work_center_id == step['machine_type_required']:
                    step_time_minutes = step['standard_time_hours'] * 60
                    total_time += step_time_minutes * quantity
            
            # 计算机台加工时间（使用MachineCapability中的效率因子）
            cap = capability_dict.get(machine.machine_id)
            efficiency_factor = cap.efficiency_factor if cap else 1.0
            
            if efficiency_factor > 0:
                actual_time = total_time / efficiency_factor
            else:
                actual_time = total_time
            
            # 机台加工时间约束
            solver.Add(
                machine_process_times[machine.machine_id] >= actual_time
            )
        
        # 11. 目标函数：最小化交付时间
        solver.Minimize(delivery_time)
        
        # 12. 求解
        solver.SetTimeLimit(5000)
        solver.EnableOutput()
        status = solver.Solve()
        
        if status != pywraplp.Solver.OPTIMAL:
            return {"success": False, "error": "求解失败"}
        
        # 13. 解析结果
        delivery_minutes = delivery_time.solution_value()
        delivery_hours = delivery_minutes / 60
        delivery_days = delivery_hours / 24
        
        # TODO ctp_date = datetime.now() + __import__('datetime').timedelta(hours=delivery_hours)
        ctp_date = datetime(2026, 4, 26) + __import__('datetime').timedelta(hours=delivery_hours)
        
        # 计算各机台加工时间
        machine_times = {}
        max_machine_time = 0
        bottleneck_machine_id = None
        for machine_id, var in machine_process_times.items():
            time_minutes = var.solution_value()
            machine_times[machine_id] = {
                "time_minutes": round(time_minutes, 2),
                "time_hours": round(time_minutes / 60, 2)
            }
            if time_minutes > max_machine_time:
                max_machine_time = time_minutes
                bottleneck_machine_id = machine_id
        
        # 找出瓶颈工序（加工时间最长的工序类型）
        bottleneck_step = None
        max_step_time = 0
        for step in step_times:
            step_time_minutes = step['standard_time_hours'] * 60
            if step_time_minutes > max_step_time:
                max_step_time = step_time_minutes
                bottleneck_step = step
        
        # 计算置信度
        if status == pywraplp.Solver.OPTIMAL:
            confidence = "high"
        elif status == pywraplp.Solver.FEASIBLE:
            confidence = "medium"
        else:
            confidence = "low"
        
        # 生成建议
        recommendations = []
        if delivery_days > 7:
            recommendations.append({
                "type": "warning",
                "message": f"交付周期较长（{delivery_days:.1f}天），建议考虑加急或分批交付"
            })
        if bottleneck_machine_id:
            recommendations.append({
                "type": "info",
                "message": f"瓶颈机台：{bottleneck_machine_id}（加工时间最长 {max_machine_time:.0f} 分钟）"
            })
        if bottleneck_step:
            recommendations.append({
                "type": "info",
                "message": f"瓶颈工序：{bottleneck_step.get('step_id', '')}（标准时间 {max_step_time:.1f} 分钟）"
            })
        
        result = {
            "product_id": product_id,
            "quantity": quantity,
            "total_standard_time_hours": round(total_standard_time * quantity, 2),
            "estimated_delivery_time": {
                "minutes": round(delivery_minutes, 2),
                "hours": round(delivery_hours, 2),
                "days": round(delivery_days, 2),
                "date": ctp_date.isoformat()
            },
            "confidence": confidence,
            "summary": {
                "capable_machine_count": len(machines_with_capability),
                "total_standard_time_hours": round(total_standard_time * quantity, 2)
            },
            "recommendations": recommendations,
            "bottleneck_analysis": {
                "bottleneck_machine_id": bottleneck_machine_id,
                "bottleneck_machine_time_minutes": round(max_machine_time, 2) if max_machine_time > 0 else None,
                "bottleneck_step_id": bottleneck_step['step_id'] if bottleneck_step else None,
                "bottleneck_step_time_minutes": round(max_step_time, 2) if max_step_time > 0 else None
            },
            "summary": {
                "capable_machine_count": len(machines_with_capability),
                "total_standard_time_hours": round(total_standard_time * quantity, 2)
            },
            "calculated_at": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "message": f"CTP计算完成，最早可承诺交付日期: {ctp_date.strftime('%Y-%m-%d')}",
            "result": result
        }
        
    except Exception as e:
        return {"success": False, "error": f"执行失败: {str(e)}"}


result = execute_calculate_ctp(parameters)
`,
      position: {
        x: 1220,
        y: 1880
      }
    },
    {
      id: 'recommend_suppliers',
      name: 'RecommendSuppliers',
      displayName: '推荐供应商',
      description: '为指定物料推荐最优供应商。基于供应商的历史交期表现、价格、可靠性进行综合评分，返回TOP3推荐供应商。当需要紧急采购、寻找供应商或评估供应商选择时使用。返回供应商列表、评分详情、建议采购数量。',
      targetObjectType: 'ot-sc-010',
      action_type: 'function',
      operation: 'custom',
      target_model_id: 'ot-sc-010',
      target_link_id: null,
      parameters: [
        {
          name: 'material_id',
          type: 'string',
          required: true,
          description: '需要采购的物料ID。示例：\'MAT-DIE-BGA\''
        },
        {
          name: 'quantity_needed',
          type: 'float',
          required: false,
          description: '需要的数量。如果不提供，将基于安全库存自动计算'
        },
        {
          name: 'urgency_level',
          type: 'string',
          required: false,
          description: '紧急程度：\'high\'（紧急，3天交期）或\'normal\'（普通，7天交期）。默认\'high\''
        }
      ],
      submission_criteria: [],
      function_code: `# 推荐供应商 - 基于综合评分排序
import json
from datetime import datetime, timedelta
from my_ontology_sdk import OntologyClient

def execute_recommend_suppliers(parameters):
    """
    推荐供应商 - 基于交期、价格、可靠性的综合评分
    
    评分模型:
    - 交期得分 (40%): 基于供应商承诺交期，越短得分越高
    - 价格得分 (30%): 基于供应价格，越低得分越高
    - 可靠性得分 (30%): 基于供应商历史交付表现
    
    返回TOP3推荐供应商
    """
    try:
        # 1. 解析参数
        material_id = parameters.get("material_id")
        quantity_needed = parameters.get("quantity_needed")
        urgency_level = parameters.get("urgency_level", "high")
        
        if not material_id:
            return {"success": False, "error": "请提供物料ID"}
        
        # 2. 初始化SDK客户端
        client = OntologyClient("http://localhost:8080", api_key="your-api-key")
        
        # 3. 查询物料信息
        materials = client.models.Material.find(material_id=material_id)
        if not materials:
            return {"success": False, "error": f"物料 {material_id} 不存在"}
        
        material = materials[0]
        material_name = getattr(material, 'material_name', material_id)
        safety_stock = getattr(material, 'safety_stock_level', 0)
        
        # 4. 查询当前库存
        inventories = client.models.Inventory.find(material_id=material_id)
        current_inventory = 0
        if inventories:
            inv = inventories[0]
            current_inventory = getattr(inv, 'available_quantity', 0)
        
        # 5. 计算建议采购数量
        if quantity_needed is None:
            # 建议数量 = (安全库存 - 当前可用) × 1.2 (20%缓冲)
            shortage = max(0, safety_stock - current_inventory)
            quantity_needed = shortage * 1.2
        
        if quantity_needed <= 0:
            result = {
                "material_id": material_id,
                "material_name": material_name,
                "current_inventory": current_inventory,
                "safety_stock": safety_stock,
                "shortage": 0,
                "recommended_quantity": 0,
                "urgency_level": urgency_level,
                "recommended_suppliers": [],
                "supplier_count": 0,
                "generated_at": datetime.now().isoformat()
            }
            return {
                "success": True,
                "message": "当前库存充足，无需采购",
                "result": result
            }
        
        # 6. 查询该物料的供应商关系
        supplier_materials = client.models.SupplierMaterial.find(material_id=material_id)
        if not supplier_materials:
            return {
                "success": False,
                "error": f"物料 {material_id} 没有关联的供应商"
            }
        
        # 7. 获取所有供应商详情
        supplier_ids = [sm.supplier_id for sm in supplier_materials]
        suppliers = client.models.Supplier.find(supplier_id__in=supplier_ids)
        supplier_dict = {s.supplier_id: s for s in suppliers}
        
        # 8. 计算每个供应商的综合评分
        scored_suppliers = []
        
        for sm in supplier_materials:
            supplier_id = sm.supplier_id
            supplier = supplier_dict.get(supplier_id)
            
            if not supplier:
                continue
            
            # 提取供应商信息
            supplier_name = getattr(supplier, 'supplier_name', supplier_id)
            lead_time_days = getattr(sm, 'lead_time_days', 7)  # 承诺交期
            unit_price = getattr(sm, 'unit_price', 0)  # 单价
            reliability_score = getattr(supplier, 'reliability_score', 0.8)  # 可靠性评分 (0-1)
            min_order_qty = getattr(sm, 'min_order_quantity', 0)  # 最小订单量
            
            # 紧急采购调整交期
            if urgency_level == "high":
                actual_lead_time = min(3, lead_time_days)  # 紧急最多3天
            else:
                actual_lead_time = lead_time_days
            
            # 计算各项得分 (0-100)
            # 交期得分：交期越短得分越高 (假设30天为0分，0天为100分)
            delivery_score = max(0, 100 - (actual_lead_time / 30 * 100))
            
            # 价格得分：价格越低得分越高 (假设最高价为基准)
            # 这里简化处理，使用相对评分
            price_score = 80  # 默认中等价格得分
            
            # 可靠性得分：直接使用可靠性评分
            reliability_score_normalized = reliability_score * 100
            
            # 综合评分 (交期40% + 价格30% + 可靠性30%)
            total_score = (
                delivery_score * 0.4 +
                price_score * 0.3 +
                reliability_score_normalized * 0.3
            )
            
            # 计算预计交期日期
            expected_delivery_date = (datetime(2026, 4, 26) + timedelta(days=actual_lead_time)).strftime('%Y-%m-%d')
            # TODO expected_delivery_date = (datetime.now() + timedelta(days=actual_lead_time)).strftime('%Y-%m-%d')
            
            scored_suppliers.append({
                "supplier_id": supplier_id,
                "supplier_name": supplier_name,
                "lead_time_days": actual_lead_time,
                "unit_price": unit_price,
                "reliability_score": reliability_score,
                "min_order_quantity": min_order_qty,
                "expected_delivery_date": expected_delivery_date,
                "scores": {
                    "delivery_score": round(delivery_score, 2),
                    "price_score": round(price_score, 2),
                    "reliability_score": round(reliability_score_normalized, 2),
                    "total_score": round(total_score, 2)
                },
                "recommended_quantity": max(quantity_needed, min_order_qty),
                "estimated_cost": round(max(quantity_needed, min_order_qty) * unit_price, 2)
            })
        
        # 9. 按综合评分排序，返回TOP3
        scored_suppliers.sort(key=lambda x: x["scores"]["total_score"], reverse=True)
        top_suppliers = scored_suppliers[:3]
        
        # 10. 构建结果数据
        result = {
            "material_id": material_id,
            "material_name": material_name,
            "current_inventory": current_inventory,
            "safety_stock": safety_stock,
            "shortage": max(0, safety_stock - current_inventory),
            "recommended_quantity": round(quantity_needed, 2),
            "urgency_level": urgency_level,
            "recommended_suppliers": top_suppliers,
            "supplier_count": len(top_suppliers),
            "generated_at": datetime.now().isoformat()
        }
        
        # 11. 返回结果
        return {
            "success": True,
            "message": f"找到 {len(top_suppliers)} 个推荐供应商",
            "result": result
        }
        
    except Exception as e:
        return {"success": False, "error": f"推荐供应商失败: {str(e)}"}

result = execute_recommend_suppliers(parameters)
`,
      position: {
        x: 1500,
        y: 1880
      }
    },
    {
      id: 'emergency_purchase',
      name: 'EmergencyPurchase',
      displayName: '紧急采购',
      description: '创建紧急采购订单，快速响应低库存预警。自动设置较高的优先级和较短的期望交期，确保物料快速到货。当库存低于安全库存、需要紧急补货或产线缺料时使用。返回采购订单ID和预计到货时间。',
      targetObjectType: 'ot-sc-020',
      action_type: 'function',
      operation: 'create',
      target_model_id: 'ot-sc-020',
      target_link_id: null,
      parameters: [
        {
          name: 'material_id',
          type: 'string',
          required: true,
          description: '需要采购的物料ID。示例：\'MAT-DIE-BGA\''
        },
        {
          name: 'quantity',
          type: 'float',
          required: true,
          description: '采购数量。示例：100.0'
        },
        {
          name: 'supplier_id',
          type: 'string',
          required: true,
          description: '供应商ID。示例：\'SUP-001\''
        },
        {
          name: 'urgency_level',
          type: 'string',
          required: false,
          description: '紧急程度：\'high\'（紧急，3天交期）或\'normal\'（普通，7天交期）。默认\'high\''
        },
        {
          name: 'reason',
          type: 'string',
          required: false,
          description: '采购原因说明。示例：\'库存低于安全库存，需要紧急补货\''
        }
      ],
      submission_criteria: [],
      function_code: `# 紧急采购 - 创建紧急采购订单
import json
import uuid
from datetime import datetime, timedelta
from my_ontology_sdk import OntologyClient

def execute_emergency_purchase(parameters):
    """
    紧急采购 - 创建高优先级采购订单
    
    业务逻辑:
    1. 验证物料和供应商是否存在
    2. 查询供应商-物料关系获取价格和交期
    3. 创建采购订单（状态=已创建，优先级=紧急）
    4. 创建采购订单行
    5. 计算期望交期（紧急3天，普通7天）
    6. 返回采购订单详情
    """
    try:
        # 1. 解析参数
        material_id = parameters.get("material_id")
        quantity = parameters.get("quantity")
        supplier_id = parameters.get("supplier_id")
        urgency_level = parameters.get("urgency_level", "high")
        reason = parameters.get("reason", "紧急补货")
        
        if not material_id or not quantity or not supplier_id:
            return {"success": False, "error": "请提供物料ID、采购数量和供应商ID"}
        
        if quantity <= 0:
            return {"success": False, "error": "采购数量必须大于0"}
        
        # 2. 初始化SDK客户端
        client = OntologyClient("http://localhost:8080", api_key="your-api-key")
        
        # 3. 验证物料是否存在
        materials = client.models.Material.find(material_id=material_id)
        if not materials:
            return {"success": False, "error": f"物料 {material_id} 不存在"}
        
        material = materials[0]
        material_name = getattr(material, 'material_name', material_id)
        
        # 4. 验证供应商是否存在
        suppliers = client.models.Supplier.find(supplier_id=supplier_id)
        if not suppliers:
            return {"success": False, "error": f"供应商 {supplier_id} 不存在"}
        
        supplier = suppliers[0]
        supplier_name = getattr(supplier, 'supplier_name', supplier_id)
        
        # 5. 查询供应商-物料关系（获取价格和交期）
        supplier_materials = client.models.SupplierMaterial.find(
            supplier_id=supplier_id,
            material_id=material_id
        )
        
        if not supplier_materials:
            return {
                "success": False,
                "error": f"供应商 {supplier_name} 不供应物料 {material_name}"
            }
        
        sm = supplier_materials[0]
        unit_price = getattr(sm, 'unit_price', 0)
        standard_lead_time = getattr(sm, 'lead_time_days', 7)
        
        # 6. 计算期望交期
        if urgency_level == "high":
            lead_time_days = min(3, standard_lead_time)  # 紧急最多3天
            priority = 1  # 最高优先级
            order_type = "紧急采购"
        else:
            lead_time_days = standard_lead_time
            priority = 2  # 普通优先级
            order_type = "普通采购"
        
        # TODO expected_delivery_date = datetime.now() + timedelta(days=lead_time_days)
        expected_delivery_date = datetime(2026, 4, 26) + timedelta(days=lead_time_days)
        
        # 7. 生成采购订单ID
        # 使用UUID避免并发冲突
        po_id = f"PO-EMG-{uuid.uuid4().hex[:8].upper()}"
        
        # 8. 创建采购订单
        po_data = {
            "po_id": po_id,
            "supplier_id": supplier_id,
            "order_date": datetime(2026, 4, 26).isoformat(),  # TODO datetime.now().isoformat(),
            "expected_delivery_date": expected_delivery_date.isoformat(),
            "status": "已创建",
            "total_amount": round(quantity * unit_price, 2),
            "created_by": "紧急采购系统",
            "note": f"{reason} | 紧急程度: {urgency_level} | 优先级: {priority} | 类型: {order_type}"
        }
        
        # 使用SDK创建采购订单
        created_po = client.models.PurchaseOrder.create(**po_data)
        
        if not created_po:
            return {"success": False, "error": "创建采购订单失败"}
        
        # 9. 创建采购订单行
        line_id = f"POL-{po_id}-001"
        pol_data = {
            "line_id": line_id,
            "po_id": po_id,
            "material_id": material_id,
            "quantity": quantity,
            "unit_price": unit_price,
            "received_quantity": 0.0,
            "status": "未开始"
        }
        
        created_pol = client.models.PurchaseOrderLine.create(**pol_data)
        
        if not created_pol:
            return {
                "success": False,
                "error": "创建采购订单行失败",
                "po_id": po_id,
                "line_id": line_id
            }
        
        # 10. 构建结果数据
        result = {
            "po_id": po_id,
            "line_id": line_id,
            "supplier_id": supplier_id,
            "supplier_name": supplier_name,
            "material_id": material_id,
            "material_name": material_name,
            "quantity": quantity,
            "unit_price": unit_price,
            "total_amount": round(quantity * unit_price, 2),
            "expected_delivery_date": expected_delivery_date.isoformat(),
            "lead_time_days": lead_time_days,
            "priority": priority,
            "order_type": order_type,
            "urgency_level": urgency_level,
            "created_at": datetime.now().isoformat()
        }
        
        # 11. 返回成功结果
        return {
            "success": True,
            "message": f"紧急采购订单创建成功",
            "result": result
        }
        
    except Exception as e:
        return {"success": False, "error": f"创建紧急采购订单失败: {str(e)}"}

result = execute_emergency_purchase(parameters)
`,
      position: {
        x: 100,
        y: 2000
      }
    },
    {
      id: 'trace_impact_chain',
      name: 'TraceImpactChain',
      displayName: '追溯影响链路',
      description: '沿本体关系网络向下追溯影响链路，返回受影响的工单和客户订单列表',
      targetObjectType: null,
      action_type: 'function',
      operation: 'custom',
      target_model_id: null,
      target_link_id: null,
      parameters: [
        {
          name: 'start_node',
          type: 'string',
          required: true,
          description: '起始节点ID（如物料/供应商/风险ID）'
        },
        {
          name: 'depth',
          type: 'integer',
          required: true,
          description: '追溯深度层级'
        }
      ],
      submission_criteria: [],
      function_code: '# 影响链路追溯函数实现（省略）',
      position: {
        x: 380,
        y: 2000
      }
    },
    {
      id: 'check_inventory',
      name: 'CheckInventory',
      displayName: '查询物料库存',
      description: '查询指定物料的当前可用库存、预留库存和在途库存',
      targetObjectType: 'ot-sc-026',
      action_type: 'function',
      operation: 'custom',
      target_model_id: 'ot-sc-026',
      target_link_id: null,
      parameters: [
        {
          name: 'material_id',
          type: 'string',
          required: true,
          description: '物料唯一标识符'
        }
      ],
      submission_criteria: [],
      function_code: '# 库存查询函数实现（省略）',
      position: {
        x: 660,
        y: 2000
      }
    },
    {
      id: 'query_supplier',
      name: 'QuerySupplier',
      displayName: '查询物料供应商',
      description: '查询物料的可用供应商列表，以及紧急情况下的最短交期',
      targetObjectType: 'ot-sc-010',
      action_type: 'function',
      operation: 'custom',
      target_model_id: 'ot-sc-010',
      target_link_id: null,
      parameters: [
        {
          name: 'material_id',
          type: 'string',
          required: true,
          description: '物料唯一标识符'
        },
        {
          name: 'is_urgent',
          type: 'boolean',
          required: true,
          description: '是否紧急采购'
        }
      ],
      submission_criteria: [],
      function_code: '# 供应商查询函数实现（省略）',
      position: {
        x: 940,
        y: 2000
      }
    },
    {
      id: 'run_mip_scheduling',
      name: 'RunMIPScheduling',
      displayName: '运行MIP排程优化',
      description: '基于硬约束运行混合整数规划模型，返回全局最优排程调整方案',
      targetObjectType: 'ot-sc-035',
      action_type: 'function',
      operation: 'custom',
      target_model_id: 'ot-sc-035',
      target_link_id: null,
      parameters: [
        {
          name: 'constraints',
          type: 'object',
          required: true,
          description: '排程约束条件（物料齐套时间、机台产能等）'
        }
      ],
      submission_criteria: [],
      function_code: '# MIP排程优化函数实现（省略）',
      position: {
        x: 1220,
        y: 2000
      }
    },
    {
      id: 'create_purchase_order_emg',
      name: 'CreatePurchaseOrderEmergency',
      displayName: '新增紧急采购订单',
      description: '新增紧急采购记录，应对物料退回重检延期问题',
      targetObjectType: 'ot-sc-020',
      action_type: 'object',
      operation: 'create_object',
      target_model_id: 'ot-sc-020',
      target_link_id: null,
      parameters: [
        {
          name: 'po_id',
          type: 'string',
          required: true,
          description: '采购订单ID'
        },
        {
          name: 'supplier_id',
          type: 'string',
          required: true,
          description: '供应商ID'
        },
        {
          name: 'order_date',
          type: 'datetime',
          required: true,
          description: '下单日期'
        },
        {
          name: 'expected_delivery_date',
          type: 'datetime',
          required: true,
          description: '预计交期'
        },
        {
          name: 'status',
          type: 'string',
          required: true,
          is_enum: true,
          enum_values: [
            '已入库',
            '已创建'
          ],
          description: '订单状态'
        },
        {
          name: 'total_amount',
          type: 'float',
          required: false,
          description: '总金额'
        },
        {
          name: 'note',
          type: 'string',
          required: false,
          description: '备注'
        }
      ],
      submission_criteria: [],
      function_code: null,
      position: {
        x: 1500,
        y: 2000
      }
    },
    {
      id: 'create_po_line_emg',
      name: 'CreatePurchaseOrderLineEmergency',
      displayName: '新增紧急采购订单行',
      description: '新增紧急采购的物料明细，关联紧急采购单',
      targetObjectType: 'ot-sc-021',
      action_type: 'object',
      operation: 'create_object',
      target_model_id: 'ot-sc-021',
      target_link_id: null,
      parameters: [
        {
          name: 'line_id',
          type: 'string',
          required: true,
          description: '订单行ID'
        },
        {
          name: 'po_id',
          type: 'string',
          required: true,
          description: '采购订单ID'
        },
        {
          name: 'material_id',
          type: 'string',
          required: true,
          description: '物料ID'
        },
        {
          name: 'quantity',
          type: 'float',
          required: true,
          description: '采购数量'
        },
        {
          name: 'unit_price',
          type: 'float',
          required: false,
          description: '单价'
        },
        {
          name: 'status',
          type: 'string',
          required: true,
          is_enum: true,
          enum_values: [
            '待收货',
            '部分到货',
            '全部到货'
          ],
          description: '订单行状态'
        },
        {
          name: 'related_work_order_id',
          type: 'string',
          required: false,
          description: '关联工单ID'
        }
      ],
      submission_criteria: [],
      function_code: null,
      position: {
        x: 100,
        y: 2120
      }
    },
    {
      id: 'create_work_order_material_emg',
      name: 'CreateWorkOrderMaterialEmergency',
      displayName: '批量新增工单替代料需求',
      description: '批量为多个VIP工单新增替代料物料需求记录',
      targetObjectType: 'ot-sc-019',
      action_type: 'object',
      operation: 'create_object',
      target_model_id: 'ot-sc-019',
      target_link_id: null,
      parameters: [
        {
          name: 'wom_id',
          type: 'string',
          required: true,
          description: '需求ID'
        },
        {
          name: 'work_order_id',
          type: 'string',
          required: true,
          description: '工单ID'
        },
        {
          name: 'material_id',
          type: 'string',
          required: true,
          description: '物料ID'
        },
        {
          name: 'required_quantity',
          type: 'float',
          required: true,
          description: '需求量'
        },
        {
          name: 'required_date',
          type: 'datetime',
          required: true,
          description: '需求日期'
        },
        {
          name: 'status',
          type: 'string',
          required: true,
          description: '状态'
        },
        {
          name: 'note',
          type: 'string',
          required: false,
          description: '备注'
        }
      ],
      submission_criteria: [],
      function_code: null,
      position: {
        x: 380,
        y: 2120
      }
    },
    {
      id: 'update_inventory_emg',
      name: 'UpdateInventoryEmergency',
      displayName: '更新物料库存状态',
      description: '更新替代料库存，标记在途和预留数量',
      targetObjectType: 'ot-sc-026',
      action_type: 'object',
      operation: 'update_object',
      target_model_id: 'ot-sc-026',
      target_link_id: null,
      parameters: [
        {
          name: 'material_id',
          type: 'string',
          required: true,
          description: '物料ID'
        },
        {
          name: 'available_quantity',
          type: 'float',
          required: false,
          description: '可用库存'
        },
        {
          name: 'reserved_quantity',
          type: 'float',
          required: false,
          description: '预留库存'
        },
        {
          name: 'in_transit_quantity',
          type: 'float',
          required: false,
          description: '在途库存'
        },
        {
          name: 'last_updated',
          type: 'datetime',
          required: false,
          description: '最后更新时间'
        }
      ],
      submission_criteria: [],
      function_code: null,
      position: {
        x: 660,
        y: 2120
      }
    },
    {
      id: 'create_inventory_transaction_emg',
      name: 'CreateInventoryTransactionEmergency',
      displayName: '新增库存事务流水',
      description: '记录采购在途、工单预留的库存变动台账',
      targetObjectType: 'ot-sc-027',
      action_type: 'object',
      operation: 'create_object',
      target_model_id: 'ot-sc-027',
      target_link_id: null,
      parameters: [
        {
          name: 'transaction_id',
          type: 'string',
          required: true,
          description: '事务ID'
        },
        {
          name: 'material_id',
          type: 'string',
          required: true,
          description: '物料ID'
        },
        {
          name: 'transaction_type',
          type: 'string',
          required: true,
          description: '事务类型'
        },
        {
          name: 'quantity',
          type: 'float',
          required: true,
          description: '变动数量'
        },
        {
          name: 'related_document_id',
          type: 'string',
          required: false,
          description: '关联单据ID'
        },
        {
          name: 'transaction_time',
          type: 'datetime',
          required: true,
          description: '事务时间'
        }
      ],
      submission_criteria: [],
      function_code: null,
      position: {
        x: 940,
        y: 2120
      }
    },
    {
      id: 'batch_update_schedule_detail',
      name: 'BatchUpdateScheduleDetail',
      displayName: '批量更新排程明细',
      description: '统一批量调整多条排程明细，包含VIP工单顺延、级联产能冲突调整、低优先级工单让路调整，同步更新计划起止时间、执行状态与调整原因',
      targetObjectType: 'ot-sc-035',
      action_type: 'object',
      operation: 'update_object',
      target_model_id: 'ot-sc-035',
      target_link_id: null,
      parameters: [
        {
          name: 'detail_id_list',
          type: 'array',
          required: true,
          description: '待调整排程明细ID集合'
        },
        {
          name: 'schedule_adjust_list',
          type: 'array',
          required: true,
          description: '每条排程对应的计划开始、计划结束、状态、调整原因结构体数组'
        }
      ],
      submission_criteria: [],
      function_code: null,
      position: {
        x: 1220,
        y: 2120
      }
    },
    {
      id: 'update_schedule_summary',
      name: 'UpdateScheduleSummary',
      displayName: '更新排程汇总',
      description: '重算5月各工作中心/机台产能负荷率，刷新全局排程负荷快照',
      targetObjectType: 'ot-sc-030',
      action_type: 'object',
      operation: 'update_object',
      target_model_id: 'ot-sc-030',
      target_link_id: null,
      parameters: [
        {
          name: 'schedule_id',
          type: 'string',
          required: true,
          description: '排程ID'
        },
        {
          name: 'total_load_hours',
          type: 'float',
          required: false,
          description: '总负荷工时'
        },
        {
          name: 'utilization_rate',
          type: 'float',
          required: false,
          description: '设备利用率'
        },
        {
          name: 'bottleneck_machine_id',
          type: 'string',
          required: false,
          description: '瓶颈机台ID'
        }
      ],
      submission_criteria: [],
      function_code: null,
      position: {
        x: 1500,
        y: 2120
      }
    }
  ]
},
];

// ---------------------------------------------------------------------------
// Optimization Solver Models - 优化求解模型
// ---------------------------------------------------------------------------
export const optimizationModels = [
  {
    id: 'opt-001',
    name: '生产计划优化',
    description: '最大化产品A和产品B的生产利润，满足工时和原材料约束',
    problemType: 'LP',
    status: 'draft',
    ontologyId: 'ont-001',
    variables: [
      { id: 'v1', name: '产品A产量', source: 'ontology', ontologyRef: { ontologyId: 'ont-001', objectId: 'ot-003', fieldId: 'field-prod-002' }, type: 'continuous', lowerBound: 0, upperBound: null, description: '产品A的日产量' },
      { id: 'v2', name: '产品B产量', source: 'ontology', ontologyRef: { ontologyId: 'ont-001', objectId: 'ot-003', fieldId: 'field-prod-003' }, type: 'continuous', lowerBound: 0, upperBound: null, description: '产品B的日产量' },
      { id: 'v3', name: '预算上限', source: 'custom', type: 'continuous', lowerBound: 0, upperBound: 100000, description: '总预算限制' },
    ],
    objective: { sense: 'maximize', coefficients: { v1: 5, v2: 4 } },
    constraints: [
      { id: 'c1', name: '工时约束', description: '总工时不超过100小时', coefficients: { v1: 2, v2: 1 }, sense: '<=', rhs: 100 },
      { id: 'c2', name: '原材料约束', description: '总原材料不超过80kg', coefficients: { v1: 1, v2: 2 }, sense: '<=', rhs: 80 },
    ],
    solverConfig: { solver: 'ortools', timeLimit: 300, mipGap: 0.01, threads: 4 },
    createdAt: '2026-06-08 10:00',
    updatedAt: '2026-06-09 14:30',
    creator: '张工',
  },
  {
    id: 'opt-002',
    name: '库存补货优化',
    description: '最小化补货成本，满足安全库存约束',
    problemType: 'MIP',
    status: 'active',
    ontologyId: 'ont-001',
    variables: [
      { id: 'v1', name: '订单金额', source: 'ontology', ontologyRef: { ontologyId: 'ont-001', objectId: 'ot-002', fieldId: 'field-order-003' }, type: 'continuous', lowerBound: 0, upperBound: null, description: '单笔订单金额' },
      { id: 'v2', name: '补货数量', source: 'custom', type: 'integer', lowerBound: 0, upperBound: 1000, description: '每次补货批量' },
    ],
    objective: { sense: 'minimize', coefficients: { v1: 1, v2: 50 } },
    constraints: [
      { id: 'c1', name: '安全库存', description: '库存不低于安全线', coefficients: { v1: 0, v2: 1 }, sense: '>=', rhs: 100 },
      { id: 'c2', name: '仓储容量', description: '不超过仓储上限', coefficients: { v1: 0, v2: 1 }, sense: '<=', rhs: 500 },
    ],
    solverConfig: { solver: 'ortools', timeLimit: 600, mipGap: 0.005, threads: 8 },
    createdAt: '2026-06-05 09:00',
    updatedAt: '2026-06-10 11:20',
    creator: '李工',
  },
];
