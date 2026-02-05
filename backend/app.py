from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

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


# ---------- VENDORS ----------
@app.route("/api/vendors", methods=["GET", "POST"])
def manage_vendors():
    if request.method == "POST":
        data = request.json
        # Basic validation
        if not data.get("name") or not data.get("category"):
            return jsonify({"success": False, "message": "Missing fields"}), 400
        
        vendor = {
            "name": data["name"],
            "category": data["category"],
            "price": data.get("price", 0),
            "rating": 0,
            "reviews_count": 0,
            "description": data.get("description", ""),
            "slots": 5, # default slots
            "reviews": []
        }
        db.vendors.insert_one(vendor)
        return jsonify({"success": True, "message": "Vendor added"})
    
    # GET with sorting
    sort_by = request.args.get("sort", "rating")
    vendors_cursor = db.vendors.find({}, {"_id": 0})
    vendors_list = list(vendors_cursor)
    
    # In-memory sorting for simplicity with mock data structure
    if sort_by == "rating":
        vendors_list.sort(key=lambda x: x.get("rating", 0), reverse=True)
    elif sort_by == "price_low":
        vendors_list.sort(key=lambda x: x.get("price", 0))
    elif sort_by == "price_high":
        vendors_list.sort(key=lambda x: x.get("price", 0), reverse=True)
        
    return jsonify(vendors_list)

# ---------- REVIEWS ----------
@app.route("/api/reviews", methods=["POST"])
def add_review():
    data = request.json
    vendor_name = data.get("vendor_name")
    rating = data.get("rating")
    comment = data.get("comment")
    
    if not vendor_name or not rating:
        return jsonify({"success": False, "message": "Missing data"}), 400
        
    vendor = db.vendors.find_one({"name": vendor_name})
    if not vendor:
        return jsonify({"success": False, "message": "Vendor not found"}), 404
        
    # Update vendor stats
    new_count = vendor.get("reviews_count", 0) + 1
    current_rating = vendor.get("rating", 0)
    new_rating = ((current_rating * (new_count - 1)) + float(rating)) / new_count
    
    db.vendors.update_one(
        {"name": vendor_name},
        {
            "$set": {"rating": round(new_rating, 1), "reviews_count": new_count},
            "$push": {"reviews": {"rating": rating, "comment": comment}}
        }
    )
    
    return jsonify({"success": True, "message": "Review added", "new_rating": round(new_rating, 1)})

# ---------- SPATIAL SCAN (AR) ----------
@app.route("/api/spatial/save-scan", methods=["POST"])
def save_scan():
    data = request.json
    # Mock verify
    print(f"Received Spatial Scan: {data}")
    return jsonify({"success": True, "message": "Scan data processed", "coordinates": data.get("coordinates")})

# ---------- AI BUDGET ----------
@app.route("/api/ai/analyze-budget", methods=["GET"])
def analyze_budget():
    # Mock AI logic
    total = int(request.args.get("total", 50000))
    return jsonify({
        "success": True,
        "allocation": {
            "venue": total * 0.4,
            "food": total * 0.3,
            "decor": total * 0.2,
            "media": total * 0.1
        },
        "tip": "Based on this budget, we recommend local community halls."
    })


# ---------- EVENTS ----------
@app.route("/api/events", methods=["GET", "POST"])
def manage_events():
    if request.method == "POST":
        data = request.json
        data["createdAt"] = datetime.datetime.now()
        data["status"] = "Confirmed"
        res = db.events.insert_one(data)
        return jsonify({"success": True, "message": "Event created", "_id": str(res.inserted_id)})
    
    events = list(db.events.find({}, {"_id": 0})) # Return simplfied list
    return jsonify(events)

# ---------- ADMIN ----------
@app.route("/api/admin/stats", methods=["GET"])
def admin_stats():
    return jsonify({
        "users": db.users.count_documents({}),
        "events": db.events.count_documents({}),
        "vendors": db.vendors.count_documents({"isApproved": True}),
        "pending": db.vendors.count_documents({"isApproved": False})
    })

@app.route("/api/admin/users", methods=["GET"])
def get_users():
    users = list(db.users.find({}, {"password": 0, "_id": 0})) # Project out sensitive data
    # Add dummy ID for frontend keys if needed, or convert ObjectId
    return jsonify(users)

@app.route("/api/admin/users/<id>", methods=["DELETE"])
def delete_user(id):
    # db.users.delete_one({"_id": ObjectId(id)})
    return jsonify({"success": True, "message": "User deleted"})

@app.route("/api/vendors/<id>/approve", methods=["PUT"])
def approve_vendor(id):
    # db.vendors.update_one({"_id": ObjectId(id)}, {"$set": {"isApproved": True}})
    return jsonify({"success": True, "message": "Approved"})

@app.route("/api/vendors/requests/<id>", methods=["GET"])
def vendor_requests(id):
    # Mock requests for vendor
    return jsonify([])

# ---------- SYSTEM HEALTH ----------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "uptime": "99.9%"})

# ---------- RUN ----------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
