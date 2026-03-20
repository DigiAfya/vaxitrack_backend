const { Sequelize } = require("sequelize");
const path = require("path");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV || "development";

if (env !== "docker" && env !== "production") {
  dotenv.config({ path: path.resolve(__dirname, `../.env.${env}`) });
}

const dialectOptions = {};
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com")) {
  dialectOptions.ssl = { require: true, rejectUnauthorized: false };
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions,
  define: {
    underscored: true,
    freezeTableName: true,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
};

connectDB();

module.exports = { sequelize, connectDB };