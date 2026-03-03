"use strict";
module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    "AuditLog",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      admin_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      action: { type: DataTypes.STRING, allowNull: false },
      target_type: { type: DataTypes.STRING, allowNull: false },
      target_id: { type: DataTypes.INTEGER.UNSIGNED },
    },
    {
      tableName: "AuditLogs",
      underscored: true,
      timestamps: true,
    }
  );

  return AuditLog;
};
