"use strict";
module.exports = (sequelize, DataTypes) => {
  const VaccineStatus = sequelize.define(
    "VaccineStatus",
    {
      status_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      profile_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      vaccine_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      status: {
        type: DataTypes.ENUM("Taken", "Due", "Overdue"),
        allowNull: false,
        defaultValue: "Due",
      },
      date_taken: { type: DataTypes.DATEONLY },
    },
    {
      tableName: "Vaccine_Status",
      underscored: true,
      timestamps: true,
    }
  );
  return VaccineStatus;
};
