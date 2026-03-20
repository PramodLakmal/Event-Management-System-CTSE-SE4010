require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://localhost:3002';
const REGISTRATION_SERVICE_URL = process.env.REGISTRATION_SERVICE_URL || 'http://localhost:3003';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3006', 'http://localhost:3000', 'http://localhost', 'http://localhost:80', 'http://frontend:80', 'http://frontend:3006'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Rate limiter for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased to 100 to prevent lockout during testing
  message: 'Too many login attempts, please try again later'
});

app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Gateway is running',
    timestamp: new Date().toISOString()
  });
});

// Proxy routes to User Service
app.use('/api/users', proxy(USER_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/users${req.path}`
}));

// Apply auth limiter primarily to login
app.use('/api/auth/login', authLimiter);

// Auth routes map to user service /users path
app.use('/api/auth', proxy(USER_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/users${req.path}`
}));

// Proxy routes to Event Service
app.use('/api/events', proxy(EVENT_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/events${req.path}`
}));

// Proxy routes to Registration Service
app.use('/api/registrations', proxy(REGISTRATION_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/registrations${req.path}`
}));

// Proxy routes to Notification Service
app.use('/api/notifications', proxy(NOTIFICATION_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/notifications${req.path}`
}));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Event Management System API Gateway',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      auth: '/api/auth',
      events: '/api/events',
      registrations: '/api/registrations',
      notifications: '/api/notifications'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Gateway error:', error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal Gateway Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`User Service: ${USER_SERVICE_URL}`);
  console.log(`Event Service: ${EVENT_SERVICE_URL}`);
  console.log(`Registration Service: ${REGISTRATION_SERVICE_URL}`);
  console.log(`Notification Service: ${NOTIFICATION_SERVICE_URL}`);
});

module.exports = app;
