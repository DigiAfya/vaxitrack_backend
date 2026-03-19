const { Profile } = require("../models");
const ApiError = require("../utilities/ApiErr.util");

const activeProfile = async (req, res, next) => {
  try {
    const profileId = req.headers["x-profile-id"];

    if (!profileId) {
      return next(new ApiError(400, "Profile ID header (X-Profile-Id) is required"));
    }

    const profile = await Profile.findOne({
      where: {
        profile_id: profileId,
        user_id: req.user.user_id,
      },
    });

    if (!profile) {
      return next(new ApiError(404, "Profile not found or not authorized"));
    }

    // attach profile to request
    req.profile = profile;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = activeProfile;