const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/event_db';
mongoose.connect(MONGODB_URI).then(() => console.log('Connected to MongoDB - Event DB'));

const eventSchema = new mongoose.Schema({ 
  title: String, 
  date: String, 
  location: String, 
  description: String,
  imageUrl: String,
  capacity: Number,
  creatorId: String,
  registrationsCount: { type: Number, default: 0 }
});
const Event = mongoose.model('Event', eventSchema);

const kafka = new Kafka({ clientId: 'event-service', brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'event-registration-sync-group' });

const connectKafka = async () => {
    try { 
      await producer.connect(); 
      console.log('Connected to Kafka Producer'); 
      
      await consumer.connect();
      await consumer.subscribe({ topic: 'EventRegistered', fromBeginning: true });
      await consumer.subscribe({ topic: 'EventCanceled', fromBeginning: true });
      
      await consumer.run({
        eachMessage: async ({ topic, message }) => {
          const payload = JSON.parse(message.value.toString());
          if (topic === 'EventRegistered') {
            await Event.findByIdAndUpdate(payload.eventId, { $inc: { registrationsCount: 1 } });
          } else if (topic === 'EventCanceled') {
            await Event.findByIdAndUpdate(payload.eventId, { $inc: { registrationsCount: -1 } });
          }
        }
      });
      console.log('Connected to Kafka Consumer for Registration sync');
    }
    catch(err) { setTimeout(connectKafka, 5000); }
}
connectKafka();

const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  req.role = req.headers['x-user-role'];
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
  next();
};

app.get('/health', (req, res) => res.json({ status: 'Event Service is running' }));
app.get('/', async (req, res) => res.json(await Event.find()));
app.get('/:id', async (req, res) => {
  if (req.params.id === 'health') return res.json({ status: 'OK' });
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch(e) { res.status(500).json({ error: 'Invalid ID' }); }
});

app.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const event = new Event({ ...req.body, creatorId: req.userId });
    await event.save();
    try {
      await producer.send({
        topic: 'EventCreated',
        messages: [{ value: JSON.stringify(event) }],
      });
    } catch(e) { console.error('Kafka error', e); }
    res.status(201).json(event);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    Object.assign(event, req.body);
    await event.save();
    try {
      await producer.send({
        topic: 'EventUpdated',
        messages: [{ value: JSON.stringify(event) }],
      });
    } catch(e) { console.error('Kafka error', e); }
    res.json(event);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
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
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Event Service running on port ${PORT}`));
