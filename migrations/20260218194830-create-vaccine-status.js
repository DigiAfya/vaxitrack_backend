"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Vaccine_Status", {
      status_id: {
  type: Sequelize.INTEGER.UNSIGNED,
  autoIncrement: true,
  primaryKey: true,
},
profile_id: {
  type: Sequelize.INTEGER.UNSIGNED,
  allowNull: false,
  references: { model: "Profiles", key: "profile_id" },
  onDelete: "CASCADE",
},
vaccine_id: {
  type: Sequelize.INTEGER.UNSIGNED,
  allowNull: false,
  references: { model: "Vaccines", key: "vaccine_id" },
  onDelete: "CASCADE",
},
  date_taken: { type: Sequelize.DATEONLY },
});
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Vaccine_Status");
  },
};
 