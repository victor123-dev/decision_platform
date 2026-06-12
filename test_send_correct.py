import requests

# 创建正确的模型
model_data = {
    "id": "test-correct-model",
    "name": "Test Correct Model",
    "description": "Test with correct RHS values",
    "problem_type": "MIP",
    "status": "draft",
    "updated_at": "2026-06-11T00:00:00Z",
    "variables": [
        {"name": "Z121", "lower_bound": 0, "upper_bound": 1, "is_integer": True},
        {"name": "Z122", "lower_bound": 0, "upper_bound": 1, "is_integer": True},
        {"name": "CMAX", "lower_bound": 0, "upper_bound": None, "is_integer": False},
        {"name": "X11", "lower_bound": 0, "upper_bound": None, "is_integer": False},
        {"name": "X12", "lower_bound": 0, "upper_bound": None, "is_integer": False},
        {"name": "X21", "lower_bound": 0, "upper_bound": None, "is_integer": False},
        {"name": "X22", "lower_bound": 0, "upper_bound": None, "is_integer": False},
    ],
    "constraints": [
        {"name": "PREC1", "expression": "X11 - X12", "operator": "<=", "rhs": -3},
        {"name": "PREC2", "expression": "-X21 + X22", "operator": "<=", "rhs": -4},
        {"name": "MKSP1", "expression": "-CMAX + X12", "operator": "<=", "rhs": -2},
        {"name": "MKSP2", "expression": "-CMAX + X21", "operator": "<=", "rhs": -1},
        {"name": "DISJ1A", "expression": "100*Z121 + X11 - X21", "operator": "<=", "rhs": 97},
        {"name": "DISJ1B", "expression": "-100*Z121 - X11 + X21", "operator": "<=", "rhs": -1},
        {"name": "DISJ2A", "expression": "100*Z122 + X12 - X22", "operator": "<=", "rhs": 98},
        {"name": "DISJ2B", "expression": "-100*Z122 - X12 + X22", "operator": "<=", "rhs": -4},
    ],
    "objective": {"sense": "min", "expression": "CMAX"}
}

# 创建模型
print("=== 创建模型 ===")
response = requests.post('http://localhost:8000/api/v1/optimization/', json=model_data)
print(f"状态码: {response.status_code}")
print(f"响应: {response.json()}")

if response.status_code == 201:
    model_id = response.json()['id']
    
    # 求解
    print("\n=== 求解模型 ===")
    solve_response = requests.post(f'http://localhost:8000/api/v1/optimization/{model_id}/solve')
    print(f"状态码: {solve_response.status_code}")
    
    if solve_response.status_code == 200:
        result = solve_response.json()
        print(f"\n求解结果:")
        print(f"状态: {result['status']}")
        print(f"目标函数值: {result['objective_value']}")
        print(f"求解时间: {result['solve_time']}s")
        print(f"\n变量取值:")
        for var_name, value in result['solution'].items():
            print(f"  {var_name}: {value}")
    else:
        print(f"求解失败: {solve_response.text}")
