import React, { useState, useContext } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import eventSyncLogo from '../assets/evenSync_logo.png';
import eventSyncText from '../assets/eventSync.png';

const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/users/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed. Please try again.';
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
          <h1 className="banner-title">Join our community.</h1>
          <p className="banner-subtitle">Create an account and start managing your events with unparalleled elegance and power.</p>
        </div>
      </div>
      
      <div className="auth-form-side">
        <div className="auth-box">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src={eventSyncText} alt="EventSync" style={{ height: '40px', width: 'auto' }} />
          </div>
          <h2>Create Account</h2>
          <p className="auth-subtitle">Sign up to get started</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
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
                placeholder="Create a password"
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                minLength={6}
              />
            </div>
            <button type="submit" disabled={loading} className="submit-btn primary-glow">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
