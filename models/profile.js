"use strict";

module.exports = (sequelize, DataTypes) => {
  const Profile = sequelize.define(
  "Profile",
  {
    profile_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    first_name: { type: DataTypes.STRING, allowNull: false },
    middle_name: { type: DataTypes.STRING },
    last_name: { type: DataTypes.STRING, allowNull: false },
    date_of_birth: { type: DataTypes.DATEONLY, allowNull: false },
    gender: { type: DataTypes.ENUM("male", "female", "prefer not to say"), allowNull: false },
    category: { type: DataTypes.ENUM("child", "adult"), allowNull: false }
  },
  {
    tableName: "profiles",
    underscored: true,
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at"
  }
);


  Profile.associate = (models) => {
    Profile.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return Profile;
};