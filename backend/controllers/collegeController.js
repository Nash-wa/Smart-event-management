const MANUAL_COLLEGES = require('../collegeData');

// Ensure fetch is available in all environments
let fetchFn;
try {
    fetchFn = global.fetch || require('node-fetch');
} catch (e) {
    try {
        fetchFn = require('node-fetch');
    } catch (e2) {
        fetchFn = null;
    }
}

const searchNominatim = async (q, district) => {
    if (!fetchFn) return [];
    const query = `${q} ${district || ''} college`; // bias towards colleges
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&q=${encodeURIComponent(query)}&countrycodes=in`;
    const res = await fetchFn(url, { headers: { 'User-Agent': 'smart-event/1.0 (contact@example.com)' } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.map(r => ({
        name: r.display_name.split(',')[0],
        address: r.display_name,
        location: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) }
    }));
};

exports.searchColleges = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        const district = req.query.district || '';

        // Manual list for the district (fast browse)
        const manualList = MANUAL_COLLEGES[district] || [];

        // If no query provided, prefer manual list. If manual list is empty,
        // fall back to Nominatim search for colleges in the district.
        if (!q) {
            if (manualList.length > 0) {
                return res.json(manualList.slice(0, 50).map(c => ({ name: c.name, address: c.address, location: c.location })));
            }

            // Try Nominatim for district-level college list
            if (fetchFn) {
                try {
                    const nom = await searchNominatim(district, district);
                    return res.json(nom.slice(0, 50));
                } catch (err) {
                    console.warn('Nominatim fallback failed:', err.message);
                    return res.json([]);
                }
            }

            return res.json([]);
        }

        // 1) Search manual list (fast)
        const filteredManual = manualList.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || (c.address || '').toLowerCase().includes(q.toLowerCase()));

        // If manual results are sufficient, return them (but still try nominatim if too few)
        let results = filteredManual.slice(0, 10).map(c => ({ name: c.name, address: c.address, location: c.location }));

        // 2) If not enough, query Nominatim (rate limited, fallback)
        if (results.length < 6 && fetchFn) {
            try {
                const nom = await searchNominatim(q, district);
                // merge unique by name+lat
                const seen = new Set(results.map(r => `${r.name}-${r.location?.lat || ''}`));
                for (const n of nom) {
                    const key = `${n.name}-${n.location.lat}`;
                    if (!seen.has(key)) {
                        results.push(n);
                        seen.add(key);
                    }
                    if (results.length >= 10) break;
                }
            } catch (err) {
                console.warn('Nominatim error:', err.message);
            }
        }

        res.json(results.slice(0, 10));
    } catch (error) {
        console.error('College search error:', error);
        res.status(500).json({ message: 'Search failed' });
    }
};
