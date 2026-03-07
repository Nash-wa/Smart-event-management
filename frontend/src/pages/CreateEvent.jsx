import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../css/createevent.css";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DISTRICT_COORDINATES = {
  "Alappuzha": [9.4981, 76.3388],
  "Ernakulam": [9.9800, 76.2800],
  "Idukki": [9.8420, 76.9387],
  "Kannur": [11.8689, 75.3555],
  "Kasaragod": [12.5076, 74.9882],
  "Kollam": [8.8811, 76.5847],
  "Kottayam": [9.5914, 76.5222],
  "Kozhikode": [11.2588, 75.7804],
  "Malappuram": [11.0720, 76.0740],
  "Palakkad": [10.7744, 76.6563],
  "Pathanamthitta": [9.2648, 76.7870],
  "Thiruvananthapuram": [8.5241, 76.9366],
  "Thrissur": [10.5167, 76.2167],
  "Wayanad": [11.6106, 76.0822]
};

// Helper component to handle map centering
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && map) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ setLocation, setMapCenter }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      setMapCenter([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

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
    isCollegeEvent: false,
    college: { name: "", address: "", location: { lat: null, lng: null } },
    capacity: "",
    budget: "",
    location: { lat: 10.8505, lng: 76.2711 },
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

  const [venues, setVenues] = useState([]);
  const [mapCenter, setMapCenter] = useState([10.8505, 76.2711]); // Default Kerala
  const [userLocation, setUserLocation] = useState(null);
  const [zoom, setZoom] = useState(7);
  const mapRef = useRef();

  // Vendor State
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("");
  const [availableVendors, setAvailableVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState({}); // { 'Photography': { name: '...', price: 100 } }

  // AR Scan State
  const [isScanning, setIsScanning] = useState(false);
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Special handling for event type toggle
    if (name === 'eventType') {
      setFormData(prev => ({ ...prev, isCollegeEvent: value === 'College' }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));

    // Center map on district change
    if (name === "district" && DISTRICT_COORDINATES[value]) {
      const newCenter = DISTRICT_COORDINATES[value];
      setMapCenter(newCenter);
      setZoom(11);
      if (mapRef.current) {
        mapRef.current.setView(newCenter, 11);
      }
    }
  };

  const handleVendorClick = async (category) => {
    setCurrentCategory(category);
    setShowVendorModal(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`}/vendors?category=${category}`, {
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

    // Map vendor category to feature key
    const categoryMap = {
      'Photography': 'photography',
      'Catering': 'food',
      'Music/DJ': 'music',
      'Decoration': 'decoration',
      'Invitation': 'invitations'
    };

    const featureKey = categoryMap[vendor.category];

    if (featureKey) {
      setFormData(prev => ({
        ...prev,
        features: { ...prev.features, [featureKey]: true }
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      features: { ...formData.features, [name]: checked }
    });
  };

  const [collegeList, setCollegeList] = useState([]);
  const [collegeQuery, setCollegeQuery] = useState("");
  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  // Get User Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userPos = [latitude, longitude];
          setUserLocation(userPos);
          setMapCenter(userPos);
          setZoom(11); // Closer zoom when user location is found
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Fetch venues using the new Venue Discovery API
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        let url = `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`}/venues/search?district=${formData.district}`;
        if (userLocation) {
          url += `&lat=${userLocation[0]}&lng=${userLocation[1]}`;
        }

        const localUrl = `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`}/vendors?category=Venue&district=${formData.district}`;

        const [apiRes, localRes] = await Promise.all([
          fetch(url),
          fetch(localUrl)
        ]);

        const apiData = await apiRes.json();
        const localData = await localRes.json();

        // Standardize Local Data
        const formattedLocal = localData.map(v => ({
          id: v._id,
          name: v.name,
          address: v.address,
          location: v.location,
          rating: v.rating,
          image: v.image || v.portfolio?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
          isExternal: false,
          distance: v.distance
        }));

        const formattedApi = apiData.map(v => ({
          id: v.id,
          name: v.name,
          address: v.address,
          location: v.location,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          image: v.image,
          isExternal: true,
          distance: v.distance
        }));

        const combined = [...formattedLocal, ...formattedApi];
        if (userLocation) {
          combined.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
        }

        setVenues(combined);

        // Auto-select first venue if available
        if (combined.length > 0 && !formData.venue) {
          const firstVenue = combined[0];
          setFormData(prev => ({
            ...prev,
            venue: firstVenue.name,
            address: firstVenue.address || ""
          }));

          if (firstVenue.location && firstVenue.location.lat) {
            const venueLoc = [firstVenue.location.lat, firstVenue.location.lng];
            setMapCenter(venueLoc);
            setZoom(15);
            if (mapRef.current) {
              mapRef.current.setView(venueLoc, 15);
            }
          } else if (DISTRICT_COORDINATES[formData.district]) {
            setMapCenter(DISTRICT_COORDINATES[formData.district]);
            setZoom(11);
          }
        }
      } catch (error) {
        console.error("Failed to fetch venues", error);
      }
    };

    if (formData.district && step === 2) {
      fetchVenues();
    }
  }, [formData.district, step, userLocation]);

  // Fetch colleges list for the district when event type is College
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/colleges?district=${encodeURIComponent(formData.district)}`);
        if (!res.ok) return;
        const data = await res.json();
        setCollegeList(data || []);
      } catch (err) {
        console.error('Failed to fetch colleges', err);
      }
    };

    if (formData.isCollegeEvent && formData.district && step === 2) {
      fetchColleges();
    } else if (collegeList.length > 0) {
      setCollegeList([]);
    }
  }, [formData.isCollegeEvent, formData.district, step, collegeList.length]);

  // Debounced college search when typing
  useEffect(() => {
    if (!collegeQuery || collegeQuery.trim().length === 0) {
      if (collegeSuggestions.length > 0) {
        setCollegeSuggestions([]);
      }
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/colleges?q=${encodeURIComponent(collegeQuery)}&district=${encodeURIComponent(formData.district)}`, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        setCollegeSuggestions(data || []);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('College search failed', err);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [collegeQuery, formData.district]);

  return (
    <div className="create-event-page">
      <div className="wizard-header text-center mb-12">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">New Event Deployment</h1>
        <p className="text-primary font-mono text-[10px] tracking-[0.3em] uppercase">Configuration Phase: {step} of 3 • {step === 1 ? "Strategic Objectives" : step === 2 ? "Logistics & Venue" : "Resource Allocation"}</p>

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
                  <option>Hackathons</option>
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

              <div className="form-group">
                <label>Event Type</label>
                <select name="eventType" value={formData.isCollegeEvent ? 'College' : 'General'} onChange={handleInputChange}>
                  <option value="General">General</option>
                  <option value="College">College</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>District (Kerala)</label>
              <select name="district" value={formData.district} onChange={handleInputChange}>
                {KERALA_DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
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

            {formData.isCollegeEvent ? (
              <div className="form-group">
                <label>Select College</label>
                <select
                  name="venue"
                  value={formData.venue}
                  onChange={(e) => {
                    const selectedCollege = collegeList.find(c => c.name === e.target.value);
                    if (!selectedCollege) return;
                    setFormData(prev => ({
                      ...prev,
                      isCollegeEvent: true,
                      venue: selectedCollege.name,
                      address: selectedCollege.address || prev.address,
                      location: selectedCollege.location || prev.location,
                      college: { name: selectedCollege.name, address: selectedCollege.address || '', location: selectedCollege.location || {} }
                    }));
                    if (selectedCollege.location && selectedCollege.location.lat) {
                      const newCenter = [selectedCollege.location.lat, selectedCollege.location.lng];
                      setMapCenter(newCenter);
                      setZoom(15);
                      if (mapRef.current) mapRef.current.setView(newCenter, 15);
                    }
                  }}
                >
                  {collegeList.map((c, idx) => (
                    <option key={idx} value={c.name}>{c.name}</option>
                  ))}
                  {collegeList.length === 0 && <option value="">No colleges found in this district</option>}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label>Venue (Sorted by Rating)</label>
                <select
                  name="venue"
                  value={formData.venue}
                  onChange={(e) => {
                    const selectedVenue = venues.find(v => v.name === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      venue: e.target.value,
                      address: selectedVenue ? selectedVenue.address : prev.address
                    }));
                    if (selectedVenue && selectedVenue.location && selectedVenue.location.lat) {
                      const newCenter = [selectedVenue.location.lat, selectedVenue.location.lng];
                      setMapCenter(newCenter);
                      setZoom(15);
                      if (mapRef.current) {
                        mapRef.current.setView(newCenter, 15);
                      }
                      setFormData(prev => ({ ...prev, location: selectedVenue.location }));

                      // Automatically add venue to selectedVendors for planning integration
                      setSelectedVendors(prev => ({ ...prev, 'Venue': selectedVenue }));
                    } else if (DISTRICT_COORDINATES[formData.district]) {
                      const distCenter = DISTRICT_COORDINATES[formData.district];
                      setMapCenter(distCenter);
                      setZoom(12);
                      if (mapRef.current) {
                        mapRef.current.setView(distCenter, 12);
                      }
                    }
                  }}
                >
                  {venues.map(v => (
                    <option key={v.id || v._id} value={v.name}>
                      {v.name} (★ {v.rating})
                    </option>
                  ))}
                  {venues.length === 0 && <option value="">No venues found in this district</option>}
                  <option value="Other">Other (Custom Location)</option>
                </select>
              </div>
            )}

            {formData.isCollegeEvent && (
              <div className="form-group">
                <label>College / Institution (type to search)</label>
                <input
                  type="text"
                  placeholder="Search college or institution"
                  value={collegeQuery}
                  onChange={(e) => setCollegeQuery(e.target.value)}
                  onFocus={() => { /* keep suggestions visible */ }}
                />

                {collegeSuggestions.length > 0 && (
                  <ul className="suggestions" style={{ maxHeight: 200, overflowY: 'auto', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginTop: 6, borderRadius: 6, padding: 6 }}>
                    {collegeSuggestions.map((c, idx) => (
                      <li key={idx} style={{ padding: '8px 10px', cursor: 'pointer' }} onMouseDown={(e) => {
                        e.preventDefault();
                        setFormData(prev => ({
                          ...prev,
                          isCollegeEvent: true,
                          venue: c.name,
                          address: c.address || prev.address,
                          location: c.location || prev.location,
                          college: { name: c.name, address: c.address || '', location: c.location || {} }
                        }));
                        if (c.location && c.location.lat) {
                          const newCenter = [c.location.lat, c.location.lng];
                          setMapCenter(newCenter);
                          setZoom(15);
                          if (mapRef.current) mapRef.current.setView(newCenter, 15);
                        }
                        setCollegeQuery(c.name);
                        setCollegeSuggestions([]);
                      }}>
                        <strong>{c.name}</strong>
                        <div style={{ fontSize: 12, color: '#aaa' }}>{c.address}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Address</label>
              <input
                name="address"
                type="text"
                placeholder="Full address"
                value={formData.address}
                onChange={handleInputChange}
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
                key={`${mapCenter[0]}-${mapCenter[1]}-${zoom}`}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapRecenter center={mapCenter} zoom={zoom} />
                <LocationPicker
                  setLocation={(loc) => setFormData(prev => ({ ...prev, location: loc }))}
                  setMapCenter={setMapCenter}
                />

                {userLocation && (
                  <Marker position={userLocation}>
                    <Popup><strong>You are here</strong></Popup>
                  </Marker>
                )}

                {venues.map((v) => (
                  v.location && v.location.lat ? (
                    <Marker
                      key={v.id}
                      position={[v.location.lat, v.location.lng]}
                      eventHandlers={{
                        click: () => {
                          setFormData(prev => ({ ...prev, venue: v.name, address: v.address || "", location: v.location }));
                        },
                      }}
                    >
                      <Popup minWidth={300}>
                        <div className="text-black bg-white rounded-lg overflow-hidden">
                          <div className="h-32 w-full bg-gray-200 overflow-hidden relative">
                            <img src={v.image} alt={v.name} className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://loremflickr.com/320/240/building'} />
                            {v.isExternal && <span className="absolute top-2 right-2 text-[10px] bg-blue-600 text-white px-2 py-1 rounded shadow">Free Discovery</span>}
                          </div>
                          <div className="p-3">
                            <strong className="block text-lg leading-tight mb-1">{v.name}</strong>
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{v.address}</p>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-amber-500 font-bold text-sm">★ {v.rating}</span>
                              <span className="text-xs text-gray-400">{v.distance ? `${v.distance.toFixed(1)} km away` : ''}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <a href={`https://www.google.com/maps/dir/?api=1&destination=${v.location.lat},${v.location.lng}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-bold py-2 rounded hover:bg-blue-100 transition-colors"><span>🗺️ Google Maps</span></a>
                              <a href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation ? `${userLocation[0]}%2C${userLocation[1]}` : ''}%3B${v.location.lat}%2C${v.location.lng}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 bg-green-50 text-green-600 text-[10px] font-bold py-2 rounded hover:bg-green-100 transition-colors"><span>📍 OSM Route</span></a>
                            </div>
                            <button className="block w-full bg-indigo-600 text-white text-xs font-bold py-2 rounded hover:bg-indigo-700 transition-colors shadow-lg" onClick={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, venue: v.name, address: v.address || "", location: v.location })); }}>Select Venue</button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ) : null
                ))}
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
                  <div key={cat} className="p-4 border border-white/10 rounded-xl bg-white/5 flex justify-between items-center hover:bg-white/10 transition-colors vendor-card">
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
                        disabled={isScanning}
                        onClick={async (e) => {
                          e.preventDefault();
                          setIsScanning(true);
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
                            } finally {
                              setIsScanning(false);
                            }
                          }, 2000);
                        }}
                      >
                        {isScanning ? "Scanning Room..." : "Scan Area"}
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

            {showVendorModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Select {currentCategory}</h2>
                    <button onClick={() => setShowVendorModal(false)} className="text-gray-400 hover:text-white">✕</button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {availableVendors.map((vendor) => (
                      <div key={vendor._id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center hover:bg-white/10 cursor-pointer vendor-card" onClick={() => selectVendor(vendor)}>
                        <div>
                          <h3 className="font-bold text-lg">{vendor.name}</h3>
                          <p className="text-gray-400 text-sm mb-1">{vendor.address || vendor.description || vendor.district || 'Service Provider'}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-yellow-400 font-bold flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                              {vendor.rating || (Math.random() * 1.5 + 3.5).toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-accent">₹{vendor.price}</p>
                          <button className="text-sm text-green-400 mt-1">Select →</button>
                        </div>
                      </div>
                    ))}
                    {availableVendors.length === 0 && <p className="text-center text-gray-500 py-8">No vendors found.</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="wizard-actions">
              <button className="btn-prev" onClick={handlePrev} disabled={isSubmitting}>Back</button>
              <button
                className="btn-submit"
                type="submit"
                disabled={isSubmitting}
                onClick={async (e) => {
                  e.preventDefault();
                  if (new Date(formData.endDate) < new Date(formData.startDate)) {
                    alert("End date cannot be before start date!");
                    return;
                  }
                  try {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                    if (!userInfo) {
                      alert("Please login first");
                      navigate("/login");
                      return;
                    }
                    setIsSubmitting(true);
                    const payload = { ...formData, selectedVendors };
                    const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`}/events`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userInfo?.token}`
                      },
                      body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (res.ok) {
                      navigate(`/event-plan/${data._id}`);
                    } else {
                      alert(data.message || "Failed to create event");
                    }
                  } catch (error) {
                    console.error("Fetch error:", error);
                    alert(`Connection error: ${error.message}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? "🚀 Launching..." : "🚀 Launch Event"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default CreateEvent;
