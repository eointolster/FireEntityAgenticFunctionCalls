from function_manager import register_function

@register_function("math")
def add_numbers(a: str, b: str) -> int:
    """Add two numbers together"""
    return int(a) + int(b)



