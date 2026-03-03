const { AuditLog } = require("../models");

const logAdminAction = async (admin_id, action, target_type, target_id) => {
  await AuditLog.create({
    admin_id,
    action,
    target_type,
    target_id,
  });
};

module.exports = { logAdminAction };
