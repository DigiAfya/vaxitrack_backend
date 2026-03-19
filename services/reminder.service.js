"use strict";

const { Reminder, Profile, Vaccine, User } = require("../models");
const { sendEmail } = require("../utilities/email.util");
const { logAction } = require("../utilities/AuditLog.util");
const { Op } = require("sequelize");

// Helper: today's date as YYYY-MM-DD
const todayString = () => new Date().toISOString().split("T")[0];

//Generate overdue reminders for a given profile
const generateOverdueReminders = async (profileId) => {
  try {
    const today = new Date();

    const reminders = await Reminder.findAll({ where: { profile_id: profileId } });

    for (let reminder of reminders) {
      if (reminder.due_date && new Date(reminder.due_date) < today && reminder.status !== "Overdue") {
        reminder.status = "Overdue";
        await reminder.save();

        await logAction(
          reminder.profile_id,
          "REMINDER_MARKED_OVERDUE",
          "reminders",
          reminder.reminder_id,
          `Reminder ${reminder.reminder_id} marked overdue`
        );
      }
    }
  } catch (error) {
    console.error("Error generating overdue reminders:", error.message);
  }
};

//Send reminder emails for a given profile, Marks last_notified_at to prevent duplicate emails
const sendReminderEmails = async (profileId) => {
  try {
    const today = todayString();

    const reminders = await Reminder.findAll({
      where: {
        profile_id: profileId,
        status: "Overdue",
        // Only send if last_notified_at is null or not today
        [Op.or]: [
          { last_notified_at: { [Op.is]: null } },
          { last_notified_at: { [Op.lt]: new Date(today) } }
        ],
      },
      include: [
        {
          model: Profile,
          as: "profile",
          include: [{ model: User, as: "user", attributes: ["email"] }],
        },
        { model: Vaccine, as: "vaccine" },
      ],
    });

    if (reminders.length === 0) return;

    for (let reminder of reminders) {
      const email = reminder.profile.user.email;
      const vaccineName = reminder.vaccine.name;
      const dueDate = reminder.due_date.toDateString();

      const htmlContent = `
        <h2>VacciTrack Vaccine Reminder</h2>
        <p>Your vaccine <strong>${vaccineName}</strong> was due on <strong>${dueDate}</strong> and is now overdue.</p>
        <p>Please schedule your vaccination as soon as possible.</p>
      `;

      await sendEmail(email, "Vaccine Overdue Reminder", htmlContent);

      // Mark as notified
      reminder.last_notified_at = new Date();
      await reminder.save();

      // Audit log
      await logAction(
        reminder.profile.user_id,
        "REMINDER_EMAIL_SENT",
        "reminders",
        reminder.reminder_id,
        `Sent overdue reminder email for vaccine ${vaccineName}`
      );
    }

  } catch (error) {
    console.error(`Error sending reminder emails for profile ${profileId}:`, error.message);
  }
};

/**
 * Send weekly summary to admin
 */
const sendWeeklySummary = async () => {
  try {
    const overdueCount = await Reminder.count({ where: { status: "Overdue" } });
    const dueCount = await Reminder.count({ where: { status: "Due" } });

    const html = `
      <h2>Weekly Reminder Summary</h2>
      <p>Due: ${dueCount}</p>
      <p>Overdue: ${overdueCount}</p>
    `;

    await sendEmail(process.env.ADMIN_EMAIL, "Weekly Reminder Summary", html);
  } catch (error) {
    console.error("Error sending weekly summary:", error.message);
  }
};

module.exports = {
  generateOverdueReminders,
  sendReminderEmails,
  sendWeeklySummary,
};