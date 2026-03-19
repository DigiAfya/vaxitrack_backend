"use strict";

const express = require("express");
const router = express.Router();

const { authorize } = require("../middleware/role.middleware");
const  validate = require("../middleware/validate.middleware");
const { reminderSchema } = require("../Validation/Reminder.validation");
const activeProfile = require("../middleware/activeProfile.middleware");

const {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  generateOverdueReminders,
  sendReminderEmails,
  exportReminders,
} = require("../controllers/Reminder.Controller");

/* ================= ADMIN ROUTES ================= */

// Export reminders
router.get("/admin/export", authorize("admin"),exportReminders);

// Manual overdue check
router.post(
  "/admin/:profileId/overdue-check",
  authorize("admin"),
  async (req, res, next) => {
    try {
      await generateOverdueReminders(req.params.profileId);

      res.json({
        success: true,
        message: "Overdue reminders updated",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Manual email trigger
router.post(
  "/admin/:profileId/send-emails",
  authorize("admin"),
  async (req, res, next) => {
    try {
      await sendReminderEmails(req.params.profileId);

      res.json({
        success: true,
        message: "Reminder emails sent",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Admin update
router.put(
  "/admin/:profileId/:reminderId", authorize("admin"),validate(reminderSchema),updateReminder);

// Admin delete
router.delete("/admin/:profileId/:reminderId",authorize("admin"),deleteReminder);


/* ================= USER ROUTES ================= */

router.post("/:profileId",authorize("user"), activeProfile, validate(reminderSchema),createReminder);

router.get( "/:profileId", authorize("user"), activeProfile, getReminders);

router.put("/:profileId/:reminderId", authorize("user"), activeProfile, validate(reminderSchema),updateReminder);
router.delete("/:profileId/:reminderId",authorize("user"), activeProfile, deleteReminder);

module.exports = router;



