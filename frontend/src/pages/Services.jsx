import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Services() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [sortBy, setSortBy] = useState("rating"); // new state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const res = await api.get(`/vendors?sort=${sortBy}`);
                setVendors(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching vendors:", error);
                setLoading(false);
            }
        };
        fetchVendors();
    }, [sortBy]); // Trigger on sort change

    const categories = ["Photography", "Catering", "Music/DJ", "Decoration", "Invitation", "Venue"];

    return (
        <div className="min-h-screen bg-black text-white p-6 pt-24">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass-card border-x-0 border-t-0 rounded-none px-6 py-4 left-0">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-sm font-bold">S</span>
                        </div>
                        <span className="text-lg font-bold">Services & Teams</span>
                    </div>
                    <button onClick={() => navigate("/dashboard")} className="text-sm text-gray-400 hover:text-white transition-colors">
                        Back to Dashboard
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Elite Partners</h1>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <p className="text-muted-foreground text-lg">Browse professional teams across all departments.</p>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
                            <span className="text-xs font-bold text-gray-500 px-2 uppercase">Sort By</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer"
                            >
                                <option value="rating" className="bg-black">Top Rated</option>
                                <option value="price_low" className="bg-black">Price: Low to High</option>
                                <option value="price_high" className="bg-black">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {categories.map((cat) => {
                            const catVendors = vendors.filter((v) => v.category === cat);
                            if (catVendors.length === 0) return null;

                            return (
                                <section key={cat}>
                                    <div className="flex items-center gap-4 mb-8">
                                        <h2 className="text-2xl font-bold">{cat} Teams</h2>
                                        <div className="h-px bg-white/10 flex-grow"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {catVendors.map((vendor) => (
                                            <div
                                                key={vendor._id}
                                                className="glass-card p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group flex flex-col"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                        {cat === "Photography" ? "📷" : cat === "Catering" ? "🍽️" : cat === "Music/DJ" ? "🎵" : cat === "Decoration" ? "✨" : cat === "Venue" ? "🏛️" : "💌"}
                                                    </div>
                                                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-400/10 text-yellow-500 text-sm font-bold">
                                                        ★ {vendor.rating || '5.0'}
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold mb-2">{vendor.name}</h3>
                                                <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3">
                                                    {vendor.description}
                                                </p>

                                                {/* Reviews Preview */}
                                                <div className="mb-4">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{vendor.reviews_count} Verified Reviews</p>
                                                </div>

                                                {/* Suggestions & External Data */}
                                                <div className="flex gap-2 mb-4">
                                                    {vendor.googleReviewsUrl && (
                                                        <a
                                                            href={vendor.googleReviewsUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-center"
                                                        >
                                                            🌐 Google Reviews
                                                        </a>
                                                    )}
                                                    {vendor.instagramUrl && (
                                                        <a
                                                            href={vendor.instagramUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex-1 p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-[10px] font-bold text-pink-400 hover:bg-pink-500 hover:text-white transition-all text-center"
                                                        >
                                                            📸 Instagram
                                                        </a>
                                                    )}
                                                </div>

                                                {/* Portfolio Preview */}
                                                {vendor.portfolio && vendor.portfolio.length > 0 && (
                                                    <button
                                                        onClick={() => setSelectedPortfolio(vendor)}
                                                        className="mb-8 w-full p-2 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/50 transition-all text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white flex items-center justify-center gap-2"
                                                    >
                                                        🖼️ View Portfolio ({vendor.portfolio.length} works)
                                                    </button>
                                                )}

                                                <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-4">
                                                    <div>
                                                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Starting From</span>
                                                        <p className="text-2xl font-bold text-accent">₹{vendor.price.toLocaleString()}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate("/create-event")}
                                                        className="bg-white text-black px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                                                    >
                                                        Book
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Portfolio Modal */}
            {selectedPortfolio && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedPortfolio(null)}></div>
                    <div className="relative glass-card max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-[40px] border-white/10 p-8 md:p-12 animate-fade-in-up">
                        <button
                            onClick={() => setSelectedPortfolio(null)}
                            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all text-xl"
                        >
                            ✕
                        </button>

                        <div className="mb-10 text-center">
                            <span className="text-accent font-bold uppercase tracking-[0.2em] text-[10px]">{selectedPortfolio.category} Masters</span>
                            <h2 className="text-4xl font-bold mt-2">{selectedPortfolio.name} Portfolio</h2>
                            <p className="text-gray-500 mt-2">A showcase of previous excellence and craftsmanship.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedPortfolio.portfolio.map((img, i) => (
                                <div key={i} className="group relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                    <img src={img} alt="Portfolio" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                        <p className="text-white font-medium text-sm">Previous Project #{i + 1}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 text-center border-t border-white/10 pt-8">
                            <button
                                onClick={() => navigate("/create-event")}
                                className="gradient-button px-10 py-4 h-auto text-lg font-bold"
                            >
                                Book {selectedPortfolio.name} Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="mt-20 py-12 border-t border-white/10 text-center text-muted-foreground">
                <p>© 2026 Smart Event Management. All vendor works verified.</p>
            </footer>
        </div>
    );
}

export default Services;
