const { Vaccine } = require("../models");
const sendResponse = require("../utilities/response.util");
const ApiError = require("../utilities/ApiErr.util");

const createVaccine = async (req, res, next) => {
  try {
    const { name, age_range, category, dose_sequence, description } = req.body;

    if (!name || !age_range || !category || !dose_sequence) {
      throw new ApiError(400, "Missing required vaccine fields");
    }

    const vaccine = await Vaccine.create({
      name,
      age_range,
      category,
      dose_sequence,
      description,
    });

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

const getVaccines = async (req, res, next) => {
  try {
    const vaccines = await Vaccine.findAll();
    if (!vaccines || vaccines.length === 0) throw new ApiError(404, "No vaccines found");

    return sendResponse(res, {
      success: true,
      message: "Vaccines retrieved successfully",
      data: vaccines,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createVaccine, getVaccines };
