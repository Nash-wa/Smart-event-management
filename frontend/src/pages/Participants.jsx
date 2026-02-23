import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSuggestedRoles } from "../utils/planningEngine";

function Participants() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [event, setEvent] = useState(null);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', role: 'Attendee' });

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const res = await fetch(`http://localhost:5000/api/participants/${eventId}`, {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`
          }
        });
        const data = await res.json();
        if (res.ok) setParticipants(data);
      } catch (error) {
        console.error("Failed to fetch participants", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/public/${eventId}`);
        const data = await res.json();
        if (res.ok) setEvent(data);
      } catch (error) {
        console.error("Failed to fetch event", error);
      }
    };

    fetchParticipants();
    fetchEvent();
  }, [eventId]);

  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`http://localhost:5000/api/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({ ...newGuest, event: eventId })
      });

      if (res.ok) {
        const added = await res.json();
        setParticipants([...participants, added]);
        setShowAddModal(false);
        setNewGuest({ name: '', email: '', role: 'Attendee' });
      }
    } catch (error) {
      console.error("Failed to add guest", error);
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').filter(row => row.trim());

        // Basic CSV Parsing (Name, Email, Role)
        const parsed = rows.slice(1).map(row => {
          const [name, email, role] = row.split(',').map(s => s.trim());
          return { name, email, role: role || 'Attendee' };
        }).filter(p => p.name && p.email);

        if (parsed.length === 0) {
          alert("No valid data found in CSV. Ensure format is: Name, Email, Role");
          setImporting(false);
          return;
        }

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const res = await fetch(`http://localhost:5000/api/participants/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo?.token}`
          },
          body: JSON.stringify({ eventId, participants: parsed })
        });

        if (res.ok) {
          const added = await res.json();
          setParticipants([...participants, ...added]);
          alert(`Successfully imported ${added.length} personnel.`);
        } else {
          const err = await res.json();
          alert(`Import failed: ${err.message}`);
        }
      } catch (error) {
        console.error("Bulk import failed", error);
        alert("Import failed. Check console for details.");
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteParticipant = async (id) => {
    if (!window.confirm("Are you sure you want to remove this participant?")) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`http://localhost:5000/api/participants/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userInfo?.token}`
        }
      });
      if (res.ok) {
        setParticipants(participants.filter(p => p._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete participant", error);
    }
  };

  const handleCopyRSVPLink = () => {
    const link = `${window.location.origin}/rsvp/${eventId}`;
    navigator.clipboard.writeText(link);
    alert("RSVP Link copied to clipboard! Share this with your guests for self-registration.");
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-8">Loading participants...</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">← Back</button>
          <h2 className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent uppercase tracking-tighter">
            Operational Guest List
          </h2>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] border-white/10 bg-white/5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h3 className="text-xl font-bold">Personnel Manifest</h3>
              <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">Event_ID: {eventId.slice(-6)}</p>
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <button
                onClick={handleCopyRSVPLink}
                className="flex-1 md:flex-none px-6 py-3 border border-primary/20 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                🔗 Copy RSVP Link
              </button>
              <label className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest bg-white/5">
                <span>📤</span> {importing ? 'Processing...' : 'Bulk Import (CSV)'}
                <input type="file" accept=".csv" disabled={importing} onChange={handleCSVUpload} className="hidden" />
              </label>
              <button
                onClick={() => navigate(`/checkin/${eventId}`)}
                className="flex-1 md:flex-none px-6 py-3 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 rounded-xl hover:bg-emerald-500/10 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                🎟️ Manage Gate
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex-1 md:flex-none px-8 py-3 bg-primary text-black font-black rounded-xl hover:scale-105 transition-all text-[10px] uppercase tracking-widest"
              >
                + Register Participant
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="pb-4 pl-4">Name & Contact</th>
                  <th className="pb-4">Strategic Role</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Check-In</th>
                  <th className="pb-4 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {participants.length > 0 ? (
                  participants.map((person) => (
                    <tr key={person._id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-5 pl-4">
                        <div className="font-bold text-white">{person.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{person.email}</div>
                      </td>
                      <td className="py-5">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{person.role}</span>
                      </td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${person.status === "Confirmed"
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                          }`}>
                          {person.status}
                        </span>
                      </td>
                      <td className="py-5">
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-bold ${person.checkInStatus === 'Checked In' ? 'text-emerald-400' : 'text-gray-600'}`}>
                            {person.checkInStatus || 'Not Checked In'}
                          </span>
                          <span className="text-[8px] font-mono text-gray-500 mt-1">{person.ticketId || 'NO_TICKET_ID'}</span>
                        </div>
                      </td>
                      <td className="py-5 text-right pr-4 flex items-center justify-end gap-4">
                        <button
                          onClick={() => navigate(`/ticket/${person.ticketId}`)}
                          className="text-[10px] font-black text-primary/50 hover:text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={!person.ticketId}
                        >
                          View Ticket
                        </button>
                        <button
                          onClick={() => handleDeleteParticipant(person._id)}
                          className="text-[10px] font-black text-red-500/50 hover:text-red-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <div className="text-gray-600 font-mono text-sm tracking-widest">NO_PARTICIPANTS_DEPLOYED</div>
                      <p className="text-xs text-gray-700 mt-2">Import CSV or register manually to begin tracking.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 rounded-[2rem] border-white/10 bg-zinc-900 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter">New Personnel Data</h3>
            <form onSubmit={handleAddGuest} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-colors outline-none"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-colors outline-none"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Strategic Role</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary transition-colors outline-none cursor-pointer"
                  value={newGuest.role}
                  onChange={(e) => setNewGuest({ ...newGuest, role: e.target.value })}
                >
                  <option className="bg-zinc-900" value="Attendee">Attendee</option>
                  <option className="bg-zinc-900" value="Speaker">Speaker</option>
                  <option className="bg-zinc-900" value="VIP">VIP</option>
                  <option className="bg-zinc-900" value="Staff">Staff</option>
                  {event && getSuggestedRoles(event.category).map((role, i) => (
                    <option key={i} className="bg-zinc-900" value={role}>{role}</option>
                  ))}
                </select>
                {event && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getSuggestedRoles(event.category).map((role, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewGuest({ ...newGuest, role })}
                        className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[8px] font-black text-gray-500 uppercase tracking-widest hover:border-primary/50 transition-all"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-primary text-black font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                >
                  Commit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Participants;
