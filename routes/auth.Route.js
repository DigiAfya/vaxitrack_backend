const express = require("express");
const router = express.Router();

const { authorize } = require("../middleware/role.middleware");
const  validate  = require("../middleware/validate.middleware");
const { registerSchema, loginSchema } = require("../Validation/Auth.validation");

const {
  register,
  login,
  googleLogin,
  deleteMyAccount,
  refreshToken,
  logout,
  forceLogout,       // admin function
  listActiveTokens,  // admin function
  adminDeleteUser    // admin function
} = require("../controllers/auth.controller");

// PUBLIC ROUTES
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/google", googleLogin);

// USER ROUTES 
router.post("/logout", authorize("user"), logout);
router.delete("/delete-account", authorize("user"), deleteMyAccount);

// ADMIN ROUTES 
router.post("/admin/register",  authorize("admin"), validate(registerSchema), register); // admin creates new user
router.post("/admin/logout/:userId", authorize("admin"), forceLogout);
router.get("/admin/tokens", authorize("admin"), listActiveTokens);
router.delete("/admin/delete/:userId",  authorize("admin"), adminDeleteUser);

module.exports = router;