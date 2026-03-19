"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("profiles", {
      profile_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "user_id" },
        onDelete: "CASCADE",
      },
      first_name: { type: Sequelize.STRING, allowNull: false },
      middle_name: { type: Sequelize.STRING,  allowNull: true,},
      last_name: { type: Sequelize.STRING, allowNull: false },
      date_of_birth: { type: Sequelize.DATEONLY, allowNull: false },
      gender: {
        type: Sequelize.ENUM("male", "female", "prefer not to say"),
      },
      category: {
        type: Sequelize.ENUM("child", "adult"),
        allowNull: false,
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
      deleted_at: {
      type: Sequelize.DATE,
      allowNull: true,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("profiles");
  },
};
