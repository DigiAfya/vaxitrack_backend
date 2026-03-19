const Joi = require("joi");

const vaccineSchema = Joi.object({
  name: Joi.string().required(),
  age_range: Joi.string().optional(),
  category: Joi.string().valid("child", "adolescent", "adult").required(),
  description: Joi.string().optional(),
  Info: Joi.string().optional()
});

module.exports = { vaccineSchema };
