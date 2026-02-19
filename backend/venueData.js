const MANUAL_FALLBACKS = {
    "Thiruvananthapuram": [
        { name: "Al Saj Convention Centre", address: "Kazhakkoottam, Thiruvananthapuram", location: { lat: 8.575396, lng: 76.869806 } },
        { name: "RDR Convention Centre", address: "Edapazhinji, Thiruvananthapuram", location: { lat: 8.50358, lng: 76.9681 } },
        { name: "Girideepam Convention Centre", address: "Nalanchira, Thiruvananthapuram", location: { lat: 8.55146, lng: 76.93918 } },
        { name: "Udaya Samudra Leisure Beach Hotel", address: "Kovalam, Thiruvananthapuram", location: { lat: 8.3986, lng: 76.9806 } },
        { name: "Hycinth Hotels", address: "Manorama Road, Thiruvananthapuram", location: { lat: 8.4975, lng: 76.9535 } },
        { name: "Apollo Dimora", address: "Thampanoor, Thiruvananthapuram", location: { lat: 8.4913, lng: 76.9525 } },
        { name: "Classic Avenue", address: "Manjalikulam Road, Thiruvananthapuram", location: { lat: 8.4935, lng: 76.9490 } },
        { name: "B-Hub", address: "Mar Ivanios Vidya Nagar, Thiruvananthapuram", location: { lat: 8.5456, lng: 76.9385 } },
        { name: "Travancore International Convention Centre", address: "Karyavattom, Thiruvananthapuram", location: { lat: 8.5635, lng: 76.8835 } },
        { name: "St. Joseph's Auditorium", address: "Palayam, Thiruvananthapuram", location: { lat: 8.5050, lng: 76.9550 } },
        { name: "Vylopilly Samskrithi Bhavan", address: "Nalanda, Thiruvananthapuram", location: { lat: 8.5135, lng: 76.9545 } },
        { name: "Mascot Hotel", address: "PMGSY Road, Thiruvananthapuram", location: { lat: 8.5085, lng: 76.9620 } }
    ],
    "Alappuzha": [
        { name: "Camelot Convention Centre", address: "Pathirappally, Alappuzha", location: { lat: 9.5317, lng: 76.3268 } },
        { name: "Bhuvi Convention Center", address: "Nangyarkulangara, Alappuzha", location: { lat: 9.2789, lng: 76.4712 } },
        { name: "Grace Convention Centre", address: "Mavelikara, Alappuzha", location: { lat: 9.3000, lng: 76.5333 } },
        { name: "Ramada by Wyndham", address: "Nehru Trophy Boat Race Finishing Point, Alappuzha", location: { lat: 9.4925, lng: 76.3400 } },
        { name: "Sterling Lake Palace", address: "Vembanad Lake, Alappuzha", location: { lat: 9.5100, lng: 76.3500 } }
    ],
    "Ernakulam": [
        { name: "Lulu Bolgatty International Convention Center", address: "Mulavukad, Kochi", location: { lat: 9.9925, lng: 76.2640 } },
        { name: "Adlux International Convention & Exhibition Centre", address: "Angamaly, Ernakulam", location: { lat: 10.2373, lng: 76.3665 } },
        { name: "Cial Convention Centre", address: "Nedumbassery, Ernakulam", location: { lat: 10.1500, lng: 76.3900 } },
        { name: "Gokulam Park", address: "Kaloor, Kochi", location: { lat: 9.9880, lng: 76.2890 } },
        { name: "Le Meridien Kochi", address: "Maradu, Kochi", location: { lat: 9.9320, lng: 76.3150 } },
        { name: "Crowne Plaza Kochi", address: "Kundannoor, Kochi", location: { lat: 9.9350, lng: 76.3180 } },
        { name: "Grand Hyatt Kochi Bolgatty", address: "Bolgatty Island, Kochi", location: { lat: 9.9930, lng: 76.2650 } }
    ],
    "Idukki": [
        { name: "Marian Center", address: "Marykulam, Idukki", location: { lat: 9.69761, lng: 77.04092 } },
        { name: "Green Berg Resort", address: "Kulamavu, Idukki", location: { lat: 9.8100, lng: 76.8800 } },
        { name: "Silver Tips", address: "Munnar, Idukki", location: { lat: 10.0880, lng: 77.0600 } },
        { name: "Mountain Club Resort", address: "Chinnakanal, Idukki", location: { lat: 10.0200, lng: 77.1800 } }
    ],
    "Kannur": [
        { name: "Sreevalsam Auditorium", address: "Payyanur, Kannur", location: { lat: 12.1000, lng: 75.2000 } },
        { name: "Luxotica International Convention Centre", address: "Kannur", location: { lat: 11.8700, lng: 75.3700 } },
        { name: "Mascot Beach Resort", address: "Burnacherry, Kannur", location: { lat: 11.8600, lng: 75.3500 } }
    ],
    "Kasaragod": [
        { name: "The Lalit Resort & Spa", address: "Bekal, Kasaragod", location: { lat: 12.3900, lng: 75.0400 } },
        { name: "Taj Bekal Resort", address: "Bekal, Kasaragod", location: { lat: 12.4000, lng: 75.0300 } },
        { name: "Bekal Palace", address: "Bekal, Kasaragod", location: { lat: 12.3800, lng: 75.0500 } }
    ],
    "Kollam": [
        { name: "Pavithram Convention Centre", address: "Kundara, Kollam", location: { lat: 8.98023, lng: 76.67801 } },
        { name: "The Raviz", address: "Thevally, Kollam", location: { lat: 8.8900, lng: 76.5800 } },
        { name: "Quilon Beach Hotel", address: "Beach Road, Kollam", location: { lat: 8.8780, lng: 76.5850 } },
        { name: "Grand Highness Convention Centre", address: "Kollam", location: { lat: 9.1700, lng: 76.4800 } }
    ],
    "Kottayam": [
        { name: "Kumarakom Lake Resort", address: "Kumarakom, Kottayam", location: { lat: 9.6100, lng: 76.4200 } },
        { name: "The Zuri Kumarakom", address: "Kumarakom, Kottayam", location: { lat: 9.6200, lng: 76.4100 } },
        { name: "Windsor Castle Convention Centre", address: "Kottayam", location: { lat: 9.6000, lng: 76.5300 } }
    ],
    "Kozhikode": [
        { name: "Calicut Trade Centre", address: "Sarovaram, Kozhikode", location: { lat: 11.2700, lng: 75.7900 } },
        { name: "The Raviz Kadavu", address: "Azhinjilam, Kozhikode", location: { lat: 11.2100, lng: 75.8500 } },
        { name: "Tagore Centenary Hall", address: "Kozhikode", location: { lat: 11.2500, lng: 75.7800 } }
    ],
    "Malappuram": [
        { name: "Parappan Square International", address: "Venniyur, Malappuram", location: { lat: 11.0184, lng: 75.9465 } },
        { name: "Rio Convention Centre", address: "Anakkayam, Malappuram", location: { lat: 11.0800, lng: 76.1000 } },
        { name: "Shifa Convention Center", address: "Perinthalmanna, Malappuram", location: { lat: 10.9700, lng: 76.2200 } }
    ],
    "Palakkad": [
        { name: "Udhaya Resort Open Auditorium", address: "Nila Nagar, West Yakkara, Palakkad", location: { lat: 10.7600, lng: 76.6400 } },
        { name: "Club 6 Convention Centre", address: "Kallepully Road, Ramanathapuram, Palakkad", location: { lat: 10.7900, lng: 76.6700 } },
        { name: "Mohamed Bagh Event Centre", address: "Sulaiman Sahib Road, Palakkad", location: { lat: 10.7700, lng: 76.6500 } },
        { name: "Prasanna Lakshmi Auditorium", address: "Thondikulam, Nurani, Palakkad", location: { lat: 10.7800, lng: 76.6600 } }
    ],
    "Pathanamthitta": [
        { name: "Maramon Convention Venue", address: "Maramon, Pathanamthitta", location: { lat: 9.3337, lng: 76.7007 } },
        { name: "Morning Star Convention Centre", address: "Adoor, Pathanamthitta", location: { lat: 9.1700, lng: 76.7400 } },
        { name: "Loyal Convention Centre", address: "Thiruvalla, Pathanamthitta", location: { lat: 9.3800, lng: 76.5700 } }
    ],
    "Thrissur": [
        { name: "Lulu International Convention Center", address: "Thrissur", location: { lat: 10.5300, lng: 76.2200 } },
        { name: "Hyatt Regency", address: "Thrissur", location: { lat: 10.5400, lng: 76.2300 } },
        { name: "Joys Palace", address: "Thrissur", location: { lat: 10.5100, lng: 76.2100 } }
    ],
    "Wayanad": [
        { name: "Vythiri Village Resort", address: "Vythiri, Wayanad", location: { lat: 11.5500, lng: 76.0400 } },
        { name: "Wayanad Silver Woods", address: "Kalpetta, Wayanad", location: { lat: 11.6300, lng: 75.9500 } },
        { name: "Sharoy Resort", address: "Banasura Sagar, Wayanad", location: { lat: 11.6500, lng: 75.9400 } }
    ]
};

module.exports = MANUAL_FALLBACKS;
