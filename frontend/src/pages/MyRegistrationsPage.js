import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { registrationService } from '../services/api';
import './MyRegistrationsPage.css';
import { formatDate } from '../utils/dateUtils';

function MyRegistrationsPage({ user }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, [user]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await registrationService.getUserRegistrations(user._id);
      setRegistrations(response.data.data);
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch registrations';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    setCancellingId(registrationId);
    try {
      await registrationService.cancelRegistration(registrationId);
      toast.success('Registration cancelled successfully');
      fetchRegistrations();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to cancel registration';
      toast.error(errorMsg);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading your registrations...</div></div>;
  }

  return (
    <div className="container">
      <h1 className="page-title">📝 My Registrations</h1>

      {error && <div className="error-message">{error}</div>}

      {registrations.length > 0 ? (
        <div className="registrations-list">
          {registrations.map(registration => (
            <div key={registration._id} className="registration-card">
              <div className="registration-header">
                <h3>{registration.eventId}</h3>
                <span className={`status-badge ${registration.status}`}>
                  {registration.status}
                </span>
              </div>
              <div className="registration-details">
                <div className="detail">
                  <span className="label">Registration Date:</span>
                  <span>{formatDate(registration.registrationDate)}</span>
                </div>
                <div className="detail">
                  <span className="label">Status:</span>
                  <span>{registration.status}</span>
                </div>
              </div>
              {registration.status === 'confirmed' && (
                <button
                  onClick={() => handleCancelRegistration(registration._id)}
                  disabled={cancellingId === registration._id}
                  className="cancel-btn"
                >
                  {cancellingId === registration._id ? 'Cancelling...' : 'Cancel Registration'}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-registrations">
          <p>You haven't registered for any events yet.</p>
        </div>
      )}
    </div>
  );
}

export default MyRegistrationsPage;
