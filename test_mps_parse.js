// 测试MPS解析
const mpsContent = `NAME          APS_Example
ROWS
 N  OBJ
 L  PREC1
 L  PREC2
 L  MKSP1
 L  MKSP2
 L  DISJ1A
 L  DISJ1B
 L  DISJ2A
 L  DISJ2B
COLUMNS
    Z121        OBJ                   0             PREC1                  0
    Z121        PREC2                  0             MKSP1                  0
    Z121        MKSP2                  0             DISJ1A                100
    Z121        DISJ1B              -100
    Z122        OBJ                   0             PREC1                  0
    Z122        PREC2                  0             MKSP1                  0
    Z122        MKSP2                  0             DISJ2A                100
    Z122        DISJ2B              -100
    CMAX        OBJ                   1             PREC1                  0
    CMAX        PREC2                  0             MKSP1                 -1
    CMAX        MKSP2                 -1
    X11         OBJ                   0             PREC1                  1
    X11         PREC2                  0             MKSP1                  0
    X11         MKSP2                  0             DISJ1A                  1
    X11         DISJ1B                -1
    X12         OBJ                   0             PREC1                 -1
    X12         PREC2                  0             MKSP1                  1
    X12         MKSP2                  0             DISJ2A                  1
    X12         DISJ2B                -1
    X21         OBJ                   0             PREC1                  0
    X21         PREC2                 -1             MKSP1                  0
    X21         MKSP2                  1             DISJ1A                -1
    X21         DISJ1B                  1
    X22         OBJ                   0             PREC1                  0
    X22         PREC2                  1             MKSP1                  0
    X22         MKSP2                  0             DISJ2A                -1
    X22         DISJ2B                  1
RHS
    RHS1        PREC1                  0             PREC2                  0
    RHS1        MKSP1                  0             MKSP2                  0
    RHS1        DISJ1A                97             DISJ1B                -1
    RHS1        DISJ2A                98             DISJ2B                -4
BOUNDS
 BV BND1        Z121
 BV BND1        Z122
ENDATA`;

function parseMps(text) {
  const lines = text.split('\n');
  const result = {
    name: '',
    objective: { sense: 'minimize', coefficients: {} },
    constraints: [],
    bounds: {},
  };

  const rows = {};
  const columns = {};
  const rhsValues = {};

  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('*')) continue;

    const firstWord = trimmed.split(/\s+/)[0];
    
    if (['NAME', 'ROWS', 'COLUMNS', 'RHS', 'BOUNDS', 'ENDATA'].includes(firstWord)) {
      currentSection = firstWord;
      if (currentSection === 'NAME') {
        result.name = trimmed.substring(4).trim();
      }
      continue;
    }

    switch (currentSection) {
      case 'ROWS': {
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
          const rowType = parts[0];
          const rowName = parts[1];
          rows[rowName] = {
            type: rowType,
            rhs: 0,
          };
        }
        break;
      }

      case 'COLUMNS': {
        const parts = trimmed.split(/\s+/).filter(p => p && !p.startsWith("'"));
        if (parts.length >= 3) {
          const colName = parts[0];
          const rowName = parts[1];
          const value = parseFloat(parts[2]);
          
          if (!columns[colName]) {
            columns[colName] = { coefficients: {}, isInteger: false };
          }
          columns[colName].coefficients[rowName] = (columns[colName].coefficients[rowName] || 0) + value;
          
          if (parts.length >= 5) {
            const rowName2 = parts[3];
            const value2 = parseFloat(parts[4]);
            columns[colName].coefficients[rowName2] = (columns[colName].coefficients[rowName2] || 0) + value2;
          }
        }
        break;
      }

      case 'RHS': {
        const parts = trimmed.split(/\s+/).filter(p => p && !p.startsWith("'"));
        console.log('RHS line:', parts);
        if (parts.length >= 4) {
          const rowName = parts[2];
          const value = parseFloat(parts[3]);
          rhsValues[rowName] = (rhsValues[rowName] || 0) + value;
          
          if (parts.length >= 6) {
            const rowName2 = parts[4];
            const value2 = parseFloat(parts[5]);
            rhsValues[rowName2] = (rhsValues[rowName2] || 0) + value2;
          }
        }
        break;
      }

      case 'BOUNDS': {
        const parts = trimmed.split(/\s+/).filter(p => p && !p.startsWith("'"));
        if (parts.length >= 3) {
          const boundType = parts[0];
          const varName = parts[2];
          if (boundType === 'BV') {
            if (!columns[varName]) {
              columns[varName] = { coefficients: {}, isInteger: false };
            }
            columns[varName].isInteger = true;
          }
        }
        break;
      }
    }
  }

  for (const [rowName, rowData] of Object.entries(rows)) {
    if (rowData.type === 'N') {
      for (const [colName, colData] of Object.entries(columns)) {
        if (colData.coefficients[rowName]) {
          result.objective.coefficients[colName] = colData.coefficients[rowName];
        }
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

  result.variables = Object.entries(columns).map(([name, data]) => ({
    name,
    isInteger: data.isInteger || false,
  }));

  return result;
}

const parsed = parseMps(mpsContent);
console.log('=== MPS解析结果 ===');
console.log('模型名称:', parsed.name);
console.log('目标函数系数:', parsed.objective.coefficients);
console.log('\n约束条件:');
parsed.constraints.forEach(c => {
  console.log(`${c.name}: ${Object.entries(c.coefficients).map(([varName, coeff]) => `${coeff}*${varName}`).join(' + ')} ${c.sense} ${c.rhs}`);
});
console.log('\n变量:', parsed.variables);
console.log('\nrhsValues:', parsed.rhsValues);
