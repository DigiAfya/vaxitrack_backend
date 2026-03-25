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

      // New fields for calendar integration
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      end_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      recurrence_rule: {
        type: DataTypes.STRING, // e.g. "RRULE:FREQ=WEEKLY;BYDAY=MO"
        allowNull: true,
      },

      external_event_id: {
        type: DataTypes.STRING, // Google/Outlook event ID
        allowNull: true,
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
