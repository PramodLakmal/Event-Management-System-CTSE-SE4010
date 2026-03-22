import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Loader2, Bell, Calendar, Trash2, PlusCircle, XCircle, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

// ─── EVENTS TAB ──────────────────────────────────────────────────────────────
function EventsTab() {
  const [form, setForm] = useState({ title: '', date: '', startTime: '', endTime: '', location: '', description: '', capacity: '' });
  const [view, setView] = useState('table'); // 'table', 'create', 'edit'
  const [imageFile, setImageFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [events, setEvents] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events`);
      setEvents(res.data);
    } catch (err) {}
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setProcessingId(id);
    try {
      await axios.delete(`${API_URL}/api/events/${id}`);
      toast.info('Event deleted successfully.');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('date', form.date);
      formData.append('startTime', form.startTime);
      formData.append('endTime', form.endTime);
      formData.append('location', form.location);
      formData.append('description', form.description);
      if (form.capacity) formData.append('capacity', parseInt(form.capacity));
      if (imageFile) formData.append('image', imageFile);
      await axios.post(`${API_URL}/api/events`, formData);
      setForm({ title: '', date: '', startTime: '', endTime: '', location: '', description: '', capacity: '' });
      setImageFile(null);
      setView('table');
      fetchEvents();
      toast.success('Event published successfully.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setProcessingId(editForm._id);
    try {
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('date', editForm.date);
      formData.append('startTime', editForm.startTime || '');
      formData.append('endTime', editForm.endTime || '');
      formData.append('location', editForm.location);
      formData.append('description', editForm.description || '');
      if (editForm.capacity) formData.append('capacity', parseInt(editForm.capacity));
      if (editImageFile) formData.append('image', editImageFile);
      await axios.put(`${API_URL}/api/events/${editForm._id}`, formData);
      toast.success('Event updated successfully.');
      setEditForm(null);
      setEditImageFile(null);
      setView('table');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update event');
    } finally {
      setProcessingId(null);
    }
  };

  const inputStyle = { width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#fff', transition: 'border-color 0.2s', outline: 'none' };
  const labelStyle = { fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.025em' };
  const fieldGroupStyle = { background: '#f9fafb', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e5e7eb', marginBottom: '1rem' };

  if (view === 'create') {
    return (
      <div className="admin-card">
        <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}><PlusCircle size={22} color="var(--primary)" /> Create New Event</h2>
          <button onClick={() => setView('table')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><XCircle size={24} /></button>
        </div>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={fieldGroupStyle}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 200px' }}>
                <label style={labelStyle}>Event Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={inputStyle} placeholder="Enter a catchy title" />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Date *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Start Time *</label>
                <input type="time" value={form.startTime || ''} onChange={e => setForm({ ...form, startTime: e.target.value })} required style={inputStyle} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>End Time *</label>
                <input type="time" value={form.endTime || ''} onChange={e => setForm({ ...form, endTime: e.target.value })} required style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 200px' }}>
                <label style={labelStyle}>Location *</label>
                <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required style={inputStyle} placeholder="Physical or Virtual Address" />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Max Capacity *</label>
                <input type="number" value={form.capacity || ''} onChange={e => setForm({ ...form, capacity: e.target.value })} min="1" required style={inputStyle} placeholder="e.g. 100" />
              </div>
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Cover Image (Best for UI)</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ ...inputStyle, padding: '0.4rem', border: '1px dashed #d1d5db', background: '#fff' }} />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Description *</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} placeholder="Provide details about the event..." />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button type="button" onClick={() => setView('table')} className="btn-danger" style={{ padding: '0.7rem 2rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
            <button type="submit" disabled={creating} style={{ padding: '0.7rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {creating ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Loader2 className="loader-spin" size={16} /> Publishing...</span> : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'edit' && editForm) {
    return (
      <div className="admin-card">
        <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Calendar size={22} color="var(--primary)" /> Edit Event Details</h2>
          <button onClick={() => setView('table')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><XCircle size={24} /></button>
        </div>
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={fieldGroupStyle}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 200px' }}>
                <label style={labelStyle}>Event Title *</label>
                <input type="text" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required style={inputStyle} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Date *</label>
                <input type="date" value={editForm.date ? new Date(editForm.date).toISOString().split('T')[0] : ''} onChange={e => setEditForm({ ...editForm, date: e.target.value })} required style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Start Time *</label>
                <input type="time" value={editForm.startTime || ''} onChange={e => setEditForm({ ...editForm, startTime: e.target.value })} required style={inputStyle} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>End Time *</label>
                <input type="time" value={editForm.endTime || ''} onChange={e => setEditForm({ ...editForm, endTime: e.target.value })} required style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 200px' }}>
                <label style={labelStyle}>Location *</label>
                <input type="text" value={editForm.location || ''} onChange={e => setEditForm({ ...editForm, location: e.target.value })} required style={inputStyle} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Max Capacity *</label>
                <input type="number" value={editForm.capacity || ''} onChange={e => setEditForm({ ...editForm, capacity: e.target.value })} min="1" required style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Update Cover Image</label>
            <input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files[0])} style={{ ...inputStyle, padding: '0.4rem', border: '1px dashed #d1d5db', background: '#fff' }} />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Description *</label>
            <textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} required style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} placeholder="Update event details..." />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button type="button" onClick={() => setView('table')} className="btn-danger" style={{ padding: '0.7rem 2rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
            <button type="submit" disabled={!!processingId} style={{ padding: '0.7rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {processingId ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Loader2 className="loader-spin" size={16} /> Saving...</span> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={22} style={{ verticalAlign: 'middle' }} /> Manage Upcoming Events</h2>
          <p className="subtitle" style={{ margin: 0 }}>View, edit, and modify platform events.</p>
        </div>
        <button onClick={() => setView('create')} style={{ padding: '0.7rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.45rem', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>
          <PlusCircle size={18} /> Organize Event
        </button>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event Name &amp; Cover</th>
              <th>Date &amp; Time</th>
              <th>Location</th>
              <th>Registrations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(ev => {
              const actualImgUrl = ev.imageUrl?.startsWith('/') ? `${API_URL}${ev.imageUrl}` : ev.imageUrl;
              const coverStyle = actualImgUrl ? { backgroundImage: `url(${actualImgUrl})` } : { background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)' };
              return (
                <tr key={ev._id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ ...coverStyle, width: '110px', height: '70px', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
                      <span style={{ fontWeight: '600' }}>{ev.title}</span>
                    </div>
                  </td>
                  <td>
                    {new Date(ev.date).toLocaleDateString()}
                    {(ev.startTime || ev.endTime) && (
                      <div style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.2rem' }}>{ev.startTime || '--'} – {ev.endTime || '--'}</div>
                    )}
                  </td>
                  <td>{ev.location}</td>
                  <td>{ev.capacity ? `${ev.registrationsCount} / ${ev.capacity}` : ev.registrationsCount}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-info-sm" onClick={() => { setEditForm(ev); setView('edit'); }} disabled={processingId === ev._id}>Edit</button>
                      <button className="btn-danger-sm" onClick={() => handleDelete(ev._id)} disabled={processingId === ev._id}>
                        {processingId === ev._id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {events.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>No events found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS TAB ────────────────────────────────────────────────────────
function NotificationsTab() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [openSections, setOpenSections] = useState({
    eventFulls: true,
    newUsers: true,
    eventRegs: true,
    others: true
  });

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const fetchNotifs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications`);
      setNotifs(res.data);
    } catch (err) { } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 5000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await axios.put(`${API_URL}/api/notifications/${id}/read`);
      fetchNotifs();
    } catch (err) { toast.error('Failed to update notification'); }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await axios.delete(`${API_URL}/api/notifications/${id}`);
      fetchNotifs();
      toast.success('Notification deleted');
    } catch (err) { toast.error('Failed to delete notification'); }
  };

  const clearAll = async () => {
    if (!window.confirm('Delete all notifications entirely?')) return;
    setClearing(true);
    try {
      await axios.delete(`${API_URL}/api/notifications`);
      toast.success('Inbox cleared!');
      fetchNotifs();
    } catch (err) { toast.error('Failed to clear notifications'); } finally { setClearing(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="loader-spin" size={40} color="var(--primary)" /></div>;

  // Group notifications
  const newUsers = notifs.filter(n => n.type === 'ADMIN_NEW_USER');
  const eventRegs = notifs.filter(n => n.type === 'ADMIN_EVENT_REG');
  const eventFulls = notifs.filter(n => n.type === 'ADMIN_EVENT_FULL');
  const others = notifs.filter(n => !['ADMIN_NEW_USER', 'ADMIN_EVENT_REG', 'ADMIN_EVENT_FULL'].includes(n.type));

  const NotificationList = ({ title, icon, list, sectionKey }) => {
    if (list.length === 0) return null;
    const isOpen = openSections[sectionKey];
    return (
      <div style={{ marginBottom: '2rem' }}>
        <h3 
          onClick={() => toggleSection(sectionKey)}
          style={{ 
            borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem', 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{icon} {title}</div>
          <span style={{ fontSize: '0.8rem', opacity: 0.6, background: 'var(--border-light)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
            {isOpen ? '▲ Collapse' : '▼ Expand'}
          </span>
        </h3>
        {isOpen && list.map(n => (
          <div key={n._id} style={{
            padding: '1.2rem 1.5rem', borderRadius: '8px', marginBottom: '0.5rem',
            background: n.read ? 'rgba(0,0,0,0.04)' : 'rgba(99,102,241,0.08)',
            border: `1px solid ${n.read ? 'rgba(0,0,0,0.08)' : 'rgba(99,102,241,0.2)'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', transition: 'background 0.3s'
          }}>
            <div>
              <p style={{ margin: '0 0 0.3rem 0', fontWeight: n.read ? 'normal' : '600' }}>{n.message}</p>
              <small style={{ opacity: 0.5 }}>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {!n.read && (
                <button onClick={() => markRead(n._id)} style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '50px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Mark Read
                </button>
              )}
              <button 
                onClick={() => deleteNotification(n._id)} 
                title="Delete Notification"
                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', padding: '0.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.6 }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bell size={22} /> Notification Management</h2>
        {notifs.length > 0 && (
          <button onClick={clearAll} disabled={clearing} className="btn-danger" style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {clearing ? <Loader2 className="loader-spin" size={16} /> : <><Trash2 size={15} /> Clear All</>}
          </button>
        )}
      </div>
      <div style={{ marginTop: '1rem' }}>
        {notifs.length === 0 ? (
          <p style={{ opacity: 0.6, textAlign: 'center', padding: '2rem' }}>You're all caught up! No notifications.</p>
        ) : (
          <>
            <NotificationList title="Event Capacity Alerts" icon={<Bell size={18} color="var(--primary)"/>} list={eventFulls} sectionKey="eventFulls" />
            <NotificationList title="New User Signups" icon={<Users size={18} color="var(--primary)"/>} list={newUsers} sectionKey="newUsers" />
            <NotificationList title="Event Registrations" icon={<Calendar size={18} color="var(--primary)"/>} list={eventRegs} sectionKey="eventRegs" />
            <NotificationList title="Other System Notifications" icon={<Bell size={18} color="var(--primary)"/>} list={others} sectionKey="others" />
          </>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD (3 TABS) ─────────────────────────────────────────────────
function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users');

  // ── User management state ──
  const [allUsers, setAllUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { applyFilters(); }, [allUsers, page, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      setAllUsers(response.data.map(u => ({ ...u, isActive: true })));
    } catch (error) { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const applyFilters = () => {
    let filtered = allUsers;
    if (roleFilter !== 'all') filtered = filtered.filter(u => u.role.toLowerCase() === roleFilter.toLowerCase());
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    }
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1);
    const start = (page - 1) * ITEMS_PER_PAGE;
    setDisplayedUsers(filtered.slice(start, start + ITEMS_PER_PAGE));
  };

  const handleToggleStatus = (userId, currentStatus) => {
    toast.success(`User ${!currentStatus ? 'activated' : 'suspended'} successfully`);
    setAllUsers(allUsers.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
  };

  const handleToggleRole = (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
    toast.success(`User role updated to ${newRole}`);
    setAllUsers(allUsers.map(u => u._id === userId ? { ...u, role: newRole } : u));
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeletingId(userId);
    try {
      await axios.delete(`${API_URL}/api/users/${userId}`);
      toast.success('User deleted successfully');
      setAllUsers(allUsers.filter(u => u._id !== userId));
    } catch (error) { toast.error('Failed to delete user'); }
    finally { setDeletingId(null); }
  };

  const tabs = [
    { key: 'users', label: 'User Management', icon: <Users size={17} /> },
    { key: 'events', label: 'Manage Events', icon: <Calendar size={17} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={17} /> },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header-bg"></div>
      <div className="container admin-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}. Manage your platform from here.</p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
          backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '12px',
          padding: '0.4rem', border: '1px solid rgba(255,255,255,0.12)', flexWrap: 'wrap'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: '1 1 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
                padding: '0.65rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s',
                background: activeTab === tab.key ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
                boxShadow: activeTab === tab.key ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── USER MANAGEMENT TAB ── */}
        {activeTab === 'users' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h2><Users size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />User Management</h2>
              <div className="admin-count-badge">Total Users: {allUsers.length}</div>
            </div>
            <div className="admin-filters">
              <form onSubmit={(e) => { e.preventDefault(); setPage(1); applyFilters(); }} className="search-form">
                <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="admin-search-input" />
                <button type="submit" className="btn-search">Search</button>
              </form>
              <div className="filter-group">
                <label>Role:</label>
                <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="admin-filter-select">
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader2 className="loader-spin" size={40} color="var(--primary)" /></div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Status</th><th>Role</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedUsers.length > 0 ? displayedUsers.map(u => (
                      <tr key={u._id} className={!u.isActive ? 'user-suspended' : ''}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-small">{u.name.charAt(0).toUpperCase()}</div>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td><span className={`status-badge ${u.isActive ? 'active' : 'suspended'}`}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                        <td><span className={`role-badge ${u.role === 'ADMIN' ? 'admin' : 'user'}`}>{u.role}</span></td>
                        <td>
                          {u._id !== user?.id && (
                            <div className="action-buttons">
                              <button className={`btn-sm ${u.isActive ? 'btn-warning-sm' : 'btn-success-sm'}`} onClick={() => handleToggleStatus(u._id, u.isActive)} disabled={processingId === u._id}>{u.isActive ? 'Suspend' : 'Activate'}</button>
                              <button className="btn-info-sm" onClick={() => handleToggleRole(u._id, u.role)} disabled={processingId === u._id}>Make {u.role === 'ADMIN' ? 'User' : 'Admin'}</button>
                              <button className="btn-danger-sm" onClick={() => handleDeleteUser(u._id)} disabled={deletingId === u._id}>{deletingId === u._id ? '...' : 'Delete'}</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="empty-state">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="page-btn">Prev</button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="page-btn">Next</button>
              </div>
            )}
          </div>
        )}

        {/* ── EVENTS TAB ── */}
        {activeTab === 'events' && <EventsTab />}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  );
}

export default AdminDashboard;
