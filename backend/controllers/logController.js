const db = require('../db');

exports.getAllLogs = (req, res) => {
    const query = `
        SELECT l.*, u.nom as user_nom, u.prenom as user_prenom
        FROM system_logs l
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
        LIMIT 200
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching logs:", err);
            return res.status(500).json({ message: "Erreur lors de la récupération des logs" });
        }
        res.status(200).json(results);
    });
};
