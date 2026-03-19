"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM("user", "admin"), allowNull: false, defaultValue: "user" }
  }, {
    tableName: "users",
    underscored: true,
    timestamps: true,
    paranoid: true
  });
  return User;
};
