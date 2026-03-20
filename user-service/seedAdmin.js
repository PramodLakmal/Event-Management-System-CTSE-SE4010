require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const User = require('./src/models/User');

const seedAdmin = async () => {
  try {
    await connectDB();
    
    const adminEmail = 'admin@example.com';
    const adminPassword = 'password123';
    
    // Check if user exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin already exists, deleting and recreating to ensure consistent password hash...');
      await User.deleteOne({ email: adminEmail });
    }
    
    const adminUser = new User({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      phone: '1234567890',
      address: 'Admin Office'
    });
    
    await adminUser.save();
    
    console.log(`Successfully created admin user:`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
