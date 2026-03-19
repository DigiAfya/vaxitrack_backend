const express = require("express");
const router = express.Router();

const { authorize } = require("../middleware/role.middleware");
const { getQueueStats, getQueueTrends, getQueueMonthlyStats } = require("../controllers/QueueDashboard.controller");

// Admin-only dashboard stats
router.get("/",  authorize("admin"), getQueueStats);

// trend endpoint
router.get("/trends", authorize("admin"), getQueueTrends);

// Monthly enpoint
router.get("/monthly",  authorize("admin"), getQueueMonthlyStats);

module.exports = router;
