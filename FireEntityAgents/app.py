from flask import Flask, render_template, request, jsonify, send_from_directory
from function_manager import FunctionManager
import os
from openai import OpenAI
import json
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

app = Flask(__name__)
function_manager = FunctionManager(os.path.join(os.getcwd(), 'functions'))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/debug/functions')
def debug_functions():
    return jsonify({
        'function_names': function_manager.get_all_function_names(),
        'function_details': function_manager.get_function_details()
    })

@app.route('/get_available_functions')
def get_available_functions():
    return jsonify(function_manager.get_all_function_names())

@app.route('/get_functions_with_categories')
def get_functions_with_categories():
    return jsonify(function_manager.get_all_functions_with_categories())

@app.route('/execute_function', methods=['POST'])
def execute_function():
    data = request.json
    function_name = data['functionName']
    args = data['args']
    try:
        result = function_manager.call_function(function_name, args)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/find_relevant_functions', methods=['POST'])
def find_relevant_functions():
    data = request.json
    query = data['query']
    relevant_functions = function_manager.find_relevant_functions(query)
    return jsonify(relevant_functions)

@app.route('/process_command', methods=['POST'])
def process_command():
    logger.info("Received a new command to process")
    data = request.json
    user_input = data['command']
    child_entities = data.get('child_entities', [])
    
    logger.debug(f"User input: {user_input}")
    logger.debug(f"Child entities: {child_entities}")
    
    messages = [
        {"role": "system", "content": f"You are an AI assistant that helps to process user commands and identify relevant child entities to execute tasks. Available entities and their functions are: {json.dumps(child_entities)}"},
        {"role": "user", "content": user_input}
    ]
    
    try:
        logger.info("Step 1 & 2: Processing command and finding relevant child entities")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            functions=[
                {
                    "name": "select_child_entities",
                    "description": "Select the relevant child entities to process the user's command",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "selected_entities": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string", "enum": [entity['name'] for entity in child_entities]},
                                        "function": {"type": "string"}
                                    },
                                    "required": ["name", "function"]
                                }
                            }
                        },
                        "required": ["selected_entities"]
                    }
                }
            ],
            function_call={"name": "select_child_entities"}
        )
        logger.debug(f"OpenAI API response: {response}")
        
        function_args = json.loads(response.choices[0].message.function_call.arguments)
        selected_entities = function_args['selected_entities']
        
        logger.info(f"Selected entities: {selected_entities}")
        
        results = []
        for selected in selected_entities:
            entity_name = selected['name']
            function_name = selected['function']
            
            logger.info(f"Processing entity: {entity_name} with function: {function_name}")
            entity = next((child for child in child_entities if child['name'] == entity_name), None)
            if not entity:
                logger.warning(f"Entity {entity_name} not found in child_entities")
                continue
            
            if function_name not in entity['functions']:
                logger.warning(f"Function {function_name} not assigned to entity {entity_name}")
                continue
            
            child_messages = [
                {"role": "system", "content": f"You are {entity_name}, capable of {', '.join(entity['functions'])}. Execute the {function_name} function for the user's request."},
                {"role": "user", "content": user_input}
            ]
            
            logger.debug(f"Child messages for {entity_name}: {child_messages}")
            
            child_response = client.chat.completions.create(
                model="gpt-4o",
                messages=child_messages,
                functions=[func for func in function_manager.get_openai_function_descriptions() if func['name'] == function_name],
                function_call={"name": function_name}
            )
            
            logger.debug(f"Child response from OpenAI for {entity_name}: {child_response}")
            
            child_message = child_response.choices[0].message
            if child_message.function_call:
                function_args = json.loads(child_message.function_call.arguments)
                
                logger.info(f"Executing function {function_name} with args: {function_args}")
                
                result = function_manager.call_function(function_name, function_args)
                logger.info(f"Function result: {result}")
                results.append({"entity": entity_name, "function": function_name, "result": result, "args": function_args})
            else:
                logger.warning(f"No function call for {entity_name}, unexpected behavior")
        
        logger.info(f"Execution results: {results}")
        
        final_messages = messages + [
            {"role": "system", "content": f"Task execution results: {json.dumps(results)}"},
            {"role": "user", "content": "Summarize the results and provide a final response to the user."}
        ]
        
        logger.debug(f"Final messages: {final_messages}")
        
        final_response = client.chat.completions.create(
            model="gpt-4o",
            messages=final_messages
        )
        
        logger.debug(f"Final OpenAI response: {final_response}")
        
        response_data = {
            "response": final_response.choices[0].message.content,
            "execution_details": results
        }
        logger.info(f"Sending response: {response_data}")
        return jsonify(response_data)
    
    except Exception as e:
        logger.exception(f"An error occurred while processing the command: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

