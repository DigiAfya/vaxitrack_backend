const express = require("express");
const router = express.Router();

const { authorize } = require("../middleware/role.middleware");
const { getDashboard } = require("../controllers/dashboard.controller");


router.get("/:id", authorize("user"), getDashboard);


router.get("/admin/:id", authorize("admin"), getDashboard);

module.exports = router;
