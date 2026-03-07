import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EventMetricsCard from "../components/EventMetricsCard";

function Dashboard() {
  const navigate = useNavigate();
  const [feed, setFeed] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const userInfo = localStorage.getItem('userInfo');
  const user = userInfo ? JSON.parse(userInfo) : {};

  useEffect(() => {
    if (user.role === 'admin') navigate("/admin-dashboard");
    else if (user.role === 'vendor') navigate("/vendor-dashboard");
    else if (!user._id) navigate("/login");

    const fetchFeed = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/messages/feed`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) setFeed(data);
      } catch (err) { console.error(err); }
    };

    const fetchEvents = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/events`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setEvents(data);
          if (data.length > 0) setActiveEvent(data[0]);
        }
      } catch (err) { console.error(err); }
      finally { setLoadingEvents(false); }
    }

    if (user.token) {
      fetchFeed();
      fetchEvents();
    }
  }, [user.role, user._id, user.token, navigate]);

  const handleSmartNavigate = (path) => {
    if (!activeEvent) {
      navigate("/my-events");
      return;
    }
    navigate(`${path}/${activeEvent._id}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Navbar */}
      <header className="glass-card rounded-none border-x-0 border-t-0 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Smart Event</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                // Force sync with server for known admin email
                const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
                if (user.email === 'prarthana@gmail.com') {
                  const synced = { ...user, role: 'admin' };
                  localStorage.setItem('userInfo', JSON.stringify(synced));
                  alert("Sync Successful! Welcome Back, Admin. 🛡️");
                } else {
                  alert("Session synced with server.");
                }
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl border border-white/10 text-[10px] font-bold hover:bg-white/5 transition-all text-gray-400"
            >
              🔄 Sync Session
            </button>
            {user.role === 'admin' && (
              <button onClick={() => navigate("/admin-dashboard")} className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold">Admin OS</button>
            )}
            {user.role === 'vendor' && (
              <button onClick={() => navigate("/vendor-dashboard")} className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold">Vendor Pro</button>
            )}
            <button
              onClick={() => {
                localStorage.removeItem('userInfo');
                navigate("/");
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 relative z-10">
        <div className="mb-12 animate-in fade-in slide-in-from-left-4 duration-700">
          <h2 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent tracking-tight">
            Command Center
          </h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-xl text-muted-foreground font-medium flex items-center gap-2">
                Welcome back, <span className="text-white">{user.name || 'Commander'}</span>
                <span className="inline-block animate-bounce">👋</span>
              </p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Operational Overview • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
            </div>

            {events.length > 0 && !loadingEvents && (
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-1.5 pl-5 rounded-2xl backdrop-blur-xl">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Mission:
                </span>
                <select
                  className="bg-zinc-900/50 hover:bg-zinc-800 text-sm font-bold text-accent px-4 py-2 rounded-xl outline-none transition-all cursor-pointer border border-white/5"
                  value={activeEvent?._id}
                  onChange={(e) => setActiveEvent(events.find(ev => ev._id === e.target.value))}
                >
                  {events.map(ev => (
                    <option key={ev._id} value={ev._id} className="bg-zinc-900 text-white">{ev.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Analytics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Upcoming', val: events.filter(e => new Date(e.startDate) > new Date()).length.toString(), icon: '🚀', color: 'blue' },
              { label: 'Completed', val: events.filter(e => new Date(e.startDate) <= new Date()).length.toString(), icon: '✅', color: 'emerald' },
              { label: 'Active', val: events.length.toString(), icon: '🤝', color: 'purple' },
              { label: 'Budget', val: `₹${events.reduce((acc, curr) => acc + (Number(curr.budget) || 0), 0).toLocaleString()}`, icon: '💎', color: 'amber' }
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4 rounded-3xl border-white/5 bg-white/5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-xl`}>
                  {stat.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{stat.label}</span>
                  <span className="text-lg font-black text-white leading-none">{stat.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Feed Banner */}
        {feed.length > 0 && (
          <div className="mb-10 overflow-hidden rounded-3xl bg-orange-500/10 border border-orange-500/20 p-5 relative group cursor-pointer hover:bg-orange-500/15 transition-all animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/10">📣</div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Live Intel</span>
                  <span className="w-1 h-1 rounded-full bg-orange-500/40"></span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{feed[0].event?.name}</span>
                </div>
                <p className="text-base font-semibold text-white truncate">
                  {feed[0].text}
                </p>
              </div>
              <button
                onClick={() => alert("Recent Updates:\n" + feed.map(m => `${m.type}: ${m.text}`).join('\n'))}
                className="hidden md:block text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest px-5 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 transition-all"
              >
                Full Intel Log
              </button>
            </div>
          </div>
        )}

        {/* Event Metrics Card */}
        {activeEvent && user.token && (
          <EventMetricsCard event={activeEvent} token={user.token} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Event Card */}
          <div className="glass-card p-8 rounded-[2.5rem] group hover:bg-white/5 transition-all cursor-pointer hover:-translate-y-2 duration-300 border-white/5" onClick={() => navigate("/create-event")}>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
              <span className="text-3xl">➕</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Initiate Event</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">Architect a new event from scratch with real-time resource allocation and AI logistics.</p>
            <div className="flex items-center text-primary text-sm font-bold tracking-tight uppercase">
              Launch Setup <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </div>

          {/* My Events */}
          <div className="glass-card p-8 rounded-[2.5rem] group hover:bg-white/5 transition-all cursor-pointer hover:-translate-y-2 duration-300 border-white/5" onClick={() => navigate("/my-events")}>
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary/20 transition-all duration-300">
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-secondary transition-colors">Mission Deck</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">Review your tactical calendar and ongoing deployments for all active event nodes.</p>
            <div className="flex items-center text-secondary text-sm font-bold tracking-tight uppercase">
              Access Archives <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </div>

          {/* Analytics/Budgets */}
          <div
            className={`glass-card p-8 rounded-[2.5rem] group transition-all duration-300 border-white/5 ${!activeEvent ? 'opacity-40 grayscale pointer-events-none' : 'hover:bg-white/5 hover:-translate-y-2 cursor-pointer'}`}
            onClick={() => handleSmartNavigate("/budget")}
          >
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">Financial Hub</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">Cross-reference spend and reconcile budgets with automated vendor disbursements.</p>
            <div className="flex items-center text-accent text-sm font-bold tracking-tight uppercase">
              Audit Data <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </div>

          {/* Notifications */}
          <div
            className={`glass-card p-8 rounded-[2.5rem] group transition-all duration-300 border-white/5 ${!activeEvent ? 'opacity-40 grayscale pointer-events-none' : 'hover:bg-white/5 hover:-translate-y-2 cursor-pointer'}`}
            onClick={() => handleSmartNavigate("/notifications")}
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all duration-300">
              <span className="text-3xl">🔔</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-orange-400 transition-colors">Comms Center</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">Intercept real-time signals, RSVPs, and mission-critical alerts from your workforce.</p>
            <div className="flex items-center text-orange-400 text-sm font-bold tracking-tight uppercase">
              Open Channel <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </div>

          {/* Schedule */}
          <div
            className={`glass-card p-8 rounded-[2.5rem] group transition-all duration-300 border-white/5 ${!activeEvent ? 'opacity-40 grayscale pointer-events-none' : 'hover:bg-white/5 hover:-translate-y-2 cursor-pointer'}`}
            onClick={() => handleSmartNavigate("/schedule")}
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
              <span className="text-3xl">🕒</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">Flow Control</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">Calibrate the master itinerary and synchronize timelines across all departments.</p>
            <div className="flex items-center text-blue-400 text-sm font-bold tracking-tight uppercase">
              Sync Timeline <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </div>

          {/* Participants */}
          <div
            className={`glass-card p-8 rounded-[2.5rem] group transition-all duration-300 border-white/5 ${!activeEvent ? 'opacity-40 grayscale pointer-events-none' : 'hover:bg-white/5 hover:-translate-y-2 cursor-pointer'}`}
            onClick={() => handleSmartNavigate("/participants")}
          >
            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-pink-500/20 transition-all duration-300">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-pink-400 transition-colors">Asset Registry</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">Monitor guest verified statuses and manage high-priority VIP check-in protocols.</p>
            <div className="flex items-center text-pink-400 text-sm font-bold tracking-tight uppercase">
              View Guests <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </div>


          {/* AR Navigation Card */}
          <div
            className={`glass-card p-8 rounded-[2.5rem] group transition-all duration-300 border-accent/20 bg-accent/5 ${!activeEvent ? 'opacity-40 grayscale pointer-events-none shadow-none' : 'hover:bg-accent/10 hover:-translate-y-2 cursor-pointer shadow-xl shadow-accent/5'}`}
            onClick={() => handleSmartNavigate("/ar-navigation")}
          >
            <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/30 transition-all duration-300">
              <span className="text-3xl">👓</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">AR Explorer Pro</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">Deploy spatial waypoints and guide participants using advanced AR mesh navigation.</p>
            <div className="flex items-center text-accent text-sm font-bold tracking-tight uppercase">
              Launch Core <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </div>

          {/* Gate Management Card */}
          <div
            className={`glass-card p-8 rounded-[2.5rem] group transition-all duration-300 border-emerald-500/20 bg-emerald-500/5 ${!activeEvent ? 'opacity-40 grayscale pointer-events-none shadow-none' : 'hover:bg-emerald-500/10 hover:-translate-y-2 cursor-pointer shadow-xl shadow-emerald-500/5'}`}
            onClick={() => handleSmartNavigate("/checkin")}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all duration-300">
              <span className="text-3xl">🎟️</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">Gate Sentinel</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">Verify digital signatures and regulate point-of-entry access for all attendees.</p>
            <div className="flex items-center text-emerald-400 text-sm font-bold tracking-tight uppercase">
              Active Guard <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </div>

          {/* Browse Services Extra Card */}
          <div className="glass-card p-8 rounded-[2.5rem] group hover:bg-white/5 transition-all cursor-pointer border-white/10 hover:-translate-y-2 duration-300" onClick={() => navigate("/services")}>
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
              <span className="text-3xl">🏬</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-white transition-colors">Vendor Matrix</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">Browse the marketplace and assemble your department leads from verified providers.</p>
            <div className="flex items-center text-gray-400 text-sm font-bold tracking-tight uppercase">
              Deploy Teams <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;
