const asyncHandler = require('express-async-handler');
const axios = require('axios');

// @desc    Search for venues using OpenStreetMap (Nominatim)
// @route   GET /api/venues/search
// @access  Public
const searchVenues = asyncHandler(async (req, res) => {
    const { district, query, lat, lng } = req.query;

    console.log(`Searching venues for: ${district} ${query}`);

    let results = [];

    // 1. Nominatim Search (OpenStreetMap)
    try {
        // Construct search query
        const searchQuery = query
            ? `${query} in ${district}`
            : `auditorium convention center in ${district}`;

        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=20`;

        const response = await axios.get(nominatimUrl, {
            headers: { 'User-Agent': 'SmartEventManagement/1.0' } // Required by OSM
        });

        if (response.data && response.data.length > 0) {
            results = response.data.map(item => ({
                id: item.place_id,
                name: item.display_name.split(',')[0],
                address: item.display_name,
                location: {
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon)
                },
                category: item.type || 'Venue',
                source: 'OpenStreetMap',
                // Generate a relevant image URL based on category/name
                image: getVenueImage(item.type, item.display_name.split(',')[0])
            }));
        }
    } catch (error) {
        console.error("OSM Search Error:", error.message);
    }

    // 2. Add Distance if user location provided
    if (lat && lng) {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        results = results.map(venue => {
            const dist = calculateDistance(userLat, userLng, venue.location.lat, venue.location.lng);
            return { ...venue, distance: dist };
        }).sort((a, b) => a.distance - b.distance);
    }

    res.json(results);
});

// Helper: Get Image URL (Free Source)
const getVenueImage = (category, name) => {
    // Using Unsplash Source (Random but relevant) or similar
    // Since 'source.unsplash.com' is deprecated, we use specific curated keywords or a robust placeholder service
    // For production, this should connect to Unsplash API with a key. 
    // Here we use a reliable placeholder that generates nice images.

    const keywords = [category, 'convention', 'hall', 'auditorium', 'event'].join(',');
    // Pixabay or Unsplash API would go here. 
    // Fallback to static relevant images for demo reliability without API keys
    return `https://loremflickr.com/640/480/auditorium,building,hall/all?lock=${name.length}`;
};

// Helper: Haversine Distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = {
    searchVenues
};
