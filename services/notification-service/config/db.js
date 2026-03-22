const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notification_db';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB - Notification DB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
