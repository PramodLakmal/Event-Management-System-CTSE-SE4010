const Registration = require('../models/Registration');
const { publishMessage } = require('../config/kafka');
const { verifyUser, getEventAvailability, registerUserForEvent } = require('../utils/serviceClient');

/**
 * Register user for event
 * POST /registrations
 */
exports.registerUserForEvent = async (req, res, next) => {
  try {
    const { userId, eventId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    // Validate input
    if (!userId || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and eventId'
      });
    }

    // Check if already registered
    const existing = await Registration.findOne({ userId, eventId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User already registered for this event'
      });
    }

    // Verify user exists
    const user = await verifyUser(userId, token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found or unauthorized'
      });
    }

    // Check event availability
    const availability = await getEventAvailability(eventId);
    if (!availability) {
      return res.status(400).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Event is at full capacity'
      });
    }

    // Register in Event Service
    const eventRegistration = await registerUserForEvent(eventId);
    if (!eventRegistration) {
      return res.status(400).json({
        success: false,
        message: 'Failed to register for event'
      });
    }

    // Save registration in database
    const registration = await Registration.create({
      userId,
      eventId
    });

    // Publish event to Kafka for notification service
    await publishMessage('registration-events', {
      type: 'USER_REGISTERED',
      userId,
      eventId,
      userName: user.name,
      userEmail: user.email,
      registrationId: registration._id,
      timestamp: new Date(),
      correlationId: `reg-${registration._id}`
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        registration,
        eventDetails: eventRegistration
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user registrations
 * GET /registrations?userId={id}
 */
exports.getUserRegistrations = async (req, res, next) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId'
      });
    }

    const skip = (page - 1) * limit;
    const registrations = await Registration.find({ userId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ registrationDate: -1 });

    const total = await Registration.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        registrations,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event registrations
 * GET /registrations/event/{eventId}
 */
exports.getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const registrations = await Registration.find({ eventId })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Registration.countDocuments({ eventId });

    res.status(200).json({
      success: true,
      data: {
        eventId,
        registrations,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel registration
 * DELETE /registrations/{id}
 */
exports.cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findByIdAndUpdate(
      id,
      { status: 'cancelled', updatedAt: new Date() },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Publish cancellation event to Kafka
    await publishMessage('registration-events', {
      type: 'REGISTRATION_CANCELLED',
      registrationId: registration._id,
      userId: registration.userId,
      eventId: registration.eventId,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      data: { registration }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all registrations
 * GET /registrations
 */
exports.getAllRegistrations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const registrations = await Registration.find()
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Registration.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        registrations,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
