import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import EventManagement from '../components/EventManagement';
import './AdminDashboard.css';

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('users');

  // User state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(page);
    }
  }, [page, activeTab]);

  const fetchUsers = async (pageNum) => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers(pageNum, 10);
      setUsers(response.data.data.users || []);
      setTotalPages(response.data.data.pagination?.pages || 1);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setDeletingId(userId);
    try {
      await userService.deleteUser(userId);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && activeTab === 'users' && users.length === 0) {
    return <div className="container"><div className="loading">Loading dashboard...</div></div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header-bg"></div>
      
      <div className="container admin-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage system users, events, and view activity</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Event Management
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>User Management</h2>
              <div className="badge admin-count-badge">Total Users: {users.length}</div>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-small">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{formatDate(u.createdAt)}</td>
                        <td>
                          {u._id !== user._id && (
                            <button 
                              className="btn-danger-sm"
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={deletingId === u._id}
                            >
                              {deletingId === u._id ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-state">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="page-btn"
                >
                  Prev
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
        )}

        {activeTab === 'events' && <EventManagement />}
      </div>
    </div>
  );
}

export default AdminDashboard;

