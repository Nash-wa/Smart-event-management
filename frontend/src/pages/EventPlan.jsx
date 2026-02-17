import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/eventplan.css";

function EventPlan() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5000/api/events/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setEvent(data);
                } else {
                    console.error("Event not found");
                }
            } catch (err) {
                console.error("Failed to fetch event", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white">
                <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
                <button onClick={() => navigate("/dashboard")} className="px-6 py-2 bg-accent rounded-lg">Back to Dashboard</button>
            </div>
        );
    }

    const { plan } = event;

    return (
        <div className="event-plan-page min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-8">
                    <div>
                        <span className="text-accent font-mono uppercase tracking-widest text-sm mb-2 block">Ultimate Event Plan ✨</span>
                        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                            {event.name}
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl">{event.description}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{new Date(event.startDate).toLocaleDateString()}</p>
                        <p className="text-gray-500">{event.venue || "TBD"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Plan Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Timeline Section */}
                        <section className="glass-card p-8 rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                                <span className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-sm">📅</span>
                                Planning Timeline
                            </h2>
                            <div className="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                                {plan.timeline.map((step, index) => (
                                    <div key={index} className="relative pl-10">
                                        <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-black z-10 flex items-center justify-center ${step.status === 'Completed' ? 'bg-green-500' : 'bg-gray-700'}`}>
                                            {step.status === 'Completed' && <span className="text-white text-xs">✓</span>}
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className="font-bold text-lg">{step.task}</h3>
                                                <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">{step.date}</span>
                                            </div>
                                            <p className="text-gray-400 text-sm">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* AI Suggestions */}
                        <section className="glass-card p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-400">
                                <span className="animate-pulse">🤖</span> Smart Recommendations
                            </h2>
                            <div className="space-y-4">
                                {plan.aiSuggestions.map((suggestion, index) => (
                                    <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default">
                                        <p className="text-gray-300">"{suggestion}"</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">

                        {/* Budget Breakdown */}
                        <section className="glass-card p-6 rounded-3xl border border-white/10 bg-white/5">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-green-400">💰</span> Budget Allocation
                            </h2>
                            <div className="space-y-6">
                                {plan.budgetBreakdown.map((item, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400">{item.category}</span>
                                            <span className="font-mono">₹{item.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-accent h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${item.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <p className="text-center text-gray-500 text-sm">Estimated Total</p>
                                <p className="text-center text-3xl font-extrabold text-white">₹{event.budget.toLocaleString()}</p>
                            </div>
                        </section>

                        {/* Checklist */}
                        <section className="glass-card p-6 rounded-3xl border border-white/10 bg-white/5">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-yellow-400">✅</span> Action Checklist
                            </h2>
                            <div className="space-y-4">
                                {plan.checklist.map((task, index) => (
                                    <label key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                                        <input type="checkbox" className="w-5 h-5 rounded border-white/20 bg-transparent text-accent focus:ring-accent" />
                                        <span className="text-gray-300 text-sm">{task.item}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>

                <div className="mt-12 flex justify-center gap-4">
                    <button onClick={() => navigate("/dashboard")} className="px-8 py-4 border border-white/10 rounded-2xl hover:bg-white/5 transition-all">Go to Dashboard</button>
                    <button onClick={() => window.print()} className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center gap-2">
                        Download PDF Plan 📥
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EventPlan;
