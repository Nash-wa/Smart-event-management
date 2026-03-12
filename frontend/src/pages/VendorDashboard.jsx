import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function VendorDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [bookings, setBookings] = useState([]);
    const [myVendors, setMyVendors] = useState([]);
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

            // Fetch Bookings/Requests received
            const bRes = await api.get('/bookings/vendor');
            setBookings(Array.isArray(bRes.data) ? bRes.data : []);

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
        <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 p-8 flex flex-col gap-10 hidden lg:flex bg-[#050505] sticky top-0 h-screen">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-black text-2xl">V</div>
                    <span className="font-black text-xl tracking-tighter uppercase">Vendor Hub</span>
                </div>

                <nav className="flex flex-col gap-2">
                    <TabButton id="overview" label="Dashboard" icon="📊" active={activeTab} onClick={setActiveTab} />
                    <TabButton id="bookings" label="Requests" icon="🔔" active={activeTab} onClick={setActiveTab} count={bookings.filter(b => b.status === 'pending').length} />
                    <TabButton id="listings" label="Add Venture" icon="➕" active={activeTab} onClick={setActiveTab} />
                    <TabButton id="mywork" label="Portfolio" icon="�️" active={activeTab} onClick={setActiveTab} />
                </nav>

                <button
                    onClick={() => { localStorage.removeItem('userInfo'); navigate("/"); }}
                    className="mt-auto p-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px] uppercase font-black tracking-widest hover:bg-red-500/20 transition-all"
                >Sign Out</button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#0a0a0a]">
                <header className="mb-16">
                    <h1 className="text-4xl font-black uppercase tracking-tighter">
                        {activeTab === 'listings' ? 'Publish Service' : activeTab === 'overview' ? 'Command Center' : activeTab.toUpperCase()}
                    </h1>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-2">{user.name} · Certified Provider</p>
                </header>

                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
                        <StatCard label="Live Requests" value={bookings.length} />
                        <StatCard label="Pending Orders" value={bookings.filter(b => b.status === 'pending').length} />
                        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
                        <StatCard label="My Ventures" value={myVendors.length} />
                    </div>
                )}

                {activeTab === "listings" && (
                    <div className="max-w-4xl glass-card rounded-[40px] border border-white/10 p-10 animate-fade-in">
                        <form onSubmit={handlePublish} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Professional Display Name</label>
                                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Service Vertical</label>
                                        <select className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent font-bold cursor-pointer" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                            <option>Photography</option><option>Catering</option><option>Music/DJ</option><option>Decoration</option><option>Invitation</option><option>Venue</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Base Unit Price (₹)</label>
                                        <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent font-black text-xl" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Performance description</label>
                                    <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white h-[208px] focus:outline-none focus:ring-2 focus:ring-accent font-medium leading-relaxed" placeholder="Highlight your team's core competencies..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required></textarea>
                                </div>
                            </div>
                            <button type="submit" className="w-full h-20 rounded-3xl bg-white text-black text-lg font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl">Finalize Listing</button>
                        </form>
                    </div>
                )}

                {activeTab === "bookings" && (
                    <div className="space-y-6 animate-fade-in">
                        {bookings.map(b => (
                            <div key={b._id} className="glass-card p-8 rounded-[40px] border border-white/5 bg-white/5 flex flex-col md:flex-row justify-between md:items-center gap-8 hover:border-white/20 transition-all">
                                <div>
                                    <h3 className="text-2xl font-black uppercase mb-1 text-white">{b.vendor?.name}</h3>
                                    <p className="text-xl font-black text-accent mb-4">₹{b.totalPrice.toLocaleString()}</p>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Client: {b.user?.name}</p>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Event: {b.event?.name}</p>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Target: {new Date(b.serviceDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {b.status === 'pending' ? (
                                        <>
                                            <button onClick={() => handleUpdateStatus(b._id, 'confirmed')} className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Approve</button>
                                            <button onClick={() => handleUpdateStatus(b._id, 'cancelled')} className="px-10 py-4 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all">Decline</button>
                                        </>
                                    ) : (
                                        <span className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            {b.status.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {bookings.length === 0 && <div className="text-center py-32 glass-card rounded-[40px] text-gray-600 font-black uppercase tracking-widest border-white/5">No active pipeline</div>}
                    </div>
                )}

                {activeTab === "mywork" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                        {myVendors.map(v => (
                            <div key={v._id} className="glass-card p-10 rounded-[40px] border border-white/5 bg-white/5 hover:border-accent/30 transition-all flex flex-col">
                                <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-4 bg-accent/10 w-fit px-3 py-1 rounded-lg">{v.category}</span>
                                <h3 className="text-2xl font-black uppercase mb-2 tracking-tight">{v.name}</h3>
                                <p className="text-3xl font-black text-white mb-8">₹{v.price.toLocaleString()}</p>
                                <div className="mt-auto flex gap-3">
                                    <button onClick={() => setActiveTab('listings')} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Edit</button>
                                    <button className="flex-1 py-4 bg-red-500/5 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all">Draft</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function TabButton({ id, label, icon, active, onClick, count }) {
    const isActive = active === id;
    return (
        <button onClick={() => onClick(id)} className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <span className="text-xl">{icon}</span><span className="font-black text-[11px] uppercase tracking-widest">{label}</span>
            {count > 0 && <span className="ml-auto w-6 h-6 bg-accent rounded-lg text-[10px] flex items-center justify-center text-white font-black">{count}</span>}
        </button>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="glass-card p-10 rounded-[40px] border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
            <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
            <p className="text-6xl font-black mt-3 tracking-tighter text-white">{value}</p>
        </div>
    );
}

export default VendorDashboard;
