const express = require('express');
const router = express.Router();
const pimpinanController = require('../controllers/pimpinanController');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

// Seluruh endpoint pimpinan wajib terautentikasi dan memiliki hak akses role 'pimpinan'
router.use(verifyToken, requireRole('pimpinan'));

// 1. Dashboard summary & 8 grafik analitik dari database aktual
router.get('/dashboard', pimpinanController.getDashboardStats);

// 2. Tabel rekapitulasi dengan filter, search, sort, pagination
router.get('/rekapitulasi', pimpinanController.getRekapitulasi);

// 3. Ekspor data lengkap untuk PDF & Excel
router.get('/export', pimpinanController.getExportData);

module.exports = router;

