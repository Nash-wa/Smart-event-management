function Schedule() {
    const events = [
        { time: "09:00 AM", title: "Registrations & Breakfast", icon: "🥐" },
        { time: "10:00 AM", title: "Opening Ceremony", icon: "🎤" },
        { time: "11:00 AM", title: "Strategic Planning Workshop", icon: "📊" },
        { time: "01:00 PM", title: "Networking & Lunch", icon: "🥗" },
        { time: "02:30 PM", title: "Operations Control Systems", icon: "💻" },
    ];

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
                            <div key={index} className="relative pl-12 group hover:translate-x-1 transition-transform cursor-default">
                                <div className="absolute left-0 top-0 w-8 h-8 -ml-4 rounded-full bg-blue-500/10 border border-blue-500/50 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    {index + 1}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                    <span className="text-sm font-mono text-blue-400 whitespace-nowrap px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 inline-block w-fit">
                                        {event.time}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{event.icon}</span>
                                        <h3 className="text-lg font-medium text-white group-hover:text-blue-200 transition-colors">{event.title}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                        <button className="gradient-button text-sm py-2 px-6">
                            ✏️ Edit Schedule
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Schedule;
