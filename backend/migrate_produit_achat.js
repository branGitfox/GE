const db = require('./db');

const createProduitAchatTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS produit_achat (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(255) NOT NULL,
            description TEXT,
            quantite DECIMAL(10, 2) DEFAULT 0,
            prix_achat DECIMAL(10, 2) NOT NULL DEFAULT 0,
            prix_vente DECIMAL(10, 2) NOT NULL DEFAULT 0,
            unite VARCHAR(100),
            category_id INT,
            produit_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de la table produit_achat:', err);
        } else {
            console.log('✅ Table produit_achat vérifiée/créée avec succès');
        }
        process.exit();
    });
};

createProduitAchatTable();
