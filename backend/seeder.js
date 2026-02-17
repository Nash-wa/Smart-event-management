const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Vendor = require('./models/vendorModel');

dotenv.config();
connectDB();

const vendors = [
    // Photography
    { name: 'Pixel Perfect Studios', category: 'Photography', price: 500, rating: 4.8, description: 'Capturing moments that last forever.' },
    { name: 'Dream Lens', category: 'Photography', price: 350, rating: 4.5, description: 'Affordable wedding photography.' },

    // Catering
    { name: 'Royal Feast Catering', category: 'Catering', price: 1200, rating: 4.9, description: 'Premium buffer and dining.' },
    { name: 'Spicy Bites', category: 'Catering', price: 800, rating: 4.2, description: 'Best local flavors for your party.' },

    // Music/DJ
    { name: 'DJ Blast', category: 'Music/DJ', price: 300, rating: 4.7, description: 'Rock the dance floor.' },
    { name: 'Melody Band', category: 'Music/DJ', price: 600, rating: 4.6, description: 'Live band performance.' },

    // Decoration
    { name: 'Elegant Decors', category: 'Decoration', price: 400, rating: 4.3, description: 'Minimalist and classy designs.' },
    { name: 'Grand Themes', category: 'Decoration', price: 900, rating: 4.8, description: 'Themed decorations for grand events.' },

    // Invitations
    { name: 'Paper & Ink', category: 'Invitation', price: 50, rating: 4.1, description: 'Custom printed and digital cards.' },
];

const importData = async () => {
    try {
        await Vendor.deleteMany(); // Clear existing data
        await Vendor.insertMany(vendors);
        console.log('✅ Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
