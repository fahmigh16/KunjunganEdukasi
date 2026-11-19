'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bookingNumber: {
        type: Sequelize.STRING
      },
      visitorName: {
        type: Sequelize.STRING
      },
      picName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      visitorType: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.TEXT
      },
      participantCount: {
        type: Sequelize.INTEGER
      },
      ageRange: {
        type: Sequelize.STRING
      },
      visitDate: {
        type: Sequelize.DATEONLY
      },
      visitTime: {
        type: Sequelize.STRING
      },
      notes: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.STRING
      },
      totalAmount: {
        type: Sequelize.DECIMAL
      },
      userId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
};