"use strict";

const { reminderQueue } = require("../Queue/reminder.queue");
const reminderService = require("../services/reminder.service");
const { Profile } = require("../models");

console.log(" Reminder worker started...");

// --- DAILY REMINDER PROCESSOR ---
// Fetch all profiles and queue individual email jobs
reminderQueue.process("sendEmail", 5, async (job) => {
  try {
    const profiles = await Profile.findAll({ attributes: ["profile_id"] });

    for (const profile of profiles) {
      // Generate overdue reminders first
      await reminderService.generateOverdueReminders(profile.profile_id);

      // Only send email if not already notified today
      await reminderQueue.add(
        "sendProfileEmail",
        { profileId: profile.profile_id },
        {
          jobId: `profile-email-${profile.profile_id}-${new Date().toISOString().split("T")[0]}`,
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    }
  } catch (err) {
    console.error(" Failed to process sendEmail job:", err.message);
    throw err;
  }
});

// --- PROFILE EMAIL JOB ---
// Idempotent per profile
reminderQueue.process("sendProfileEmail", 5, async (job) => {
  try {
    await reminderService.sendReminderEmails(job.data.profileId);
    console.log(`Reminder emails sent for profile ${job.data.profileId}`);
  } catch (err) {
    console.error(` Failed to send emails for profile ${job.data.profileId}:`, err.message);
    throw err;
  }
});

// --- WEEKLY SUMMARY JOB ---
reminderQueue.process("weeklySummary", async () => {
  try {
    await reminderService.sendWeeklySummary();
    console.log("Weekly summary sent successfully");
  } catch (err) {
    console.error("Weekly summary failed:", err.message);
    throw err;
  }
});

// --- JOB EVENTS ---
reminderQueue.on("completed", (job) =>
  console.log(`🎉 Job completed: ${job.id} [${job.name}]`)
);
reminderQueue.on("failed", (job, err) =>
  console.error(`Job failed: ${job.id} [${job.name}] - ${err.message}`)
);
reminderQueue.on("stalled", (job) =>
  console.warn(`Job stalled: ${job.id} [${job.name}]`)
);