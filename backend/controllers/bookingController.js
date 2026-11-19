const { 
  Booking, 
  EducationalPackage, 
  Activity,
  User, 
  Payment, 
  BookingStatusHistory, 
  Notification, 
  AvailabilitySlot 
} = require('../models');
const { Op } = require('sequelize');

// Helper to generate unique booking code POL-YYYYMMDD-XXXX
const generateBookingCode = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = await Booking.count({
    where: {
      bookingCode: {
        [Op.like]: `POL-${dateStr}-%`
      }
    }
  });
  const seq = String(countToday + 1).padStart(4, '0');
  return `POL-${dateStr}-${seq}`;
};

// User Create Booking
exports.create = async (req, res) => {
  try {
    const {
      visitorName,
      email,
      phone,
      whatsapp,
      picPosition,
      schoolName,
      schoolOrigin,
      educationLevel,
      schoolAddress,
      city,
      province,
      teacherName,
      teacherPhone,
      visitDate,
      visitTimeSlot,
      studentCount,
      teacherCount,
      packageId,
      alternativePackage1Id,
      alternativePackage2Id,
      selectedActivities,
      notes
    } = req.body;

    if (!visitDate || !studentCount || !packageId) {
      return res.status(400).json({ message: 'Mohon lengkapi data tanggal kunjungan, jumlah siswa, dan paket.' });
    }

    // SERVER-SIDE SECURITY & PRICE RE-CALCULATION
    const pkg = await EducationalPackage.findByPk(packageId);
    if (!pkg) {
      return res.status(404).json({ message: 'Paket edukasi tidak ditemukan.' });
    }
    
    // Alternative Activities are directly the names from the dropdowns
    const altPkg1Name = alternativePackage1Id || null;
    const altPkg2Name = alternativePackage2Id || null;

    const sCount = parseInt(studentCount, 10) || 0;
    const tCount = parseInt(teacherCount, 10) || 0;
    const totalVisitors = sCount + tCount;

    // Validate min 20 participants
    if (sCount < 20) {
      return res.status(400).json({ 
        message: 'Minimal kunjungan adalah 20 anak.' 
      });
    }

    // Validate selected activities (MUST BE EXACTLY 2 ACTIVITIES)
    const activitiesArr = Array.isArray(selectedActivities)
      ? selectedActivities
      : (typeof selectedActivities === 'string' ? JSON.parse(selectedActivities || '[]') : []);

    if (activitiesArr.length !== 2) {
      return res.status(400).json({
        message: 'Setiap paket wajib memilih tepat 2 kegiatan kunjungan. Tidak boleh kurang atau lebih dari 2 kegiatan.'
      });
    }

    // Check availability of each selected activity
    for (const actName of activitiesArr) {
      const act = await Activity.findOne({ where: { name: actName } });
      if (!act || act.isAvailable === false || act.isActive === false) {
        return res.status(400).json({
          message: `Maaf, kegiatan ${actName} sedang tidak tersedia. Silakan pilih kegiatan lain yang tersedia.`
        });
      }
    }

    // Recalculate price strictly on server: studentCount * package.price (Teacher count is FREE)
    const packagePrice = parseFloat(pkg.price);
    const totalEstimatedCost = sCount * packagePrice;

    const bookingCode = await generateBookingCode();

    const booking = await Booking.create({
      bookingCode,
      userId: req.user.id,
      visitorName: visitorName || req.user.name,
      email: email || req.user.email,
      phone: phone || req.user.phone || '',
      whatsapp: whatsapp || phone || '',
      picPosition: picPosition || 'Umum',
      schoolName: schoolName || 'Instansi/Umum',
      schoolOrigin: schoolOrigin || '',
      educationLevel: educationLevel || 'Umum',
      schoolAddress: schoolAddress || '',
      city: city || '',
      province: province || '',
      teacherName: teacherName || '',
      teacherPhone: teacherPhone || '',
      visitDate,
      visitTimeSlot: visitTimeSlot || 'Pagi (08:30 - 11:30 WIB)',
      studentCount: sCount,
      teacherCount: tCount,
      totalVisitors,
      packageId: pkg.id,
      packageName: pkg.name,
      alternativePackage1Id: alternativePackage1Id || null,
      alternativePackage1Name: altPkg1Name,
      alternativePackage2Id: alternativePackage2Id || null,
      alternativePackage2Name: altPkg2Name,
      packagePrice,
      totalEstimatedCost,
      selectedActivities: Array.isArray(selectedActivities) ? JSON.stringify(selectedActivities) : selectedActivities || '[]',
      notes: notes || '',
      status: 'PENDING_REVIEW'
    });

    // Create Audit Log / Status History (Rule 20)
    await BookingStatusHistory.create({
      bookingId: booking.id,
      oldStatus: null,
      newStatus: 'PENDING_REVIEW',
      changedById: req.user.id,
      changedByName: req.user.name,
      notes: 'Permintaan booking berhasil dikirim oleh pemesan.'
    });

    // Notification for User
    await Notification.create({
      userId: req.user.id,
      title: 'Booking Dikirim',
      message: `Permintaan booking #${booking.bookingCode} berhasil dikirim dan sedang dalam peninjauan admin.`,
      type: 'BOOKING',
      link: `/booking/${booking.id}`
    });

    res.status(201).json({
      message: 'Booking Anda berhasil dikirim. Permintaan Anda sedang diperiksa oleh admin.',
      booking
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ message: 'Gagal membuat booking. Silakan coba lagi.' });
  }
};

// User My Bookings
exports.myBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        { model: EducationalPackage, as: 'package' },
        { model: Payment, as: 'payment' },
        { model: BookingStatusHistory, as: 'statusHistory' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil daftar booking Anda.' });
  }
};

// Single Booking Detail
exports.getDetail = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: EducationalPackage, as: 'package' },
        { model: Payment, as: 'payment' },
        { model: BookingStatusHistory, as: 'statusHistory', include: [{ model: User, as: 'changedBy', attributes: ['name'] }] }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan.' });
    }

    // Security check: User can only see own booking, Admin can see all (Rule 31)
    if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke booking ini.' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail booking.' });
  }
};

// Admin List All Bookings
exports.adminGetAll = async (req, res) => {
  try {
    const { status, search, date } = req.query;
    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (date) {
      where.visitDate = date;
    }
    if (search) {
      where[Op.or] = [
        { bookingCode: { [Op.like]: `%${search}%` } },
        { visitorName: { [Op.like]: `%${search}%` } },
        { schoolName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: EducationalPackage, as: 'package' },
        { model: Payment, as: 'payment' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data booking admin.' });
  }
};

// Admin Change Status (Approve, Reject, Request Revision, Complete, Cancel)
exports.updateStatus = async (req, res) => {
  try {
    const { status, rejectionReason, revisionNote, adminNotes } = req.body;
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan.' });
    }

    const oldStatus = booking.status;

    // Validate approval requirements
    if (status === 'APPROVED') {
      booking.status = 'APPROVED';
      booking.adminNotes = adminNotes || 'Booking disetujui admin. Silakan lakukan pembayaran.';
    } else if (status === 'REJECTED') {
      if (!rejectionReason) {
        return res.status(400).json({ message: 'Alasan penolakan wajib diisi oleh admin.' });
      }
      booking.status = 'REJECTED';
      booking.rejectionReason = rejectionReason;
      booking.adminNotes = adminNotes || '';
    } else if (status === 'REVISION_REQUESTED') {
      if (!revisionNote) {
        return res.status(400).json({ message: 'Catatan perbaikan wajib diisi oleh admin.' });
      }
      booking.status = 'REVISION_REQUESTED';
      booking.revisionNote = revisionNote;
      booking.adminNotes = adminNotes || '';
    } else if (status === 'CANCELLED') {
      booking.status = 'CANCELLED';
      booking.adminNotes = adminNotes || 'Booking dibatalkan.';
    } else if (status === 'COMPLETED') {
      booking.status = 'COMPLETED';
      booking.adminNotes = adminNotes || 'Kunjungan telah selesai.';
    } else {
      booking.status = status;
    }

    await booking.save();

    // Log status history (Rule 20)
    await BookingStatusHistory.create({
      bookingId: booking.id,
      oldStatus,
      newStatus: booking.status,
      changedById: req.user.id,
      changedByName: req.user.name,
      notes: adminNotes || rejectionReason || revisionNote || `Status diubah menjadi ${booking.status}`
    });

    // Send Notification to User
    let notifTitle = 'Status Booking Diperbarui';
    let notifMsg = `Booking #${booking.bookingCode} Anda diperbarui menjadi ${booking.status}`;

    if (booking.status === 'APPROVED') {
      notifTitle = 'Booking Disetujui! 🎉';
      notifMsg = `Booking #${booking.bookingCode} telah disetujui. Silakan lakukan pembayaran.`;
    } else if (booking.status === 'REJECTED') {
      notifTitle = 'Booking Tidak Disetujui';
      notifMsg = `Booking #${booking.bookingCode} tidak dapat disetujui: ${rejectionReason}`;
    } else if (booking.status === 'REVISION_REQUESTED') {
      notifTitle = 'Perlu Perbaikan Data Booking';
      notifMsg = `Admin meminta perbaikan data booking #${booking.bookingCode}: ${revisionNote}`;
    }

    await Notification.create({
      userId: booking.userId,
      title: notifTitle,
      message: notifMsg,
      type: 'BOOKING_STATUS',
      link: `/booking/${booking.id}`
    });

    res.json({
      message: `Status booking berhasil diubah menjadi ${booking.status}.`,
      booking
    });
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ message: 'Gagal memperbarui status booking.' });
  }
};

// User Update Booking (When in REVISION_REQUESTED state)
exports.userUpdateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan.' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Anda tidak berhak mengubah booking ini.' });
    }

    if (booking.status !== 'REVISION_REQUESTED' && booking.status !== 'PENDING_REVIEW') {
      return res.status(400).json({ message: 'Booking yang sudah diproses tidak dapat diubah lagi secara langsung.' });
    }

    const {
      schoolName,
      visitDate,
      visitTimeSlot,
      studentCount,
      teacherCount,
      selectedActivities,
      notes
    } = req.body;

    if (schoolName) booking.schoolName = schoolName;
    if (visitDate) booking.visitDate = visitDate;
    if (visitTimeSlot) booking.visitTimeSlot = visitTimeSlot;
    if (studentCount) {
      booking.studentCount = parseInt(studentCount, 10);
      booking.totalVisitors = booking.studentCount + (booking.teacherCount || 0);
      booking.totalEstimatedCost = booking.studentCount * parseFloat(booking.packagePrice);
    }
    if (teacherCount !== undefined) {
      booking.teacherCount = parseInt(teacherCount, 10);
      booking.totalVisitors = (booking.studentCount || 0) + booking.teacherCount;
    }
    if (selectedActivities) {
      booking.selectedActivities = Array.isArray(selectedActivities) ? JSON.stringify(selectedActivities) : selectedActivities;
    }
    if (notes !== undefined) booking.notes = notes;

    const oldStatus = booking.status;
    booking.status = 'PENDING_REVIEW'; // Resubmit back to review
    await booking.save();

    await BookingStatusHistory.create({
      bookingId: booking.id,
      oldStatus,
      newStatus: 'PENDING_REVIEW',
      changedById: req.user.id,
      changedByName: req.user.name,
      notes: 'Pemesan telah melakukan perbaikan data dan mengirimkan ulang booking.'
    });

    res.json({
      message: 'Perbaikan booking berhasil dikirimkan kembali untuk ditinjau admin.',
      booking
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui data booking.' });
  }
};
