"use strict";
module.exports = (sequelize, DataTypes) => {
  const Profile = sequelize.define(
    "Profile",
    {
      profile_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      full_name: { type: DataTypes.STRING, allowNull: false },
      dob: { type: DataTypes.DATEONLY, allowNull: false },
      gender: { type: DataTypes.ENUM("Male", "Female", "Other"), allowNull: false },
      category: { type: DataTypes.ENUM("Child", "Adult"), allowNull: false },
    },
    {
      tableName: "Profiles",
      underscored: true,
      timestamps: true,
      paranoid: true,
    }
  );

  return Profile;
};
