const fs = require('fs');
const https = require('https');

// Load the raw venue names and districts
const rawVenues = {
    "Ernakulam": [
        "Adlux Convention Centre", "Sree Gokulam Convention Centre", "Lulu Bolgatty International Convention Centre",
        "Zamra International Convention & Exhibition Centre", "Udyan Convention & Exhibition Centre",
        "Rena Event Hub & Convention Centre", "Bhaskareeyam Convention Centre", "Shangrila Convention Centre",
        "CIAL Convention Centre", "Nechupadam Convention Centre", "Azeezia Convention Centre", "Gokulam Park",
        "TDM Hall", "A J Hall", "Sreepoorna Auditorium", "Elegance Convention Center", "Reem Convention Centre",
        "Pushpanjali Auditorium", "Pet Rose Events Center", "Chavara Cultural Centre", "Crown Residency",
        "Sree Saradha Marriage Hall", "Sapthathi Hall", "Cochin Cultural Centre", "Fine Arts Hall", "JT PAC",
        "Samudrika Convention Centre", "Renai Cochin", "Holiday Inn Cochin", "Abad Plaza", " IMA House Kochi",
        "Gokulam Convention Centre"
    ],
    "Thiruvananthapuram": [
        "Al-Saj International Convention Center", "Uday Palace Convention Centre", "RDR Convention Centre",
        "Travancore International Convention Centre", "Mount Carmel Convention Centre", "Girideepam Convention Centre",
        "Crystal Convention Centre", "Mookambika Convention Centre", "Safa Convention Center", "The Sports Hub Convention Centre",
        "Ananthapuri Auditorium", "Revathy Auditorium", "VJT Hall", "Bishop Pereira Hall", "Subramaniam Hall",
        "Senate Hall", "Ragam Auditorium", "Apollo Dimora Banquets", "O by Tamara Banquets", "Gokulam Grand Auditorium",
        "Sri Moolam Club", "Alakapuri Auditorium", "PTA Hall", "Ganesham Auditorium", "Nishagandhi Auditorium",
        "Jimmy George Indoor Stadium", "Hotel SP Grand Days", "Maurya Rajadhani", "The South Park Hotel"
    ],
    "Kozhikode": [
        "K Hills Heritage Convention Centre", "Lavandis Convention Centre", "Luxmore Convention Centre",
        "Miami Convention Centre", "Calicut Trade Centre", "Shangri La Convention Centre", "The Regal Avenue Convention Centre",
        "Udayagiri Convention Centre", "Athafy Auditorium", "Rhythm Event Galleria", "Diamond Plaza Auditorium",
        "Tagore Centenary Hall", "Nova Auditorium", "Peruma Auditorium", "Alba Arcade Auditorium",
        "Majestic Auditorium", "Grand Auditorium", "Sumangali Kalyana Mandapam", "Karthika Kalyana Mandapam", "Nalanda Auditorium",
        "JDT Islam Convention Centre", "HiLite Business Park", "Aashirvad Lawns", "Kandoth Convention Centre",
        "Vyapar Bhavan Auditorium", "Sadhbhavana Auditorium", "Eternity Convention Centre", "Alhind Trade Centre",
        "Yash International", "Tripenta Hotel & Convention Centre"
    ],
    "Idukki": [
        "Michaels Plaza Convention Centre", "Uthram Regency Convention", "Nest Green House Convention Centre",
        "Matha Convention Centre", "Highrange Convention Centre", "Malabar Convention Center", "Josh Pavilion Auditorium",
        "St George Socio-Cultural Center", "Atlanta Auditorium", "Town Hall", "Sreekrishna Temple Auditorium",
        "Krishna Mini Auditorium", "Punarjani Traditional Village", "Krishna Theertham Kalyanamandapam", "Eap Hall"
    ],
    "Kasaragod": [
        "Kanz Convention Centre", "Ashirvad Avenue Convention Centre", "Royal Convention Centre", "Oryx Village",
        "Raj Residency", "Ah Palace", "Akash Convention Centre", "Galaxy Auditorium", "Palladium Convention Centre",
        "Grand Auditorium Manikoth", "Paradise Auditorium", "Nakshathra Auditorium", "Kasaragod Municipal Town Hall",
        "Teresa Hall", "Muhimmath Community Hall", "Sree Lakshmi Kalyana Mandapam"
    ],
    "Pathanamthitta": [
        "The Petras Convention Centre", "Anns Convention Centre", "Loyal Convention Centre", "Balakrishna Convention Centre",
        "Geetham Convention Centre", "Morning Star Convention Center", "Green Valley Convention Centre",
        "Mar Thoma Youth Centre", "Darshana Auditorium", "Anjali Auditorium", "St. George Auditorium",
        "Yahir Auditorium", "Aban Auditorium", "P Subramaniam Hall"
    ],
    "Wayanad": [
        "Cholayil Auditorium", "Chandragiri Auditorium", "Adathara Auditorium", "Vythiri Hall",
        "Lalith Mahal", "Sumangali Kalyana Mandapam", "Haksons Auditorium", "Vythiri Village Resort Boardroom",
        "Taj Wayanad Resort Events", "Green Gates Hotel Events", "Arayal Resort Events", "Fern Tree Resort Conference Hall"
    ],
    "Alappuzha": [
        "Camelot Convention Centre", "Bhuvi Convention Center & Auditorium", "Mikas Convention Centre",
        "Yeskay Convention Center", "Grace Convention Centre", "Lake Palace Resort Venue", "Rajadhani Convention Center",
        "Syamasree Convention Centre", "Mangalya Convention Centre", "Thejus Auditorium", "Kadhisha Auditorium",
        "Aiswarya Auditorium", "Raiban Auditorium", "Veliyil Castles Banquet",
        "SDV Centenary Auditorium", "Rajiv Gandhi Indoor Stadium", "Uday Samudra Backwater Resort", "Lemon Tree Vembanad Lake",
        "Raheem Residency", "Arcadia Regency", "Coir Board Auditorium", "Kuttanad Convention Centre", "Carmel Hall"
    ],
    "Kottayam": [
        "Sunstar Convention Centre", "Aithousa Convention Centre", "Grand Arena Convention Center",
        "Chrysoberyl Hotel & Convention Centre", "Sanjos Convention Center", "Le Grand Convention Center",
        "Mammen Mappilla Hall", "Darsana Auditorium", "Swayamvaram Multipurpose Auditorium", "Ave Maria Event Centre",
        "Chiramel Auditorium", "Nandanam Auditorium", "Thomson Kylas Auditorium", "Vyapara Bhavan Auditorium", "Silver Palace",
        "Mammen Mappillai Hall", "Bakers Resort", "Fathima Matha Auditorium", "Pearl Spot Resort", "Orchid Residency",
        "Mali International", "Ettumanoor Auditorium", "Changanassery Town Hall", "Nisha Auditorium", "Kottayam Club"
    ],
    "Malappuram": [
        "Rose Lounge Convention Centre", "Kiliyamannil Auditorium", "Shifa Convention Center", "Taj Convention Centre",
        "Crown Convention Center", "Heavens Convention Center", "Rio Convention Centre", "Zamra International Convention",
        "Sree Suma Auditorium", "Kooriyad Auditorium", "Peeyem Auditorium", "Shalimar Auditorium",
        "Arafa Auditorium", "Grace Auditorium", "Msm Auditorium Malappuram", "Crown Palace Auditorium",
        "Rubi Arena Convention", "Eadens Holiday Resort", "Grand Thaz", "Hotel Afrad International", "Majlis Complex",
        "Jubilee Auditorium", "Rydges Inn", "Asaam Palace", "City Light Convention Centre"
    ],
    "Kannur": [
        "Babil Greens Convention Centre", "Luxotica International Convention Centre", "Exora Conventions",
        "Mascot Paradise", "Unity Centre", "Partha Convention Centre", "Kannur Convention Center", "Onyx Convention Centre",
        "Navaneetham Auditorium", "Dinesh Auditorium", "Sahana Auditorium", "NNS Auditorium", "Sreevalsam Auditorium",
        "Taj Auditorium", "Town Hall Auditorium", "Sadhoo Kalyana Mandapam", "Riftha Hall Luxury Convention Centre", "Sagara Wedding Mall",
        "Aura Convention Centre", "Shikha Convention Centre", "Sneha Inn", "Broad Bean", "Green Park Residency",
        "Centaur Hotel", "Kairali Heritage", "Costa Malabari", "Sree Chithira Auditorium", "Kottali Convention Centre"
    ],
    "Thrissur": [
        "Lulu International Convention Centre", "Chakolas Pavilion Convention Center", "Heartland Convention Center",
        "Elinor Convention Centre", "Crescent Convention Centre", "Thiruvambady Convention Centre",
        "Jawaharlal Convention Centre", "Sree Parvathy Auditorium", "The Theatre by CG", "Glory Palace Auditorium",
        "Bright Plaza Auditorium", "Celebrations Auditorium", "Santhi Palace Auditorium", "Guruvayur Weddings Hall",
        "Hare Krishna Inn Banquets",
        "Regional Theatre", "Kousthubham Auditorium", "Paramekkavu Vidya Mandir Auditorium", "Elite International",
        "Wellington Convention Centre", "Kalyan Hotel & Convention", "Aquatic Palace", "Celine Convention Centre",
        "Ashirvad Grand", "Sobha City Mall Atrium"
    ],
    "Kollam": [
        "The Quilon Beach Hotel & Convention Centre", "Lalas Convention Centre", "Younus Convention Centre",
        "Pavithram Convention Centre", "Sreedhareeyam Convention Centre", "The Raviz Convention Center",
        "Grand Highness Convention Centre", "Carnival Convention Center", "Sana Auditorium", "Sopanam Auditorium",
        "Town Hall Auditorium", "Crystal Plaza", "ATSK Gardens", "Empire Convention Centre", "Devaki Kalyana Mandapam",
        "C. Kesavan Memorial Town Hall", "TKM Convention Centre", "Nani Hotel", "Sree Chithra Auditorium", "Varkala Beach Events",
        "Aquaserene Resort", "Fragrant Nature", "Nila Palace", "Beach Orchid"
    ],
    "Palakkad": [
        "Club 6 Convention Centre", "MALAZ CONVENTION CENTRE", "N.N.S Convention Centre", "Hi-Tech Auditorium",
        "Kalarikkal Convention Centre", "ALVA Convention Center", "M S Convention Center", "United Convention Centre",
        "Prasanna Lakshmi Auditorium", "Crown Palace Auditorium", "Udhaya Resort Open Auditorium",
        "Mohamed Bagh Event Centre", "Sri Chakra International Banquets", "Sumangali Kalyana Mandapam", "Lulu Auditorium",
        "Jobys Mall Atrium", "Sree Krishna Auditorium", "Rappadi Auditorium", "Indraprastha Hotel", "KPM Residency",
        "Gems 9 Hotel", "Malampuzha Gardens Venue", "Surya City Auditorium", "Dhoni Resorts Venue", "Ahalia Convention Centre"
    ]
};

const DISTRICT_COORDINATES = {
    "Thiruvananthapuram": [8.5241, 76.9366],
    "Kollam": [8.8932, 76.6141],
    "Pathanamthitta": [9.2648, 76.7870],
    "Alappuzha": [9.4981, 76.3388],
    "Kottayam": [9.5916, 76.5222],
    "Idukki": [9.8151, 76.9804],
    "Ernakulam": [9.9816, 76.2999],
    "Thrissur": [10.5276, 76.2144],
    "Palakkad": [10.7867, 76.6548],
    "Malappuram": [11.0714, 76.0740],
    "Kozhikode": [11.2588, 75.7804],
    "Wayanad": [11.6854, 76.1320],
    "Kannur": [11.8745, 75.3704],
    "Kasaragod": [12.4996, 74.9869]
};

const fetchGeocode = async (query) => {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        const res = await fetch(url, { headers: { 'User-Agent': 'SmartEventApp/1.0' } });
        const result = await res.json();
        if (result && result.length > 0) {
            return { lat: parseFloat(result[0].lat), lng: parseFloat(result[0].lon) };
        }
        return null;
    } catch (e) {
        return null;
    }
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
    const finalVenues = {};
    let count = 0;

    for (const district of Object.keys(rawVenues)) {
        finalVenues[district] = [];
        const districtCenter = DISTRICT_COORDINATES[district] || [10.8505, 76.2711];

        for (const venueName of rawVenues[district]) {
            count++;
            let query = `${venueName}, ${district}, Kerala`;

            console.log(`[${count}] Geocoding: ${query}`);
            let coords = await fetchGeocode(query);

            // Wait 1 second to respect Nominatim limits
            await delay(1000);

            if (!coords) {
                // Try a less specific query
                console.log(`    -> Retrying without district for: ${venueName}`);
                coords = await fetchGeocode(`${venueName}, Kerala`);
                await delay(1000);
            }

            if (coords) {
                console.log(`    -> EXACT LOCATION FOUND: ${coords.lat}, ${coords.lng}`);
            } else {
                console.log(`    -> Not found. Using randomized fallback near ${district}`);
                const latOffset = (Math.random() - 0.5) * 0.08;
                const lngOffset = (Math.random() - 0.5) * 0.08;
                coords = {
                    lat: Number((districtCenter[0] + latOffset).toFixed(6)),
                    lng: Number((districtCenter[1] + lngOffset).toFixed(6))
                };
            }

            finalVenues[district].push({
                name: venueName,
                address: `${district}, Kerala`,
                location: coords
            });
        }
    }

    fs.writeFileSync('venueData.js', 'const MANUAL_FALLBACKS = ' + JSON.stringify(finalVenues, null, 4) + ';\n\nmodule.exports = MANUAL_FALLBACKS;');
    console.log('Finished geocoding and saved to venueData.js');
}

main();
