const Redis = require("ioredis");

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || 6379;

let redisConnection;

try {
  redisConnection = new Redis({
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      if (times > 3) {
        console.warn("Redis unavailable - queue features disabled");
        return null;
      }
      return Math.min(times * 500, 2000);
    }
  });

  redisConnection.on("connect", () => {
    console.log("Redis connected successfully");
  });

  redisConnection.on("error", (err) => {
    if (err.code === "ECONNREFUSED") {
      console.warn("Redis not available - queue features disabled");
    }
  });
} catch (err) {
  console.warn("Redis initialization failed - queue features disabled");
  redisConnection = null;
}

module.exports = redisConnection;