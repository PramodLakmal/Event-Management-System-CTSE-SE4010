const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

const extractUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      req.role = decoded.role;
    } catch(e) {}
  }
  next();
};

app.use(extractUser);

app.get('/health', (req, res) => res.json({ message: 'API Gateway is running' }));

app.use('/', createProxyMiddleware({
  target: 'http://localhost:3000', // Default fallback target
  router: {
    '/api/users': process.env.USER_SERVICE_URL || 'http://user-service:3001',
    '/api/events': process.env.EVENT_SERVICE_URL || 'http://event-service:3002',
    '/api/registrations': process.env.REGISTRATION_SERVICE_URL || 'http://registration-service:3003',
    '/api/notifications': process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004'
  },
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '',
    '^/api/events': '',
    '^/api/registrations': '',
    '^/api/notifications': ''
  },
  on: {
    proxyReq: (proxyReq, req, res) => {
      proxyReq.removeHeader('x-user-id');
      proxyReq.removeHeader('x-user-role');
      if (req.userId) proxyReq.setHeader('x-user-id', req.userId);
      if (req.role) proxyReq.setHeader('x-user-role', req.role);
    }
  }
}));

const PORT = 3000;
app.listen(PORT, () => console.log(`API Gateway listening on port ${PORT}`));
