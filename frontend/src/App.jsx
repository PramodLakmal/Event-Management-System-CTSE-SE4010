import { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader2, Bell, Calendar, Trash2, LogOut, PlusCircle, XCircle, CheckCircle, Users, UserCircle } from 'lucide-react';
import './index.css';
import eventSyncText from './assets/eventSync.png';

import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserManagement from './components/UserManagement';

const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(res => res, error => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

function RequireAuth({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/notifications`);
        setUnreadCount(res.data.filter(n => !n.read).length);
      } catch (e) { }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 3000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;
  return (
    <nav>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <img src={eventSyncText} alt="EventSync" style={{ height: '80px', width: 'auto' }} />
      </Link>
      <Link to="/">Dashboard</Link>
      <Link to="/my-events">My Registrations</Link>
      <Link to="/notifications" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <Bell size={18} />
        <span>Notifications</span>
        {unreadCount > 0 && (
          <span style={{ background: 'var(--danger)', color: 'white', borderRadius: '12px', padding: '0.1rem 0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
            {unreadCount}
          </span>
        )}
      </Link>
      {user.role === 'ADMIN' && <Link to="/admin"><Users size={18} /> Admin Hub</Link>}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/profile" className="profile-nav-link tooltip-container">
          <UserCircle size={20} />
          <span style={{ opacity: 0.9, fontWeight: 500 }}>
            {user.name.split(' ')[0]}
            {user.role === 'ADMIN' && <span style={{ color: 'var(--primary)', fontSize: '0.8em', marginLeft: '0.3rem' }}>(Admin)</span>}
          </span>
        </Link>
        <button onClick={logout} className="logout-btn">
          <LogOut size={16} /> <span className="hide-on-mobile">Logout</span>
        </button>
      </div>
    </nav>
  );
}

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const { user } = useContext(AuthContext);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events`);
      setEvents(res.data);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleRegister = async (eventId) => {
    setProcessingId(eventId);
    try {
      await axios.post(`${API_URL}/api/registrations`, { eventId });
      toast.success('Registered! We are syncing your spot.');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setProcessingId(null);
    }
  }

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
  }

  return (
    <div>
      <h2 style={{ marginTop: '1rem' }}>Upcoming..</h2>
      {loadingEvents ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="loader-spin" size={48} color="var(--primary)" /></div>
      ) : (
        <div className="event-grid">
          {events.map(ev => {
            const coverStyle = ev.imageUrl ? { backgroundImage: `url(${ev.imageUrl})` } : { background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)' };
            const full = ev.capacity && ev.registrationsCount >= ev.capacity;
            return (
              <div key={ev._id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ ...coverStyle, width: '100%', height: '200px', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>{ev.title}</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, flex: 1 }}>{ev.description || 'No description provided.'}</p>

                  {ev.capacity > 0 && (
                    <div style={{ margin: '1rem 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span>{ev.registrationsCount} Registered</span>
                        <span>{ev.capacity} Capacity</span>
                      </div>
                      <div className="capacity-bar-container">
                        <div className="capacity-bar" style={{ width: `${Math.min((ev.registrationsCount / ev.capacity) * 100, 100)}%`, background: full ? 'var(--danger)' : 'var(--primary)' }}></div>
                      </div>
                    </div>
                  )}

                  <div style={{ margin: '1rem 0', opacity: 0.9, fontSize: '0.95rem' }}>
                    <p style={{ margin: '0.5rem 0' }}><strong>📅 Date:</strong> {new Date(ev.date).toLocaleDateString()}</p>
                    <p style={{ margin: '0.5rem 0' }}><strong>📍 Location:</strong> {ev.location}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => handleRegister(ev._id)} style={{ flex: 1 }} disabled={processingId === ev._id || full}>
                      {processingId === ev._id ? <Loader2 className="loader-spin" size={18} /> : full ? 'Fully Booked' : 'Register Now'}
                    </button>
                    {(user.role === 'ADMIN') && (
                      <button onClick={() => handleDelete(ev._id)} className="btn-danger" style={{ flex: 0.5 }} disabled={processingId === ev._id}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {events.length === 0 && <div className="glass-card" style={{ opacity: 0.6, width: '100%', gridColumn: '1 / -1', textAlign: 'center' }}>No events available right now.</div>}
        </div>
      )}
    </div>
  )
}

function AdminHub() {
  const [form, setForm] = useState({ title: '', date: '', location: '', description: '', imageUrl: '', capacity: '' });
  const [creating, setCreating] = useState(false);
  const { user } = useContext(AuthContext);

  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = { ...form, capacity: form.capacity ? parseInt(form.capacity) : undefined };
      await axios.post(`${API_URL}/api/events`, payload);
      setForm({ title: '', date: '', location: '', description: '', imageUrl: '', capacity: '' });
      toast.success('Admin: Event published securely.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '3rem' }}>
        <h2><PlusCircle style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Organize an Event (Admin Only)</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div style={{ flex: '1 1 300px' }}>
            <input type="text" placeholder="Event Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            <input type="text" placeholder="Location *" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="number" placeholder="Max Capacity (optional)" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} min="1" style={{ flex: 1 }} />
              <input type="url" placeholder="Cover Image URL (optional)" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} style={{ flex: 2 }} />
            </div>
          </div>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
            <textarea placeholder="Event Description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ flex: 1, minHeight: '120px' }} />
            <button type="submit" disabled={creating} style={{ width: '100%' }}>
              {creating ? <Loader2 className="loader-spin" /> : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>

      <UserManagement />
    </div>
  )
}

function MyRegistrations() {
  const [regs, setRegs] = useState([]);
  const [eventDetails, setEventDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(null);

  const fetchRegs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/registrations/my-registrations`);
      setRegs(res.data);

      res.data.forEach(async (reg) => {
        try {
          const ev = await axios.get(`${API_URL}/api/events/${reg.eventId}`);
          setEventDetails(prev => ({ ...prev, [reg.eventId]: ev.data }));
        } catch (e) {
          if (e.response?.status === 404) {
            setEventDetails(prev => ({ ...prev, [reg.eventId]: { title: 'Event Deleted (No longer exists)', date: new Date().toISOString() } }));
          }
        }
      });
    } catch (err) {
      toast.error('Failed to load your registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegs(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    setCanceling(id);
    try {
      await axios.delete(`${API_URL}/api/registrations/my-registrations/${id}`);
      toast.success('Registration canceled successfully.');
      fetchRegs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    } finally {
      setCanceling(null);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="loader-spin" size={48} color="var(--primary)" /></div>;

  return (
    <div>
      <h2>My Event Registrations</h2>
      <div className="event-grid" style={{ marginTop: '2rem' }}>
        {regs.map(reg => {
          const ev = eventDetails[reg.eventId];
          return (
            <div key={reg._id} className="glass-card" style={{ position: 'relative' }}>
              <h3 style={{ marginTop: 0 }}>{ev ? ev.title : `Event ID: ${reg.eventId}`}</h3>
              {ev && <p style={{ opacity: 0.8 }}>📅 {new Date(ev.date).toLocaleDateString()}</p>}
              <p style={{ margin: '1rem 0', color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={18} /> Status: {reg.status}
              </p>
              <small style={{ opacity: 0.5 }}>Registered on {new Date(reg.registeredAt).toLocaleString()}</small>

              <button
                onClick={() => handleCancel(reg._id)}
                className="btn-danger"
                disabled={canceling === reg._id}
                style={{ width: '100%', marginTop: '1.5rem' }}
              >
                {canceling === reg._id ? <Loader2 className="loader-spin" size={18} /> : <><XCircle size={18} /> Cancel Registration</>}
              </button>
            </div>
          );
        })}
        {regs.length === 0 && <div className="glass-card" style={{ textAlign: 'center', opacity: 0.8 }}>You are not registered for any events yet.</div>}
      </div>
    </div>
  );
}

function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications`);
      setNotifs(res.data);
    } catch (err) { } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 3000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await axios.put(`${API_URL}/api/notifications/${id}/read`);
      fetchNotifs();
    } catch (err) { toast.error('Failed to update notification'); }
  }

  const clearAll = async () => {
    if (!window.confirm('Delete all notifications entirely?')) return;
    setClearing(true);
    try {
      await axios.delete(`${API_URL}/api/notifications`);
      toast.success('Inbox cleared!');
      fetchNotifs();
    } catch (err) { toast.error('Failed to clear notifications'); } finally { setClearing(false); }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="loader-spin" size={48} color="var(--primary)" /></div>;

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell /> Notification Center
        </h2>
        {notifs.length > 0 && (
          <button onClick={clearAll} disabled={clearing} className="btn-danger" style={{ padding: '0.4rem 1rem' }}>
            {clearing ? <Loader2 className="loader-spin" size={18} /> : <><Trash2 size={16} /> Clear All</>}
          </button>
        )}
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        {notifs.map(n => (
          <div key={n._id} style={{
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderRadius: n.read ? '0' : '8px',
            marginBottom: '0.5rem',
            transition: 'background 0.3s'
          }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: n.read ? 'normal' : 'bold' }}>{n.message}</p>
              <small style={{ opacity: 0.5 }}>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
            {!n.read && (
              <button onClick={() => markRead(n._id)} style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '50px' }}>
                Mark Read
              </button>
            )}
          </div>
        ))}
        {notifs.length === 0 && <p style={{ opacity: 0.6, textAlign: 'center', padding: '2rem' }}>You're all caught up!</p>}
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <div className="app-container">
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/my-events" element={<RequireAuth><MyRegistrations /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><AdminHub /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <ToastContainer theme="light" position="bottom-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick rtlFocusLoss draggable pauseOnHover />
      </Router>
    </AuthProvider>
  );
}

export default App;
