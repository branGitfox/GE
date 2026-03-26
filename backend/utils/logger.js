const db = require('../db');

/**
 * Log a system action
 * @param {number} userId - ID of the user performing the action
 * @param {string} actionType - 'add', 'edit', 'delete', 'price_change', etc.
 * @param {string} entityType - 'produit', 'client', 'facture', etc.
 * @param {number} entityId - ID of the entity
 * @param {object} oldValue - Optional JSON object of old values
 * @param {object} newValue - Optional JSON object of new values
 * @param {string} description - Human readable description
 */
const logAction = async (userId, actionType, entityType, entityId, oldValue = null, newValue = null, description = "") => {
    const query = `
        INSERT INTO system_logs (user_id, action_type, entity_type, entity_id, old_value, new_value, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [
            userId || null,
            actionType,
            entityType,
            entityId || null,
            oldValue ? JSON.stringify(oldValue) : null,
            newValue ? JSON.stringify(newValue) : null,
            description
        ], (err, result) => {
            if (err) {
                console.error("❌ Error logging action:", err);
                // We don't want to crash the main process if logging fails
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};

module.exports = { logAction };
