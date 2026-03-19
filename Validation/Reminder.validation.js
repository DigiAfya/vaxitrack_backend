const Joi = require("joi");

const reminderSchema = Joi.object({
  vaccine_id: Joi.number().integer().required(),   
  due_date: Joi.date().required(),                 
  status: Joi.string().valid("due", "overdue").optional(), 
});

module.exports = { reminderSchema };
