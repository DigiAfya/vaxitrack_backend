const Redis = require("ioredis");

const redisConnection = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("Redis connected successfully");
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err);
});

module.exports = redisConnection;