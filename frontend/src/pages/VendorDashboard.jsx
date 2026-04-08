import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function VendorDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [bookings, setBookings] = useState([]);
    const [myVendors, setMyVendors] = useState([]);
    const [legacyRequests, setLegacyRequests] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        category: "Photography",
        price: "",
        description: "",
        district: "Default District"
    });


    const navigate = useNavigate();
    const user = useMemo(() => JSON.parse(localStorage.getItem('userInfo') || '{}'), []);

    const fetchData = useCallback(async () => {
        try {
            // Fetch My Vendor Listings
            const vRes = await api.get(`/vendors`, { params: { owner: user._id, isApproved: false } }); // Get both approved and pending
            const vRes2 = await api.get(`/vendors`, { params: { owner: user._id, isApproved: true } });
            setMyVendors([...(vRes.data || []), ...(vRes2.data || [])]);

            // Fetch Bookings/Requests received (Booking collection)
            const bRes = await api.get('/bookings/vendor');
            setBookings(Array.isArray(bRes.data) ? bRes.data : []);

            // Fetch Legacy Requests (Event collection Map)
            const rRes = await api.get(`/vendors/requests/${user._id}`);
            setLegacyRequests(Array.isArray(rRes.data) ? rRes.data : []);

        } catch (error) {
            console.error(error);
        }
    }, [user._id]);

    const totalRevenue = useMemo(() => {
        return bookings
            .filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    }, [bookings]);

    useEffect(() => {
        fetchData(); // eslint-disable-line react-hooks/set-state-in-effect
    }, [fetchData]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/bookings/${id}`, { status });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/vendors`, { ...formData, owner: user._id });
            alert("Venture submitted! Waiting for Admin approval. ✨");
            setFormData({ name: "", category: "Photography", price: "", description: "", district: "Default District" });
            fetchData();
            setActiveTab("overview");
        } catch {
            alert("Error submitting listing");
        }
    };
    return (
        <div className="min-h-screen bg-background text-primary flex flex-col lg:flex-row">
            {/* Sidebar */}
            <aside className="w-64 border-r border-primary/10 p-8 flex flex-col gap-10 hidden lg:flex bg-white/40 sticky top-0 h-screen backdrop-blur-xl">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center font-black text-white text-2xl shadow-lg">V</div>
                    <span className="font-black text-xl tracking-tighter uppercase italic">Vendor Hub</span>
                </div>

                <nav className="flex flex-col gap-2">
                    <TabButton id="overview" label="Dashboard" icon="📊" active={activeTab} onClick={setActiveTab} />
                    <TabButton id="bookings" label="Requests" icon="🔔" active={activeTab} onClick={setActiveTab} count={bookings.filter(b => b.status === 'pending').length} />
                    <TabButton id="availability" label="Availability" icon="📅" active={activeTab} onClick={setActiveTab} />
                    <TabButton id="listings" label="Add Venture" icon="➕" active={activeTab} onClick={setActiveTab} />
                    <TabButton id="mywork" label="Portfolio" icon="🎨" active={activeTab} onClick={setActiveTab} />
                </nav>

                <button
                    onClick={() => { localStorage.removeItem('userInfo'); navigate("/"); }}
                    className="mt-auto p-4 bg-red-500/10 text-red-600 rounded-2xl text-[10px] uppercase font-black tracking-widest hover:bg-red-500/20 transition-all"
                >Sign Out</button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-background/50">
                <header className="mb-16">
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-primary">
                        {activeTab === 'listings' ? 'Publish Service' : activeTab === 'overview' ? 'Command Center' : activeTab.toUpperCase()}
                    </h1>
                    <p className="text-[#64748b] text-[10px] font-black uppercase tracking-[0.3em] mt-2">{user.name} · Certified Provider</p>
                </header>

                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
                        <StatCard label="Live Requests" value={bookings.length + legacyRequests.length} />
                        <StatCard label="Pending Orders" value={bookings.filter(b => b.status === 'pending').length + legacyRequests.length} />
                        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
                        <StatCard label="My Ventures" value={myVendors.length} />
                    </div>
                )}

                {activeTab === "listings" && (
                    <div className="max-w-4xl glass-card rounded-[40px] border border-primary/10 p-10 animate-fade-in bg-white/40 shadow-lux">
                        <form onSubmit={handlePublish} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-3">Professional Display Name</label>
                                        <input type="text" className="w-full bg-white/60 border border-primary/10 rounded-2xl px-6 py-4 text-primary focus:outline-none focus:ring-2 focus:ring-accent font-bold shadow-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-3">Service Vertical</label>
                                        <select className="w-full bg-white border border-primary/10 rounded-2xl px-6 py-4 text-primary focus:outline-none focus:ring-2 focus:ring-accent font-bold cursor-pointer shadow-sm" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                            <option>Photography</option><option>Catering</option><option>Music/DJ</option><option>Decoration</option><option>Invitation</option><option>Venue</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-3">Base Unit Price (₹)</label>
                                        <input type="number" className="w-full bg-white/60 border border-primary/10 rounded-2xl px-6 py-4 text-primary focus:outline-none focus:ring-2 focus:ring-accent font-black text-xl shadow-sm" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <label className="block text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-3">Performance description</label>
                                    <textarea className="w-full bg-white/60 border border-primary/10 rounded-2xl px-6 py-4 text-primary h-[208px] focus:outline-none focus:ring-2 focus:ring-accent font-medium leading-relaxed shadow-sm" placeholder="Highlight your team's core competencies..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required></textarea>
                                </div>
                            </div>
                            <button type="submit" className="w-full h-20 rounded-3xl bg-primary text-white text-lg font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl">Finalize Listing</button>
                        </form>
                    </div>
                )}

                {activeTab === "bookings" && (
                    <div className="space-y-6 animate-fade-in pb-20">
                        {/* Render Legacy Requests */}
                        {legacyRequests.map(er => (
                            <div key={er._id} className="glass-card p-8 rounded-[40px] border border-blue-500/10 bg-blue-500/5 flex flex-col md:flex-row justify-between md:items-center gap-8 hover:border-blue-500/20 transition-all group">
                                <div className="relative">
                                    <div className="absolute -top-4 -left-4 px-2 py-0.5 rounded-lg bg-blue-400/20 text-blue-600 text-[8px] font-black uppercase tracking-[0.2em] border border-blue-400/20 shadow-sm">Wizard Draft</div>
                                    <h3 className="text-2xl font-black uppercase mb-1 text-primary italic tracking-tighter">Event: {er.name}</h3>
                                    <p className="text-[10px] font-black text-[#64748b] mb-4 uppercase tracking-[0.2em]">Platform Discovery Request</p>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                        <p className="text-[10px] text-primary font-black uppercase tracking-widest opacity-60">Client: {er.user?.name}</p>
                                        <p className="text-[10px] text-primary font-black uppercase tracking-widest opacity-60">Date: {new Date(er.startDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3 text-right">
                                    <span className="px-5 py-2 rounded-2xl bg-blue-400/10 text-blue-600 text-[10px] font-black uppercase border border-blue-400/20 shadow-sm">PENDING APPROVAL</span>
                                    <p className="text-[9px] text-[#64748b] italic max-w-xs font-medium">This client selected your service during event deployment. It will sync automatically upon final budget confirmation.</p>
                                </div>
                            </div>
                        ))}

                        {bookings.map(b => (
                            <div key={b._id} className="glass-card p-8 rounded-[40px] border border-primary/5 bg-white/40 flex flex-col md:flex-row justify-between md:items-center gap-8 hover:border-accent/20 transition-all shadow-lux">
                                <div>
                                    <h3 className="text-2xl font-black uppercase mb-1 text-primary italic tracking-tighter">{b.vendor?.name}</h3>
                                    <p className="text-2xl font-black text-accent mb-4 font-mono">₹{b.totalPrice.toLocaleString()}</p>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                        <p className="text-[10px] text-[#64748b] font-black uppercase tracking-widest">Client: <span className="text-primary">{b.user?.name}</span></p>
                                        <p className="text-[10px] text-[#64748b] font-black uppercase tracking-widest">Event: <span className="text-primary">{b.event?.name}</span></p>
                                        <p className="text-[10px] text-[#64748b] font-black uppercase tracking-widest">Target: <span className="text-primary font-mono">{new Date(b.serviceDate).toLocaleDateString()}</span></p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {b.status === 'pending' ? (
                                        <>
                                            <button onClick={() => handleUpdateStatus(b._id, 'confirmed')} className="px-10 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">Approve</button>
                                            <button onClick={() => handleUpdateStatus(b._id, 'cancelled')} className="px-10 py-4 border border-red-500/20 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all">Decline</button>
                                        </>
                                    ) : (
                                        <span className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                                            {b.status.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {bookings.length === 0 && <div className="text-center py-32 glass-card rounded-[40px] text-[#64748b] font-black uppercase tracking-[0.3em] border-primary/5 bg-white/20">No active pipeline</div>}
                    </div>
                )}

                {activeTab === "mywork" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in pb-20">
                        {myVendors.map(v => (
                            <div key={v._id} className="glass-card p-10 rounded-[40px] border border-primary/5 bg-white/40 hover:border-accent/30 transition-all flex flex-col shadow-lux">
                                <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-4 bg-accent/10 w-fit px-3 py-1 rounded-lg border border-accent/20 shadow-sm">{v.category}</span>
                                <h3 className="text-2xl font-black uppercase mb-2 tracking-tight italic text-primary">{v.name}</h3>
                                <p className="text-3xl font-black text-primary mb-8 font-mono">₹{v.price.toLocaleString()}</p>
                                <div className="mt-auto flex gap-3">
                                    <button onClick={() => setActiveTab('listings')} className="flex-1 py-4 bg-white border border-primary/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">Edit</button>
                                    <button className="flex-1 py-4 bg-red-500/5 border border-red-500/10 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all shadow-sm">Draft</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "availability" && (
                    <div className="animate-fade-in space-y-12 pb-20">
                        <header>
                            <h2 className="text-2xl font-black uppercase tracking-widest mb-2 font-mono text-primary italic">Managing Active Time</h2>
                            <p className="text-[#64748b] text-[10px] font-black uppercase tracking-[0.3em]">Block dates or synchronize your confirmed events below.</p>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Confirmed Flow */}
                            <div className="glass-card p-10 rounded-[40px] border border-primary/5 bg-white/40 shadow-lux">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-emerald-600">
                                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-sm shadow-sm">✓</span>
                                    Operational Flow
                                </h3>
                                <div className="space-y-4">
                                    {bookings.filter(b => b.status === 'confirmed').length === 0 && <p className="text-[10px] text-[#64748b] font-black uppercase tracking-widest italic opacity-40">No confirmed assignments detected.</p>}
                                    {bookings.filter(b => b.status === 'confirmed').map(b => (
                                        <div key={b._id} className="p-5 rounded-2xl bg-white/60 border border-primary/5 flex flex-col gap-2 shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] font-black text-[#64748b] uppercase tracking-widest leading-loose">🎯 {new Date(b.serviceDate).toLocaleDateString()}</span>
                                                <span className={`px-2 py-0.5 ${new Date(b.serviceDate) < new Date() ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'} text-[8px] font-black uppercase tracking-tighter border rounded shadow-sm`}>
                                                    {new Date(b.serviceDate) < new Date() ? 'COMPLETED' : 'CONFIRMED'}
                                                </span>
                                            </div>
                                            <p className="font-black text-primary text-sm uppercase tracking-tight italic">{b.event?.name || 'Assigned Mission'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Blocking Logic */}
                            <div className="glass-card p-10 rounded-[40px] border border-primary/5 bg-white/40 shadow-lux">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-red-600">
                                    <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-sm shadow-sm">✖</span>
                                    Manual Blackout
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-3">Sync Date to Block</label>
                                        <div className="flex gap-4">
                                            <input 
                                                type="date" 
                                                id="blockDate"
                                                className="flex-1 bg-white/60 border border-primary/10 rounded-2xl px-6 py-4 text-primary font-black outline-none focus:ring-2 focus:ring-red-500/50 transition-all shadow-sm" 
                                            />
                                            <button 
                                                onClick={async () => {
                                                    const date = document.getElementById('blockDate').value;
                                                    if(!date) return;
                                                    const vendor = myVendors[0];
                                                    if(!vendor) return alert("Register a venture first");
                                                    try {
                                                        const currentUnav = vendor.unavailability || [];
                                                        await api.put(`/vendors/${vendor._id}/availability`, { 
                                                            unavailability: [...currentUnav, date] 
                                                        });
                                                        window.location.reload();
                                                    } catch (err) { alert("Failed to block date"); }
                                                }}
                                                className="px-8 py-4 bg-red-500/10 text-red-600 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all shadow-sm"
                                            >Block</button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.2em]">Active Blackouts</h4>
                                        {myVendors[0]?.unavailability?.length === 0 && <p className="text-[10px] text-[#64748b] font-black uppercase tracking-widest italic opacity-40">No manual overrides active.</p>}
                                        <div className="flex flex-wrap gap-2">
                                            {myVendors[0]?.unavailability?.map((d, i) => (
                                                <div key={i} className="flex items-center gap-3 bg-white border border-primary/10 px-4 py-2 rounded-xl shadow-sm group/tag">
                                                    <span className="text-[10px] font-black text-primary font-mono">{new Date(d).toDateString()}</span>
                                                    <button onClick={async () => {
                                                        const vendor = myVendors[0];
                                                        const newUnav = vendor.unavailability.filter((_, idx) => idx !== i);
                                                        try {
                                                            await api.put(`/vendors/${vendor._id}/availability`, { unavailability: newUnav });
                                                            window.location.reload();
                                                        } catch (err) { alert("Failed to remove override"); }
                                                    }} className="text-red-500 hover:text-red-700 transition-colors">✖</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function TabButton({ id, label, icon, active, onClick, count }) {
    const isActive = active === id;
    return (
        <button onClick={() => onClick(id)} className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive ? 'bg-primary text-white shadow-lux' : 'text-[#64748b] hover:text-primary hover:bg-primary/5'}`}>
            <span className="text-xl">{icon}</span><span className="font-black text-[11px] uppercase tracking-widest">{label}</span>
            {count > 0 && <span className="ml-auto w-6 h-6 bg-accent rounded-lg text-[10px] flex items-center justify-center text-white font-black">{count}</span>}
        </button>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="glass-card p-10 rounded-[40px] border border-primary/5 bg-white/40 shadow-lux">
            <span className="text-[#64748b] text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
            <p className="text-5xl font-black mt-3 tracking-tighter text-primary font-mono">{value}</p>
        </div>
    );
}

export default VendorDashboard;
