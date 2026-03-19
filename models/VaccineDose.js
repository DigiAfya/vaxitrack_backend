"use strict";
module.exports = (sequelize, DataTypes) => {
  const VaccineDose = sequelize.define("VaccineDose", {
    dose_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    vaccine_id: { type: DataTypes.INTEGER, allowNull: false},
    dose_number: { type: DataTypes.INTEGER, allowNull: false},
    recommended_age: { type: DataTypes.STRING, allowNull: true},
    min_age_days: { type: DataTypes.INTEGER, allowNull: true},
    max_age_days: { type: DataTypes.INTEGER, allowNull: true},
    min_gap_days: { type: DataTypes.INTEGER, allowNull: true},
    description: { type: DataTypes.TEXT, allowNull: true},
  }, {
    tableName: "vaccine_doses",
    underscored: true,
    timestamps: true,
  });

  VaccineDose.associate = (models) => {
    VaccineDose.belongsTo(models.Vaccine, {
      foreignKey: "vaccine_id",
      as: "vaccine",
      onDelete: "CASCADE",
    });
  };

  return VaccineDose;
};
