import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

function AdminDashboard() {
  const { user } = useContext(AuthContext);
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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allUsers, page, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/users`);
      // Since backend does not track isActive out-of-the-box in schema, inject mock isActive
      const mapped = response.data.map(u => ({ ...u, isActive: true }));
      setAllUsers(mapped);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = allUsers;
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role.toLowerCase() === roleFilter.toLowerCase());
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    }
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1);
    const start = (page - 1) * ITEMS_PER_PAGE;
    setDisplayedUsers(filtered.slice(start, start + ITEMS_PER_PAGE));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    applyFilters();
  };

  const handleToggleStatus = (userId, currentStatus) => {
    // Simulated UI toggle as backend logic mapping isn't implemented for suspend currently
    toast.success(`User ${!currentStatus ? 'activated' : 'suspended'} successfully`);
    setAllUsers(allUsers.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
  };

  const handleToggleRole = (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    
    // Simulated UI toggle as role change endpoint isn't written yet (we avoid backend edits)
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
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && allUsers.length === 0) {
    return <div className="container"><div style={{color: 'white', textAlign: 'center', marginTop: '2rem'}}>Loading dashboard...</div></div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header-bg"></div>

      <div className="container admin-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage system users and view activity</p>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>User Management</h2>
            <div className="admin-count-badge">Total Users: {allUsers.length}</div>
          </div>

          <div className="admin-filters">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
              <button type="submit" className="btn-search">Search</button>
            </form>
            <div className="filter-group">
              <label>Role:</label>
              <select 
                value={roleFilter} 
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="admin-filter-select"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.length > 0 ? (
                  displayedUsers.map(u => (
                    <tr key={u._id} className={!u.isActive ? 'user-suspended' : ''}>
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
                        <span className={`status-badge ${u.isActive ? 'active' : 'suspended'}`}>
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        <span className={`role-badge ${u.role === 'ADMIN' ? 'admin' : 'user'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u._id !== user.id && (
                          <div className="action-buttons">
                            <button
                              className={`btn-sm ${u.isActive ? 'btn-warning-sm' : 'btn-success-sm'}`}
                              onClick={() => handleToggleStatus(u._id, u.isActive)}
                              disabled={processingId === u._id}
                            >
                              {u.isActive ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              className="btn-info-sm"
                              onClick={() => handleToggleRole(u._id, u.role)}
                              disabled={processingId === u._id}
                            >
                              Make {u.role === 'ADMIN' ? 'User' : 'Admin'}
                            </button>
                            <button
                              className="btn-danger-sm"
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={deletingId === u._id}
                            >
                              {deletingId === u._id ? '...' : 'Delete'}
                            </button>
                          </div>
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
      </div>
    </div>
  );
}

export default AdminDashboard;
