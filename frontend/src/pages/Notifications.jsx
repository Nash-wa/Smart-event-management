function Notifications() {
    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    Notifications
                </h2>
                <p className="text-muted-foreground mb-8">Send updates to your guests.</p>

                <div className="glass-card p-6 rounded-3xl mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-white">📡 Broadcast Message</h3>
                    <textarea
                        placeholder="Type your important announcement here... (e.g., 'Lunch is served at the main hall!')"
                        className="glass-input w-full min-h-[120px] resize-none mb-4"
                    ></textarea>
                    <div className="flex justify-end">
                        <button className="gradient-button flex items-center gap-2 py-2 px-6">
                            <span>🚀</span> Send to All
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider ml-2">Recent Alerts</h3>

                    {[1, 2].map((_, i) => (
                        <div key={i} className="glass-card p-4 rounded-2xl flex gap-4 items-start hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 text-xl shrink-0">
                                🔔
                            </div>
                            <div>
                                <h4 className="font-medium text-white mb-1">Speaker Change</h4>
                                <p className="text-sm text-muted-foreground">The 2:00 PM session will now be held in Hall B due to technical issues.</p>
                                <span className="text-xs text-orange-400/70 mt-2 block">10 mins ago</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Notifications;
