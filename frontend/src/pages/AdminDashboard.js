import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import './AdminDashboard.css';

function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchUsers(page);
  }, [page, roleFilter]); // fetch when page or role filter changes

  const fetchUsers = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers(pageNum, 10, searchTerm, roleFilter);
      setUsers(response.data.data.users || []);
      setTotalPages(response.data.data.pagination?.pages || 1);
      if (pageNum !== page) setPage(pageNum);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setProcessingId(userId);
    try {
      await userService.updateUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'suspended'} successfully`);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;

    setProcessingId(userId);
    try {
      await userService.updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setDeletingId(userId);
    try {
      await userService.deleteUser(userId);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && users.length === 0) {
    return <div className="container"><div className="loading">Loading dashboard...</div></div>;
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
            <div className="badge admin-count-badge">Total Users: {users.length}</div>
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
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map(u => (
                    <tr key={u.id} className={!u.isActive ? 'user-suspended' : ''}>
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
                        <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        {u.id !== user.id && (
                          <div className="action-buttons">
                            <button
                              className={`btn-sm ${u.isActive ? 'btn-warning-sm' : 'btn-success-sm'}`}
                              onClick={() => handleToggleStatus(u.id, u.isActive)}
                              disabled={processingId === u.id}
                            >
                              {u.isActive ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              className="btn-info-sm"
                              onClick={() => handleToggleRole(u.id, u.role)}
                              disabled={processingId === u.id}
                            >
                              Make {u.role === 'admin' ? 'User' : 'Admin'}
                            </button>
                            <button
                              className="btn-danger-sm"
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={deletingId === u.id}
                            >
                              {deletingId === u.id ? 'Deleting...' : 'Delete'}
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
