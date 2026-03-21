import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../services/api';
import './ProfilePage.css';

function ProfilePage({ user }) {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      const userData = response.data.data.user; // Added .user
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || ''
      });
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (user && user._id) {
        await userService.updateProfile(user._id, {
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address
        });
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      if (user && user._id) {
        await userService.deleteUser(user._id);
        toast.success('Account deleted successfully. Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Small delay to allow the toast to show
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading profile...</div></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header-bg"></div>
      
      <div className="container">
        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="profile-avatar-large">
              {profileData.name.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2>{profileData.name}</h2>
            <p className="profile-role">{user?.role === 'admin' ? 'Administrator' : 'Member'}</p>
          </div>
          
          <div className="profile-main">
            <div className="profile-card">
              <h3>Personal Information</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={profileData.name} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={profileData.email} 
                      disabled 
                      className="disabled-input"
                    />
                  </div>
                </div>
                
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={profileData.phone} 
                      onChange={handleChange} 
                      placeholder="Add your phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={profileData.address} 
                      onChange={handleChange} 
                      placeholder="Add your address"
                    />
                  </div>
                </div>

                <div className="profile-actions">
                  <button type="submit" disabled={saving} className="save-btn">
                    {saving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="profile-card danger-zone-card">
              <h3 className="danger-text">Danger Zone</h3>
              <p className="danger-description">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              
              {!showDeleteConfirm ? (
                <button 
                  type="button" 
                  className="btn-danger" 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </button>
              ) : (
                <div className="delete-confirmation">
                  <p><strong>Are you absolutely sure?</strong></p>
                  <div className="confirmation-actions">
                    <button 
                      type="button" 
                      className="btn-danger" 
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Yes, delete my account'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-outline" 
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
