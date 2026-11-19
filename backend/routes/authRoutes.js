const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.me);
router.put('/profile', verifyToken, authController.updateProfile);

// Admin User Management
router.get('/users', verifyToken, requireRole('admin'), authController.getAllUsers);
router.patch('/users/:id/status', verifyToken, requireRole('admin'), authController.toggleUserStatus);

module.exports = router;
