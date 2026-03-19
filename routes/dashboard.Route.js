const express = require("express");
const router = express.Router();

const { authorize } = require("../middleware/role.middleware");
const { getDashboard, listAllDashboards, exportDashboards } = require("../controllers/dashboard.controller");

// User dashboard (existing, unchanged)
router.get("/:id", authorize("user"), getDashboard);

// Admin dashboard (existing, unchanged)
router.get("/admin/:id",  authorize("admin"), getDashboard);

// Admin: list all dashboards (with filters, pagination, search, sort)
router.get("/admin",  authorize("admin"), listAllDashboards);

// Admin: export dashboards (CSV/Excel)
router.get("/admin/export", authorize("admin"), exportDashboards);

module.exports = router;
