const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/eventManagementController');

// Event routes
router.post('/events', ctrl.createEvent);
router.get('/events', ctrl.getEvents);
router.put('/events/:id', ctrl.updateEvent);
router.delete('/events/:id', ctrl.deleteEvent);

// Venue routes

// Schedule routes

module.exports = router;
