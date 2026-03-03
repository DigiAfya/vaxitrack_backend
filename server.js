require("dotenv").config();
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0
});
const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { sequelize } = require("./models");
const { Profile } = require("./models");

const errorHandler = require("./middleware/error.middleware");
const { protect } = require("./middleware/auth.middleware");  

// ROUTES
const authRoutes = require("./routes/auth.Route");
const profileRoutes = require("./routes/profile.Route");
const vaccineRoutes = require("./routes/vaccine.Routes");
const reminderRoutes = require("./routes/Reminder.Route");
const dashboardRoutes = require("./routes/dashboard.Route");
const recommendationRoutes = require("./routes/recommendation.Route");
const { generateOverdueReminders, sendReminderEmails } = require("./controllers/Reminder.Controller");

const app = express();

// MIDDLEWARE
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HEALTH CHECK
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// PUBLIC ROUTES
app.use("/api/auth", authRoutes);

// PROTECTED ROUTES 
app.use("/api/profiles", protect, profileRoutes);
app.use("/api/vaccines", protect, vaccineRoutes);
app.use("/api/reminders", protect, reminderRoutes);
app.use("/api/dashboard", protect, dashboardRoutes);
app.use("/api/recommendations", protect, recommendationRoutes);

// ERROR HANDLER
Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

// DATABASE CONNECTION
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    await sequelize.sync({ alter: true });
    console.log("Models synced");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
}

startServer();

/// CRON JOB — runs every day at 8:00 AM
cron.schedule("0 8 * * *", async () => {
  console.log("⏰ Running vaccine reminder cron job...");

  try {
    const { Profile } = require("./models");

    const profiles = await Profile.findAll();

    for (let profile of profiles) {
      await generateOverdueReminders(profile.profile_id);   // Mark overdue reminders
      await sendReminderEmails(profile.profile_id);         // Send reminder emails for overdue vaccines
    }

    console.log("Reminder job completed successfully");
  } catch (error) {
    console.error("Error running reminder job:", error);
  }
});
