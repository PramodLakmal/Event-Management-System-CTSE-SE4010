const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ 
  name: String, 
  email: { type: String, unique: true }, 
  password: { type: String, select: false },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  phone: String,
  address: String
});

const User = mongoose.model('User', userSchema);
module.exports = User;
