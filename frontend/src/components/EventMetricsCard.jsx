import { useState, useEffect } from 'react';

const EventMetricsCard = ({ event, token }) => {
  const [readiness, setReadiness] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0, active: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const readinessRes = await fetch(
          `http://localhost:5000/api/events/${event._id}/readiness`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (readinessRes.ok) {
          const readinessData = await readinessRes.json();
          setReadiness(readinessData);
        } else {
          const data = await readinessRes.json();
          throw new Error(data.message || 'Failed to load readiness metrics');
        }

        const bookingsRes = await fetch(
          `http://localhost:5000/api/bookings/event/${event._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData.filter(b => b.status !== 'cancelled'));
        }
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (event && token) {
      fetchMetrics();
    }
  }, [event, token]);

  // Dynamic countdown logic
  useEffect(() => {
    const calcCountdown = () => {
      const now = new Date();
      const eventDate = new Date(event.startDate);
      const diff = eventDate - now;

      if (diff <= 0) {
        setCountdown(prev => ({ ...prev, active: true }));
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000),
        active: false
      });
    };

    calcCountdown();
    const interval = setInterval(calcCountdown, 1000);
    return () => clearInterval(interval);
  }, [event.startDate]);

  if (loading) return (
    <div className="glass-card p-8 rounded-3xl mb-8 animate-pulse bg-white/5 border border-white/10 h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Architecting Intelligence...</p>
      </div>
    </div>
  );

  if (error || !readiness) return (
    <div className="glass-card p-6 rounded-3xl mb-8 border border-red-500/20 bg-red-500/5">
      <p className="text-red-400 font-bold mb-2">⚠️ Metrics Offline</p>
      <p className="text-sm text-gray-400">{error || 'Unable to sync metrics.'}</p>
    </div>
  );

  const score = readiness.readinessScore || 0;
  const getScoreColor = (s) => s >= 75 ? 'text-emerald-400' : s >= 40 ? 'text-amber-400' : 'text-rose-400';
  const getScoreBg = (s) => s >= 75 ? 'bg-emerald-400/10' : s >= 40 ? 'bg-amber-400/10' : 'bg-rose-400/10';
  const getScoreStroke = (s) => s >= 75 ? '#10b981' : s >= 40 ? '#f59e0b' : '#f43f5e';

  const budgetUsed = event.usedBudget || 0;
  const budgetTotal = event.budget || 0;
  const budgetRemaining = Math.max(0, budgetTotal - budgetUsed);
  const budgetPercentage = budgetTotal > 0 ? Math.min((budgetUsed / budgetTotal) * 100, 100) : 0;

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

  // SVG Circular Progress Constants
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* READINESS CIRCULAR CARD */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-6xl font-black">Ready</span>
          </div>

          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64" cy="64" r={radius}
                stroke="currentColor" strokeWidth="8"
                fill="transparent" className="text-white/5"
              />
              <circle
                cx="64" cy="64" r={radius}
                stroke={getScoreStroke(score)} strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-black ${getScoreColor(score)}`}>{score}%</span>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Readiness</span>
            </div>
          </div>

          <div className={`px-4 py-1.5 rounded-full ${getScoreBg(score)} ${getScoreColor(score)} text-[10px] font-black uppercase tracking-widest`}>
            {score >= 75 ? 'Optimal Status' : score >= 40 ? 'Action Required' : 'Critical State'}
          </div>
        </div>

        {/* BUDGET & ANALYTICS CARD */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Financial Health</p>
              <h3 className="text-xl font-bold">Budget Performance</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">${budgetUsed.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500 font-medium">Out of ${budgetTotal.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${budgetPercentage > 90 ? 'bg-rose-500' : budgetPercentage > 70 ? 'bg-amber-500' : 'bg-accent'
                  }`}
                style={{ width: `${budgetPercentage}%` }}
              >
                <div className="w-full h-full opacity-30 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-tighter">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                <span className="text-gray-400">Used: {budgetPercentage.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/20"></span>
                <span className="text-gray-400">Free: {(100 - budgetPercentage).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Timeline Countdown */}
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">⏳</div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">T-Minus</p>
                <div className="flex gap-2">
                  {countdown.active ? (
                    <span className="text-emerald-400 font-bold animate-pulse">Event Live Now! 🚀</span>
                  ) : (
                    <>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">{countdown.days}</span>
                        <span className="text-[8px] text-gray-500 uppercase">Days</span>
                      </div>
                      <span className="text-gray-600">:</span>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">{String(countdown.hours).padStart(2, '0')}</span>
                        <span className="text-[8px] text-gray-500 uppercase">Hrs</span>
                      </div>
                      <span className="text-gray-600">:</span>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">{String(countdown.mins).padStart(2, '0')}</span>
                        <span className="text-[8px] text-gray-500 uppercase">Min</span>
                      </div>
                      <span className="text-gray-600">:</span>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-accent">{String(countdown.secs).padStart(2, '0')}</span>
                        <span className="text-[8px] text-gray-500 uppercase text-accent/50">Sec</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold hover:bg-white/10 transition-all text-gray-300">
              View Itinerary
            </button>
          </div>
        </div>
      </div>

      {/* 4 INTELLIGENCE CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all group">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Services Booked</p>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-black text-primary">{readiness.metrics.servicesCount}</h4>
            <span className="text-xs text-emerald-500 font-bold mb-1">+{confirmedBookings} verified</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all group">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Remaining Budget</p>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-black text-white">${budgetRemaining.toLocaleString()}</h4>
            <span className="text-[10px] text-gray-500 mb-1">Safe Zone</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all group">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">AR Nodes Count</p>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-black text-secondary">{readiness.metrics.arNodesCount}</h4>
            <span className="text-[10px] text-gray-500 mb-1">Active Mesh</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all group">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Confirmed Guests</p>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-black text-emerald-400">{readiness.metrics.guestCount || 0}</h4>
            <span className="text-[10px] text-gray-500 mb-1">Live RSVP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventMetricsCard;
