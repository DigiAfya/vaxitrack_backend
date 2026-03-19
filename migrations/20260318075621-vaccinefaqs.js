'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("vaccine_faqs", {
      faq_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      vaccine_name: { type: Sequelize.STRING(150), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      doses: { type: Sequelize.STRING(100), allowNull: false },
      info: { type: Sequelize.TEXT, allowNull: true },
      administration: { type: Sequelize.TEXT, allowNull: false },
      age_range: { type: Sequelize.STRING(100), allowNull: true },
      category: { type: Sequelize.STRING(100), allowNull: true },
      embedding: {type: Sequelize.JSON,allowNull: true},
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("vaccine_faqs");
  },
};
