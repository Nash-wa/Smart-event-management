import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const GuestARNavigation = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [nodes, setNodes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [distance, setDistance] = useState(null);
    const [bearing, setBearing] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [arrived, setArrived] = useState(false);

    const arrowRef = useRef(null);

    useEffect(() => {
        const fetchNodes = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/events/${eventId}/arnodes`);
                if (!res.ok) throw new Error("Failed to fetch AR nodes");
                const data = await res.json();

                if (data && data.length > 0) {
                    const sortedNodes = data.sort((a, b) => (a.order || 0) - (b.order || 0));
                    setNodes(sortedNodes);
                } else {
                    setError("No AR nodes configured for this event.");
                }
            } catch (err) {
                setError(err.message || "Error connecting to server.");
            } finally {
                setLoading(false);
            }
        };

        if (eventId) fetchNodes();
    }, [eventId]);

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getBearing = (lat1, lon1, lat2, lon2) => {
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const λ1 = (lon1 * Math.PI) / 180;
        const λ2 = (lon2 * Math.PI) / 180;

        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x =
            Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);

        return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
    };

    useEffect(() => {
        if (nodes.length === 0 || arrived) return;

        let watchId;

        const startTracking = () => {
            if (!("geolocation" in navigator)) {
                setError("GPS is not supported by your browser.");
                return;
            }

            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const target = nodes[currentIndex];
                    if (!target) return;

                    const { latitude, longitude } = position.coords;

                    const currentDistance = getDistance(latitude, longitude, target.latitude, target.longitude);
                    const currentBearing = getBearing(latitude, longitude, target.latitude, target.longitude);

                    setDistance(currentDistance.toFixed(1));
                    setBearing(currentBearing);

                    if (arrowRef.current) {
                        arrowRef.current.setAttribute("rotation", `0 ${currentBearing} 0`);
                    }

                    if (currentDistance < 5) {
                        if (currentIndex < nodes.length - 1) {
                            setCurrentIndex(prev => prev + 1);
                        } else {
                            setArrived(true);
                        }
                    }
                },
                (err) => {
                    if (err.code === 1) setError("GPS permission denied. Please enable location.");
                    else setError("Unable to retrieve location.");
                },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
            );
        };

        startTracking();

        return () => {
            if (watchId !== undefined) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [nodes, currentIndex, arrived]);

    const requestCameraPermission = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err) {
            setError("Camera permission denied. Please allow camera access.");
        }
    };

    useEffect(() => {
        requestCameraPermission();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-blue-500 border-gray-700"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-screen w-full bg-black p-8 text-center justify-center items-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h2 className="text-white text-xl font-bold mb-2">Error</h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-white text-black px-6 py-2 rounded-lg font-bold"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const targetNode = nodes[currentIndex];

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black font-sans">

            {/* UI Overlay */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4">
                <div className="bg-black/70 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-xl text-center">

                    {!arrived ? (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                                    Step {currentIndex + 1} of {nodes.length}
                                </span>
                                <span className="text-xs font-mono text-white/50 bg-white/10 px-2 py-1 rounded">
                                    {distance ? `${distance}m` : "Locating..."}
                                </span>
                            </div>

                            <h1 className="text-xl font-bold text-white mb-1">
                                {targetNode?.name || targetNode?.instruction || "Next Checkpoint"}
                            </h1>

                            <p className="text-sm text-gray-300">
                                {targetNode?.instruction || "Follow the arrow to reach your destination."}
                            </p>

                            {/* AR Coverage Progress */}
                            <div className="mt-4 flex gap-1 w-full h-1 bg-white/10 rounded overflow-hidden">
                                {nodes.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-full flex-1 transition-all ${idx < currentIndex ? 'bg-green-500' : idx === currentIndex ? 'bg-blue-500' : 'bg-transparent'}`}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="py-2">
                            <div className="text-4xl mb-3">🎉</div>
                            <h1 className="text-2xl font-bold text-green-400 mb-2">
                                You have reached {targetNode?.name || "your destination"}!
                            </h1>
                            <button
                                onClick={() => navigate(-1)}
                                className="mt-4 bg-green-500 px-6 py-2 rounded-full text-white font-bold text-sm hover:bg-green-600 transition-colors"
                            >
                                Finish Navigation
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* AR Scene */}
            <a-scene
                vr-mode-ui="enabled: false"
                embedded
                arjs="sourceType: webcam; debugUIEnabled: false; videoTexture: true;"
            >
                {!arrived && targetNode && (
                    <a-entity
                        gps-entity-place={`latitude: ${targetNode.latitude}; longitude: ${targetNode.longitude};`}
                        scale="2 2 2"
                    >
                        <a-entity ref={arrowRef} rotation={`0 ${bearing} 0`}>
                            <a-entity position="0 2 0" scale="2 2 2">
                                <a-cone radius-bottom="0.5" radius-top="0" height="1" color="#3b82f6" position="0 1 0"></a-cone>
                                <a-cylinder radius="0.2" height="1" color="#1d4ed8" position="0 0 0"></a-cylinder>
                            </a-entity>
                            <a-text
                                value={targetNode.name || `${distance}m`}
                                scale="1.5 1.5 1.5"
                                color="#ffffff"
                                align="center"
                                position="0 5 0"
                                look-at="[gps-camera]"
                            ></a-text>
                        </a-entity>
                    </a-entity>
                )}

                <a-camera gps-camera rotation-reader></a-camera>
            </a-scene>

            <style dangerouslySetInnerHTML={{
                __html: `
        .a-canvas {
            width: 100% !important;
            height: 100% !important;
            top: 0 !important;
            left: 0 !important;
            position: fixed !important;
        }
        video {
            object-fit: cover !important;
            width: 100vw !important;
            height: 100vh !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
        }
      `}} />
        </div>
    );
};

export default GuestARNavigation;
