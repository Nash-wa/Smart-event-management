import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/createevent.css";
import api from "../api";

function CreateEvent() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Conference",
    mode: "Offline",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    address: "",
    capacity: "",
    budget: "",
    features: {
      registration: false,
      certificate: false,
      food: false,
      speakers: false,
      streaming: false,
      arScan: false,
      photography: false,
      music: false,
      decoration: false,
      invitations: false
    }
  });

  const handleNext = (e) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setStep(step - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Vendor State
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("");
  const [availableVendors, setAvailableVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState({}); // { 'Photography': { name: '...', price: 100 } }

  const handleVendorClick = async (category) => {
    setCurrentCategory(category);
    setShowVendorModal(true);
    try {
      const res = await api.get(`/vendors?category=${category}`);
      setAvailableVendors(res.data);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
    }
  }
};

const selectVendor = (vendor) => {
  setSelectedVendors({ ...selectedVendors, [vendor.category]: vendor });
  setShowVendorModal(false);

  // Also enable the feature flag
  const featureKey = vendor.category.toLowerCase().split('/')[0]; // simple mapping
  setFormData(prev => ({
    ...prev,
    features: { ...prev.features, [featureKey]: true }
  }));
};

const handleCheckboxChange = (e) => {
  const { name, checked } = e.target;
  setFormData({
    ...formData,
    features: { ...formData.features, [name]: checked }
  });
};

return (
  <div className="create-event-page">
    <div className="wizard-header">
      <h1 className="page-title">Create New Event {step === 3 ? "🚀" : "✨"}</h1>
      <p className="page-subtitle">Step {step} of 3 • {step === 1 ? "Basic Details" : step === 2 ? "Time & Place" : "Features"}</p>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className={`progress-step ${step >= 1 ? "active" : ""}`}>1</div>
        <div className={`progress-line ${step >= 2 ? "active" : ""}`}></div>
        <div className={`progress-step ${step >= 2 ? "active" : ""}`}>2</div>
        <div className={`progress-line ${step >= 3 ? "active" : ""}`}></div>
        <div className={`progress-step ${step >= 3 ? "active" : ""}`}>3</div>
      </div>
    </div>

    <form className="event-form-wizard">

      {/* STEP 1: Basic Info */}
      {step === 1 && (
        <div className="form-step slide-in">
          <h2>📌 Event Basics</h2>

          <div className="form-group">
            <label>Event Name</label>
            <input
              name="name"
              type="text"
              placeholder="Ex. Global Tech Summit 2026"
              value={formData.name}
              onChange={handleInputChange}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="What is this event about?"
              rows="4"
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option>Conference</option>
                <option>Wedding</option>
                <option>Birthday Party</option>
                <option>Corporate Event</option>
                <option>Concert</option>
                <option>Workshop</option>
                <option>Social Gathering</option>
                <option>Festival</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mode</label>
              <select name="mode" value={formData.mode} onChange={handleInputChange}>
                <option>Offline</option>
                <option>Online</option>
                <option>Hybrid</option>
              </select>
            </div>
          </div>

          <div className="wizard-actions right-align">
            <button className="btn-next" onClick={handleNext}>Next Step ➝</button>
          </div>
        </div>
      )}

      {/* STEP 2: Date & Location */}
      {step === 2 && (
        <div className="form-step slide-in">
          <h2>📅 Date & Location</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input name="startTime" type="time" value={formData.startTime} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input name="endTime" type="time" value={formData.endTime} onChange={handleInputChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Venue Name</label>
            <input name="venue" type="text" placeholder="Auditorium / Online Link" value={formData.venue} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Address / URL</label>
            <input name="address" type="text" placeholder="Full address" value={formData.address} onChange={handleInputChange} />
          </div>

          <div className="wizard-actions">
            <button className="btn-prev" onClick={handlePrev}>Back</button>
            <button className="btn-next" onClick={handleNext}>Next Step ➝</button>
          </div>
        </div>
      )}

      {/* STEP 3: Features & Budget */}
      {step === 3 && (
        <div className="form-step slide-in">
          <h2>💰 Capacity, Budget & Features</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Max Participants</label>
              <input name="capacity" type="number" placeholder="200" value={formData.capacity} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Budget (₹)</label>
              <input name="budget" type="number" placeholder="50000" value={formData.budget} onChange={handleInputChange} />
            </div>
          </div>

          <div className="features-section">
            <h3>✨ Customize Your Event</h3>
            <p className="text-sm text-gray-400 mb-4">Select service providers to add to your package.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Photography', 'Catering', 'Music/DJ', 'Decoration', 'Invitation'].map((cat) => (
                <div key={cat} className="p-4 border border-white/10 rounded-xl bg-white/5 flex justify-between items-center hover:bg-white/10 transition-colors">
                  <div>
                    <h4 className="font-semibold text-lg">{cat}</h4>
                    {selectedVendors[cat] ? (
                      <p className="text-green-400 text-sm">✅ {selectedVendors[cat].name} (₹{selectedVendors[cat].price})</p>
                    ) : (
                      <p className="text-gray-500 text-sm">Not selected</p>
                    )}
                  </div>
                  {selectedVendors[cat] ? (
                    <button
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                      onClick={(e) => {
                        e.preventDefault();
                        const newVendors = { ...selectedVendors };
                        delete newVendors[cat];
                        setSelectedVendors(newVendors);
                      }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-sm hover:bg-accent/30"
                      onClick={(e) => { e.preventDefault(); handleVendorClick(cat); }}
                    >
                      Browse {cat}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Other basic checkboxes */}
            <div className="checkbox-grid mt-6">
              <label className="custom-checkbox">
                <input type="checkbox" name="registration" checked={formData.features.registration} onChange={handleCheckboxChange} />
                <span className="checkmark"></span>
                Registration
              </label>
              <div className="glass-card p-4 rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold flex items-center gap-2">📱 AR Spatial Scan <span className="text-[10px] bg-accent px-2 rounded-full text-white">NEW</span></span>
                  {formData.features.arScan ? (
                    <span className="text-green-400 text-sm font-bold">✓ Scanned</span>
                  ) : (
                    <button
                      className="px-3 py-1 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200"
                      onClick={async (e) => {
                        e.preventDefault();
                        const btn = e.target;
                        btn.innerText = "Scanning Room...";

                        // Mock Scan
                        setTimeout(async () => {
                          try {
                            const res = await api.post("/spatial/save-scan", { coordinates: "10.5276, 76.2144 (Thrissur)" });
                            if (res.status === 200) {
                              setFormData(prev => ({ ...prev, features: { ...prev.features, arScan: true } }));
                              alert("Room scanned successfully! Dimensions saved.");
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Scan failed. Is backend running?");
                          }
                          btn.innerText = "Scan Area";
                        }, 2000);
                      }}
                    >
                      Scan Area
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400">Use camera to map venue dimensions automatically.</p>
              </div>
              <label className="custom-checkbox">
                <input type="checkbox" name="streaming" checked={formData.features.streaming} onChange={handleCheckboxChange} />
                <span className="checkmark"></span>
                Live Streaming
              </label>
            </div>
          </div>

          {/* Vendor Modal */}
          {showVendorModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Select {currentCategory}</h2>
                  <button onClick={() => setShowVendorModal(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {availableVendors.map((vendor) => (
                    <div key={vendor._id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center hover:bg-white/10 cursor-pointer" onClick={() => selectVendor(vendor)}>
                      <div>
                        <h3 className="font-bold text-lg">{vendor.name}</h3>
                        <p className="text-gray-400 text-sm">{vendor.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-yellow-400">★ {vendor.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-accent">₹{vendor.price}</p>
                        <button className="text-sm text-green-400 mt-1">Select →</button>
                      </div>
                    </div>
                  ))}
                  {availableVendors.length === 0 && <p className="text-center text-gray-500 py-8">No vendors found for this category.</p>}
                </div>
              </div>
            </div>
          )}

          <div className="wizard-actions">
            <button className="btn-prev" onClick={handlePrev}>Back</button>
            <button className="btn-submit" type="submit" onClick={async (e) => {
              e.preventDefault();
              try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo) {
                  alert("Please login first");
                  navigate("/login");
                  return;
                }

                const payload = {
                  ...formData,
                  selectedVendors
                };

                const response = await api.post('/events', payload);
                const data = response.data;

                if (response.status === 200) {
                  navigate(`/event-plan/${data._id}`);
                } else {
                  alert(data.message || "Failed to create event");
                }
              } catch (error) {
                console.error("Fetch error detail:", error);
                alert(`Connection error: ${error.message}. Make sure backend is running.`);
              }
            }}>
              🚀 Launch Event
            </button>
          </div>
        </div>
      )}

    </form>
  </div>
);
}

export default CreateEvent;
