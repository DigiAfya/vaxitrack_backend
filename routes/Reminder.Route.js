const express = require("express");
const router = express.Router();

const { createReminder, getReminders } = require("../controllers/Reminder.Controller");

// USER ROUTES
router.post("/:profileId", createReminder);
router.get("/:profileId", getReminders);

module.exports = router;
