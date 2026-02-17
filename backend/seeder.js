const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Vendor = require('./models/vendorModel');

dotenv.config();
connectDB();

const vendors = [
    // Alappuzha
    { name: 'Bhuvi Convention Center', category: 'Venue', district: 'Alappuzha', address: 'Beside NH47, Nangyarkulangara, Alappuzha', rating: 4.1, price: 50000, isApproved: true },
    { name: 'Camelot Convention Centre', category: 'Venue', district: 'Alappuzha', address: 'NH 47, Pathirappally, Poomkavu, Alappuzha', rating: 4.5, price: 75000, isApproved: true },
    { name: 'Grace Convention Centre', category: 'Venue', district: 'Alappuzha', address: 'Near Laha Junction, Punnamoodu, Mavelikara', rating: 4.4, price: 40000, isApproved: true },

    // Ernakulam
    { name: 'Udyan Convention Centre', category: 'Venue', district: 'Ernakulam', address: 'Kottankavu- Arkakkadavu Road, Vennala, Kochi', rating: 5.0, price: 100000, isApproved: true },
    { name: 'Rena Event Hub', category: 'Venue', district: 'Ernakulam', address: 'Lissie Junction, Banerji Rd, Kaloor, Kochi', rating: 5.0, price: 85000, isApproved: true },
    { name: 'Shangrila Convention Centre', category: 'Venue', district: 'Ernakulam', address: 'Mamangalam, Kaloor, Kochi', rating: 4.5, price: 60000, isApproved: true },

    // Idukki
    { name: 'Hirange Residency', category: 'Venue', district: 'Idukki', address: 'Near Ashirvad Theatre, Pala Road, Thodupuzha', rating: 4.1, price: 35000, isApproved: true },
    { name: 'Merryget', category: 'Venue', district: 'Idukki', address: 'Near Bypass Junction, Thodupuzha', rating: 4.9, price: 45000, isApproved: true },

    // Kannur
    { name: 'Dream Palace Auditorium', category: 'Venue', district: 'Kannur', address: 'Taliparamba, Kannur', rating: 4.0, price: 30000, isApproved: true },
    { name: 'Luxotica International Convention Centre', category: 'Venue', district: 'Kannur', address: 'Kannur City', rating: 4.3, price: 90000, isApproved: true },

    // Kasaragod
    { name: 'Oryx Village', category: 'Venue', district: 'Kasaragod', address: 'Main Road, Kanhangad South', rating: 4.7, price: 55000, isApproved: true },
    { name: 'Grand Auditorium', category: 'Venue', district: 'Kasaragod', address: 'Bangramanjeshwar, Kasaragod', rating: 4.4, price: 40000, isApproved: true },

    // Kollam
    { name: 'Crystal Plaza', category: 'Venue', district: 'Kollam', address: 'Sakthikulangara, Kollam', rating: 4.9, price: 45000, isApproved: true },
    { name: 'Grand Highness Convention Centre', category: 'Venue', district: 'Kollam', address: 'Kollam City', rating: 4.1, price: 70000, isApproved: true },

    // Kottayam
    { name: 'Aithousa Convention Centre', category: 'Venue', district: 'Kottayam', address: 'Choottuveli, Kumaranalloor, Kottayam', rating: 5.0, price: 80000, isApproved: true },
    { name: 'Michaels Plaza Convention Centre', category: 'Venue', district: 'Kottayam', address: 'Ramapuram, Kottayam', rating: 4.5, price: 65000, isApproved: true },

    // Kozhikode
    { name: 'K Hills Heritage Convention Centre', category: 'Venue', district: 'Kozhikode', address: 'Near Farook College, Ramanattukara', rating: 4.5, price: 85000, isApproved: true },
    { name: 'Lavandis Convention Centre', category: 'Venue', district: 'Kozhikode', address: 'Mokavoor, Eranhikkal, Kozhikode', rating: 4.4, price: 70000, isApproved: true },

    // Pathanamthitta
    { name: 'Loyal Convention Centre', category: 'Venue', district: 'Pathanamthitta', address: 'Eraviperoor, Thiruvalla', rating: 4.3, price: 55000, isApproved: true },
    { name: 'Balakrishna Convention Centre', category: 'Venue', district: 'Pathanamthitta', address: 'Kidangannur, Pathanamthitta', rating: 4.4, price: 50000, isApproved: true },

    // Thrissur
    { name: 'Neelambari Ecotourism', category: 'Venue', district: 'Thrissur', address: 'Arattupuzha, Thrissur', rating: 4.5, price: 60000, isApproved: true },
    { name: 'Gk Event Centre', category: 'Venue', district: 'Thrissur', address: 'Mammiyoor, Anakotta Road, Thrissur', rating: 4.8, price: 75000, isApproved: true },

    // Malappuram
    { name: 'Rose Lounge', category: 'Venue', district: 'Malappuram', address: 'Down Hill, Malappuram', rating: 4.2, price: 65000, isApproved: true },
    { name: 'Rio Convention Centre', category: 'Venue', district: 'Malappuram', address: 'Anakkayam, Malappuram', rating: 4.6, price: 70000, isApproved: true },

    // Palakkad
    { name: 'Prasanna Lakshmi Auditorium', category: 'Venue', district: 'Palakkad', address: 'Nurani, Palakkad', rating: 4.2, price: 55000, isApproved: true },
    { name: 'Malaz Convention Centre', category: 'Venue', district: 'Palakkad', address: 'Kunisseri, Palakkad', rating: 4.5, price: 60000, isApproved: true },

    // Thiruvananthapuram
    { name: 'RDR Convention Centre', category: 'Venue', district: 'Thiruvananthapuram', address: 'Edapazhinji, Thiruvananthapuram', rating: 4.3, price: 120000, isApproved: true },
    { name: 'Crystal Convention Centre', category: 'Venue', district: 'Thiruvananthapuram', address: 'Nagaroor, Attingal', rating: 4.3, price: 80000, isApproved: true },

    // Wayanad
    { name: 'Morickap Resort', category: 'Venue', district: 'Wayanad', address: 'Kalpetta, Wayanad', rating: 4.8, price: 95000, isApproved: true },
    { name: 'Vythiri Village Resort', category: 'Venue', district: 'Wayanad', address: 'Kalpetta, Wayanad', rating: 4.7, price: 110000, isApproved: true },

    // General Vendors (Seeded in Ernakulam for simplicity)
    { name: 'Pixel Perfect Studios', category: 'Photography', district: 'Ernakulam', price: 500, rating: 4.8, description: 'Capturing moments.', isApproved: true },
    { name: 'Royal Feast Catering', category: 'Catering', district: 'Ernakulam', price: 1200, rating: 4.9, description: 'Premium buffer.', isApproved: true },
    { name: 'DJ Blast', category: 'Music/DJ', district: 'Ernakulam', price: 300, rating: 4.7, description: 'Rock the floor.', isApproved: true },
    { name: 'Elegant Decors', category: 'Decoration', district: 'Ernakulam', price: 400, rating: 4.3, description: 'Classy designs.', isApproved: true },
    { name: 'Paper & Ink', category: 'Invitation', district: 'Ernakulam', price: 50, rating: 4.1, description: 'Custom cards.', isApproved: true },
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
