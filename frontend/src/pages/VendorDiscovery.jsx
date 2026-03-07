import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api";

// ──────────────────────────────────────────────
// Haversine formula (client-side mirror of backend)
// ──────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Composite trust score: 60% rating + 40% proximity (closer = higher)
function trustScore(vendor) {
    const ratingPart = ((vendor.rating || 0) / 5) * 60;
    const dist = vendor.distance ?? 999;
    const proximityPart = Math.max(0, 40 - (dist / 50) * 40);
    return ratingPart + proximityPart;
}

// ──────────────────────────────────────────────
// Custom Leaflet icons
// ──────────────────────────────────────────────
const venueIcon = L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;background:#06b6d4;border-radius:50%;border:3px solid white;
    box-shadow:0 0 18px rgba(6,182,212,0.9),0 0 36px rgba(6,182,212,0.4);animation:venuePulse 1.5s infinite;"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

function vendorIcon(selected) {
    const color = selected ? "#f97316" : "#f59e0b";
    const glow = selected
        ? "0 0 20px rgba(249,115,22,0.9)"
        : "0 0 12px rgba(245,158,11,0.6)";
    return L.divIcon({
        className: "",
        html: `<div style="width:13px;height:13px;background:${color};border-radius:50%;border:2px solid white;
      box-shadow:${glow};transition:all 0.3s;"></div>`,
        iconSize: [13, 13],
        iconAnchor: [6, 6],
    });
}

// ──────────────────────────────────────────────
// Map auto-fit bounds
// ──────────────────────────────────────────────
function FitBounds({ venue, vendors }) {
    const map = useMap();
    useEffect(() => {
        const points = [];
        if (venue) points.push([venue.lat, venue.lng]);
        vendors.forEach((v) => {
            if (v.location?.lat && v.location?.lng)
                points.push([v.location.lat, v.location.lng]);
        });
        if (points.length > 1) {
            map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
        } else if (points.length === 1) {
            map.setView(points[0], 14);
        }
    }, [venue, vendors, map]);
    return null;
}

// ──────────────────────────────────────────────
// Category tags per type
// ──────────────────────────────────────────────
const CATEGORY_TAGS = {
    Photography: ["Candid", "Cinematic", "Pre-Wedding", "Drone Shots"],
    Catering: ["Buffet", "Live Counters", "Veg & Non-Veg", "Sadya Special"],
    "Music/DJ": ["Live Band", "DJ Setup", "Sound System", "LED Wall"],
    Decoration: ["Floral Arch", "Theme Decor", "Stage Design", "Lighting"],
    Venue: ["AC Hall", "Outdoor Lawn", "Banquet", "Rooftop"],
    "Tech Support": ["Live Streaming", "LED Screens", "PA System", "AV Tech"],
    default: ["Premium Service", "Verified Local", "Event Specialist"],
};

function getTagsForVendor(vendor) {
    const tags =
        CATEGORY_TAGS[vendor.category] || CATEGORY_TAGS["default"];
    // Deterministically pick 2 tags based on vendor name length
    const offset = (vendor.name?.length || 0) % tags.length;
    return [tags[offset], tags[(offset + 1) % tags.length]];
}

// ──────────────────────────────────────────────
// Skeleton Card
// ──────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-3 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-white/10 rounded-full" />
                <div className="h-4 w-16 bg-cyan-500/20 rounded-full" />
            </div>
            <div className="h-6 w-40 bg-white/10 rounded-lg" />
            <div className="h-3 w-full bg-white/5 rounded" />
            <div className="h-3 w-3/4 bg-white/5 rounded" />
            <div className="flex gap-2 mt-2">
                <div className="h-5 w-20 bg-white/10 rounded-full" />
                <div className="h-5 w-20 bg-white/10 rounded-full" />
            </div>
            <div className="h-9 w-full bg-cyan-500/10 rounded-xl mt-4" />
        </div>
    );
}

// ──────────────────────────────────────────────
// Star Rating
// ──────────────────────────────────────────────
function StarRating({ rating }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <span
                    key={n}
                    className={`text-xs ${n <= Math.round(rating) ? "text-amber-400" : "text-white/15"
                        }`}
                >
                    ★
                </span>
            ))}
            <span className="text-[10px] font-black text-white/50 ml-1">
                {(rating || 0).toFixed(1)}
            </span>
        </div>
    );
}

// ──────────────────────────────────────────────
// Vendor Card
// ──────────────────────────────────────────────
function VendorCard({ vendor, selected, onSelect, onNavigate, index }) {
    const isVerified = (vendor.rating || 0) >= 4.5;
    const tags = getTagsForVendor(vendor);
    const score = trustScore(vendor).toFixed(0);
    const distText =
        vendor.distance != null && vendor.distance !== Infinity
            ? `${vendor.distance.toFixed(1)} km away`
            : "Distance N/A";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
            whileHover={{ scale: 1.012, y: -2 }}
            className={`relative rounded-2xl border p-5 cursor-pointer transition-all duration-300 ${selected
                    ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                    : "bg-white/5 border-white/8 hover:border-white/20 hover:bg-white/8"
                }`}
            onClick={() => onSelect(vendor)}
        >
            {/* Trust Score Badge */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                    Trust
                </span>
                <span
                    className={`text-lg font-black ${score >= 80
                            ? "text-cyan-400"
                            : score >= 60
                                ? "text-amber-400"
                                : "text-white/40"
                        }`}
                >
                    {score}
                </span>
            </div>

            {/* Category + Verified */}
            <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/10 text-white/60 border border-white/10">
                    {vendor.category || "Vendor"}
                </span>
                {isVerified && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                    >
                        ✓ Verified
                    </motion.span>
                )}
                {selected && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-cyan-500 text-black border border-cyan-500"
                    >
                        ✓ Selected
                    </motion.span>
                )}
            </div>

            {/* Name */}
            <h3 className="text-base font-black text-white leading-tight mb-1 pr-12">
                {vendor.name}
            </h3>

            {/* Star Rating */}
            <StarRating rating={vendor.rating || 0} />

            {/* Distance */}
            <div className="flex items-center gap-1.5 mt-2">
                <span className="text-cyan-400 text-xs">📍</span>
                <span className="text-[11px] font-bold text-cyan-300">{distText}</span>
                {vendor.reliabilityScore && (
                    <>
                        <span className="text-white/20 mx-1">·</span>
                        <span className="text-[10px] font-black text-emerald-400">
                            REL {vendor.reliabilityScore}%
                        </span>
                    </>
                )}
            </div>

            {/* Tags */}
            <div className="flex gap-2 flex-wrap mt-3">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide bg-white/5 text-white/50 border border-white/8"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* Price */}
            {vendor.price != null && (
                <p className="text-xs text-white/30 font-bold mt-2">
                    Starts ₹{vendor.price.toLocaleString()}
                </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(vendor);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${selected
                            ? "bg-cyan-500 text-black"
                            : "bg-white/10 text-white hover:bg-cyan-500 hover:text-black border border-white/10"
                        }`}
                >
                    {selected ? "✓ Selected" : "Select"}
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(vendor);
                    }}
                    className="px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-all"
                >
                    🗺
                </motion.button>
            </div>
        </motion.div>
    );
}

// ──────────────────────────────────────────────
// Zero State
// ──────────────────────────────────────────────
function ZeroState({ category, onReset }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full py-20 text-center"
        >
            <div className="text-6xl mb-4 opacity-30">🔍</div>
            <p className="text-xl font-black text-white/30 mb-2">No Vendors Found</p>
            <p className="text-sm text-white/20 mb-6 max-w-xs">
                No{category ? ` ${category}` : ""} vendors are currently registered near
                your venue. Try a different category or remove filters.
            </p>
            <button
                onClick={onReset}
                className="px-6 py-3 rounded-xl bg-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all border border-white/10"
            >
                Reset Filters
            </button>
        </motion.div>
    );
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export default function VendorDiscovery({ venueLat, venueLng, venueName, onVendorsSelected, standalone }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Venue coords — from props OR url params
    const [venue, setVenue] = useState(() => {
        const lat = venueLat || parseFloat(searchParams.get("lat"));
        const lng = venueLng || parseFloat(searchParams.get("lng"));
        const name = venueName || searchParams.get("venue") || "Event Venue";
        if (lat && lng) return { lat, lng, name };
        return null;
    });

    const categories = ["All", "Photography", "Catering", "Music/DJ", "Decoration", "Venue", "Tech Support"];
    const [activeCategory, setActiveCategory] = useState("All");
    const [rawVendors, setRawVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVendors, setSelectedVendors] = useState({});
    const [hoveredVendor, setHoveredVendor] = useState(null);
    const [sortMode, setSortMode] = useState("trust"); // trust | rating | distance | price
    const listRef = useRef(null);

    // ── Fetch vendors from backend ──────────────────
    const fetchVendors = useCallback(async () => {
        setLoading(true);
        try {
            const params = { sort: "rating" };
            if (activeCategory !== "All") params.category = activeCategory;
            if (venue?.lat && venue?.lng) {
                params.lat = venue.lat;
                params.lng = venue.lng;
            }
            const { data } = await api.get("/vendors", { params });
            const enriched = (Array.isArray(data) ? data : []).map((v) => ({
                ...v,
                distance:
                    venue?.lat && venue?.lng && v.location?.lat && v.location?.lng
                        ? haversine(venue.lat, venue.lng, v.location.lat, v.location.lng)
                        : null,
            }));
            setRawVendors(enriched);
        } catch (err) {
            console.error("Failed to load vendors:", err);
            setRawVendors([]);
        } finally {
            setLoading(false);
        }
    }, [activeCategory, venue]);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    // ── Sort vendors ──────────────────────────────
    const sortedVendors = [...rawVendors].sort((a, b) => {
        if (sortMode === "trust") return trustScore(b) - trustScore(a);
        if (sortMode === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortMode === "distance")
            return (a.distance ?? 9999) - (b.distance ?? 9999);
        if (sortMode === "price") return (a.price || 0) - (b.price || 0);
        return 0;
    });

    // ── Selection toggle ──────────────────────────
    const toggleSelect = (vendor) => {
        setSelectedVendors((prev) => {
            const updated = { ...prev };
            if (updated[vendor._id]) {
                delete updated[vendor._id];
            } else {
                updated[vendor._id] = vendor;
            }
            return updated;
        });
    };

    // ── Navigate to Google Maps ───────────────────
    const openGoogleMaps = (vendor) => {
        if (vendor.location?.lat && vendor.location?.lng) {
            window.open(
                `https://www.google.com/maps?q=${vendor.location.lat},${vendor.location.lng}&z=16`,
                "_blank"
            );
        } else {
            window.open(
                `https://www.google.com/maps/search/${encodeURIComponent(vendor.name)}`,
                "_blank"
            );
        }
    };

    // ── Confirm selection → parent wizard ────────
    const handleConfirm = () => {
        const selected = Object.values(selectedVendors);
        if (onVendorsSelected) {
            onVendorsSelected(selected);
        } else {
            // Standalone mode: store in localStorage and navigate back
            const existing = JSON.parse(localStorage.getItem("draftEvent") || "{}");
            const vendorMap = {};
            selected.forEach((v) => {
                vendorMap[v.category] = {
                    vendorId: v._id,
                    name: v.name,
                    price: v.price,
                    rating: v.rating,
                };
            });
            localStorage.setItem(
                "draftEvent",
                JSON.stringify({ ...existing, selectedVendors: vendorMap })
            );
            navigate("/create-event");
        }
    };

    const selectedCount = Object.keys(selectedVendors).length;

    // Map center fallback
    const mapCenter = venue
        ? [venue.lat, venue.lng]
        : [10.8505, 76.2711]; // Kerala centroid

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                background: "linear-gradient(135deg, #0f172a 0%, #0c1a2e 50%, #0f172a 100%)",
                fontFamily: "'Inter', sans-serif",
            }}
        >
            {/* ── Global CSS injections ── */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        .map-tiles-dark { filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(88%); }
        .leaflet-popup-content-wrapper { background: #0f172a !important; color: #fff !important; border: 1px solid rgba(6,182,212,0.3) !important; border-radius: 12px !important; }
        .leaflet-popup-tip { background: #0f172a !important; }
        @keyframes venuePulse { 0%,100%{box-shadow:0 0 18px rgba(6,182,212,0.9),0 0 36px rgba(6,182,212,0.4)} 50%{box-shadow:0 0 30px rgba(6,182,212,1),0 0 60px rgba(6,182,212,0.6)} }
      `}</style>

            {/* ── Top Nav ── */}
            <header
                className="sticky top-0 z-50 px-6 py-4 border-b"
                style={{
                    background: "rgba(15,23,42,0.85)",
                    borderColor: "rgba(6,182,212,0.15)",
                    backdropFilter: "blur(20px)",
                }}
            >
                <div className="max-w-screen-xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-white/40 hover:text-white transition-colors text-sm font-bold"
                        >
                            ← Back
                        </button>
                        <span className="text-white/20">|</span>
                        <div>
                            <h1
                                className="font-black text-lg tracking-tight"
                                style={{ color: "#06b6d4" }}
                            >
                                Live Vendor Discovery
                            </h1>
                            {venue && (
                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                                    📍 {venue.name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                            style={{
                                background: "rgba(6,182,212,0.1)",
                                borderColor: "rgba(6,182,212,0.3)",
                                color: "#06b6d4",
                            }}
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                style={{ background: "#06b6d4" }}
                            />
                            Live
                        </div>
                        <AnimatePresence>
                            {selectedCount > 0 && (
                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleConfirm}
                                    className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-black transition-all"
                                    style={{
                                        background: "linear-gradient(135deg, #06b6d4, #0284c7)",
                                        boxShadow: "0 0 20px rgba(6,182,212,0.4)",
                                    }}
                                >
                                    Confirm {selectedCount} Vendor{selectedCount > 1 ? "s" : ""} →
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* ── Filters ── */}
            <div
                className="px-6 py-4 border-b"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
                <div className="max-w-screen-xl mx-auto flex flex-wrap items-center gap-3">
                    {/* Category pills */}
                    <div className="flex gap-2 flex-wrap">
                        {categories.map((cat) => (
                            <motion.button
                                key={cat}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveCategory(cat)}
                                className="px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all"
                                style={
                                    activeCategory === cat
                                        ? {
                                            background: "#06b6d4",
                                            color: "#0f172a",
                                            boxShadow: "0 0 15px rgba(6,182,212,0.4)",
                                        }
                                        : {
                                            background: "rgba(255,255,255,0.05)",
                                            color: "rgba(255,255,255,0.4)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                        }
                                }
                            >
                                {cat}
                            </motion.button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Sort</span>
                        <select
                            value={sortMode}
                            onChange={(e) => setSortMode(e.target.value)}
                            className="text-[11px] font-black uppercase bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/60 outline-none cursor-pointer"
                        >
                            <option value="trust" className="bg-[#0f172a]">Trust Score</option>
                            <option value="rating" className="bg-[#0f172a]">Rating</option>
                            <option value="distance" className="bg-[#0f172a]">Nearest</option>
                            <option value="price" className="bg-[#0f172a]">Price ↑</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Main Split Layout ── */}
            <div className="flex-1 flex overflow-hidden max-w-screen-xl mx-auto w-full">

                {/* ── LEFT: Vendor List ── */}
                <div
                    ref={listRef}
                    className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 overflow-y-auto p-5 space-y-3"
                    style={{ maxHeight: "calc(100vh - 140px)" }}
                >
                    {/* Result count */}
                    <div className="flex items-center justify-between px-1 mb-1">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                            {loading ? "Loading..." : `${sortedVendors.length} vendors`}
                        </p>
                        {selectedCount > 0 && (
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                                {selectedCount} selected
                            </p>
                        )}
                    </div>

                    {/* Skeleton */}
                    {loading &&
                        Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}

                    {/* Zero state */}
                    {!loading && sortedVendors.length === 0 && (
                        <ZeroState
                            category={activeCategory !== "All" ? activeCategory : ""}
                            onReset={() => setActiveCategory("All")}
                        />
                    )}

                    {/* Vendor cards */}
                    <AnimatePresence mode="popLayout">
                        {!loading &&
                            sortedVendors.map((vendor, idx) => (
                                <div
                                    key={vendor._id}
                                    onMouseEnter={() => setHoveredVendor(vendor._id)}
                                    onMouseLeave={() => setHoveredVendor(null)}
                                >
                                    <VendorCard
                                        vendor={vendor}
                                        selected={!!selectedVendors[vendor._id]}
                                        onSelect={toggleSelect}
                                        onNavigate={openGoogleMaps}
                                        index={idx}
                                    />
                                </div>
                            ))}
                    </AnimatePresence>

                    {/* Bottom padding */}
                    <div className="h-8" />
                </div>

                {/* ── RIGHT: Map ── */}
                <div className="hidden lg:flex flex-1 relative" style={{ minHeight: 0 }}>
                    {/* Map legends */}
                    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                        {[
                            { color: "#06b6d4", label: "Venue", pulse: true },
                            { color: "#f97316", label: "Selected" },
                            { color: "#f59e0b", label: "Vendor" },
                        ].map(({ color, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl border text-[10px] font-black uppercase tracking-widest text-white"
                                style={{ background: "rgba(15,23,42,0.8)", borderColor: "rgba(255,255,255,0.1)" }}
                            >
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Vendor count overlay */}
                    <div
                        className="absolute bottom-6 left-6 z-[1000] px-5 py-3 rounded-2xl backdrop-blur-xl border"
                        style={{ background: "rgba(15,23,42,0.85)", borderColor: "rgba(6,182,212,0.2)" }}
                    >
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                            Plotted on map
                        </p>
                        <p className="text-2xl font-black" style={{ color: "#06b6d4" }}>
                            {sortedVendors.filter((v) => v.location?.lat).length}
                        </p>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest">vendors</p>
                    </div>

                    <MapContainer
                        center={mapCenter}
                        zoom={12}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            className="map-tiles-dark"
                        />

                        {/* Venue marker */}
                        {venue?.lat && (
                            <Marker position={[venue.lat, venue.lng]} icon={venueIcon}>
                                <Popup>
                                    <strong style={{ color: "#06b6d4" }}>📍 {venue.name}</strong>
                                    <br />
                                    <span style={{ color: "#aaa", fontSize: 11 }}>Your event venue</span>
                                </Popup>
                            </Marker>
                        )}

                        {/* Vendor markers */}
                        {sortedVendors.map((v) =>
                            v.location?.lat && v.location?.lng ? (
                                <Marker
                                    key={v._id}
                                    position={[v.location.lat, v.location.lng]}
                                    icon={vendorIcon(!!selectedVendors[v._id] || hoveredVendor === v._id)}
                                >
                                    <Popup>
                                        <strong style={{ color: "#f59e0b" }}>{v.name}</strong>
                                        <br />
                                        <span style={{ color: "#aaa", fontSize: 10 }}>{v.category}</span>
                                        <br />
                                        {v.rating && (
                                            <span style={{ color: "#06b6d4", fontSize: 11 }}>
                                                ★ {v.rating} · {v.distance?.toFixed(1)} km
                                            </span>
                                        )}
                                    </Popup>
                                </Marker>
                            ) : null
                        )}

                        <FitBounds venue={venue} vendors={sortedVendors} />
                    </MapContainer>
                </div>
            </div>

            {/* ── Mobile bottom CTA ── */}
            <AnimatePresence>
                {selectedCount > 0 && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4"
                        style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(6,182,212,0.2)" }}
                    >
                        <button
                            onClick={handleConfirm}
                            className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-black"
                            style={{
                                background: "linear-gradient(135deg, #06b6d4, #0284c7)",
                                boxShadow: "0 0 30px rgba(6,182,212,0.4)",
                            }}
                        >
                            Confirm {selectedCount} Vendor{selectedCount > 1 ? "s" : ""} →
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
