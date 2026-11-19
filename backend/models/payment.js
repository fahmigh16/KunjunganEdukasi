'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'booking' });
      Payment.belongsTo(models.User, { foreignKey: 'verifiedById', as: 'verifiedBy' });
    }
  }
  Payment.init({
    bookingId: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(10, 2),
    paymentDate: DataTypes.STRING,
    senderName: DataTypes.STRING,
    bankName: DataTypes.STRING,
    proofUrl: DataTypes.TEXT,
    status: { type: DataTypes.STRING, defaultValue: 'SUBMITTED' }, // SUBMITTED, VERIFIED, REJECTED
    rejectionReason: DataTypes.TEXT,
    verifiedById: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};