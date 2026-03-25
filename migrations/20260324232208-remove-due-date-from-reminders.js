'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Option A: remove the column
    await queryInterface.removeColumn('reminders', 'due_date');

    // Option B (alternative): make it nullable
    // await queryInterface.changeColumn('reminders', 'due_date', {
    //   type: Sequelize.DATE,
    //   allowNull: true
    // });
  },

  async down(queryInterface, Sequelize) {
    // Re-add the column if you roll back
    await queryInterface.addColumn('reminders', 'due_date', {
      type: Sequelize.DATE,
      allowNull: false
    });
  }
};

