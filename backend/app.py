from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import re
import uuid

app = Flask(__name__)
CORS(app)

# Rasa REST webhook and tracker URL
RASA_WEBHOOK_URL = "http://rasa:5005/webhooks/rest/webhook"
RASA_TRACKER_URL = "http://rasa:5005/conversations/{sender_id}/tracker"

# Global sender ID for single-user scenario
SENDER_ID = str(uuid.uuid4())

# -----------------------
# Send message to Rasa via webhook
# -----------------------
def get_rasa_response(text: str, sender_id: str):
    """
    Sends a message to Rasa REST webhook.
    Returns:
      - rasa_message: bot reply text
      - slots: dictionary of relevant slots (entities) for context
    """
    rasa_message = None
    slots = {}

    try:
        # Send message to Rasa
        response = requests.post(RASA_WEBHOOK_URL, json={"sender": sender_id, "message": text})
        response.raise_for_status()
        bot_responses = response.json()
        if bot_responses:
            rasa_message = bot_responses[0].get("text")

        # Retrieve current conversation tracker to get slots
        tracker_resp = requests.get(RASA_TRACKER_URL.format(sender_id=sender_id))
        tracker_resp.raise_for_status()
        tracker_data = tracker_resp.json()

        # Extract slots for topology and device_count
        slots["topology"] = tracker_data.get("slots", {}).get("topology")
        slots["devices"] = tracker_data.get("slots", {}).get("device_count")

    except Exception as e:
        print("❌ Rasa API error:", e)

    return {"rasa_message": rasa_message, "slots": slots}

# -----------------------
# Chat Endpoint
# -----------------------
@app.route("/chat", methods=["POST"])
def chat():
    global SENDER_ID
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({
            "success": False,
            "create_topology": False,
            "message": None,
            "data": {"topology": None, "devices": None}
        }), 400

    # Get Rasa response & slots
    rasa_data = get_rasa_response(user_message, SENDER_ID)
    slots = rasa_data.get("slots", {})

    # Fallback: regex for device count if slot is empty
    if slots.get("devices") is None:
        nums = re.findall(r"\b\d+\b", user_message)
        if nums:
            slots["devices"] = int(nums[0])

    # Check if topology can be created
    create_topology = slots.get("topology") is not None and slots.get("devices") is not None

    # If topology created, generate new session/sender_id
    if create_topology:
        SENDER_ID = str(uuid.uuid4())

    return jsonify({
        "success": True,
        "create_topology": create_topology,
        "message": rasa_data.get("rasa_message"),
        "data": {"topology": slots.get("topology"), "devices": slots.get("devices")}
    })

# -----------------------
# Health Check
# -----------------------
@app.route("/health", methods=["GET"])
def health():
    try:
        resp = requests.get("http://rasa:5005/health")
        rasa_healthy = resp.status_code == 200 and resp.json().get("status") == "healthy"
    except:
        rasa_healthy = False

    return jsonify({
        "status": "healthy",
        "rasa_healthy": rasa_healthy
    })

# -----------------------
# Entry Point
# -----------------------
if __name__ == "__main__":
    print("🌐 Starting Flask server at http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000)
