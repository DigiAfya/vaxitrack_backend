const Joi = require("joi");

const profileSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).required(),
  middle_name: Joi.string().max(100).optional(),
  last_name: Joi.string().min(2).max(100).required(),
  date_of_birth: Joi.date().required(),
  gender: Joi.string().valid("male", "female", "prefer not to say").required(),
  category: Joi.string().valid("child", "adult").required(),
});

module.exports = { profileSchema };
