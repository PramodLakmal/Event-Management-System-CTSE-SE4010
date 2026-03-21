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

module.exports = { requireAuth, requireAdmin };
