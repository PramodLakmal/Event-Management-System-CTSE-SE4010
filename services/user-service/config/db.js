const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/user_db';

const connectDB = () => {
  mongoose.connect(MONGODB_URI).then(async () => {
    console.log('Connected to MongoDB - User DB');
    const existing = await User.findOne({ email: 'admin' });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      const admin = new User({ name: 'System Admin', email: 'admin', password: hashedPassword, role: 'ADMIN' });
      await admin.save();
      console.log('Created default admin (admin / admin)');
    }
  });
};

module.exports = connectDB;
