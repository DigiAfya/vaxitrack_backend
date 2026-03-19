const reminderQueue = require("../queues/reminder.queue");

// importing worker automatically registers processors
require("../workers/reminder.worker");

console.log("Reminder processor initialized");