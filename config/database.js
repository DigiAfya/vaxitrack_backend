const { Sequelize } = require("sequelize");
const path = require("path");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV || "development";

dotenv.config({
  path: path.resolve(__dirname, `../.env.${env}`)
});

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
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
