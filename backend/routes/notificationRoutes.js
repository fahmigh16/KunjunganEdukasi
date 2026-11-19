const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/my', verifyToken, notificationController.getMyNotifications);
router.patch('/:id/read', verifyToken, notificationController.markRead);

module.exports = router;
