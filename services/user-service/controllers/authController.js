const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { publishEvent } = require('../config/kafka');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const isFirstUser = (await User.countDocuments()) === 0;
    
    const user = new User({ name, email, password: hashedPassword, role: isFirstUser ? 'ADMIN' : 'USER' });
    await user.save();
    //Test comment
    
    const totalNonAdminUsers = await User.countDocuments({ role: { $ne: 'ADMIN' } });
    
    await publishEvent('UserRegistered', {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      totalNonAdminUsers
    });

    res.status(201).json({ message: 'User registered' });
  } catch(e) { res.status(500).json({ error: e.message }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ 
      $or: [{ email: email }, { name: email }] 
    }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    await publishEvent('UserLoggedIn', {
      userId: user._id.toString(),
      name: user.name,
      email: user.email
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch(e) { res.status(500).json({ error: e.message }); }
};

module.exports = { register, login };
