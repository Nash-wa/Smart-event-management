import "../css/createEvent.css";

function CreateEvent() {
  return (
    <div className="create-event-page">

      <h1 className="page-title">Create New Event 🎉</h1>
      <p className="page-subtitle">
        Fill in the details to create and manage your event
      </p>

      <form className="event-form">

        {/* Event Basic Info */}
        <div className="form-card">
          <h2>📌 Basic Information</h2>

          <div className="form-group">
            <label>Event Name</label>
            <input type="text" placeholder="Enter event name" required />
          </div>

          <div className="form-group">
            <label>Event Description</label>
            <textarea placeholder="Describe your event" rows="4"></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select>
                <option>Conference</option>
                <option>Workshop</option>
                <option>Seminar</option>
                <option>Festival</option>
                <option>College Event</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mode</label>
              <select>
                <option>Offline</option>
                <option>Online</option>
                <option>Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="form-card">
          <h2>📅 Date & Time</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input type="date" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input type="time" />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input type="time" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="form-card">
          <h2>📍 Location Details</h2>

          <div className="form-group">
            <label>Venue Name</label>
            <input type="text" placeholder="Auditorium / Hall / Online link" />
          </div>

          <div className="form-group">
            <label>Address / Meeting Link</label>
            <input type="text" placeholder="Enter location or URL" />
          </div>
        </div>

        {/* Capacity & Budget */}
        <div className="form-card">
          <h2>💰 Capacity & Budget</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Max Participants</label>
              <input type="number" placeholder="e.g. 200" />
            </div>

            <div className="form-group">
              <label>Estimated Budget (₹)</label>
              <input type="number" placeholder="e.g. 50000" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="form-card">
          <h2>✨ Event Features</h2>

          <div className="checkbox-grid">
            <label><input type="checkbox" /> Registration Required</label>
            <label><input type="checkbox" /> Certificate Provided</label>
            <label><input type="checkbox" /> Food Available</label>
            <label><input type="checkbox" /> Guest Speakers</label>
            <label><input type="checkbox" /> Live Streaming</label>
            <label><input type="checkbox" /> AR Navigation</label>
          </div>
        </div>

        {/* Submit */}
        <div className="submit-section">
          <button type="submit" className="submit-btn">
            🚀 Create Event
          </button>
        </div>

      </form>
    </div>
  );
}

export default CreateEvent;
