'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("faqs", {
      faq_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      question: { type: Sequelize.STRING(255), allowNull: false },
      answer: { type: Sequelize.TEXT, allowNull: false },
      category: { type: Sequelize.STRING(100), allowNull: true },
      embedding: {type: Sequelize.JSON,allowNull: true},
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("faqs");
  },
};
