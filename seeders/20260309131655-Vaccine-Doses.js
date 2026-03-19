"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("vaccine_doses", [
      // BCG
      { vaccine_id: 1, dose_number: 1, recommended_age: "Birth", min_age_days: 0, max_age_days: 30, created_at: new Date(), updated_at: new Date() },

      // Hepatitis B (child)
      { vaccine_id: 2, dose_number: 1, recommended_age: "Birth", min_age_days: 0, max_age_days: 30, created_at: new Date(), updated_at: new Date() },

      // OPV/IPV
      { vaccine_id: 3, dose_number: 1, recommended_age: "6 weeks", min_age_days: 42, max_age_days: 60, created_at: new Date(), updated_at: new Date() },
      { vaccine_id: 3, dose_number: 2, recommended_age: "10 weeks", min_age_days: 70, max_age_days: 90, created_at: new Date(), updated_at: new Date() },
      { vaccine_id: 3, dose_number: 3, recommended_age: "14 weeks", min_age_days: 98, max_age_days: 120, created_at: new Date(), updated_at: new Date() },

      // Pentavalent
      { vaccine_id: 4, dose_number: 1, recommended_age: "6 weeks", min_age_days: 42, max_age_days: 60, created_at: new Date(), updated_at: new Date() },
      { vaccine_id: 4, dose_number: 2, recommended_age: "10 weeks", min_age_days: 70, max_age_days: 90, created_at: new Date(), updated_at: new Date() },
      { vaccine_id: 4, dose_number: 3, recommended_age: "14 weeks", min_age_days: 98, max_age_days: 120, created_at: new Date(), updated_at: new Date() },

      // PCV
      { vaccine_id: 5, dose_number: 1, recommended_age: "6 weeks", min_age_days: 42, max_age_days: 60, created_at: new Date(), updated_at: new Date() },
      { vaccine_id: 5, dose_number: 2, recommended_age: "10 weeks", min_age_days: 70, max_age_days: 90, created_at: new Date(), updated_at: new Date() },
      { vaccine_id: 5, dose_number: 3, recommended_age: "14 weeks", min_age_days: 98, max_age_days: 120, created_at: new Date(), updated_at: new Date() },

      // Rotavirus
      { vaccine_id: 6, dose_number: 1, recommended_age: "6 weeks", min_age_days: 42, max_age_days: 60, created_at: new Date(), updated_at: new Date() },
      { vaccine_id: 6, dose_number: 2, recommended_age: "10 weeks", min_age_days: 70, max_age_days: 90, created_at: new Date(), updated_at: new Date() },

      // MMR
      { vaccine_id: 7, dose_number: 1, recommended_age: "6 months", min_age_days: 180, max_age_days: 210, created_at: new Date(), updated_at: new Date() },

      // Yellow Fever
      { vaccine_id: 8, dose_number: 1, recommended_age: "9 months", min_age_days: 270, max_age_days: 300, created_at: new Date(), updated_at: new Date() },

      // MCV
      { vaccine_id: 9, dose_number: 1, recommended_age: "12 months", min_age_days: 365, max_age_days: 395, created_at: new Date(), updated_at: new Date() },

      // DTP Booster
      { vaccine_id: 10, dose_number: 1, recommended_age: "15 months", min_age_days: 455, max_age_days: 485, created_at: new Date(), updated_at: new Date() },

      // Tdap
      { vaccine_id: 11, dose_number: 1, recommended_age: "9-14 years", min_age_days: 0, max_age_days: 365, created_at: new Date(), updated_at: new Date() },
      
      // Meningococcal
      { vaccine_id: 12, dose_number: 1, recommended_age: "11-12 years", min_age_days: 0, max_age_days: 365, created_at: new Date(), updated_at: new Date() },
      
      // HPV
      { vaccine_id: 13, dose_number: 1, recommended_age: "9-14 years", min_age_days: 3285, max_age_days: 5110, created_at: new Date(), updated_at: new Date() },

      // Adult Hepatitis B
      { vaccine_id: 14, dose_number: 1, recommended_age: "Month 0", min_age_days: 0, max_age_days: 30, created_at: new Date(), updated_at: new Date() },
      { vaccine_id: 14, dose_number: 2, recommended_age: "Month 1", min_age_days: 30, max_age_days: 60, created_at: new Date(), updated_at: new Date() },
      { vaccine_id: 14, dose_number: 3, recommended_age: "Month 6", min_age_days: 180, max_age_days: 210, created_at: new Date(), updated_at: new Date() },

      // Influenza
      { vaccine_id: 15, dose_number: 1, recommended_age: "Yearly", min_age_days: null, max_age_days: null, created_at: new Date(), updated_at: new Date() },

      // Covid-19
      { vaccine_id: 16, dose_number: 1, recommended_age: "Adult dose", min_age_days: 6570, max_age_days: null, created_at: new Date(), updated_at: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("vaccine_doses", null, {});
  }
};
