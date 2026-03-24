const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/eventModel');

dotenv.config();

const checkEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Event.countDocuments({});
        console.log(`Total Events in DB: ${count}`);
        if (count > 0) {
            const events = await Event.find({}).limit(5);
            console.log('--- Sample Events ---');
            events.forEach(e => console.log(`- ${e.name} (Category: ${e.category}, Status: ${e.status})`));
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkEvents();
