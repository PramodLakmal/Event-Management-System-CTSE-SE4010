const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const { producer, consumer } = require('./src/config/kafka');
const Event = require('./src/models/Event');
const eventRoutes = require('./src/routes/eventRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/event_db';
mongoose.connect(MONGODB_URI).then(() => console.log('Connected to MongoDB - Event DB'));

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

app.get('/health', (req, res) => res.json({ status: 'Event Service is running' }));
app.use('/', eventRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Event Service running on port ${PORT}`));
