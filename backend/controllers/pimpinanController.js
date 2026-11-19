const { Booking, Payment, EducationalPackage, Activity, User, AvailabilitySlot } = require('../models');
const { Op } = require('sequelize');

/**
 * Helper to build Sequelize where clause based on filter period
 */
const buildDateWhere = (period, startDate, endDate) => {
  const where = {};
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  if (period === 'today') {
    where.visitDate = todayStr;
  } else if (period === 'weekly') {
    // Current week: from 6 days ago to today (or current 7-day window)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const startStr = sevenDaysAgo.toISOString().slice(0, 10);
    where.visitDate = { [Op.gte]: startStr };
  } else if (period === 'monthly') {
    // Current month: YYYY-MM
    const monthStr = todayStr.slice(0, 7); // '2026-11'
    where.visitDate = { [Op.like]: `${monthStr}%` };
  } else if (period === 'yearly') {
    // Current year: YYYY
    const yearStr = todayStr.slice(0, 4); // '2026'
    where.visitDate = { [Op.like]: `${yearStr}%` };
  } else if (period === 'custom') {
    if (startDate && endDate) {
      where.visitDate = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.visitDate = { [Op.gte]: startDate };
    } else if (endDate) {
      where.visitDate = { [Op.lte]: endDate };
    }
  }
  // If period === 'all' or empty, no date filter is applied

  return where;
};

/**
 * Standardize education level categories
 */
const normalizeEducationLevel = (rawLevel) => {
  if (!rawLevel) return 'Lainnya';
  const lvl = String(rawLevel).trim().toUpperCase();
  if (lvl.includes('TK') || lvl.includes('PAUD') || lvl.includes('KB') || lvl.includes('RA')) {
    return 'TK/PAUD';
  }
  if (lvl.includes('SD') || lvl.includes('MI')) {
    return 'SD/MI';
  }
  if (lvl.includes('SMP') || lvl.includes('MTS')) {
    return 'SMP/MTs';
  }
  if (lvl.includes('SMA') || lvl.includes('SMK') || lvl.includes('MA')) {
    return 'SMA/SMK/MA';
  }
  if (lvl.includes('KULIAH') || lvl.includes('PERGURUAN') || lvl.includes('MAHASISWA') || lvl.includes('POLINELA') || lvl.includes('UNIVERSITAS') || lvl.includes('POLITEKNIK')) {
    return 'Perguruan Tinggi';
  }
  return 'Lainnya / Umum';
};

/**
 * GET /api/pimpinan/dashboard
 * Mengambil ringkasan kartu, 8 grafik analitik, dan tren dari data database aktual
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    const dateWhere = buildDateWhere(period, startDate, endDate);

    // 1. Fetch All Bookings within the filtered period with related Payment
    const bookings = await Booking.findAll({
      where: dateWhere,
      include: [
        {
          model: Payment,
          as: 'payment',
          required: false
        }
      ],
      order: [['visitDate', 'ASC']]
    });

    // Fetch all master activities and packages for complete mapping
    const allActivities = await Activity.findAll({ order: [['name', 'ASC']] });
    const allPackages = await EducationalPackage.findAll({ order: [['id', 'ASC']] });

    // ---------------------------------------------------------
    // A. KARTU RINGKASAN (Summary Cards)
    // ---------------------------------------------------------
    const totalBookings = bookings.length;
    
    // Total Kunjungan: hitung kunjungan yang berstatus CONFIRMED, COMPLETED, atau APPROVED
    const totalVisits = bookings.filter(b => 
      ['CONFIRMED', 'COMPLETED', 'APPROVED', 'PAYMENT_SUBMITTED'].includes(b.status)
    ).length;

    // Total Peserta (Siswa + Guru)
    const totalParticipants = bookings.reduce((sum, b) => {
      const students = parseInt(b.studentCount, 10) || 0;
      const teachers = parseInt(b.teacherCount, 10) || 0;
      const total = parseInt(b.totalVisitors, 10) || (students + teachers);
      return sum + total;
    }, 0);

    // Total Pendapatan HANYA dari pembayaran yang berstatus VERIFIED
    const totalRevenue = bookings.reduce((sum, b) => {
      if (b.payment && b.payment.status === 'VERIFIED') {
        return sum + (parseFloat(b.payment.amount) || 0);
      }
      return sum;
    }, 0);

    // ---------------------------------------------------------
    // B. GRAFIK 1: Kegiatan Paling & Kurang Diminati
    // ---------------------------------------------------------
    // Inisialisasi counter untuk semua kegiatan yang ada di master
    const activityCountMap = {};
    allActivities.forEach(act => {
      activityCountMap[act.name] = {
        name: act.name,
        category: act.category,
        isAvailable: act.isAvailable !== false,
        isActive: act.isActive !== false,
        count: 0
      };
    });

    bookings.forEach(b => {
      if (b.selectedActivities) {
        try {
          const actList = typeof b.selectedActivities === 'string'
            ? JSON.parse(b.selectedActivities)
            : b.selectedActivities;
          if (Array.isArray(actList)) {
            actList.forEach(actName => {
              const nameTrim = String(actName).trim();
              if (activityCountMap[nameTrim]) {
                activityCountMap[nameTrim].count += 1;
              } else {
                activityCountMap[nameTrim] = {
                  name: nameTrim,
                  category: 'Lainnya',
                  isAvailable: true,
                  isActive: true,
                  count: 1
                };
              }
            });
          }
        } catch (e) {
          // ignore json parse error
        }
      }
    });

    const activityStats = Object.values(activityCountMap).sort((a, b) => b.count - a.count);
    const mostPopularActivities = activityStats.slice(0, 5);
    const leastPopularActivities = [...activityStats].reverse().slice(0, 5);

    // ---------------------------------------------------------
    // C. GRAFIK 2: Kunjungan Berdasarkan Jenjang Pendidikan
    // ---------------------------------------------------------
    const educationMap = {
      'TK/PAUD': { level: 'TK/PAUD', visits: 0, participants: 0 },
      'SD/MI': { level: 'SD/MI', visits: 0, participants: 0 },
      'SMP/MTs': { level: 'SMP/MTs', visits: 0, participants: 0 },
      'SMA/SMK/MA': { level: 'SMA/SMK/MA', visits: 0, participants: 0 },
      'Perguruan Tinggi': { level: 'Perguruan Tinggi', visits: 0, participants: 0 },
      'Lainnya / Umum': { level: 'Lainnya / Umum', visits: 0, participants: 0 }
    };

    bookings.forEach(b => {
      const norm = normalizeEducationLevel(b.educationLevel);
      const target = educationMap[norm] || educationMap['Lainnya / Umum'];
      target.visits += 1;
      target.participants += (parseInt(b.totalVisitors, 10) || parseInt(b.studentCount, 10) || 0);
    });

    const educationStats = Object.values(educationMap);

    // ---------------------------------------------------------
    // D. GRAFIK 3: Kunjungan Berdasarkan Periode Waktu
    // ---------------------------------------------------------
    // Grouping per Bulan (YYYY-MM) dan per Tanggal (YYYY-MM-DD)
    const monthlyVisitsMap = {};
    const dailyVisitsMap = {};

    bookings.forEach(b => {
      const vDate = b.visitDate || (b.createdAt ? b.createdAt.toISOString().slice(0, 10) : 'Tanpa Tanggal');
      const vMonth = vDate.slice(0, 7);

      dailyVisitsMap[vDate] = (dailyVisitsMap[vDate] || 0) + 1;
      monthlyVisitsMap[vMonth] = (monthlyVisitsMap[vMonth] || 0) + 1;
    });

    const monthlyVisits = Object.keys(monthlyVisitsMap).sort().map(month => ({
      period: month,
      visits: monthlyVisitsMap[month]
    }));

    const dailyVisits = Object.keys(dailyVisitsMap).sort().map(day => ({
      date: day,
      visits: dailyVisitsMap[day]
    }));

    // ---------------------------------------------------------
    // E. GRAFIK 4: Perbandingan Paket Edukasi Paling & Sedikit Dipesan
    // ---------------------------------------------------------
    const packageCountMap = {};
    allPackages.forEach(p => {
      packageCountMap[p.name] = {
        id: p.id,
        name: p.name,
        price: p.price,
        count: 0,
        participants: 0
      };
    });

    bookings.forEach(b => {
      const pName = b.packageName || `Paket #${b.packageId}`;
      if (!packageCountMap[pName]) {
        packageCountMap[pName] = {
          id: b.packageId,
          name: pName,
          price: b.packagePrice || 0,
          count: 0,
          participants: 0
        };
      }
      packageCountMap[pName].count += 1;
      packageCountMap[pName].participants += (parseInt(b.totalVisitors, 10) || parseInt(b.studentCount, 10) || 0);
    });

    const packageStats = Object.values(packageCountMap).sort((a, b) => b.count - a.count);

    // ---------------------------------------------------------
    // F. GRAFIK 5: Status Pemesanan
    // ---------------------------------------------------------
    const statusLabels = {
      'PENDING_REVIEW': 'Menunggu Review',
      'APPROVED': 'Menunggu Pembayaran',
      'PAYMENT_SUBMITTED': 'Menunggu Verifikasi',
      'CONFIRMED': 'Disetujui / Terkonfirmasi',
      'COMPLETED': 'Selesai',
      'REVISION_REQUESTED': 'Permintaan Revisi',
      'REJECTED': 'Ditolak',
      'CANCELLED': 'Dibatalkan'
    };

    const statusCountMap = {
      'Menunggu Review': 0,
      'Menunggu Pembayaran': 0,
      'Menunggu Verifikasi': 0,
      'Disetujui / Terkonfirmasi': 0,
      'Selesai': 0,
      'Permintaan Revisi': 0,
      'Ditolak / Dibatalkan': 0
    };

    bookings.forEach(b => {
      const rawStatus = b.status || 'PENDING_REVIEW';
      if (rawStatus === 'APPROVED') {
        // jika approved dan belum submit pembayaran -> menunggu pembayaran
        statusCountMap['Menunggu Pembayaran'] += 1;
      } else if (rawStatus === 'PAYMENT_SUBMITTED') {
        statusCountMap['Menunggu Verifikasi'] += 1;
      } else if (rawStatus === 'CONFIRMED') {
        statusCountMap['Disetujui / Terkonfirmasi'] += 1;
      } else if (rawStatus === 'COMPLETED') {
        statusCountMap['Selesai'] += 1;
      } else if (rawStatus === 'REJECTED' || rawStatus === 'CANCELLED') {
        statusCountMap['Ditolak / Dibatalkan'] += 1;
      } else if (rawStatus === 'REVISION_REQUESTED') {
        statusCountMap['Permintaan Revisi'] += 1;
      } else {
        statusCountMap['Menunggu Review'] += 1;
      }
    });

    const bookingStatusStats = Object.keys(statusCountMap).map(key => ({
      status: key,
      count: statusCountMap[key],
      percentage: totalBookings > 0 ? ((statusCountMap[key] / totalBookings) * 100).toFixed(1) : 0
    }));

    // ---------------------------------------------------------
    // G. GRAFIK 6: Pendapatan Berdasarkan Periode (HANYA Verified)
    // ---------------------------------------------------------
    const monthlyRevenueMap = {};
    bookings.forEach(b => {
      if (b.payment && b.payment.status === 'VERIFIED') {
        const pDate = b.payment.paymentDate || b.visitDate || b.payment.createdAt.toISOString().slice(0, 10);
        const pMonth = pDate.slice(0, 7);
        const amount = parseFloat(b.payment.amount) || 0;
        monthlyRevenueMap[pMonth] = (monthlyRevenueMap[pMonth] || 0) + amount;
      }
    });

    const revenueByPeriod = Object.keys(monthlyRevenueMap).sort().map(month => ({
      period: month,
      revenue: monthlyRevenueMap[month]
    }));

    // ---------------------------------------------------------
    // H. GRAFIK 7: Jumlah Peserta Berdasarkan Sekolah / Instansi
    // ---------------------------------------------------------
    const schoolMap = {};
    bookings.forEach(b => {
      const sName = b.schoolName ? b.schoolName.trim() : 'Tanpa Nama Sekolah';
      if (!schoolMap[sName]) {
        schoolMap[sName] = {
          schoolName: sName,
          educationLevel: normalizeEducationLevel(b.educationLevel),
          visitCount: 0,
          totalParticipants: 0,
          city: b.city || '-'
        };
      }
      schoolMap[sName].visitCount += 1;
      schoolMap[sName].totalParticipants += (parseInt(b.totalVisitors, 10) || parseInt(b.studentCount, 10) || 0);
    });

    const schoolStats = Object.values(schoolMap)
      .sort((a, b) => b.totalParticipants - a.totalParticipants)
      .slice(0, 10); // Top 10 sekolah

    // ---------------------------------------------------------
    // I. GRAFIK 8: Tren Kunjungan (Peningkatan & Penurunan)
    // ---------------------------------------------------------
    // Hitung perbandingan antar periode bulanan
    const trendAnalysis = [];
    for (let i = 0; i < monthlyVisits.length; i++) {
      const current = monthlyVisits[i];
      const prev = i > 0 ? monthlyVisits[i - 1] : null;
      let growthPercent = 0;
      let statusTrend = 'STABIL';

      if (prev && prev.visits > 0) {
        growthPercent = (((current.visits - prev.visits) / prev.visits) * 100).toFixed(1);
        if (growthPercent > 0) statusTrend = 'NAIK';
        else if (growthPercent < 0) statusTrend = 'TURUN';
      } else if (prev && prev.visits === 0 && current.visits > 0) {
        growthPercent = 100;
        statusTrend = 'NAIK';
      }

      trendAnalysis.push({
        period: current.period,
        visits: current.visits,
        growthPercent: Number(growthPercent),
        statusTrend
      });
    }

    res.json({
      success: true,
      filter: { period, startDate: startDate || null, endDate: endDate || null },
      summary: {
        totalVisits,
        totalParticipants,
        totalBookings,
        totalRevenue
      },
      charts: {
        activityStats,
        mostPopularActivities,
        leastPopularActivities,
        educationStats,
        monthlyVisits,
        dailyVisits,
        packageStats,
        bookingStatusStats,
        revenueByPeriod,
        schoolStats,
        trendAnalysis
      }
    });

  } catch (err) {
    console.error('Error fetching Pimpinan dashboard stats:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal memproses data analitik pimpinan.',
      error: err.message 
    });
  }
};

/**
 * GET /api/pimpinan/rekapitulasi
 * Menampilkan tabel rekapitulasi data kunjungan dengan pencarian, filter, sorting, dan pagination
 */
exports.getRekapitulasi = async (req, res) => {
  try {
    const { 
      period = 'all', 
      startDate, 
      endDate, 
      search = '', 
      page = 1, 
      limit = 10,
      sortBy = 'visitDate',
      sortOrder = 'DESC'
    } = req.query;

    const dateWhere = buildDateWhere(period, startDate, endDate);

    // Search filter
    const whereClause = { ...dateWhere };
    if (search && search.trim() !== '') {
      const query = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { schoolName: { [Op.like]: query } },
        { bookingCode: { [Op.like]: query } },
        { visitorName: { [Op.like]: query } },
        { packageName: { [Op.like]: query } },
        { city: { [Op.like]: query } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const validSortCols = ['visitDate', 'schoolName', 'studentCount', 'totalVisitors', 'totalEstimatedCost', 'status', 'createdAt'];
    const orderCol = validSortCols.includes(sortBy) ? sortBy : 'visitDate';
    const orderDir = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows } = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Payment,
          as: 'payment',
          required: false,
          attributes: ['id', 'amount', 'status', 'bankName', 'paymentDate', 'proofUrl']
        },
        {
          model: EducationalPackage,
          as: 'package',
          required: false,
          attributes: ['id', 'name', 'price']
        }
      ],
      order: [[orderCol, orderDir]],
      limit: limitNum,
      offset
    });

    const formattedRows = rows.map(b => {
      let activitiesArray = [];
      try {
        activitiesArray = typeof b.selectedActivities === 'string' 
          ? JSON.parse(b.selectedActivities) 
          : (b.selectedActivities || []);
      } catch (e) {
        activitiesArray = [];
      }

      // Determine Payment Status
      let paymentStatus = 'BELUM_DIBAYAR';
      if (b.payment) {
        if (b.payment.status === 'VERIFIED') paymentStatus = 'TERVERIFIKASI';
        else if (b.payment.status === 'SUBMITTED') paymentStatus = 'MENUNGGU_VERIFIKASI';
        else if (b.payment.status === 'REJECTED') paymentStatus = 'DITOLAK';
      } else if (b.status === 'CONFIRMED' || b.status === 'COMPLETED') {
        paymentStatus = 'TERVERIFIKASI';
      }

      return {
        id: b.id,
        bookingCode: b.bookingCode,
        visitDate: b.visitDate || '-',
        visitTimeSlot: b.visitTimeSlot || '-',
        schoolName: b.schoolName || '-',
        educationLevel: b.educationLevel || '-',
        city: b.city || '-',
        studentCount: b.studentCount || 0,
        teacherCount: b.teacherCount || 0,
        totalVisitors: b.totalVisitors || ((b.studentCount || 0) + (b.teacherCount || 0)),
        packageId: b.packageId,
        packageName: b.packageName || (b.package ? b.package.name : '-'),
        packagePrice: b.packagePrice || (b.package ? b.package.price : 0),
        totalEstimatedCost: b.totalEstimatedCost || 0,
        selectedActivities: activitiesArray,
        status: b.status || 'PENDING_REVIEW',
        paymentStatus,
        paymentAmount: b.payment ? b.payment.amount : null,
        notes: b.notes || '-'
      };
    });

    res.json({
      success: true,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum,
        limit: limitNum
      },
      data: formattedRows
    });

  } catch (err) {
    console.error('Error fetching Pimpinan rekapitulasi:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal memuat tabel rekapitulasi.',
      error: err.message 
    });
  }
};

/**
 * GET /api/pimpinan/export
 * Mengambil seluruh data aktual untuk diekspor ke PDF dan Excel tanpa batas pagination
 */
exports.getExportData = async (req, res) => {
  try {
    const { period = 'all', startDate, endDate } = req.query;
    const dateWhere = buildDateWhere(period, startDate, endDate);

    const bookings = await Booking.findAll({
      where: dateWhere,
      include: [
        {
          model: Payment,
          as: 'payment',
          required: false
        }
      ],
      order: [['visitDate', 'ASC']]
    });

    const exportRows = bookings.map((b, index) => {
      let activities = [];
      try {
        activities = typeof b.selectedActivities === 'string'
          ? JSON.parse(b.selectedActivities)
          : (b.selectedActivities || []);
      } catch (e) {
        activities = [];
      }

      let paymentStatus = 'Belum Dibayar';
      if (b.payment) {
        if (b.payment.status === 'VERIFIED') paymentStatus = 'Lunas / Terverifikasi';
        else if (b.payment.status === 'SUBMITTED') paymentStatus = 'Menunggu Verifikasi Admin';
        else if (b.payment.status === 'REJECTED') paymentStatus = 'Bukti Ditolak';
      } else if (b.status === 'CONFIRMED' || b.status === 'COMPLETED') {
        paymentStatus = 'Lunas';
      }

      return {
        no: index + 1,
        bookingCode: b.bookingCode,
        visitDate: b.visitDate,
        visitTimeSlot: b.visitTimeSlot,
        schoolName: b.schoolName,
        educationLevel: b.educationLevel,
        city: b.city,
        totalVisitors: b.totalVisitors || (b.studentCount + b.teacherCount),
        studentCount: b.studentCount,
        teacherCount: b.teacherCount,
        packageName: b.packageName,
        selectedActivities: activities.join(', '),
        totalEstimatedCost: b.totalEstimatedCost,
        status: b.status,
        paymentStatus,
        notes: b.notes || '-'
      };
    });

    res.json({
      success: true,
      period,
      generatedAt: new Date().toISOString(),
      totalRecords: exportRows.length,
      data: exportRows
    });

  } catch (err) {
    console.error('Error fetching export data:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data untuk ekspor.',
      error: err.message 
    });
  }
};

