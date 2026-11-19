const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

router.get('/', activityController.getAll);
router.post('/', verifyToken, requireRole('admin'), activityController.create);
router.put('/:id', verifyToken, requireRole('admin'), activityController.update);
router.patch('/:id/toggle', verifyToken, requireRole('admin'), activityController.toggleAvailability);

module.exports = router;
