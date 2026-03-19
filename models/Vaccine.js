"use strict";
module.exports = (sequelize, DataTypes) => {
  const Vaccine = sequelize.define("Vaccine", {
    vaccine_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    age_range: { type: DataTypes.STRING },
    category: { type: DataTypes.ENUM("child", "adolescent", "adult"), allowNull: false },
    description: { type: DataTypes.TEXT },
     info: { type: DataTypes.TEXT, allowNull: true }

  }, {
    tableName: "vaccines",
    underscored: true,
    timestamps: true
  });
  return Vaccine;
};








