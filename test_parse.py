def parse_expression(expression, var_indices):
    """解析数学表达式，返回变量系数字典"""
    coeffs = {i: 0.0 for i in range(len(var_indices))}
    # 移除空格并将负号转换为 +-
    expr = expression.replace(' ', '').replace('-', '+-')
    terms = expr.split('+')
    
    print(f"Parsing expression: '{expression}' -> '{expr}' -> terms: {terms}")
    
    for term in terms:
        if not term:
            continue
        
        if '*' in term:
            coeff_str, var_name = term.split('*')
            coeff = float(coeff_str)
        else:
            # 处理纯变量项，如 'X11' 或 '-X12'
            if term.startswith('-'):
                coeff = -1.0
                var_name = term[1:]
            else:
                coeff = 1.0
                var_name = term
        
        print(f"  Term: '{term}' -> coeff: {coeff}, var_name: '{var_name}'")
        
        if var_name in var_indices:
            coeffs[var_indices[var_name]] += coeff
            print(f"    Added to index {var_indices[var_name]}, new value: {coeffs[var_indices[var_name]]}")
        else:
            print(f"    Variable '{var_name}' not found in var_indices")
    
    print(f"Final coefficients: {coeffs}")
    return coeffs

# 测试用例
var_indices = {'Z121': 0, 'Z122': 1, 'CMAX': 2, 'X11': 3, 'X12': 4, 'X21': 5, 'X22': 6}

print('=== 测试表达式解析 ===')

expr1 = 'CMAX'
print(f"\n测试1: {expr1}")
parse_expression(expr1, var_indices)

expr2 = 'X11 - X12'
print(f"\n测试2: {expr2}")
parse_expression(expr2, var_indices)

expr3 = '100*Z121 + X11 - X21'
print(f"\n测试3: {expr3}")
parse_expression(expr3, var_indices)

expr4 = '-100*Z121 - X11 + X21'
print(f"\n测试4: {expr4}")
parse_expression(expr4, var_indices)
