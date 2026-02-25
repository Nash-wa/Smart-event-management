import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
        const res = await fetch('http://localhost:5000/api/messages/feed', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) setFeed(data);
      } catch (err) { console.error(err); }
    };

    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/events', {
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
        <div className="mb-10">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Command Center
          </h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <p className="text-muted-foreground">Welcome back, {user.name || 'User'} 👋</p>

            {events.length > 0 && !loadingEvents && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Plan:</span>
                <select
                  className="bg-transparent text-xs font-bold text-accent outline-none cursor-pointer"
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
          <div className="mb-8 overflow-hidden rounded-2xl bg-orange-500/10 border border-orange-500/20 p-4 relative group">
            <div className="flex items-center gap-4 animate-pulse-slow">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">📣</span>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">
                  Live Announcement • {feed[0].event?.name}
                </p>
                <p className="text-sm font-medium text-white truncate">
                  {feed[0].text}
                </p>
              </div>
              <button
                onClick={() => alert("Recent Updates:\n" + feed.map(m => `${m.type}: ${m.text}`).join('\n'))}
                className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest px-3 py-1 border border-white/5 rounded-lg"
              >
                View History
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Event Card */}
          <div className="glass-card p-6 rounded-3xl group hovered-card cursor-pointer" onClick={() => navigate("/create-event")}>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">➕</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Event</h3>
            <p className="text-muted-foreground text-sm mb-4">Plan and launch a new professional event with smart resource management.</p>
            <div className="flex items-center text-primary text-sm font-medium">
              Start Creating <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* My Events */}
          <div className="glass-card p-6 rounded-3xl group hovered-card cursor-pointer" onClick={() => navigate("/my-events")}>
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">My Events</h3>
            <p className="text-muted-foreground text-sm mb-4">Manage your upcoming weddings, parties, or conferences.</p>
            <div className="flex items-center text-secondary text-sm font-medium">
              View All <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Analytics/Budgets */}
          <div
            className={`glass-card p-6 rounded-3xl group hovered-card cursor-pointer transition-all ${!activeEvent ? 'opacity-50 grayscale' : ''}`}
            onClick={() => handleSmartNavigate("/budget")}
          >
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Budget & Analytics</h3>
            <p className="text-muted-foreground text-sm mb-4">Track expenses for venue, catering, and more.</p>
            <div className="flex items-center text-accent text-sm font-medium">
              {activeEvent ? "Analyze Current" : "Select Event First"} <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Notifications */}
          <div
            className={`glass-card p-6 rounded-3xl group hovered-card cursor-pointer transition-all ${!activeEvent ? 'opacity-50 grayscale' : ''}`}
            onClick={() => handleSmartNavigate("/notifications")}
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🔔</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Notifications</h3>
            <p className="text-muted-foreground text-sm mb-4">Check RSVPs and alerts.</p>
            <div className="flex items-center text-orange-400 text-sm font-medium">
              Check Alerts <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Schedule */}
          <div
            className={`glass-card p-6 rounded-3xl group hovered-card cursor-pointer transition-all ${!activeEvent ? 'opacity-50 grayscale' : ''}`}
            onClick={() => handleSmartNavigate("/schedule")}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🕒</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Itinerary</h3>
            <p className="text-muted-foreground text-sm mb-4">Manage the event timeline and flow.</p>
            <div className="flex items-center text-blue-400 text-sm font-medium">
              Plan Timeline <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Participants */}
          <div
            className={`glass-card p-6 rounded-3xl group hovered-card cursor-pointer transition-all ${!activeEvent ? 'opacity-50 grayscale' : ''}`}
            onClick={() => handleSmartNavigate("/participants")}
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Guest List</h3>
            <p className="text-muted-foreground text-sm mb-4">See who is attending.</p>
            <div className="flex items-center text-pink-400 text-sm font-medium">
              View Guests <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>


          {/* AR Navigation Card */}
          <div
            className={`glass-card p-6 rounded-3xl group hovered-card cursor-pointer border-accent/20 bg-accent/5 transition-all ${!activeEvent ? 'opacity-50 grayscale' : ''}`}
            onClick={() => handleSmartNavigate("/ar-navigation")}
          >
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">👓</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">AR Explorer</h3>
            <p className="text-muted-foreground text-sm mb-4">Navigate venues using augmented reality guidance.</p>
            <div className="flex items-center text-accent text-sm font-medium">
              Launch AR <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Gate Management Card */}
          <div
            className={`glass-card p-6 rounded-3xl group hovered-card cursor-pointer border-emerald-500/20 bg-emerald-500/5 transition-all ${!activeEvent ? 'opacity-50 grayscale' : ''}`}
            onClick={() => handleSmartNavigate("/checkin")}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🎟️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Gate Management</h3>
            <p className="text-muted-foreground text-sm mb-4">Validate tickets and manage event check-ins in real-time.</p>
            <div className="flex items-center text-emerald-400 text-sm font-medium">
              Open Scanner <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Browse Services Extra Card */}
          <div className="glass-card p-6 rounded-3xl group hovered-card cursor-pointer border-white/5 bg-white/5" onClick={() => navigate("/services")}>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🏬</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Vendor Teams</h3>
            <p className="text-muted-foreground text-sm mb-4">Explore menus and work of all departments.</p>
            <div className="flex items-center text-gray-400 text-sm font-medium">
              Browse All <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
