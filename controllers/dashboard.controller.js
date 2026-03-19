const { VaccineStatus, Vaccine, Profile, User, sequelize } = require("../models");
const sendResponse = require("../utilities/response.util");
const ApiError = require("../utilities/ApiErr.util");
const { Parser } = require("json2csv"); 
const ExcelJS = require("exceljs");

// GetDashboard (unchanged)
const getDashboard = async (req, res, next) => {
  try {
    const { id } = req.params; // profile_id

    const profile = await Profile.findByPk(id);
    if (!profile || profile.user_id !== req.user.user_id) {
      throw new ApiError(403, "Access denied");
    }

    const statuses = await VaccineStatus.findAll({
      where: { profile_id: id },
      include: [{ model: Vaccine }],
      order: [["due_date", "ASC"]],
    });

    if (!statuses || statuses.length === 0) {
      throw new ApiError(404, "No vaccine statuses found for this profile");
    }

    const dashboard = {
      taken: [],
      due: [],
      overdue: [],
      priorityCounts: { high: 0, medium: 0, low: 0 },
    };

    const today = new Date();

    statuses.forEach((item) => {
      switch (item.status) {
        case "Taken":
          dashboard.taken.push(item);
          break;
        case "Due":
          dashboard.due.push(item);
          if (item.due_date) {
            const dueDate = new Date(item.due_date);
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) {
              dashboard.priorityCounts.medium += 1;
            } else {
              dashboard.priorityCounts.low += 1;
            }
          } else {
            dashboard.priorityCounts.low += 1;
          }
          break;
        case "Overdue":
          dashboard.overdue.push(item);
          dashboard.priorityCounts.high += 1;
          break;
      }
    });

    return sendResponse(res, {
      success: true,
      message: "Dashboard fetched successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

// Admin list all dashboards with filters + pagination + total count + search + sort
const listAllDashboards = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10, search, sort = "name", order = "ASC" } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count of all profiles (ignoring pagination)
    const totalProfiles = await Profile.count();

    const profiles = await Profile.findAll({
      include: [User],
      offset,
      limit: parseInt(limit),
      where: search
        ? {
            [sequelize.Op.or]: [
              { name: { [sequelize.Op.iLike]: `%${search}%` } },
              { "$User.email$": { [sequelize.Op.iLike]: `%${search}%` } },
            ],
          }
        : undefined,
      order: [
        sort === "due_date"
          ? [sequelize.literal('"VaccineStatuses"."due_date"'), order]
          : sort === "email"
          ? [User, "email", order]
          : ["name", order], // default sort by profile name
      ],
    });

    if (!profiles || profiles.length === 0) {
      throw new ApiError(404, "No profiles found");
    }

    const dashboards = [];
    const today = new Date();

    for (const profile of profiles) {
      const statuses = await VaccineStatus.findAll({
        where: { profile_id: profile.profile_id },
        include: [{ model: Vaccine }],
        order: [["due_date", "ASC"]],
      });

      const dashboard = {
        profile,
        taken: [],
        due: [],
        overdue: [],
        priorityCounts: { high: 0, medium: 0, low: 0 },
      };

      statuses.forEach((item) => {
        switch (item.status) {
          case "Taken":
            dashboard.taken.push(item);
            break;
          case "Due":
            dashboard.due.push(item);
            if (item.due_date) {
              const dueDate = new Date(item.due_date);
              const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
              if (diffDays <= 7) {
                dashboard.priorityCounts.medium += 1;
              } else {
                dashboard.priorityCounts.low += 1;
              }
            } else {
              dashboard.priorityCounts.low += 1;
            }
            break;
          case "Overdue":
            dashboard.overdue.push(item);
            dashboard.priorityCounts.high += 1;
            break;
        }
      });

      dashboards.push(dashboard);
    }

    // Apply filters
    let filtered = dashboards;
    if (status) {
      filtered = filtered.filter((d) => d[status] && d[status].length > 0);
    }
    if (priority) {
      filtered = filtered.filter((d) => d.priorityCounts[priority] > 0);
    }

    return sendResponse(res, {
      success: true,
      message: "Dashboards fetched successfully",
      data: filtered,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        count: filtered.length,
        totalProfiles,
      },
    });
  } catch (error) {
    next(error);
  }
};

const exportDashboards = async (req, res, next) => {
  try {
    const { format = "csv" } = req.query;

    const profiles = await Profile.findAll({ include: [User] });
    if (!profiles || profiles.length === 0) {
      throw new ApiError(404, "No profiles found");
    }

    const dashboards = [];

    for (const profile of profiles) {
      const statuses = await VaccineStatus.findAll({
        where: { profile_id: profile.profile_id },
        include: [{ model: Vaccine }],
        order: [["due_date", "ASC"]],
      });

      dashboards.push({
        profile_id: profile.profile_id,
        profile_name: profile.name,
        user_email: profile.User.email,
        taken: statuses.filter((s) => s.status === "Taken").length,
        due: statuses.filter((s) => s.status === "Due").length,
        overdue: statuses.filter((s) => s.status === "Overdue").length,
      });
    }

    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();

      // Main sheet
      const sheet = workbook.addWorksheet("Dashboards");
      sheet.columns = [
        { header: "Profile ID", key: "profile_id", width: 15 },
        { header: "Profile Name", key: "profile_name", width: 25 },
        { header: "User Email", key: "user_email", width: 30 },
        { header: "Taken", key: "taken", width: 10 },
        { header: "Due", key: "due", width: 10 },
        { header: "Overdue", key: "overdue", width: 10 },
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

      dashboards.forEach((d) => {
        const row = sheet.addRow(d);
        if (d.overdue > 0)
          row.getCell("overdue").font = {
            color: { argb: "FFFF0000" },
            bold: true,
          };
        if (d.due > 0)
          row.getCell("due").font = { color: { argb: "FFFFA500" }, bold: true };
      });
      // Summary sheet
      const summarySheet = workbook.addWorksheet("Summary");

      const totalProfiles = dashboards.length;
      const totalTaken = dashboards.reduce((sum, d) => sum + d.taken, 0);
      const totalDue = dashboards.reduce((sum, d) => sum + d.due, 0);
      const totalOverdue = dashboards.reduce((sum, d) => sum + d.overdue, 0);
      const totalVaccines = totalTaken + totalDue + totalOverdue;

      summarySheet.addRow(["Metric", "Count", "Percentage"]);
      summarySheet.addRow(["Total Profiles", totalProfiles, ""]);
      summarySheet.addRow([
        "Total Taken",
        totalTaken,
        totalVaccines > 0
          ? `${((totalTaken / totalVaccines) * 100).toFixed(1)}%`
          : "0%",
      ]);
      summarySheet.addRow([
        "Total Due",
        totalDue,
        totalVaccines > 0
          ? `${((totalDue / totalVaccines) * 100).toFixed(1)}%`
          : "0%",
      ]);
      summarySheet.addRow([
        "Total Overdue",
        totalOverdue,
        totalVaccines > 0
          ? `${((totalOverdue / totalVaccines) * 100).toFixed(1)}%`
          : "0%",
      ]);

      // Style header row
      summarySheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFB0C4DE" }, // light steel blue
        };
      });

      // Apply colors to metric rows
      summarySheet.getRow(3).getCell(1).font = {
        color: { argb: "FF008000" },
        bold: true,
      }; // Taken → Green
      summarySheet.getRow(4).getCell(1).font = {
        color: { argb: "FFFFA500" },
        bold: true,
      }; // Due → Orange
      summarySheet.getRow(5).getCell(1).font = {
        color: { argb: "FFFF0000" },
        bold: true,
      }; // Overdue → Red

      // ⚡ Add chart (ExcelJS doesn’t natively support charts yet, but workaround is to add data for charting)
      // Admins can easily insert chart in Excel using the summary data.
      // Example: Pie chart of Taken/Due/Overdue counts.

      // Note: ExcelJS currently does not support chart rendering directly.
      // Best practice: provide summary data in a clear table so Excel users can insert chart quickly.

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=dashboards.xlsx",
      );

      await workbook.xlsx.write(res);
      res.end();
    } else {
      // CSV fallback
      const parser = new Parser({ fields: ["profile_id", "profile_name", "user_email", "taken", "due", "overdue"] });
      const csv = parser.parse(dashboards);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=dashboards.csv");
      res.send(csv);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, listAllDashboards, exportDashboards };
