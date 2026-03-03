import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Services() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState("");
    const [events, setEvents] = useState([]);

    const { eventId } = useParams();

    // Modal state for booking
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState(eventId || "");

    const navigate = useNavigate();

    const categories = ["Photography", "Catering", "Music/DJ", "Decoration", "Invitation", "Venue"];

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const headers = { 'Content-Type': 'application/json' };
                if (userInfo?.token) {
                    headers['Authorization'] = `Bearer ${userInfo.token}`;
                }

                let url = "http://localhost:5000/api/vendors";
                if (filterCategory) {
                    url += `?category=${encodeURIComponent(filterCategory)}`;
                }

                const res = await fetch(url, { headers });
                const data = await res.json();
                setVendors(Array.isArray(data) ? data : []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchVendors();
    }, [filterCategory]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo?.token) return;
                const res = await fetch("http://localhost:5000/api/events", {
                    headers: { 'Authorization': `Bearer ${userInfo.token}` }
                });
                const data = await res.json();
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
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch("http://localhost:5000/api/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userInfo.token}`
                },
                body: JSON.stringify({
                    vendorId: selectedVendor._id,
                    eventId: selectedEventId,
                    serviceDate: new Date().toISOString()
                })
            });

            if (res.ok) {
                alert(`Booking successful for ${selectedVendor.name}! Check your event dashboard.`);
                setShowBookingModal(false);
            } else {
                const data = await res.json();
                alert(data.message || "Booking failed");
            }
        } catch (err) {
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
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vendors.map((vendor) => (
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

                                    <div className="flex items-center gap-3">
                                        <div className="px-2 py-1 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[10px] font-black">
                                            ★ {vendor.rating || '5.0'}
                                        </div>
                                        <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${(vendor.reliabilityScore || 100) >= 90 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                                            REL: {vendor.reliabilityScore || 100}%
                                        </div>
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
            </div>

            {/* Booking Modal Overlay */}
            {showBookingModal && (
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
            )}

            <footer className="mt-20 py-12 border-t border-white/10 text-center">
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Verified Professional Network · © 2026</p>
            </footer>
        </div>
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
