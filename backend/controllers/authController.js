const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, institutionName } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Mohon lengkapi seluruh field pendaftaran.' });
    }

    const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone,
      institutionName: institutionName || '',
      role: 'user',
      isActive: true
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, email: newUser.email },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Pendaftaran berhasil.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        institutionName: newUser.institutionName,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Gagal melakukan pendaftaran. Silakan coba lagi.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan kata sandi wajib diisi.' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(400).json({ message: 'Email atau kata sandi tidak sesuai.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Akun Anda sedang dinonaktifkan. Silakan hubungi admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau kata sandi tidak sesuai.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        institutionName: user.institutionName,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Gagal melakukan login. Silakan coba lagi.' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data pengguna.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, institutionName } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (institutionName !== undefined) user.institutionName = institutionName;

    await user.save();
    res.json({ message: 'Profil berhasil diperbarui.', user });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui profil.' });
  }
};

// Admin User Management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil daftar pengguna.' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `Status pengguna berhasil diperbarui menjadi ${user.isActive ? 'Aktif' : 'Non-aktif'}.`, user });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui status pengguna.' });
  }
};
