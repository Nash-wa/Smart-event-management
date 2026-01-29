import { Link, useNavigate } from "react-router-dom";
import "../css/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <header className="dashboard-header">
        <h1>Smart Event Management</h1>
        <Link to="/" className="logout-btn">Logout</Link>
      </header>

      {/* Main Dashboard */}
      <div className="dashboard-container">
        <h2>Welcome, User 👋</h2>
        <p className="subtitle">Manage your events efficiently</p>

        {/* Feature Cards */}
        <div className="card-grid">

          <div className="card">
            <h3>Create Event</h3>
            <p>Create and manage a new event</p>
            <button
              className="btn"
              onClick={() => navigate("/create-event")}
            >
              Create
            </button>
          </div>

          <div className="card">
            <h3>My Events</h3>
            <p>View events you created</p>
            <button
              className="btn"
              onClick={() => navigate("/my-events")}
            >
              View
            </button>
          </div>

          <div className="card">
            <h3>Participants</h3>
            <p>Track number of guests</p>
            <button
              className="btn"
              onClick={() => navigate("/participants")}
            >
              Check
            </button>
          </div>

          <div className="card">
            <h3>Budget Overview</h3>
            <p>Manage event expenses</p>
            <button
              className="btn"
              onClick={() => navigate("/budget")}
            >
              View
            </button>
          </div>

          <div className="card">
            <h3>Schedule</h3>
            <p>Event date & time planning</p>
            <button
              className="btn"
              onClick={() => navigate("/schedule")}
            >
              Open
            </button>
          </div>

          <div className="card">
            <h3>Notifications</h3>
            <p>Send updates to guests</p>
            <button
              className="btn"
              onClick={() => navigate("/notifications")}
            >
              Send
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

export default Dashboard;

