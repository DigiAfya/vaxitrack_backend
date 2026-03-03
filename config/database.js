const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,        
  process.env.DB_USER,        
  process.env.DB_PASSWORD,    
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
    define: {
      underscored: true,     // created_at, updated_at
      freezeTableName: true, 
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB Connected Successfully");
  } catch (error) {
    console.error("DB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
