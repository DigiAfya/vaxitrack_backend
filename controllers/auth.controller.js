const bcrypt = require("bcryptjs");
const { User, Profile, TokenStore, sequelize } = require("../models");
const { generateToken } = require("../utilities/jwt.util");
const jwt = require("jsonwebtoken");
const sendResponse = require("../utilities/response.util");
const ApiError = require("../utilities/ApiErr.util");
const { validatePassword } = require("../Validation/password.validation"); 

// REGISTER
const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Validate password strength
    validatePassword(password);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw new ApiError(400, "User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password_hash: hashedPassword,
      role: role || "user",
    });

    // Generate secure JWTs
    const accessToken = await generateToken({
      user_id: user.user_id,
      role: user.role,
    });

    const refreshToken = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );

    // Store refresh token in DB
    await TokenStore.create({
  user_id: user.user_id,
  token: refreshToken,
  type: "refresh",
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
});


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

    // Generate secure JWTs
    const accessToken = await generateToken({
      user_id: user.user_id,
      role: user.role,
    });

    const refreshToken = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );

    // Store refresh token in DB
    await TokenStore.create({
    user_id: user.user_id,
    token: refreshToken,
    type: "refresh",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
});


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
    const { token } = req.body; // refresh token from client
    if (!token) throw new ApiError(400, "Refresh token required");

    // Check if token exists in DB
    const storedToken = await TokenStore.findOne({ where: { token, type: "refresh" } });
    if (!storedToken) throw new ApiError(401, "Invalid or expired refresh token");

    // ✅ Check expiry in DB
    if (storedToken.expiresAt < new Date()) {
      // Token expired → delete it
      await storedToken.destroy();
      throw new ApiError(401, "Refresh token expired");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    // Issue new access token
    const newAccessToken = await generateToken({
      user_id: decoded.user_id,
      role: decoded.role,
    });

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
    const { token } = req.body; // refresh token from client
    if (!token) throw new ApiError(400, "Refresh token required");

    // Delete refresh token from DB
    const deleted = await TokenStore.destroy({ where: { token } });
    if (!deleted) throw new ApiError(404, "Token not found or already invalidated");

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

    return sendResponse(res, {
      success: true,
      message: "Account and associated profiles deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout, deleteMyAccount };
