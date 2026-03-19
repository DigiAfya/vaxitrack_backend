"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tokens", {

      token_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },

      token: {
        type: Sequelize.STRING(512),
        allowNull: false,
        unique: true,
      },

      token_type: {
        type: Sequelize.ENUM(
          "access",
          "refresh",
          "password_reset",
          "email_verification"
        ),
        allowNull: false,
      },

      is_revoked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("tokens");
  },
};