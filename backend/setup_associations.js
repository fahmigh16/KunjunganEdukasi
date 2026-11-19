const fs = require('fs');

const associations = {
  'role.js': `    static associate(models) {
      Role.hasMany(models.User, { foreignKey: 'roleId', as: 'users' });
    }`,
  'user.js': `    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
      User.hasMany(models.Booking, { foreignKey: 'userId', as: 'bookings' });
      User.hasMany(models.BookingStatusHistory, { foreignKey: 'changedById', as: 'statusHistories' });
      User.hasMany(models.Payment, { foreignKey: 'verifiedById', as: 'verifiedPayments' });
    }`,
  'educationalpackage.js': `    static associate(models) {
      EducationalPackage.hasMany(models.PackageMedia, { foreignKey: 'packageId', as: 'media' });
      EducationalPackage.hasMany(models.BookingItem, { foreignKey: 'packageId', as: 'bookingItems' });
    }`,
  'packagemedia.js': `    static associate(models) {
      PackageMedia.belongsTo(models.EducationalPackage, { foreignKey: 'packageId', as: 'package' });
    }`,
  'booking.js': `    static associate(models) {
      Booking.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Booking.hasMany(models.BookingItem, { foreignKey: 'bookingId', as: 'items' });
      Booking.hasMany(models.BookingStatusHistory, { foreignKey: 'bookingId', as: 'statusHistory' });
      Booking.hasOne(models.Payment, { foreignKey: 'bookingId', as: 'payment' });
    }`,
  'bookingitem.js': `    static associate(models) {
      BookingItem.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'booking' });
      BookingItem.belongsTo(models.EducationalPackage, { foreignKey: 'packageId', as: 'package' });
    }`,
  'bookingstatushistory.js': `    static associate(models) {
      BookingStatusHistory.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'booking' });
      BookingStatusHistory.belongsTo(models.User, { foreignKey: 'changedById', as: 'changedBy' });
    }`,
  'payment.js': `    static associate(models) {
      Payment.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'booking' });
      Payment.belongsTo(models.User, { foreignKey: 'verifiedById', as: 'verifiedBy' });
    }`
};

for (const [file, assoc] of Object.entries(associations)) {
  const content = fs.readFileSync('models/' + file, 'utf8');
  const replaced = content.replace(/static associate\(models\) \{\s+\/\/ define association here\s+\}/, assoc);
  fs.writeFileSync('models/' + file, replaced);
}
console.log('Associations set');
