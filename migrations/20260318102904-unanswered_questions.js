"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("unanswered_questions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      asked_by: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      context: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      target_type: {
        type: Sequelize.ENUM("general", "vaccine"),
        allowNull: false,
        defaultValue: "general",
      },
      resolved_to_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("unanswered_questions");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_unanswered_questions_target_type";'
    );
  },
};