import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import Navigation from './components/Navigation';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const handleLogin = (user, token) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      {isAuthenticated && <Navigation user={currentUser} onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/events" replace /> : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/events" replace /> : <RegisterPage onRegister={handleLogin} />
          }
        />
        <Route
          path="/events"
          element={isAuthenticated ? <EventsPage user={currentUser} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/events/:eventId"
          element={
            isAuthenticated ? <EventDetailPage user={currentUser} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/my-registrations"
          element={
            isAuthenticated ? <MyRegistrationsPage user={currentUser} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated ? <NotificationsPage user={currentUser} /> : <Navigate to="/login" replace />
          }
        />
        {/* NEW ROUTES */}
        <Route
          path="/profile"
          element={
            isAuthenticated ? <ProfilePage user={currentUser} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            isAuthenticated && currentUser?.role === 'admin' ? 
              <AdminDashboard user={currentUser} /> : 
              <Navigate to="/events" replace />
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? '/events' : '/login'} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
