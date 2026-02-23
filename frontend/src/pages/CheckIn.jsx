import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/checkin.css';

const CheckIn = () => {
    const { eventId } = useParams();
    const [ticketInput, setTicketInput] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [lastCheckedIn, setLastCheckedIn] = useState(null);
    const navigate = useNavigate();

    const handleCheckIn = async (e) => {
        if (e) e.preventDefault();
        if (!ticketInput) return;

        setStatus({ type: 'loading', message: 'Validating ticket...' });

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const res = await fetch(`http://localhost:5000/api/participants/validate/${ticketInput}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userInfo?.token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: data.message });
                setLastCheckedIn(data.participant);
                setTicketInput('');
                // Clear success message after 3 seconds
                setTimeout(() => setStatus({ type: '', message: '' }), 3000);
            } else {
                setStatus({ type: 'error', message: data.message });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Network error. Please try again.' });
        }
    };

    return (
        <div className="checkin-container">
            <header className="checkin-header">
                <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
                <h1>Gate Management</h1>
            </header>

            <main className="checkin-main">
                <div className="scanner-mock">
                    <div className="scanner-frame">
                        <div className="scanner-line"></div>
                        <p>Camera Scanner Ready</p>
                    </div>
                </div>

                <div className="manual-input-section">
                    <h3>Manual Validation</h3>
                    <form onSubmit={handleCheckIn} className="checkin-form">
                        <input
                            type="text"
                            placeholder="Enter Ticket ID (e.g. TKT-X7Y2...)"
                            value={ticketInput}
                            onChange={(e) => setTicketInput(e.target.value)}
                        />
                        <button type="submit" className="validate-btn">Validate & Check-In</button>
                    </form>

                    {status.message && (
                        <div className={`status-banner ${status.type}`}>
                            {status.message}
                        </div>
                    )}
                </div>

                {lastCheckedIn && (
                    <div className="last-entry card">
                        <h4>Recent Entry</h4>
                        <div className="entry-details">
                            <div className="avatar">{lastCheckedIn.name.charAt(0)}</div>
                            <div>
                                <p className="name">{lastCheckedIn.name}</p>
                                <p className="role">{lastCheckedIn.role}</p>
                            </div>
                            <div className="time">Just now</div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CheckIn;
