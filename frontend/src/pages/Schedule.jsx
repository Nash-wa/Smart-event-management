import { useState } from "react";

function Schedule() {
    const [isEditing, setIsEditing] = useState(false);
    const [events, setEvents] = useState([
        { time: "09:00 AM", title: "Registrations & Breakfast", icon: "🥐" },
        { time: "10:00 AM", title: "Opening Ceremony", icon: "🎤" },
        { time: "11:00 AM", title: "Strategic Planning Workshop", icon: "📊" },
        { time: "01:00 PM", title: "Networking & Lunch", icon: "🥗" },
        { time: "02:30 PM", title: "Operations Control Systems", icon: "💻" },
    ]);

    const handleEditChange = (index, field, value) => {
        const newEvents = [...events];
        newEvents[index][field] = value;
        setEvents(newEvents);
    };

    const handleAddEvent = () => {
        setEvents([...events, { time: "00:00 AM", title: "New Event", icon: "✨" }]);
    };

    const handleRemoveEvent = (index) => {
        setEvents(events.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    Event Schedule
                </h2>
                <p className="text-muted-foreground mb-8">Plan your event timeline.</p>

                <div className="glass-card p-6 md:p-8 rounded-3xl relative">
                    <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent"></div>

                    <div className="space-y-8">
                        {events.map((event, index) => (
                            <div key={index} className="relative pl-12 group transition-transform cursor-default">
                                <div className="absolute left-0 top-0 w-8 h-8 -ml-4 rounded-full bg-blue-500/10 border border-blue-500/50 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    {index + 1}
                                </div>

                                {isEditing ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-white/5 p-3 rounded-xl border border-white/10">
                                        <input
                                            type="text"
                                            value={event.time}
                                            onChange={(e) => handleEditChange(index, "time", e.target.value)}
                                            className="text-sm font-mono text-blue-400 px-3 py-1 rounded bg-black/50 border border-blue-500/30 focus:outline-none focus:border-blue-400 w-28"
                                            placeholder="HH:MM AM/PM"
                                        />
                                        <input
                                            type="text"
                                            value={event.icon}
                                            onChange={(e) => handleEditChange(index, "icon", e.target.value)}
                                            className="text-2xl w-12 text-center bg-black/50 border border-white/10 rounded focus:outline-none focus:border-blue-400 p-1"
                                            placeholder="Icon"
                                        />
                                        <input
                                            type="text"
                                            value={event.title}
                                            onChange={(e) => handleEditChange(index, "title", e.target.value)}
                                            className="flex-1 text-lg font-medium text-white bg-black/50 border border-white/10 rounded focus:outline-none focus:border-blue-400 p-2"
                                            placeholder="Event Title"
                                        />
                                        <button
                                            onClick={() => handleRemoveEvent(index)}
                                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors ml-auto"
                                            title="Remove item"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 group-hover:translate-x-1 transition-transform">
                                        <span className="text-sm font-mono text-blue-400 whitespace-nowrap px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 inline-block w-fit">
                                            {event.time}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{event.icon}</span>
                                            <h3 className="text-lg font-medium text-white group-hover:text-blue-200 transition-colors">{event.title}</h3>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {isEditing && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={handleAddEvent}
                                className="text-sm py-2 px-4 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/50 transition-colors flex items-center gap-2"
                            >
                                <span>➕</span> Add Schedule Item
                            </button>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 flex gap-4 justify-end">
                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-sm py-2 px-6 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="gradient-button text-sm py-2 px-6"
                        >
                            {isEditing ? "💾 Save Schedule" : "✏️ Edit Schedule"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Schedule;
