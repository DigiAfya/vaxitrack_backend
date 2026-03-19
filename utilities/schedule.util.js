const { Vaccine, VaccineStatus } = require("../models");

const mapVaccinesToProfile = async (profile, transaction) => {
  // Ensure Vaccine model is defined
  if (!Vaccine) {
    throw new Error("Vaccine model is not defined. Check your model name in vaccine.js");
  }
  if (!VaccineStatus) {
    throw new Error("VaccineStatus model is not defined. Check your model name in vaccineStatus.js");
  }

  // Fetch vaccines by category
  const vaccines = await Vaccine.findAll({
    where: { category: profile.category },
    transaction
  });

  // Assign vaccine statuses
  for (const vaccine of vaccines) {
    await VaccineStatus.create(
      {
        profile_id: profile.profile_id,
        vaccine_id: vaccine.vaccine_id,
        status: "due"
      },
      { transaction }
    );
  }
};

module.exports = mapVaccinesToProfile;
