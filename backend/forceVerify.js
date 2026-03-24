const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config();

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const users = await User.find({});
        console.log(`Found ${users.length} users`);
        
        for (const user of users) {
            console.log(`Verifying: ${user.email}`);
            user.isVerified = true;
            await user.save();
        }
        
        console.log('✅ All users are now verified.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fix();
