"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("vaccine_status", {
      status_id: {
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
        onDelete: "CASCADE",
      },

      vaccine_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "vaccines",
          key: "vaccine_id",
        },
      },
      dose_number: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("taken", "due", "overdue"),
        allowNull: false,
        defaultValue: "due",
      },

      administered_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      next_due_date: {
        type: Sequelize.DATE,
        allowNull: true,
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
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("vaccine_status");
  },
};