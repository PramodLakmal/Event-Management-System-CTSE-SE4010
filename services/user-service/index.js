const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const { connectProducer } = require('./config/kafka');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();
connectProducer();

app.get('/health', (req, res) => res.json({ status: 'User Service is running' }));

app.use('/', authRoutes);
app.use('/', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
