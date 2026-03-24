const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const exists = await User.findOne({ email: 'admin@example.com' });
        if (exists) {
            console.log('Admin already exists');
            process.exit();
        }
        
        await User.create({
            name: 'System Admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            isVerified: true
        });
        
        console.log('✅ Admin user created: admin@example.com / admin123');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
