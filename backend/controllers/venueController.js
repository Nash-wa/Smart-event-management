const asyncHandler = require('express-async-handler');
const axios = require('axios');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// @desc    Search for venues using Google Places API (with OSM fallback)
// @route   GET /api/venues/search
// @access  Public
const searchVenues = asyncHandler(async (req, res) => {
    const { district, query, lat, lng } = req.query;

    console.log(`Searching venues for: ${district} ${query}`);

    // ── 1. Google Places Text Search ──────────────────────────────────────────
    if (GOOGLE_API_KEY) {
        try {
            const searchQuery = query
                ? `${query} in ${district}, Kerala, India`
                : `event venue auditorium convention hall in ${district}, Kerala, India`;

            const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
            const response = await axios.get(placesUrl, {
                params: {
                    query: searchQuery,
                    key: GOOGLE_API_KEY,
                    region: 'in',
                    ...(lat && lng ? { location: `${lat},${lng}`, radius: 30000 } : {})
                }
            });

            if (response.data.results && response.data.results.length > 0) {
                const results = response.data.results.map(place => {
                    // Build photo URL if available
                    const photoRef = place.photos?.[0]?.photo_reference;
                    const photoUrl = photoRef
                        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`
                        : getVenueImage(place.types?.[0], place.name);

                    const distance = (lat && lng)
                        ? calculateDistance(parseFloat(lat), parseFloat(lng),
                            place.geometry.location.lat, place.geometry.location.lng)
                        : null;

                    return {
                        id: place.place_id,
                        name: place.name,
                        address: place.formatted_address,
                        location: {
                            lat: place.geometry.location.lat,
                            lng: place.geometry.location.lng
                        },
                        rating: place.rating || null,
                        totalRatings: place.user_ratings_total || 0,
                        category: place.types?.[0]?.replace(/_/g, ' ') || 'Venue',
                        image: photoUrl,
                        source: 'Google Places',
                        mapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
                        ...(distance !== null ? { distance } : {})
                    };
                });

                // Sort by distance if location provided, else by rating
                if (lat && lng) {
                    results.sort((a, b) => (a.distance || 999) - (b.distance || 999));
                } else {
                    results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                }

                return res.json(results);
            }
        } catch (error) {
            console.error('Google Places Error:', error.response?.data?.error_message || error.message);
            // Fall through to OSM fallback
        }
    }

    // ── 2. Fallback: OpenStreetMap Nominatim ──────────────────────────────────
    try {
        const searchQuery = query
            ? `${query} in ${district}`
            : `auditorium convention center in ${district}`;

        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=20`;

        const response = await axios.get(nominatimUrl, {
            headers: { 'User-Agent': 'SmartEventManagement/1.0' }
        });

        let results = [];
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
                image: getVenueImage(item.type, item.display_name.split(',')[0]),
                mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lon}`
            }));
        }

        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            results = results.map(venue => ({
                ...venue,
                distance: calculateDistance(userLat, userLng, venue.location.lat, venue.location.lng)
            })).sort((a, b) => a.distance - b.distance);
        }

        return res.json(results);
    } catch (error) {
        console.error('OSM Search Error:', error.message);
        return res.json([]);
    }
});

// Helper: Fallback image
const getVenueImage = (category, name) => {
    return `https://loremflickr.com/640/480/auditorium,building,hall/all?lock=${(name || '').length}`;
};

// Helper: Haversine Distance (km)
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

module.exports = { searchVenues };
