import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const IndoorNavigation = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/events/public/${eventId}`);
                const data = await res.json();
                if (res.ok) {
                    setEvent(data);
                }
            } catch (error) {
                console.error("Failed to fetch event for Navigation", error);
            } finally {
                setLoading(false);
            }
        };
        if (eventId) fetchEvent();
    }, [eventId]);

    const steps = event?.arPoints || [];

    const handleNext = () => {
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!event || steps.length === 0) {
        return (
            <div className="min-h-screen bg-[#020202] p-6 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <span className="text-3xl text-red-500">📍</span>
                </div>
                <h2 className="text-2xl font-black text-white uppercase mb-4">Navigation Unavailable</h2>
                <p className="text-zinc-500 max-w-md mb-8">No navigation nodes have been configured for this venue. Please contact the event organizer.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-8 py-3 bg-white text-black font-black rounded-xl uppercase hover:bg-primary hover:text-white transition-all"
                >
                    Return
                </button>
            </div>
        );
    }

    const currentPoint = steps[currentStep];

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans overflow-hidden">
            <div className="max-w-4xl mx-auto h-full flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div onClick={() => navigate(-1)} className="cursor-pointer group flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
                            <span>←</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tight">{event.name}</h1>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Indoor Navigation</p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-mono">
                        STEP {currentStep + 1} / {steps.length}
                    </div>
                </div>

                {/* Main Navigation Card */}
                <div className="flex-1 glass-card rounded-[3rem] border-white/10 bg-white/5 overflow-hidden flex flex-col">

                    {/* Visual Reference / Fallback */}
                    <div className="relative aspect-video bg-zinc-900 flex flex-col items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                            backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }} />

                        <div className="z-10 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-primary/40 flex items-center justify-center text-4xl mb-4 animate-bounce">
                                {currentPoint.pointType === 'Entrance' ? '🚪' :
                                    currentPoint.pointType === 'Stage' ? '🎭' :
                                        currentPoint.pointType === 'Restroom' ? '🚻' :
                                            currentPoint.pointType === 'Exit' ? '🏃' :
                                                currentPoint.pointType === 'HelpDesk' ? 'ℹ️' : '📍'}
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-center px-6">
                                {currentPoint.label}
                            </h2>
                            <p className="text-xs font-mono text-gray-500 mt-2 uppercase">Node Coordinates: Locked</p>
                        </div>

                        {/* Direction Arrow */}
                        {currentStep < steps.length - 1 && (
                            <div className="absolute bottom-8 right-8 animate-pulse text-white/40">
                                <span className="text-6xl">→</span>
                            </div>
                        )}
                    </div>

                    {/* Instruction Panel */}
                    <div className="p-10 flex-1 flex flex-col justify-between">
                        <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Instruction</span>
                            <p className="text-2xl font-bold leading-tight">
                                {currentPoint.instruction || `Head towards the ${currentPoint.label}. Follow venue signs for the closest path.`}
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-4 mt-12">
                            <button
                                onClick={handlePrev}
                                disabled={currentStep === 0}
                                className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${currentStep === 0 ? 'bg-white/5 text-gray-700 cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                className={`flex-[2] py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${currentStep === steps.length - 1 ? 'bg-green-500 text-black' : 'bg-primary text-white hover:scale-[1.02] shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                                    }`}
                            >
                                {currentStep === steps.length - 1 ? 'Destination Reached' : 'Next Step →'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Progress */}
                <div className="mt-8 flex gap-2">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-primary' : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .glass-card {
                    backdrop-filter: blur(20px);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }
            ` }} />
        </div>
    );
};

export default IndoorNavigation;
