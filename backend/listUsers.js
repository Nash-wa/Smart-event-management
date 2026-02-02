const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/userModel');

dotenv.config();
connectDB();

const list = async () => {
    try {
        const users = await User.find({}, 'name email role');
        console.log('--- Current Users ---');
        users.forEach(u => console.log(`- ${u.name} (${u.email}) Role: ${u.role}`));
        console.log('---------------------');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

list();
