'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("reminders", "start_time", {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.addColumn("reminders", "end_time", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("reminders", "recurrence_rule", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("reminders", "external_event_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("reminders", "start_time");
    await queryInterface.removeColumn("reminders", "end_time");
    await queryInterface.removeColumn("reminders", "recurrence_rule");
    await queryInterface.removeColumn("reminders", "external_event_id");
  },
};

