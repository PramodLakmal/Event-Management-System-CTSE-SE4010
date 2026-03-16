const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');

// More specific routes must come BEFORE generic routes
// Get unread notification count
router.get('/user/:userId/unread-count', getUnreadCount);

// Mark all notifications as read for a user
router.put('/user/:userId/mark-all-read', markAllAsRead);

// Clear all notifications for a user
router.delete('/user/:userId/clear-all', clearAllNotifications);

// Get all notifications for a user (generic route)
router.get('/user/:userId', getUserNotifications);

// Get single notification
router.get('/:notificationId', getNotificationById);

// Mark notification as read
router.put('/:notificationId/mark-read', markNotificationAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

// Clear all notifications for a user
router.delete('/user/:userId/clear-all', clearAllNotifications);

module.exports = router;
