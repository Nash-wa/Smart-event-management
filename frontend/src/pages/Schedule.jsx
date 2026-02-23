import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Schedule() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newScheduleItem, setNewScheduleItem] = useState({ time: '', title: '', icon: '📅' });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (!eventId) {
            setLoading(false);
            return;
        }

        const fetchEventData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
                    headers: {
                        'Authorization': `Bearer ${userInfo?.token}`
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    setEvent(data);
                }
            } catch (error) {
                console.error("Failed to fetch event schedule", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEventData();
    }, [eventId]);

    const saveSchedule = async (updatedSchedule) => {
        const updatedEvent = { ...event, schedule: updatedSchedule };

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo?.token}`
                },
                body: JSON.stringify(updatedEvent)
            });
            if (res.ok) {
                setEvent(updatedEvent);
            }
        } catch (error) {
            console.error("Failed to save schedule", error);
        }
    };

    const addScheduleItem = () => {
        if (!newScheduleItem.time || !newScheduleItem.title) return;
        const updatedSchedule = [...(event.schedule || []), newScheduleItem];
        saveSchedule(updatedSchedule);
        setNewScheduleItem({ time: '', title: '', icon: '📅' });
        setShowForm(false);
    };

    const deleteScheduleItem = (index) => {
        const updatedSchedule = event.schedule.filter((_, i) => i !== index);
        saveSchedule(updatedSchedule);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!eventId || !event) {
        return (
            <div className="min-h-screen p-8 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-4">No Event Selected</h2>
                <button onClick={() => navigate("/my-events")} className="gradient-button px-6 py-2">
                    Go to My Events
                </button>
            </div>
        );
    }

    const schedule = event.schedule || [];

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                            Event Schedule
                        </h2>
                        <p className="text-muted-foreground">Manage the timeline for <span className="text-white font-bold">{event.name}</span></p>
                    </div>
                    <button onClick={() => navigate(`/event-plan/${eventId}`)} className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs">
                        Back to Plan
                    </button>
                </div>

                <div className="glass-card p-6 md:p-8 rounded-3xl relative">
                    <div className="absolute left-8 top-8 bottom-24 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent"></div>

                    <div className="space-y-8 mb-12">
                        {schedule.map((item, index) => (
                            <div key={index} className="relative pl-12 group transition-transform cursor-default">
                                <div className="absolute left-0 top-0 w-8 h-8 -ml-4 rounded-full bg-blue-500/10 border border-blue-500/50 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    {index + 1}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                        <span className="text-sm font-mono text-blue-400 whitespace-nowrap px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 inline-block w-fit">
                                            {item.time}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{item.icon}</span>
                                            <h3 className="text-lg font-medium text-white group-hover:text-blue-200 transition-colors uppercase tracking-tight">{item.title}</h3>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteScheduleItem(index)}
                                        className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                        {schedule.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground italic">
                                No items in the schedule yet.
                            </div>
                        )}
                    </div>

                    {showForm ? (
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Time</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 09:00 AM"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                                        value={newScheduleItem.time}
                                        onChange={(e) => setNewScheduleItem({ ...newScheduleItem, time: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Icon (Emoji)</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 🎤"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                                        value={newScheduleItem.icon}
                                        onChange={(e) => setNewScheduleItem({ ...newScheduleItem, icon: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Activity Title</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Keynote Presentation"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                                    value={newScheduleItem.title}
                                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, title: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={addScheduleItem}
                                    className="flex-1 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all"
                                >
                                    Add to Schedule
                                </button>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                            <button
                                onClick={() => setShowForm(true)}
                                className="gradient-button text-sm py-2 px-6"
                            >
                                ➕ Add Schedule Item
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Schedule;

