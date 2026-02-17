import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/createevent.css";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const KERALA_DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod",
  "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad",
  "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
];

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
    district: "Thiruvananthapuram",
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
      ar: false,
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
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`http://127.0.0.1:5000/api/vendors?category=${category}`, {
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });
      const data = await res.json();
      setAvailableVendors(data);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
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

  const [venues, setVenues] = useState([]);
  const [mapCenter, setMapCenter] = useState([10.8505, 76.2711]); // Default Kerala
  const [zoom, setZoom] = useState(7);
  const mapRef = useRef();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/vendors?category=Venue&district=${formData.district}`);
        const data = await res.json();
        const sortedVenues = data.sort((a, b) => b.rating - a.rating);
        setVenues(sortedVenues);

        // Auto-select first venue if available
        if (sortedVenues.length > 0) {
          setFormData(prev => ({
            ...prev,
            venue: sortedVenues[0].name,
            address: sortedVenues[0].address || ""
          }));
        } else {
          setFormData(prev => ({ ...prev, venue: "", address: "" }));
        }
      } catch (error) {
        console.error("Failed to fetch venues", error);
      }
    };
    if (formData.district && step === 2) {
      fetchVenues();
    }
  }, [formData.district, step]);

  return (
    <div className="create-event-page">
      <div className="wizard-header text-center mb-12">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">New Event Deployment</h1>
        <p className="text-primary font-mono text-[10px] tracking-[0.3em] uppercase">Configuration Phase: {step} of 3 • {step === 1 ? "Strategic Objectives" : step === 2 ? "Logistics & Venue" : "Resource Allocation"}</p>

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
            <h2 className="text-xl font-bold mb-6 text-white/90">Section 01: Strategic Context</h2>

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
            <h2 className="text-xl font-bold mb-6 text-white/90">Section 02: Logistics & Environmental Data</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  onClick={(e) => e.target.showPicker()}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  onClick={(e) => e.target.showPicker()}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  onClick={(e) => e.target.showPicker()}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  onClick={(e) => e.target.showPicker()}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>District (Kerala)</label>
              <select name="district" value={formData.district} onChange={handleInputChange}>
                {KERALA_DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Venue (Sorted by Rating)</label>
              <select
                name="venue"
                value={formData.venue}
                onChange={(e) => {
                  const selectedVenue = venues.find(v => v.name === e.target.value);
                  setFormData({
                    ...formData,
                    venue: e.target.value,
                    address: selectedVenue ? selectedVenue.address : ""
                  });
                  if (selectedVenue && selectedVenue.location && selectedVenue.location.lat) {
                    const newCenter = [selectedVenue.location.lat, selectedVenue.location.lng];
                    setMapCenter(newCenter);
                    setZoom(15);
                    if (mapRef.current) {
                      mapRef.current.setView(newCenter, 15);
                    }
                  }
                }}
              >
                {venues.map(v => (
                  <option key={v._id} value={v.name}>
                    {v.name} (★ {v.rating})
                  </option>
                ))}
                {venues.length === 0 && <option value="">No venues found in this district</option>}
              </select>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                name="address"
                type="text"
                placeholder="Full address"
                value={formData.address}
                onChange={handleInputChange}
                readOnly
              />
            </div>

            {/* Map Section */}
            <div className="form-group slide-in" style={{ height: '300px', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <label style={{ marginBottom: '10px', display: 'block' }}>Venue Location Map</label>
              <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {formData.venue && mapCenter[0] !== 10.8505 && (
                  <Marker position={mapCenter}>
                    <Popup>
                      <strong>{formData.venue}</strong><br />
                      {formData.address}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
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
            <h2 className="text-xl font-bold mb-6 text-white/90">Section 03: Resource & Financial Controls</h2>

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

            <div className="features-section mt-8">
              <h3 className="text-lg font-bold mb-4">Operational Modules</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">Select primary service modules for this venture.</p>

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

                  const response = await fetch('http://127.0.0.1:5000/api/events', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${userInfo?.token}`
                    },
                    body: JSON.stringify(payload)
                  });

                  const data = await response.json();

                  if (response.ok) {
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
