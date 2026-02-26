import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from 'qrcode.react';

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrEventId, setQrEventId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/events`, {
          headers: {
            'Authorization': `Bearer ${userInfo?.token}`
          }
        });
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  const categoryEmoji = (cat = '') => {
    const c = cat.toLowerCase();
    if (c.includes('wedding')) return '💍';
    if (c.includes('festival')) return '🎪';
    if (c.includes('conference') || c.includes('corporate')) return '🏢';
    if (c.includes('hackathon')) return '💻';
    if (c.includes('workshop')) return '🛠️';
    if (c.includes('party')) return '🎉';
    return '📅';
  };

  return (
    <div className="min-h-screen p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">My Events</h2>
          <p className="text-white/40 text-sm uppercase tracking-widest font-bold">Manage · Deploy · Navigate</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-10 w-10 rounded-full border-4 border-t-primary border-white/10 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const arUrl = `${window.location.origin}/ar/${event._id}`;
              const nodeCount = event.nodes?.length || 0;
              const isQrOpen = qrEventId === event._id;

              return (
                <div key={event._id} className="glass-card p-6 rounded-3xl border border-white/5 bg-white/5 group flex flex-col">
                  {/* Top row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                      {categoryEmoji(event.category)}
                    </div>
                    <div className="flex items-center gap-2">
                      {nodeCount > 0 && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-black bg-green-500/10 border border-green-500/20 text-green-400 uppercase tracking-widest">
                          {nodeCount} Nodes
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full text-[10px] font-medium border border-primary/20 text-primary bg-primary/10">
                        Live
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black mb-1 text-white group-hover:text-primary transition-colors truncate uppercase tracking-tight">
                    {event.name}
                  </h3>
                  <p className="text-sm text-white/40 mb-1 font-mono">
                    {event.startDate ? new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                  </p>
                  {event.venue && (
                    <p className="text-xs text-white/30 mb-4 truncate">📍 {event.venue}</p>
                  )}

                  {/* QR Section (expandable) */}
                  {isQrOpen && (
                    <div className="mb-4 p-4 bg-white/5 border border-purple-500/20 rounded-2xl flex flex-col items-center gap-3">
                      <div className="p-3 bg-white rounded-xl">
                        <QRCodeSVG value={arUrl} size={120} />
                      </div>
                      <p className="text-[9px] text-white/40 font-mono text-center break-all">{arUrl}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(arUrl); }}
                        className="px-4 py-2 bg-purple-500 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-purple-600"
                      >
                        📋 Copy Link
                      </button>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-auto flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/event-plan/${event._id}`)}
                      className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-sm font-black uppercase tracking-widest text-white"
                    >
                      ⚙️ Control Panel
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/ar/${event._id}`)}
                        disabled={nodeCount === 0}
                        className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${nodeCount > 0 ? 'bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20' : 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'}`}
                      >
                        🚀 Guest AR
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setQrEventId(isQrOpen ? null : event._id); }}
                        className="flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all"
                      >
                        📱 QR Code
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Create New */}
            <div
              onClick={() => navigate("/create-event")}
              className="border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-white/5 hover:border-primary/30 transition-all min-h-[220px] group"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 text-3xl font-bold group-hover:scale-110 transition-all">
                +
              </div>
              <h3 className="font-black text-white uppercase tracking-tight">Create New Event</h3>
              <p className="text-white/30 text-xs mt-1 uppercase tracking-widest">Start planning</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyEvents;
