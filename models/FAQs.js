"use strict";
module.exports = (sequelize, DataTypes) => {
  const FAQ = sequelize.define("FAQ", {
    faq_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    question: { type: DataTypes.STRING(255), allowNull: false },
    answer: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING(100), allowNull: true },
    embedding: { type: DataTypes.JSON, allowNull: true },
  }, {
    tableName: "faqs",
    underscored: true,
    timestamps: true,
  });
  return FAQ;
};
