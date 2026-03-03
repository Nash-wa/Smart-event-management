import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from 'qrcode.react';

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [bookings, setBookings] = useState([]);
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

  const fetchBookings = async (eventId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`http://localhost:5000/api/bookings/event/${eventId}`, {
        headers: { 'Authorization': `Bearer ${userInfo?.token}` }
      });
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
      setSelectedEventId(eventId);
    } catch (error) {
      console.error(error);
    }
  };

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
    <div className="min-h-screen bg-black text-white p-4 md:p-10">
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
              const isSelected = selectedEventId === event._id;

              return (
                <div key={event._id} className="glass-card p-6 rounded-3xl border border-white/5 bg-white/5 group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                      {categoryEmoji(event.category)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => isSelected ? setSelectedEventId(null) : fetchBookings(event._id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? 'bg-white text-black' : 'bg-accent/10 border border-accent/20 text-accent'}`}
                      >
                        {isSelected ? 'Close' : 'Bookings'}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-black mb-1 text-white group-hover:text-primary transition-colors truncate uppercase tracking-tight">
                    {event.name}
                  </h3>
                  <p className="text-sm text-white/40 mb-1 font-mono">
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-accent font-black uppercase tracking-widest mb-4">
                    Budget: ₹{(event.usedBudget || 0).toLocaleString()} / ₹{(event.budget || 0).toLocaleString()}
                  </p>

                  {isSelected && (
                    <div className="mb-4 bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3 animate-fade-in-up">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-2">Reserved Services</h4>
                      {bookings.length > 0 ? (
                        bookings.map(b => (
                          <div key={b._id} className="flex justify-between items-center text-xs">
                            <span className="text-white/80 font-bold truncate max-w-[120px]">{b.vendor?.name || 'Assigned Partner'}</span>
                            <span className={`px-2 py-[2px] rounded-md text-[8px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-green-500/20 text-green-500 border border-green-500/10' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10'}`}>
                              {b.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-gray-500 italic">No services reserved for this event.</p>
                      )}
                    </div>
                  )}

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
                        className="flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                      >
                        🚀 Guest AR
                      </button>
                      <button
                        onClick={() => navigate("/services")}
                        className="flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all"
                      >
                        ✨ Services
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <footer className="mt-20 py-12 border-t border-white/10 text-center">
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] italic">Precision in every event tier · 2026</p>
      </footer>
    </div>
  );
}

export default MyEvents;
