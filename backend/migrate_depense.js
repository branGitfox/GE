const db = require('./db');

const createDepenseTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS depenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(255) NOT NULL,
            montant DECIMAL(10, 2) NOT NULL,
            description TEXT,
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de la table depenses:', err);
        } else {
            console.log('✅ Table depenses vérifiée/créée avec succès');
        }
        process.exit();
    });
};

createDepenseTable();
