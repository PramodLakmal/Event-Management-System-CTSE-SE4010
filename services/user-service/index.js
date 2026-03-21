const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/user_db';

const userSchema = new mongoose.Schema({ 
  name: String, 
  email: { type: String, unique: true }, 
  password: { type: String, select: false },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' }
});
const User = mongoose.model('User', userSchema);

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

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  req.role = req.headers['x-user-role'];
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
  next();
};

app.get('/health', (req, res) => res.json({ status: 'User Service is running' }));

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const isFirstUser = (await User.countDocuments()) === 0;
    
    const user = new User({ name, email, password: hashedPassword, role: isFirstUser ? 'ADMIN' : 'USER' });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/profile', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user);
});

app.get('/:id', async (req, res) => {
  if (req.params.id === 'health') return res.json({ status: 'OK' });
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/', requireAuth, requireAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
