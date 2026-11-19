const { Payment, PaymentSetting, Booking, BookingStatusHistory, Notification } = require('../models');

// Get All Active Payment Settings (Bank BNI, BMT Muamalah, etc.)
exports.getSettings = async (req, res) => {
  try {
    let settings = await PaymentSetting.findAll({ where: { isActive: true }, order: [['id', 'ASC']] });
    if (!settings || settings.length === 0) {
      const s1 = await PaymentSetting.create({
        bankName: 'Bank BNI',
        accountName: 'Unit Pengelola Bisnis Polinela',
        accountNumber: '0123-4567-8901',
        instructions: 'Transfer ke rekening Bank BNI atas nama Unit Pengelola Bisnis Polinela. Simpan & unggah bukti transfer di halaman pembayaran.',
        isActive: true
      });
      const s2 = await PaymentSetting.create({
        bankName: 'BMT Muamalah',
        accountName: 'Unit Pengelola Bisnis Polinela',
        accountNumber: '9876-5432-1098',
        instructions: 'Transfer ke rekening BMT Muamalah atas nama Unit Pengelola Bisnis Polinela. Simpan & unggah bukti transfer di halaman pembayaran.',
        isActive: true
      });
      settings = [s1, s2];
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil pengaturan pembayaran.' });
  }
};

// Admin Update / Create Payment Setting
exports.updateSettings = async (req, res) => {
  try {
    const { id, bankName, accountName, accountNumber, instructions } = req.body;
    let setting;
    
    if (id) {
      setting = await PaymentSetting.findByPk(id);
    } else if (bankName) {
      setting = await PaymentSetting.findOne({ where: { bankName } });
    }

    if (!setting) {
      setting = new PaymentSetting();
    }

    if (bankName) setting.bankName = bankName;
    if (accountName) setting.accountName = accountName;
    if (accountNumber) setting.accountNumber = accountNumber;
    if (instructions !== undefined) setting.instructions = instructions;
    setting.isActive = true;

    await setting.save();
    res.json({ message: 'Pengaturan pembayaran berhasil disimpan.', setting });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui pengaturan pembayaran.' });
  }
};

// User Upload Payment Proof (Rule 3 & Rule 21: ONLY AVAILABLE WHEN APPROVED)
exports.uploadProof = async (req, res) => {
  try {
    const { bookingId, amount, paymentDate, senderName, bankName, proofUrl } = req.body;

    if (!bookingId || !proofUrl) {
      return res.status(400).json({ message: 'Bukti pembayaran dan ID booking wajib diisi.' });
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan.' });
    }

    // Security Check: User can only upload proof if status is APPROVED or PAYMENT_SUBMITTED (re-upload)
    if (booking.status !== 'APPROVED' && booking.status !== 'PAYMENT_SUBMITTED') {
      return res.status(400).json({ 
        message: 'Pembayaran hanya dapat dilakukan setelah booking disetujui oleh admin.' 
      });
    }

    // Create or update payment record
    let payment = await Payment.findOne({ where: { bookingId } });
    if (payment) {
      payment.amount = amount || booking.totalEstimatedCost;
      payment.paymentDate = paymentDate || new Date().toISOString().slice(0, 10);
      payment.senderName = senderName || booking.visitorName;
      payment.bankName = bankName || 'Bank Transfer';
      payment.proofUrl = proofUrl;
      payment.status = 'SUBMITTED';
      payment.rejectionReason = null;
      await payment.save();
    } else {
      payment = await Payment.create({
        bookingId,
        amount: amount || booking.totalEstimatedCost,
        paymentDate: paymentDate || new Date().toISOString().slice(0, 10),
        senderName: senderName || booking.visitorName,
        bankName: bankName || 'Bank Transfer',
        proofUrl,
        status: 'SUBMITTED'
      });
    }

    // Update booking status to PAYMENT_SUBMITTED
    const oldStatus = booking.status;
    booking.status = 'PAYMENT_SUBMITTED';
    await booking.save();

    // Log status history (Rule 20)
    await BookingStatusHistory.create({
      bookingId: booking.id,
      oldStatus,
      newStatus: 'PAYMENT_SUBMITTED',
      changedById: req.user.id,
      changedByName: req.user.name,
      notes: 'Bukti pembayaran telah diupload oleh pengguna dan menunggu verifikasi admin.'
    });

    res.json({
      message: 'Bukti pembayaran berhasil dikirim dan sedang diperiksa admin.',
      payment,
      booking
    });
  } catch (err) {
    console.error('Upload proof error:', err);
    res.status(500).json({ message: 'Gagal mengupload bukti pembayaran.' });
  }
};

// Admin Verify Payment (Rule 25)
exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan.' });
    }

    const payment = await Payment.findOne({ where: { bookingId } });
    if (!payment) {
      return res.status(404).json({ message: 'Bukti pembayaran tidak ditemukan.' });
    }

    payment.status = 'VERIFIED';
    payment.verifiedById = req.user.id;
    await payment.save();

    const oldStatus = booking.status;
    booking.status = 'CONFIRMED';
    await booking.save();

    // Audit log
    await BookingStatusHistory.create({
      bookingId: booking.id,
      oldStatus,
      newStatus: 'CONFIRMED',
      changedById: req.user.id,
      changedByName: req.user.name,
      notes: 'Pembayaran telah diverifikasi oleh admin. Booking resmi dikonfirmasi!'
    });

    // Send user notification
    await Notification.create({
      userId: booking.userId,
      title: 'Booking Dikonfirmasi! 🎉',
      message: `Pembayaran booking #${booking.bookingCode} telah diverifikasi. Kunjungan Anda resmi dikonfirmasi!`,
      type: 'BOOKING_CONFIRMED',
      link: `/booking/${booking.id}`
    });

    res.json({
      message: 'Pembayaran berhasil diverifikasi. Booking sekarang dalam status CONFIRMED.',
      booking,
      payment
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memverifikasi pembayaran.' });
  }
};

// Admin Reject Payment Proof (Rule 24)
exports.rejectPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Alasan penolakan bukti pembayaran wajib diisi.' });
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan.' });
    }

    const payment = await Payment.findOne({ where: { bookingId } });
    if (!payment) {
      return res.status(404).json({ message: 'Bukti pembayaran tidak ditemukan.' });
    }

    payment.status = 'REJECTED';
    payment.rejectionReason = rejectionReason;
    await payment.save();

    const oldStatus = booking.status;
    booking.status = 'APPROVED'; // Revert back to APPROVED so user can re-upload
    await booking.save();

    await BookingStatusHistory.create({
      bookingId: booking.id,
      oldStatus,
      newStatus: 'APPROVED',
      changedById: req.user.id,
      changedByName: req.user.name,
      notes: `Bukti pembayaran ditolak: ${rejectionReason}. Pengguna diminta mengupload ulang.`
    });

    await Notification.create({
      userId: booking.userId,
      title: 'Bukti Pembayaran Perlu Diupload Ulang',
      message: `Bukti pembayaran untuk #${booking.bookingCode} tidak disetujui: ${rejectionReason}. Silakan upload ulang bukti pembayaran yang sesuai.`,
      type: 'PAYMENT_REJECTED',
      link: `/booking/${booking.id}/payment`
    });

    res.json({
      message: 'Bukti pembayaran ditolak. Status booking dikembalikan ke APPROVED agar pengguna dapat mengupload ulang.',
      booking,
      payment
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menolak bukti pembayaran.' });
  }
};
