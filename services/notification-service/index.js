const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notification_db';
mongoose.connect(MONGODB_URI).then(() => console.log('Connected to MongoDB - Notification DB'));

const notificationSchema = new mongoose.Schema({ userId: String, message: String, read: { type: Boolean, default: false }, createdAt: { type: Date, default: Date.now } });
const Notification = mongoose.model('Notification', notificationSchema);

const kafka = new Kafka({ clientId: 'notification-service', brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'notification-group' });

const runKafka = async () => {
    try { 
      await consumer.connect();
      await consumer.subscribe({ topic: 'EventRegistered', fromBeginning: true });
      await consumer.run({
        eachMessage: async ({ topic, message }) => {
          const payload = JSON.parse(message.value.toString());
          if (topic === 'EventRegistered') {
            console.log("Notification Service Received EventRegistered with payload:", payload);
            const notifMsg = payload.title 
               ? `You successfully registered for: ${payload.title}` 
               : `You successfully registered for Event ID: ${payload.eventId}`;
               
            const notification = new Notification({
              userId: payload.userId,
              message: notifMsg
            });
            await notification.save();
          }
        }
      });
      console.log('Connected to Kafka Consumer');
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

app.get('/health', (req, res) => res.json({ status: 'Notification Service is running' }));

app.get('/', requireAuth, async (req, res) => {
  const notifs = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(notifs);
});

app.delete('/', requireAuth, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.userId });
    res.json({ message: 'Notifications cleared' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Not found' });
    if (notification.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
