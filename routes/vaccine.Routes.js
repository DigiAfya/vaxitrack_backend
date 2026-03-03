const express = require("express");
const router = express.Router();

const { authorize } = require("../middleware/role.middleware");
const { createVaccine, getVaccines } = require("../controllers/vaccine.Controller");

// Admin creates vaccines
router.post("/", authorize("admin"), createVaccine);

// Both admin and user can view vaccines
router.get("/", authorize("admin", "user"), getVaccines);

module.exports = router;
