import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const anchorIcon = (type) => {
    const icons = { Entrance: '🚪', Stage: '🎭', Restroom: '🚻', Exit: '🏃', HelpDesk: 'ℹ️', Other: '📍' };
    return icons[type] || '📍';
};

const anchorColor = (type) => {
    const colors = {
        Entrance: '#3b82f6', Stage: '#8b5cf6', Restroom: '#0ea5e9',
        Exit: '#ef4444', HelpDesk: '#f59e0b', Other: '#10b981'
    };
    return colors[type] || '#10b981';
};

export default function GuestARNavigation() {
    const { eventId } = useParams();

    const [eventName, setEventName] = useState('');
    const [venue, setVenue] = useState('');
    const [nodes, setNodes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [arrived, setArrived] = useState(false);
    const [showMap, setShowMap] = useState(true);

    // Fetch public nodes (no auth required)
    useEffect(() => {
        const fetchNodes = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/events/public/${eventId}/nodes`);
                if (!res.ok) throw new Error('Event not found');
                const data = await res.json();
                setEventName(data.eventName || 'Event');
                setVenue(data.venue || '');

                // Sort: Entrance first, then by original order
                const sorted = [...(data.nodes || [])].sort((a, b) => {
                    if (a.anchorType === 'Entrance') return -1;
                    if (b.anchorType === 'Entrance') return 1;
                    return 0;
                });
                setNodes(sorted);
            } catch (err) {
                setError(err.message || 'Failed to load navigation data.');
            } finally {
                setLoading(false);
            }
        };
        if (eventId) fetchNodes();
    }, [eventId]);

    const handleNext = useCallback(() => {
        if (currentIndex < nodes.length - 1) {
            setCurrentIndex(i => i + 1);
            setArrived(false);
        } else {
            setArrived(true);
        }
    }, [currentIndex, nodes.length]);

    const handleBack = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1);
            setArrived(false);
        }
    }, [currentIndex]);

    // ── Loading ──────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-white/10 animate-spin" />
                <p className="text-white/60 text-sm font-mono uppercase tracking-widest">Loading Navigation...</p>
            </div>
        );
    }

    // ── Error / No nodes ─────────────────────────────────────────
    if (error || nodes.length === 0) {
        return (
            <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-4xl mb-6">📍</div>
                <h2 className="text-2xl font-black text-white uppercase mb-3">Navigation Unavailable</h2>
                <p className="text-white/40 text-sm max-w-sm">
                    {error || 'No navigation nodes have been set up for this venue. Please contact the event organizer.'}
                </p>
            </div>
        );
    }

    const current = nodes[currentIndex];
    const isLast = currentIndex === nodes.length - 1;
    const isFirst = currentIndex === 0;
    const color = anchorColor(current?.anchorType);
    const mapCenter = current?.latitude ? [current.latitude, current.longitude] : [10.8505, 76.2711];

    // ── Destination reached ──────────────────────────────────────
    if (arrived) {
        return (
            <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-32 h-32 rounded-full bg-green-500/20 border-4 border-green-500/40 flex items-center justify-center text-5xl mb-8 animate-pulse">🎉</div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-3">You've Arrived!</h2>
                <p className="text-white/50 text-sm mb-8">Welcome to <span className="text-green-400 font-bold">{eventName}</span>. Enjoy the event!</p>
                <button
                    onClick={() => { setArrived(false); setCurrentIndex(0); }}
                    className="px-8 py-4 bg-white text-black font-black rounded-2xl uppercase text-sm tracking-widest hover:bg-green-400 transition-all"
                >
                    Restart Navigation
                </button>
            </div>
        );
    }

    // ── Main AR Navigation UI ────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#030303] text-white font-sans flex flex-col">

            {/* Top header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">🧭 Guest Navigation</p>
                    <h1 className="text-lg font-black uppercase tracking-tight text-white">{eventName}</h1>
                    {venue && <p className="text-[10px] text-white/30 uppercase tracking-widest">{venue}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Step</span>
                    <span className="text-2xl font-black text-white">{currentIndex + 1}<span className="text-white/30 text-base">/{nodes.length}</span></span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1 px-4 pt-3">
                {nodes.map((_, i) => (
                    <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-500"
                        style={{ background: i <= currentIndex ? color : 'rgba(255,255,255,0.08)' }}
                    />
                ))}
            </div>

            {/* Main card */}
            <div className="flex-1 flex flex-col md:flex-row gap-0 md:gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">

                {/* Left: Nav info */}
                <div className="flex-1 flex flex-col gap-4">

                    {/* Type badge + icon */}
                    <div
                        className="rounded-[2.5rem] p-8 flex flex-col items-center gap-4 border"
                        style={{ background: `${color}10`, borderColor: `${color}30` }}
                    >
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl border-4"
                            style={{ background: `${color}20`, borderColor: `${color}50` }}
                        >
                            {anchorIcon(current?.anchorType)}
                        </div>
                        <div className="text-center">
                            <span
                                className="text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full"
                                style={{ background: `${color}20`, color }}
                            >
                                {current?.anchorType}
                            </span>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mt-2">
                                {current?.nodeId?.replace(/-/g, ' ')?.toUpperCase() || 'LOCATION'}
                            </h2>
                        </div>

                        {/* Direction arrow */}
                        {!isLast && (
                            <div className="text-5xl animate-bounce text-white/30">↓</div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3" style={{ color }}>📋 Instructions</p>
                        <p className="text-white text-lg font-semibold leading-relaxed">
                            {current?.instructions || `Head towards the ${current?.anchorType || 'destination'}. Follow the venue signage for the nearest route.`}
                        </p>
                    </div>

                    {/* GPS coords */}
                    {current?.latitude && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">GPS</p>
                            <p className="text-[10px] font-mono text-white/60">{current.latitude.toFixed(5)}, {current.longitude.toFixed(5)}</p>
                        </div>
                    )}

                    {/* Map toggle (mobile) */}
                    <button
                        onClick={() => setShowMap(m => !m)}
                        className="md:hidden px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white/60 hover:bg-white/10"
                    >
                        {showMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
                    </button>

                    {/* Navigation controls */}
                    <div className="flex gap-4 mt-auto">
                        <button
                            onClick={handleBack}
                            disabled={isFirst}
                            className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all bg-white/5 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-[2] py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-2xl text-black"
                            style={{ background: isLast ? '#4ade80' : color, boxShadow: `0 0 30px ${color}50` }}
                        >
                            {isLast ? '🎉 I\'ve Arrived!' : 'Next →'}
                        </button>
                    </div>
                </div>

                {/* Right: Map */}
                {(showMap || window.innerWidth >= 768) && (
                    <div className="w-full md:w-[380px] h-[320px] md:h-auto md:min-h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl mt-4 md:mt-0 relative">
                        <MapContainer center={mapCenter} zoom={17} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="map-tiles-dark" />

                            {/* All nodes (grey-ish) */}
                            {nodes.map((node, i) => node.latitude && i !== currentIndex && (
                                <Marker key={i} position={[node.latitude, node.longitude]} icon={L.divIcon({
                                    className: '',
                                    html: `<div style='background:rgba(255,255,255,0.3);width:10px;height:10px;border-radius:50%;border:2px solid white;'></div>`,
                                    iconSize: [10, 10], iconAnchor: [5, 5]
                                })}>
                                    <Popup>{anchorIcon(node.anchorType)} {node.nodeId}</Popup>
                                </Marker>
                            ))}

                            {/* Current node (highlighted) */}
                            {current?.latitude && (
                                <Marker position={[current.latitude, current.longitude]} icon={L.divIcon({
                                    className: '',
                                    html: `<div style='background:${color};width:18px;height:18px;border-radius:50%;border:4px solid white;box-shadow:0 0 25px ${color};'></div>`,
                                    iconSize: [18, 18], iconAnchor: [9, 9]
                                })}>
                                    <Popup><strong>{anchorIcon(current.anchorType)} {current.nodeId}</strong><br />{current.anchorType}</Popup>
                                </Marker>
                            )}
                        </MapContainer>

                        {/* You are here label */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded-full backdrop-blur-xl bg-black/60 border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">📍 Current Node Highlighted</p>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .map-tiles-dark { filter: invert(100%) hue-rotate(180deg) brightness(90%) contrast(85%); }
                .leaflet-popup-content-wrapper { background:#111; color:#fff; border:1px solid rgba(255,255,255,0.1); border-radius:12px; }
                .leaflet-popup-tip { background:#111; }
            ` }} />
        </div>
    );
}
