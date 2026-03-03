const Joi = require("joi");

const profileSchema = Joi.object({
  full_name: Joi.string().min(3).max(100).required(),
  dob: Joi.date().required(),
  gender: Joi.string().valid("Male", "Female", "Other").required(),
  category: Joi.string().required(),
});

module.exports = { profileSchema };
