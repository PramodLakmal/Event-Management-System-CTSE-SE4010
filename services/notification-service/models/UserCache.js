const mongoose = require('mongoose');

// Caches user details from the UserRegistered event 
// to be used later when sending emails for events that only contain userId
const userCacheSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: 'USER' }
});

const UserCache = mongoose.model('UserCache', userCacheSchema);

module.exports = UserCache;
