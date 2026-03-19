const express = require("express");
const router = express.Router();

const { authorize } = require("../middleware/role.middleware");
const  validate  = require("../middleware/validate.middleware");
const { profileSchema } = require("../Validation/Profile.validation");

const {
  createProfile,
  adminCreateProfile,
  getUserProfiles,
  getMyProfiles,
  getAllProfiles,
  updateProfile,
  deleteProfile,
  updateMyProfile,
  deleteMyProfile,
  exportProfiles // 
} = require("../controllers/profile.controller");

// USER ROUTES 
router.post("/",  authorize("user"), validate(profileSchema), createProfile);
router.get("/my-profiles", authorize("user"), getUserProfiles);
router.get("/me", getMyProfiles);
router.put("/my/:id",  authorize("user"), validate(profileSchema), updateMyProfile);
router.delete("/my/:id",  authorize("user"), deleteMyProfile);

// ADMIN ROUTES 
router.post("/admin", authorize("admin"), validate(profileSchema), adminCreateProfile);
router.get("/admin/all",  authorize("admin"), getAllProfiles);
router.put("/admin/:id",  authorize("admin"), validate(profileSchema), updateProfile);
router.delete("/admin/:id",  authorize("admin"), deleteProfile);

// ADMIN EXPORT ROUTE
router.get("/admin/export",  authorize("admin"), exportProfiles);

module.exports = router;
