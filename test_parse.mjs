import { readFileSync } from 'fs';

function parse_expression(expression, var_indices) {
  const coeffs = {};
  Object.values(var_indices).forEach(i => coeffs[i] = 0.0);
  
  const expr = expression.replace(' ', '').replace('-', '+-');
  const terms = expr.split('+');
  
  for (const term of terms) {
    if (!term) continue;
    
    let coeff, var_name;
    if (term.includes('*')) {
      const [coeff_str, v_name] = term.split('*');
      coeff = parseFloat(coeff_str);
      var_name = v_name;
    } else {
      if (term.startsWith('-')) {
        coeff = -1.0;
        var_name = term.substring(1);
      } else {
        coeff = 1.0;
        var_name = term;
      }
    }
    
    if (var_name in var_indices) {
      coeffs[var_indices[var_name]] += coeff;
    }
  }
  
  return coeffs;
}

const var_indices = { 'Z121': 0, 'Z122': 1, 'CMAX': 2, 'X11': 3, 'X12': 4, 'X21': 5, 'X22': 6 };

console.log('=== 测试表达式解析 ===');

const expr1 = 'CMAX';
console.log(`输入: "${expr1}"`);
console.log('输出:', parse_expression(expr1, var_indices));

const expr2 = 'X11 - X12';
console.log(`\n输入: "${expr2}"`);
console.log('输出:', parse_expression(expr2, var_indices));

const expr3 = '100*Z121 + X11 - X21';
console.log(`\n输入: "${expr3}"`);
console.log('输出:', parse_expression(expr3, var_indices));

const expr4 = '-100*Z121 - X11 + X21';
console.log(`\n输入: "${expr4}"`);
console.log('输出:', parse_expression(expr4, var_indices));
