'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookingStatusHistory extends Model {
    static associate(models) {
      BookingStatusHistory.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'booking' });
      BookingStatusHistory.belongsTo(models.User, { foreignKey: 'changedById', as: 'changedBy' });
    }
  }
  BookingStatusHistory.init({
    bookingId: DataTypes.INTEGER,
    oldStatus: DataTypes.STRING,
    newStatus: DataTypes.STRING,
    changedById: DataTypes.INTEGER,
    changedByName: DataTypes.STRING,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'BookingStatusHistory',
  });
  return BookingStatusHistory;
};