import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    calculateTimeline,
    calculateBudgetAllocation,
    estimateResources,
    calculateReadinessScore,
} from "../utils/planningEngine";
import "../css/eventplan.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { QRCodeSVG } from 'qrcode.react';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map click handler – captures GPS coordinates
function LocationPicker({ onLocationSelect }) {
    useMapEvents({
        click(e) { onLocationSelect(e.latlng); },
    });
    return null;
}

// Recenter map whenever center changes  
function RecenterMap({ center }) {
    const map = useMapEvents({});
    useEffect(() => {
        if (center?.[0] && center?.[1]) map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

// Anchor type icons
const anchorIcon = (type) => {
    const icons = { Entrance: '🚪', Stage: '🎭', Restroom: '🚻', Exit: '🏃', HelpDesk: 'ℹ️', Other: '📍' };
    return icons[type] || '📍';
};

function EventPlan() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [participants, setParticipants] = useState([]);
    const [planningData, setPlanningData] = useState(null);

    // New node form state
    const [newNode, setNewNode] = useState({
        nodeId: '',
        anchorType: 'Entrance',
        latitude: null,
        longitude: null,
        instructions: ''
    });
    const [nodeDeploying, setNodeDeploying] = useState(false);
    const [nodeError, setNodeError] = useState('');

    const [announcement, setAnnouncement] = useState({ text: '', type: 'Info' });
    const [announcementStatus, setAnnouncementStatus] = useState({ type: '', message: '' });
    const [showQR, setShowQR] = useState(false);

    const guestARUrl = `${window.location.origin}/ar/${id}`;

    // ─── Fetch event data ──────────────────────────────────────────
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const res = await fetch(`http://localhost:5000/api/events/${id}`, {
                    headers: { Authorization: `Bearer ${userInfo?.token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setEvent(data);

                    // Pre-fill node latitude/longitude from venue
                    if (data.location?.lat && !(data.nodes?.length)) {
                        setNewNode(prev => ({
                            ...prev,
                            latitude: data.location.lat,
                            longitude: data.location.lng,
                            nodeId: 'entrance',
                            anchorType: 'Entrance'
                        }));
                    }

                    // Fetch participants
                    const pRes = await fetch(`http://localhost:5000/api/participants/${id}`, {
                        headers: { Authorization: `Bearer ${userInfo?.token}` }
                    });
                    if (pRes.ok) {
                        const pData = await pRes.json();
                        setParticipants(Array.isArray(pData) ? pData : []);
                    }

                    // Set or init planning data
                    if (data.plan?.timeline) {
                        setPlanningData({
                            ...data.plan,
                            timeline: data.plan.timeline || [],
                            budget: data.plan.budget || [],
                            resources: data.plan.resources || []
                        });
                    } else {
                        const timeline = calculateTimeline(data.startDate, data.category, data.selectedVendors, data.features);
                        const budget = calculateBudgetAllocation(data.budget, data.category);
                        const resources = estimateResources(data.capacity || 100, data.venueType || 'Indoor', data.category);
                        const newPlan = {
                            timeline, budget, resources,
                            readinessScore: calculateReadinessScore(timeline, data.selectedVendors)
                        };
                        setPlanningData(newPlan);
                        const userInfo2 = JSON.parse(localStorage.getItem('userInfo'));
                        await fetch(`http://localhost:5000/api/events/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo2?.token}` },
                            body: JSON.stringify({ plan: newPlan })
                        });
                    }
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

    // ─── Deploy node to backend ────────────────────────────────────
    const deployNode = async () => {
        setNodeError('');
        if (!newNode.nodeId.trim()) { setNodeError('Node ID is required.'); return; }
        if (!newNode.latitude) { setNodeError('Please click on the map to select a GPS coordinate.'); return; }

        setNodeDeploying(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch(`http://localhost:5000/api/events/${id}/nodes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo?.token}` },
                body: JSON.stringify(newNode)
            });
            if (res.ok) {
                const updatedNodes = await res.json();
                setEvent(prev => ({ ...prev, nodes: updatedNodes }));
                setNewNode({ nodeId: '', anchorType: 'Entrance', latitude: null, longitude: null, instructions: '' });
            } else {
                const errorData = await res.json();
                setNodeError(errorData.message || 'Failed to deploy node.');
            }
        } catch (error) {
            setNodeError('Network error. Please try again.');
        } finally {
            setNodeDeploying(false);
        }
    };

    // ─── Delete node ───────────────────────────────────────────────
    const deleteNode = async (nodeId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch(`http://localhost:5000/api/events/${id}/nodes/${nodeId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${userInfo?.token}` }
            });
            if (res.ok) {
                const updatedNodes = await res.json();
                setEvent(prev => ({ ...prev, nodes: updatedNodes }));
            }
        } catch (err) {
            console.error("Failed to delete node", err);
        }
    };

    // ─── Update task status ────────────────────────────────────────
    const updateTaskStatus = async (taskIndex, newStatus) => {
        if (!planningData?.timeline) return;
        const updatedTimeline = [...planningData.timeline];
        updatedTimeline[taskIndex].status = newStatus;
        const newReadiness = calculateReadinessScore(updatedTimeline, event?.selectedVendors);
        const updatedPlan = { ...planningData, timeline: updatedTimeline, readinessScore: newReadiness };
        const updatedEvent = { ...event, plan: updatedPlan, readinessScore: newReadiness };
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch(`http://localhost:5000/api/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo?.token}` },
                body: JSON.stringify(updatedEvent)
            });
            if (res.ok) { setEvent(updatedEvent); setPlanningData(updatedPlan); }
        } catch (err) { console.error("Failed to update task", err); }
    };

    // ─── Broadcast announcement ────────────────────────────────────
    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!announcement.text) return;
        setAnnouncementStatus({ type: 'loading', message: 'Broadcasting...' });
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch('http://localhost:5000/api/messages/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo?.token}` },
                body: JSON.stringify({ event: id, text: announcement.text, type: announcement.type })
            });
            if (res.ok) {
                setAnnouncementStatus({ type: 'success', message: 'Broadcasted!' });
                setAnnouncement({ text: '', type: 'Info' });
                setTimeout(() => setAnnouncementStatus({ type: '', message: '' }), 3000);
            } else {
                setAnnouncementStatus({ type: 'error', message: 'Failed to broadcast.' });
            }
        } catch { setAnnouncementStatus({ type: 'error', message: 'Network error.' }); }
    };

    // ─── Loading / error states ────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }
    if (!event || !planningData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white">
                <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
                <button onClick={() => navigate("/dashboard")} className="px-6 py-2 bg-primary rounded-lg">Back to Dashboard</button>
            </div>
        );
    }

    const mapCenter = [event.location?.lat || 10.8505, event.location?.lng || 76.2711];
    const nodes = event.nodes || [];

    return (
        <div className="event-plan-page min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* ── HEADER ───────────────────────────────────────── */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 border-b border-white/5 pb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                                Control Center
                            </span>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                Node: {id?.slice?.(-6) || "ID"}
                            </span>
                            <button
                                onClick={() => navigate(`/ar/${id}`)}
                                className="px-4 py-1 bg-accent text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                            >
                                🚀 Launch Guest AR
                            </button>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter text-white">
                            {event?.name || "Event"}
                        </h1>
                        <div className="flex flex-wrap gap-8 text-gray-400">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                <span className="text-sm font-black uppercase tracking-widest">{event.category || "General"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-sm font-black uppercase tracking-widest">
                                    {event.startDate ? new Date(event.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "Date TBD"}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                <span className="text-sm font-black uppercase tracking-widest">{event.venue || "Field Location"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-8 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl w-full lg:w-auto">
                        <div className="flex flex-col items-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Event Readiness</p>
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray={251.2}
                                        strokeDashoffset={251.2 - (251.2 * (event?.readinessScore || planningData?.readinessScore || 0)) / 100}
                                        className="text-primary transition-all duration-1000"
                                    />
                                </svg>
                                <span className="absolute text-2xl font-black text-white">{event?.readinessScore || planningData?.readinessScore || 0}%</span>
                            </div>
                        </div>
                        <div className="hidden lg:block w-px h-16 bg-white/10" />
                        <div className="grid grid-cols-2 gap-8 text-center">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Status</p>
                                <p className="text-xl font-black text-accent uppercase">
                                    {(event?.readinessScore || planningData?.readinessScore || 0) >= 90 ? 'Ready' : 'Planning'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Guests</p>
                                <p className="text-xl font-black text-white">{participants?.filter?.(p => p && p.status === 'Confirmed')?.length || 0} / {event?.capacity || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── TOP CARDS ─────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Critical Alerts */}
                    <div className="glass-card p-8 rounded-[2.5rem] border-white/10 bg-white/5">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Critical Alerts</h3>
                        <div className="space-y-3">
                            {(planningData?.timeline || []).filter(t => t.priority === 'High' && t.status !== 'Completed').length > 0 ? (
                                (planningData?.timeline || []).filter(t => t.priority === 'High' && t.status !== 'Completed').slice(0, 2).map((t, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <span className="text-red-400 animate-pulse">⚠️</span>
                                        <p className="text-[10px] font-bold text-white uppercase">{t.task}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                    <span className="text-green-400">✅</span>
                                    <p className="text-[10px] font-bold text-white uppercase">All Critical Tasks Secured</p>
                                </div>
                            )}
                            {(!event?.selectedVendors || Object.keys(event?.selectedVendors || {}).length === 0) && (
                                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                    <span className="text-yellow-400">⚡</span>
                                    <p className="text-[10px] font-bold text-white uppercase">Vendor Confirmation Pending</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Operations Feed */}
                    <div className="glass-card p-8 rounded-[2.5rem] border-white/10 bg-white/5">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Operations Feed</h3>
                        <p className="text-white font-bold text-sm leading-relaxed">
                            Deploying resources for <span className="text-accent">{event?.name || "Event"}</span>.
                            The system has calibrated <span className="text-primary">{planningData?.timeline?.length || 0} milestones</span> and
                            allocated <span className="text-purple-500">₹{(event?.budget || 0).toLocaleString()}</span> for execution.
                        </p>
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                {nodes.length} Spatial Node{nodes.length !== 1 ? 's' : ''} Deployed
                            </p>
                        </div>
                    </div>

                    {/* Global Broadcast */}
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm">📣</div>
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Global Broadcast</h3>
                        </div>
                        <form onSubmit={handleBroadcast} className="flex gap-2">
                            <input
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white focus:border-orange-500 outline-none"
                                placeholder="Alert all attendees..."
                                value={announcement.text}
                                onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                            />
                            <button type="submit" className="px-4 py-2 bg-orange-500 text-white font-black rounded-xl text-[10px] uppercase">Send</button>
                        </form>
                        {announcementStatus.message && (
                            <p className={`text-[10px] mt-2 font-bold ${announcementStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {announcementStatus.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── TIMELINE + RESOURCES ──────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* Timeline */}
                    <div className="lg:col-span-2 glass-card p-10 rounded-[3rem] border-white/10 bg-white/5">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Milestone Timeline</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Real-time Operational Sync</p>
                            </div>
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-widest">
                                {(planningData?.timeline || []).filter(t => t.status === 'Completed').length} / {planningData?.timeline?.length || 0} COMPLETED
                            </span>
                        </div>
                        <div className="space-y-8">
                            {(planningData?.timeline || []).map((item, index) => (
                                <div key={index} className="flex gap-6 relative group">
                                    <div className="flex flex-col items-center">
                                        <div
                                            onClick={() => updateTaskStatus(index, item?.status === 'Completed' ? 'Pending' : 'Completed')}
                                            className={`w-6 h-6 rounded-full border-4 cursor-pointer transition-all z-10 ${item?.status === 'Completed' ? 'bg-accent border-accent/20 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-[#050505] border-white/10 hover:border-primary'}`}
                                        />
                                        {index !== (planningData?.timeline?.length || 0) - 1 && (
                                            <div className="w-[1px] h-full absolute top-6 left-[11px] bg-white/5" />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className={`font-bold text-lg leading-tight uppercase ${item?.status === 'Completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                    {item?.task || "Untitled Task"}
                                                </h3>
                                                <div className="flex gap-4 mt-1">
                                                    <p className="text-[10px] font-mono text-gray-500 uppercase">Deadline: {item?.deadline}</p>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest ${item?.priority === 'High' ? 'text-red-500' : 'text-gray-600'}`}>Priority: {item?.priority}</span>
                                                </div>
                                            </div>
                                            {item?.priority === 'High' && item?.status !== 'Completed' && (
                                                <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black rounded uppercase animate-pulse">Critical</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resource + Budget columns */}
                    <div className="space-y-8">
                        <div className="glass-card p-10 rounded-[3rem] border-white/10 bg-white/5">
                            <h2 className="text-xl font-black uppercase tracking-tighter mb-8 italic">Resource Model</h2>
                            <div className="space-y-4">
                                {(planningData?.resources || []).map((res, i) => (
                                    <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center hover:bg-white/10 transition-all">
                                        <div>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{res.resource}</p>
                                            <p className="text-2xl font-black text-white">{res.quantity} <span className="text-[10px] font-medium text-gray-500 uppercase">{res.unit}</span></p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            {res.resource?.includes('Staff') ? '👥' : res.resource?.includes('Food') ? '🍱' : '📦'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-10 rounded-[3rem] border-white/10 bg-white/5">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black uppercase tracking-tighter italic">Budget Allocation</h2>
                                <span className="text-accent font-black text-sm">₹{(event?.budget || 0).toLocaleString()}</span>
                            </div>
                            <div className="space-y-6">
                                {(planningData?.budget || []).map((item, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
                                            <span>{item.category}</span>
                                            <span className="text-white">{(item.percentage || 0).toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${item.percentage || 0}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* ADMIN: SPATIAL NODE CONFIGURATION CONSOLE          */}
                {/* ═══════════════════════════════════════════════════ */}
                <div className="glass-card p-12 rounded-[4rem] border-white/10 bg-white/5 mb-16">

                    {/* Header row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                        <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3 block">⚙️ Admin Mode — Spatial Node Configuration</span>
                            <h2 className="text-4xl font-black uppercase tracking-tighter">Indoor Navigation Nodes</h2>
                            <p className="text-gray-500 text-sm mt-2 max-w-xl">
                                Deploy spatial anchors on the field map. Each node becomes a step in the guest AR navigation experience.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
                            <button
                                onClick={() => navigate(`/ar/${id}`)}
                                disabled={nodes.length === 0}
                                className={`px-8 py-4 font-black rounded-2xl uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-sm ${nodes.length > 0 ? 'bg-white text-black hover:bg-primary hover:text-white shadow-xl' : 'bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed'}`}
                            >
                                🚀 Launch Guest AR
                            </button>
                            <button
                                onClick={() => setShowQR(q => !q)}
                                className="px-8 py-4 font-black rounded-2xl uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-sm bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20"
                            >
                                📱 {showQR ? 'Hide' : 'Show'} QR Code
                            </button>
                        </div>
                    </div>

                    {/* QR Code + Public Link Panel */}
                    {showQR && (
                        <div className="mb-12 p-8 rounded-[2.5rem] bg-white/5 border border-purple-500/20 flex flex-col md:flex-row items-center gap-10">
                            <div className="p-4 bg-white rounded-2xl">
                                <QRCodeSVG value={guestARUrl} size={160} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Guest AR Public Access Link</p>
                                <p className="text-xl font-mono font-black text-white break-all mb-4">{guestARUrl}</p>
                                <p className="text-gray-500 text-sm mb-4">Share this link or QR code with guests for no-login indoor navigation access.</p>
                                <button
                                    onClick={() => navigator.clipboard.writeText(guestARUrl)}
                                    className="px-6 py-3 bg-purple-500 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-purple-600 transition-all"
                                >
                                    📋 Copy Link
                                </button>
                            </div>
                        </div>
                    )}

                    {nodes.length === 0 && (
                        <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-center">
                            <p className="text-orange-400 text-xs font-black uppercase tracking-widest animate-pulse">
                                ⚠️ No nodes deployed — guests cannot access AR navigation until at least one node is configured.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* LEFT: Node form + deployed list */}
                        <div className="space-y-8">

                            {/* Node Input Form */}
                            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Configure New Node</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Node ID */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Node ID *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. entrance, stage-a, exit-1"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:border-primary outline-none text-white font-bold"
                                            value={newNode.nodeId}
                                            onChange={(e) => setNewNode({ ...newNode, nodeId: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        />
                                    </div>
                                    {/* Anchor Type */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Anchor Class *</label>
                                        <select
                                            className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:border-primary outline-none text-white font-bold appearance-none cursor-pointer"
                                            value={newNode.anchorType}
                                            onChange={(e) => setNewNode({ ...newNode, anchorType: e.target.value })}
                                        >
                                            <option value="Entrance">🚪 Entrance</option>
                                            <option value="Stage">🎭 Stage / Main Area</option>
                                            <option value="Restroom">🚻 Restroom / Service Point</option>
                                            <option value="Exit">🏃 Emergency Exit</option>
                                            <option value="HelpDesk">ℹ️ Information Hub</option>
                                            <option value="Other">📍 Custom Anchor</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Navigation Instructions</label>
                                    <textarea
                                        placeholder="e.g. Walk straight from the main gate, turn left at the fountain..."
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:border-primary outline-none h-28 text-white font-medium leading-relaxed"
                                        value={newNode.instructions}
                                        onChange={(e) => setNewNode({ ...newNode, instructions: e.target.value })}
                                    />
                                </div>

                                {/* GPS Lock Status */}
                                <div className={`p-5 rounded-2xl flex items-center justify-between border ${newNode.latitude ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                    <div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${newNode.latitude ? 'text-green-400' : 'text-red-400'}`}>
                                            {newNode.latitude ? '🔒 GPS Coordinates Locked' : '📍 Click Map to Lock GPS'}
                                        </p>
                                        <p className="font-mono text-xs text-white">
                                            {newNode.latitude ? `${newNode.latitude.toFixed(6)}, ${newNode.longitude.toFixed(6)}` : "AWAITING GPS PIN..."}
                                        </p>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${newNode.latitude ? 'bg-green-400 animate-pulse shadow-[0_0_15px_#4ade80]' : 'bg-red-500 shadow-[0_0_15px_#ef4444]'}`} />
                                </div>

                                {/* Error */}
                                {nodeError && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-red-400 text-xs font-bold">{nodeError}</p>
                                    </div>
                                )}

                                {/* Deploy Button */}
                                <button
                                    onClick={deployNode}
                                    disabled={nodeDeploying}
                                    className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
                                >
                                    {nodeDeploying ? '⏳ Deploying...' : '📡 Deploy Node to Map'}
                                </button>
                            </div>

                            {/* Deployed Nodes List */}
                            <div>
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex justify-between">
                                    <span>Active Spatial Nodes</span>
                                    <span className="text-primary font-mono">{nodes.length} DEPLOYED</span>
                                </h3>
                                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                                    {nodes.map((node, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl group-hover:bg-primary/20 transition-all">
                                                    {anchorIcon(node?.anchorType)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white uppercase">{node?.nodeId || "Node"}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">
                                                        {node?.anchorType} · {node?.latitude?.toFixed(4)}, {node?.longitude?.toFixed(4)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteNode(node.nodeId)}
                                                className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {nodes.length === 0 && (
                                        <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem]">
                                            <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.4em]">No Nodes Deployed</p>
                                            <p className="text-gray-800 text-[8px] uppercase mt-1">Click map to begin</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Map */}
                        <div className="h-[700px] sticky top-12 rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative">
                            <MapContainer center={mapCenter} zoom={17} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="map-tiles-dark" />
                                <LocationPicker onLocationSelect={(latlng) => setNewNode({ ...newNode, latitude: latlng.lat, longitude: latlng.lng })} />
                                <RecenterMap center={mapCenter} />

                                {/* Venue marker (blue) */}
                                {event.location?.lat && (
                                    <Marker position={[event.location.lat, event.location.lng]} icon={L.divIcon({
                                        className: '',
                                        html: `<div style='background:#3b82f6;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 20px rgba(59,130,246,0.8);'></div>`,
                                        iconSize: [18, 18], iconAnchor: [9, 9]
                                    })}>
                                        <Popup><strong>{event.venue || 'Venue'}</strong><br />Main venue location</Popup>
                                    </Marker>
                                )}

                                {/* Deployed nodes (green) */}
                                {nodes.map((node, i) => (
                                    node.latitude && (
                                        <Marker key={i} position={[node.latitude, node.longitude]} icon={L.divIcon({
                                            className: '',
                                            html: `<div style='background:#10b981;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 15px rgba(16,185,129,0.7);'></div>`,
                                            iconSize: [14, 14], iconAnchor: [7, 7]
                                        })}>
                                            <Popup>
                                                <strong>{anchorIcon(node.anchorType)} {node.nodeId}</strong><br />
                                                {node.anchorType}<br />
                                                {node.instructions && <em>{node.instructions}</em>}
                                            </Popup>
                                        </Marker>
                                    )
                                ))}

                                {/* Pending (preview) node (red) */}
                                {newNode.latitude && (
                                    <Marker position={[newNode.latitude, newNode.longitude]} icon={L.divIcon({
                                        className: '',
                                        html: `<div style='background:#ef4444;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 20px rgba(239,68,68,0.7);animation:pulse 1s infinite;'></div>`,
                                        iconSize: [16, 16], iconAnchor: [8, 8]
                                    })}>
                                        <Popup>📍 Pending node — complete form and deploy</Popup>
                                    </Marker>
                                )}
                            </MapContainer>

                            {/* Map legend */}
                            <div className="absolute bottom-4 left-4 right-4 z-[1000] flex gap-3">
                                <div className="glass-card px-4 py-2 rounded-full border-white/10 backdrop-blur-2xl flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Venue</p>
                                </div>
                                <div className="glass-card px-4 py-2 rounded-full border-white/10 backdrop-blur-2xl flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Deployed</p>
                                </div>
                                <div className="glass-card px-4 py-2 rounded-full border-white/10 backdrop-blur-2xl flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Pending</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── FOOTER NAV ────────────────────────────────────── */}
                <div className="flex flex-wrap justify-between items-center gap-8 mb-20 p-10 bg-white/5 border border-white/10 rounded-[3rem]">
                    <div className="flex flex-wrap gap-4">
                        <button onClick={() => navigate("/dashboard")} className="px-8 py-4 border border-white/5 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Operations</button>
                        <button onClick={() => navigate(`/participants/${id}`)} className="px-8 py-4 border border-white/5 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Guest Roster</button>
                        <button onClick={() => navigate(`/services/${id}`)} className="px-8 py-4 border border-white/5 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Services</button>
                        <button onClick={() => navigate(`/ar/${id}`)} className="px-8 py-4 border border-green-500/20 bg-green-500/10 text-green-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all">Guest AR View</button>
                    </div>
                    <div className="flex items-center gap-6">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Protocol V1.0.0</p>
                        <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 10px; }
                .map-tiles-dark { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
                .leaflet-popup-content-wrapper { background: #111; color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
                .leaflet-popup-tip { background: #111; }
                @keyframes pulse {
                    0%,100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.3); opacity: 0.7; }
                }
            ` }} />
        </div>
    );
}

export default EventPlan;
