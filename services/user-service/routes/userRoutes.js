const express = require('express');
const { getProfile, getUserById, getAllUsers, deleteUser } = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', requireAuth, getProfile);
router.get('/:id', getUserById);
router.get('/', requireAuth, requireAdmin, getAllUsers);
router.delete('/:id', requireAuth, requireAdmin, deleteUser);

module.exports = router;
