const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

router.get('/', packageController.getAll);
router.get('/:id', packageController.getOne);
router.post('/', verifyToken, requireRole('admin'), packageController.create);
router.put('/:id', verifyToken, requireRole('admin'), packageController.update);

module.exports = router;
