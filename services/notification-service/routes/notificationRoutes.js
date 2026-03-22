const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { getNotifications, deleteNotifications, markAsRead, deleteSingleNotification } = require('../controllers/notificationController');

const router = express.Router();

router.get('/', requireAuth, getNotifications);
router.delete('/', requireAuth, deleteNotifications);
router.delete('/:id', requireAuth, deleteSingleNotification);
router.put('/:id/read', requireAuth, markAsRead);

module.exports = router;
