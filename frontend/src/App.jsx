import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import MyEvents from "./pages/MyEvents";
import Profile from "./pages/Profile";
import Participants from "./pages/Participants";
import Budget from "./pages/Budget";
import Schedule from "./pages/Schedule";
import Notifications from "./pages/Notifications";
import Services from "./pages/Services";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EventPlan from "./pages/EventPlan";
import ARNavigation from "./pages/ARNavigation";
import RsvpPage from "./pages/RsvpPage";
import TicketView from "./pages/TicketView";
import CheckIn from "./pages/CheckIn";
import VerifyOtp from "./pages/VerifyOtp";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/event-plan/:id" element={<EventPlan />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/participants/:eventId" element={<Participants />} />
        <Route path="/budget/:eventId?" element={<Budget />} />
        <Route path="/schedule/:eventId?" element={<Schedule />} />
        <Route path="/notifications/:eventId" element={<Notifications />} />
        <Route path="/services/:eventId?" element={<Services />} />
        <Route path="/ar-navigation/:eventId?" element={<ARNavigation />} />
        <Route path="/rsvp/:eventId" element={<RsvpPage />} />
        <Route path="/ticket/:ticketId" element={<TicketView />} />
        <Route path="/checkin/:eventId" element={<CheckIn />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;







