import requests
import json

model_data = {
    "id": "test-bv-fixed",
    "name": "BV Fixed Test",
    "problem_type": "MIP",
    "variables": [
        {"name": "Z121", "lower_bound": 0, "upper_bound": 1, "is_integer": True},
        {"name": "Z122", "lower_bound": 0, "upper_bound": 1, "is_integer": True},
        {"name": "CMAX", "lower_bound": 0, "upper_bound": None, "is_integer": False},
        {"name": "X11", "lower_bound": 0, "upper_bound": None, "is_integer": False},
        {"name": "X12", "lower_bound": 0, "upper_bound": None, "is_integer": False},
        {"name": "X21", "lower_bound": 0, "upper_bound": None, "is_integer": False},
        {"name": "X22", "lower_bound": 0, "upper_bound": None, "is_integer": False}
    ],
    "constraints": [
        {"name": "PREC1", "expression": "X11 - X12", "operator": "<=", "rhs": -3.0},
        {"name": "PREC2", "expression": "-X21 + X22", "operator": "<=", "rhs": -4.0},
        {"name": "MKSP1", "expression": "-CMAX + X12", "operator": "<=", "rhs": -2.0},
        {"name": "MKSP2", "expression": "-CMAX + X21", "operator": "<=", "rhs": -1.0},
        {"name": "DISJ1A", "expression": "100*Z121 + X11 - X21", "operator": "<=", "rhs": 97.0},
        {"name": "DISJ1B", "expression": "-100*Z121 - X11 + X21", "operator": "<=", "rhs": -1.0},
        {"name": "DISJ2A", "expression": "100*Z122 + X12 - X22", "operator": "<=", "rhs": 98.0},
        {"name": "DISJ2B", "expression": "-100*Z122 - X12 + X22", "operator": "<=", "rhs": -4.0}
    ],
    "objective": {"sense": "min", "expression": "CMAX"}
}

requests.post("http://localhost:8000/api/v1/optimization/", json=model_data)
result = requests.post("http://localhost:8000/api/v1/optimization/test-bv-fixed/solve").json()
print("=== Fixed Model (BV with upper_bound=1) ===")
print(json.dumps(result, indent=2))

model_data_no_bounds = {
    "id": "test-no-bv-bounds",
    "name": "No BV Bounds Test",
    "problem_type": "MIP",
    "variables": [
        {"name": "Z121", "lower_bound": 0, "upper_bound": None, "is_integer": True},
        {"name": "Z122", "lower_bound": 0, "upper_bound": None, "is_integer": True},
        {"name": "CMAX", "lower_bound": 0, "upper_bound": None, "is_integer": False},
        {"name": "X11", "lower_bound": 0, "upper_bound": None, "is_integer": False},
        {"name": "X12", "lower_bound": 0, "upper_bound": None, "is_integer": False},
        {"name": "X21", "lower_bound": 0, "upper_bound": None, "is_integer": False},
        {"name": "X22", "lower_bound": 0, "upper_bound": None, "is_integer": False}
    ],
    "constraints": [
        {"name": "PREC1", "expression": "X11 - X12", "operator": "<=", "rhs": -3.0},
        {"name": "PREC2", "expression": "-X21 + X22", "operator": "<=", "rhs": -4.0},
        {"name": "MKSP1", "expression": "-CMAX + X12", "operator": "<=", "rhs": -2.0},
        {"name": "MKSP2", "expression": "-CMAX + X21", "operator": "<=", "rhs": -1.0},
        {"name": "DISJ1A", "expression": "100*Z121 + X11 - X21", "operator": "<=", "rhs": 97.0},
        {"name": "DISJ1B", "expression": "-100*Z121 - X11 + X21", "operator": "<=", "rhs": -1.0},
        {"name": "DISJ2A", "expression": "100*Z122 + X12 - X22", "operator": "<=", "rhs": 98.0},
        {"name": "DISJ2B", "expression": "-100*Z122 - X12 + X22", "operator": "<=", "rhs": -4.0}
    ],
    "objective": {"sense": "min", "expression": "CMAX"}
}

requests.post("http://localhost:8000/api/v1/optimization/", json=model_data_no_bounds)
result_no_bounds = requests.post("http://localhost:8000/api/v1/optimization/test-no-bv-bounds/solve").json()
print("\n=== Bug Model (BV WITHOUT upper_bound) ===")
print(json.dumps(result_no_bounds, indent=2))
