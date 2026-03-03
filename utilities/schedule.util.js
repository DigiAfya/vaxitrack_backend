const { Vaccine, VaccineStatus } = require("../models");

const mapVaccinesToProfile = async (profile) => {

  const vaccines = await Vaccine.findAll({
    where: { category: profile.category }
  });

  for (let vaccine of vaccines) {
    await VaccineStatus.create({
      profile_id: profile.profile_id,
      vaccine_id: vaccine.vaccine_id,
      status: "Due"
    });
  }
};

module.exports = { mapVaccinesToProfile };
