import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import imgStep1 from '../assets/ar/IMG_8777.JPG.jpeg';
import imgStep2 from '../assets/ar/IMG_8778.JPG.jpeg';
import imgStep3 from '../assets/ar/IMG_8779.JPG.jpeg';
import imgStep4 from '../assets/ar/IMG_8780.JPG.jpeg';
import imgStep5 from '../assets/ar/IMG_8781.JPG.jpeg';

const RadarMap = ({ currentStep, totalSteps }) => {
    const angle = (currentStep / (totalSteps - 1)) * 180 - 90;
    return (
        <div className="absolute top-10 right-10 w-32 h-32 glass-card rounded-full border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden rotate-[-45deg]">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-conic-gradient(from 0deg, #3b82f6 0deg 1deg, transparent 1deg 30deg)' }} />
            <div className="w-full h-0.5 bg-primary/40 absolute animate-[spin_4s_linear_infinite]" />
            <div className="relative w-20 h-20 border border-primary/20 rounded-full flex items-center justify-center">
                <div
                    className="absolute w-3 h-3 bg-accent rounded-full shadow-[0_0_15px_#10b981] transition-all duration-1000"
                    style={{ transform: `rotate(${angle}deg) translateY(-30px) rotate(${-angle + 45}deg)` }}
                />
                <div className="w-2 h-2 bg-primary rounded-full" />
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-mono text-primary/60 rotate-[45deg]">RADAR ALPHA-V</div>
        </div>
    );
};

const ARHUD = ({ label, distance, isLast, mousePos, currentStep, totalSteps }) => (
    <div
        className="absolute inset-0 pointer-events-none overflow-hidden transition-transform duration-300"
        style={{ transform: `perspective(1000px) rotateX(${mousePos.y * 2}deg) rotateY(${mousePos.x * -2}deg)` }}
    >
        {/* Scanning Lines Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(255,255,255,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-10 opacity-30" />

        {/* Neural Objective Tracker */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 glass-card px-8 py-2 rounded-full border-primary/20 flex items-center gap-6 backdrop-blur-xl">
            <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1">Objective Status</span>
                <div className="flex gap-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div key={i} className={`w-3 h-1 rounded-full ${i <= currentStep ? 'bg-primary' : 'bg-white/10'}`} />
                    ))}
                </div>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="font-mono text-sm font-bold text-white uppercase italic">
                {isLast ? "Target Reached" : `ETA: ${(totalSteps - currentStep) * 15}s`}
            </div>
        </div>

        {/* Environmental Data Tags */}
        <div className="absolute top-1/4 right-20 space-y-4 opacity-60">
            {['WiFi: 92%', 'TMP: 22°C', 'OCC: 12%'].map((tag, i) => (
                <div key={i} className="flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                    <div className="text-[10px] font-mono text-primary border-l border-primary/30 pl-2 py-0.5">{tag}</div>
                </div>
            ))}
        </div>

        {/* Floating Location Marker */}
        {label && (
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center animate-fade-in-up">
                <div className="glass-card px-8 py-4 rounded-[2rem] border-primary/40 shadow-[0_0_80px_rgba(59,130,246,0.2)] backdrop-blur-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-primary animate-ping absolute" />
                        <div className="w-4 h-4 rounded-full bg-primary relative" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-black tracking-widest text-xl uppercase italic">{label}</span>
                        <span className="text-primary/60 text-[10px] uppercase font-mono tracking-tighter">Verified Landmark // Signal: EXCELLENT</span>
                    </div>
                </div>
                <div className="w-0.5 h-32 bg-gradient-to-b from-primary via-primary/50 to-transparent mt-1 animate-pulse" />
            </div>
        )}

        {/* Directional Arrow Overlay */}
        {!isLast && !label && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-56 h-56 relative flex items-center justify-center">
                    <div className="absolute inset-0 border-[0.5px] border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-8 border border-primary/10 rounded-full" />
                    <svg viewBox="0 0 24 24" className="w-24 h-24 text-white drop-shadow-[0_0_30px_rgba(59,130,246,1)] animate-bounce">
                        <path fill="currentColor" d="M12 2L2 12h5v8h10v-8h5L12 2z" />
                    </svg>
                    <div className="absolute -bottom-8 flex flex-col items-center">
                        <span className="text-[10px] font-mono text-primary/60 uppercase mb-1">Distance Vector</span>
                        <div className="glass-card px-6 py-2 rounded-full text-white font-black text-2xl border-primary/40 backdrop-blur-xl">
                            {distance}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
);

const NavigationStep = ({ image, instruction, distance, nextStep, prevStep, isLast, label, currentStep, totalSteps }) => {
    const [imageError, setImageError] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [glitch, setGlitch] = useState(false);

    useEffect(() => {
        setGlitch(true);
        const timer = setTimeout(() => setGlitch(false), 500);
        return () => clearTimeout(timer);
    }, [currentStep]);

    const handleMouseMove = (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        setMousePos({ x, y });
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            className={`relative w-full h-[calc(100vh-120px)] overflow-hidden bg-black rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 transition-all duration-700 ${glitch ? 'animate-pulse opacity-80' : ''}`}
        >
            {/* Glitch Overlay */}
            {glitch && (
                <div className="absolute inset-0 z-[100] bg-primary/10 mix-blend-color-dodge backdrop-blur-[2px]">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-white/20 animate-bounce" />
                </div>
            )}

            {/* Camera View / Image */}
            {!imageError ? (
                <img
                    src={image}
                    alt="Current View"
                    className="absolute inset-0 w-full h-full object-cover grayscale-[15%] brightness-[90%] contrast-[110%] transition-transform duration-1000"
                    style={{ transform: `scale(1.1) translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1.5px, transparent 0)', backgroundSize: '40px 40px' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-2 border-primary/20 flex items-center justify-center mb-8 animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                            <span className="text-6xl grayscale filter brightness-200">🛰️</span>
                        </div>
                        <h3 className="text-white font-mono text-2xl font-black tracking-[0.4em] uppercase italic">Hyper-Feed Stable</h3>
                        <p className="text-primary font-mono text-xs mt-3 tracking-widest flex items-center gap-2">
                            RECONSTRUCTING NEURAL ENVIRONMENT <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        </p>
                    </div>
                </div>
            )}

            {/* Hyper-HUD */}
            <RadarMap currentStep={currentStep} totalSteps={totalSteps} />
            <ARHUD
                label={label}
                distance={distance}
                isLast={isLast}
                mousePos={mousePos}
                currentStep={currentStep}
                totalSteps={totalSteps}
            />

            {/* Bottom Panel */}
            <div className="absolute bottom-10 inset-x-10 p-1 bg-gradient-to-r from-transparent via-white/5 to-transparent backdrop-blur-sm rounded-[2rem]">
                <div className="flex items-center justify-between gap-6 max-w-4xl mx-auto glass-card p-6 rounded-[2rem] border-white/5">
                    <div className="flex-1 flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-purple-800 flex items-center justify-center text-3xl shadow-[0_0_40px_rgba(59,130,246,0.5)]">
                            {isLast ? '👑' : '🎯'}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-white font-black text-3xl tracking-tighter uppercase italic">{instruction}</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-primary font-mono text-[10px] tracking-widest font-bold">MODE: NAVIGATION_V8</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-gray-500 font-mono text-[10px] tracking-widest">{isLast ? "MISSION ACC." : `DIST: ${distance}`}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={prevStep}
                            className="w-16 h-20 rounded-2xl glass-card border-white/10 flex items-center justify-center text-xl hover:bg-white/10 transition-all active:scale-95 italic"
                        >
                            ←
                        </button>
                        <button
                            onClick={nextStep}
                            className="w-24 h-20 rounded-2xl bg-white text-black flex flex-col items-center justify-center hover:bg-primary hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 group"
                        >
                            <span className="text-2xl font-black group-hover:translate-x-1 transition-transform">→</span>
                            <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Next Vector</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Scanning Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/40 animate-[scan_4s_linear_infinite] z-[100] shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        </div>
    );
};

const ARNavigation = () => {
    const [step, setStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const steps = [
        {
            image: imgStep1,
            instruction: "Proceed into the main hall",
            distance: "12m"
        },
        {
            image: imgStep2,
            instruction: "Approaching Systems wing",
            label: "Systems Core Laboratory",
            distance: "4m"
        },
        {
            image: imgStep3,
            instruction: "Follow the north corridor",
            distance: "18m"
        },
        {
            image: imgStep4,
            instruction: "Safety exit detected",
            label: "Fire Safety Point 04",
            distance: "2m"
        },
        {
            image: imgStep5,
            instruction: "Arrival at destination",
            distance: "0m",
            isLast: true
        }
    ];

    const saveLayout = async () => {
        setIsSaving(true);
        try {
            const layoutData = {
                completedSteps: step,
                totalSteps: steps.length,
                lastPosition: steps[step].instruction
            };
            // Dynamic event ID would come from URL or Context in real app
            await api.post('/ar-layout', {
                event_id: "65d000000000000000000001",
                layoutData
            });
            alert("AR Layout Blueprint Saved to Cloud! 🚀");
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save layout.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleNext = () => step < steps.length - 1 && setStep(step + 1);
    const handlePrev = () => step > 0 && setStep(step - 1);

    return (
        <div className="min-h-screen bg-[#020202] p-6 lg:p-12 flex flex-col items-center">
            <header className="w-full max-w-6xl flex justify-between items-center mb-8">
                <div onClick={() => navigate('/dashboard')} className="cursor-pointer group flex flex-col">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary" />
                        <h1 className="text-4xl font-black text-white tracking-tight italic group-hover:text-primary transition-colors uppercase">Hyper-AR v8.0</h1>
                    </div>
                    <span className="text-zinc-600 text-[10px] font-mono tracking-[0.4em] mt-1">ENVIRONMENT_SYNC: 100% // ENCRYPTED_FEED</span>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={saveLayout}
                        disabled={isSaving}
                        className="glass-card px-6 py-3 rounded-2xl border-primary/20 bg-primary/10 flex items-center gap-2 hover:bg-primary/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <span className="text-lg">{isSaving ? '⌛' : '💾'}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                            {isSaving ? 'Saving...' : 'Save Blueprint'}
                        </span>
                    </button>
                    <div className="glass-card px-6 py-3 rounded-2xl border-white/5 bg-white/5 flex flex-col items-end">
                        <span className="text-zinc-500 font-mono text-[8px] tracking-widest uppercase mb-1">Vector Index</span>
                        <span className="text-primary font-black text-xl italic font-mono leading-none">{step + 1} / {steps.length}</span>
                    </div>
                </div>
            </header>

            <div className="w-full max-w-6xl relative">
                <NavigationStep
                    {...steps[step]}
                    currentStep={step}
                    totalSteps={steps.length}
                    nextStep={handleNext}
                    prevStep={handlePrev}
                />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0% { top: 0% }
                    100% { top: 100% }
                }
                .shadow-glow {
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
                }
            `}} />
        </div>
    );
};

export default ARNavigation;
