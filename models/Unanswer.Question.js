"use strict";
module.exports = (sequelize, DataTypes) => {
  const UnansweredQuestion = sequelize.define("UnansweredQuestion", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    question: { type: DataTypes.TEXT, allowNull: false },
    asked_by: { type: DataTypes.STRING(100) },
    context: { type: DataTypes.TEXT },
    target_type: { type: DataTypes.ENUM("general", "vaccine"), defaultValue: "general" },
    resolved_to_id: { type: DataTypes.INTEGER },
  }, {
    tableName: "unanswered_questions",
    underscored: true,
    timestamps: true,
  });
  return UnansweredQuestion;
};
