const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({ 
  title: String, 
  date: String, 
  startTime: String,
  endTime: String,
  location: String, 
  description: String,
  imageUrl: String,
  image: {
    data: Buffer,
    contentType: String
  },
  capacity: Number,
  creatorId: String,
  registrationsCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Event', eventSchema);
