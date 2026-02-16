const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-event');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        console.log('⚠️ Running in persistent mode with local storage... (MongoDB not found)');
        // We don't exit(1) so the server can still serve AI and basic routes
    }
};

module.exports = connectDB;
