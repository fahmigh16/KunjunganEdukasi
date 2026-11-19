'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaymentSetting extends Model {
    static associate(models) {}
  }
  PaymentSetting.init({
    bankName: DataTypes.STRING,
    accountName: DataTypes.STRING,
    accountNumber: DataTypes.STRING,
    qrisUrl: DataTypes.TEXT,
    instructions: DataTypes.TEXT,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'PaymentSetting',
  });
  return PaymentSetting;
};