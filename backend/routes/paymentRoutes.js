const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

router.get('/settings', paymentController.getSettings);
router.put('/settings', verifyToken, requireRole('admin'), paymentController.updateSettings);
router.post('/upload', verifyToken, paymentController.uploadProof);
router.post('/:bookingId/verify', verifyToken, requireRole('admin'), paymentController.verifyPayment);
router.post('/:bookingId/reject', verifyToken, requireRole('admin'), paymentController.rejectPayment);

module.exports = router;
