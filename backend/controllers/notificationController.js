const { Notification } = require('../models');

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil notifikasi.' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const notif = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (notif) {
      notif.isRead = true;
      await notif.save();
    }
    res.json({ message: 'Notifikasi ditandai dibaca.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui notifikasi.' });
  }
};
