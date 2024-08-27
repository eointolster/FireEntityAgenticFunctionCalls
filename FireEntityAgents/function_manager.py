# function_manager.py
import os
import importlib
import inspect

class FunctionManager:
    def __init__(self, functions_dir):
        self.functions = {}
        self.load_functions(functions_dir)

    def load_functions(self, functions_dir):
        for filename in os.listdir(functions_dir):
            if filename.endswith('.py'):
                module_name = filename[:-3]
                module = importlib.import_module(f'functions.{module_name}')
                for name, obj in inspect.getmembers(module):
                    if hasattr(obj, '_is_registered_function'):
                        self.functions[name] = obj

    def get_all_functions_with_categories(self):
        return {name: func._category for name, func in self.functions.items()}
    
    def get_all_function_names(self):
        return list(self.functions.keys())

    def get_function_details(self):
        return {name: {
            'description': func.__doc__,
            'parameters': inspect.signature(func).parameters
        } for name, func in self.functions.items()}

    def call_function(self, function_name, args):
        if function_name in self.functions:
            return self.functions[function_name](**args)
        else:
            raise ValueError(f"Function {function_name} not found")
        
    def find_relevant_functions(self, query: str) -> list:
        """Find relevant functions based on the query"""
        query_words = set(self.generate_keywords(query, ""))
        relevant_functions = []

        for category, functions in self.function_keywords.items():
            for func_name, keywords in functions.items():
                if query_words.intersection(keywords):
                    relevant_functions.append({"name": func_name, "category": category})

        return relevant_functions

    def get_openai_function_descriptions(self):
        return [
            {
                "name": name,
                "description": func.__doc__,
                "parameters": {
                    "type": "object",
                    "properties": {
                        param: {"type": "string"} for param in inspect.signature(func).parameters
                    },
                    "required": list(inspect.signature(func).parameters.keys())
                }
            }
            for name, func in self.functions.items()
        ]

def register_function(category):
    def decorator(func):
        func._is_registered_function = True
        func._category = category
        return func
    return decorator