import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function VendorDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [requests, setRequests] = useState([]);
    const [myVendors, setMyVendors] = useState([]);
    const [myReviews, setMyReviews] = useState([]); // New State
    const [formData, setFormData] = useState({
        name: "",
        category: "Photography",
        price: "",
        description: "",
        portfolio: []
    });
    const [imageUrl, setImageUrl] = useState("");


    const navigate = useNavigate();
    const user = useMemo(() => JSON.parse(localStorage.getItem('userInfo') || '{}'), []);

    const fetchData = useCallback(async () => {

        try {
            // Fetch Vendor Requests
            const rRes = await api.get(`/vendors/requests/${user._id}`);
            const rData = rRes.data;
            setRequests(rData);

            // Fetch ALL vendors and filter for OWNED ones (approved or not)
            const allRes = await api.get(`/vendors?isApproved=true`);
            const allData = allRes.data;
            const pRes = await api.get(`/vendors?isApproved=false`);
            const pData = pRes.data;

            const combined = [...(Array.isArray(allData) ? allData : []), ...(Array.isArray(pData) ? pData : [])];
            setMyVendors(combined.filter(v => v.owner === user._id));
        } catch (error) {
            console.error(error);
        }
    }, [user._id]);

    useEffect(() => {
        setTimeout(() => fetchData(), 0);
    }, [fetchData]);

    const addImage = () => {
        if (imageUrl && !formData.portfolio.includes(imageUrl)) {
            setFormData({ ...formData, portfolio: [...formData.portfolio, imageUrl] });
            setImageUrl("");
        }
    };

    const removeImage = (url) => {
        setFormData({ ...formData, portfolio: formData.portfolio.filter(img => img !== url) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/vendors', { ...formData, ownerId: user._id });
            if (res.status === 200) {
                alert("Venture submitted! Waiting for Admin approval. ✨");
                setFormData({ name: "", category: "Photography", price: "", description: "", portfolio: [] });
                fetchData();
                setActiveTab("overview");
            }
        } catch {
            alert("Error submitting venture");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
            {/* Sidebar - Desktop */}
            <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-8 hidden lg:flex bg-[#050505] sticky top-0 h-screen">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center font-bold text-xl shadow-glow">
                        V
                    </div>
                    <span className="font-bold text-lg tracking-tight">Vendor Pro</span>
                </div>

                <nav className="flex flex-col gap-1">
                    <TabButton id="overview" label="Dashboard" icon="📊" active={activeTab} onClick={setActiveTab} />
                    <TabButton id="requests" label="Bookings" icon="🔔" active={activeTab} onClick={setActiveTab} count={requests.length} />
                    <TabButton id="listings" label="Add Venture" icon="➕" active={activeTab} onClick={setActiveTab} />
                    <TabButton id="reviews" label="Reviews" icon="⭐" active={activeTab} onClick={setActiveTab} />
                    <TabButton id="creations" label="My Work" icon="🖼️" active={activeTab} onClick={setActiveTab} />
                </nav>

                <button
                    onClick={() => { localStorage.removeItem('userInfo'); navigate("/"); }}
                    className="mt-auto px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl text-left transition-all font-semibold"
                >
                    🔴 Sign Out
                </button>
            </aside>

            {/* Mobile Header / Nav */}
            <header className="lg:hidden glass-card rounded-none border-x-0 border-t-0 p-4 sticky top-0 z-[100] flex justify-between items-center bg-black/50 backdrop-blur-xl">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold">V</div>
                    <span className="font-bold">Vendor Pro</span>
                </div>
                <button onClick={() => { localStorage.removeItem('userInfo'); navigate("/"); }} className="text-red-500 text-sm">Logout</button>
            </header>

            {/* Mobile Bottom Bar */}
            <nav className="lg:hidden fixed bottom-0 w-full glass-card rounded-none border-x-0 border-b-0 p-2 z-[100] grid grid-cols-4 gap-1 bg-black/80 backdrop-blur-2xl">
                <MobileTab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="📊" />
                <MobileTab active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} icon="🔔" count={requests.length} />
                <MobileTab active={activeTab === 'listings'} onClick={() => setActiveTab('listings')} icon="➕" />
                <MobileTab active={activeTab === 'creations'} onClick={() => setActiveTab('creations')} icon="🖼️" />
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 pb-32 lg:pb-8 overflow-y-auto bg-[#0a0a0a]">
                <header className="mb-8 md:mb-12">
                    <h1 className="text-2xl md:text-3xl font-bold capitalize tracking-tight">
                        {activeTab === 'listings' ? 'New Submission' : activeTab === 'overview' ? 'Command Center' : activeTab}
                    </h1>
                    <p className="text-gray-500 text-sm">Welcome back, {user.name}.</p>
                </header>

                {activeTab === "overview" && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-accent/5 to-transparent">
                                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Active Requests</span>
                                <p className="text-4xl md:text-5xl font-bold mt-2 font-mono">{requests.length}</p>
                            </div>
                            <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/5 to-transparent">
                                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Growth Tier</span>
                                <p className="text-4xl md:text-5xl font-bold mt-2 tracking-tighter">SILVER</p>
                            </div>
                            <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-yellow-500/5 to-transparent">
                                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Client Rating</span>
                                <p className="text-4xl md:text-5xl font-bold mt-2 tracking-tighter text-yellow-500">
                                    {myReviews.length > 0 ? (myReviews.reduce((acc, r) => acc + parseFloat(r.rating), 0) / myReviews.length).toFixed(1) : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10">
                            <h2 className="text-xl font-bold mb-6">Active Ventures</h2>
                            <div className="space-y-4">
                                {myVendors.map(v => (
                                    <div key={v._id} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div>
                                            <p className="font-bold">{v.name}</p>
                                            <p className="text-xs text-gray-400 capitalize">{v.category}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${v.isApproved ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                            {v.isApproved ? 'Live' : 'Pending'}
                                        </span>
                                    </div>
                                ))}
                                {myVendors.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No ventures found. Start by adding one!</p>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "listings" && (
                    <div className="max-w-4xl animate-fade-in">
                        <div className="glass-card p-6 md:p-8 rounded-[40px] border border-white/10 bg-white/5">
                            <h2 className="text-2xl font-bold mb-8">Launch a New Venture</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Venture Name</label>
                                            <input type="text" className="glass-input" placeholder="e.g. Flash Masters" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                                            <select className="glass-input bg-zinc-900" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                <option>Photography</option>
                                                <option>Catering</option>
                                                <option>Music/DJ</option>
                                                <option>Decoration</option>
                                                <option>Venue</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Base Price (₹)</label>
                                            <input type="number" className="glass-input" placeholder="5000" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Professional Summary</label>
                                        <textarea className="glass-input h-[184px] resize-none" placeholder="What sets your team apart from the rest?..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required></textarea>
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-6">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Portfolio Samples (URLs)</label>
                                    <div className="flex gap-2">
                                        <input type="text" className="glass-input flex-1" placeholder="Paste image/work URL..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                                        <button type="button" onClick={addImage} className="px-6 py-2 rounded-xl bg-accent text-white font-bold transition-transform hover:scale-105">Add</button>
                                    </div>
                                    <div className="flex flex-wrap gap-4 mt-6">
                                        {formData.portfolio.map((img, i) => (
                                            <div key={i} className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-white/10 group">
                                                <img src={img} alt="Work" className="w-full h-full object-cover" />
                                                <button onClick={() => removeImage(img)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs" type="button">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="w-full h-16 rounded-3xl bg-gradient-to-r from-accent to-purple-600 text-white text-lg font-bold shadow-glow hover:shadow-accent/40 transition-all">
                                    Submit for Professional Review
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === "requests" && (
                    <div className="glass-card rounded-3xl border border-white/10 overflow-hidden animate-fade-in">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-white/10">
                                    <tr>
                                        <th className="p-4 md:p-6">Client Identity</th>
                                        <th className="p-4 md:p-6">Target Date</th>
                                        <th className="p-4 md:p-6">Capital</th>
                                        <th className="p-4 md:p-6 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {requests.map(req => (
                                        <tr key={req._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 md:p-6">
                                                <div className="font-semibold text-white group-hover:text-accent transition-colors truncate max-w-[150px]">{req.name}</div>
                                                <div className="text-gray-500 text-[10px] uppercase">{req.user?.name}</div>
                                            </td>
                                            <td className="p-4 md:p-6 text-gray-300 text-sm">
                                                {new Date(req.startDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 md:p-6 text-accent font-bold">₹{req.budget?.toLocaleString() || 'N/A'}</td>
                                            <td className="p-4 md:p-6 text-right">
                                                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">Selected</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {requests.length === 0 && <p className="p-16 text-center text-gray-500">No active bookings yet. Publish a venture to start receiving requests.</p>}
                    </div>
                )}

                {activeTab === "creations" && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
                        {myVendors.flatMap(v => v.portfolio || []).map((img, i) => (
                            <div key={i} className="aspect-square rounded-3xl overflow-hidden border border-white/10 bg-white/5 group relative shadow-2xl">
                                <img src={img} alt="Creation" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                    <span className="text-white text-[10px] font-black text-center uppercase tracking-widest">Portfolio Showcase</span>
                                </div>
                            </div>
                        ))}
                        {myVendors.flatMap(v => v.portfolio || []).length === 0 && (
                            <div className="col-span-full py-20 text-center glass-card">
                                <p className="text-4xl mb-4">📸</p>
                                <p className="text-gray-500">Add some creations to your ventures to see them here.</p>
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
}

function TabButton({ id, label, icon, active, onClick, count }) {
    const isActive = active === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
        >
            <span className="text-lg">{icon}</span>
            <span className="font-medium">{label}</span>
            {count > 0 && <span className="ml-auto w-5 h-5 bg-accent rounded-full text-[10px] flex items-center justify-center text-white font-bold">{count}</span>}
        </button>
    );
}

function MobileTab({ active, onClick, icon, count }) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all relative ${active ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
            <span className="text-xl">{icon}</span>
            {count > 0 && <span className="absolute top-2 right-4 w-4 h-4 bg-accent rounded-full text-[8px] flex items-center justify-center text-white font-bold">{count}</span>}
        </button>
    );
}

export default VendorDashboard;
