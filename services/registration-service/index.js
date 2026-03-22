const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/registration_db';
mongoose.connect(MONGODB_URI).then(() => console.log('Connected to MongoDB - Registration DB'));

const registrationSchema = new mongoose.Schema({ userId: String, eventId: String, status: String, registeredAt: { type: Date, default: Date.now } });
const Registration = mongoose.model('Registration', registrationSchema);

// Local cache for events via Async Messaging
const eventCacheSchema = new mongoose.Schema({ 
  title: String, 
  date: String, 
  location: String,
  description: String,
  imageUrl: String,
  capacity: Number
});
const EventCache = mongoose.model('EventCache', eventCacheSchema);

const kafka = new Kafka({ clientId: 'registration-service', brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'registration-event-sync-group' });

const runKafka = async () => {
    try { 
      await producer.connect(); 
      console.log('Connected to Kafka Producer'); 
      
      await consumer.connect();
      await consumer.subscribe({ topic: 'EventCreated', fromBeginning: true });
      await consumer.subscribe({ topic: 'EventUpdated', fromBeginning: true });
      await consumer.subscribe({ topic: 'EventDeleted', fromBeginning: true });
      
      await consumer.run({
        eachMessage: async ({ topic, message }) => {
          const payload = JSON.parse(message.value.toString());
          if (topic === 'EventCreated' || topic === 'EventUpdated') {
            await EventCache.findByIdAndUpdate(
              payload._id, 
              { 
                title: payload.title, date: payload.date, location: payload.location,
                description: payload.description, imageUrl: payload.imageUrl, capacity: payload.capacity
              }, 
              { upsert: true, new: true }
            );
          } else if (topic === 'EventDeleted') {
            await EventCache.findByIdAndDelete(payload.id);
          }
        }
      });
      console.log('Connected to Kafka Consumer for Event sync');
    }
    catch(err) { setTimeout(runKafka, 5000); }
}
runKafka();

const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
};

app.get('/health', (req, res) => res.json({ status: 'Registration Service is running' }));

app.get('/my-registrations', requireAuth, async (req, res) => {
  try {
    const regs = await Registration.find({ userId: req.userId }).sort({ registeredAt: -1 });
    res.json(regs);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/my-registrations/:id', requireAuth, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ error: 'Not found' });
    if (reg.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    
    await Registration.deleteOne({ _id: req.params.id });
    
    try {
      const cachedEvent = await EventCache.findById(reg.eventId);
      await producer.send({
        topic: 'EventCanceled',
        messages: [{ value: JSON.stringify({ userId: reg.userId, eventId: reg.eventId, title: cachedEvent?.title }) }]
      });
    } catch(err) {}

    res.json({ message: 'Registration cancelled' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { eventId } = req.body;
    
    // Check local EventCache instead of synchronous HTTP call!
    const cachedEvent = await EventCache.findById(eventId);
    console.log("Found cached event during registration:", cachedEvent);
    if (!cachedEvent) return res.status(400).json({ error: 'Event not found or not synced yet' });

    // Check capacity if we want, but prototype usually says just check existence
    const regCount = await Registration.countDocuments({ eventId });
    if (cachedEvent.capacity && regCount >= cachedEvent.capacity) {
      return res.status(400).json({ error: 'Event is at full capacity' });
    }

    const exists = await Registration.findOne({ userId, eventId });
    if (exists) return res.status(400).json({ error: 'Already registered' });

    const reg = new Registration({ userId, eventId, status: 'CONFIRMED' });
    await reg.save();

    // Emit EventFull if capacity has just been reached
    if (cachedEvent.capacity && (regCount + 1 === cachedEvent.capacity)) {
      try {
        await producer.send({
          topic: 'EventFull',
          messages: [{ value: JSON.stringify({ eventId, title: cachedEvent.title }) }]
        });
      } catch (e) { console.error('Kafka error EventFull', e); }
    }

    try {
      await producer.send({
        topic: 'EventRegistered',
        messages: [ { value: JSON.stringify({ userId, eventId, registrationId: reg._id, title: cachedEvent.title }) } ],
      });
    } catch (e) { console.error('Kafka error', e); }

    res.status(201).json(reg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Registration Service running on port ${PORT}`));
