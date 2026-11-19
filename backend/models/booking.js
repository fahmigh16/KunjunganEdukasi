'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Booking.belongsTo(models.EducationalPackage, { foreignKey: 'packageId', as: 'package' });
      Booking.hasOne(models.Payment, { foreignKey: 'bookingId', as: 'payment' });
      Booking.hasMany(models.BookingStatusHistory, { foreignKey: 'bookingId', as: 'statusHistory' });
    }
  }
  Booking.init({
    bookingCode: { type: DataTypes.STRING, unique: true },
    userId: DataTypes.INTEGER,
    visitorName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    whatsapp: DataTypes.STRING,
    picPosition: DataTypes.STRING,
    schoolName: DataTypes.STRING,
    schoolOrigin: DataTypes.STRING,
    educationLevel: DataTypes.STRING,
    schoolAddress: DataTypes.TEXT,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    teacherName: DataTypes.STRING,
    teacherPhone: DataTypes.STRING,
    visitDate: DataTypes.STRING,
    visitTimeSlot: DataTypes.STRING,
    studentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    teacherCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalVisitors: { type: DataTypes.INTEGER, defaultValue: 0 },
    packageId: DataTypes.INTEGER,
    packageName: DataTypes.STRING,
    packagePrice: DataTypes.DECIMAL(10, 2),
    totalEstimatedCost: DataTypes.DECIMAL(10, 2),
    selectedActivities: DataTypes.TEXT, // JSON array string of selected activity names
    notes: DataTypes.TEXT,
    status: { type: DataTypes.STRING, defaultValue: 'PENDING_REVIEW' },
    paymentStatus: { type: DataTypes.STRING, defaultValue: 'UNPAID' },
    adminNotes: DataTypes.TEXT,
    rejectionReason: DataTypes.TEXT,
    revisionNote: DataTypes.TEXT,
    alternativePackage1Id: DataTypes.INTEGER,
    alternativePackage1Name: DataTypes.STRING,
    alternativePackage2Id: DataTypes.INTEGER,
    alternativePackage2Name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};