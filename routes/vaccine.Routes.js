const express = require("express");
const router = express.Router();

const { authorize } = require("../middleware/role.middleware");
const validate  = require("../middleware/validate.middleware");
const { vaccineSchema } = require("../Validation/Vaccine.validation");

const {
  createVaccine,
  getVaccines,
  getVaccineById,
  updateVaccine,
  deleteVaccine,
  exportVaccines,
} = require("../controllers/vaccine.Controller");

// Admin creates vaccines
router.post("/", authorize("admin"), validate(vaccineSchema), createVaccine);

// Both admin and user can view vaccines (with pagination, search, sort)
router.get("/",  authorize("admin", "user"), getVaccines);

// Get single vaccine by ID
router.get("/:id", authorize("admin", "user"), getVaccineById);

// Admin updates vaccine
router.put("/:id",  authorize("admin"), validate(vaccineSchema), updateVaccine);

// Admin deletes vaccine
router.delete("/:id",  authorize("admin"), deleteVaccine);

// export route (admin only)
router.get("/admin/export",  authorize("admin"), exportVaccines);


module.exports = router;
