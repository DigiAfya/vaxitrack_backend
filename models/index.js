"use strict";

const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "..", "config", "config.js"))[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Dynamically import all models
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename && // skip index.js
      file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Run associations
const { User, Profile, Vaccine, Reminder, AuditLog, VaccineStatus, TokenStore } = db;

if (User && Profile) {
  User.hasMany(Profile, { foreignKey: "user_id", as: "profiles" });
  Profile.belongsTo(User, { foreignKey: "user_id", as: "user" });
}

if (Profile && Reminder) {
  Profile.hasMany(Reminder, { foreignKey: "profile_id", as: "reminders" });
  Reminder.belongsTo(Profile, { foreignKey: "profile_id", as: "profile" });
}

if (Vaccine && Reminder) {
  Vaccine.hasMany(Reminder, { foreignKey: "vaccine_id", as: "reminders" });
  Reminder.belongsTo(Vaccine, { foreignKey: "vaccine_id", as: "vaccine" });
}

if (VaccineStatus && Profile) {
  VaccineStatus.belongsTo(Profile, { foreignKey: "profile_id", as: "profile" });
}
if (VaccineStatus && Vaccine) {
  VaccineStatus.belongsTo(Vaccine, { foreignKey: "vaccine_id", as: "vaccine" });
}

if (TokenStore && User) {
  TokenStore.belongsTo(User, { foreignKey: "user_id", as: "user", onDelete: "CASCADE" });
  User.hasMany(TokenStore, { foreignKey: "user_id", as: "tokens" });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
