# Smart Event Management

A full-stack event management platform facilitating connection between event organizers and reliable vendors (photographers, caterers, etc.).

## 🚀 Features
- **3-Level Dashboard**: Admin, Vendor, User.
- **AI-Powered Recommendations**: Set a budget and get suggested vendor categories.
- **AR Spatial Scan**: Scan your venue dimensions (simulated).
- **Vendor Marketplace**: Browse, filter, and book vendors.
- **Event Planning Wizard**: Step-by-step event creation.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), TailwindCSS
- **Backend**: Node.js, Express, MongoDB
- **AI/AR**: Integrated Node.js modules

## 📦 Installation & Run
1. **Clone the repo**
2. **Install Dependencies**:
   ```bash
   npm run install-all
   ```
   (Or install separately in `frontend` and `backend`).

3. **Environment Setup**:
   - Create `.env` in `backend/` (optional, defaults provided).
   - Create `.env` in `frontend/` with `VITE_API_URL=http://localhost:5000/api`.

4. **Start Application**:
   ```bash
   npm start
   ```
   This runs both backend and frontend concurrently.
