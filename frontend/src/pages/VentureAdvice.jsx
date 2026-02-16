import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VentureAdvice = () => {
    const navigate = useNavigate();
    const [eventData, setEventData] = useState({
        type: 'corporate',
        budget: 'medium',
        scale: 'regional'
    });

    const getAdvice = () => {
        const adviceMap = {
            corporate: {
                high: "Focus on multi-track streaming capabilities and VIP networking lounges with dedicated concierge services.",
                medium: "Prioritize seamless registration workflows and high-quality audiovisual equipment for presentations.",
                low: "Utilize digital-only programs and focus on interactive Q&A sessions to maximize engagement without physical costs."
            },
            social: {
                high: "Explore immersive themed environments and personalized guest experiences with high-end catering.",
                medium: "Focus on atmospheric lighting and curated music playlists to create a cohesive event vibe.",
                low: "Leverage DIY decor options and community-focused activities to build meaningful connections."
            },
            creative: {
                high: "Invest in large-scale interactive installations and high-fidelity sound systems for an impactful experience.",
                medium: "Collaborate with local artists for unique decor and focus on social media-friendly 'Instagrammable' spots.",
                low: "Host pop-up style events in unconventional spaces to build a sense of exclusivity and authenticity."
            }
        };

        return adviceMap[eventData.type][eventData.budget] || "Select your event parameters to receive tailored advice.";
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="mb-12">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition-colors">
                        <span>←</span> Back to Dashboard
                    </button>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
                        VENTURE <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ADVISOR</span>
                    </h1>
                    <p className="text-gray-400 text-lg">AI-powered tactical intelligence for your next big event.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Input Controls */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="glass-card p-6 rounded-3xl border-white/10 bg-white/5 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-primary uppercase tracking-widest block mb-2">Event Type</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                    value={eventData.type}
                                    onChange={(e) => setEventData({ ...eventData, type: e.target.value })}
                                >
                                    <option value="corporate">Corporate & Tech</option>
                                    <option value="social">Social & Celebrations</option>
                                    <option value="creative">Creative & Arts</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-primary uppercase tracking-widest block mb-2">Budget Level</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                    value={eventData.budget}
                                    onChange={(e) => setEventData({ ...eventData, budget: e.target.value })}
                                >
                                    <option value="high">Premium / High</option>
                                    <option value="medium">Standard / Medium</option>
                                    <option value="low">Budget / Lean</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Advice Display */}
                    <div className="md:col-span-2">
                        <div className="glass-card p-10 rounded-[2.5rem] border-primary/20 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-3xl h-full flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-8xl">💡</span>
                            </div>
                            <h2 className="text-xs font-bold text-accent uppercase tracking-[0.3em] mb-4">Tactical Recommendation</h2>
                            <p className="text-2xl md:text-3xl font-medium leading-tight text-white/90">
                                "{getAdvice()}"
                            </p>
                            <div className="mt-8 flex gap-3">
                                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400">ANALYSIS: OPTIMAL</div>
                                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400">ROI: HIGH</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-8 rounded-3xl border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <span>📈</span> Market Trends
                        </h3>
                        <p className="text-gray-400 text-sm">Interactive hybrid events are seeing a 40% increase in retention this quarter. Consider adding a virtual component.</p>
                    </div>
                    <div className="glass-card p-8 rounded-3xl border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <span>🛡️</span> Risk Assessment
                        </h3>
                        <p className="text-gray-400 text-sm">Current logistics for {eventData.type} ventures suggest a 15% buffer in vendor scheduling for peak efficiency.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VentureAdvice;
