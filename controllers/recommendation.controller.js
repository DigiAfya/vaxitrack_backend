const { Profile, User } = require("../models");
const sendResponse = require("../utilities/response.util");
const ApiError = require("../utilities/ApiErr.util");
const { getRecommendations } = require("../utilities/recommendation.util");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");

// USER: Get recommendations for own profile
const getRecommendationsForProfile = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { priority, status, dueWithin } = req.query;

    const profile = await Profile.findByPk(profileId);
    if (!profile || profile.user_id !== req.user.user_id) throw new ApiError(403, "Access denied");

    const recommendations = await getRecommendations(profile, { priority, status, dueWithin });

    return sendResponse(res, {
      success: true,
      message: "Vaccine recommendations fetched successfully",
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Get recommendations for any profile
const adminGetRecommendations = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { priority, status, dueWithin } = req.query;

    const profile = await Profile.findByPk(profileId, { include: [{ model: User, attributes: ["email"] }] });
    if (!profile) throw new ApiError(404, "Profile not found");

    const recommendations = await getRecommendations(profile, { priority, status, dueWithin });

    const fullName = [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ");

    return sendResponse(res, {
      success: true,
      message: `Recommendations fetched for profile ${fullName}`,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// Export recommendations (CSV/Excel with summary + monthly trends)
const exportRecommendations = async (req, res, next) => {
  try {
    const { format = "csv", priority, status, dueWithin } = req.query;

    const profiles = await Profile.findAll({ include: [{ model: User, attributes: ["email"] }] });
    let allRecs = [];

    for (let profile of profiles) {
      const recs = await getRecommendations(profile, { priority, status, dueWithin });
      recs.forEach((r) => {
        allRecs.push({
          profile_id: profile.profile_id,
          user_email: profile.User?.email || "N/A",
          vaccine: r.vaccine,
          due_date: r.due_date,
          status: r.status,
          priority: r.priority,
          created_at: profile.created_at, // track profile creation for monthly trends
        });
      });
    }

    if (allRecs.length === 0) throw new ApiError(404, "No recommendations found");

    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();

      // Main sheet
      const sheet = workbook.addWorksheet("Recommendations");
      sheet.columns = [
        { header: "Profile ID", key: "profile_id", width: 15 },
        { header: "User Email", key: "user_email", width: 30 },
        { header: "Vaccine", key: "vaccine", width: 25 },
        { header: "Due Date", key: "due_date", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Priority", key: "priority", width: 15 },
        { header: "Created At", key: "created_at", width: 20 },
      ];

      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
        cell.alignment = { horizontal: "center" };
      });

      allRecs.forEach((r) => sheet.addRow(r));

      // Summary sheet by priority
      const summarySheet = workbook.addWorksheet("Summary");
      summarySheet.addRow(["Priority", "Count", "Percentage"]);

      const total = allRecs.length;
      const priorityCounts = {};

      allRecs.forEach((r) => {
        priorityCounts[r.priority] = (priorityCounts[r.priority] || 0) + 1;
      });

      Object.entries(priorityCounts).forEach(([p, count]) => {
        summarySheet.addRow([p, count, `${((count / total) * 100).toFixed(1)}%`]);
      });

      summarySheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB0C4DE" } };
      });

      // Monthly trends sheet
      const trendsSheet = workbook.addWorksheet("Monthly Trends");
      trendsSheet.addRow(["Month", "Priority", "Count"]);

      const monthlyCounts = {};

      allRecs.forEach((r) => {
        const monthKey = new Date(r.created_at).toLocaleString("default", { month: "long", year: "numeric" });
        const key = `${monthKey}-${r.priority}`;
        monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
      });

      Object.entries(monthlyCounts).forEach(([key, count]) => {
        const [month, priority] = key.split("-");
        trendsSheet.addRow([month, priority, count]);
      });

      trendsSheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFADD8E6" } };
      });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=recommendations.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    } else {
      const parser = new Parser({ fields: Object.keys(allRecs[0]) });
      const csv = parser.parse(allRecs);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=recommendations.csv");
      res.send(csv);
    }
  } catch (error) {
    next(error);
  }
};


module.exports = { getRecommendationsForProfile, adminGetRecommendations, exportRecommendations };
