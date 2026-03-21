const Event = require('../models/Event');
const { producer } = require('../config/kafka');

const getEvents = async (req, res) => res.json(await Event.find().select('-image.data'));

const getEventById = async (req, res) => {
  if (req.params.id === 'health') return res.json({ status: 'OK' });
  try {
    const event = await Event.findById(req.params.id).select('-image.data');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch(e) { res.status(500).json({ error: 'Invalid ID' }); }
};

const createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, creatorId: req.userId };
    if (req.file) {
      eventData.image = { data: req.file.buffer, contentType: req.file.mimetype };
    }
    const event = new Event(eventData);
    if (req.file) {
      event.imageUrl = `/api/events/${event._id}/image`;
    }
    await event.save();
    try {
      await producer.send({
        topic: 'EventCreated',
        messages: [{ value: JSON.stringify(event) }],
      });
    } catch(e) { console.error('Kafka error', e); }
    res.status(201).json(event);
  } catch(e) { res.status(500).json({ error: e.message }); }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    
    // Combine req.body changes
    Object.assign(event, req.body);
    // If a new image was uploaded, override the imageUrl
    if (req.file) {
      event.image = { data: req.file.buffer, contentType: req.file.mimetype };
      event.imageUrl = `/api/events/${event._id}/image`;
    }

    await event.save();
    try {
      await producer.send({
        topic: 'EventUpdated',
        messages: [{ value: JSON.stringify(event) }],
      });
    } catch(e) { console.error('Kafka error', e); }
    res.json(event);
  } catch(e) { res.status(500).json({ error: e.message }); }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    await Event.deleteOne({ _id: req.params.id });
    try {
      await producer.send({
        topic: 'EventDeleted',
        messages: [{ value: JSON.stringify({ id: req.params.id }) }],
      });
    } catch(e) { console.error('Kafka error', e); }
    res.json({ message: 'Deleted successfully' });
  } catch(e) { res.status(500).json({ error: e.message }); }
};

const getEventImage = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.image || !event.image.data) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.set('Content-Type', event.image.contentType);
    res.send(event.image.data);
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
};

module.exports = { getEvents, getEventById, getEventImage, createEvent, updateEvent, deleteEvent };
