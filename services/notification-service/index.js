const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../../.env' }); // Load .env from root if running locally

const connectDB = require('./config/db');
const { runKafka } = require('./config/kafka');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();
runKafka();

app.get('/health', (req, res) => res.json({ status: 'Notification Service is running' }));

app.use('/', notificationRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
