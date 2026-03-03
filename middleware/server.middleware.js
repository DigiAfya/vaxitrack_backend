const morgan = require("morgan");
const serverMiddleware = (app) => {
  app.use(morgan("dev"));
};
module.exports = serverMiddleware;
