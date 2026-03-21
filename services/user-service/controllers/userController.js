const User = require('../models/User');

const getProfile = async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user);
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

module.exports = { getProfile, getUserById, getAllUsers, deleteUser };
