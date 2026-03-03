const { VaccineStatus, Vaccine } = require("../models");
const sendResponse = require("../utilities/response.util");
const {ApiError} = require("../utilities/ApiErr.util");

//GET DASHBOARD.
const getDashboard = async (req, res, next) => {
  try {
    const { id } = req.params; // profile_id

    const statuses = await VaccineStatus.findAll({
      where: { profile_id: id },
      include: [{ model: Vaccine }],
    });

    if (!statuses || statuses.length === 0) {
      throw new ApiError(404, "No vaccine statuses found for this profile");
    }

    const dashboard = {
      taken: [],
      due: [],
      overdue: [],
    };

    statuses.forEach((item) => {
      switch (item.status) {
        case "Taken":
          dashboard.taken.push(item);
          break;
        case "Due":
          dashboard.due.push(item);
          break;
        case "Overdue":
          dashboard.overdue.push(item);
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

module.exports = { getDashboard };
