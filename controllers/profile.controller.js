const { Profile, User } = require("../models");
const { calculateAge } = require("../utilities/age.util");
const { mapVaccinesToProfile } = require("../utilities/schedule.util");
const sendResponse = require("../utilities/response.util");
const ApiError = require("../utilities/ApiErr.util");
const { logAdminAction } = require("../utilities/AuditLog.util");
const { Op } = require("sequelize");

//USER: CREATE OWN PROFILE.
const createProfile = async (req, res, next) => {
  try {
    const { full_name, dob, gender, category } = req.body;
    const user_id = req.user.user_id;

    const age = await calculateAge(dob);

    const profile = await Profile.create({
      user_id,
      full_name,
      dob,
      gender,
      category,
    });

    await mapVaccinesToProfile(profile);

    return sendResponse(res, {
      success: true,
      message: "Profile created successfully",
      data: { age, profile },
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: CREATE PROFILE FOR ANY USER.
const adminCreateProfile = async (req, res, next) => {
  try {
    const { user_id, full_name, dob, gender, category } = req.body;

    const userExists = await User.findByPk(user_id);
    if (!userExists) throw new ApiError(404, "User not found");

    const age = await calculateAge(dob);

    const profile = await Profile.create({
      user_id,
      full_name,
      dob,
      gender,
      category,
    });

    await mapVaccinesToProfile(profile);

    await logAdminAction(
      req.user.user_id,
      "CREATED_PROFILE",
      "Profile",
      profile.profile_id 
    );

    return sendResponse(res, {
      success: true,
      message: "Profile created by admin",
      data: { age, profile },
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

//USER: GET OWN PROFILES.
const getUserProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.findAll({
      where: { user_id: req.user.user_id },
    });

    return sendResponse(res, {
      success: true,
      message: "User profiles fetched successfully",
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
};

//ADMIN: GET ALL PROFILES (Pagination + Search)
const getAllProfiles = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const { count, rows } = await Profile.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: User,
          attributes: ["user_id", "email", "role"],
          where: search
            ? { email: { [Op.like]: `%${search}%` } }
            : undefined,
        },
      ],
      order: [["created_at", "DESC"]], 
    });

    return sendResponse(res, {
      success: true,
      message: "Profiles fetched successfully",
      data: {
        totalProfiles: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        profiles: rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

//ADMIN: UPDATE PROFILE.
const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findByPk(id);
    if (!profile) throw new ApiError(404, "Profile not found");

    await profile.update(req.body);

    await logAdminAction(
      req.user.user_id,
      "UPDATED_PROFILE",
      "Profile",
      profile.profile_id 
    );

    return sendResponse(res, {
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

//ADMIN: SOFT DELETE PROFILE.
const deleteProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findByPk(id);
    if (!profile) throw new ApiError(404, "Profile not found");

    await profile.destroy(); // Soft delete due to paranoid: true

    await logAdminAction(
      req.user.user_id,
      "DELETED_PROFILE",
      "Profile",
      profile.profile_id
    );

    return sendResponse(res, {
      success: true,
      message: "Profile deleted successfully (soft delete)",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {createProfile, adminCreateProfile, getUserProfiles, getAllProfiles, updateProfile,deleteProfile,};
