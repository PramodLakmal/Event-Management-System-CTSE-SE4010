require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const eventManagementRoutes = require('./src/routes/eventManagementRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// Also serve at /events/uploads for requests coming through the api-gateway
app.use('/events/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes

app.use('/', eventManagementRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Event Service is running',
    service: process.env.SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, () => {
  console.log(`${process.env.SERVICE_NAME} is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
