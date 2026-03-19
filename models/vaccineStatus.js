"use strict";
module.exports = (sequelize, DataTypes) => {
  const VaccineStatus = sequelize.define("VaccineStatus", {
    status_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    profile_id: { type: DataTypes.INTEGER, allowNull: false },
    vaccine_id: { type: DataTypes.INTEGER, allowNull: false },
    dose_number: { type: DataTypes.INTEGER },
    status: { type: DataTypes.ENUM("taken", "due", "overdue"), defaultValue: "due" },
    administered_date: { type: DataTypes.DATE },
    next_due_date: { type: DataTypes.DATE }
  }, {
    tableName: "vaccine_status",
    underscored: true,
    timestamps: true
  });
  return VaccineStatus;
};
