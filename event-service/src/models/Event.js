const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, 'Please provide an event name'],
      trim: true,
      minlength: [3, 'Event name must be at least 3 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      minlength: [10, 'Description must be at least 10 characters']
    },
    date: {
      type: Date,
      required: [true, 'Please provide an event date']
    },
    venue: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      capacity: { type: Number, required: true }
    },
    schedule: {
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true }
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0
    },
    category: {
      type: String,
      enum: ['conference', 'workshop', 'seminar', 'meeting', 'webinar', 'other'],
      default: 'other'
    },
    organizer: {
      type: String,
      required: [true, 'Please provide organizer name']
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    image: {
      type: String,
      default: null
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
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);
