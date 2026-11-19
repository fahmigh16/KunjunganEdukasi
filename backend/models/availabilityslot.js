'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AvailabilitySlot extends Model {
    static associate(models) {}
  }
  AvailabilitySlot.init({
    date: DataTypes.STRING,
    timeSlot: DataTypes.STRING,
    capacity: { type: DataTypes.INTEGER, defaultValue: 100 },
    bookedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: 'AVAILABLE' }, // AVAILABLE, FULL, BLOCKED
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'AvailabilitySlot',
  });
  return AvailabilitySlot;
};
