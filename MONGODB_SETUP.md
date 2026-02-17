# MongoDB Atlas Setup Instructions

## ✅ Your connection string has been configured!

### 📝 Next Steps:

1. **Replace the password placeholder**:
   - Open `backend/.env`
   - Find the line: `MONGO_URI=mongodb+srv://admin:<db_password>@cluster0.7xwslgo.mongodb.net/...`
   - Replace `project123` with your actual MongoDB Atlas password
   - **Important**: If your password contains special characters, URL-encode them:
     - `@` → `%40`
     - `#` → `%23`
     - `$` → `%24`
     - `%` → `%25`
     - `&` → `%26`

2. **Verify your Database User**:
   - Go to MongoDB Atlas → Database Access
   - Ensure the user `admin` exists and has read/write permissions
   - If needed, reset the password there

3. **Whitelist Your IP Address**:
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Either add your current IP or use `0.0.0.0/0` (allow from anywhere - for development only)

4. **Restart the server**:
   - The server will automatically detect the new connection string
   - Look for: `✅ MongoDB Connected: cluster0-shard-00-00.7xwslgo.mongodb.net`

### 🔍 Testing the Connection:

Once you've updated the password, your data will persist permanently in the cloud!

### 📊 MongoDB for VS Code (Optional):

If you want to explore your data visually:
1. Install "MongoDB for VS Code" extension
2. Press `Ctrl+Shift+P` → "MongoDB: Connect"
3. Paste the same connection string (with your actual password)
4. Browse collections, create playgrounds, and query data directly in VS Code

---

**Current Status**: Connection string configured, waiting for password update.
