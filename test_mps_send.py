import requests
import json

# 读取MPS文件
with open('/Users/shijinxin/PycharmProjects/or_solver/python_HiGHs/aps_example/aps_example.mps', 'r') as f:
    mps_content = f.read()

# 模拟前端解析（简化版）
def parse_mps_simplified(text):
    """简化版MPS解析"""
    lines = text.split('\n')
    result = {
        'name': '',
        'objective': { 'sense': 'minimize', 'coefficients': {} },
        'constraints': [],
    }
    
    rows = {}
    columns = {}
    rhs_values = {}
    current_section = ''
    
    for line in lines:
        trimmed = line.strip()
        if not trimmed or trimmed.startswith('*'):
            continue
            
        first_word = trimmed.split()[0]
        
        if first_word == 'NAME':
            current_section = 'NAME'
            result['name'] = trimmed[4:].strip()
            continue
        elif first_word in ['ROWS', 'COLUMNS', 'RHS', 'BOUNDS', 'ENDATA']:
            current_section = first_word
            continue
            
        if current_section == 'ROWS':
            parts = trimmed.split()
            if len(parts) >= 2:
                row_type = parts[0]
                row_name = parts[1]
                rows[row_name] = { 'type': row_type, 'rhs': 0 }
                
        elif current_section == 'COLUMNS':
            if "'MARKER'" in trimmed:
                continue
            parts = trimmed.split()
            if len(parts) >= 3:
                col_name = parts[0]
                row_name = parts[1]
                value = float(parts[2])
                
                if col_name not in columns:
                    columns[col_name] = { 'coefficients': {}, 'is_integer': False }
                columns[col_name]['coefficients'][row_name] = value
                
                if len(parts) >= 5:
                    row_name2 = parts[3]
                    value2 = float(parts[4])
                    columns[col_name]['coefficients'][row_name2] = value2
                    
        elif current_section == 'RHS':
            parts = trimmed.split()
            print(f"RHS parts: {parts}")
            if len(parts) >= 3:
                row_name = parts[1]
                value = float(parts[2])
                rhs_values[row_name] = value
                
                if len(parts) >= 5:
                    row_name2 = parts[3]
                    value2 = float(parts[4])
                    rhs_values[row_name2] = value2
                    
        elif current_section == 'BOUNDS':
            parts = trimmed.split()
            if len(parts) >= 3:
                bound_type = parts[0]
                var_name = parts[2]
                if bound_type == 'BV':
                    if var_name not in columns:
                        columns[var_name] = { 'coefficients': {}, 'is_integer': False }
                    columns[var_name]['is_integer'] = True
    
    # 构建约束
    for row_name, row_data in rows.items():
        if row_data['type'] == 'N':
            # 目标行
            for col_name, col_data in columns.items():
                if row_name in col_data['coefficients']:
                    result['objective']['coefficients'][col_name] = col_data['coefficients'][row_name]
        else:
            # 约束行
            constraint = {
                'name': row_name,
                'coefficients': {},
                'sense': '<=',
                'rhs': rhs_values.get(row_name, 0)
            }
            
            for col_name, col_data in columns.items():
                if row_name in col_data['coefficients']:
                    constraint['coefficients'][col_name] = col_data['coefficients'][row_name]
                    
            result['constraints'].append(constraint)
    
    return result

# 解析MPS
parsed = parse_mps_simplified(mps_content)
print(f"\n模型名称: {parsed['name']}")
print(f"目标函数系数: {parsed['objective']['coefficients']}")
print(f"\n约束条件:")
for c in parsed['constraints']:
    print(f"  {c['name']}: {c['coefficients']} {c['sense']} {c['rhs']}")
print(f"\n变量数: {len(columns)}")
print(f"约束数: {len(parsed['constraints'])}")
print(f"\nrhs_values: {rhs_values}")
