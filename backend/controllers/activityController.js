const { Activity } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const activities = await Activity.findAll({ order: [['id', 'ASC']] });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil daftar aktivitas.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, category, description, iconName } = req.body;
    const activity = await Activity.create({
      name,
      category: category || 'Pertanian',
      description,
      iconName: iconName || 'Sprout',
      isActive: true
    });
    res.status(201).json({ message: 'Aktivitas berhasil ditambahkan.', activity });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambahkan aktivitas.' });
  }
};

exports.update = async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Aktivitas tidak ditemukan.' });

    const { name, category, description, iconName, isActive, isAvailable } = req.body;
    if (name) activity.name = name;
    if (category) activity.category = category;
    if (description) activity.description = description;
    if (iconName) activity.iconName = iconName;
    if (isActive !== undefined) activity.isActive = isActive;
    if (isAvailable !== undefined) activity.isAvailable = isAvailable;

    await activity.save();
    res.json({ message: 'Aktivitas berhasil diperbarui.', activity });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui aktivitas.' });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Aktivitas tidak ditemukan.' });

    const newStatus = activity.isAvailable === false || activity.isActive === false;
    activity.isAvailable = newStatus;
    activity.isActive = newStatus;
    await activity.save();
    res.json({ 
      message: `Status kegiatan ${activity.name} berhasil diubah menjadi ${newStatus ? 'Aktif (Dapat dipilih pemesan)' : 'Nonaktif (Tidak dapat dipilih pemesan baru)'}.`,
      activity 
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengubah ketersediaan aktivitas.' });
  }
};
