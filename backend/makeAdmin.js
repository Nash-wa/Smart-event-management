const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/userModel');

dotenv.config();
connectDB();

const emailToPromote = process.argv[2];

if (!emailToPromote) {
    console.log("Usage: node makeAdmin.js <user_email>");
    process.exit();
}

const promote = async () => {
    try {
        const user = await User.findOne({ email: emailToPromote });
        if (!user) {
            console.log(`❌ User with email ${emailToPromote} not found.`);
            process.exit();
        }
        user.role = 'admin';
        await user.save();
        console.log(`✅ User ${emailToPromote} is now an ADMIN!`);
        process.exit();
    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        process.exit(1);
    }
};

promote();
