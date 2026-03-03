const { Reminder, Profile, Vaccine, User } = require("../models");
const sendResponse = require("../utilities/response.util");
const ApiError = require("../utilities/ApiErr.util");
const { sendEmail } = require("../utilities/email.util");

//CREATE REMINDER
const createReminder = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { vaccineId, dueDate, status } = req.body;

    if (!vaccineId || !dueDate) {
      throw new ApiError(400, "Vaccine ID and due date are required");
    }

    const reminder = await Reminder.create({
      profile_id: profileId,
      vaccine_id: vaccineId,
      due_date: dueDate,
      status: status || "Due",
    });

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

//GET REMINDERS FOR A PROFILE.
const getReminders = async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const reminders = await Reminder.findAll({
      where: { profile_id: profileId },
      include: [{ model: Vaccine }],
      order: [["due_date", "ASC"]],
    });

    return sendResponse(res, {
      success: true,
      message: "Reminders fetched successfully",
      data: reminders,
    });
  } catch (error) {
    next(error);
  }
};

//GENERATE OVERDUE REMINDERS
const generateOverdueReminders = async (profileId) => {
  try {
    const today = new Date();

    const reminders = await Reminder.findAll({ where: { profile_id: profileId } });

    for (let reminder of reminders) {
      if (reminder.due_date && new Date(reminder.due_date) < today && reminder.status !== "Overdue") {
        reminder.status = "Overdue";
        await reminder.save();
      }
    }
  } catch (error) {
    console.error("Error generating overdue reminders:", error.message);
  }
};

//SEND EMAIL REMINDERS (HTML Template)
const sendReminderEmails = async (profileId) => {
  try {
    const reminders = await Reminder.findAll({
      where: { profile_id: profileId, status: "Overdue" },
      include: [
        {
          model: Profile,
          as: "profile",
          include: [{ model: User, as: "user", attributes: ["email", "full_name"] }],
        },
        { model: Vaccine, as: "vaccine" },
      ],
    });

    for (let reminder of reminders) {
      const email = reminder.profile.user.email;
      const userName = reminder.profile.user.full_name || "User";
      const vaccineName = reminder.vaccine.name;
      const dueDate = reminder.due_date;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #2c3e50; text-align: center;">VacciTrack Vaccine Reminder</h2>
          <p style="font-size: 16px; color: #333;">
            Dear ${userName},
          </p>
          <p style="font-size: 16px; color: #333;">
            We noticed that your vaccine <strong style="color: #e74c3c;">${vaccineName}</strong> was due on 
            <strong style="color: #e74c3c;">${dueDate}</strong> and is now overdue.
          </p>
          <p style="font-size: 16px; color: #333;">
            It’s important to stay protected. Please schedule your vaccination as soon as possible.
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://your-app-link.com/schedule" 
               style="background-color: #27ae60; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Schedule Now
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="font-size: 14px; color: #777; text-align: center;">
            Stay safe and healthy,<br/>
            <strong>The VaxiTrack Team</strong>
          </p>
        </div>
      `;

      await sendEmail(email, "Vaccine Overdue Reminder", htmlContent);
    }
  } catch (error) {
    console.error("Error sending reminder emails:", error.message);
  }
};

module.exports = {
  createReminder,
  getReminders,
  generateOverdueReminders,
  sendReminderEmails,
};
