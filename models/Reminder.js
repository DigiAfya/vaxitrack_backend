"use strict";
module.exports = (sequelize, DataTypes) => {
  const Reminder = sequelize.define(
    "Reminder",
    {
      reminder_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      profile_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      vaccine_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      due_date: { type: DataTypes.DATEONLY },
      status: { type: DataTypes.ENUM("NextDue", "Overdue") },
    },
    {
      tableName: "Reminders",
      underscored: true,
      timestamps: true,
    }
  );

  return Reminder;
};
