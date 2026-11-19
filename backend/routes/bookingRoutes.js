const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

router.post('/', verifyToken, bookingController.create);
router.get('/my', verifyToken, bookingController.myBookings);
router.get('/admin/all', verifyToken, requireRole('admin'), bookingController.adminGetAll);
router.get('/:id', verifyToken, bookingController.getDetail);
router.put('/:id', verifyToken, bookingController.userUpdateBooking);
router.patch('/:id/status', verifyToken, requireRole('admin'), bookingController.updateStatus);

module.exports = router;
