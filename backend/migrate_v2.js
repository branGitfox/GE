/**
 * Migration V2 – Tables: entrepots, produit_fournisseurs, produit_entrepot
 * Run from: /home/asus/Documents/V1.1/backend
 */
const mysql = require('mysql2');
require('dotenv').config({ path: './.env' });

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ge',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
});

db.connect(err => {
    if (err) { console.error('❌ Connexion failed:', err.message); process.exit(1); }
    console.log('✅ Connecté à MySQL');
    runMigration();
});

async function runMigration() {
    const queryAsync = (sql, params = []) => new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => err ? reject(err) : resolve(results));
    });

    try {
        // 1. Table entrepots
        await queryAsync(`
            CREATE TABLE IF NOT EXISTS entrepots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(150) NOT NULL,
                type ENUM('entrepôt', 'magasin') NOT NULL DEFAULT 'entrepôt',
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✅ Table entrepots créée/existante');

        // 2. Table produit_fournisseurs (N:N)
        await queryAsync(`
            CREATE TABLE IF NOT EXISTS produit_fournisseurs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                produit_id INT NOT NULL,
                fournisseur_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uq_produit_fournisseur (produit_id, fournisseur_id),
                FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
                FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✅ Table produit_fournisseurs créée/existante');

        // 3. Table produit_entrepot (N:N - affectation logistique)
        await queryAsync(`
            CREATE TABLE IF NOT EXISTS produit_entrepot (
                id INT AUTO_INCREMENT PRIMARY KEY,
                produit_id INT NOT NULL,
                entrepot_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uq_produit_entrepot (produit_id, entrepot_id),
                FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
                FOREIGN KEY (entrepot_id) REFERENCES entrepots(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✅ Table produit_entrepot créée/existante');

        // 4. Migrer les fournisseur_id existants dans produit_fournisseurs
        const existing = await queryAsync(`
            SELECT p.id AS produit_id, p.fournisseur_id 
            FROM produits p 
            WHERE p.fournisseur_id IS NOT NULL
        `);
        
        let migrated = 0;
        for (const row of existing) {
            try {
                await queryAsync(
                    `INSERT IGNORE INTO produit_fournisseurs (produit_id, fournisseur_id) VALUES (?, ?)`,
                    [row.produit_id, row.fournisseur_id]
                );
                migrated++;
            } catch (e) {
                console.warn(`  ⚠️ Skip produit_id=${row.produit_id}:`, e.message);
            }
        }
        console.log(`✅ ${migrated} relations fournisseur migrées dans produit_fournisseurs`);

        console.log('\n🎉 Migration V2 terminée avec succès !');
    } catch (err) {
        console.error('❌ Erreur migration:', err.message);
    } finally {
        db.end();
    }
}
