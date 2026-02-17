import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    calculateTimeline,
    calculateBudgetAllocation,
    estimateResources,
    calculateReadinessScore
} from "../utils/planningEngine";
import "../css/eventplan.css";

function EventPlan() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [participants, setParticipants] = useState([]);
    const [planningData, setPlanningData] = useState(null);
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

                    // Fetch actual participants
                    const pRes = await fetch(`http://127.0.0.1:5000/api/participants/${id}`, {
                        headers: { Authorization: `Bearer ${userInfo?.token}` }
                    });
                    if (pRes.ok) {
                        const pData = await pRes.json();
                        setParticipants(pData);
                    }

                    if (data.plan && data.plan.timeline) {
                        // Use existing persistent plan
                        setPlanningData(data.plan);
                    } else {
                        // Initialize new plan if not exists
                        const timeline = calculateTimeline(data.startDate, data.category);
                        const budget = calculateBudgetAllocation(data.budget, data.category);
                        const resources = estimateResources(data.capacity || 100, data.venueType || 'Indoor');

                        const newPlan = {
                            timeline,
                            budget,
                            resources,
                            readinessScore: calculateReadinessScore(timeline)
                        };

                        setPlanningData(newPlan);

                        // Persist the initialized plan to backend
                        await fetch(`http://127.0.0.1:5000/api/events/${id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${userInfo?.token}`
                            },
                            body: JSON.stringify({ plan: newPlan })
                        });
                    }

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

    const handleTaskStatusChange = async (taskId, newStatus) => {
        const updatedTimeline = planningData.timeline.map(t =>
            t.task === taskId ? { ...t, status: newStatus } : t
        );

        const updatedPlan = {
            ...planningData,
            timeline: updatedTimeline,
            readinessScore: calculateReadinessScore(updatedTimeline)
        };

        setPlanningData(updatedPlan);

        // Persist update to backend
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            await fetch(`http://127.0.0.1:5000/api/events/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo?.token}`
                },
                body: JSON.stringify({ plan: updatedPlan })
            });
        } catch (error) {
            console.error("Failed to sync plan update", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
            </div>
        );
    }

    if (!event || !planningData) {
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

    return (
        <div className="event-plan-page min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* HEADER / OPERATIONS SUMMARY */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 border-b border-white/5 pb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                                Operational Dashboard
                            </span>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                ID: {id.slice(-6)}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter">
                            {event.name}
                        </h1>

                        <div className="flex flex-wrap gap-6 text-gray-400">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                <span className="text-sm font-medium">{event.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span className="text-sm font-medium">{new Date(event.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                <span className="text-sm font-medium">{event.venue || "Global Location"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Readiness</p>
                            <p className="text-3xl font-black text-white">{planningData.readinessScore}%</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Confirmed Guests</p>
                            <p className="text-3xl font-black text-white">{participants.filter(p => p.status === 'Confirmed').length} / {event.capacity || 0}</p>
                        </div>
                    </div>
                </div>

                {/* OPERATIONS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* MAIN COLUMN: TIMELINE & STAFFING */}
                    <div className="lg:col-span-3 space-y-8">

                        {/* OPERATIONAL STRATEGY SUMMARY */}
                        <section className="glass-card p-10 rounded-[3rem] border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <span className="text-9xl font-black italic">STRATEGY</span>
                            </div>
                            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6">Execution Strategy</h2>
                            <p className="text-2xl md:text-3xl font-bold leading-tight text-white/90 max-w-3xl">
                                System-generated roadmap for {event.name}.
                                Prioritizing <span className="text-accent">{event.category}</span> optimization with a focus on
                                attendee experience and operational efficiency.
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* TIMELINE */}
                            <section className="glass-card p-8 rounded-[2.5rem] border-white/10 bg-white/5">
                                <h2 className="text-xl font-black mb-8 flex items-center justify-between">
                                    <span>🗓️ Milestone Timeline</span>
                                    <span className="text-[10px] font-mono text-gray-500">REAL-TIME SYNC</span>
                                </h2>
                                <div className="space-y-6">
                                    {planningData.timeline.map((item, index) => (
                                        <div key={index} className="flex gap-4 relative">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-4 h-4 rounded-full border-2 border-[#050505] z-10 ${item.status === 'Completed' ? 'bg-accent shadow-[0_0_10px_#10b981]' : 'bg-primary shadow-[0_0_10px_#3b82f6]'
                                                    }`} />
                                                {index !== planningData.timeline.length - 1 && (
                                                    <div className={`w-[2px] h-full absolute top-2 left-[7px] ${item.status === 'Completed' ? 'bg-accent/40' : 'bg-white/10'
                                                        }`} />
                                                )}
                                            </div>
                                            <div className="pb-8 flex-1">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <h3 className={`font-bold text-sm ${item.status === 'Completed' ? 'text-accent' : 'text-white'}`}>{item.task}</h3>
                                                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-mono tracking-widest">{item.deadline}</p>
                                                    </div>
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${item.priority === 'High' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-white/10 text-gray-500'
                                                        }`}>
                                                        {item.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* RESOURCES & STAFFING */}
                            <section className="glass-card p-8 rounded-[2.5rem] border-white/10 bg-white/5">
                                <h2 className="text-xl font-black mb-8 flex items-center justify-between">
                                    <span>👥 Resource Estimation</span>
                                    <span className="text-[10px] font-mono text-gray-500">CALCULATED DATA</span>
                                </h2>
                                <div className="space-y-4">
                                    {planningData.resources.map((res, i) => (
                                        <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{res.resource}</p>
                                                <p className="text-2xl font-black text-white">{res.quantity} <span className="text-[10px] font-medium text-gray-500">{res.unit}</span></p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                📋
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 p-6 rounded-2xl bg-primary/10 border border-primary/20">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Notice</p>
                                    <p className="text-xs text-primary/80 leading-relaxed font-medium">
                                        Resources estimated based on a {event.capacity}-attendee {event.category.toLowerCase()} venture model. Adjustments may be required for complex technical dependencies.
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* SIDE COLUMN: BUDGET & CHECKLIST */}
                    <div className="space-y-8">

                        {/* BUDGET ALLOCATION */}
                        <section className="glass-card p-8 rounded-[2.5rem] border-white/10 bg-white/5">
                            <h2 className="text-lg font-black mb-6">💰 Capital Allocation</h2>
                            <div className="space-y-6">
                                {planningData.budget.map((item, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                            <span>{item.category}</span>
                                            <span className="text-white">₹{item.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Ops Budget</span>
                                        <span className="text-xl font-black text-accent">₹{event.budget?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ACTION CHECKLIST */}
                        <section className="glass-card p-8 rounded-[2.5rem] border-white/10 bg-white/5">
                            <h2 className="text-lg font-black mb-6">✅ Action Tracker</h2>
                            <div className="space-y-3">
                                {planningData.timeline.map((task, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleTaskStatusChange(task.task, task.status === 'Completed' ? 'Pending' : 'Completed')}
                                        className={`group cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${task.status === 'Completed'
                                            ? 'bg-accent/10 border-accent/20'
                                            : 'bg-white/5 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <span className={`text-xs font-bold ${task.status === 'Completed' ? 'text-accent line-through opacity-70' : 'text-white'}`}>
                                            {task.task}
                                        </span>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'Completed' ? 'bg-accent border-accent' : 'border-white/20'
                                            }`}>
                                            {task.status === 'Completed' && <span className="text-black text-[10px] font-black">✓</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>

                {/* OPERATIONS CONTROL PANEL */}
                <div className="mt-16 flex flex-wrap justify-center gap-4 border-t border-white/5 pt-12">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-8 py-4 border border-white/10 rounded-2xl hover:bg-white/5 text-sm font-bold tracking-widest uppercase transition-all"
                    >
                        Operations Center
                    </button>

                    <button
                        onClick={() => navigate(`/notifications/${id}`)}
                        className="px-8 py-4 border border-white/10 rounded-2xl hover:bg-white/5 text-sm font-bold tracking-widest uppercase transition-all"
                    >
                        Communications 📡
                    </button>

                    <button
                        onClick={() => navigate(`/participants/${id}`)}
                        className="px-8 py-4 border border-white/10 rounded-2xl hover:bg-white/5 text-sm font-bold tracking-widest uppercase transition-all"
                    >
                        Guest List 👥
                    </button>

                    <button
                        onClick={() => navigate("/ar-navigation", { state: { venue: event.venue } })}
                        className="px-10 py-5 bg-primary text-black font-black rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:scale-105 transition-all flex items-center gap-3 uppercase tracking-tighter"
                    >
                        <span>🧭</span> Launch AR HUD
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="px-8 py-4 bg-white text-black font-black rounded-2xl text-sm tracking-widest uppercase transition-all active:scale-95"
                    >
                        Export Manifest 📥
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .event-plan-page { background: white !important; color: black !important; padding: 0 !important; }
                    .glass-card { background: white !important; border: 1px solid #eee !important; box-shadow: none !important; }
                    button { display: none !important; }
                    .text-white { color: black !important; }
                    .text-gray-400, .text-gray-500 { color: #666 !important; }
                    .bg-primary, .bg-accent { color: black !important; }
                    .border-white\\/10 { border-color: #eee !important; }
                }
            `}} />
        </div>
    );
}

export default EventPlan;
