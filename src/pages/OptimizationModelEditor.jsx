import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calculator, Sparkles, FileUp, X, ChevronRight, Eye, Database } from 'lucide-react';
import { api } from '../api/apiClient';
import VisualModelingPanel from '../components/VisualModelingPanel';
import MathPreviewPanel from '../components/MathPreviewPanel';
import SolveResultPanel from '../components/SolveResultPanel';
import AIAgentChat from '../components/AIAgentChat';
import OntologyModelMappingModal from '../components/OntologyModelMappingModal';
import DslViewPanel from '../components/DslViewPanel';
import PythonViewPanel from '../components/PythonViewPanel';
import { optimizationTestModels } from '../data/optimizationTestModels';

const MOCK_ONTOLOGIES = [
  {
    id: 'ont-supply-chain-control-tower',
    name: '供应链控制塔',
    description: '供应链全链路语义模型',
    object_types: [
      {
        id: 'obj-material',
        name: 'Material',
        display_name: '物料',
        description: '生产所需的原材料和辅料',
        properties: [
          { name: 'material_id', type: 'string', description: '物料ID' },
          { name: 'material_name', type: 'string', description: '物料名称' },
          { name: 'material_type', type: 'string', description: '物料类型' },
          { name: 'unit_price', type: 'number', description: '单价' },
          { name: 'stock_qty', type: 'number', description: '库存数量' },
          { name: 'supplier_id', type: 'string', description: '供应商ID' },
        ],
      },
      {
        id: 'obj-warehouse',
        name: 'Warehouse',
        display_name: '仓库',
        description: '仓储设施',
        properties: [
          { name: 'warehouse_id', type: 'string', description: '仓库ID' },
          { name: 'name', type: 'string', description: '仓库名称' },
          { name: 'capacity', type: 'number', description: '容量' },
          { name: 'location', type: 'string', description: '位置' },
        ],
      },
      {
        id: 'obj-supplier',
        name: 'Supplier',
        display_name: '供应商',
        description: '提供物料或服务的外部供应商',
        properties: [
          { name: 'supplier_id', type: 'string', description: '供应商ID' },
          { name: 'name', type: 'string', description: '供应商名称' },
          { name: 'location', type: 'string', description: '所在地' },
          { name: 'risk_level', type: 'string', description: '风险等级' },
        ],
      },
      {
        id: 'obj-product',
        name: 'Product',
        display_name: '产品',
        description: '生产的成品或半成品',
        properties: [
          { name: 'product_id', type: 'string', description: '产品ID' },
          { name: 'product_name', type: 'string', description: '产品名称' },
          { name: 'category', type: 'string', description: '产品类别' },
        ],
      },
      {
        id: 'obj-order',
        name: 'Order',
        display_name: '订单',
        description: '客户下达的采购订单',
        properties: [
          { name: 'order_id', type: 'string', description: '订单ID' },
          { name: 'order_no', type: 'string', description: '订单编号' },
          { name: 'amount', type: 'number', description: '订单金额' },
          { name: 'status', type: 'string', description: '订单状态' },
        ],
      },
      {
        id: 'obj-work-order',
        name: 'WorkOrder',
        display_name: '工单',
        description: '生产工单',
        properties: [
          { name: 'work_order_id', type: 'string', description: '工单ID' },
          { name: 'product_id', type: 'string', description: '产品ID' },
          { name: 'status', type: 'string', description: '工单状态' },
          { name: 'planned_quantity', type: 'number', description: '计划数量' },
        ],
      },
    ],
  },
];

const STATUS_BADGE = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-slate-100 text-slate-600',
  testing: 'bg-amber-100 text-amber-700',
  solved: 'bg-blue-100 text-blue-700',
};

const STATUS_LABEL = {
  active: '运行中',
  draft: '草稿',
  testing: '测试中',
  solved: '已求解',
};

const LP_KEYWORDS = ['min', 'max', 'minimize', 'maximize', 'st', 'subject', 'to', 'bounds', 'binary', 'bin', 'general', 'gen', 'end', 'obj', 'semi', 'free', 'inf', 'infinity'];

function parseLPVariables(text) {
  const regex = /(?:^|[\s+\-*])([a-zA-Z][a-zA-Z0-9_]*)/gm;
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const name = match[1].toLowerCase();
    if (!LP_KEYWORDS.includes(name) && !matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }
  return matches;
}

export default function OptimizationModelEditor() {
  const navigate = useNavigate();
  const { wsId, id } = useParams();

  const isNew = id === 'new';

  const [isFromMock, setIsFromMock] = useState(false);

  const [modelName, setModelName] = useState('新建优化模型');
  const [modelDescription, setModelDescription] = useState('');
  const [modelStatus, setModelStatus] = useState('draft');
  const [variables, setVariables] = useState([]);
  const [objectives, setObjectives] = useState([{ id: 'obj-1', name: '目标函数', sense: 'maximize', coefficients: {} }]);
  const [constraints, setConstraints] = useState([]);
  const [problemType, setProblemType] = useState('LP');

  // CP-SAT 专用状态
  const [intVars, setIntVars] = useState([]);
  const [boolVars, setBoolVars] = useState([]);
  const [intervalVars, setIntervalVars] = useState([]);
  const [cpLinearConstraints, setCpLinearConstraints] = useState([]);
  const [globalConstraints, setGlobalConstraints] = useState([]);
  const [cpsatObjective, setCpsatObjective] = useState({ sense: 'minimize', coefficients: {} });
  const [solverConfig, setSolverConfig] = useState({
    solvingStrategy: 'exact',
    timeLimitSeconds: 60,
    mipGap: 0.001,
    numWorkers: 4,
    searchStrategy: 'automatic',
    solutionCount: 1,
  });

  const [saving, setSaving] = useState(false);
  const [solving, setSolving] = useState(false);
  const [solveResult, setSolveResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [rawFileContent, setRawFileContent] = useState(null);
  const [rawFileFormat, setRawFileFormat] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [ontologies, setOntologies] = useState([]);

  const [showAIModal, setShowAIModal] = useState(false);
  const [showFileImportModal, setShowFileImportModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [activeView, setActiveView] = useState('visual'); // 'visual' | 'dsl' | 'python'
  const [orDsl, setOrDsl] = useState(null);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importContent, setImportContent] = useState('');
  const [importParsed, setImportParsed] = useState(null);

  useEffect(() => {
    api.get('/ontology/')
      .then(data => {
        const result = data || [];
        if (result.length === 0) {
          console.log('使用 Mock 本体数据');
          setOntologies(MOCK_ONTOLOGIES);
        } else {
          setOntologies(result);
        }
      })
      .catch(err => {
        console.error('加载本体数据失败，使用 Mock 数据:', err);
        setOntologies(MOCK_ONTOLOGIES);
      });
  }, []);

  // 监听本体-模型映射模态框关闭事件
  useEffect(() => {
    const handleClose = () => setShowMappingModal(false);
    window.addEventListener('close-mapping-modal', handleClose);
    return () => window.removeEventListener('close-mapping-modal', handleClose);
  }, []);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    
    const mockModel = optimizationTestModels.find(m => m.id === id);
    
    if (mockModel) {
      const data = {
        ...mockModel,
        problem_type: mockModel.problemType === 'IP' ? 'MIP' : mockModel.problemType,
        algorithm_config: {
          int_vars: mockModel.intVars,
          bool_vars: mockModel.boolVars,
          interval_vars: mockModel.intervalVars,
          linear_constraints: mockModel.linearConstraints,
          global_constraints: mockModel.globalConstraints,
          objective: mockModel.objective,
        },
      };
      handleModelData(data);
      setIsFromMock(true);
      setLoading(false);
      return;
    }
    
    api.get(`/optimization/${id}`)
      .then(data => {
        if (!data) { setNotFound(true); return; }
        handleModelData(data);
      })
      .catch(err => {
        console.error('加载模型失败:', err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function handleModelData(data) {
    setModelName(data.name || '');
    setModelDescription(data.description || '');
    setModelStatus(data.status || 'draft');
    setProblemType(data.problem_type || 'LP');
    
    if (data.problem_type === 'CP_SAT' && data.algorithm_config) {
      const ac = data.algorithm_config;
      if (ac.int_vars) setIntVars(ac.int_vars.map(v => ({ ...v, id: v.id || `iv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })));
      if (ac.bool_vars) setBoolVars(ac.bool_vars.map(v => ({ ...v, id: v.id || `bv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })));
      if (ac.interval_vars) setIntervalVars(ac.interval_vars.map(v => ({ ...v, id: v.id || `itv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })));
      if (ac.linear_constraints) setCpLinearConstraints(ac.linear_constraints.map(c => ({ ...c, id: c.id || `lc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })));
      if (ac.global_constraints) setGlobalConstraints(ac.global_constraints.map(c => ({ ...c, id: c.id || `gc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` })));
      if (ac.objective) setCpsatObjective(ac.objective);
    }
    if (data.solver_config) {
      setSolverConfig(prev => ({ ...prev, ...data.solver_config }));
    }
    
    setVariables((data.variables || []).map(v => ({
      id: v.id,
      name: v.name,
      nameEn: v.nameEn || v.name_en || '',
      type: v.type || 'continuous',
      lowerBound: v.lower_bound ?? 0,
      upperBound: v.upper_bound ?? null,
      ontologyRef: v.ontology_ref || v.ontologyRef,
      ontologyPath: v.ontology_path || v.ontologyPath,
      nature: v.nature || '',
      dimension: v.dimension || '',
      domain: v.domain || '',
      businessMeaning: v.business_meaning || v.businessMeaning || '',
      unit: v.unit || '',
      indices: v.indices || [],
      indexMapping: v.indexMapping || v.index_mapping || [],
      associatedProperties: v.associatedProperties || v.associated_properties || [],
    })));
    if (data.objectives && data.objectives.length > 0) {
      setObjectives(data.objectives.map((o, i) => ({
        id: o.id || `obj-${i + 1}`,
        name: o.name || `目标函数${i + 1}`,
        sense: o.sense || 'maximize',
        coefficients: o.coefficients || parseExpressionToCoefficients(o.expression || '', data.variables || []),
      })));
    } else if (data.objective) {
      setObjectives([{
        id: 'obj-1',
        name: '目标函数',
        sense: data.objective.sense || 'maximize',
        coefficients: data.objective.coefficients || parseExpressionToCoefficients(data.objective.expression || '', data.variables || []),
      }]);
    }
    setConstraints((data.constraints || []).map(c => ({
      id: c.id,
      name: c.name,
      coefficients: c.coefficients || parseExpressionToCoefficients(c.expression || '', data.variables || []),
      sense: c.sense,
      rhs: c.rhs,
    })));
  }

  function parseExpressionToCoefficients(expression, vars) {
    const coeffs = {};
    const varNameToId = {};
    vars.forEach(v => { varNameToId[v.name] = v.id; });

    if (!expression) return coeffs;

    const normalized = expression.replace(/\s+/g, '');
    const terms = normalized.match(/[+-]?[^+-]+/g) || [];

    terms.forEach(term => {
      if (!term) return;
      let coeff = 1;
      let varName = term;
      if (term.includes('*')) {
        const parts = term.split('*');
        coeff = parseFloat(parts[0]);
        varName = parts[1];
      } else {
        if (term.startsWith('-')) {
          coeff = -1;
          varName = term.slice(1);
        } else if (term.startsWith('+')) {
          coeff = 1;
          varName = term.slice(1);
        }
      }
      const varId = varNameToId[varName] || varName;
      coeffs[varId] = coeff;
    });
    return coeffs;
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-slate-500 mb-3">未找到该优化模型</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium"
            onClick={() => navigate(`/w/${wsId}/optimization`)}
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-400">
          <Calculator size={28} className="animate-pulse mx-auto" />
          <p className="mt-3">加载模型中...</p>
        </div>
      </div>
    );
  }

  const handleModelGenerated = ({ variables: newVars, objective: newObj, objectives: newObjs, constraints: newCons, problemType: newType, rawContent, rawFormat, orDsl: generatedOrDsl }) => {
    setVariables(newVars);
    if (newObjs && newObjs.length > 0) {
      setObjectives(newObjs);
    } else if (newObj) {
      setObjectives([{ id: 'obj-1', name: '目标函数', sense: newObj.sense || 'maximize', coefficients: newObj.coefficients || {} }]);
    }
    setConstraints(newCons);
    if (newType) setProblemType(newType);
    if (generatedOrDsl) setOrDsl(generatedOrDsl);
    if (rawContent) {
      setRawFileContent(rawContent);
      setRawFileFormat(rawFormat || 'lp');
    }
    setShowAIModal(false);
    setShowFileImportModal(false);
    setImportParsed(null);
    // 如果生成了 OR-DSL，自动切换到 DSL 视图展示
    if (generatedOrDsl) {
      setActiveView('dsl');
    }
  };

  const buildExpression = (coefficients, vars) => {
    const parts = [];
    const varMap = {};
    vars.forEach(v => { varMap[v.id] = v.name; });

    for (const [varId, coeff] of Object.entries(coefficients)) {
      if (coeff === 0 || coeff === null || coeff === undefined || coeff === '') continue;
      const name = varMap[varId] || varId;
      // 支持 "$变量名" 形式的系数占位符
      if (typeof coeff === 'string') {
        if (coeff.startsWith('$')) {
          parts.push(`${coeff}*${name}`);
        }
        continue;
      }
      if (coeff === 1) parts.push(name);
      else if (coeff === -1) parts.push(`-${name}`);
      else {
        const absCoeff = Math.abs(coeff);
        const sign = coeff > 0 ? '' : '-';
        parts.push(`${sign}${absCoeff}*${name}`);
      }
    }
    return parts.join(' + ').replace(/\+ -/g, '- ');
  };

  const handleSave = async () => {
    // LP/MIP 必填校验：中文名称 + 英文名称
    if (problemType !== 'CP_SAT') {
      const missingName = variables.find(v => !v.name?.trim());
      const missingNameEn = variables.find(v => !v.nameEn?.trim());
      if (missingName || missingNameEn) {
        const msgs = [];
        if (missingName) msgs.push('存在变量缺少中文名称');
        if (missingNameEn) msgs.push('存在变量缺少英文名称');
        alert(`必填校验未通过: ${msgs.join('、')}`);
        return;
      }
    }

    setSaving(true);
    try {
      const saveProblemType = problemType === 'IP' ? 'MIP' : problemType;
      const modelData = {
        name: modelName,
        description: modelDescription,
        problem_type: saveProblemType,
        status: modelStatus,
      };

      if (problemType === 'CP_SAT') {
        modelData.algorithm_config = {
          int_vars: intVars,
          bool_vars: boolVars,
          interval_vars: intervalVars,
          linear_constraints: cpLinearConstraints,
          global_constraints: globalConstraints,
          objective: cpsatObjective,
        };
        modelData.solver_config = solverConfig;
        // CP-SAT 模型也保留 variables/objectives/constraints 字段（可能为空）
        modelData.objectives = [];
        modelData.variables = [];
        modelData.constraints = [];
      } else {
        modelData.objectives = objectives.map(o => ({
          id: o.id,
          name: o.name,
          sense: o.sense,
          expression: buildExpression(o.coefficients, variables),
        }));
        modelData.variables = variables.map(v => ({
          id: v.id,
          name: v.name,
          nameEn: v.nameEn || '',
          type: v.type || 'continuous',
          lower_bound: v.lowerBound ?? 0,
          upper_bound: v.upperBound ?? null,
          nature: v.nature || '',
          dimension: v.dimension || '',
          domain: v.domain || '',
          businessMeaning: v.businessMeaning || '',
          unit: v.unit || '',
          ontologyRef: v.ontologyRef || '',
          ontologyPath: v.ontologyPath || '',
          indices: v.indices || [],
          indexMapping: v.indexMapping || [],
          associatedProperties: v.associatedProperties || [],
        }));
        modelData.constraints = constraints.map(c => ({
          id: c.id,
          name: c.name,
          expression: buildExpression(c.coefficients, variables),
          sense: c.sense,
          rhs: c.rhs,
        }));
        modelData.solver_config = solverConfig;
      }

      if (isNew) {
        const created = await api.post('/optimization/', modelData);
        navigate(`/w/${wsId}/optimization/${created.id}`);
      } else {
        await api.put(`/optimization/${id}`, modelData);
        setModelStatus('draft');
      }
    } catch (err) {
      console.error('保存模型失败:', err);
      alert('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSolve = async () => {
    // CP-SAT 模型校验
    if (problemType === 'CP_SAT') {
      const hasIntOrBoolVars = intVars.length > 0 || boolVars.length > 0;
      if (!hasIntOrBoolVars) {
        alert('CP-SAT 模型至少需要定义一个整数或布尔变量');
        return;
      }
    } else {
      const hasVars = variables.length > 0;
      const hasObjCoeffs = objectives.some(o => o.coefficients && Object.values(o.coefficients).some(c => c !== 0));
      const hasConstraints = constraints.length > 0;
      const missingName = variables.find(v => !v.name?.trim());
      const missingNameEn = variables.find(v => !v.nameEn?.trim());

      if (!hasVars || !hasObjCoeffs || !hasConstraints || missingName || missingNameEn) {
        const msgs = [];
        if (!hasVars) msgs.push('缺少决策变量');
        if (!hasObjCoeffs) msgs.push('目标函数未定义');
        if (!hasConstraints) msgs.push('缺少约束条件');
        if (missingName) msgs.push('变量缺少中文名称');
        if (missingNameEn) msgs.push('变量缺少英文名称');
        alert(`模型不完整: ${msgs.join('、')}`);
        return;
      }
    }

    setSolving(true);

    try {
      if (rawFileContent) {
        const result = await api.post('/optimization/solve-lp', {
          content: rawFileContent,
          format: 'lp',
        });
        result.variables = variables;
        result.objectives = objectives;
        result.constraints = constraints;
        setSolveResult(result);
        setShowResult(true);
      } else {
        let modelDef;
        const normalizedProblemType = problemType === 'IP' ? 'MIP' : problemType;
        if (problemType === 'CP_SAT') {
          modelDef = {
            name: modelName,
            description: modelDescription,
            problem_type: 'CP_SAT',
            status: 'draft',
            variables: [],
            objectives: [],
            constraints: [],
            algorithm_config: {
              int_vars: intVars,
              bool_vars: boolVars,
              interval_vars: intervalVars,
              linear_constraints: cpLinearConstraints,
              global_constraints: globalConstraints,
              objective: cpsatObjective,
            },
            solver_config: solverConfig,
          };
        } else {
          const primaryObj = objectives[0] || { sense: 'maximize', coefficients: {} };
          modelDef = {
            name: modelName,
            description: modelDescription,
            problem_type: normalizedProblemType,
            status: 'draft',
            objective: {
              sense: primaryObj.sense,
              expression: buildExpression(primaryObj.coefficients, variables),
            },
            variables: variables.map(v => ({
              id: v.id,
              name: v.name,
              type: v.type || 'continuous',
              lower_bound: v.lowerBound ?? 0,
              upper_bound: v.upperBound ?? null,
            })),
            constraints: constraints.map(c => ({
              id: c.id,
              name: c.name,
              expression: buildExpression(c.coefficients, variables),
              sense: c.sense,
              rhs: c.rhs,
            })),
            solver_config: solverConfig,
          };
        }

        const savedModel = isNew || isFromMock
          ? await api.post('/optimization/', modelDef)
          : await api.put(`/optimization/${id}`, modelDef);

        const result = await api.post(`/optimization/${savedModel.id}/solve`);

        result.variables = variables;
        result.objectives = objectives;
        result.constraints = constraints;
        setSolveResult(result);
        setShowResult(true);
      }
    } catch (error) {
      console.error('Failed to solve model:', error);
      const errMsg = typeof error?.message === 'string' ? error.message
        : typeof error === 'string' ? error
        : JSON.stringify(error?.responseData || error?.detail || error || '未知错误');
      alert('求解失败: ' + errMsg);
    } finally {
      setSolving(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    const ext = droppedFile.name.split('.').pop().toLowerCase();
    if (!['lp'].includes(ext)) return;
    processFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFile = (selectedFile) => {
    setImportFile({
      name: selectedFile.name,
      size: selectedFile.size,
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      setImportContent(content);

      const ext = selectedFile.name.split('.').pop().toLowerCase();

      try {
        // Use backend API for authoritative parsing
        const result = await api.post('/optimization/parse-file', {
          content,
          file_format: ext,
        });
        if (result) {
          setImportParsed(result);
        }
      } catch (err) {
        console.warn('后端解析失败，降级到客户端解析:', err.message);
        // Fallback to client-side parsing (LP only)
        let result = null;
        if (ext === 'lp') {
          const vars = parseLPVariables(content);
          result = {
            name: selectedFile.name.replace('.lp', ''),
            objectiveSense: 'minimize',
            variables: vars.map(name => ({
              name, isInteger: false, lowerBound: 0, upperBound: null,
            })),
            objective: { sense: 'minimize', coefficients: {} },
            constraints: [],
            bounds: {},
          };
        }
        if (result) setImportParsed(result);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleRemoveFile = () => {
    setImportFile(null);
    setImportContent('');
    setImportParsed(null);
  };

  const handleApplyFile = async () => {
    if (!importParsed || !importParsed.variables.length) return;

    const autoMappedVariables = importParsed.variables.map((varData, idx) => ({
      id: `v-file-${idx + 1}`,
      name: varData.name,
      nameEn: varData.name,
      source: 'custom',
      type: varData.isInteger ? 'integer' : varData.isBinary ? 'binary' : 'continuous',
      lowerBound: varData.lowerBound ?? 0,
      upperBound: varData.upperBound ?? null,
    }));

    const varIdMap = {};
    autoMappedVariables.forEach(v => { varIdMap[v.name] = v.id; });

    const autoMappedConstraints = (importParsed.constraints || []).map((c, idx) => {
      const coefficients = {};
      for (const [varName, coeff] of Object.entries(c.coefficients || {})) {
        const varId = varIdMap[varName];
        if (varId) coefficients[varId] = coeff;
      }
      return {
        id: `c-file-${idx + 1}`,
        name: c.name,
        coefficients,
        sense: c.sense,
        rhs: c.rhs,
      };
    });

    const autoObjCoefficients = {};
    for (const [varName, coeff] of Object.entries(importParsed.objective?.coefficients || {})) {
      const varId = varIdMap[varName];
      if (varId) autoObjCoefficients[varId] = coeff;
    }

    const modelData = {
      problemType: importParsed.variables.some(v => v.isInteger || v.isBinary) ? 'MIP' : 'LP',
      variables: autoMappedVariables,
      objectives: [{
        id: 'obj-1',
        name: '目标函数',
        sense: importParsed.objective?.sense || importParsed.objectiveSense || 'minimize',
        coefficients: autoObjCoefficients,
      }],
      constraints: autoMappedConstraints,
      rawContent: importContent,
      rawFormat: importFile.name.split('.').pop().toLowerCase(),
    };

    handleModelGenerated(modelData);

    // Async: generate DSL and Python code for view panels
    try {
      const modelDef = {
        name: importParsed.name || importFile.name,
        problem_type: modelData.problemType === 'IP' ? 'MIP' : modelData.problemType,
        variables: importParsed.variables.map(v => ({
          id: varIdMap[v.name], name: v.name,
          type: v.isInteger ? 'integer' : v.isBinary ? 'binary' : 'continuous',
          lower_bound: v.lowerBound ?? 0, upper_bound: v.upperBound ?? null,
        })),
        objective: {
          sense: importParsed.objective?.sense || 'minimize',
          expression: Object.entries(importParsed.objective?.coefficients || {})
            .filter(([, c]) => c !== 0)
            .map(([name, c]) => c === 1 ? name : c === -1 ? `-${name}` : `${c}*${name}`)
            .join(' + ').replace(/\+ -/g, '- ') || '0',
        },
        constraints: (importParsed.constraints || []).map(c => ({
          id: c.name, name: c.name,
          expression: Object.entries(c.coefficients || {})
            .filter(([, coeff]) => coeff !== 0)
            .map(([name, coeff]) => coeff === 1 ? name : coeff === -1 ? `-${name}` : `${coeff}*${name}`)
            .join(' + ').replace(/\+ -/g, '- ') || '0',
          sense: c.sense, rhs: c.rhs,
        })),
      };
      // Fire and forget - generate DSL + Python in background
      api.post('/optimization/generate-dsl', modelDef).catch(() => {});
      api.post('/optimization/generate-python', modelDef).catch(() => {});
    } catch {}
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 86px)' }}>
      <div className="h-[52px] min-h-[52px] bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            className="text-slate-500 hover:text-slate-700 p-1"
            onClick={() => navigate(`/w/${wsId}/optimization`)}
          >
            <ArrowLeft size={16} />
          </button>
          {isNew ? (
            <input
              className="text-base font-semibold text-slate-700 border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none bg-transparent"
              value={modelName}
              onChange={e => setModelName(e.target.value)}
              placeholder="模型名称"
            />
          ) : (
            <h1 className="text-base font-semibold text-slate-700">{modelName}</h1>
          )}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[modelStatus] || STATUS_BADGE.draft}`}>
            {STATUS_LABEL[modelStatus] || modelStatus}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700">
            {problemType}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="border border-purple-300 hover:bg-purple-50 text-purple-600 rounded-md px-3 py-1.5 text-sm flex items-center gap-1.5"
            onClick={() => setShowMappingModal(true)}
          >
            <Database size={14} />
            本体-模型映射
          </button>
          <button
            className="border border-blue-300 hover:bg-blue-50 text-blue-600 rounded-md px-3 py-1.5 text-sm flex items-center gap-1.5"
            onClick={() => setShowAIModal(true)}
          >
            <Sparkles size={14} />
            AI辅助建模
          </button>
          <button
            className="border border-blue-300 hover:bg-blue-50 text-blue-600 rounded-md px-3 py-1.5 text-sm flex items-center gap-1.5"
            onClick={() => setShowFileImportModal(true)}
          >
            <FileUp size={14} />
            文件导入
          </button>
          {/* View Switcher */}
          <div className="relative">
            <button
              className="border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-md px-3 py-1.5 text-sm flex items-center gap-1.5"
              onClick={() => setShowViewDropdown(v => !v)}
            >
              <Eye size={14} />
              {activeView === 'visual' ? '可视化' : activeView === 'dsl' ? 'DSL' : 'Python'}
              <ChevronRight size={12} className={`transition-transform ${showViewDropdown ? 'rotate-90' : ''}`} />
            </button>
            {showViewDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-36 py-1">
                {[
                  { key: 'visual', label: '可视化视图' },
                  { key: 'dsl', label: 'DSL 视图' },
                  { key: 'python', label: 'Python 视图' },
                ].map(v => (
                  <button
                    key={v.key}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${activeView === v.key ? 'text-blue-600 font-medium bg-blue-50' : 'text-slate-700'}`}
                    onClick={() => { setActiveView(v.key); setShowViewDropdown(false); }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="border border-blue-300 hover:bg-blue-50 text-blue-600 rounded-md px-3 py-1.5 text-sm flex items-center gap-1.5"
            onClick={handleSolve}
            disabled={solving}
          >
            <Calculator size={14} />
            {solving ? '求解中...' : '求解'}
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-1.5 text-sm font-medium flex items-center gap-1.5"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={14} />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 w-full">
        {/* 可视化视图 - 始终挂载，通过 CSS 显示/隐藏 */}
        <div className={`flex flex-1 min-h-0 w-full ${activeView === 'visual' ? '' : 'hidden'}`}>
          <div className="flex-1 overflow-y-auto w-full min-w-0">
            <VisualModelingPanel
              variables={variables}
              setVariables={setVariables}
              objectives={objectives}
              setObjectives={setObjectives}
              constraints={constraints}
              setConstraints={setConstraints}
              problemType={problemType}
              setProblemType={setProblemType}
              ontologies={ontologies}
              // CP-SAT props
              intVars={intVars}
              setIntVars={setIntVars}
              boolVars={boolVars}
              setBoolVars={setBoolVars}
              intervalVars={intervalVars}
              setIntervalVars={setIntervalVars}
              cpLinearConstraints={cpLinearConstraints}
              setCpLinearConstraints={setCpLinearConstraints}
              globalConstraints={globalConstraints}
              setGlobalConstraints={setGlobalConstraints}
              cpsatObjective={cpsatObjective}
              setCpsatObjective={setCpsatObjective}
              solverConfig={solverConfig}
              setSolverConfig={setSolverConfig}
            />
          </div>
          <div className="w-[380px] border-l border-slate-200 overflow-y-auto bg-slate-50 flex-shrink-0">
            <MathPreviewPanel
              variables={variables}
              objectives={objectives}
              constraints={constraints}
              problemType={problemType}
            />
          </div>
        </div>
        {/* DSL 视图 - 始终挂载，通过 CSS 显示/隐藏，保持实时同步 */}
        <div className={`flex-1 min-h-0 ${activeView === 'dsl' ? '' : 'hidden'}`}>
          <DslViewPanel
            variables={variables}
            objectives={objectives}
            constraints={constraints}
            problemType={problemType}
            modelName={modelName}
            orDsl={orDsl}
          />
        </div>
        {/* Python 视图 - 始终挂载，通过 CSS 显示/隐藏，保持实时同步 */}
        <div className={`flex-1 min-h-0 ${activeView === 'python' ? '' : 'hidden'}`}>
          <PythonViewPanel
            variables={variables}
            objectives={objectives}
            constraints={constraints}
            problemType={problemType}
            modelName={modelName}
          />
        </div>
      </div>

      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 z-50" style={{ height: '100vh' }}>
          <div className="absolute inset-3 bg-white rounded-lg shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 1.5rem)', minWidth: '90vw' }}>
            <AIAgentChat
              onModelConfirmed={handleModelGenerated}
              onClose={() => setShowAIModal(false)}
            />
          </div>
        </div>
      )}

      {showFileImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <FileUp size={18} className="text-blue-500" />
                文件导入
              </h2>
              <button
                className="text-slate-400 hover:text-slate-600 p-1"
                onClick={() => {
                  setShowFileImportModal(false);
                  setImportFile(null);
                  setImportContent('');
                  setImportParsed(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {!importFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <FileUp size={32} className="mx-auto text-slate-400 mb-3" />
                  <p className="text-sm font-medium text-slate-700 mb-1">点击或拖拽上传文件</p>
                  <p className="text-xs text-slate-400">支持格式：.lp</p>
                  <input
                    id="file-input"
                    type="file"
                    accept=".lp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileUp size={20} className="text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{importFile.name}</p>
                        <p className="text-xs text-slate-400">{(importFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      className="text-slate-400 hover:text-slate-600"
                      onClick={handleRemoveFile}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {importParsed && (
                    <>
                      <div className="border border-slate-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-slate-700 mb-3">解析结果摘要</h3>
                        <div className="flex gap-4 text-sm">
                          <span className="text-slate-500">模型名称:</span>
                          <span className="text-slate-700">{importParsed.name || '未命名'}</span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-slate-500">目标方向:</span>
                          <span className="text-slate-700">{importParsed.objectiveSense}</span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-slate-500">变量数:</span>
                          <span className="text-slate-700">{importParsed.variables.length}</span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-slate-500">约束数:</span>
                          <span className="text-slate-700">{importParsed.constraints.length}</span>
                        </div>
                      </div>

                      {importParsed.variables.length > 0 && (
                        <div className="border border-slate-200 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-slate-700 mb-3">变量列表</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-50">
                                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">变量名</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">类型</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">下界</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">上界</th>
                                </tr>
                              </thead>
                              <tbody>
                                {importParsed.variables.map((v, idx) => (
                                  <tr key={idx} className="border-t border-slate-100">
                                    <td className="px-3 py-2 font-mono text-slate-700">{v.name}</td>
                                    <td className="px-3 py-2">
                                      <span className={`px-2 py-0.5 rounded text-xs ${v.isInteger ? 'bg-orange-100 text-orange-700' : 'bg-sky-100 text-sky-700'}`}>
                                        {v.isInteger ? 'integer' : 'continuous'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-slate-700">{v.lowerBound ?? 0}</td>
                                    <td className="px-3 py-2 text-slate-700">{v.upperBound ?? '∞'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {importParsed.objective && Object.keys(importParsed.objective.coefficients).length > 0 && (
                        <div className="border border-slate-200 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-slate-700 mb-3">目标函数</h3>
                          <code className="text-sm font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                            {importParsed.objective.sense === 'maximize' ? 'max' : 'min'} z ={' '}
                            {Object.entries(importParsed.objective.coefficients)
                              .map(([varName, coeff]) => {
                                if (coeff === 1) return varName;
                                if (coeff === -1) return `-${varName}`;
                                return `${coeff}*${varName}`;
                              })
                              .join(' + ')}
                          </code>
                        </div>
                      )}

                      {importParsed.constraints && importParsed.constraints.length > 0 && (
                        <div className="border border-slate-200 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-slate-700 mb-3">约束条件</h3>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {importParsed.constraints.map((c, idx) => (
                              <div key={idx} className="text-sm">
                                <code className="font-mono text-slate-700">
                                  {c.name}: {' '}
                                  {Object.entries(c.coefficients)
                                    .map(([varName, coeff]) => {
                                      if (coeff === 1) return varName;
                                      if (coeff === -1) return `-${varName}`;
                                      return `${coeff}*${varName}`;
                                    })
                                    .join(' + ')}
                                  {' '}{c.sense}{' '}{c.rhs}
                                </code>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2.5 text-sm font-medium"
                        onClick={handleApplyFile}
                      >
                        应用到模型
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showMappingModal && (
        <OntologyModelMappingModal />
      )}

      {showResult && (
        <SolveResultPanel
          result={solveResult}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  );
}