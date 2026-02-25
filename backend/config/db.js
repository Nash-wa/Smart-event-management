const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        if (!uri) {
            console.warn('⚠️ MONGO_URI not defined in environment variables');
            // Allow fallback if URI is missing
        }

        // 1. Try to connect to configured MongoDB (Atlas or Local)
        if (uri) {
            try {
                const conn = await mongoose.connect(uri, {
                    serverSelectionTimeoutMS: 5000 // 5 second timeout for Atlas
                });

                if (uri.includes('mongodb+srv://') || uri.includes('mongodb.net')) {
                    console.log(`✅ MongoDB Connected (Atlas Cloud): ${conn.connection.host}`);
                    console.log('💾 Data will persist permanently in the cloud!');
                } else {
                    console.log(`✅ MongoDB Connected (Local/Custom): ${conn.connection.host}`);
                }
                return; // Success! Exit function.
            } catch (connectionError) {
                console.log(`⚠️  Link to primary database failed: ${connectionError.message}`);
                console.log('⚠️  Falling back to In-Memory Database...');
            }
        }

        // 2. Fallback to Local Persistent Database
        try {
            const fs = require('fs');
            const path = require('path');
            const dbPath = path.join(__dirname, '../data/db');

            if (!fs.existsSync(dbPath)) {
                fs.mkdirSync(dbPath, { recursive: true });
            }

            mongoServer = await MongoMemoryServer.create({
                instance: {
                    dbPath: dbPath,
                    storageEngine: 'wiredTiger'
                }
            });
            const memUri = mongoServer.getUri();

            const memConn = await mongoose.connect(memUri);
            console.log(`✅ MongoDB Connected (Local Fallback): ${memConn.connection.host}`);
            console.log('💾 Note: Using local permanent database! Data is safely stored in backend/data/db folder and WILL NOT be lost on server restart. You are good to go!');
        } catch (memError) {
            console.error(`❌ In-Memory DB Error: ${memError.message}`);
            throw memError; // Re-throw if even fallback fails
        }

    } catch (error) {
        console.error(`❌ Critical Database Error: ${error.message}`);
        console.log('⚠️  Server running without database functionality.');
    }
};

module.exports = connectDB;
