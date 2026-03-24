const db = require('./db');

const fixPaiementColumn = () => {
    // Change column to DECIMAL to support numeric amounts
    const query = `
        ALTER TABLE factures MODIFY COLUMN paiement DECIMAL(15, 2) DEFAULT 0
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error("Erreur lors de la modification de la colonne paiement: ", err);
        } else {
            console.log('✅ Colonne "paiement" modifiée en DECIMAL avec succès dans la table "factures"');
        }
        process.exit();
    });
};

fixPaiementColumn();
