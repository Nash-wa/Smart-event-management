const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config();

const verifyAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await User.updateMany(
            { isVerified: false },
            { $set: { isVerified: true } }
        );
        console.log(`✅ Success! Updated ${result.modifiedCount} users to verified status.`);
        process.exit();
    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        process.exit(1);
    }
};

verifyAll();
