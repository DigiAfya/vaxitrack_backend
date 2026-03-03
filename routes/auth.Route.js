const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const {
  register,
  login,
  deleteMyAccount,
  refreshToken,
  logout,
} = require("../controllers/auth.controller");

// PUBLIC ROUTES
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

// USER ROUTES 
router.post("/logout", authorize("user"), logout);
router.delete("/delete-account", authorize("user"), deleteMyAccount);

module.exports = router;
