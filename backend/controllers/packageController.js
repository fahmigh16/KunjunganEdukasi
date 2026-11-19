const { EducationalPackage } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const packages = await EducationalPackage.findAll({ order: [['id', 'ASC']] });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data paket.' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const pkg = await EducationalPackage.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Paket tidak ditemukan.' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail paket.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, category, shortDescription, description, duration, price, minParticipants, maxParticipants, visitCount, facilities } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const pkg = await EducationalPackage.create({
      name,
      slug,
      category: category || 'Paket Edukasi',
      shortDescription,
      description,
      duration: duration || '180 Menit',
      price: price || 35000,
      minParticipants: minParticipants || 10,
      maxParticipants: maxParticipants || 200,
      visitCount: visitCount || 2,
      facilities,
      isActive: true
    });

    res.status(201).json({ message: 'Paket berhasil ditambahkan.', pkg });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah paket.' });
  }
};

exports.update = async (req, res) => {
  try {
    const pkg = await EducationalPackage.findByPk(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Paket tidak ditemukan.' });

    const { name, category, shortDescription, description, duration, price, minParticipants, maxParticipants, visitCount, facilities, isActive } = req.body;

    if (name) {
      pkg.name = name;
      pkg.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (category) pkg.category = category;
    if (shortDescription) pkg.shortDescription = shortDescription;
    if (description) pkg.description = description;
    if (duration) pkg.duration = duration;
    if (price !== undefined) pkg.price = price;
    if (minParticipants) pkg.minParticipants = minParticipants;
    if (maxParticipants) pkg.maxParticipants = maxParticipants;
    if (visitCount) pkg.visitCount = visitCount;
    if (facilities) pkg.facilities = facilities;
    if (isActive !== undefined) pkg.isActive = isActive;

    await pkg.save();
    res.json({ message: 'Paket berhasil diperbarui.', pkg });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui paket.' });
  }
};
