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
    return <div className="container"><div className="loading">Loading amazing events...</div></div>;
  }

  return (
    <div className="events-page-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Discover What's Next ✨</h1>
          <p>Find and join the most exciting events happening around you.</p>
          <div className="hero-search">
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="container events-content">
        <div className="events-header">
          <h2>Upcoming Events</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="events-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <div key={event._id} className="event-card group">
                <div className="event-card-inner">
                  <div className="event-header">
                    <span className={`status-badge ${event.status}`}>{event.status}</span>
                    <span className="event-category">{event.category}</span>
                  </div>
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-details">
                    <div className="detail-item">
                      <span className="icon">📅</span>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">👥</span>
                      <span>{event.registeredCount} / {event.capacity} registered</span>
                    </div>
                  </div>
                  
                  <div className="event-card-actions">
                    <Link to={`/events/${event._id}`} className="view-btn">
                      View Details
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">
              <div className="no-events-content">
                <span className="no-events-icon">🔍</span>
                <h3>No events found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="page-btn"
            >
              Previous
            </button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="page-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;
