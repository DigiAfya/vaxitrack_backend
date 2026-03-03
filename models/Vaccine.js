"use strict";
module.exports = (sequelize, DataTypes) => {
  const Vaccine = sequelize.define(
    "Vaccine",
    {
      vaccine_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      age_range: { type: DataTypes.STRING },
      category: { type: DataTypes.ENUM("Child", "Adult") },
      dose_sequence: { type: DataTypes.INTEGER },
      description: { type: DataTypes.TEXT },
    },
    {
      tableName: "Vaccines",
      underscored: true,
      timestamps: true,
    }
  );
  return Vaccine;
};
