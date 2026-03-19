'use strict';

/** @type {import('sequelize-cli').Migration} */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("faqs", [
      {
        question: "How do I register a new account?",
        answer: "Go to /api/auth/register and provide your email and password. You will receive access and refresh tokens upon successful registration.",
        category: "auth",
        embedding: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        question: "How do I create a profile?",
        answer: "After logging in, call POST /api/profiles with your full_name, dob, gender, and category.",
        category: "profiles",
        embedding: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        question: "How do I get all vaccines?",
        answer: "Use GET /api/vaccines with a valid Bearer token to retrieve all vaccines in the system.",
        category: "vaccines",
        embedding: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        question: "Can you list all vaccines available?",
        answer: "Yes. Call GET /api/vaccines to fetch the complete list of vaccines. Each vaccine entry includes its name, age range, category, description, and dose sequence. For example: BCG (At birth), Polio (6 weeks), MMR (9 months).",
        category: "vaccines",
        embedding: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        question: "How do I set a reminder?",
        answer: "Call POST /api/reminders/:profileId with vaccineId, dueDate, and status. This creates a reminder for the selected profile.",
        category: "reminders",
        embedding: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        question: "How do I refresh my access token?",
        answer: "Send POST /api/auth/refresh with your refresh token in the body to get a new access token.",
        category: "auth",
        embedding: null,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("faqs", null, {});
  },
};
