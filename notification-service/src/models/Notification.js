const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'Please provide user ID']
    },
    type: {
      type: String,
      enum: ['registration', 'cancellation', 'reminder', 'update'],
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide notification title']
    },
    message: {
      type: String,
      required: [true, 'Please provide notification message']
    },
    eventId: {
      type: String,
      default: null
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'in-app'],
      default: 'in-app'
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    sentAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ status: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
