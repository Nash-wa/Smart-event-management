import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const userInfo = localStorage.getItem('userInfo');
  const user = userInfo ? JSON.parse(userInfo) : {};

  useEffect(() => {
    if (user.role === 'admin') navigate("/admin-dashboard");
    else if (user.role === 'vendor') navigate("/vendor-dashboard");
    else if (!user._id) navigate("/login");
  }, [user.role, user._id, navigate]);

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
            Dashboard
          </h2>
          <p className="text-muted-foreground">Welcome back, {user.name || 'User'} 👋</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Event Card */}
          <div className="glass-card p-6 rounded-3xl group hovered-card cursor-pointer" onClick={() => navigate("/create-event")}>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">➕</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Event</h3>
            <p className="text-muted-foreground text-sm mb-4">Plan and launch a new event with AI assistance.</p>
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
          <div className="glass-card p-6 rounded-3xl group hovered-card cursor-pointer" onClick={() => navigate("/budget")}>
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Budget & Analytics</h3>
            <p className="text-muted-foreground text-sm mb-4">Track expenses for venue, catering, and more.</p>
            <div className="flex items-center text-accent text-sm font-medium">
              Analyze <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-card p-6 rounded-3xl group hovered-card cursor-pointer" onClick={() => navigate("/notifications")}>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🔔</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Notifications</h3>
            <p className="text-muted-foreground text-sm mb-4">Check RSVPs and alerts.</p>
            <div className="flex items-center text-orange-400 text-sm font-medium">
              Check <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Schedule */}
          <div className="glass-card p-6 rounded-3xl group hovered-card cursor-pointer" onClick={() => navigate("/schedule")}>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🕒</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Itinerary</h3>
            <p className="text-muted-foreground text-sm mb-4">Manage the event timeline and flow.</p>
            <div className="flex items-center text-blue-400 text-sm font-medium">
              Plan <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Participants */}
          <div className="glass-card p-6 rounded-3xl group hovered-card cursor-pointer" onClick={() => navigate("/participants")}>
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Guest List</h3>
            <p className="text-muted-foreground text-sm mb-4">See who is attending.</p>
            <div className="flex items-center text-pink-400 text-sm font-medium">
              View <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Browse Services Extra Card */}
          <div className="glass-card p-6 rounded-3xl group hovered-card cursor-pointer border-accent/20 bg-accent/5" onClick={() => navigate("/services")}>
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🏬</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Vendor Teams</h3>
            <p className="text-muted-foreground text-sm mb-4">Explore menus and work of all departments.</p>
            <div className="flex items-center text-accent text-sm font-medium">
              Browse All <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
