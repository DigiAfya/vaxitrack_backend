const { VaccineStatus, Vaccine } = require("../models");
const { Op } = require("sequelize");

// Configurable thresholds for scaling
const thresholds = {
  mediumDays: 7, // due within 7 days → Medium
  highDays: 0,   // overdue → High
};

// Get recommendations with priority levels
const getRecommendations = async (profile, filters = {}) => {
  const { priority, status, dueWithin } = filters;

  const whereClause = { profile_id: profile.profile_id };
  if (status) whereClause.status = status;

  const statuses = await VaccineStatus.findAll({
    where: whereClause,
    include: [{ model: Vaccine }],
    order: [["due_date", "ASC"]],
  });

  const recommendations = [];

  for (let s of statuses) {
    let priorityLevel = "Low";
    const today = new Date();
    const dueDate = new Date(s.due_date);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    switch (s.status) {
      case "Overdue":
        priorityLevel = "High";
        break;
      case "Due":
        if (diffDays <= thresholds.mediumDays) priorityLevel = "Medium";
        else priorityLevel = "Low";
        break;
      case "Taken":
        priorityLevel = "None";
        break;
    }

    if (priorityLevel !== "None") {
      const rec = {
        vaccine: s.Vaccine.name,
        due_date: s.due_date,
        status: s.status,
        priority: priorityLevel,
      };

      // Apply filters
      if (priority && rec.priority !== priority) continue;
      if (dueWithin && diffDays > dueWithin) continue;

      recommendations.push(rec);
    }
  }

  return recommendations;
};

module.exports = { getRecommendations };
