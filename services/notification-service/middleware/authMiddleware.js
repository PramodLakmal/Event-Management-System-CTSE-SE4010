const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  req.userRole = userRole;
  next();
};

module.exports = { requireAuth };
