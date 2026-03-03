"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Vaccines", {
      vaccine_id: {type: Sequelize.INTEGER.UNSIGNED,autoIncrement: true, primaryKey: true,},
      name: { type: Sequelize.STRING, allowNull: false },
      age_range: { type: Sequelize.STRING },
      category: { type: Sequelize.ENUM("Child", "Adult") },
      dose_sequence: { type: Sequelize.INTEGER },
      description: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false }, 
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Vaccines");
  },
};
