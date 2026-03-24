const MANUAL_COLLEGES = require('../collegeData');
const College = require('../models/collegeModel');

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

const searchNominatim = async (q, district, limit = 10) => {
    if (!fetchFn) return [];
    
    // Construct query to prioritize colleges in the specific district
    const query = (q.toLowerCase().includes('college') ? `${q} ${district || ''}` : `${q} college ${district || ''}`).trim();
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=${limit}&q=${encodeURIComponent(query)}&countrycodes=in`;
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

        // 1) Search in Database (MongoDB)
        const dbFilter = { isApproved: true };
        if (district) dbFilter.district = district;
        if (q) dbFilter.name = { $regex: q, $options: 'i' };
        
        const dbColleges = await College.find(dbFilter).limit(20);
        let results = dbColleges.map(c => ({
            name: c.name,
            address: c.address,
            location: c.location,
            source: 'db'
        }));

        // 2) Merge with manual list
        const manualList = MANUAL_COLLEGES[district] || [];
        const filteredManual = manualList.filter(c => 
            !q || c.name.toLowerCase().includes(q.toLowerCase()) || (c.address || '').toLowerCase().includes(q.toLowerCase())
        );

        const seenNames = new Set(results.map(r => r.name.toLowerCase()));
        for (const c of filteredManual) {
            if (!seenNames.has(c.name.toLowerCase())) {
                results.push({
                    name: c.name,
                    address: c.address,
                    location: c.location,
                    source: 'manual'
                });
                seenNames.add(c.name.toLowerCase());
            }
        }

        // 3) If still few results (less than 15) and (q or district) is provided, try Nominatim
        if (results.length < 15 && fetchFn && (q || district)) {
            try {
                // If browsing by district (no q), get more results (up to 75)
                const nomLimit = q ? 15 : 75; 
                const nom = await searchNominatim(q || district, district, nomLimit);
                for (const n of nom) {
                    if (!seenNames.has(n.name.toLowerCase())) {
                        results.push({ ...n, source: 'nominatim' });
                        seenNames.add(n.name.toLowerCase());
                    }
                }
            } catch (err) {
                console.warn('Nominatim error:', err.message);
            }
        }

        res.json(results.slice(0, 100));
    } catch (error) {
        console.error('College search error:', error);
        res.status(500).json({ message: 'Search failed' });
    }
};
