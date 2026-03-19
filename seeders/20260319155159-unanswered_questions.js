"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("unanswered_questions", [
      {
        question: "What vaccines are recommended for newborn babies?",
        asked_by: "Anonymous",
        context: "Inquiry about newborn immunization",
        target_type: "vaccine",
        resolved_to_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("unanswered_questions", {
      question: "What vaccines are recommended for newborn babies?",
    });
  },
};