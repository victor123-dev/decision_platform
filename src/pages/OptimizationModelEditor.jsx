import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calculator, Sparkles, FileUp, X, ChevronRight } from 'lucide-react';
import { api } from '../api/apiClient';
import VisualModelingPanel from '../components/VisualModelingPanel';
import MathPreviewPanel from '../components/MathPreviewPanel';
import SolveResultPanel from '../components/SolveResultPanel';
import AIAgentChat from '../components/AIAgentChat';

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

function parseMPSFile(text) {
  const result = {
    name: '',
    objectiveSense: 'minimize',
    variables: [],
    objective: { sense: 'minimize', coefficients: {} },
    constraints: [],
    bounds: {},
  };

  const lines = text.split('\n');
  let currentSection = '';
  
  const rows = {};
  const columns = {};
  const rhsValues = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('NAME')) {
      currentSection = 'NAME';
      result.name = line.substring(4).trim().replace(/['"]/g, '');
    }
    
    if (line.startsWith('OBJSENSE')) {
      currentSection = 'OBJSENSE';
    }
    
    if (line.startsWith('ROWS')) {
      currentSection = 'ROWS';
    }
    
    if (line.startsWith('COLUMNS')) {
      currentSection = 'COLUMNS';
    }
    
    if (line.startsWith('RHS') || line.trim().startsWith('RHS')) {
      currentSection = 'RHS';
    }
    
    if (line.startsWith('BOUNDS') || line.trim().startsWith('BOUNDS')) {
      currentSection = 'BOUNDS';
    }
    
    if (line.startsWith('ENDATA') || line.startsWith('END')) {
      break;
    }

    switch (currentSection) {
      case 'OBJSENSE':
        if (line === 'MIN') {
          result.objectiveSense = 'minimize';
          result.objective.sense = 'minimize';
        } else if (line === 'MAX') {
          result.objectiveSense = 'maximize';
          result.objective.sense = 'maximize';
        }
        break;

      case 'ROWS': {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const rowType = parts[0];
          const rowName = parts[1].replace(/['"]/g, '');
          rows[rowName] = { type: rowType, rhs: 0 };
        }
        break;
      }

      case 'COLUMNS': {
        if (line.includes("'MARKER'")) continue;
        
        const parts = line.split(/\s+/).filter(p => p && !p.startsWith("'"));
        if (parts.length >= 3) {
          const colName = parts[0];
          const rowName1 = parts[1];
          const value1 = parseFloat(parts[2]);
          
          if (!columns[colName]) {
            columns[colName] = { coefficients: {}, isInteger: false };
          }
          
          columns[colName].coefficients[rowName1] = (columns[colName].coefficients[rowName1] || 0) + value1;
          
          if (parts.length >= 5) {
            const rowName2 = parts[3];
            const value2 = parseFloat(parts[4]);
            columns[colName].coefficients[rowName2] = (columns[colName].coefficients[rowName2] || 0) + value2;
          }
        }
        break;
      }

      case 'RHS': {
        const parts = line.split(/\s+/).filter(p => p && !p.startsWith("'"));
        if (parts.length >= 3) {
          const rowName = parts[1];
          const value = parseFloat(parts[2]);
          rhsValues[rowName] = (rhsValues[rowName] || 0) + value;
          
          if (parts.length >= 5) {
            const rowName2 = parts[3];
            const value2 = parseFloat(parts[4]);
            rhsValues[rowName2] = (rhsValues[rowName2] || 0) + value2;
          }
        }
        break;
      }

      case 'BOUNDS': {
        const parts = line.split(/\s+/).filter(p => p && !p.startsWith("'"));
        if (parts.length >= 3) {
          const boundType = parts[0];
          const varName = parts[2];
          const value = parts.length >= 4 ? parseFloat(parts[3]) : null;
          
          if (!result.bounds[varName]) {
            result.bounds[varName] = {};
          }
          
          switch (boundType) {
            case 'BV':
              result.bounds[varName].type = 'binary';
              result.bounds[varName].lower = 0;
              result.bounds[varName].upper = 1;
              if (columns[varName]) {
                columns[varName].isInteger = true;
              }
              break;
            case 'LI':
              result.bounds[varName].lower = -Infinity;
              break;
            case 'UI':
              result.bounds[varName].upper = Infinity;
              break;
            case 'LO':
              result.bounds[varName].lower = value;
              break;
            case 'UP':
              result.bounds[varName].upper = value;
              break;
            case 'FX':
              result.bounds[varName].lower = value;
              result.bounds[varName].upper = value;
              break;
            case 'FR':
              result.bounds[varName].lower = -Infinity;
              result.bounds[varName].upper = Infinity;
              break;
            case 'MI':
              result.bounds[varName].lower = -Infinity;
              break;
            case 'PL':
              result.bounds[varName].upper = Infinity;
              break;
          }
        }
        break;
      }
    }
  }

  result.variables = Object.keys(columns).map(name => {
    const bounds = result.bounds[name] || {};
    return {
      name,
      isInteger: columns[name].isInteger,
      lowerBound: bounds.lower !== undefined ? (bounds.lower === -Infinity ? null : bounds.lower) : 0,
      upperBound: bounds.upper !== undefined ? (bounds.upper === Infinity ? null : bounds.upper) : null,
    };
  });

  for (const [colName, colData] of Object.entries(columns)) {
    for (const [rowName, coeff] of Object.entries(colData.coefficients)) {
      if (rows[rowName]?.type === 'N') {
        result.objective.coefficients[colName] = (result.objective.coefficients[colName] || 0) + coeff;
      }
    }
  }

  for (const [rowName, rowData] of Object.entries(rows)) {
    if (rowData.type === 'N') continue;
    
    const constraint = {
      name: rowName,
      coefficients: {},
      sense: rowData.type === 'L' ? '<=' : (rowData.type === 'G' ? '>=' : '=='),
      rhs: rhsValues[rowName] || 0,
    };
    
    for (const [colName, colData] of Object.entries(columns)) {
      if (colData.coefficients[rowName]) {
        constraint.coefficients[colName] = colData.coefficients[rowName];
      }
    }
    
    result.constraints.push(constraint);
  }

  return result;
}

function buildObjectiveExpression(objective, variables) {
  const parts = [];
  const varMap = {};
  variables.forEach(v => { varMap[v.id] = v.name; });
  for (const [varId, coeff] of Object.entries(objective.coefficients)) {
    const name = varMap[varId] || varId;
    if (coeff === 0) continue;
    if (coeff === 1) parts.push(name);
    else if (coeff === -1) parts.push(`-${name}`);
    else {
      const absCoeff = Math.abs(coeff);
      const sign = coeff > 0 ? '' : '-';
      parts.push(`${sign}${absCoeff}*${name}`);
    }
  }
  return parts.join(' + ').replace(/\+ -/g, '- ');
}

export default function OptimizationModelEditor() {
  const navigate = useNavigate();
  const { wsId, id } = useParams();

  const isNew = id === 'new';

  const [modelName, setModelName] = useState('新建优化模型');
  const [modelDescription, setModelDescription] = useState('');
  const [modelStatus, setModelStatus] = useState('draft');
  const [variables, setVariables] = useState([]);
  const [objective, setObjective] = useState({ sense: 'maximize', coefficients: {} });
  const [constraints, setConstraints] = useState([]);
  const [problemType, setProblemType] = useState('LP');
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
  const [importFile, setImportFile] = useState(null);
  const [importContent, setImportContent] = useState('');
  const [importParsed, setImportParsed] = useState(null);

  useEffect(() => {
    api.get('/ontology/')
      .then(data => setOntologies(data || []))
      .catch(err => console.error('加载本体数据失败:', err));
  }, []);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    api.get(`/optimization/${id}`)
      .then(data => {
        if (!data) { setNotFound(true); return; }
        setModelName(data.name || '');
        setModelDescription(data.description || '');
        setModelStatus(data.status || 'draft');
        setProblemType(data.problem_type || 'LP');
        setVariables((data.variables || []).map(v => ({
          id: v.id,
          name: v.name,
          type: v.type || 'continuous',
          lowerBound: v.lower_bound ?? 0,
          upperBound: v.upper_bound ?? null,
        })));
        if (data.objective) {
          setObjective({
            sense: data.objective.sense || 'maximize',
            coefficients: parseExpressionToCoefficients(data.objective.expression || '', data.variables || []),
          });
        }
        setConstraints((data.constraints || []).map(c => ({
          id: c.id,
          name: c.name,
          coefficients: parseExpressionToCoefficients(c.expression || '', data.variables || []),
          sense: c.sense,
          rhs: c.rhs,
        })));
      })
      .catch(err => {
        console.error('加载模型失败:', err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

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

  const handleModelGenerated = ({ variables: newVars, objective: newObj, constraints: newCons, problemType: newType, rawContent, rawFormat }) => {
    setVariables(newVars);
    setObjective(newObj);
    setConstraints(newCons);
    if (newType) setProblemType(newType);
    if (rawContent) {
      setRawFileContent(rawContent);
      setRawFileFormat(rawFormat || 'mps');
    }
    setShowAIModal(false);
    setShowFileImportModal(false);
    setImportParsed(null);
  };

  const buildExpression = (coefficients, vars) => {
    const parts = [];
    const varMap = {};
    vars.forEach(v => { varMap[v.id] = v.name; });

    for (const [varId, coeff] of Object.entries(coefficients)) {
      if (coeff === 0) continue;
      const name = varMap[varId] || varId;
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
    setSaving(true);
    try {
      const modelData = {
        name: modelName,
        description: modelDescription,
        problem_type: problemType,
        status: modelStatus,
        objective: {
          sense: objective.sense,
          expression: buildExpression(objective.coefficients, variables),
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
      };

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
    const hasVars = variables.length > 0;
    const hasObjCoeffs = objective?.coefficients && Object.values(objective.coefficients).some(c => c !== 0);
    const hasConstraints = constraints.length > 0;

    if (!hasVars || !hasObjCoeffs || !hasConstraints) {
      const msgs = [];
      if (!hasVars) msgs.push('缺少决策变量');
      if (!hasObjCoeffs) msgs.push('目标函数未定义');
      if (!hasConstraints) msgs.push('缺少约束条件');
      alert(`模型不完整: ${msgs.join('、')}`);
      return;
    }

    setSolving(true);

    try {
      if (rawFileContent) {
        const result = await api.post('/optimization/solve-mps', {
          content: rawFileContent,
          format: rawFileFormat || 'mps',
        });
        result.variables = variables;
        result.objective = objective;
        result.constraints = constraints;
        setSolveResult(result);
        setShowResult(true);
      } else {
        const modelDef = {
          name: modelName,
          description: modelDescription,
          problem_type: problemType,
          status: 'draft',
          objective: {
            sense: objective.sense,
            expression: buildExpression(objective.coefficients, variables),
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
        };

        const savedModel = isNew
          ? await api.post('/optimization/', modelDef)
          : await api.put(`/optimization/${id}`, modelDef);

        const result = await api.post(`/optimization/${savedModel.id}/solve`);

        result.variables = variables;
        result.objective = objective;
        result.constraints = constraints;
        setSolveResult(result);
        setShowResult(true);
      }
    } catch (error) {
      console.error('Failed to solve model:', error);
      alert('求解失败: ' + (error.message || '请检查网络连接或模型定义'));
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
    if (!['lp', 'mps'].includes(ext)) return;
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
    reader.onload = (e) => {
      const content = e.target.result;
      setImportContent(content);

      const ext = selectedFile.name.split('.').pop().toLowerCase();
      let result = null;

      if (ext === 'mps') {
        result = parseMPSFile(content);
      } else if (ext === 'lp') {
        const vars = parseLPVariables(content);
        result = {
          name: selectedFile.name.replace('.lp', ''),
          objectiveSense: 'minimize',
          variables: vars.map(name => ({
            name,
            isInteger: false,
            lowerBound: 0,
            upperBound: null,
          })),
          objective: { sense: 'minimize', coefficients: {} },
          constraints: [],
          bounds: {},
        };
      }

      if (result) {
        setImportParsed(result);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleRemoveFile = () => {
    setImportFile(null);
    setImportContent('');
    setImportParsed(null);
  };

  const handleApplyFile = () => {
    if (!importParsed || !importParsed.variables.length) return;

    const autoMappedVariables = importParsed.variables.map((varData, idx) => ({
      id: `v-file-${idx + 1}`,
      name: varData.name,
      source: 'custom',
      type: varData.isInteger ? 'integer' : 'continuous',
      lowerBound: varData.lowerBound,
      upperBound: varData.upperBound,
    }));

    const varIdMap = {};
    autoMappedVariables.forEach(v => { varIdMap[v.name] = v.id; });

    const autoMappedConstraints = importParsed.constraints.map((c, idx) => {
      const coefficients = {};
      for (const [varName, coeff] of Object.entries(c.coefficients)) {
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
    for (const [varName, coeff] of Object.entries(importParsed.objective.coefficients)) {
      const varId = varIdMap[varName];
      if (varId) autoObjCoefficients[varId] = coeff;
    }

    handleModelGenerated({
      problemType: importParsed.variables.some(v => v.isInteger) ? 'MIP' : 'LP',
      variables: autoMappedVariables,
      objective: {
        sense: importParsed.objective.sense,
        coefficients: autoObjCoefficients,
      },
      constraints: autoMappedConstraints,
      rawContent: importContent,
      rawFormat: importFile.name.split('.').pop().toLowerCase(),
    });
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

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto">
          <VisualModelingPanel
            variables={variables}
            setVariables={setVariables}
            objective={objective}
            setObjective={setObjective}
            constraints={constraints}
            setConstraints={setConstraints}
            problemType={problemType}
            setProblemType={setProblemType}
            ontologies={ontologies}
          />
        </div>

        <div className="w-[380px] border-l border-slate-200 overflow-y-auto bg-slate-50 flex-shrink-0">
          <MathPreviewPanel
            variables={variables}
            objective={objective}
            constraints={constraints}
            problemType={problemType}
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
                  <p className="text-xs text-slate-400">支持格式：.lp, .mps</p>
                  <input
                    id="file-input"
                    type="file"
                    accept=".lp,.mps"
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

      {showResult && (
        <SolveResultPanel
          result={solveResult}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  );
}