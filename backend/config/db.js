const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-event-management';
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host} | Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.warn(`⚠️  Running in offline/in-memory mode. Data will NOT persist.`);
        // Do NOT exit — controllers have an isDbConnected() fallback to in-memory storage
    }
};

module.exports = connectDB;
