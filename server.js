"use strict";
const path = require("path");
const dotenv = require("dotenv");
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const Sentry = require("@sentry/node");

const { sequelize } = require("./models");

const errorHandler = require("./middleware/error.middleware");
const { protect } = require("./middleware/auth.middleware");
const { authorize } = require("./middleware/role.middleware");

const authRoutes = require("./routes/auth.Route");
const profileRoutes = require("./routes/profile.Route");
const vaccineRoutes = require("./routes/vaccine.Routes");
const reminderRoutes = require("./routes/Reminder.Route");
const dashboardRoutes = require("./routes/dashboard.Route");
const recommendationRoutes = require("./routes/recommendation.Route");
const queueDashboardRoutes = require("./routes/QueueDashboard.Route");
const faqRoutes = require("./routes/chat.Route");
const vaxibotRoutes = require("./routes/vaxibot.Route");

let reminderQueue, setupReminderJobs;
let createBullBoard, BullAdapter, ExpressAdapter;
try {
  reminderQueue = require("./Queue/reminder.queue");
  setupReminderJobs = require("./Queue/reminder.repeatable");
  createBullBoard = require("@bull-board/api").createBullBoard;
  BullAdapter = require("@bull-board/api/bullAdapter").BullAdapter;
  ExpressAdapter = require("@bull-board/express").ExpressAdapter;
} catch (err) {
  console.warn("Queue/Bull Board not available:", err.message);
}

const { logAction } = require("./utilities/AuditLog.util");

const app = express();
app.disable("x-powered-by");

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 1.0 });
}

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: "UP", database: "Connected", uptime: process.uptime() });
  } catch (err) {
    res.status(503).json({ status: "DOWN", error: err.message });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/faqs", faqRoutes);
app.use("/api/v1/profiles", protect, profileRoutes);
app.use("/api/v1/vaccines", protect, vaccineRoutes);
app.use("/api/v1/reminders", protect, reminderRoutes);
app.use("/api/v1/dashboard", protect, dashboardRoutes);
app.use("/api/v1/recommendations", protect, recommendationRoutes);
app.use("/api/v1/admin/queue-dashboard", queueDashboardRoutes);
app.use("/api/v1/vaxibot", vaxibotRoutes);

if (ExpressAdapter && reminderQueue) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/admin/queues");
  createBullBoard({
    queues: [new BullAdapter(reminderQueue)],
    serverAdapter,
  });
  app.use(
    "/admin/queues",
    protect,
    authorize("admin"),
    async (req, res, next) => {
      await logAction(req.user.user_id, "ADMIN_VIEWED_BULL_BOARD", "queues", 0, "Admin accessed Bull Board");
      next();
    },
    serverAdapter.getRouter()
  );
}

if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    await sequelize.sync();
    console.log("Models synced");

    if (setupReminderJobs) {
      try {
        await setupReminderJobs();
        console.log("Reminder repeatable jobs registered");
      } catch (err) {
        console.warn("Reminder jobs skipped - Redis not available:", err.message);
      }
    }

    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error("Unable to connect to database:", error);
    process.exit(1);
  }
};

startServer();