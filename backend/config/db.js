const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        // Try to connect to local MongoDB first
        if (uri && (uri.includes('127.0.0.1') || uri.includes('localhost'))) {
            try {
                const conn = await mongoose.connect(uri, {
                    serverSelectionTimeoutMS: 3000
                });
                console.log(`✅ MongoDB Connected (Local): ${conn.connection.host}`);
                return;
            } catch (localError) {
                console.log('⚠️  No local MongoDB detected. Starting In-Memory Database...');
            }
        }

        // Fallback to MongoMemoryServer for instant demo
        mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();

        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected (In-Memory): ${conn.connection.host}`);
        console.log('📝 Note: Using temporary database. Data will be lost on restart.');

        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-event');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        console.log('⚠️  Server running without database. Some features may not work.');
    }
};

module.exports = connectDB;
