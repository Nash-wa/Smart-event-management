import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

function Services() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState("");
    const [events, setEvents] = useState([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [sortBy, setSortBy] = useState("rating");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { eventId } = useParams();

    // Modal state for booking
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState(eventId || "");

    const categories = ["Photography", "Catering", "Music/DJ", "Decoration", "Invitation", "Venue"];

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                let lat, lng;
                // If accessed via /event-plan/:id/services, fetch event location to filter vendors
                if (eventId) {
                    const eventRes = await api.get(`/events/${eventId}`);
                    const eventData = eventRes.data;
                    if (eventData.location) {
                        lat = eventData.location.lat;
                        lng = eventData.location.lng;
                    }
                }

                const params = { sort: sortBy };
                if (filterCategory) params.category = filterCategory;
                if (lat && lng) {
                    params.lat = lat;
                    params.lng = lng;
                }

                const { data } = await api.get('/vendors', { params });
                setVendors(Array.isArray(data) ? data : []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchVendors();
    }, [filterCategory, eventId, sortBy]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await api.get("/events");
                setEvents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchEvents();
    }, []);

    const openBookingModal = (vendor) => {
        setSelectedVendor(vendor);
        setShowBookingModal(true);
    };

    const confirmBooking = async () => {
        if (!selectedEventId) {
            alert("Please select an event");
            return;
        }

        try {
            await api.post("/bookings", {
                vendorId: selectedVendor._id,
                eventId: selectedEventId,
                serviceDate: new Date().toISOString()
            });

            alert(`Booking successful for ${selectedVendor.name}! Check your event dashboard.`);
            setShowBookingModal(false);
        } catch (err) {
            alert(err.response?.data?.message || "Booking failed");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 pt-24">
            {/* Fixed Navigation Overlay */}
            <nav className="fixed top-0 w-full z-50 glass-card border-x-0 border-t-0 rounded-none px-6 py-4 left-0">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-xl font-black">S</span>
                        </div>
                        <span className="text-xl font-black uppercase tracking-tight">Expert Services</span>
                    </div>
                    <button onClick={() => navigate("/dashboard")} className="text-sm font-black text-gray-500 hover:text-white uppercase tracking-widest transition-all">
                        ← Exit
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto">
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Our Elite Partners</h1>
                        <p className="text-gray-500 text-lg uppercase tracking-widest font-bold">Discover · Book · Manage</p>
                    </div>
                    <button
                        onClick={() => navigate('/vendor-discovery')}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                        style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)', boxShadow: '0 0 20px rgba(6,182,212,0.3)', color: '#0f172a' }}
                    >
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        Live Discovery Map
                    </button>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search Input */}
                        <div className="flex items-center gap-3 bg-white/5 px-5 py-2 rounded-2xl border border-white/10 w-full md:w-80 group focus-within:bg-white/10 transition-all">
                            <span className="text-gray-500 group-focus-within:text-accent transition-colors">🔍</span>
                            <input 
                                type="text"
                                placeholder="SEARCH VENDORS..."
                                className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest focus:ring-0 w-full placeholder:text-gray-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                            <select
                                className="bg-transparent border-none text-sm font-bold uppercase tracking-widest focus:ring-0 cursor-pointer p-2"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                            </select>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-2 border border-white/10">
                            <span className="text-xs font-bold text-gray-500 px-2 uppercase">Sort By</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer p-1"
                            >
                                <option value="rating" className="bg-black">Top Rated</option>
                                <option value="price_low" className="bg-black">Price: Low to High</option>
                                <option value="price_high" className="bg-black">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {vendors
                        .filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || (v.district || '').toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((vendor) => (
                        <div
                            key={vendor._id}
                            className="glass-card p-6 rounded-[40px] border border-white/10 bg-white/5 hover:bg-white/10 transition-all group flex flex-col relative overflow-hidden"
                        >
                            {/* Category Badge */}
                            <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest group-hover:bg-accent/20 group-hover:border-accent/40 group-hover:text-accent transition-all">
                                {vendor.category}
                            </div>

                            <div className="flex flex-col gap-4 mb-6">
                                <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">
                                    {vendor.category === "Photography" ? "📷" : vendor.category === "Catering" ? "🍽️" : vendor.category === "Music/DJ" ? "🎵" : vendor.category === "Decoration" ? "✨" : vendor.category === "Venue" ? "🏛️" : "💌"}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="px-2 py-1 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-black">
                                            ★ {vendor.rating || '5.0'}
                                        </div>
                                        <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${(vendor.reliabilityScore || 100) >= 90 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                                            REL: {vendor.reliabilityScore || 100}%
                                        </div>
                                    </div>
                                    {vendor.distance && vendor.distance !== Infinity && (
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-lg self-start">
                                            📍 {vendor.distance.toFixed(1)} km away
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{vendor.name}</h3>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-3 font-medium">
                                {vendor.description || "Top-tier service provider specialized in high-end events and precise execution."}
                            </p>

                            {/* Performance Metrics Chips */}
                            <div className="flex gap-2 mb-8 bg-black/20 p-3 rounded-3xl border border-white/5">
                                <Metric label="Resp" value={vendor.performanceMetrics?.responsiveness || 5} />
                                <Metric label="Punc" value={vendor.performanceMetrics?.punctuality || 5} />
                                <Metric label="Qual" value={vendor.performanceMetrics?.quality || 5} />
                            </div>

                            <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-6">
                                <div>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-1">Fee Starts at</span>
                                    <p className="text-2xl font-black text-white">₹{vendor.price.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => openBookingModal(vendor)}
                                    className="bg-white text-black px-8 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-xl shadow-white/5 active:scale-95"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* Booking Modal Overlay */}
            {
                showBookingModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={() => setShowBookingModal(false)}></div>
                        <div className="relative glass-card max-w-lg w-full rounded-[40px] border border-white/10 bg-[#050505] p-10 animate-scale-up shadow-[0_0_100px_rgba(255,255,255,0.05)]">
                            <button onClick={() => setShowBookingModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white text-xl">✕</button>

                            <div className="text-center mb-10">
                                <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">{selectedVendor?.category} Experience</span>
                                <h2 className="text-3xl font-black uppercase tracking-tighter">Reserve {selectedVendor?.name}</h2>
                                <p className="text-gray-500 text-sm mt-2">Scale your event with professional talent.</p>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Target Event Portfolio</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all appearance-none cursor-pointer"
                                        value={selectedEventId}
                                        onChange={(e) => setSelectedEventId(e.target.value)}
                                    >
                                        <option value="" className="bg-black">Choose an Active Event</option>
                                        {events.map((ev) => (
                                            <option key={ev._id} value={ev._id} className="bg-black">{ev.name.toUpperCase()} ({new Date(ev.startDate).toLocaleDateString()})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Initial Investment</span>
                                        <span className="text-xl font-black text-white">₹{selectedVendor?.price.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase">Includes base operations & direct material costs.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    className="flex-1 py-4 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white/5 transition-all active:scale-95"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={confirmBooking}
                                    className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all"
                                >
                                    Finalize Booking
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Portfolio Modal */}
            {
                selectedPortfolio && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedPortfolio(null)}></div>
                        <div className="relative glass-card max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-[40px] border-white/10 p-8 md:p-12 animate-fade-in-up">
                            <button
                                onClick={() => setSelectedPortfolio(null)}
                                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all text-xl"
                            >
                                ✕
                            </button>

                            <div className="mb-10 text-center">
                                <span className="text-accent font-bold uppercase tracking-[0.2em] text-[10px]">{selectedPortfolio.category} Masters</span>
                                <h2 className="text-4xl font-bold mt-2">{selectedPortfolio.name} Portfolio</h2>
                                <p className="text-gray-500 mt-2">A showcase of previous excellence and craftsmanship.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedPortfolio.portfolio.map((img, i) => (
                                    <div key={i} className="group relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                        <img src={img} alt="Portfolio" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                            <p className="text-white font-medium text-sm">Previous Project #{i + 1}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 text-center border-t border-white/10 pt-8">
                                <button
                                    onClick={() => navigate("/create-event")}
                                    className="gradient-button px-10 py-4 h-auto text-lg font-bold"
                                >
                                    Book {selectedPortfolio.name} Now
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <footer className="mt-20 py-12 border-t border-white/10 text-center">
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Verified Professional Network · © 2026</p>
            </footer>
        </div >
    );
}

function Metric({ label, value }) {
    return (
        <div className="flex flex-col items-center flex-1 bg-white/5 p-2 rounded-xl border border-white/5">
            <span className="text-[8px] font-black text-gray-600 uppercase tracking-tighter mb-1">{label}</span>
            <span className="text-[12px] font-black text-white">{value}/5</span>
        </div>
    );
}

export default Services;
