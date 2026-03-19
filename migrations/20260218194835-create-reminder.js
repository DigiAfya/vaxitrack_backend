"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reminders", {
      reminder_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      profile_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "profiles",
          key: "profile_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      vaccine_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "vaccines",
          key: "vaccine_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      due_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("Due", "Overdue"),
        defaultValue: "Due",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      last_notified_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("reminders");
  },
};