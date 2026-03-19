const Queue = require("bull");
const redis = require("../config/redis");

const reminderQueue = new Queue("reminderQueue", {
  redis: redis.options,
});

module.exports = reminderQueue;
