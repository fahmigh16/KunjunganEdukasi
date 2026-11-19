'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Seed Roles
    await queryInterface.bulkInsert('Roles', [
      { name: 'ADMIN_PENGELOLA', description: 'Admin Pengelola Kunjungan', createdAt: new Date(), updatedAt: new Date() },
      { name: 'ADMIN_PEMBAYARAN', description: 'Admin Verifikasi Pembayaran', createdAt: new Date(), updatedAt: new Date() },
      { name: 'USER', description: 'Pengunjung', createdAt: new Date(), updatedAt: new Date() }
    ]);

    const roles = await queryInterface.sequelize.query('SELECT id, name from Roles;');
    const roleRows = roles[0];
    const pengelolaId = roleRows.find(r => r.name === 'ADMIN_PENGELOLA').id;
    const pembayaranId = roleRows.find(r => r.name === 'ADMIN_PEMBAYARAN').id;
    const userId = roleRows.find(r => r.name === 'USER').id;

    // 2. Seed Users
    const passwordHash = await bcrypt.hash('password123', 10);
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Admin Pengelola',
        email: 'pengelola@demo.com',
        password: passwordHash,
        roleId: pengelolaId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Admin Pembayaran',
        email: 'pembayaran@demo.com',
        password: passwordHash,
        roleId: pembayaranId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pengunjung Demo',
        email: 'pengunjung@demo.com',
        password: passwordHash,
        roleId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // 3. Seed Educational Packages
    await queryInterface.bulkInsert('EducationalPackages', [
      {
        name: 'Panen Sayur',
        slug: 'panen-sayur',
        category: 'Pertanian',
        shortDescription: 'Kegiatan memanen sayuran segar langsung dari kebun.',
        description: 'Anak-anak akan diajarkan cara memanen sayuran segar seperti kangkung, bayam, atau selada langsung dari kebun Polinela. Kegiatan ini menanamkan kecintaan pada sayuran dan memberikan pemahaman tentang dari mana makanan berasal.',
        duration: '90 Menit',
        price: 35000,
        minParticipants: 10,
        facilities: 'Topi petani, sayuran hasil panen, air minum',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Menangkap Ikan',
        slug: 'menangkap-ikan',
        category: 'Perikanan',
        shortDescription: 'Belajar menangkap ikan di kolam budidaya perikanan.',
        description: 'Peserta akan diajarkan cara menangkap ikan di kolam budidaya menggunakan jaring. Kegiatan ini melatih ketangkasan dan memberikan pengenalan mengenai jenis-jenis ikan air tawar.',
        duration: '90 Menit',
        price: 35000,
        minParticipants: 10,
        facilities: 'Jaring ikan, hasil tangkapan (ikan kecil), tempat cuci',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pembuatan Roti',
        slug: 'pembuatan-roti',
        category: 'Keterampilan',
        shortDescription: 'Workshop singkat pembuatan roti dari adonan hingga matang.',
        description: 'Belajar membuat roti di fasilitas pengolahan pangan. Anak-anak akan membentuk adonan, menambahkan topping, dan melihat proses pemanggangan hingga roti siap dinikmati.',
        duration: '120 Menit',
        price: 50000,
        minParticipants: 15,
        facilities: 'Bahan roti, celemek, roti hasil buatan sendiri',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // 4. Seed Payment Settings
    await queryInterface.bulkInsert('PaymentSettings', [
      {
        bankName: 'Bank BRI',
        accountName: 'BLU POLINELA (DEMO)',
        accountNumber: '0000-1111-2222-3333',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('EducationalPackages', null, {});
    await queryInterface.bulkDelete('PaymentSettings', null, {});
  }
};
