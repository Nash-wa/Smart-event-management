import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-secondary to-blue-500 bg-clip-text text-transparent">
          My Events
        </h2>
        <p className="text-muted-foreground mb-8">Manage the events you have created.</p>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading your events...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} onClick={() => navigate(`/event-plan/${event._id}`)} className="glass-card p-6 rounded-3xl group cursor-pointer hover:border-secondary/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl`}>
                    📅
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border border-white/10 text-secondary`}>
                    Live
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-1 text-white group-hover:text-secondary transition-colors truncate">{event.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{new Date(event.startDate).toLocaleDateString()}</p>

                <button className="w-full py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-medium">
                  View Smart Plan
                </button>
              </div>
            ))}

            {/* Create New Placeholder */}
            <div onClick={() => navigate("/create-event")} className="border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-white/5 transition-all min-h-[200px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 text-2xl font-bold">
                +
              </div>
              <h3 className="font-semibold text-white">Create New Event</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyEvents;
