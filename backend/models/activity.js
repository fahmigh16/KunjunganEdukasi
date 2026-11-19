'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    static associate(models) {}
  }
  Activity.init({
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    description: DataTypes.TEXT,
    iconName: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Activity',
  });
  return Activity;
};
