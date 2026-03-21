import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { eventService } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import '../pages/AdminDashboard.css';

function EventManagement() {
  // Event state
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);
  const [deletingEventId, setDeletingEventId] = useState(null);

  // Event Modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const initialEventForm = {
    eventName: '',
    description: '',
    date: '',
    venueName: '',
    venueAddress: '',
    venueCapacity: '',
    startTime: '',
    endTime: '',
    category: 'other',
    organizer: '',
    status: 'upcoming'
  };
  const [eventFormData, setEventFormData] = useState(initialEventForm);

  useEffect(() => {
    fetchEvents(eventsPage);
  }, [eventsPage]);

  const fetchEvents = async (pageNum) => {
    setEventsLoading(true);
    try {
      const response = await eventService.getAllEvents(pageNum, 10);
      
      let eventsData = [];
      let total = 1;

      if (Array.isArray(response.data)) {
        eventsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.events)) {
        eventsData = response.data.data.events;
        total = response.data.data.pagination?.pages || 1;
      }

      setEvents(eventsData);
      setEventsTotalPages(total);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    setDeletingEventId(eventId);
    try {
      await eventService.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      setEvents(events.filter(e => e._id !== eventId));
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setDeletingEventId(null);
    }
  };

  const openEventModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setEventFormData({
        eventName: event.eventName,
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        venueName: event.venue?.name || '',
        venueAddress: event.venue?.address || '',
        venueCapacity: event.venue?.capacity || '',
        startTime: event.schedule?.startTime ? new Date(event.schedule.startTime).toISOString().slice(0, 16) : '',
        endTime: event.schedule?.endTime ? new Date(event.schedule.endTime).toISOString().slice(0, 16) : '',
        category: event.category || 'other',
        organizer: event.organizer || '',
        status: event.status || 'upcoming'
      });
      setImageFile(null);
    } else {
      setEditingEvent(null);
      setEventFormData(initialEventForm);
      setImageFile(null);
    }
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setEventFormData(initialEventForm);
    setImageFile(null);
  };

  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      let payload;
      const payloadObj = {
        eventName: eventFormData.eventName,
        description: eventFormData.description,
        date: eventFormData.date,
        venue: {
          name: eventFormData.venueName,
          address: eventFormData.venueAddress,
          capacity: Number(eventFormData.venueCapacity)
        },
        schedule: {
          startTime: eventFormData.startTime,
          endTime: eventFormData.endTime
        },
        category: eventFormData.category,
        organizer: eventFormData.organizer,
        status: eventFormData.status
      };

      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        payload = new FormData();
        payload.append('eventName', payloadObj.eventName);
        payload.append('description', payloadObj.description);
        payload.append('date', payloadObj.date);
        payload.append('venue', JSON.stringify(payloadObj.venue));
        payload.append('schedule', JSON.stringify(payloadObj.schedule));
        payload.append('category', payloadObj.category);
        payload.append('organizer', payloadObj.organizer);
        payload.append('status', payloadObj.status);
        payload.append('image', imageFile);
      } else {
        payload = payloadObj;
      }

      if (editingEvent) {
        await eventService.updateEvent(editingEvent._id, payload);
        toast.success('Event updated successfully');
      } else {
        await eventService.createEvent(payload);
        toast.success('Event created successfully');
      }
      closeEventModal();
      fetchEvents(eventsPage);
    } catch (error) {
      toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event');
    }
  };

  if (eventsLoading && events.length === 0) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Event Management</h2>
          <div className="admin-card-actions">
            <div className="badge admin-count-badge">Total Events: {events.length}</div>
            <button className="btn-primary-sm" onClick={() => openEventModal()}>+ Create Event</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map(e => (
                  <tr key={e._id}>
                    <td>
                      <div className="user-cell" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', padding: '8px 0' }}>
                        {e.image ? (
                          <img src={`http://localhost:3000/api/events${e.image}`} alt={e.eventName} style={{ width: '120px', height: '160px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                          <div className="user-avatar-small" style={{ width: '120px', height: '160px', borderRadius: '8px', fontSize: '36px' }}>
                            {e.eventName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span style={{ fontWeight: '600', fontSize: '15px' }}>{e.eventName}</span>
                      </div>
                    </td>
                    <td>{formatDate(e.date)}</td>
                    <td>
                      <span className="role-badge" style={{backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8'}}>
                        {e.category}
                      </span>
                    </td>
                    <td>
                      <span className={`role-badge ${e.status === 'upcoming' ? 'user' : ''} ${e.status === 'ongoing' ? 'admin' : ''}`}>
                        {e.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-flex">
                        <button 
                          className="btn-primary-sm"
                          onClick={() => openEventModal(e)}
                          style={{marginRight: '8px'}}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-danger-sm"
                          onClick={() => handleDeleteEvent(e._id)}
                          disabled={deletingEventId === e._id}
                        >
                          {deletingEventId === e._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">No events found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {eventsTotalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setEventsPage(Math.max(1, eventsPage - 1))}
              disabled={eventsPage === 1}
              className="page-btn"
            >
              Prev
            </button>
            <span className="page-info">Page {eventsPage} of {eventsTotalPages}</span>
            <button
              onClick={() => setEventsPage(Math.min(eventsTotalPages, eventsPage + 1))}
              disabled={eventsPage === eventsTotalPages}
              className="page-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal-content admin-modal">
            <div className="modal-header">
              <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
              <button className="close-btn" onClick={closeEventModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSaveEvent} className="admin-form">
              <div className="form-row">
                <div className="form-group half">
                  <label>Event Name *</label>
                  <input type="text" name="eventName" value={eventFormData.eventName} onChange={handleEventFormChange} required minLength="3" />
                </div>
                <div className="form-group half">
                  <label>Date *</label>
                  <input type="date" name="date" value={eventFormData.date} onChange={handleEventFormChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" value={eventFormData.description} onChange={handleEventFormChange} required minLength="10" rows="3"></textarea>
              </div>

              <div className="form-group">
                <label>Event Image (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                {editingEvent && editingEvent.image && !imageFile && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Current image will be kept if no new file is selected.</p>
                )}
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Venue Name *</label>
                  <input type="text" name="venueName" value={eventFormData.venueName} onChange={handleEventFormChange} required />
                </div>
                <div className="form-group half">
                  <label>Capacity *</label>
                  <input type="number" name="venueCapacity" value={eventFormData.venueCapacity} onChange={handleEventFormChange} required min="1" />
                </div>
              </div>

              <div className="form-group">
                <label>Venue Address *</label>
                <input type="text" name="venueAddress" value={eventFormData.venueAddress} onChange={handleEventFormChange} required />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Start Time *</label>
                  <input type="datetime-local" name="startTime" value={eventFormData.startTime} onChange={handleEventFormChange} required />
                </div>
                <div className="form-group half">
                  <label>End Time *</label>
                  <input type="datetime-local" name="endTime" value={eventFormData.endTime} onChange={handleEventFormChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group third">
                  <label>Category</label>
                  <select name="category" value={eventFormData.category} onChange={handleEventFormChange}>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="meeting">Meeting</option>
                    <option value="webinar">Webinar</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group third">
                  <label>Status</label>
                  <select name="status" value={eventFormData.status} onChange={handleEventFormChange}>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group third">
                  <label>Organizer *</label>
                  <input type="text" name="organizer" value={eventFormData.organizer} onChange={handleEventFormChange} required />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeEventModal}>Cancel</button>
                <button type="submit" className="btn-primary">{editingEvent ? 'Save Changes' : 'Create Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default EventManagement;
