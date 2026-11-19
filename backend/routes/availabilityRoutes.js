const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

router.get('/', availabilityController.getAvailability);
router.post('/slot', verifyToken, requireRole('admin'), availabilityController.setSlot);

module.exports = router;
