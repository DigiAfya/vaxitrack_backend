"use strict";
module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define("AuditLog", {
    log_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    entity: { type: DataTypes.STRING, allowNull: false },
    entity_id: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: "audit_logs",
    underscored: true,
    timestamps: true,
  });
  return AuditLog;
};

"use strict";

module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    "AuditLog",
    {
      log_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entity: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true, // optional field for extra context
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "audit_logs",
      timestamps: false, // we’re managing created_at/updated_at manually
    }
  );

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return AuditLog;
};
