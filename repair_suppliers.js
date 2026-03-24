const db = require('./backend/db');

async function repair() {
    console.log('Starting supplier ID repair...');

    // Sync fournisseur_id from produits to linked produit_achat entries
    const query = `
        UPDATE produit_achat pa
        JOIN produits p ON pa.produit_id = p.id
        SET pa.fournisseur_id = p.fournisseur_id
        WHERE pa.fournisseur_id IS NULL AND p.fournisseur_id IS NOT NULL
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error during repair:', err);
        } else {
            console.log(`Repaired ${result.affectedRows} records in produit_achat.`);
        }
        process.exit();
    });
}

repair();
setTimeout(() => process.exit(), 5000);
