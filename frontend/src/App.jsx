import { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader2, Bell, LogOut, XCircle, CheckCircle, Users, UserCircle, Trash2 } from 'lucide-react';
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
  };

  return (
    <div>
      <h2 style={{ marginTop: '1rem' }}>Upcoming Events</h2>
      {loadingEvents ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="loader-spin" size={48} color="var(--primary)" /></div>
      ) : (
        <div className="event-grid">
          {events.map(ev => {
            const actualImgUrl = ev.imageUrl?.startsWith('/') ? `${API_URL}${ev.imageUrl}` : ev.imageUrl;
            const coverStyle = actualImgUrl ? { backgroundImage: `url(${actualImgUrl})` } : { background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)' };
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
                    {(ev.startTime || ev.endTime) && (
                      <p style={{ margin: '0.5rem 0' }}><strong>⏰ Time:</strong> {ev.startTime || '--'} to {ev.endTime || '--'}</p>
                    )}
                    <p style={{ margin: '0.5rem 0' }}><strong>📍 Location:</strong> {ev.location}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => handleRegister(ev._id)} style={{ flex: 1 }} disabled={processingId === ev._id || full}>
                      {processingId === ev._id ? <Loader2 className="loader-spin" size={18} /> : full ? 'Fully Booked' : 'Register Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {events.length === 0 && (
            <div className="glass-card" style={{ opacity: 0.6, width: '100%', gridColumn: '1 / -1', textAlign: 'center' }}>No events available right now.</div>
          )}
        </div>
      )}
    </div>
  );
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
              <button onClick={() => handleCancel(reg._id)} className="btn-danger" disabled={canceling === reg._id} style={{ width: '100%', marginTop: '1.5rem' }}>
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
  const [openSections, setOpenSections] = useState({
    auth: true,
    newEvents: true,
    regs: true,
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
    const interval = setInterval(fetchNotifs, 3000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await axios.put(`${API_URL}/api/notifications/${id}/read`);
      fetchNotifs();
    } catch (err) { toast.error('Failed to update notification'); }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/notifications/${id}`);
      fetchNotifs();
      toast.success('Notification removed');
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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="loader-spin" size={48} color="var(--primary)" /></div>;

  const authNotifs = notifs.filter(n => n.type === 'USER_AUTH');
  const newEventNotifs = notifs.filter(n => n.type === 'USER_NEW_EVENT');
  const regNotifs = notifs.filter(n => n.type === 'USER_EVENT_REG');
  const otherNotifs = notifs.filter(n => !['USER_AUTH', 'USER_NEW_EVENT', 'USER_EVENT_REG'].includes(n.type));

  const NotificationList = ({ title, icon, list, sectionKey }) => {
    if (list.length === 0) return null;
    const isOpen = openSections[sectionKey];
    return (
      <div style={{ marginBottom: '2rem' }}>
        <h3 
          onClick={() => toggleSection(sectionKey)}
          style={{ 
            borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem', marginBottom: '1rem', 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none',
            fontSize: '1.1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{icon} {title}</div>
          <span style={{ fontSize: '0.8rem', opacity: 0.6, background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
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
              <p style={{ margin: '0 0 0.3rem 0', fontWeight: n.read ? 'normal' : '600', color: 'var(--text-main)' }}>{n.message}</p>
              <small style={{ opacity: 0.5, color: 'var(--text-main)' }}>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {!n.read && (
                <button onClick={() => markRead(n._id)} style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '50px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Mark as Read
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
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bell /> Notification Center</h2>
        {notifs.length > 0 && (
          <button onClick={clearAll} disabled={clearing} className="btn-danger" style={{ padding: '0.4rem 1rem' }}>
            {clearing ? <Loader2 className="loader-spin" size={18} /> : 'Clear All'}
          </button>
        )}
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        {notifs.length === 0 ? (
          <p style={{ opacity: 0.6, textAlign: 'center', padding: '2rem' }}>You're all caught up!</p>
        ) : (
          <>
            <NotificationList title="New Event Alerts" icon={<Bell size={18} color="var(--primary)"/>} list={newEventNotifs} sectionKey="newEvents" />
            <NotificationList title="My Event Registrations" icon={<CheckCircle size={18} color="var(--primary)"/>} list={regNotifs} sectionKey="regs" />
            <NotificationList title="Account & Security" icon={<UserCircle size={18} color="var(--primary)"/>} list={authNotifs} sectionKey="auth" />
            <NotificationList title="Other Notifications" icon={<Bell size={18} color="var(--primary)"/>} list={otherNotifs} sectionKey="others" />
          </>
        )}
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
        <Route path="/admin" element={<RequireAuth><UserManagement /></RequireAuth>} />
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
