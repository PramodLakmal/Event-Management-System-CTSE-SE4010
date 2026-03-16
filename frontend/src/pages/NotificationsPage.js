import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { notificationService } from '../services/api';
import './NotificationsPage.css';
import { formatDate } from '../utils/dateUtils';

function NotificationsPage({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionInProgress, setActionInProgress] = useState(null);

  useEffect(() => {
    fetchNotifications(1);
  }, [user]);

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const fetchNotifications = async (pageNum) => {
    setLoading(true);
    try {
      const response = await notificationService.getUserNotifications(user._id, pageNum, 10);
      setNotifications(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch notifications';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    setActionInProgress(notificationId);
    try {
      await notificationService.markAsRead(notificationId);
      toast.success('Notification marked as read');
      fetchNotifications(page);
    } catch (err) {
      toast.error('Failed to mark notification as read');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionInProgress('mark-all');
    try {
      await notificationService.markAllAsRead(user._id);
      toast.success('All notifications marked as read');
      fetchNotifications(1);
      setPage(1);
    } catch (err) {
      toast.error('Failed to mark all as read');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    setActionInProgress(notificationId);
    try {
      await notificationService.deleteNotification(notificationId);
      toast.success('Notification deleted');
      fetchNotifications(page);
    } catch (err) {
      toast.error('Failed to delete notification');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) {
      return;
    }

    setActionInProgress('clear-all');
    try {
      await notificationService.clearAllNotifications(user._id);
      toast.success('All notifications cleared');
      fetchNotifications(1);
      setPage(1);
    } catch (err) {
      toast.error('Failed to clear notifications');
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredNotifications = filterStatus === 'all'
    ? notifications
    : notifications.filter(n => n.status === filterStatus);

  if (loading && notifications.length === 0) {
    return <div className="container"><div className="loading">Loading notifications...</div></div>;
  }

  return (
    <div className="container">
      <div className="notifications-header">
        <h1>🔔 Notifications</h1>
        <div className="notifications-controls">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="all">All Notifications</option>
            <option value="pending">Unread</option>
            <option value="sent">Read</option>
          </select>
          {notifications.length > 0 && (
            <>
              <button
                onClick={handleMarkAllAsRead}
                disabled={actionInProgress !== null}
                className="action-btn"
              >
                Mark All as Read
              </button>
              <button
                onClick={handleClearAll}
                disabled={actionInProgress !== null}
                className="action-btn danger"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredNotifications.length > 0 ? (
        <>
          <div className="notifications-list">
            {filteredNotifications.map(notification => (
              <div
                key={notification._id}
                className={`notification-item ${notification.status}`}
              >
                <div className="notification-icon">
                  {notification.type === 'registration' && '✓'}
                  {notification.type === 'cancellation' && '✕'}
                  {notification.type === 'reminder' && '⏰'}
                  {notification.type === 'update' && 'ℹ'}
                </div>
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                <div className="notification-actions">
                  {notification.status === 'pending' && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      disabled={actionInProgress === notification._id}
                      className="action-icon"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification._id)}
                    disabled={actionInProgress === notification._id}
                    className="action-icon delete"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>{page} of {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-notifications">
          <p>No notifications yet</p>
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
