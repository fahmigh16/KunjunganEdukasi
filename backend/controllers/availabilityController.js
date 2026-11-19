const { AvailabilitySlot, Booking } = require('../models');

exports.getAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    const where = {};
    if (date) where.date = date;

    const slots = await AvailabilitySlot.findAll({ where, order: [['date', 'ASC']] });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data jadwal.' });
  }
};

exports.setSlot = async (req, res) => {
  try {
    const { date, timeSlot, capacity, status, notes } = req.body;
    let slot = await AvailabilitySlot.findOne({ where: { date, timeSlot } });

    if (slot) {
      if (capacity) slot.capacity = capacity;
      if (status) slot.status = status;
      if (notes !== undefined) slot.notes = notes;
      await slot.save();
    } else {
      slot = await AvailabilitySlot.create({
        date,
        timeSlot: timeSlot || 'Pagi (08:30 - 11:30 WIB)',
        capacity: capacity || 100,
        status: status || 'AVAILABLE',
        notes
      });
    }

    res.json({ message: 'Slot jadwal berhasil diperbarui.', slot });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menyimpan slot jadwal.' });
  }
};
