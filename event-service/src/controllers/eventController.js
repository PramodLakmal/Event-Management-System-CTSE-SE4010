const Event = require('../models/Event');

/**
 * Create a new event
 * POST /events
 */
exports.createEvent = async (req, res, next) => {
  try {
    const { eventName, description, date, location, capacity, category, organizer } = req.body;

    // Validation
    if (!eventName || !description || !date || !location || !capacity || !organizer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const event = await Event.create({
      eventName,
      description,
      date: new Date(date),
      location,
      capacity,
      category,
      organizer
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all events with filtering
 * GET /events?status=upcoming&category=conference&page=1&limit=10
 */
exports.getAllEvents = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    const events = await Event.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: 1 });

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        events,
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
 * Get event by ID
 * GET /events/{id}
 */
exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update event
 * PUT /events/{id}
 */
exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating registered count directly
    delete updateData.registeredCount;

    const event = await Event.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete event
 * DELETE /events/{id}
 */
exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Increment registered count
 * POST /events/{id}/register
 */
exports.registerForEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event capacity is full'
      });
    }

    event.registeredCount += 1;
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Registration count updated',
      data: {
        eventId: event._id,
        registeredCount: event.registeredCount,
        capacity: event.capacity,
        spotsRemaining: event.capacity - event.registeredCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event availability
 * GET /events/{id}/availability
 */
exports.getEventAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        eventId: event._id,
        eventName: event.eventName,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
        spotsRemaining: event.capacity - event.registeredCount,
        isAvailable: event.registeredCount < event.capacity,
        status: event.status
      }
    });
  } catch (error) {
    next(error);
  }
};
