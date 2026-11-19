'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EducationalPackage extends Model {
    static associate(models) {
      EducationalPackage.hasMany(models.Booking, { foreignKey: 'packageId', as: 'bookings' });
    }
  }
  EducationalPackage.init({
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    category: DataTypes.STRING,
    shortDescription: DataTypes.TEXT,
    description: DataTypes.TEXT,
    duration: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2),
    minParticipants: { type: DataTypes.INTEGER, defaultValue: 10 },
    maxParticipants: { type: DataTypes.INTEGER, defaultValue: 200 },
    visitCount: { type: DataTypes.INTEGER, defaultValue: 2 },
    facilities: DataTypes.TEXT,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'EducationalPackage',
  });
  return EducationalPackage;
};