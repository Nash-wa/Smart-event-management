import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";



const RadarMap = ({ bearing }) => {
    // Rotate the radar based on device bearing to target
    return (
        <div className="absolute top-10 right-10 w-32 h-32 glass-card rounded-full border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden">
            {/* Compass Ring */}
            <div className="absolute inset-0 border border-white/10 rounded-full" />
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'repeating-conic-gradient(from 0deg, #3b82f6 0deg 1deg, transparent 1deg 30deg)',
                transform: `rotate(${-bearing}deg)`
            }} />

            <div className="w-full h-0.5 bg-primary/40 absolute animate-[spin_4s_linear_infinite]" />

            <div className="relative w-20 h-20 border border-primary/20 rounded-full flex items-center justify-center">
                {/* Target Marker on Radar */}
                <div
                    className="absolute w-3 h-3 bg-accent rounded-full shadow-[0_0_15px_#10b981] transition-all duration-300"
                    style={{ transform: `rotate(${bearing}deg) translateY(-35px)` }}
                />
                {/* User Center */}
                <div className="w-2 h-2 bg-primary rounded-full relative z-10">
                    <div className="absolute inset-[-4px] border border-primary/50 rounded-full animate-ping" />
                </div>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-mono text-primary/60">NAV_SAT_ALPHA</div>
        </div>
    );
};


const ARHUD = ({ label, distance, isLast, currentStep, totalSteps, bearing }) => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Scanning Lines Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(255,255,255,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] z-10 opacity-30" />

        {/* Operational Objective Tracker */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 glass-card px-8 py-2 rounded-full border-primary/20 flex items-center gap-6 backdrop-blur-xl z-20">
            <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1">GPS Lock: ACTIVE</span>
                <div className="flex gap-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div key={i} className={`w-3 h-1 rounded-full ${i <= currentStep ? 'bg-primary' : 'bg-white/10'}`} />
                    ))}
                </div>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="font-mono text-xs font-bold text-white uppercase italic">
                BRG: {bearing.toFixed(1)}° • {isLast ? "ARRIVED" : "IN_TRANSIT"}
            </div>
        </div>

        {/* Environmental Data Tags */}
        <div className="absolute top-1/4 right-20 space-y-4 opacity-60 z-20">
            {[`LAT: LOCKED`, `LNG: LOCKED`, `ALT: 12m`].map((tag, i) => (
                <div key={i} className="flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                    <div className="text-[10px] font-mono text-primary border-l border-primary/30 pl-2 py-0.5 uppercase">{tag}</div>
                </div>
            ))}
        </div>

        {/* Floating Location Marker - Positioned by Bearing */}
        {label && (
            <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center animate-fade-in-up transition-transform duration-300"
                style={{ transform: `rotateY(${(bearing > 180 ? bearing - 360 : bearing) * -2}deg) translateZ(200px)` }}
            >
                <div className="glass-card px-8 py-4 rounded-[2rem] border-primary/40 shadow-[0_0_80px_rgba(59,130,246,0.2)] backdrop-blur-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-primary animate-ping absolute" />
                        <div className="w-4 h-4 rounded-full bg-primary relative" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-black tracking-widest text-xl uppercase italic">{label}</span>
                        <span className="text-primary/60 text-[10px] uppercase font-mono tracking-tighter">Target Anchor Locked</span>
                    </div>
                </div>
                <div className="w-0.5 h-32 bg-gradient-to-b from-primary via-primary/50 to-transparent mt-1 animate-pulse" />
            </div>
        )}

        {/* Directional Arrow Overlay */}
        {!isLast && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-64 h-64 relative flex items-center justify-center">
                    {/* Bearing Indicator */}
                    <div
                        className="absolute inset-0 border-2 border-dashed border-primary/10 rounded-full transition-transform duration-500"
                        style={{ transform: `rotate(${bearing}deg)` }}
                    >
                        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_#3b82f6]" />
                    </div>

                    <div className="absolute inset-0 border-[0.5px] border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />

                    {/* Locked-on Glow */}
                    {Math.abs(bearing % 360) < 20 && (
                        <div className="absolute inset-[-20px] bg-primary/20 blur-3xl animate-pulse rounded-full z-0" />
                    )}

                    <svg
                        viewBox="0 0 24 24"
                        className={`w-24 h-24 transition-all duration-300 ${Math.abs(bearing % 360) < 20 ? 'text-accent drop-shadow-[0_0_50px_#10b981] scale-110' : 'text-white drop-shadow-[0_0_30px_rgba(59,130,246,1)]'}`}
                    >
                        <path fill="currentColor" d="M12 2L2 12h5v8h10v-8h5L12 2z" />
                    </svg>

                    <div className="absolute -bottom-12 flex flex-col items-center">
                        <span className={`text-[10px] font-black uppercase mb-1 tracking-widest ${Math.abs(bearing % 360) < 20 ? 'text-accent' : 'text-primary/60'}`}>
                            {Math.abs(bearing % 360) < 20 ? '— TARGET ACQUIRED —' : 'Target Proximity'}
                        </span>
                        <div className={`glass-card px-8 py-3 rounded-full font-black text-3xl border-primary/40 backdrop-blur-3xl shadow-[0_0_40px_rgba(59,130,246,0.2)] ${parseInt(distance) < 5 ? 'text-accent animate-bounce' : 'text-white'}`}>
                            {parseInt(distance) < 3 ? 'ARRIVED' : distance}
                        </div>
                    </div>

                </div>
            </div>
        )}
    </div>
);


const NavigationStep = ({ instruction, distance, nextStep, prevStep, isLast, label, currentStep, totalSteps, bearing }) => {
    const videoRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [glitch, setGlitch] = useState(false);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: false
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setCameraActive(true);
                }
            } catch (err) {
                console.error("Camera access failed", err);
                setCameraActive(false);
            }
        };

        startCamera();

        // Glitch effect on step change
        const glitchTimer = setTimeout(() => setGlitch(true), 10);
        const timer = setTimeout(() => setGlitch(false), 500);

        const currentVideoRef = videoRef.current;

        return () => {
            if (currentVideoRef && currentVideoRef.srcObject) {
                currentVideoRef.srcObject.getTracks().forEach(track => track.stop());
            }
            clearTimeout(glitchTimer);
            clearTimeout(timer);
        };
    }, [currentStep]);

    return (
        <div className={`relative w-full h-[calc(100vh-120px)] overflow-hidden bg-black rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 transition-all duration-700 ${glitch ? 'animate-pulse opacity-80' : ''}`}>
            {/* Live Camera Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`absolute inset-0 w-full h-full object-cover grayscale-[15%] brightness-[90%] contrast-[110%] transition-opacity duration-1000 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
            />

            {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
                    <div className="w-24 h-24 rounded-full border-2 border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                        <span className="text-4xl text-red-500 shadow-glow">⚠️</span>
                    </div>
                    <h3 className="text-white font-mono text-xl font-black uppercase italic tracking-widest">Feed Connection Error</h3>
                    <p className="text-zinc-500 font-mono text-[10px] mt-2">REQUESTING PERMISSIONS...</p>
                </div>
            )}

            {/* Hyper-HUD */}
            <RadarMap bearing={bearing} />
            <ARHUD
                label={label}
                distance={distance}
                isLast={isLast}
                currentStep={currentStep}
                totalSteps={totalSteps}
                bearing={bearing}
            />

            {/* Bottom Panel */}
            <div className="absolute bottom-10 inset-x-10 p-1 bg-gradient-to-r from-transparent via-white/5 to-transparent backdrop-blur-sm rounded-[2rem] z-30">
                <div className="flex items-center justify-between gap-6 max-w-4xl mx-auto glass-card p-6 rounded-[2rem] border-white/5">
                    <div className="flex-1 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-purple-800 flex items-center justify-center text-3xl shadow-[0_0_40px_rgba(59,130,246,0.5)]">
                            {isLast ? '👑' : '🎯'}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-white font-black text-2xl tracking-tighter uppercase italic line-clamp-1">{instruction}</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-primary font-mono text-[9px] tracking-widest font-black uppercase">Sensor: Geo_Spatial_V8</span>
                                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                <span className="text-gray-500 font-mono text-[9px] tracking-widest uppercase">{isLast ? "Anchor Reached" : `Proximity: ${distance}`}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={prevStep} className="w-14 h-16 rounded-2xl glass-card border-white/10 flex items-center justify-center text-xl hover:bg-white/10 transition-all font-black">←</button>
                        <button onClick={nextStep} className="w-20 h-16 rounded-2xl bg-white text-black flex flex-col items-center justify-center hover:bg-primary hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 group">
                            <span className="text-2xl font-black group-hover:translate-x-1 transition-transform">→</span>
                            <span className="text-[7px] font-black uppercase tracking-tighter mt-1">Next</span>
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
    const [event, setEvent] = useState(null);
    const [userLoc, setUserLoc] = useState(null);
    const [rawCompass, setRawCompass] = useState(0);

    const navigate = useNavigate();
    const { eventId } = useParams();

    // Haversine formula for distance
    const getDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return "...";
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d > 1000 ? `${(d / 1000).toFixed(1)}km` : `${Math.round(d)}m`;
    };

    // Bearing calculation
    const getBearing = (lat1, lon1, lat2, lon2) => {
        const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
        const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
        let brng = Math.atan2(y, x) * 180 / Math.PI;
        return (brng + 360) % 360;
    };

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/events/public/${eventId}`);
                const data = await res.json();
                if (res.ok) setEvent(data);
            } catch (error) {
                console.error("Failed to fetch event for AR", error);
            }
        };
        if (eventId) fetchEvent();

        // 1. Start GPS Tracking
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            (err) => console.error("GPS Error", err),
            { enableHighAccuracy: true }
        );

        // 2. Start Compass Tracking
        const handleOrientation = (e) => {
            const compass = e.webkitCompassHeading || e.alpha;
            if (compass) setRawCompass(360 - compass);
        };

        window.addEventListener('deviceorientation', handleOrientation, true);
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);

        return () => {
            navigator.geolocation.clearWatch(watchId);
            window.removeEventListener('deviceorientation', handleOrientation);
            window.removeEventListener('deviceorientationabsolute', handleOrientation);
        };
    }, [eventId]);

    const steps = (event?.arPoints && event.arPoints.length > 0)
        ? event.arPoints.map((pt, i) => {
            const dist = userLoc ? getDistance(userLoc.lat, userLoc.lng, pt.lat, pt.lng) : "GPS Lock...";
            const targetBrng = userLoc ? getBearing(userLoc.lat, userLoc.lng, pt.lat, pt.lng) : 0;
            const relativeBearing = (targetBrng + rawCompass) % 360;

            return {
                instruction: pt.instruction || `Head towards ${pt.label}`,
                label: pt.label,
                distance: dist,
                isLast: i === event.arPoints.length - 1,
                bearing: relativeBearing
            };
        })
        : [];

    const handleNext = () => step < steps.length - 1 && setStep(step + 1);
    const handlePrev = () => step > 0 && setStep(step - 1);


    if (!eventId || (event && !event.arPoints?.length)) {
        return (
            <div className="min-h-screen bg-[#020202] p-6 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full border-2 border-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                    <span className="text-4xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic mb-4">Navigation Offline</h2>
                <p className="text-zinc-500 max-w-md mb-8">No navigation nodes have been configured for this venue. Please access the Event Plan to set up AR points.</p>
                <button
                    onClick={() => navigate(`/event-plan/${eventId}`)}
                    className="px-8 py-3 bg-white text-black font-black rounded-xl uppercase tracking-tighter hover:bg-primary hover:text-white transition-all"
                >
                    Back to Event Plan
                </button>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-[#020202] p-6 lg:p-12 flex flex-col items-center">
            <header className="w-full max-w-6xl flex justify-between items-center mb-8">
                <div onClick={() => navigate('/dashboard')} className="cursor-pointer group flex flex-col">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary" />
                        <h1 className="text-3xl font-black text-white tracking-tight italic group-hover:text-primary transition-colors uppercase">Venue Navigator V8</h1>
                    </div>
                    <span className="text-zinc-600 text-[10px] font-mono tracking-[0.4em] mt-1">LOCATION_SYNC: ACTIVE // OPERATIONAL_FEED</span>
                </div>
                <div className="flex gap-4">
                    <div className="glass-card px-6 py-3 rounded-2xl border-white/5 bg-white/5 flex flex-col items-end">
                        <span className="text-zinc-500 font-mono text-[8px] tracking-widest uppercase mb-1">Target Point</span>
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
