# MongoDB Atlas - Direct Connection Guide

## ✅ **Connection Verified Successfully!**

Your MongoDB Atlas database is **live and connected**!

**Connection Details:**
- **Host**: `ac-fkcjf03-shard-00-02.7xwslgo.mongodb.net`
- **Database**: `smart-event-management`
- **Status**: ✅ Active

---

## 🔌 **Connect via MongoDB for VS Code Extension**

### **Method 1: Using the Extension (Recommended)**

1. **Install the Extension**:
   - Press `Ctrl+Shift+X` to open Extensions
   - Search for **"MongoDB for VS Code"**
   - Click **Install** (by MongoDB Inc.)

2. **Connect to Your Database**:
   - Press `Ctrl+Shift+P` to open Command Palette
   - Type: **"MongoDB: Connect"**
   - Select: **"Connect with Connection String"**
   - Paste this connection string:
   ```
   mongodb+srv://admin:project123@cluster0.7xwslgo.mongodb.net/smart-event-management?retryWrites=true&w=majority
   ```
   - Press Enter

3. **Explore Your Data**:
   - Click the MongoDB icon in the left sidebar
   - Expand: `smart-event-management` → `Collections`
   - You'll see collections like: `users`, `events`, `vendors`, etc.

---

### **Method 2: Using MongoDB Compass (Desktop App)**

1. Download from: https://www.mongodb.com/try/download/compass
2. Open Compass
3. Paste the connection string:
   ```
   mongodb+srv://admin:project123@cluster0.7xwslgo.mongodb.net/smart-event-management
   ```
4. Click **Connect**

---

## 🎯 **Quick Test: Create Sample Data**

Run this in your terminal to add a test user:

\`\`\`bash
cd backend
node -e "const mongoose = require('mongoose'); const User = require('./models/userModel'); mongoose.connect('mongodb+srv://admin:project123@cluster0.7xwslgo.mongodb.net/smart-event-management').then(async () => { const user = await User.create({ name: 'Test User', email: 'test@example.com', password: 'test123', role: 'user' }); console.log('✅ User created:', user); process.exit(0); });"
\`\`\`

---

## 📊 **Your Database is Production-Ready!**

All data will now persist permanently in MongoDB Atlas. No more "temporary database" warnings!

**Next Steps:**
1. Restart your server to use the cloud database
2. Register a new user via the UI
3. Check MongoDB for VS Code to see the data appear in real-time!
