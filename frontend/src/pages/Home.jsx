import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Home() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white selection:bg-accent selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-card border-x-0 border-t-0 rounded-none px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <span className="text-xl font-bold">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Smart Event</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/services")}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Browse Services
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    localStorage.removeItem('userInfo');
                    window.location.reload();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => {
                    if (user.role === 'admin') navigate("/admin-dashboard");
                    else if (user.role === 'vendor') navigate("/vendor-dashboard");
                    else navigate("/dashboard");
                  }}
                  className="px-6 py-2 rounded-xl bg-accent text-white font-bold hover:shadow-glow transition-all animate-fade-in"
                >
                  {user.role === 'admin' ? 'Admin OS' : 'My Dashboard'}
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-6 py-2 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-colors shadow-lg"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-secondary/20 rounded-full blur-[100px] animate-float-animation"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-300">AI-Powered Event Management</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Craft Unforgettable <br />
            <span className="bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent">
              Moments & Memories
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            From intimate birthday parties to grand corporate summits.
            Plan, organize, and execute any event with our intelligent platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/register")}
              className="gradient-button text-lg px-10 py-4 h-auto min-w-[200px]"
            >
              Start Planning Free
            </button>
            <button
              onClick={() => navigate("/services")}
              className="px-10 py-4 rounded-2xl glass-button text-lg font-medium hover:bg-white/10 transition-all min-w-[200px]"
            >
              Explore Teams
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Designed for Every Occasion</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Whether it's a personal celebration or a professional gathering, we have the tools you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎂"
              title="Social Events"
              desc="Perfect for Birthdays, Anniversaries, and Weddings. Manage guest lists, catering, and invitations effortlessly."
              color="from-pink-500/20 to-rose-500/20"
            />
            <FeatureCard
              icon="🎤"
              title="Corporate & Tech"
              desc="Streamline Conferences, Workshops, and Hackathons with registration, ticketing, and live streaming tools."
              color="from-blue-500/20 to-cyan-500/20"
            />
            <FeatureCard
              icon="🎨"
              title="Creative Arts"
              desc="Organize Concerts, Exhibitions, and Festivals. Handle verified entry and merchandise budgeting easily."
              color="from-purple-500/20 to-indigo-500/20"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-muted-foreground relative z-10 bg-black/50 backdrop-blur-xl">
        <p>© 2026 Smart Event Management. Crafted for excellence.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className={`p-8 rounded-3xl border border-white/10 bg-gradient-to-br ${color} backdrop-blur-md hover:translate-y-[-10px] transition-transform duration-300 group`}>
      <div className="w-16 h-16 rounded-2xl bg-black/20 flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

export default Home;



