const db = require('./db');

const addPaiementColumn = () => {
    const query = `
        ALTER TABLE factures ADD COLUMN paiement TINYINT(1) DEFAULT 0
    `;

    db.query(query, (err, result) => {
        if (err) {
            // Error 1060 means column already exists
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('✅ La colonne "paiement" existe déjà dans la table "factures"');
            } else {
                console.error("Erreur lors de l'ajout de la colonne paiement: ", err);
            }
        } else {
            console.log('✅ Colonne "paiement" ajoutée avec succès à la table "factures"');
        }
        process.exit();
    });
};

addPaiementColumn();
