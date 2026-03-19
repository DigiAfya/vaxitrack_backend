
"use strict";
module.exports = (sequelize, DataTypes) => {
  const VaccineFAQ = sequelize.define("VaccineFAQ", {
    faq_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    vaccine_name: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    doses: { type: DataTypes.STRING(100), allowNull: false },
    info: { type: DataTypes.TEXT },
    administration: { type: DataTypes.TEXT, allowNull: false },
    age_range: { type: DataTypes.STRING(100) },
    category: { type: DataTypes.STRING(100) },
    embedding: { type: DataTypes.JSON, allowNull: true },
  }, {
    tableName: "vaccine_faqs",
    underscored: true,
    timestamps: true,
  });
  return VaccineFAQ;
};
