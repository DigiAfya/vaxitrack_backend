const path = require("path");
const fs = require("fs");

// Determine environment
const env = process.env.NODE_ENV || "development";

// Load the corresponding .env file if it exists
const envPath = path.resolve(__dirname, `../.env.${env}`);
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
  console.log(`Loaded environment variables from ${envPath}`);
} else {
  require("dotenv").config(); // fallback to .env
  console.log("Loaded environment variables from default .env");
}

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: false
  },
  docker: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: false
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: false
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};