'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PackageMedia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
        static associate(models) {
      PackageMedia.belongsTo(models.EducationalPackage, { foreignKey: 'packageId', as: 'package' });
    }
  }
  PackageMedia.init({
    packageId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    url: DataTypes.STRING,
    caption: DataTypes.STRING,
    isPrimary: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'PackageMedia',
  });
  return PackageMedia;
};