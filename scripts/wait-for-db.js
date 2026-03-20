const { Sequelize } = require("sequelize");

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
});

const waitForDB = async () => {
  let retries = 10;
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log("Database ready");
      process.exit(0);
    } catch (err) {
      retries--;
      console.log("Waiting for database... (" + retries + " retries left)");
      await new Promise(res => setTimeout(res, 3000));
    }
  }
  console.error("Could not connect to database after 10 attempts");
  process.exit(1);
};

waitForDB();