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

const fetchVenuesForDistrict = async (district, retryCount = 0) => {
    const searchName = OVERPASS_NAMES[district] || district;
    if (retryCount === 0) {
        console.log(`Fetching venues for ${district} (Query: ${searchName})...`);
    } else {
        console.log(`♻️ Retry #${retryCount} for ${district}...`);
    }

    const query = `
    [out:json][timeout:60];
    area["name"="Kerala"]["admin_level"="4"]->.kerala;
    area["name"="${searchName}"](area.kerala)->.searchArea;
    (
      node["amenity"~"community_centre|events_venue|conference_centre|theatre|townhall"](area.searchArea);
      way["amenity"~"community_centre|events_venue|conference_centre|theatre|townhall"](area.searchArea);
      relation["amenity"~"community_centre|events_venue|conference_centre|theatre|townhall"](area.searchArea);
    );
    out center;
  `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);

        if (response.status === 429 || response.status >= 500) {
            if (retryCount < 2) {
                const waitTime = (retryCount + 1) * 5000;
                console.warn(`⚠️ API Error ${response.status} for ${district}. Retrying in ${waitTime / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                return fetchVenuesForDistrict(district, retryCount + 1);
            }
        }

        if (!response.ok) {
            console.warn(`❌ API persistent error for ${district}: ${response.statusText}`);
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
        if (retryCount < 2) {
            console.warn(`⚠️ Connection error for ${district}: ${error.message}. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return fetchVenuesForDistrict(district, retryCount + 1);
        }
        console.error(`❌ Max retries reached for ${district}:`, error.message);
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

            // Fallback logic for reliability
            if (venues.length < 5 && MANUAL_FALLBACKS[district]) {
                console.log(`⚠️ Low API results for ${district}. Applying fallback data.`);

                // Coordinates for fallback centers (approximate)
                const DISTRICT_COORDS = {
                    "Alappuzha": [9.4981, 76.3388], "Ernakulam": [9.9312, 76.2673],
                    "Idukki": [9.8500, 76.9700], "Kannur": [11.8745, 75.3704],
                    "Kasaragod": [12.4996, 74.9869], "Kollam": [8.8932, 76.6141],
                    "Kottayam": [9.5916, 76.5221], "Kozhikode": [11.2588, 75.7804],
                    "Malappuram": [11.0735, 76.0740], "Palakkad": [10.7867, 76.6547],
                    "Pathanamthitta": [9.2648, 76.7870], "Thiruvananthapuram": [8.5241, 76.9366],
                    "Thrissur": [10.5276, 76.2144], "Wayanad": [11.6854, 76.1320]
                };

                const fallbacks = MANUAL_FALLBACKS[district].map(fb => {
                    const center = DISTRICT_COORDS[district] || [10.8505, 76.2711];
                    // Add a tiny bit of random spread (±0.02 deg ~ 2km)
                    const lat = fb.location?.lat || (center[0] + (Math.random() - 0.5) * 0.04);
                    const lng = fb.location?.lng || (center[1] + (Math.random() - 0.5) * 0.04);

                    return {
                        ...fb,
                        category: 'Venue',
                        district: district,
                        location: { lat, lng },
                        rating: parseFloat((Math.random() * (5 - 4.0) + 4.0).toFixed(1)),
                        price: Math.floor(Math.random() * (150000 - 20000) + 20000),
                        isApproved: true
                    };
                });

                const existingNames = new Set(venues.map(v => v.name));
                const uniqueFallbacks = fallbacks.filter(fb => !existingNames.has(fb.name));
                venues = [...venues, ...uniqueFallbacks];
            }

            console.log(`Found ${venues.length} venues in ${district}`);
            allVenues = allVenues.concat(venues);

            // Wait 4 seconds between districts to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 4000));
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
