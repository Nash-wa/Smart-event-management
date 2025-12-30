from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__)
CORS(app)  # Crucial for connecting your frontend HTML to this API

# MongoDB Connection
try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['smart_event_db']
    users_collection = db['users']
    events_collection = db['events']
    print("Connected to MongoDB successfully")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

@app.route("/")
def home():
    return jsonify({"status": "Online", "system": "Smart Event Management API"})

# --- AUTHENTICATION MODULE ---

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if users_collection.find_one({"email": email}):
        return jsonify({"success": False, "message": "Email already registered"}), 400

    user_id = users_collection.insert_one({
        "username": username,
        "email": email,
        "password": password
    }).inserted_id
    
    return jsonify({"success": True, "message": "User registered successfully"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email, "password": password})
    if user:
        return jsonify({"success": True, "username": user['username']}), 200
    return jsonify({"success": False, "message": "Invalid email or password"}), 401

# --- EVENT & ML MODULE ---

@app.route("/api/recommend", methods=["POST"])
def recommend():
    data = request.json
    budget = int(data.get("budget", 0))
    
    # Simple logic for recommendation (Expand this with your ML .pkl file later)
    if budget < 10000:
        tier = "Economic"
        services = ["Community Hall", "Buffet Style", "Basic Decor"]
    else:
        tier = "Premium"
        services = ["Luxury Resort", "A-la-carte", "AR-Guided Navigation"]

    return jsonify({"tier": tier, "recommendations": services})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
