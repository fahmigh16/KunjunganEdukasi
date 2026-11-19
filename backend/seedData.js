const bcrypt = require('bcrypt');
const { 
  User, 
  EducationalPackage, 
  Activity, 
  PaymentSetting, 
  AvailabilitySlot, 
  Booking, 
  BookingStatusHistory 
} = require('./models');

const seedData = async () => {
  try {
    console.log('Seeding initial data...');

    // 1. Seed Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    const pimpinanPassword = await bcrypt.hash('pimpinan123', 10);

    const [adminUser] = await User.findOrCreate({
      where: { email: 'admin@polinela.ac.id' },
      defaults: {
        name: 'Administrator Polinela',
        email: 'admin@polinela.ac.id',
        password: adminPassword,
        phone: '0852-6732-6913',
        institutionName: 'Unit Pengelola Bisnis Polinela',
        role: 'admin',
        isActive: true
      }
    });

    const [pimpinanUser] = await User.findOrCreate({
      where: { email: 'pimpinan@polinela.ac.id' },
      defaults: {
        name: 'Pimpinan UPB Polinela',
        email: 'pimpinan@polinela.ac.id',
        password: pimpinanPassword,
        phone: '0812-9876-5432',
        institutionName: 'Unit Pengelola Bisnis Polinela',
        role: 'pimpinan',
        isActive: true
      }
    });

    const [demoUser] = await User.findOrCreate({
      where: { email: 'user@gmail.com' },
      defaults: {
        name: 'Budi Santoso (Guru SD)',
        email: 'user@gmail.com',
        password: userPassword,
        phone: '0812-3456-7890',
        institutionName: 'SD Negeri 1 Bandar Lampung',
        role: 'user',
        isActive: true
      }
    });

    // 2. Seed 2 Packages (min 20 anak, tepat 2 pilihan kegiatan)
    const [pkg1] = await EducationalPackage.findOrCreate({
      where: { slug: 'paket-edukasi-1' },
      defaults: {
        name: 'PAKET EDUKASI 1',
        slug: 'paket-edukasi-1',
        category: 'Paket Edukasi Polinela',
        shortDescription: 'Paket kunjungan edukasi interaktif untuk tepat 2 pilihan kegiatan di Politeknik Negeri Lampung.',
        description: 'Pengalaman belajar langsung melalui aktivitas unggulan di Politeknik Negeri Lampung. Harga Rp35.000/anak untuk 2 pilihan kegiatan.',
        duration: '180 Menit',
        price: 35000,
        minParticipants: 20,
        maxParticipants: 200,
        visitCount: 2,
        facilities: 'Pembimbing Polinela, Bahan Praktek, Area Edukasi, Spot Foto',
        isActive: true
      }
    });

    const [pkg2] = await EducationalPackage.findOrCreate({
      where: { slug: 'paket-edukasi-2' },
      defaults: {
        name: 'PAKET EDUKASI 2',
        slug: 'paket-edukasi-2',
        category: 'Paket Edukasi Polinela',
        shortDescription: 'Paket kunjungan edukasi lengkap dengan fasilitas tambahan untuk tepat 2 pilihan kegiatan.',
        description: 'Pengalaman belajar komprehensif di fasilitas laboratorium dan lahan praktek Polinela. Harga Rp40.000/anak untuk 2 pilihan kegiatan.',
        duration: '210 Menit',
        price: 40000,
        minParticipants: 20,
        maxParticipants: 200,
        visitCount: 2,
        facilities: 'Pembimbing Polinela, Bahan Praktek Premium, Sertifikat Peserta, Area Edukasi',
        isActive: true
      }
    });

    // 3. Seed 13 Activities (findOrCreate to preserve admin's active/inactive status and historical integrity)
    const activitiesList = [
      { name: 'Menanam Sayur', category: 'Pertanian', description: 'Belajar menanam sayur', iconName: 'Sprout', isActive: true, isAvailable: true },
      { name: 'Panen Sayur', category: 'Pertanian', description: 'Panen sayur', iconName: 'Scissors', isActive: true, isAvailable: true },
      { name: 'Panen Sayur Hidroponik', category: 'Perkebunan & Hidroponik', description: 'Panen sayur hidroponik', iconName: 'Droplets', isActive: true, isAvailable: true },
      { name: 'Menyemai Tanaman Hias', category: 'Pertanian', description: 'Menyemai tanaman hias', iconName: 'Seedling', isActive: true, isAvailable: true },
      { name: 'Membuat Roti', category: 'Pangan & Kreativitas', description: 'Membuat roti', iconName: 'ChefHat', isActive: true, isAvailable: true },
      { name: 'Mengemas Sayuran', category: 'Perkebunan & Hidroponik', description: 'Mengemas sayuran', iconName: 'PackageCheck', isActive: true, isAvailable: true },
      { name: 'Menangkap Ikan', category: 'Hewan & Perairan', description: 'Menangkap ikan', iconName: 'Fish', isActive: true, isAvailable: true },
      { name: 'Membuat Produk Olahan', category: 'Pangan & Kreativitas', description: 'Membuat produk olahan', iconName: 'Utensils', isActive: true, isAvailable: true },
      { name: 'Membuat Sabun', category: 'Pangan & Kreativitas', description: 'Membuat sabun', iconName: 'Sparkles', isActive: true, isAvailable: true },
      { name: 'Membuat Minuman Kopi', category: 'Pangan & Kreativitas', description: 'Membuat minuman kopi', iconName: 'Coffee', isActive: true, isAvailable: true },
      { name: 'Edukasi Tanaman Perkebunan', category: 'Perkebunan & Hidroponik', description: 'Edukasi tanaman perkebunan', iconName: 'Trees', isActive: true, isAvailable: true },
      { name: 'Memberi Makan Hewan', category: 'Hewan & Perairan', description: 'Memberi makan hewan', iconName: 'HeartHandshake', isActive: true, isAvailable: true },
      { name: 'Panen Telur Ayam', category: 'Hewan & Perairan', description: 'Panen telur ayam', iconName: 'Egg', isActive: true, isAvailable: true }
    ];

    for (const act of activitiesList) {
      await Activity.findOrCreate({
        where: { name: act.name },
        defaults: act
      });
    }

    // 4. Seed Payment Settings for BNI and BMT Muamalah
    await PaymentSetting.findOrCreate({
      where: { bankName: 'Bank BNI' },
      defaults: {
        bankName: 'Bank BNI',
        accountName: 'Unit Pengelola Bisnis Polinela',
        accountNumber: 'XXXXXXXXXX',
        instructions: 'Transfer ke rekening Bank BNI atas nama Unit Pengelola Bisnis Polinela. Simpan dan unggah bukti transfer di halaman pembayaran.',
        isActive: true
      }
    });

    await PaymentSetting.findOrCreate({
      where: { bankName: 'BMT Muamalah' },
      defaults: {
        bankName: 'BMT Muamalah',
        accountName: 'Unit Pengelola Bisnis Polinela',
        accountNumber: 'XXXXXXXXXX',
        instructions: 'Transfer ke rekening BMT Muamalah atas nama Unit Pengelola Bisnis Polinela. Simpan dan unggah bukti transfer di halaman pembayaran.',
        isActive: true
      }
    });

    // 5. Seed Sample Booking for demo user
    const sampleCode = 'POL-20261010-0001';
    const [sampleBooking] = await Booking.findOrCreate({
      where: { bookingCode: sampleCode },
      defaults: {
        bookingCode: sampleCode,
        userId: demoUser.id,
        visitorName: 'Budi Santoso',
        email: 'user@gmail.com',
        phone: '0812-3456-7890',
        whatsapp: '0812-3456-7890',
        picPosition: 'Guru',
        schoolName: 'SD Negeri 1 Bandar Lampung',
        schoolOrigin: 'Bandar Lampung',
        educationLevel: 'SD',
        schoolAddress: 'Jl. Pemuda No. 12, Bandar Lampung',
        city: 'Bandar Lampung',
        province: 'Lampung',
        teacherName: 'Budi Santoso',
        teacherPhone: '0812-3456-7890',
        visitDate: '2026-10-10',
        visitTimeSlot: 'Pagi (08:30 - 11:30 WIB)',
        studentCount: 25,
        teacherCount: 2,
        totalVisitors: 27,
        packageId: pkg1.id,
        packageName: 'PAKET EDUKASI 1',
        packagePrice: 35000,
        totalEstimatedCost: 875000, // 25 students * 35.000 = 875.000
        selectedActivities: JSON.stringify(['Menanam Sayur', 'Membuat Roti']),
        notes: 'Mohon disediakan area parkir bus sekolah.',
        status: 'PENDING_REVIEW'
      }
    });

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};

module.exports = seedData;
