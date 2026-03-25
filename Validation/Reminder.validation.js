const Joi = require("joi");

const reminderSchema = Joi.object({
  vaccine_id: Joi.number().integer().required(),

  start_time: Joi.date().required(),
  end_time: Joi.date().optional(),

  status: Joi.string().valid("Due", "Overdue").optional(),

  recurrence_rule: Joi.string().optional(),

  // Allow string OR null
  external_event_id: Joi.string().allow(null).optional()
});

module.exports = { reminderSchema };
