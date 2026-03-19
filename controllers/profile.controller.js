const { Profile, User, sequelize } = require("../models");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const { calculateAge } = require("../utilities/age.util");

const mapVaccinesToProfile = require("../utilities/schedule.util");
const sendResponse = require("../utilities/response.util");
const ApiError = require("../utilities/ApiErr.util");
const { logAction } = require("../utilities/AuditLog.util");
const { Op } = require("sequelize");

const createProfile = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      gender,
      category,
    } = req.body;

    const user_id = req.user.user_id;

    // Calculate age
    const age = calculateAge(date_of_birth);

    // Create profile
    const profile = await Profile.create(
      {
        user_id,
        first_name,
        middle_name,
        last_name,
        date_of_birth,
        gender,
        category,
      },
      { transaction }
    );

    // Automatically assign vaccine schedule
    await mapVaccinesToProfile(profile, transaction);

    // Audit log
    await logAction(
      user_id,
      "USER_CREATED_PROFILE",
      "profiles",
      profile.profile_id,
      `Created profile for ${first_name} ${last_name}`
    );

    await transaction.commit();

    return sendResponse(res, {
      success: true,
      message: "Profile created successfully",
      data: {
        age,
        profile,
      },
      statusCode: 201,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
// ADMIN: CREATE PROFILE FOR ANY USER
const adminCreateProfile = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user_id, first_name, middle_name, last_name, date_of_birth, gender, category } = req.body;

    const userExists = await User.findByPk(user_id);
    if (!userExists) throw new ApiError(404, "User not found");

    const age = calculateAge(date_of_birth);

    const profile = await Profile.create(
      { user_id, first_name, middle_name, last_name, date_of_birth, gender, category },
      { transaction }
    );

    await mapVaccinesToProfile(profile);

    await logAction(
      req.user.user_id,
      "ADMIN_CREATED_PROFILE",
      "profiles",
      profile.profile_id,
      `Admin created profile for ${first_name} ${last_name}`
    );

    await transaction.commit();

    return sendResponse(res, {
      success: true,
      message: "Profile created by admin",
      data: { age, profile },
      statusCode: 201,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// USER: GET OWN PROFILES
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
// GET CURRENT USER PROFILES (for profile switcher)
const getMyProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.findAll({
      where: { user_id: req.user.user_id },
      attributes: [
        "profile_id",
        "first_name",
        "last_name",
        "category",
        "date_of_birth",
        "gender"
      ],
      order: [["created_at", "ASC"]],
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

// ADMIN: GET ALL PROFILES (Pagination + Search)
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
          where: search ? { email: { [Op.like]: `%${search}%` } } : undefined,
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

// ADMIN: UPDATE PROFILE
const updateProfile = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { first_name, middle_name, last_name, date_of_birth, gender, category } = req.body;

    const profile = await Profile.findByPk(id);
    if (!profile) throw new ApiError(404, "Profile not found");

    await profile.update({ first_name, middle_name, last_name, date_of_birth, gender, category }, { transaction });

    await logAction(
      req.user.user_id,
      "ADMIN_UPDATED_PROFILE",
      "profiles",
      profile.profile_id,
      `Updated profile ${profile.profile_id}`
    );

    await transaction.commit();

    return sendResponse(res, {
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// ADMIN: DELETE PROFILE
const deleteProfile = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const profile = await Profile.findByPk(id);
    if (!profile) throw new ApiError(404, "Profile not found");

    await profile.destroy({ transaction });

    await logAction(
      req.user.user_id,
      "ADMIN_DELETED_PROFILE",
      "profiles",
      profile.profile_id,
      `Deleted profile ${profile.profile_id}`
    );

    await transaction.commit();

    return sendResponse(res, {
      success: true,
      message: "Profile deleted successfully (soft delete)",
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// USER: UPDATE OWN PROFILE
const updateMyProfile = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { first_name, middle_name, last_name, date_of_birth, gender, category } = req.body;

    const profile = await Profile.findByPk(id);
    if (!profile || profile.user_id !== req.user.user_id) {
      throw new ApiError(403, "Access denied");
    }

    await profile.update({ first_name, middle_name, last_name, date_of_birth, gender, category }, { transaction });

    await logAction(
      req.user.user_id,
      "USER_UPDATED_PROFILE",
      "profiles",
      profile.profile_id,
      `User updated profile ${profile.profile_id}`
    );

    await transaction.commit();

    return sendResponse(res, {
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// USER: DELETE OWN PROFILE
const deleteMyProfile = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const profile = await Profile.findByPk(id);
    if (!profile || profile.user_id !== req.user.user_id) {
      throw new ApiError(403, "Access denied");
    }

    await profile.destroy({ transaction });

    await logAction(
      req.user.user_id,
      "USER_DELETED_PROFILE",
      "profiles",
      profile.profile_id,
      `User deleted profile ${profile.profile_id}`
    );

    await transaction.commit();

    return sendResponse(res, {
      success: true,
      message: "Profile deleted successfully (soft delete)",
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const exportProfiles = async (req, res, next) => {
  try {
    const {
      format = "csv",
      search = "",
      sort = "created_at",
      order = "DESC",
    } = req.query;

    const profiles = await Profile.findAll({
      include: [{ model: User, attributes: ["user_id", "email", "role"] }],
      where: search ? { first_name: { [Op.like]: `%${search}%` } } : undefined,
      order: [[sort, order]],
    });

    if (!profiles || profiles.length === 0) {
      throw new ApiError(404, "No profiles found");
    }

    const data = profiles.map((p) => ({
      profile_id: p.profile_id,
      first_name: p.first_name,
      last_name: p.last_name,
      date_of_birth: p.date_of_birth,
      gender: p.gender,
      category: p.category,
      user_email: p.User.email,
      role: p.User.role,
      created_at: p.created_at,
    }));

    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();

      // Main sheet
      const sheet = workbook.addWorksheet("Profiles");
      sheet.columns = [
        { header: "Profile ID", key: "profile_id", width: 15 },
        { header: "First Name", key: "first_name", width: 20 },
        { header: "Last Name", key: "last_name", width: 20 },
        { header: "Date of Birth", key: "date_of_birth", width: 15 },
        { header: "Gender", key: "gender", width: 10 },
        { header: "Category", key: "category", width: 15 },
        { header: "User Email", key: "user_email", width: 30 },
        { header: "Role", key: "role", width: 10 },
        { header: "Created At", key: "created_at", width: 20 },
      ];

      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1F4E78" },
        };
        cell.alignment = { horizontal: "center" };
      });

      data.forEach((d) => sheet.addRow(d));
      // Monthly summary sheet
      const monthlySheet = workbook.addWorksheet("Monthly Growth");
      monthlySheet.addRow(["Month", "Profiles Created"]);

      // Group profiles by month
      const monthlyCounts = {};
      data.forEach((d) => {
        const monthKey = new Date(d.created_at).toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
      });

      // Add rows
      Object.entries(monthlyCounts).forEach(([month, count]) => {
        monthlySheet.addRow([month, count]);
      });

      // Style header
      monthlySheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        };
      });

      // Add a note for admins to auto‑generate chart
      monthlySheet.addRow([]);
      monthlySheet.addRow([
        "Tip:",
        "Select the table above → Insert → Line Chart",
      ]);
      monthlySheet.getRow(monthlySheet.lastRow.number).eachCell((cell) => {
        cell.font = { italic: true, color: { argb: "FF1F4E78" } };
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=profiles.xlsx",
      );

      await workbook.xlsx.write(res);
      res.end();
    } else {
      const parser = new Parser({ fields: Object.keys(data[0]) });
      const csv = parser.parse(data);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=profiles.csv");
      res.send(csv);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProfile,
  adminCreateProfile,
  getUserProfiles,
  getMyProfiles,
  getAllProfiles,
  updateProfile,
  deleteProfile,
  updateMyProfile,
  deleteMyProfile,
  exportProfiles
};
