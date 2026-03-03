const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Vendor = require('./models/vendorModel');

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

const CATEGORY_MAPPINGS = {
    'Venue': { tags: 'amenity~"community_centre|events_venue|conference_centre|theatre|townhall"' },
    'Catering': { tags: 'amenity~"restaurant|cafe|food_court"' },
    'Photography': { tags: 'shop~"photo|photo_studio"' },
    'Decoration': { tags: 'shop~"florist|gift"' },
    'Invitation': { tags: 'shop~"copyshop|printing"' },
    'Music/DJ': { tags: 'amenity~"nightclub|pub"|shop~"musical_instrument"' }
};

// Realistic name generators for fallback
const generateRealisticName = (district, category) => {
    const prefixes = ['Royal', 'Grand', 'Perfect', 'Elite', 'Kerala', 'South', 'Classic', 'Premium', 'Star', 'Golden'];
    const suffixMap = {
        'Venue': ['Convention Centre', 'Auditorium', 'Hall', 'Events Hub', 'Residency', 'Palace'],
        'Catering': ['Caterers', 'Food Services', 'Kitchen', 'Banquets', 'Feasts'],
        'Photography': ['Studios', 'Photography', 'Lens', 'Clicks', 'Media', 'Visions'],
        'Decoration': ['Decorators', 'Events & Decor', 'Florals', 'Designs', 'Creations'],
        'Invitation': ['Printers', 'Cards', 'Invitations', 'Graphics', 'Arts'],
        'Music/DJ': ['Beats', 'Sounds', 'Audio', 'Entertainment', 'Events', 'DJ Services']
    };
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixMap[category][Math.floor(Math.random() * suffixMap[category].length)];

    // Mix randomly between: "Prefix Category Suffix", "District Prefix Category Suffix", etc.
    if (Math.random() > 0.5) {
        return `${prefix} ${suffix} ${district}`;
    } else {
        return `${district} ${prefix} ${suffix}`;
    }
};

const fetchServicesForDistrict = async (district, category) => {
    const searchName = OVERPASS_NAMES[district] || district;
    const tagQuery = CATEGORY_MAPPINGS[category].tags;

    console.log(`Fetching ${category} for ${district}...`);

    const query = `
    [out:json][timeout:25];
    area["name"="Kerala"]["admin_level"="4"]->.kerala;
    area["name"="${searchName}"](area.kerala)->.searchArea;
    (
      node[${tagQuery}](area.searchArea);
      way[${tagQuery}](area.searchArea);
      relation[${tagQuery}](area.searchArea);
    );
    out center limit 15;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    let fetchedData = [];
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (data.elements) {
                fetchedData = data.elements.map(el => {
                    const name = el.tags.name || `Unnamed ${category}`;
                    return {
                        name: name,
                        category: category,
                        district: district,
                        address: el.tags['addr:full'] || el.tags['addr:street'] || `Located in ${district}`,
                        location: {
                            lat: el.lat || el.center?.lat,
                            lng: el.lon || el.center?.lon
                        },
                        isApproved: true
                    };
                }).filter(v => v.name && !v.name.startsWith('Unnamed'));
            }
        }
    } catch (error) {
        console.error(`Error fetching Overpass data for ${category} in ${district}:`, error.message);
    }

    // Always ensure we have at least 8 highly realistic vendors per category per district.
    const finalVendors = [...fetchedData];

    let requiredFallbacks = 8;
    // For specific subcategories, force more fallbacks because Overpass might not match weddings well
    if (category === 'Music/DJ' || category === 'Decoration' || category === 'Invitation') requiredFallbacks = 10;

    let fallbackCount = 0;
    while (finalVendors.length < requiredFallbacks) {
        fallbackCount++;
        const fallbackName = generateRealisticName(district, category);
        // Avoid exact duplicate names
        if (finalVendors.some(v => v.name === fallbackName)) continue;

        finalVendors.push({
            name: fallbackName,
            category: category,
            district: district,
            address: `Primary Center, ${district}, Kerala`,
            location: { // Add slight random offset to district center (mocked roughly across kerala)
                lat: 9.9312328 + (Math.random() - 0.5) * 2, // Approximation
                lng: 76.2673041 + (Math.random() - 0.5) * 1.5
            },
            isApproved: true
        });
    }

    // Enhance all parsed and generated vendors with realistic Google Review data and prices
    return finalVendors.map(vendor => {
        const reviewCount = Math.floor(Math.random() * (850 - 15) + 15);
        // Skew ratings to generally be good as a business
        const rating = parseFloat((Math.random() * (1.2) + 3.8).toFixed(1)); // 3.8 to 5.0

        // Dynamic realistic pricing based on category
        let basePrice = 5000;
        if (category === 'Venue') basePrice = 30000 + Math.random() * 100000;
        else if (category === 'Catering') basePrice = 400 + Math.random() * 1500; // Per plate usually, but assuming total package here: 15000+
        else if (category === 'Photography') basePrice = 25000 + Math.random() * 75000;
        else if (category === 'Decoration') basePrice = 10000 + Math.random() * 90000;
        else if (category === 'Music/DJ') basePrice = 8000 + Math.random() * 25000;
        else if (category === 'Invitation') basePrice = 2000 + Math.random() * 8000;

        if (category === 'Catering') basePrice = 15000 + Math.random() * 50000; // Package price

        return {
            ...vendor,
            rating: rating,
            reviewCount: reviewCount,
            reliabilityScore: Math.floor(Math.random() * 20 + 80), // 80 - 100
            price: Math.floor(basePrice),
            performanceMetrics: {
                responsiveness: Math.floor(Math.random() * 20 + 80),
                punctuality: Math.floor(Math.random() * 20 + 80),
                quality: rating * 20, // max 100
            },
            googleReviewsUrl: `https://www.google.com/search?q=${encodeURIComponent(vendor.name + ' ' + district + ' reviews')}`,
            instagramUrl: `https://instagram.com/explore/tags/${vendor.name.replace(/[^a-zA-Z0-9]/g, '')}`
        };
    });
};

const seedServiceData = async () => {
    await connectDB();

    try {
        console.log("Clearing all existing vendors to refresh with realistic data...");
        await Vendor.deleteMany({});

        let allServices = [];
        const categories = Object.keys(CATEGORY_MAPPINGS);

        for (const district of KERALA_DISTRICTS) {
            for (const category of categories) {
                let services = await fetchServicesForDistrict(district, category);
                allServices = allServices.concat(services);
                // Respect Overpass API rate limits (1 request per sec ish)
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }

        if (allServices.length > 0) {
            // Remove exact duplicates by Name + District
            const uniqueServices = Array.from(new Map(allServices.map(v => [v.name + v.district, v])).values());
            await Vendor.insertMany(uniqueServices);
            console.log(`\n✅ Successfully seeded ${uniqueServices.length} highly realistic vendors across all categories and districts!`);
        } else {
            console.log('\n❌ No Vendors generated.');
        }

        process.exit();
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedServiceData();
