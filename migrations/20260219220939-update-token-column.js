'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("token_store", "token", {
      type: Sequelize.STRING(512),
      allowNull: false,
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("token_store", "token", {
      type: Sequelize.STRING(512),
      allowNull: false,
      unique: true
    });
  }
};
