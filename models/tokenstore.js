"use strict";
module.exports = (sequelize, DataTypes) => {
  const TokenStore = sequelize.define("TokenStore", {
    token_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING(512), allowNull: false, unique: true },
    token_type: { type: DataTypes.ENUM("access", "refresh", "password_reset", "email_verification"), allowNull: false },
    is_revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
    expires_at: { type: DataTypes.DATE, allowNull: false }
  }, {
    tableName: "tokens",
    underscored: true,
    timestamps: true
  });
  return TokenStore;
};
