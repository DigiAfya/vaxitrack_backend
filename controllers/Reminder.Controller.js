const { Reminder, Profile, Vaccine, User } = require("../models");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const sendResponse = require("../utilities/response.util");
const ApiError = require("../utilities/ApiErr.util");
const { sendEmail } = require("../utilities/email.util");
const { logAction } = require("../utilities/AuditLog.util");
const { Op } = require("sequelize");

/* ====== CREATE REMINDER ================= */

const createReminder = async (req, res, next) => {
  try {

    const profileId = req.user.role === "admin"
      ? req.params.profileId
      : req.activeProfile.profile_id;

    const { vaccine_id, due_date, status } = req.body;

    if (!vaccine_id || !due_date) {
      throw new ApiError(400, "Vaccine ID and due date are required");
    }

    const profile = await Profile.findByPk(profileId);

    if (!profile) throw new ApiError(404, "Profile not found");

    if (
      req.user.role !== "admin" &&
      profile.user_id !== req.user.user_id
    ) {
      throw new ApiError(403, "Access denied");
    }

    const reminder = await Reminder.create({
      profile_id: profileId,
      vaccine_id,
      due_date,
      status: status || "due",
    });

    await logAction(
      req.user.user_id,
      "USER_CREATED_REMINDER",
      "reminders",
      reminder.reminder_id,
      `Created reminder for vaccine ${vaccine_id}`
    );

    await reminderQueue.add(
      "sendEmail",
      { profileId },
      {
        jobId: `reminder-${profileId}-${todayString()}`,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: { type: "exponential", delay: 60000 },
        delay: 5000,
      }
    );

    return sendResponse(res, {
      success: true,
      message: "Reminder created successfully",
      data: reminder,
      statusCode: 201,
    });

  } catch (error) {
    next(error);
  }
};


// GET REMINDERS (with ownership check + audit log)
const getReminders = async (req, res, next) => {
  try {

    const profileId = req.user.role === "admin"
      ? req.params.profileId
      : req.activeProfile.profile_id;

    const profile = await Profile.findByPk(profileId);

    if (!profile) throw new ApiError(404, "Profile not found");

    if (
      req.user.role !== "admin" &&
      profile.user_id !== req.user.user_id
    ) {
      throw new ApiError(403, "Access denied");
    }

    const reminders = await Reminder.findAll({
      where: { profile_id: profileId },
      include: [{ model: Vaccine, as: "vaccine" }],
      order: [["due_date", "ASC"]],
    });
    await logAction(
      req.user.user_id,
      "FETCHED_REMINDERS",
      "reminders",
      0,
      `Fetched reminders for profile ${profileId}`
    );

    return sendResponse(res, {
      success: true,
      message: "Reminders fetched successfully",
      data: reminders,
    });

  } catch (error) {
    next(error);
  }
};


// UPDATE REMINDER (with ownership check + audit log)
const updateReminder = async (req, res, next) => {
  try {

    const profileId = req.user.role === "admin"
      ? req.params.profileId
      : req.activeProfile.profile_id;

    const { reminderId } = req.params;
    const { vaccine_id, due_date, status } = req.body;

    const profile = await Profile.findByPk(profileId);

    if (!profile) throw new ApiError(404, "Profile not found");

    if (
      req.user.role !== "admin" &&
      profile.user_id !== req.user.user_id
    ) {
      throw new ApiError(403, "Access denied");
    }

    const reminder = await Reminder.findByPk(reminderId);

    if (!reminder || reminder.profile_id !== parseInt(profileId)) {
      throw new ApiError(404, "Reminder not found");
    }

    await reminder.update({ vaccine_id, due_date, status });
    
    await logAction(
      req.user.user_id,
      "USER_UPDATED_REMINDER",
      "reminders",
      reminder.reminder_id,
      `Updated reminder ${reminder.reminder_id}`
    );

    await reminderQueue.add(
      "sendEmail",
      { profileId },
      {
        jobId: `reminder-${profileId}-${todayString()}`,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: { type: "exponential", delay: 60000 },
      }
    );

    return sendResponse(res, {
      success: true,
      message: "Reminder updated successfully",
      data: reminder,
    });

  } catch (error) {
    next(error);
  }
};

/* ================= GENERATE OVERDUE ================= */

const generateOverdueReminders = async (profileId) => {

  const today = new Date();

  const reminders = await Reminder.findAll({
    where: { profile_id: profileId }
  });

  for (const reminder of reminders) {

    if (
      reminder.due_date &&
      new Date(reminder.due_date) < today &&
      reminder.status !== "overdue"
    ) {
      reminder.status = "overdue";

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
};



/* ================= DELETE REMINDER ================= */

const deleteReminder = async (req, res, next) => {
  try {

    const profileId = req.user.role === "admin"
      ? req.params.profileId
      : req.activeProfile.profile_id;

    const { reminderId } = req.params;

    const profile = await Profile.findByPk(profileId);

    if (!profile) throw new ApiError(404, "Profile not found");

    if (
      req.user.role !== "admin" &&
      profile.user_id !== req.user.user_id
    ) {
      throw new ApiError(403, "Access denied");
    }

    const reminder = await Reminder.findByPk(reminderId);

    if (!reminder || reminder.profile_id !== parseInt(profileId)) {
      throw new ApiError(404, "Reminder not found");
    }

    await reminder.destroy();
    
    await logAction(
      req.user.user_id,
      "USER_DELETED_REMINDER",
      "reminders",
      reminder.reminder_id,
      `Deleted reminder ${reminder.reminder_id}`
    );

    return sendResponse(res, {
      success: true,
      message: "Reminder deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};

/* ================= SEND REMINDER EMAILS ================= */


const sendReminderEmails = async (profileId) => {

  const reminders = await Reminder.findAll({
    where: {
      profile_id: profileId,
      status: "Overdue",
      [Op.or]: [
        { last_notified_at: null },
        { last_notified_at: { [Op.lt]: new Date() } }
      ]
    },
    include: [
      {
        model: Profile,
        as: "profile",
        include: [{ model: User, as: "user", attributes: ["email"] }]
      },
      { model: Vaccine, as: "vaccine" }
    ]
  });

  for (const reminder of reminders) {

    const email = reminder?.profile?.user?.email;

    if (!email) continue;

    const vaccineName = reminder.vaccine?.name || "Vaccine";

    const htmlContent = `
      <h2>VacciTrack Vaccine Reminder</h2>
      <p>Your vaccine <strong>${vaccineName}</strong> is overdue.</p>
      <p>Please schedule your vaccination as soon as possible.</p>
    `;

    await sendEmail(email, "Vaccine Overdue Reminder", htmlContent);

    reminder.last_notified_at = new Date();

    await reminder.save();

    await logAction(
      reminder.profile.user_id,
      "REMINDER_EMAIL_SENT",
      "reminders",
      reminder.reminder_id,
      `Sent overdue reminder email for vaccine ${vaccineName}`
    );
  }
};

//  Export reminders (CSV/Excel with summary sheet)
const exportReminders = async (req, res, next) => {
  try {
    const { format = "csv", search = "", sort = "due_date", order = "ASC" } = req.query;

    const reminders = await Reminder.findAll({
      include: [
        { model: Vaccine, as: "vaccine" },
        { model: Profile, as: "profile", include: [{ model: User, as: "user", attributes: ["email"] }] },
      ],
      where: search ? { status: { [Op.like]: `%${search}%` } } : undefined,
      order: [[sort, order]],
    });

    if (!reminders || reminders.length === 0) throw new ApiError(404, "No reminders found");

    const data = reminders.map((r) => ({
      reminder_id: r.reminder_id,
      profile_id: r.profile_id,
      vaccine: r.vaccine ? r.vaccine.name : "N/A",
      due_date: r.due_date,
      status: r.status,
      user_email: r.profile?.user?.email || "N/A",
      created_at: r.created_at,
    }));

    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();

      // Main sheet
      const sheet = workbook.addWorksheet("Reminders");
      sheet.columns = [
        { header: "Reminder ID", key: "reminder_id", width: 15 },
        { header: "Profile ID", key: "profile_id", width: 15 },
        { header: "Vaccine", key: "vaccine", width: 25 },
        { header: "Due Date", key: "due_date", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "User Email", key: "user_email", width: 30 },
        { header: "Created At", key: "created_at", width: 20 },
      ];

      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
        cell.alignment = { horizontal: "center" };
      });

      data.forEach((d) => sheet.addRow(d));

      // Summary sheet by status
      const summarySheet = workbook.addWorksheet("Summary");
      summarySheet.addRow(["Status", "Count", "Percentage"]);

      const totalReminders = data.length;
      const statusCounts = {};

      data.forEach((r) => {
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      });

      Object.entries(statusCounts).forEach(([status, count]) => {
        summarySheet.addRow([
          status,
          count,
          totalReminders > 0 ? `${((count / totalReminders) * 100).toFixed(1)}%` : "0%",
        ]);
      });

      summarySheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB0C4DE" } };
      });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=reminders.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    } else {
      const parser = new Parser({ fields: Object.keys(data[0]) });
      const csv = parser.parse(data);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=reminders.csv");
      res.send(csv);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  generateOverdueReminders,
  sendReminderEmails,
  exportReminders, 
};
