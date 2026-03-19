const { AuditLog } = require("../models");

/**
 * Unified logger + audit recorder
 * @param {number} user_id - The ID of the user performing the action
 * @param {string} action - The action performed (e.g., CREATE, UPDATE, DELETE)
 * @param {string} entity - The entity/table affected (e.g., "vaccines", "profiles")
 * @param {number} entity_id - The primary key of the affected record
 * @param {string} [details] - Optional extra context (e.g., "Changed description from X to Y")
 */
const logAction = async (user_id, action, entity, entity_id, details = null) => {
  // Console log for immediate visibility
  console.log(`[Audit] User ${user_id} performed ${action} on ${entity} (record ${entity_id}) ${details || ""}`);

  // Persist to DB (matches your migration)
  await AuditLog.create({
    user_id,
    action,
    entity,
    entity_id,
    details,
    created_at: new Date(),
    updated_at: new Date()
  });
};

module.exports = { logAction };

