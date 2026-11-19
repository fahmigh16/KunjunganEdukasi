'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookingItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
        static associate(models) {
      BookingItem.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'booking' });
      BookingItem.belongsTo(models.EducationalPackage, { foreignKey: 'packageId', as: 'package' });
    }
  }
  BookingItem.init({
    bookingId: DataTypes.INTEGER,
    packageId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    priceAtBooking: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'BookingItem',
  });
  return BookingItem;
};