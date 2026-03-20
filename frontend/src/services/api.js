import axios from 'axios';

// Use relative path for Docker, or environment variable for development
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  register: (userData) =>
    api.post('/users/register', userData),
  verify: (token) =>
    api.get('/auth/verify', { headers: { Authorization: `Bearer ${token}` } })
};

// User Service (NEW)
export const userService = {
  getProfile: () => 
    api.get('/users/profile/me'),
  updateProfile: (id, userData) => 
    api.put(`/users/${id}`, userData),
  getAllUsers: (page = 1, limit = 10) => 
    api.get(`/users?page=${page}&limit=${limit}`),
  deleteUser: (id) => 
    api.delete(`/users/${id}`)
};

// Event Service
export const eventService = {
  getAllEvents: (page = 1, limit = 10) =>
    api.get(`/events?page=${page}&limit=${limit}`),
  getEventById: (eventId) =>
    api.get(`/events/${eventId}`),
  createEvent: (eventData) =>
    api.post('/events', eventData),
  updateEvent: (eventId, eventData) =>
    api.put(`/events/${eventId}`, eventData),
  deleteEvent: (eventId) =>
    api.delete(`/events/${eventId}`),
  getEventAvailability: (eventId) =>
    api.get(`/events/${eventId}/availability`)
};

// Registration Service
export const registrationService = {
  registerForEvent: (registrationData) =>
    api.post('/registrations', registrationData),
  getUserRegistrations: (userId) =>
    api.get(`/registrations/user/${userId}`),
  getEventRegistrations: (eventId) =>
    api.get(`/registrations/event/${eventId}`),
  cancelRegistration: (registrationId) =>
    api.delete(`/registrations/${registrationId}`),
  getAllRegistrations: () =>
    api.get('/registrations')
};

// Notification Service
export const notificationService = {
  getUserNotifications: (userId, page = 1, limit = 10) =>
    api.get(`/notifications/user/${userId}?page=${page}&limit=${limit}`),
  getUnreadCount: (userId) =>
    api.get(`/notifications/user/${userId}/unread-count`),
  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/mark-read`),
  markAllAsRead: (userId) =>
    api.put(`/notifications/user/${userId}/mark-all-read`),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),
  clearAllNotifications: (userId) =>
    api.delete(`/notifications/user/${userId}/clear-all`)
};

export default api;
