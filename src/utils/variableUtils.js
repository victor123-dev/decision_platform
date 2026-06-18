/**
 * 变量本体语义工具函数
 * 用于统一处理决策变量/系数的本体引用、路径展示、标色等逻辑
 */

/**
 * 判断变量是否带有本体语义引用
 */
const DEFAULT_ONTOLOGY_NAME = '供应链控制塔';

/**
 * 从变量中提取本体引用对象
 * 支持 ontologyRefs(数组)、ontologyRef(单个)、directRef 三种格式
 */
function extractRef(variable) {
  if (variable.ontologyRefs && Array.isArray(variable.ontologyRefs) && variable.ontologyRefs.length > 0) {
    return variable.ontologyRefs[0];
  }
  return variable.ontologyRef || variable.directRef || null;
}

export function hasOntologyRef(variable) {
  if (!variable) return false;
  return !!(
    variable.ontologyRefs?.length ||
    variable.ontologyRef ||
    variable.ontologyPath ||
    (variable.directRef && variable.directRef.objectTypeId)
  );
}

/**
 * 提取变量对应的本体路径字符串
 * 优先使用已计算好的 ontologyPath，否则根据 ontologyRef 组装
 */
export function getOntologyPath(variable, options = {}) {
  if (!variable) return '';

  if (variable.ontologyPath && typeof variable.ontologyPath === 'string') {
    return variable.ontologyPath;
  }

  const ref = extractRef(variable);
  if (!ref) return '';

  const ontologyName = ref.ontologyName || variable.ontologyName || options.ontologyName || DEFAULT_ONTOLOGY_NAME;
  const objectName = ref.objectDisplayName || ref.objectTypeId || '';
  const propertyName = ref.propertyDisplayName || ref.propertyId || variable.name || '';

  return `${ontologyName}.${objectName}.${propertyName}`;
}

/**
 * 根据本体引用生成稳定的颜色类名（用于前端标色）
 * 同一 objectTypeId 会映射到相同颜色，保证视觉一致性
 */
export function getVariableColorClass(variable) {
  if (!hasOntologyRef(variable)) return '';

  const ref = extractRef(variable) || {};
  const objectTypeId = ref.objectTypeId || 'default';

  const colorMap = {
    'obj-supplier': 'ontology-color-supplier',
    'obj-warehouse': 'ontology-color-warehouse',
    'obj-order': 'ontology-color-order',
    'obj-product': 'ontology-color-product',
    'obj-customer': 'ontology-color-customer',
    'obj-material': 'ontology-color-material',
    'obj-work-order': 'ontology-color-work-order',
    'obj-risk': 'ontology-color-risk',
    'obj-inventory': 'ontology-color-inventory',
    'obj-machine': 'ontology-color-machine',
    'obj-task': 'ontology-color-task',
    'obj-logistics': 'ontology-color-logistics',
  };

  return colorMap[objectTypeId] || 'ontology-color-default';
}

/**
 * 从变量列表构建 id -> variable 的映射，方便按 ID 查找
 */
export function buildVariableMap(variables = []) {
  return variables.reduce((acc, v) => {
    if (v && v.id) acc[v.id] = v;
    if (v && v.name) acc[v.name] = v;
    if (v && v.symbol) acc[v.symbol] = v;
    return acc;
  }, {});
}

/**
 * 判断一个系数值是否是 "$变量名" 形式的占位符
 */
export function isVariableCoefficient(value) {
  if (value === null || value === undefined) return false;
  const str = String(value).trim();
  return str.startsWith('$') && str.length > 1;
}

/**
 * 从 "$变量名" 中提取变量名
 */
export function extractVariableCoefficientName(value) {
  if (!isVariableCoefficient(value)) return '';
  return String(value).trim().slice(1);
}

/**
 * 规范化系数输入：数字保持数字，$变量名 保持字符串
 */
export function normalizeCoefficient(value) {
  if (value === null || value === undefined || value === '') return null;
  const str = String(value).trim();
  if (isVariableCoefficient(str)) return str;
  const num = Number(str);
  return Number.isNaN(num) ? str : num;
}
