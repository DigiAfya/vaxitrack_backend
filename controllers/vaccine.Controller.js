const { Vaccine, VaccineDose } = require("../models");
const sendResponse = require("../utilities/response.util");
const ApiError = require("../utilities/ApiErr.util");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const { weeksToDays,monthsToDays,yearsToDays,} = require("../utilities/date.util");
const { logAction } = require("../utilities/AuditLog.util");
const { Op } = require("sequelize");

// CREATE VACCINE (unchanged)
const createVaccine = async (req, res, next) => {
  try {
    const { name, age_range, category, description, Info, doses } = req.body;

    if (!name || !category) {
      throw new ApiError(
        400,
        "Missing required vaccine fields: name and category",
      );
    }

    const vaccine = await Vaccine.create({
      name,
      age_range,
      category,
      description,
      info,
    });

    if (Array.isArray(doses) && doses.length > 0) {
      for (const dose of doses) {
        let {
          dose_number,
          recommended_age,
          min_age_days,
          max_age_days,
          min_gap_days,
          description,
        } = dose;

        if (!dose_number)
          throw new ApiError(400, "Each dose must include a dose_number");

        // Convert age ranges
        if (dose.min_age_weeks) min_age_days = weeksToDays(dose.min_age_weeks);
        if (dose.min_age_months)
          min_age_days = monthsToDays(dose.min_age_months);
        if (dose.min_age_years) min_age_days = yearsToDays(dose.min_age_years);

        if (dose.max_age_weeks) max_age_days = weeksToDays(dose.max_age_weeks);
        if (dose.max_age_months)
          max_age_days = monthsToDays(dose.max_age_months);
        if (dose.max_age_years) max_age_days = yearsToDays(dose.max_age_years);

        if (dose.min_gap_weeks) min_gap_days = weeksToDays(dose.min_gap_weeks);
        if (dose.min_gap_months)
          min_gap_days = monthsToDays(dose.min_gap_months);
        if (dose.min_gap_years) min_gap_days = yearsToDays(dose.min_gap_years);

        await VaccineDose.create({
          vaccine_id: vaccine.vaccine_id,
          dose_number,
          recommended_age,
          min_age_days,
          max_age_days,
          min_gap_days,
          description,
        });
      }
    }

    await logAction(
      req.user.user_id,
      "ADMIN_CREATED_VACCINE",
      "vaccines",
      vaccine.vaccine_id,
      `Created vaccine ${name}`,
    );

    return sendResponse(res, {
      success: true,
      message: "Vaccine created successfully",
      data: vaccine,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL VACCINES (with pagination, search, sort)
const getVaccines = async (req, res, next) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      sort = "created_at",
      order = "DESC",
    } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const { count, rows } = await Vaccine.findAndCountAll({
      limit,
      offset,
      include: [{ model: VaccineDose, as: "doses" }],
      where: search ? { name: { [Op.like]: `%${search}%` } } : undefined,
      order: [[sort, order]],
    });

    if (!rows || rows.length === 0)
      throw new ApiError(404, "No vaccines found");

    await logAction(
      req.user.user_id,
      "FETCHED_ALL_VACCINES",
      "vaccines",
      0,
      "Fetched all vaccines",
    );

    return sendResponse(res, {
      success: true,
      message: "Vaccines retrieved successfully",
      data: {
        totalVaccines: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        vaccines: rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE VACCINE
const getVaccineById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vaccine = await Vaccine.findByPk(id, {
      include: [{ model: VaccineDose, as: "doses" }],
    });

    if (!vaccine) throw new ApiError(404, "Vaccine not found");

    await logAction(
      req.user.user_id,
      "FETCHED_VACCINE",
      "vaccines",
      vaccine.vaccine_id,
      `Fetched vaccine ${vaccine.name}`,
    );

    return sendResponse(res, {
      success: true,
      message: "Vaccine retrieved successfully",
      data: vaccine,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE VACCINE
const updateVaccine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vaccine = await Vaccine.findByPk(id);
    if (!vaccine) throw new ApiError(404, "Vaccine not found");

    await vaccine.update(req.body);

    await logAction(
      req.user.user_id,
      "ADMIN_UPDATED_VACCINE",
      "vaccines",
      vaccine.vaccine_id,
      `Updated vaccine ${vaccine.name}`,
    );

    return sendResponse(res, {
      success: true,
      message: "Vaccine updated successfully",
      data: vaccine,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE VACCINE
const deleteVaccine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vaccine = await Vaccine.findByPk(id);
    if (!vaccine) throw new ApiError(404, "Vaccine not found");

    await vaccine.destroy();

    await logAction(
      req.user.user_id,
      "ADMIN_DELETED_VACCINE",
      "vaccines",
      vaccine.vaccine_id,
      `Deleted vaccine ${vaccine.name}`,
    );

    return sendResponse(res, {
      success: true,
      message: "Vaccine deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// NEW: Export vaccines (CSV/Excel with summary sheet)
const exportVaccines = async (req, res, next) => {
  try {
    const {
      format = "csv",
      search = "",
      sort = "created_at",
      order = "DESC",
    } = req.query;

    const vaccines = await Vaccine.findAll({
      include: [{ model: VaccineDose, as: "doses" }],
      where: search ? { name: { [Op.like]: `%${search}%` } } : undefined,
      order: [[sort, order]],
    });

    if (!vaccines || vaccines.length === 0)
      throw new ApiError(404, "No vaccines found");

    const data = vaccines.map((v) => ({
      vaccine_id: v.vaccine_id,
      name: v.name,
      category: v.category,
      age_range: v.age_range,
      description: v.description,
      info: v.Info,
      doses: v.vaccine_doses
        .map((d) => `Dose ${d.dose_number}: ${d.description || ""}`)
        .join("; "),
      created_at: v.created_at,
    }));

    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();

      // Main sheet
      const sheet = workbook.addWorksheet("Vaccines");
      sheet.columns = [
        { header: "Vaccine ID", key: "vaccine_id", width: 15 },
        { header: "Name", key: "name", width: 25 },
        { header: "Category", key: "category", width: 20 },
        { header: "Age Range", key: "age_range", width: 20 },
        { header: "Description", key: "description", width: 30 },
        { header: "Info", key: "info", width: 30 },
        { header: "Doses", key: "doses", width: 50 },
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

      //  Summary sheet by category
      const summarySheet = workbook.addWorksheet("Summary");
      summarySheet.addRow(["Category", "Count", "Percentage"]);

      const totalVaccines = data.length;
      const categoryCounts = {};

      data.forEach((v) => {
        categoryCounts[v.category] = (categoryCounts[v.category] || 0) + 1;
      });

      Object.entries(categoryCounts).forEach(([category, count]) => {
        summarySheet.addRow([
          category,
          count,
          totalVaccines > 0
            ? `${((count / totalVaccines) * 100).toFixed(1)}%`
            : "0%",
        ]);
      });

      summarySheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFB0C4DE" },
        };
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=vaccines.xlsx",
      );

      await workbook.xlsx.write(res);
      res.end();
    } else {
      const parser = new Parser({ fields: Object.keys(data[0]) });
      const csv = parser.parse(data);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=vaccines.csv");
      res.send(csv);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVaccine,
  getVaccines,
  getVaccineById,
  updateVaccine,
  deleteVaccine,
  exportVaccines,
};
