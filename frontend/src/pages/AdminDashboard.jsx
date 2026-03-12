import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("stats");
    const [pendingVendors, setPendingVendors] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [allVendors, setAllVendors] = useState([]);
    const [stats, setStats] = useState({ users: 0, events: 0, vendors: 0, pending: 0 });
    const [expandedUser, setExpandedUser] = useState(null);
    const [userEvents, setUserEvents] = useState([]);
    const [loadingUserEvents, setLoadingUserEvents] = useState(false);
    const [expandedVendor, setExpandedVendor] = useState(null);
    const [vendorBookings, setVendorBookings] = useState([]);
    const [loadingVendorBookings, setLoadingVendorBookings] = useState(false);

    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            const [vRes, uRes, eRes, sRes, avRes] = await Promise.all([
                api.get('/vendors', { params: { isApproved: false } }),
                api.get('/admin/users'),
                api.get('/events'),
                api.get('/admin/stats'),
                api.get('/admin/vendors')
            ]);

            setPendingVendors(Array.isArray(vRes.data) ? vRes.data : []);
            setAllUsers(uRes.data);
            setAllEvents(eRes.data);
            setStats(sRes.data);
            setAllVendors(avRes.data);

        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            fetchData();
        }
        return () => { isMounted = false; };
    }, [fetchData]);

    const handleApprove = async (id) => {
        try {
            await api.put(`/vendors/${id}/approve`);
            alert("Venture Approved! ✅");
            fetchData();
        } catch {
            alert("Error approving");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            alert("User deleted 🗑️");
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Delete failed");
        }
    };

    const fetchUserEvents = async (userId) => {
        if (expandedUser === userId) {
            setExpandedUser(null);
            return;
        }

        setLoadingUserEvents(true);
        try {
            const { data } = await api.get(`/admin/users/${userId}/events`);
            setUserEvents(data);
            setExpandedUser(userId);
        } catch (error) {
            console.error(error);
            alert("Error fetching user events");
        } finally {
            setLoadingUserEvents(false);
        }
    };

    const fetchVendorBookings = async (vendorId) => {
        if (expandedVendor === vendorId) {
            setExpandedVendor(null);
            return;
        }

        setLoadingVendorBookings(true);
        try {
            const { data } = await api.get(`/admin/vendors/${vendorId}/bookings`);
            setVendorBookings(data);
            setExpandedVendor(vendorId);
        } catch (error) {
            console.error(error);
            alert("Error fetching vendor bookings");
        } finally {
            setLoadingVendorBookings(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
            {/* Sidebar - Desktop */}
            <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-8 hidden lg:flex bg-[#050505] sticky top-0 h-screen">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xl">
                        A
                    </div>
                    <span className="font-bold text-lg tracking-tight">Admin OS</span>
                </div>

                <nav className="flex flex-col gap-1">
                    <TabButton id="stats" label="Analytics" icon="📊" active={activeTab} onClick={setActiveTab} />
                    <TabButton id="approvals" label="Approvals" icon="⏳" active={activeTab} onClick={setActiveTab} count={pendingVendors.length} />
                    <TabButton id="users" label="Users" icon="👥" active={activeTab} onClick={setActiveTab} />
                    <TabButton id="vendors" label="Vendors" icon="🏪" active={activeTab} onClick={setActiveTab} />
                    <TabButton id="events" label="Events" icon="📅" active={activeTab} onClick={setActiveTab} />
                    <TabButton id="settings" label="System" icon="⚙️" active={activeTab} onClick={setActiveTab} />
                </nav>

                <button onClick={logout} className="mt-auto px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl text-left transition-all font-semibold">
                    🔴 Sign Out
                </button>
            </aside>

            {/* Mobile Top Bar */}
            <header className="lg:hidden glass-card rounded-none border-x-0 border-t-0 p-4 sticky top-0 z-[100] flex justify-between items-center bg-black/50 backdrop-blur-xl">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold">A</div>
                    <span className="font-bold">Admin OS</span>
                </div>
                <button onClick={logout} className="text-red-500 text-sm">Logout</button>
            </header>

            {/* Mobile Bottom Bar */}
            <nav className="lg:hidden fixed bottom-0 w-full glass-card rounded-none border-x-0 border-b-0 p-2 z-[100] grid grid-cols-5 gap-1 bg-black/80 backdrop-blur-2xl">
                <MobileTab active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon="📊" />
                <MobileTab active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} icon="⏳" count={pendingVendors.length} />
                <MobileTab active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="👥" />
                <MobileTab active={activeTab === 'vendors'} onClick={() => setActiveTab('vendors')} icon="🏪" />
                <MobileTab active={activeTab === 'events'} onClick={() => setActiveTab('events')} icon="📅" />
                <MobileTab active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="⚙️" />
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 pb-32 lg:pb-8 overflow-y-auto bg-[#0a0a0a] min-h-screen">
                <header className="mb-8 md:mb-12 flex justify-between items-center animate-fade-in">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold capitalize tracking-tight">{activeTab}</h1>
                        <p className="text-gray-500 text-sm">Central command for website creators.</p>
                    </div>
                    <button onClick={fetchData} className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                        🔄
                    </button>
                </header>

                {activeTab === "stats" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
                        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
                            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Users</span>
                            <p className="text-4xl md:text-5xl font-bold mt-2 font-mono">{stats.users}</p>
                        </div>
                        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-accent/5 to-transparent">
                            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Active Events</span>
                            <p className="text-4xl md:text-5xl font-bold mt-2 font-mono">{stats.events}</p>
                        </div>
                        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-green-500/5 to-transparent">
                            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Live Vendors</span>
                            <p className="text-4xl md:text-5xl font-bold mt-2 font-mono">{stats.vendors}</p>
                        </div>
                        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-yellow-500/5 to-transparent">
                            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Pending</span>
                            <p className="text-4xl md:text-5xl font-bold mt-2 font-mono">{stats.pending}</p>
                        </div>
                        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
                            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Platform Revenue</span>
                            <p className="text-4xl md:text-5xl font-bold mt-2 font-mono text-accent">₹{stats.totalRevenue?.toLocaleString() || '0'}</p>
                        </div>
                    </div>
                )}

                {activeTab === "approvals" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        {pendingVendors.map((vendor) => (
                            <div key={vendor._id} className="glass-card p-6 rounded-3xl border border-white/10 bg-white/5 flex flex-col hover:border-accent/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">{vendor.category}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{vendor.name}</h3>
                                <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">{vendor.description}</p>

                                {vendor.portfolio && vendor.portfolio.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mb-6">
                                        {vendor.portfolio.slice(0, 4).map((img, i) => (
                                            <div key={i} className="aspect-square rounded-lg border border-white/10 overflow-hidden bg-white/5">
                                                <img src={img} alt="Work" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-between items-center py-4 border-t border-white/10">
                                    <span className="text-xl font-bold">₹{vendor.price.toLocaleString()}</span>
                                    <button onClick={() => handleApprove(vendor._id)} className="gradient-button px-6 py-2 rounded-xl text-sm font-bold">
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                        {pendingVendors.length === 0 && (
                            <div className="col-span-full py-20 md:py-32 text-center opacity-50">
                                <p className="text-5xl mb-4">✨</p>
                                <p className="text-lg">Platform is up to date.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "users" && (
                    <div className="glass-card rounded-3xl border border-white/10 overflow-hidden animate-fade-in shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-white/10">
                                    <tr>
                                        <th className="p-6">User Identity</th>
                                        <th className="p-6">Role</th>
                                        <th className="p-6">Events</th>
                                        <th className="p-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {allUsers.map(u => (
                                        <>
                                            <tr key={u._id} className={`hover:bg-white/5 transition-all group cursor-pointer ${expandedUser === u._id ? 'bg-white/5' : ''}`} onClick={() => fetchUserEvents(u._id)}>
                                                <td className="p-6">
                                                    <div className="font-semibold text-white group-hover:text-accent transition-colors flex items-center gap-2">
                                                        {u.name}
                                                        {expandedUser === u._id ? <span>🔼</span> : <span>🔽</span>}
                                                    </div>
                                                    <div className="text-gray-500 text-xs truncate max-w-[100px] md:max-w-none">{u.email}</div>
                                                </td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${u.role === 'admin' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : u.role === 'vendor' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' : 'bg-white/10 text-gray-400 border border-white/5'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-6">
                                                    <span className="text-xs font-bold text-gray-400">
                                                        {u.eventCount || 0} Events
                                                    </span>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={(e) => { e.stopPropagation(); fetchUserEvents(u._id); }} className="px-4 py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent hover:text-white text-[10px] font-bold transition-all">
                                                            {expandedUser === u._id ? 'Close' : 'View Events'}
                                                        </button>
                                                        {u.role !== 'admin' && (
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(u._id); }} className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold transition-all">
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedUser === u._id && (
                                                <tr className="bg-white/[0.02]">
                                                    <td colSpan="4" className="p-6 border-b border-white/10">
                                                        <div className="animate-in slide-in-from-top-2 duration-300">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h4 className="text-sm font-bold uppercase tracking-widest text-accent">Active Missions for {u.name}</h4>
                                                                {loadingUserEvents && <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>}
                                                            </div>

                                                            {userEvents.length > 0 ? (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    {userEvents.map(event => (
                                                                        <div key={event._id} className="glass-card p-4 rounded-2xl border border-white/10 bg-black/40 hover:border-accent/40 transition-all group/card">
                                                                            <div className="flex justify-between items-start mb-2">
                                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{event.category}</span>
                                                                                <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded">₹{event.budget?.toLocaleString()}</span>
                                                                            </div>
                                                                            <h5 className="font-bold text-white group-hover/card:text-accent transition-colors">{event.name}</h5>
                                                                            <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-500 font-bold uppercase">
                                                                                <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                                                                                <span>•</span>
                                                                                <span>📍 {event.district || 'Remote'}</span>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => navigate(`/event-plan/${event._id}`)}
                                                                                className="w-full mt-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                                                                            >
                                                                                Inspect Plan
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : !loadingUserEvents && (
                                                                <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                                                                    <p className="text-xs font-bold uppercase tracking-widest">No deployments linked to this asset.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "vendors" && (
                    <div className="glass-card rounded-3xl border border-white/10 overflow-hidden animate-fade-in shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-white/10">
                                    <tr>
                                        <th className="p-6">Vendor</th>
                                        <th className="p-6">Owner</th>
                                        <th className="p-6">Performance</th>
                                        <th className="p-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {allVendors.map(v => (
                                        <>
                                            <tr key={v._id} className={`hover:bg-white/5 transition-all group cursor-pointer ${expandedVendor === v._id ? 'bg-white/5' : ''}`} onClick={() => fetchVendorBookings(v._id)}>
                                                <td className="p-6">
                                                    <div className="font-semibold text-white group-hover:text-accent transition-colors flex items-center gap-2 text-lg">
                                                        {v.name}
                                                        {expandedVendor === v._id ? <span>🔼</span> : <span>🔽</span>}
                                                    </div>
                                                    <div className="text-gray-500 text-xs">{v.category} • Base: ₹{v.price.toLocaleString()}</div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="text-sm font-medium">{v.owner?.name || 'Unknown'}</div>
                                                    <div className="text-gray-500 text-xs">{v.owner?.email || ''}</div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Orders:</span>
                                                            <span className="text-xs font-black text-white">{v.bookingCount || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Revenue:</span>
                                                            <span className="text-xs font-black text-accent">₹{(v.totalRevenue || 0).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <button onClick={(e) => { e.stopPropagation(); fetchVendorBookings(v._id); }} className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-white text-[10px] font-bold transition-all uppercase tracking-widest">
                                                        {expandedVendor === v._id ? 'Close' : 'View Bookings'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedVendor === v._id && (
                                                <tr className="bg-white/[0.02]">
                                                    <td colSpan="4" className="p-6 border-b border-white/10">
                                                        <div className="animate-in slide-in-from-top-2 duration-300">
                                                            <div className="flex items-center justify-between mb-6">
                                                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Booking Manifest for {v.name}</h4>
                                                                {loadingVendorBookings && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
                                                            </div>

                                                            {vendorBookings.length > 0 ? (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                    {vendorBookings.map(booking => (
                                                                        <div key={booking._id} className="glass-card p-6 rounded-[2rem] border border-white/10 bg-black/40 hover:border-primary/40 transition-all group/card shadow-xl">
                                                                            <div className="flex justify-between items-start mb-4">
                                                                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                                                                    booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                                                                                    booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                                                                    'bg-red-500/20 text-red-500 border border-red-500/30'
                                                                                }`}>
                                                                                    {booking.status}
                                                                                </span>
                                                                                <span className="text-[10px] font-black text-white bg-white/10 px-3 py-1 rounded-lg italic">₹{booking.totalPrice?.toLocaleString()}</span>
                                                                            </div>
                                                                            <h5 className="font-bold text-lg text-white group-hover/card:text-primary transition-colors mb-4">{booking.event?.name || 'Untitled Event'}</h5>
                                                                            
                                                                            <div className="space-y-3">
                                                                                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                                                    <span className="opacity-50">👤 Client:</span>
                                                                                    <span className="text-white">{booking.user?.name}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                                                    <span className="opacity-50">📅 Date:</span>
                                                                                    <span className="text-white">{new Date(booking.serviceDate).toLocaleDateString()}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : !loadingVendorBookings && (
                                                                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-40">
                                                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">No confirmed assignments detected.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {allVendors.length === 0 && <p className="p-20 text-center text-gray-500 font-bold uppercase tracking-widest">No registered entities found.</p>}
                    </div>
                )}

                {activeTab === "events" && (
                    <div className="glass-card rounded-3xl border border-white/10 overflow-hidden animate-fade-in">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-widest border-b border-white/10">
                                    <tr>
                                        <th className="p-6">Event</th>
                                        <th className="p-6">Schedule</th>
                                        <th className="p-6 text-right">Budget</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {allEvents.map(e => (
                                        <tr key={e._id} className="hover:bg-white/ group transition-all">
                                            <td className="p-6">
                                                <div className="font-semibold text-white group-hover:text-accent transition-colors">{e.name}</div>
                                                <div className="text-gray-500 text-xs">{e.category}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-gray-300 text-sm font-medium">{new Date(e.startDate).toLocaleDateString()}</div>
                                                <div className="text-[9px] text-green-500 font-bold uppercase tracking-tighter mt-1">Confirmed</div>
                                            </td>
                                            <td className="p-6 text-right font-mono font-bold text-accent">
                                                ₹{e.budget?.toLocaleString() || '0'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {allEvents.length === 0 && <p className="p-20 text-center text-gray-500">No events found on the platform.</p>}
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="max-w-2xl animate-fade-in space-y-6">
                        <div className="glass-card p-8 rounded-3xl border border-white/10 bg-white/5">
                            <h2 className="text-xl font-bold mb-6">Advanced Options</h2>
                            <div className="space-y-4">
                                <button className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all flex justify-between items-center group">
                                    <div>
                                        <p className="font-bold">Broadcast Platform Update</p>
                                        <p className="text-xs text-gray-500">Send an alert to all registered users.</p>
                                    </div>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                                <button className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all flex justify-between items-center group">
                                    <div>
                                        <p className="font-bold">Manage Event Categories</p>
                                        <p className="text-xs text-gray-500">Add or remove event types (Weddings, etc.)</p>
                                    </div>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                                <button className="w-full p-4 rounded-2xl bg-white/5 border border-red-500/20 text-left hover:bg-red-500/10 transition-all flex justify-between items-center group">
                                    <div>
                                        <p className="font-bold text-red-500">Clear Cache</p>
                                        <p className="text-xs text-red-500/50">Refresh all platform data caches.</p>
                                    </div>
                                    <span>⚡</span>
                                </button>
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
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
        >
            <span className="text-lg">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
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

export default AdminDashboard;
