const Event = require('../models/Event');

// Event CRUD
exports.createEvent = async (req, res) => {
    try {
        const event = await Event.create(req.body);
        res.status(201).json(event);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(event);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Venue CRUD

// Schedule CRUD
