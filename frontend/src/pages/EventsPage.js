import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { eventService } from '../services/api';
import './EventsPage.css';
import { formatDate } from '../utils/dateUtils';

function EventsPage({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents(page);
  }, [page]);

  const fetchEvents = async (pageNum) => {
    setLoading(true);
    try {
      const response = await eventService.getAllEvents(pageNum, 10);
      setEvents(response.data.data.events || []);
      setTotalPages(response.data.data.pagination.pages);
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch events';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && events.length === 0) {
    return <div className="container"><div className="loading">Loading events...</div></div>;
  }

  return (
    <div className="container">
      <div className="events-header">
        <h1>🎉 Events</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="events-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event._id} className="event-card">
              <div className="event-header">
                <h3>{event.title}</h3>
                <span className={`status-badge ${event.status}`}>{event.status}</span>
              </div>
              <p className="event-category">{event.category}</p>
              <p className="event-description">{event.description}</p>
              <div className="event-details">
                <div className="detail">
                  <span className="label">📅 Date:</span>
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="detail">
                  <span className="label">👥 Capacity:</span>
                  <span>{event.registeredCount}/{event.capacity}</span>
                </div>
                <div className="detail">
                  <span className="label">📍 Location:</span>
                  <span>{event.location}</span>
                </div>
              </div>
              <Link to={`/events/${event._id}`} className="view-btn">
                View Details
              </Link>
            </div>
          ))
        ) : (
          <div className="no-events">No events found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>{page} of {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default EventsPage;
