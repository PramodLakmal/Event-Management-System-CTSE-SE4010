const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// Public routes
router.post('/', registrationController.registerUserForEvent);
router.get('/', registrationController.getAllRegistrations);
router.get('/user', registrationController.getUserRegistrations);
router.get('/event/:eventId', registrationController.getEventRegistrations);
router.delete('/:id', registrationController.cancelRegistration);

module.exports = router;
