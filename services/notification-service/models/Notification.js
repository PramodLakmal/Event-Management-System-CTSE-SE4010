const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({ 
  userId: String, 
  type: { type: String, enum: ['USER_AUTH', 'USER_NEW_EVENT', 'USER_EVENT_REG', 'ADMIN_NEW_USER', 'ADMIN_EVENT_REG', 'ADMIN_EVENT_FULL', 'USER'], default: 'USER' },
  message: String, 
  read: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now } 
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
