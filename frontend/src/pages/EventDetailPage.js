import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { eventService, registrationService } from '../services/api';
import './EventDetailPage.css';
import { formatDate } from '../utils/dateUtils';

function EventDetailPage({ user }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId, user]);

  const fetchEventDetails = async () => {
    try {
      const response = await eventService.getEventById(eventId);
      setEvent(response.data.data.event);
      
      // Check if user is already registered
      const registrationsResponse = await registrationService.getUserRegistrations(user._id);
      const isRegistered = registrationsResponse.data.data.registrations.some(
        reg => reg.eventId === eventId && reg.status === 'confirmed'
      );
      setRegistered(isRegistered);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch event details';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await registrationService.registerForEvent({
        userId: user._id,
        eventId: eventId
      });
      toast.success('Successfully registered for the event!');
      setRegistered(true);
      fetchEventDetails();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to register for event';
      toast.error(errorMsg);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading event details...</div></div>;
  }

  if (error || !event) {
    return (
      <div className="container">
        <div className="error-message">{error || 'Event not found'}</div>
        <button onClick={() => navigate('/events')} className="back-btn">
          Back to Events
        </button>
      </div>
    );
  }

  const isFull = event.registeredCount >= event.capacity;
  const isCompleted = event.status === 'completed' || event.status === 'cancelled';

  return (
    <div className="container">
      <button onClick={() => navigate('/events')} className="back-btn">
        ← Back to Events
      </button>

      <div className="event-detail-container">
        <div className="event-detail-header">
          <h1>{event.title}</h1>
          <span className={`status-badge ${event.status}`}>{event.status.toUpperCase()}</span>
        </div>

        <div className="event-detail-content">
          <div className="detail-section">
            <h3>📝 Description</h3>
            <p>{event.description}</p>
          </div>

          <div className="detail-section">
            <h3>📋 Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Category:</span>
                <span>{event.category}</span>
              </div>
              <div className="detail-item">
                <span className="label">Date:</span>
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Time:</span>
                <span>{event.time || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Location:</span>
                <span>{event.location}</span>
              </div>
              <div className="detail-item">
                <span className="label">Capacity:</span>
                <span>{event.registeredCount}/{event.capacity}</span>
              </div>
              <div className="detail-item">
                <span className="label">Organizer:</span>
                <span>{event.organizer || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {event.agenda && (
            <div className="detail-section">
              <h3>📅 Agenda</h3>
              <p>{event.agenda}</p>
            </div>
          )}

          <div className="registration-section">
            {registered ? (
              <div className="success-message">
                ✓ You are registered for this event
              </div>
            ) : (
              <>
                {isFull || isCompleted ? (
                  <button className="register-btn" disabled>
                    {isFull ? 'Event is Full' : 'Event is ' + event.status}
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="register-btn"
                  >
                    {registering ? 'Registering...' : 'Register for Event'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailPage;
