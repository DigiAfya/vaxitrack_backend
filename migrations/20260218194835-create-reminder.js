'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Reminders", {
     reminder_id: {
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
      due_date: { type: Sequelize.DATEONLY },
      status: { type: Sequelize.ENUM("NextDue", "Overdue") },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Reminders");
  },
};
