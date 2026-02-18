import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";

// Vendor Data Store - Mock for now, will replace with API fetch
const vendorDataStore = {
  "Wedding": [
    { name: "Elite Malabar Catering", type: "Catering", rating: "4.8", reviews: "3.2k", slots: 3, deal: "Book 1000+ plates, get free live tea stall", ig: true },
    { name: "Wedding Bells Photography", type: "Photography", rating: "4.9", reviews: "1.1k", slots: 2, deal: "Free cinematic wedding teaser", ig: true },
    { name: "Rainmakers Decor Thrissur", type: "Decor", rating: "4.7", reviews: "500", slots: 1, deal: "Complimentary entrance floral arch", ig: true }
  ],
  "Engagement": [
    { name: "Choice Catering", type: "Catering", rating: "4.6", reviews: "2.5k", slots: 5, deal: "Special Nischayam snack platter free", ig: false },
    { name: "Frames by Vishnu", type: "Photography", rating: "4.8", reviews: "450", slots: 2, deal: "Free Engagement album printing", ig: true }
  ],
  "Tech Fest": [
    { name: "V-Sound Tech", type: "Stage & Tech", rating: "4.7", reviews: "890", slots: 2, deal: "20% off on bulk LED wall bookings", ig: false },
    { name: "The Foodie Joint", type: "Bulk Meals", rating: "4.4", reviews: "1.2k", slots: 10, deal: "Student fest bulk boxes at ₹99/plate", ig: true }
  ],
  "Housewarming": [
    { name: "Naushad Big Chef", type: "Catering", rating: "4.9", reviews: "15k", slots: 1, deal: "Masterchef's signature Biryani deal", ig: true },
    { name: "Green Leaf Florals", type: "Traditional Decor", rating: "4.5", reviews: "200", slots: 4, deal: "Fresh flower thoranam free", ig: false }
  ],
  "Ganamela": [
    { name: "Thrissur Beats Audio", type: "Sound & Lighting", rating: "4.8", reviews: "600", slots: 3, deal: "Concert-grade sound at 15% discount", ig: true }
  ]
};

function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Wedding");
  const [budget, setBudget] = useState(75000);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  // Chart Logic
  useEffect(() => {
    if (planGenerated && canvasRef.current) {
      if (chartRef.current) chartRef.current.destroy();

      const dataMap = {
        "Wedding": [40, 20, 20, 20],
        "Engagement": [30, 30, 20, 20],
        "Tech Fest": [15, 35, 10, 40],
        "Housewarming": [50, 20, 10, 20],
        "Ganamela": [10, 20, 10, 60]
      };
      const data = dataMap[selectedCategory] || [25, 25, 25, 25];

      chartRef.current = new Chart(canvasRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Catering', 'Venue', 'Photography', 'Decor/Tech'],
          datasets: [{
            data: data,
            backgroundColor: ['#4f46e5', '#818cf8', '#c7d2fe', '#6366f1'],
            borderWidth: 0,
            hoverOffset: 30
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 30, font: { weight: '800', size: 12 }, color: '#64748b' }
            }
          },
          cutout: '78%'
        }
      });
    }
  }, [planGenerated, selectedCategory]);

  const generateStartupPlan = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setPlanGenerated(true);
      setIsSyncing(false);
      setAiTip(getAITip(budget));
    }, 1000);
  };

  const getAITip = (budgetVal) => {
    if (budgetVal < 100000) return "Budget strategy: Focus on core hospitality in Thrissur. We've matched you with reliable mid-tier partners who prioritize quality over flashy branding.";
    if (budgetVal < 500000) return "Balanced tier detected. You can afford premium photography. We suggest locking in 'Wedding Bells' immediately as their seasonal slots are filling fast.";
    return "Elite status active. Centralized AR navigation and luxury venues like Lulu Convention Center are now accessible. We recommend a 40% allocation to venue logistics.";
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="p-6 max-w-7xl mx-auto flex justify-between items-center sticky top-0 z-40 bg-white/50 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl rotate-3">U</div>
          <div>
            <span className="font-extrabold text-2xl tracking-tighter block leading-none">UtsavAI</span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-indigo-500 font-black">Startup Kerala • Thrissur</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/dashboard")} className="hidden lg:block text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Vendor Dashboard</button>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE BOOKING OPEN
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar: Configuration */}
        <section className="lg:col-span-12 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-10">
              <div className="animate-fade-in">
                <h1 className="text-5xl font-black tracking-tight mb-4 leading-[1.1] text-slate-900">
                  Plan Local. <br /><span className="text-indigo-600">Scale Smart.</span>
                </h1>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  The only platform using real Google & Instagram data to match you with Thrissur's top-rated vendors within your budget.
                </p>
              </div>

              <div className="p-8 bg-white/90 backdrop-blur-2xl border border-slate-200/80 rounded-[32px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] space-y-8 animate-fade-in delay-100">
                {/* Event Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target Event Category</label>
                  <div className="flex flex-wrap gap-2">
                    {["Wedding", "Engagement", "Housewarming", "Tech Fest", "Corporate", "Ganamela"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${selectedCategory === cat
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 -translate-y-[2px]"
                          : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200"
                          }`}
                      >
                        {cat === "Engagement" ? "Nischayam" : cat === "Housewarming" ? "Grihapravesham" : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Budget (₹)</label>
                    <span className="text-4xl font-black text-indigo-600 tracking-tighter">
                      ₹{parseInt(budget).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30000"
                    max="2500000"
                    step="10000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Standard</span>
                    <span>Mid-Tier</span>
                    <span>Elite</span>
                  </div>
                </div>

                <button
                  onClick={generateStartupPlan}
                  disabled={isSyncing}
                  className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 text-lg group disabled:opacity-75"
                >
                  {isSyncing ? (
                    <>
                      <span className="animate-spin">🌀</span> Syncing Real-Time Availability...
                    </>
                  ) : (
                    <>
                      <span>⚡</span> Initialize AI Matching
                    </>
                  )}
                </button>
              </div>

              {/* Reliability Box */}
              {planGenerated && (
                <div className="p-8 bg-slate-900 rounded-[40px] border border-slate-800 animate-pop shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
                      <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Agent Analysis</p>
                    </div>
                    <div className="text-white font-mono text-[10px] opacity-40">THR_V_4.2</div>
                  </div>
                  <p className="text-sm italic text-indigo-100 leading-relaxed font-medium">
                    {aiTip}
                  </p>
                </div>
              )}
            </div>

<<<<<<< HEAD
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm font-medium text-gray-300">Data-Driven Event Operations</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Craft Unforgettable <br />
            <span className="bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent">
              Moments & Memories
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            From intimate birthday parties to grand corporate summits.
            Plan, organize, and execute any event with our production-ready smart planning engine.
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
              icon="📊"
              title="Operations Hub"
              desc="Real-time control panel for budgets, timelines, and resource allocation. Professional tools for serious event organizers."
              color="from-primary/20 to-accent/20"
            />
            <FeatureCard
              icon="👓"
              title="AR Explorer"
              desc="Revolutionary Augmented Reality venue navigation. Guide your guests through complex spaces with ease."
              color="from-blue-500/20 to-cyan-500/20"
            />
          </div>
        </div>
      </section>
=======
            <section className="lg:col-span-7 space-y-10">
              {!planGenerated ? (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center py-20 text-slate-300 border-2 border-dashed border-slate-200 rounded-[48px] bg-slate-50/50">
                  <div className="text-9xl mb-8 opacity-10">🚀</div>
                  <p className="text-2xl font-black text-slate-400 tracking-tight">System Ready for Deployment</p>
                  <p className="text-sm font-medium">Select parameters to see realistic vendor pairings.</p>
                </div>
              ) : (
                <div className="space-y-12 animate-fade-in">
                  {/* Chart */}
                  <div className="p-10 relative overflow-hidden bg-white/90 backdrop-blur-2xl border border-slate-200/80 rounded-[32px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10">Resource Distribution Map</h3>
                    <div className="relative w-full max-w-[480px] mx-auto h-[340px]">
                      <canvas ref={canvasRef}></canvas>
                    </div>
                  </div>

                  {/* Vendors */}
                  <div>
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black tracking-tight">Verified Matchmaking</h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Found in Thrissur Area</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(vendorDataStore[selectedCategory] || vendorDataStore["Wedding"]).map((v, i) => (
                        <VendorCard key={i} vendor={v} budget={budget} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="pt-20 border-t border-slate-100">
            <h2 className="text-3xl font-black mb-12 text-center tracking-tight">Advanced Platform Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon="🎂"
                title="Social Events"
                desc="Perfect for Birthdays, Anniversaries, and Weddings. Manage guest lists, catering, and invitations effortlessly."
                color="from-pink-500/20 to-rose-500/20"
              />
              <FeatureCard
                icon="🧠"
                title="Venture Advisor"
                desc="Our proprietary Tactical Intelligence engine provides tailored advice for event ventures, maximizing ROI and efficiency."
                color="from-indigo-500/20 to-purple-500/20"
              />
              <FeatureCard
                icon="👓"
                title="AR Explorer"
                desc="Revolutionary Augmented Reality venue navigation. Guide your guests through complex spaces with ease."
                color="from-blue-500/20 to-cyan-500/20"
              />
            </div>
          </div>
        </section>
      </main>
>>>>>>> origin/nashwa

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 text-center text-slate-400 relative z-10 bg-white mt-20">
        <p className="font-bold text-sm">© 2026 UtsavAI. Crafted for Kerala's Startup Ecosystem.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className={`p-8 bg-gradient-to-br ${color} border border-slate-100 rounded-[32px] transition-all hover:shadow-xl hover:-translate-y-1`}>
      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl mb-6 shadow-sm">{icon}</div>
      <h3 className="text-xl font-black mb-3 text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function VendorCard({ vendor, budget }) {
  const isSoldOut = vendor.slots === 0;
  return (
    <div className={`p-6 bg-white/90 backdrop-blur-md border border-slate-200 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 ${isSoldOut ? 'opacity-60 grayscale pointer-events-none' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{vendor.type}</span>
        {vendor.slots < 3 && <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest">Only {vendor.slots} slots left</span>}
      </div>
      <h4 className="font-black text-slate-900 text-xl mb-1">{vendor.name}</h4>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-amber-500 font-black text-sm">★ {vendor.rating}</span>
        <span className="text-slate-400 text-[10px] font-bold">({vendor.reviews} Google Reviews)</span>
        {vendor.ig && <span className="text-pink-500 text-[10px] font-black uppercase tracking-tighter">Verified IG</span>}
      </div>
      <div className="p-5 bg-indigo-50/50 rounded-2xl mb-6">
        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Exclusive Startup Offer</p>
        <p className="text-sm font-bold text-slate-700 leading-tight">{vendor.deal}</p>
      </div>
      <button className="w-full py-4 bg-white border-2 border-indigo-600 text-indigo-600 font-black rounded-2xl hover:bg-indigo-600 hover:text-white transition-all text-xs uppercase tracking-widest">
        Check Slot & Book (Approx ₹{(budget * 0.2).toLocaleString()})
      </button>
    </div>
  );
}

export default Home;
