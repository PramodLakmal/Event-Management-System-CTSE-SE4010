import React, { useState, useContext } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import eventSyncLogo from '../assets/evenSync_logo.png';
import eventSyncText from '../assets/eventSync.png';

const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/users/login`, formData);
      const { user: userData, token } = response.data;

      login(userData, token);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      <div className="auth-banner">
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <div style={{ marginBottom: '2rem', display: 'inline-flex', background: 'white', borderRadius: '24px', padding: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <img src={eventSyncLogo} alt="EventSync Mark" style={{ height: '70px', width: '70px', objectFit: 'contain' }} />
          </div>
          <h1 className="banner-title">Welcome to the future of events.</h1>
          <p className="banner-subtitle">Create, manage, and discover extraordinary moments with our premium platform.</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-box">
          <div style={{ textAlign: 'center' }}>
            <img src={eventSyncText} alt="EventSync" style={{ height: '80px', width: 'auto' }} />
          </div>
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Please enter your details to sign in.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email or Username</label>
              <input
                id="email"
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email or username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" disabled={loading} className="submit-btn primary-glow">
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
          <p className="auth-link">
            Don't have an account? <Link to="/register">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
