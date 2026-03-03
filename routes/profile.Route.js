const express = require("express");
const router = express.Router();

const { authorize } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const { profileSchema } = require("../Validation/Profile.validation");

const {
  createProfile,
  adminCreateProfile,
  getUserProfiles,
  getAllProfiles,
  updateProfile,
  deleteProfile,
} = require("../controllers/profile.controller");

// USER ROUTES
router.post("/", authorize("user"), validate(profileSchema), createProfile);
router.get("/my-profiles", authorize("user"), getUserProfiles);

// ADMIN ROUTES
router.post("/admin", authorize("admin"), adminCreateProfile);
router.get("/admin/all", authorize("admin"), getAllProfiles);
router.put("/admin/:id", authorize("admin"), updateProfile);
router.delete("/admin/:id", authorize("admin"), deleteProfile);

module.exports = router;
