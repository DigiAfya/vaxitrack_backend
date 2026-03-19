"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("vaccine_doses", {
      dose_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      vaccine_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "vaccines",
          key: "vaccine_id",
        },
        onDelete: "CASCADE",
      },

      dose_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      recommended_age: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      
      min_age_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      max_age_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      min_gap_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      description: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("vaccine_doses");
  },
};