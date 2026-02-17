import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function RsvpPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                // Public endpoint for event details might be needed, but we can try the general one if it's not protected
                // Actually, most systems have a public 'view event' endpoint. 
                // Let's assume there's one or we'll bypass it with simple info.
                const res = await fetch(`http://127.0.0.1:5000/api/events/public/${eventId}`);
                const data = await res.json();
                if (res.ok) setEvent(data);
            } catch (error) {
                console.error("Failed to fetch event", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/participants/rsvp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, event: eventId })
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const err = await res.json();
                alert(err.message || "RSVP failed. Please try again.");
            }
        } catch (error) {
            console.error("RSVP error", error);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Authenticating event...</div>;

    if (!event) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Event not found or invalid link.</div>;

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
                <div className="glass-card p-12 rounded-[3rem] text-center max-w-lg border-green-500/20 bg-green-500/5">
                    <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce">✓</div>
                    <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Registration Confirmed</h2>
                    <p className="text-gray-400 font-medium">Your presence has been recorded in the event manifest. We look forward to seeing you at {event.name}.</p>
                    <button onClick={() => navigate("/")} className="mt-10 text-xs font-black uppercase tracking-widest text-primary hover:underline">Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
            <div className="max-w-xl w-full">
                <div className="text-center mb-12">
                    <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">Official Invitation</div>
                    <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none">{event.name}</h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">{new Date(event.startDate).toLocaleDateString()} • {event.venue}</p>
                </div>

                <div className="glass-card p-10 rounded-[2.5rem] border-white/10 bg-white/5 backdrop-blur-3xl">
                    <h3 className="text-xl font-bold mb-8 text-center text-white/90">RSVP Confirmation</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                required
                                placeholder="Enter your full name"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-primary transition-all outline-none"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                            <input
                                required
                                type="email"
                                placeholder="Enter your email for confirmation"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-primary transition-all outline-none"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-5 bg-primary text-black font-black rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all text-xs uppercase tracking-[0.2em] mt-8"
                        >
                            Confirm Attendance
                        </button>
                    </form>
                </div>

                <p className="text-center mt-12 text-[8px] text-gray-600 font-mono uppercase tracking-[0.5em]">Powered by Smart Event Operations Hub</p>
            </div>
        </div>
    );
}

export default RsvpPage;
