const { Sequelize } = require("sequelize");

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

console.log("DATABASE_URL starts with:", dbUrl.substring(0, 30) + "...");

const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
});

const waitForDB = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log("Database ready");
      process.exit(0);
    } catch (err) {
      retries--;
      console.log("DB error:", err.message);
      console.log("Retries left:", retries);
      await new Promise(res => setTimeout(res, 3000));
    }
  }
  console.error("Could not connect to database");
  process.exit(1);
};

waitForDB();