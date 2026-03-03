import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const IndoorNavigation = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [bearing, setBearing] = useState(0);
    const [distance, setDistance] = useState(null);
    const [proximityAlert, setProximityAlert] = useState(false);

    // Calculate bearing from user location to target location
    const calculateBearing = (userLat, userLng, targetLat, targetLng) => {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const toDeg = (rad) => (rad * 180) / Math.PI;

        const dLng = toRad(targetLng - userLng);
        const y = Math.sin(dLng) * Math.cos(toRad(targetLat));
        const x =
            Math.cos(toRad(userLat)) * Math.sin(toRad(targetLat)) -
            Math.sin(toRad(userLat)) * Math.cos(toRad(targetLat)) * Math.cos(dLng);

        const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
        return bearing;
    };

    // Calculate distance between two points (Haversine formula)
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; // Return in meters
    };

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

    // Watch user location
    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });

                // Calculate bearing and distance to current step
                if (event && event.nodes && event.nodes[currentStep]) {
                    const currentNode = event.nodes[currentStep];
                    const newBearing = calculateBearing(
                        latitude,
                        longitude,
                        currentNode.latitude,
                        currentNode.longitude
                    );
                    const newDistance = calculateDistance(
                        latitude,
                        longitude,
                        currentNode.latitude,
                        currentNode.longitude
                    );

                    setBearing(newBearing);
                    setDistance(newDistance);

                    // Auto-advance if user is within 20 meters of current node
                    if (newDistance < 20 && currentStep < event.nodes.length - 1) {
                        setProximityAlert(true);
                        setTimeout(() => {
                            setCurrentStep(currentStep + 1);
                            setProximityAlert(false);
                        }, 2000);
                    }
                }
            },
            (error) => {
                console.warn("Geolocation error:", error);
            },
            { enableHighAccuracy: true, maximumAge: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [event, currentStep]);

    const handleNext = () => {
        if (currentStep < (event?.nodes?.length || 0) - 1) setCurrentStep(currentStep + 1);
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

    const steps = event?.nodes || [];

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

                        {/* Proximity Alert */}
                        {proximityAlert && (
                            <div className="absolute top-4 left-4 right-4 z-20 bg-green-500/20 border border-green-500/40 rounded-xl px-4 py-3 animate-pulse">
                                <p className="text-sm font-bold text-green-300">✓ Node nearby! Advancing...</p>
                            </div>
                        )}

                        {/* Distance and GPS Status */}
                        <div className="absolute top-4 right-4 z-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur">
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">GPS Distance</p>
                            <p className="text-lg font-black text-accent">
                                {distance !== null ? `${Math.round(distance)}m` : 'Locating...'}
                            </p>
                        </div>

                        <div className="z-10 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-primary/40 flex items-center justify-center text-4xl mb-4 animate-bounce">
                                {currentPoint.anchorType === 'Entrance' ? '🚪' :
                                    currentPoint.anchorType === 'Stage' ? '🎭' :
                                        currentPoint.anchorType === 'Restroom' ? '🚻' :
                                            currentPoint.anchorType === 'Exit' ? '🏃' :
                                                currentPoint.anchorType === 'HelpDesk' ? 'ℹ️' : '📍'}
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-center px-6">
                                {currentPoint.nodeId || `Node ${currentStep + 1}`}
                            </h2>
                            <p className="text-xs font-mono text-gray-500 mt-2 uppercase">
                                {currentPoint.anchorType}
                            </p>
                        </div>

                        {/* Dynamic Directional Arrow */}
                        {userLocation && currentStep < steps.length - 1 && (
                            <div
                                className="absolute bottom-8 right-8 text-6xl transition-transform duration-300"
                                style={{
                                    transform: `rotate(${bearing}deg)`,
                                    textShadow: '0 0 20px rgba(59,130,246,0.6)',
                                    filter: 'drop-shadow(0 0 10px rgba(59,130,246,0.4))'
                                }}
                            >
                                ↑
                            </div>
                        )}

                        {/* Direction Label */}
                        {userLocation && (
                            <div className="absolute bottom-8 left-8 text-xs font-bold bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                                <p className="text-gray-400">Bearing: <span className="text-accent">{Math.round(bearing)}°</span></p>
                            </div>
                        )}
                    </div>

                    {/* Instruction Panel */}
                    <div className="p-10 flex-1 flex flex-col justify-between">
                        <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Navigation Instructions</span>
                            <p className="text-2xl font-bold leading-tight">
                                {currentPoint.instructions || `Head towards the ${currentPoint.anchorType}. Follow venue signs for the closest path.`}
                            </p>
                            {userLocation && distance !== null && (
                                <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                                    <p className="text-sm text-gray-300">
                                        <span className="font-bold text-primary">Distance:</span> {Math.round(distance)}m away •
                                        <span className="font-bold text-accent ml-2">Direction:</span> {Math.round(bearing)}° from north
                                    </p>
                                </div>
                            )}
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
