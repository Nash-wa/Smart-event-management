import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../css/ticket.css';

const TicketView = () => {
    const { ticketId } = useParams();
    const [ticketData, setTicketData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                // We'll create a public endpoint for ticket retrieval or just use the participant one if we can
                // For now, let's assume we fetch by ticketId
                const res = await fetch(`http://localhost:5000/api/participants/ticket/${ticketId}`);
                const data = await res.json();
                if (res.ok) {
                    setTicketData(data);
                    // Fetch messages for this event
                    const msgRes = await fetch(`http://localhost:5000/api/messages/${data.event._id}`);
                    const msgData = await msgRes.json();
                    if (msgRes.ok) setMessages(msgData);
                } else {
                    setError(data.message || 'Ticket not found');
                }
            } catch (error) {
                setError('Failed to load ticket');
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [ticketId]);

    if (loading) return <div className="ticket-loading">Loading your ticket...</div>;
    if (error) return <div className="ticket-error">{error}</div>;

    return (
        <div className="ticket-container">
            <div className="ticket">
                <div className="ticket-header">
                    <h2>Official Event Pass</h2>
                    <div className="ticket-id">{ticketId}</div>
                </div>
                <div className="ticket-body">
                    <div className="event-info">
                        <h3>{ticketData.event?.title || 'Event Pass'}</h3>
                        <p><strong>Attendee:</strong> {ticketData.name}</p>
                        <p><strong>Role:</strong> {ticketData.role}</p>
                        <p><strong>Status:</strong> {ticketData.checkInStatus}</p>
                    </div>
                    <div className="qr-section">
                        {/* Using a public QR API to avoid adding dependencies for now */}
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticketId}`}
                            alt="QR Code"
                        />
                        <p>Scan at entrance</p>
                    </div>
                </div>
                <div className="ticket-footer">
                    <p>Powered by Smart Event Management</p>
                </div>
            </div>

            {/* Live Announcements for Ticket Holder */}
            {messages.length > 0 && (
                <div className="ticket-announcements">
                    <h3>Live Updates</h3>
                    <div className="announcement-list">
                        {messages.map(msg => (
                            <div key={msg._id} className={`announcement-item ${msg.type}`}>
                                <span className="msg-type">{msg.type}</span>
                                <p>{msg.text}</p>
                                <span className="msg-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketView;
