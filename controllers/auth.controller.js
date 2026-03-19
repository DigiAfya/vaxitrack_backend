const bcrypt = require("bcryptjs");
const { User, Profile, TokenStore, sequelize } = require("../models");
const { generateToken } = require("../utilities/jwt.util");
const jwt = require("jsonwebtoken");
const sendResponse = require("../utilities/response.util");
const ApiError = require("../utilities/ApiErr.util");
const { validatePassword } = require("../Validation/password.validation");
const { logAction } = require("../utilities/AuditLog.util");


// REGISTER
const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    validatePassword(password);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw new ApiError(400, "User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password_hash: hashedPassword,
      role: role || "user",
    });

    const accessToken = await generateToken({
      user_id: user.user_id,
      role: user.role,
    });

    const refreshToken = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );

    await TokenStore.create({
      user_id: user.user_id,
      token: refreshToken,
      token_type: "refresh",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await logAction(user.user_id, "USER_REGISTERED", "users", user.user_id, "New user registered");

    return sendResponse(res, {
      success: true,
      message: "Registration successful",
      data: { accessToken, refreshToken },
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) throw new ApiError(401, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new ApiError(401, "Invalid credentials");

    const accessToken = await generateToken({
      user_id: user.user_id,
      role: user.role,
    });

    const refreshToken = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );

    await TokenStore.create({
      user_id: user.user_id,
      token: refreshToken,
      token_type: "refresh",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await logAction(user.user_id, "USER_LOGGED_IN", "users", user.user_id, "User logged in");

    return sendResponse(res, {
      success: true,
      message: "Login successful",
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

// REFRESH TOKEN
const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw new ApiError(400, "Refresh token required");

    const storedToken = await TokenStore.findOne({ where: { token, token_type: "refresh" } });
    if (!storedToken) throw new ApiError(401, "Invalid or expired refresh token");

    if (storedToken.expires_at < new Date()) {
      await storedToken.destroy();
      throw new ApiError(401, "Refresh token expired");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const newAccessToken = await generateToken({
      user_id: decoded.user_id,
      role: decoded.role,
    });

    await logAction(decoded.user_id, "REFRESHED_ACCESS_TOKEN", "tokens", storedToken.token_id, "Issued new access token");

    return sendResponse(res, {
      success: true,
      message: "New access token issued",
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT
const logout = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw new ApiError(400, "Refresh token required");

    const deleted = await TokenStore.destroy({ where: { token } });
    if (!deleted) throw new ApiError(404, "Token not found or already invalidated");

    await logAction(req.user.user_id, "USER_LOGGED_OUT", "tokens", 0, "User logged out and token invalidated");

    return sendResponse(res, {
      success: true,
      message: "Logged out successfully. Refresh token invalidated.",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE ACCOUNT
const deleteMyAccount = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.user.user_id, { transaction });
    if (!user) throw new ApiError(404, "User not found");

    await Profile.destroy({ where: { user_id: user.user_id }, transaction });
    await TokenStore.destroy({ where: { user_id: user.user_id }, transaction });
    await user.destroy({ transaction });

    await transaction.commit();

    await logAction(req.user.user_id, "USER_DELETED_ACCOUNT", "users", user.user_id, "User deleted account and profiles");

    return sendResponse(res, {
      success: true,
      message: "Account and associated profiles deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// ADMIN: Force logout a user
const forceLogout = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const deleted = await TokenStore.destroy({ where: { user_id: userId } });
    if (!deleted) throw new ApiError(404, "No active tokens found for this user");

    await logAction(req.user.user_id, "ADMIN_FORCED_LOGOUT", "tokens", 0, `Admin forced logout for user ${userId}`);

    return sendResponse(res, {
      success: true,
      message: `User ${userId} logged out by admin`,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: List active refresh tokens
const listActiveTokens = async (req, res, next) => {
  try {
    const tokens = await TokenStore.findAll({ where: { token_type: "refresh" } });
    return sendResponse(res, {
      success: true,
      message: "Active refresh tokens fetched",
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Delete any user account
const adminDeleteUser = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, { transaction });
    if (!user) throw new ApiError(404, "User not found");

    await Profile.destroy({ where: { user_id: user.user_id }, transaction });
    await TokenStore.destroy({ where: { user_id: user.user_id }, transaction });
    await user.destroy({ transaction });

    await transaction.commit();

    await logAction(req.user.user_id, "ADMIN_DELETED_USER", "users", user.user_id, `Admin deleted user ${userId}`);

    return sendResponse(res, {
      success: true,
      message: `User ${userId} and associated profiles deleted successfully`,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = { 
  register, 
  login, 
  refreshToken, 
  logout, 
  deleteMyAccount,
  forceLogout,
  listActiveTokens,
  adminDeleteUser  
};
