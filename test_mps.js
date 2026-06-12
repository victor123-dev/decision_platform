const fs = require('fs');

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
      continue;
    }
    
    if (line.startsWith('OBJSENSE')) {
      currentSection = 'OBJSENSE';
      continue;
    }
    
    if (line.startsWith('ROWS')) {
      currentSection = 'ROWS';
      continue;
    }
    
    if (line.startsWith('COLUMNS')) {
      currentSection = 'COLUMNS';
      continue;
    }
    
    if (line.startsWith('RHS')) {
      currentSection = 'RHS';
      continue;
    }
    
    if (line.startsWith('BOUNDS')) {
      currentSection = 'BOUNDS';
      continue;
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
          
          if (!result.bounds[varName]) {
            result.bounds[varName] = {};
          }
          
          if (boundType === 'BV') {
            result.bounds[varName].type = 'binary';
            if (columns[varName]) columns[varName].isInteger = true;
          }
        }
        break;
      }
    }
  }

  result.variables = Object.keys(columns).map(name => ({
    name,
    isInteger: columns[name].isInteger,
    lowerBound: 0,
    upperBound: null,
  }));

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

const text = fs.readFileSync('/Users/shijinxin/PycharmProjects/or_solver/python_HiGHs/aps_example/aps_example.mps', 'utf8');
const result = parseMPSFile(text);

console.log('=== MPS文件解析测试 ===');
console.log('模型名称:', result.name);
console.log('目标方向:', result.objectiveSense);
console.log('变量数:', result.variables.length);
console.log('变量列表:', result.variables.map(v => v.name).join(', '));
console.log('整数变量:', result.variables.filter(v => v.isInteger).map(v => v.name).join(', '));
console.log('目标函数系数:', JSON.stringify(result.objective.coefficients));
console.log('约束数:', result.constraints.length);
console.log('约束名称:', result.constraints.map(c => c.name).join(', '));
console.log('\n=== 约束详情 ===');
result.constraints.forEach(c => {
  const expr = Object.entries(c.coefficients)
    .map(([v, coeff]) => coeff === 1 ? v : coeff === -1 ? '-'+v : coeff+'*'+v)
    .join(' + ');
  console.log(`${c.name}: ${expr} ${c.sense} ${c.rhs}`);
});
