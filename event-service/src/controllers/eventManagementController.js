const Event = require('../models/Event');

// Helper to parse JSON fields if they are strings (from FormData)
const parseJsonField = (field) => {
  if (typeof field === 'string') {
    try { return JSON.parse(field); } catch (e) { return field; }
  }
  return field;
};

// Event CRUD
exports.createEvent = async (req, res) => {
    try {
        const body = { ...req.body };
        if (req.file) {
            body.image = `/uploads/${req.file.filename}`;
        }
        if (body.venue) body.venue = parseJsonField(body.venue);
        if (body.schedule) body.schedule = parseJsonField(body.schedule);

        const event = await Event.create(body);
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
        const body = { ...req.body };
        if (req.file) {
            body.image = `/uploads/${req.file.filename}`;
        }
        if (body.venue) body.venue = parseJsonField(body.venue);
        if (body.schedule) body.schedule = parseJsonField(body.schedule);
        
        const event = await Event.findByIdAndUpdate(req.params.id, body, { new: true });
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
