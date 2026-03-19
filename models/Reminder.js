"use strict";

module.exports = (sequelize, DataTypes) => {
  const Reminder = sequelize.define(
    "Reminder",
    {
      reminder_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      profile_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      vaccine_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      due_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("Due", "Overdue"),
        defaultValue: "Due",
      },

      last_notified_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "reminders",
      timestamps: true,
      underscored: true,
      paranoid: true,
    }
  );

  Reminder.associate = (models) => {
    Reminder.belongsTo(models.Profile, {
      foreignKey: "profile_id",
      as: "profile",
    });

    Reminder.belongsTo(models.Vaccine, {
      foreignKey: "vaccine_id",
      as: "vaccine",
    });
  };

  return Reminder;
};