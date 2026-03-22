const User = require('../models/User');
const { publishEvent } = require('../config/kafka');

const getProfile = async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user);
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await publishEvent('UserProfileUpdated', {
      userId: user._id.toString(),
      name: user.name
    });

    res.json(user);
  } catch(e) { 
    res.status(500).json({ error: e.message }); 
  }
};

const getUserById = async (req, res) => {
  if (req.params.id === 'health') return res.json({ status: 'OK' });
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch(e) { res.status(500).json({ error: e.message }); }
};

const getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
};

module.exports = { getProfile, updateProfile, getUserById, getAllUsers, deleteUser };
