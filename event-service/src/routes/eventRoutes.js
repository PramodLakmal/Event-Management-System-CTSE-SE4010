const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Public routes
router.post('/', eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.get('/:id/availability', eventController.getEventAvailability);

// Protected routes
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.post('/:id/register', eventController.registerForEvent);

module.exports = router;
