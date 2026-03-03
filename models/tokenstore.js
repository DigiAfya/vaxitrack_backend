"use strict";

module.exports = (sequelize, DataTypes) => {
  const TokenStore = sequelize.define("TokenStore", {
    token: {
      type: DataTypes.STRING(512), 
      allowNull: false,
      unique: true
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM("access", "refresh"),
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: "token_store",
    timestamps: true,   // createdAt, updatedAt
    paranoid: true
  });

  return TokenStore;
};
