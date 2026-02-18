const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/userModel');

dotenv.config();
connectDB();

const resetAdmin = async () => {
    try {
        const user = await User.findOne({ email: 'admin@example.com' });
        if (!user) {
            console.log("❌ Admin user not found.");
            process.exit();
        }
        user.password = 'admin123';
        await user.save();
        console.log("✅ Admin password reset to: admin123");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetAdmin();
