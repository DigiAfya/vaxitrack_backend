const express = require("express");
const router = express.Router();

const { authorize } = require("../middleware/role.middleware");
const {
  getRecommendationsForProfile,
  adminGetRecommendations,
  exportRecommendations,
} = require("../controllers/recommendation.controller");

// USER ROUTE
router.get("/:profileId",  authorize("user"), getRecommendationsForProfile);

// ADMIN ROUTES
router.get("/admin/:profileId", authorize("admin"), adminGetRecommendations);
router.get("/admin/export",  authorize("admin"), exportRecommendations);

module.exports = router;
