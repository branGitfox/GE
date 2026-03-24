const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ge',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('--- Migration Fournisseurs ---');

        // 1. Create fournisseurs table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS fournisseurs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                telephone VARCHAR(50),
                email VARCHAR(255),
                adresse TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Table fournisseurs créée ou déjà existante');

        // 2. Add fournisseur_id to produits
        const [produitsColumns] = await connection.execute('SHOW COLUMNS FROM produits LIKE "fournisseur_id"');
        if (produitsColumns.length === 0) {
            await connection.execute('ALTER TABLE produits ADD COLUMN fournisseur_id INT NULL');
            await connection.execute('ALTER TABLE produits ADD CONSTRAINT fk_produit_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL');
            console.log('✅ Colonne fournisseur_id ajoutée à produits');
        } else {
            console.log('ℹ️ Colonne fournisseur_id déjà présente dans produits');
        }

        // 3. Add fournisseur_id to produit_achat
        const [achatColumns] = await connection.execute('SHOW COLUMNS FROM produit_achat LIKE "fournisseur_id"');
        if (achatColumns.length === 0) {
            await connection.execute('ALTER TABLE produit_achat ADD COLUMN fournisseur_id INT NULL');
            await connection.execute('ALTER TABLE produit_achat ADD CONSTRAINT fk_achat_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL');
            console.log('✅ Colonne fournisseur_id ajoutée à produit_achat');
        } else {
            console.log('ℹ️ Colonne fournisseur_id déjà présente dans produit_achat');
        }

        // 4. Add fournisseur_id to depenses
        const [depensesColumns] = await connection.execute('SHOW COLUMNS FROM depenses LIKE "fournisseur_id"');
        if (depensesColumns.length === 0) {
            await connection.execute('ALTER TABLE depenses ADD COLUMN fournisseur_id INT NULL');
            await connection.execute('ALTER TABLE depenses ADD CONSTRAINT fk_depense_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL');
            console.log('✅ Colonne fournisseur_id ajoutée à depenses');
        } else {
            console.log('ℹ️ Colonne fournisseur_id déjà présente dans depenses');
        }

        console.log('--- Migration terminée avec succès ---');
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
    } finally {
        await connection.end();
    }
}

migrate();
