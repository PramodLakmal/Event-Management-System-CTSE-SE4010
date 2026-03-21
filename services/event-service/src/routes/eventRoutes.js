const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.get('/:id/image', eventController.getEventImage);
router.post('/', requireAuth, requireAdmin, upload.single('image'), eventController.createEvent);
router.put('/:id', requireAuth, requireAdmin, upload.single('image'), eventController.updateEvent);
router.delete('/:id', requireAuth, requireAdmin, eventController.deleteEvent);

module.exports = router;
