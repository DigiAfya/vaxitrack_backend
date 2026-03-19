const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL);

const waitForDB = async () => {
  let connected = false;

  while (!connected) {
    try {
      await sequelize.authenticate();
      console.log("Database ready");
      connected = true;
    } catch (err) {
      console.log("Waiting for database...");
      await new Promise(res => setTimeout(res, 3000));
    }
  }
};

waitForDB();