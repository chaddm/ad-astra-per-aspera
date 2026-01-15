#!/usr/bin/env python3
import sys
import math


def safe_eval(expression):
    """
    Safely evaluate a mathematical expression using Python's eval with restricted scope.
    Only allows math operations and functions from the math module.
    """
    # Create a safe namespace with math functions
    safe_dict = {
        "__builtins__": {},
        "abs": abs,
        "round": round,
        "min": min,
        "max": max,
        "sum": sum,
        "pow": pow,
    }

    # Add all math module functions
    for name in dir(math):
        if not name.startswith("_"):
            safe_dict[name] = getattr(math, name)

    try:
        result = eval(expression, safe_dict, {})
        return result
    except Exception as e:
        return f"Error: {str(e)}"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: No expression provided")
        print('Usage: compute.py "<expression>"')
        sys.exit(1)

    expression = sys.argv[1]
    result = safe_eval(expression)
    print(result)
