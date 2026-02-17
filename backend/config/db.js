const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        if (!uri) {
            throw new Error('MONGO_URI not defined in environment variables');
        }

        // Try to connect to MongoDB (local or Atlas)
        try {
            const conn = await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 5000
            });

            // Determine connection type
            if (uri.includes('mongodb+srv://') || uri.includes('mongodb.net')) {
                console.log(`✅ MongoDB Connected (Atlas Cloud): ${conn.connection.host}`);
                console.log('💾 Data will persist permanently in the cloud!');
            } else if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
                console.log(`✅ MongoDB Connected (Local): ${conn.connection.host}`);
            } else {
                console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
            }
            return;
        } catch (connectionError) {
            console.log(`⚠️  MongoDB connection failed: ${connectionError.message}`);
            console.log('⚠️  Falling back to In-Memory Database...');

            // Fallback to MongoMemoryServer for instant demo
            mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();

            const conn = await mongoose.connect(uri);
            console.log(`✅ MongoDB Connected (In-Memory): ${conn.connection.host}`);
            console.log('📝 Note: Using temporary database. Data will be lost on restart.');
        }

        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-event');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        console.log('⚠️  Server running without database. Some features may not work.');
    }
};

module.exports = connectDB;
