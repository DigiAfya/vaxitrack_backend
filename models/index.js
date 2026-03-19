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
  sequelize = new Sequelize(config.url, {
    dialect: config.dialect,
    logging: config.logging,
    dialectOptions: config.dialectOptions,
  });
}

// Dynamically import all models
fs.readdirSync(__dirname)
  .filter((file) => file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js")
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Associations
const { User, Profile, Vaccine, VaccineStatus, Reminder, AuditLog, TokenStore, VaccineDose, FAQ, VaccineFAQ, UnansweredQuestion,} = db;

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
  Profile.hasMany(VaccineStatus, { foreignKey: "profile_id", as: "statuses" }); 
}

if (VaccineStatus && Vaccine) {
  VaccineStatus.belongsTo(Vaccine, { foreignKey: "vaccine_id", as: "vaccine" });
  Vaccine.hasMany(VaccineStatus, { foreignKey: "vaccine_id", as: "statuses" }); 
}

if (TokenStore && User) {
  TokenStore.belongsTo(User, { foreignKey: "user_id", as: "user", onDelete: "CASCADE" });
  User.hasMany(TokenStore, { foreignKey: "user_id", as: "tokens" });
}

if (AuditLog && User) {
  AuditLog.belongsTo(User, { foreignKey: "user_id", as: "user" });
  User.hasMany(AuditLog, { foreignKey: "user_id", as: "auditLogs" });
}

if (Vaccine && VaccineDose) {
  Vaccine.hasMany(VaccineDose, { foreignKey: "vaccine_id", as: "doses" });
  VaccineDose.belongsTo(Vaccine, { foreignKey: "vaccine_id", as: "vaccine" });
}

// Example: If you want FAQ and VaccineFAQ linked in future
// (currently independent, but you could add relations later)
if (FAQ && VaccineFAQ) {
  // For now, no direct relation — but you could do something like:
  // FAQ.hasMany(VaccineFAQ, { foreignKey: "faq_id", as: "vaccineFaqs" });
  // VaccineFAQ.belongsTo(FAQ, { foreignKey: "faq_id", as: "faq" });
}
if (FAQ && UnansweredQuestion) {
  FAQ.hasMany(UnansweredQuestion, { foreignKey: "resolved_to_id", constraints: false, scope: { target_type: "general" }, as: "unansweredGeneral" });
  UnansweredQuestion.belongsTo(FAQ, { foreignKey: "resolved_to_id", constraints: false, as: "faq" });
}

if (VaccineFAQ && UnansweredQuestion) {
  VaccineFAQ.hasMany(UnansweredQuestion, { foreignKey: "resolved_to_id", constraints: false, scope: { target_type: "vaccine" }, as: "unansweredVaccine" });
  UnansweredQuestion.belongsTo(VaccineFAQ, { foreignKey: "resolved_to_id", constraints: false, as: "vaccineFaq" });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
