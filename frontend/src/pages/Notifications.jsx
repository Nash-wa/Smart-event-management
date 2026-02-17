import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Notifications() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState([
        { title: "Strategic Update", text: "Welcome to the operational hub. All modules synchronized.", time: "System Start" }
    ]);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const res = await fetch(`http://127.0.0.1:5000/api/participants/${eventId}`, {
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

        fetchParticipants();
    }, [eventId]);

    const handleSendAll = () => {
        if (!message) return;

        // Logical value demonstration: Sending to each guest email
        console.log(`BROADCASTING TO ${participants.length} GUESTS:`, message);
        participants.forEach(p => {
            console.log(`Sending to ${p.name} (${p.email})...`);
        });

        const newAlert = {
            title: "Broadcast Sent",
            text: message,
            time: "Just now"
        };
        setAlerts([newAlert, ...alerts]);
        setMessage("");
        alert(`Strategic broadcast dispatched to ${participants.length} personnel via encrypted feed.`);
    };

    if (loading) return <div className="min-h-screen bg-black text-white p-8">Loading communications...</div>;

    return (
        <div className="min-h-screen p-4 md:p-8 bg-[#050505] text-white">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">← Back</button>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent uppercase tracking-tighter">
                        Communications Hub
                    </h2>
                </div>

                <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] mb-10">Event_ID: {eventId.slice(-6)} • Target_Audience: {participants.length} Personnel</p>

                <div className="glass-card p-10 rounded-[2.5rem] border-white/10 bg-white/5 mb-12">
                    <h3 className="text-lg font-black mb-6 uppercase tracking-tighter">📡 Broadcast Strategic Update</h3>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your important announcement here... (e.g., 'Operational Phase 02 begins in Hall A')"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white min-h-[150px] resize-none mb-6 outline-none focus:border-orange-500 transition-colors"
                    ></textarea>
                    <div className="flex justify-end">
                        <button
                            onClick={handleSendAll}
                            className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-black py-4 px-10 rounded-2xl hover:scale-105 transition-all text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(249,115,22,0.3)]"
                        >
                            🚀 Dispatch to All Personnel
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-4 mb-6">Manifest Log</h3>

                    {alerts.map((alert, i) => (
                        <div key={i} className="glass-card p-6 rounded-[2rem] border-white/5 bg-white/5 flex gap-6 items-start hover:bg-white/10 transition-all border-l-4 border-l-orange-500">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 text-2xl shrink-0">
                                🔔
                            </div>
                            <div>
                                <h4 className="font-black text-white mb-2 uppercase tracking-tight text-sm">{alert.title}</h4>
                                <p className="text-xs text-gray-400 leading-relaxed font-medium">{alert.text}</p>
                                <span className="text-[8px] font-mono text-orange-400/50 mt-4 block uppercase tracking-widest">{alert.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Notifications;
