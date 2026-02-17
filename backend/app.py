from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# ---------- DATABASE ----------
client = MongoClient("mongodb://localhost:27017/")
db = client["smart_event_db"]
users = db["users"]
events = db["events"]

# ---------- HOME ----------
@app.route("/")
def home():
    return jsonify({"status": "Online", "system": "Smart Event Management API"})

# ---------- REGISTER ----------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json

    if users.find_one({"email": data["email"]}):
        return jsonify({"success": False, "message": "Email already exists"})

    users.insert_one(data)
    return jsonify({"success": True, "message": "Registered successfully"})

# ---------- LOGIN ----------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    user = users.find_one({"email": data["email"], "password": data["password"]})

    if user:
        return jsonify({"success": True, "username": user["username"]})
    else:
        return jsonify({"success": False, "message": "Invalid credentials"})

# ---------- CREATE EVENT ----------
@app.route("/api/create-event", methods=["POST"])
def create_event():
    event = request.json
    events.insert_one(event)
    return jsonify({"success": True, "message": "Event created"})

# ---------- AI RECOMMENDATION ----------
@app.route("/api/recommend", methods=["POST"])
def recommend():
    data = request.json
    budget = int(data["budget"])

    if budget < 10000:
        services = ["Community Hall", "Basic Catering", "Simple Decoration"]
    elif budget < 30000:
        services = ["Banquet Hall", "Buffet Catering", "Premium Decoration"]
    else:
        services = ["Resort Venue", "Luxury Catering", "Theme Decoration"]

    return jsonify({"recommended_services": services})

# ---------- RUN ----------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
