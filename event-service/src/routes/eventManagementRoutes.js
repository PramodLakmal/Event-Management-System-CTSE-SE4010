const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/eventManagementController');
const upload = require('../middleware/upload');

// Event routes
router.post('/events', upload.single('image'), ctrl.createEvent);
router.get('/events', ctrl.getEvents);
router.put('/events/:id', upload.single('image'), ctrl.updateEvent);
router.delete('/events/:id', ctrl.deleteEvent);

// Venue routes

// Schedule routes

module.exports = router;
