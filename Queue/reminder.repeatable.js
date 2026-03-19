"use strict";

const reminderQueue = require("./reminder.queue");

// Helper to format today as YYYY-MM-DD
const todayString = () => new Date().toISOString().split("T")[0];

async function setupReminderJobs() {
  // DAILY REMINDER EMAILS (8 AM local time)
  await reminderQueue.add(
    "sendEmail",
    {}, // actual profile IDs queued dynamically in worker
    {
      repeat: { cron: "0 8 * * *" },
      jobId: `daily-sendEmail-${todayString()}`,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  // WEEKLY SUMMARY (Sundays at 9 AM)
  await reminderQueue.add(
    "weeklySummary",
    {},
    {
      repeat: { cron: "0 9 * * SUN" },
      jobId: `weekly-summary-${todayString()}`,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  console.log("Repeatable reminder jobs registered");
}

module.exports = setupReminderJobs;