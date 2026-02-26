const fs = require('fs');

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

const rawVenues = {
    "Ernakulam": [
        "Adlux Convention Centre", "Sree Gokulam Convention Centre", "Lulu Bolgatty International Convention Centre",
        "Zamra International Convention & Exhibition Centre", "Udyan Convention & Exhibition Centre",
        "Rena Event Hub & Convention Centre", "Bhaskareeyam Convention Centre", "Shangrila Convention Centre",
        "CIAL Convention Centre", "Nechupadam Convention Centre", "Azeezia Convention Centre", "Gokulam Park",
        "TDM Hall", "A J Hall", "Sreepoorna Auditorium", "Elegance Convention Center", "Reem Convention Centre",
        "Pushpanjali Auditorium", "Pet Rose Events Center", "Chavara Cultural Centre", "Crown Residency",
        "Sree Saradha Marriage Hall", "Sapthathi Hall"
    ],
    "Thiruvananthapuram": [
        "Al-Saj International Convention Center", "Uday Palace Convention Centre", "RDR Convention Centre",
        "Travancore International Convention Centre", "Mount Carmel Convention Centre", "Girideepam Convention Centre",
        "Crystal Convention Centre", "Mookambika Convention Centre", "Safa Convention Center", "The Sports Hub Convention Centre",
        "Ananthapuri Auditorium", "Revathy Auditorium", "VJT Hall", "Bishop Pereira Hall", "Subramaniam Hall",
        "Senate Hall", "Ragam Auditorium", "Apollo Dimora Banquets", "O by Tamara Banquets", "Gokulam Grand Auditorium"
    ],
    "Kozhikode": [
        "K Hills Heritage Convention Centre", "Lavandis Convention Centre", "Luxmore Convention Centre",
        "Miami Convention Centre", "Calicut Trade Centre", "Shangri La Convention Centre", "The Regal Avenue Convention Centre",
        "Udayagiri Convention Centre", "Athafy Auditorium", "Rhythm Event Galleria", "Diamond Plaza Auditorium",
        "Tagore Centenary Hall", "Nova Auditorium", "Peruma Auditorium", "Alba Arcade Auditorium",
        "Majestic Auditorium", "Grand Auditorium", "Sumangali Kalyana Mandapam", "Karthika Kalyana Mandapam", "Nalanda Auditorium"
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
        "Aiswarya Auditorium", "Raiban Auditorium", "Veliyil Castles Banquet"
    ],
    "Kottayam": [
        "Sunstar Convention Centre", "Aithousa Convention Centre", "Grand Arena Convention Center",
        "Chrysoberyl Hotel & Convention Centre", "Sanjos Convention Center", "Le Grand Convention Center",
        "Mammen Mappilla Hall", "Darsana Auditorium", "Swayamvaram Multipurpose Auditorium", "Ave Maria Event Centre",
        "Chiramel Auditorium", "Nandanam Auditorium", "Thomson Kylas Auditorium", "Vyapara Bhavan Auditorium", "Silver Palace"
    ],
    "Malappuram": [
        "Rose Lounge Convention Centre", "Kiliyamannil Auditorium", "Shifa Convention Center", "Taj Convention Centre",
        "Crown Convention Center", "Heavens Convention Center", "Rio Convention Centre", "Zamra International Convention",
        "Sree Suma Auditorium", "Kooriyad Auditorium", "Peeyem Auditorium", "Shalimar Auditorium",
        "Arafa Auditorium", "Grace Auditorium", "Msm Auditorium Malappuram", "Crown Palace Auditorium"
    ],
    "Kannur": [
        "Babil Greens Convention Centre", "Luxotica International Convention Centre", "Exora Conventions",
        "Mascot Paradise", "Unity Centre", "Partha Convention Centre", "Kannur Convention Center", "Onyx Convention Centre",
        "Navaneetham Auditorium", "Dinesh Auditorium", "Sahana Auditorium", "NNS Auditorium", "Sreevalsam Auditorium",
        "Taj Auditorium", "Town Hall Auditorium", "Sadhoo Kalyana Mandapam", "Riftha Hall Luxury Convention Centre", "Sagara Wedding Mall"
    ],
    "Thrissur": [
        "Lulu International Convention Centre", "Chakolas Pavilion Convention Center", "Heartland Convention Center",
        "Elinor Convention Centre", "Crescent Convention Centre", "Thiruvambady Convention Centre",
        "Jawaharlal Convention Centre", "Sree Parvathy Auditorium", "The Theatre by CG", "Glory Palace Auditorium",
        "Bright Plaza Auditorium", "Celebrations Auditorium", "Santhi Palace Auditorium", "Guruvayur Weddings Hall",
        "Hare Krishna Inn Banquets"
    ],
    "Kollam": [
        "The Quilon Beach Hotel & Convention Centre", "Lalas Convention Centre", "Younus Convention Centre",
        "Pavithram Convention Centre", "Sreedhareeyam Convention Centre", "The Raviz Convention Center",
        "Grand Highness Convention Centre", "Carnival Convention Center", "Sana Auditorium", "Sopanam Auditorium",
        "Town Hall Auditorium", "Crystal Plaza", "ATSK Gardens", "Empire Convention Centre", "Devaki Kalyana Mandapam"
    ],
    "Palakkad": [
        "Club 6 Convention Centre", "MALAZ CONVENTION CENTRE", "N.N.S Convention Centre", "Hi-Tech Auditorium",
        "Kalarikkal Convention Centre", "ALVA Convention Center", "M S Convention Center", "United Convention Centre",
        "Prasanna Lakshmi Auditorium", "Crown Palace Auditorium", "Udhaya Resort Open Auditorium",
        "Mohamed Bagh Event Centre", "Sri Chakra International Banquets", "Sumangali Kalyana Mandapam", "Lulu Auditorium"
    ]
};

const scrapedVenues = {};

Object.keys(rawVenues).forEach(district => {
    scrapedVenues[district] = [];
    const coords = DISTRICT_COORDINATES[district] || [10.8505, 76.2711]; // default kerala

    rawVenues[district].forEach(venueName => {
        // Generate a small random offset within approx ~5km radius
        const latOffset = (Math.random() - 0.5) * 0.08;
        const lngOffset = (Math.random() - 0.5) * 0.08;

        scrapedVenues[district].push({
            name: venueName,
            address: `${district}, Kerala`,
            location: {
                lat: Number((coords[0] + latOffset).toFixed(6)),
                lng: Number((coords[1] + lngOffset).toFixed(6))
            }
        });
    });
});

fs.writeFileSync('scraped_venues.js', 'module.exports = ' + JSON.stringify(scrapedVenues, null, 4) + ';\n');
console.log('Successfully generated scraped_venues.js');
