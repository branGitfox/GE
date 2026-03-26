const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ge',
    port: process.env.DB_PORT || 3306
}).promise();

async function migrate() {
    try {
        console.log("🚀 Démarrage de la migration system_logs...");
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS system_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action_type VARCHAR(50) NOT NULL,
                entity_type VARCHAR(50) NOT NULL,
                entity_id INT,
                old_value JSON,
                new_value JSON,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        
        console.log("✅ Table system_logs créée avec succès.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur lors de la migration:", error);
        process.exit(1);
    }
}

migrate();
