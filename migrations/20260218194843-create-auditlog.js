'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AuditLogs", {
     id: {
  type: Sequelize.INTEGER.UNSIGNED,
  autoIncrement: true,
  primaryKey: true,
},
admin_id: {
  type: Sequelize.INTEGER.UNSIGNED,
  allowNull: false,
},
  action: { type: Sequelize.STRING, allowNull: false },
    target_type: { type: Sequelize.STRING, allowNull: false },
    target_id: { type: Sequelize.INTEGER },
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("AuditLogs");
  },
};
