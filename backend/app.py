from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import uuid

app = Flask(__name__)
CORS(app)

# Load trained Rasa model
model_path = 'models'
interpreter = None
agent = None

# Simple in-memory session store: session_id -> {"topology": ..., "devices": ...}
# This keeps user-provided values across multiple requests so the user can send
# device count and topology in separate messages and the server will combine them.
sessions = {}

def load_rasa_model():
    """Load the trained Rasa NLU model and Core agent."""
    global interpreter, agent
    try:
        # Find the latest model in the models directory
        if os.path.exists(model_path):
            # Accept model directories or model archives (*.tar.gz)
            entries = os.listdir(model_path)
            models = [f for f in entries if os.path.isdir(os.path.join(model_path, f)) or f.endswith('.tar.gz')]
            if models:
                latest_model = os.path.join(model_path, sorted(models)[-1])
                try:
                    # Load Rasa imports lazily
                    from rasa.core.agent import Agent as RasaAgent
                    agent = RasaAgent.load(latest_model)
                    print(f"✓ Loaded Core agent: {latest_model}")
                    return True
                except Exception:
                    try:
                        from rasa.nlu.model import Interpreter as RasaInterpreter
                        interpreter = RasaInterpreter.load(latest_model)
                        print(f"✓ Loaded NLU model: {latest_model}")
                        return True
                    except Exception:
                        pass
        print("✗ No trained model found. Please run: python train_model.py")
        return False
    except Exception as e:
        print(f"✗ Error loading model: {str(e)}")
        return False

def extract_network_info(user_input):
    """
    Extract topology type and number of devices using the trained Rasa model.
    Returns a dict with 'topology' and 'devices' keys.
    """
    topology = None
    devices = None
    
    try:
        if not interpreter and not agent:
            return {
                "topology": None,
                "devices": None
            }
        
        # Parse input using trained Rasa model
        if agent:
            parsed = agent.parse(user_input)
        else:
            parsed = interpreter.parse(user_input)
            
        entities = parsed.get('entities', [])
        
        for entity in entities:
            if entity['entity'] == 'topology':
                topology = entity['value'].lower()
            elif entity['entity'] == 'device_count':
                try:
                    devices = int(entity['value'])
                except:
                    devices = entity['value']
        
        # Fallback: Extract numbers with regex
        if not devices:
            numbers = re.findall(r'\b(\d+)\b', user_input)
            if numbers:
                devices = int(numbers[0])
        
        return {
            "topology": topology,
            "devices": devices
        }
    except Exception as e:
        return {
            "topology": None,
            "devices": None
        }

async def get_rasa_response(user_input):
    """Get response from Rasa Core agent."""
    try:
        if agent:
            responses = await agent.handle_text(user_input)
            if responses:
                return responses[0].get('text', 'Unable to process')
    except:
        pass
    return None

@app.route('/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint that processes user input and returns Rasa model response.
    """
    try:
        import asyncio
        
        data = request.get_json()
        user_input = data.get('message', '').strip()
        
        if not user_input:
            return jsonify({
                "success": False,
                "message": "Please provide input.",
                "data": {
                    "topology": None,
                    "devices": None
                }
            }), 400
        
        # Get Rasa model response (dialogue response)
        rasa_message = None
        if agent:
            try:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                rasa_message = loop.run_until_complete(get_rasa_response(user_input))
                loop.close()
            except:
                pass
        
        # Extract network information (entities)
        network_info = extract_network_info(user_input)
        
        # Build data object with topology and devices
        response_data = {
            "topology": network_info.get('topology') if network_info.get('topology') else None,
            "devices": network_info.get('devices') if network_info.get('devices') else None
        }
        
        # Use Rasa model's message or fallback to default
        if rasa_message:
            message = rasa_message
        else:
            message = "Message received."
        
        return jsonify({
            "success": True,
            "message": message,
            "data": response_data
        }), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e),
            "data": {
                "topology": None,
                "devices": None
            }
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "model_loaded": interpreter is not None or agent is not None}), 200

if __name__ == '__main__':
    print("Loading Rasa model...")
    load_rasa_model()
    print("Starting Flask server on http://0.0.0.0:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
