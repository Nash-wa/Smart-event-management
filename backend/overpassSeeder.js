const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Vendor = require('./models/vendorModel');
const MANUAL_FALLBACKS = require('./venueData');

// Ensure fetch is available in all environments
let fetch;
try {
    fetch = global.fetch || require('node-fetch');
} catch (e) {
    console.warn("Native fetch not found, falling back to node-fetch...");
    try {
        fetch = require('node-fetch');
    } catch (e2) {
        console.error("CRITICAL: node-fetch is not installed. Please run 'npm install node-fetch'");
        process.exit(1);
    }
}

dotenv.config();

const KERALA_DISTRICTS = [
    "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod",
    "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad",
    "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
];

// Map for Overpass specific names if different
const OVERPASS_NAMES = {
    "Thiruvananthapuram": "Thiruvananthapuram District",
    "Kozhikode": "Kozhikode District",
    "Ernakulam": "Ernakulam District"
};

const fetchVenuesForDistrict = async (district) => {
    const searchName = OVERPASS_NAMES[district] || district;
    console.log(`Fetching venues for ${district} (Query: ${searchName})...`);

    const query = `
    [out:json][timeout:90];
    area["name"="Kerala"]["admin_level"="4"]->.kerala;
    area["name"="${searchName}"](area.kerala)->.searchArea;
    (
      node["amenity"~"community_centre|events_venue|conference_centre|theatre|townhall|auditorium|hall|convention_centre"](area.searchArea);
      way["amenity"~"community_centre|events_venue|conference_centre|theatre|townhall|auditorium|hall|convention_centre"](area.searchArea);
      relation["amenity"~"community_centre|events_venue|conference_centre|theatre|townhall|auditorium|hall|convention_centre"](area.searchArea);
      
      node["building"~"auditorium|hall|community_centre|convention_centre"](area.searchArea);
      way["building"~"auditorium|hall|community_centre|convention_centre"](area.searchArea);
      relation["building"~"auditorium|hall|community_centre|convention_centre"](area.searchArea);
      
      node["leisure"~"resort"](area.searchArea);
      way["leisure"~"resort"](area.searchArea);
      relation["leisure"~"resort"](area.searchArea);
    );
    out center;
  `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`API Error for ${district}: ${response.statusText}`);
            return [];
        }
        const data = await response.json();
        if (!data.elements) return [];

        return data.elements.map(el => ({
            name: el.tags.name || `Unnamed ${el.tags.amenity || 'Venue'}`,
            category: 'Venue',
            district: district,
            address: el.tags['addr:full'] || el.tags['addr:street'] || `Located in ${district}`,
            location: {
                lat: el.lat || el.center?.lat,
                lng: el.lon || el.center?.lon
            },
            rating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
            price: Math.floor(Math.random() * (150000 - 20000) + 20000),
            isApproved: true
        })).filter(v => v.name && !v.name.startsWith('Unnamed'));
    } catch (error) {
        console.error(`Error fetching for ${district}:`, error.message);
        return [];
    }
};

const seedOverpassData = async () => {
    await connectDB();

    try {
        await Vendor.deleteMany({ category: 'Venue' });
        console.log("Cleared existing venues.");

        let allVenues = [];

        for (const district of KERALA_DISTRICTS) {
            let venues = await fetchVenuesForDistrict(district);

            // Apply fallback data to ensure curated venues are included
            if (MANUAL_FALLBACKS[district]) {
                const fallbacks = MANUAL_FALLBACKS[district].map(fb => ({
                    ...fb,
                    category: 'Venue',
                    district: district,
                    rating: parseFloat((Math.random() * (5 - 4.0) + 4.0).toFixed(1)),
                    price: Math.floor(Math.random() * (150000 - 20000) + 20000),
                    isApproved: true
                }));

                const existingNames = new Set(venues.map(v => v.name));
                const uniqueFallbacks = fallbacks.filter(fb => !existingNames.has(fb.name));
                venues = [...venues, ...uniqueFallbacks];
            }

            console.log(`Found ${venues.length} venues in ${district}`);
            allVenues = allVenues.concat(venues);

            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (allVenues.length > 0) {
            const uniqueVenues = Array.from(new Map(allVenues.map(v => [v.name + v.district, v])).values());
            await Vendor.insertMany(uniqueVenues);
            console.log(`✅ Successfully seeded ${uniqueVenues.length} venues!`);
        } else {
            console.log('❌ No venues found to seed.');
        }

        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedOverpassData();
