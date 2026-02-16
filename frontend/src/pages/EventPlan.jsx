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
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));

                const res = await fetch(
                    `http://127.0.0.1:5000/api/events/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${userInfo?.token}`
                        }
                    }
                );

                const data = await res.json();

                if (res.ok) {
                    setEvent(data);
                } else {
                    console.error("Event not found");
                }
            } catch (error) {
                console.error("Failed to fetch event", error);
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
                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-6 py-2 bg-accent rounded-lg"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const { plan } = event;

    return (
        <div className="event-plan-page min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-8">
                    <div>
                        <span className="text-accent font-mono uppercase tracking-widest text-sm mb-2 block">
                            Ultimate Event Plan ✨
                        </span>

                        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                            {event.name}
                        </h1>

                        <p className="text-gray-400 text-lg max-w-2xl">
                            {event.description}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-2xl font-bold">
                            {new Date(event.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500">{event.venue || "TBD"}</p>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* VENTURE STRATEGY ADVICE */}
                        <section className="glass-card p-10 rounded-[2.5rem] border-primary/20 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-8xl">💡</span>
                            </div>
                            <h2 className="text-xs font-bold text-accent uppercase tracking-[0.3em] mb-4">Venture Strategy Advisor</h2>
                            <p className="text-2xl md:text-3xl font-medium leading-tight text-white/90">
                                {(() => {
                                    const cat = event.category?.toLowerCase() || "";
                                    const budget = Number(event.budget) || 0;
                                    const level = budget > 100000 ? 'high' : budget > 50000 ? 'medium' : 'low';

                                    const advice = {
                                        corporate: {
                                            high: "Focus on multi-track streaming capabilities and VIP networking lounges.",
                                            medium: "Prioritize seamless registration workflows and high-quality AV equipment.",
                                            low: "Utilize digital programs and focus on interactive Q&A sessions."
                                        },
                                        wedding: {
                                            high: "Explore immersive themed environments and personalized guest experiences.",
                                            medium: "Focus on atmospheric lighting and curated music for a cohesive vibe.",
                                            low: "Leverage unique local decor and community-focused dining."
                                        },
                                        conference: {
                                            high: "Implement AI matching for attendees and high-end interactive exhibition zones.",
                                            medium: "Ensure robust WiFi infrastructure and centralized networking hubs.",
                                            low: "Focus on high-quality speaker content and digital-first networking."
                                        }
                                    };

                                    // Default fallback
                                    const type = cat.includes('wedding') ? 'wedding' : cat.includes('corporate') ? 'corporate' : 'conference';
                                    return advice[type]?.[level] || "Focus on attendee engagement and clear communication of event goals.";
                                })()}
                            </p>
                            <div className="mt-8 flex gap-3">
                                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400">ANALYSIS: OPTIMAL</div>
                                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400">ROI: HIGH</div>
                            </div>
                        </section>

                        {/* TIMELINE */}
                        <section className="glass-card p-8 rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-8">📅 Planning Timeline</h2>
                            <div className="space-y-8">
                                {plan.timeline.map((step, index) => (
                                    <div key={index} className="relative pl-8 border-l border-white/10">
                                        <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                        <h3 className="font-bold text-lg">{step.task}</h3>
                                        <p className="text-gray-400 text-sm mt-1">{step.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* AI SUGGESTIONS */}
                        <section className="glass-card p-8 rounded-3xl border border-white/10 bg-white/5">
                            <h2 className="text-2xl font-bold mb-6">🤖 Smart Recommendations</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plan.aiSuggestions.map((s, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-gray-300">
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-8">

                        {/* BUDGET */}
                        <section className="glass-card p-6 rounded-3xl border border-white/10 bg-white/5">
                            <h2 className="text-xl font-bold mb-4">💰 Budget Allocation</h2>

                            {plan.budgetBreakdown.map((item, index) => (
                                <div key={index} className="mb-3">
                                    <div className="flex justify-between">
                                        <span>{item.category}</span>
                                        <span>₹{item.amount}</span>
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* CHECKLIST */}
                        <section className="glass-card p-6 rounded-3xl border border-white/10 bg-white/5">
                            <h2 className="text-xl font-bold mb-4">✅ Action Checklist</h2>

                            {plan.checklist.map((task, index) => (
                                <div key={index}>{task.item}</div>
                            ))}
                        </section>

                    </div>
                </div>

                {/* BUTTONS SECTION */}
                <div className="mt-12 flex justify-center gap-4">

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-8 py-4 border border-white/10 rounded-2xl hover:bg-white/5"
                    >
                        Go to Dashboard
                    </button>

                    {/* ✅ NEW AR BUTTON */}
                    <button
                        onClick={() => navigate("/ar-navigation")}
                        className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-glow hover:scale-105 transition-all"
                    >
                        Launch AR HUD 🧭
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="px-8 py-4 bg-white text-black font-bold rounded-2xl"
                    >
                        Download PDF Plan 📥
                    </button>

                </div>
            </div>
        </div>
    );
}

export default EventPlan;
