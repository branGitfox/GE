const db = require('./backend/db');

async function migrate() {
    console.log('Starting migration...');

    // Check and add fournisseur_id to depenses
    db.query("SHOW COLUMNS FROM depenses LIKE 'fournisseur_id'", (err, rows) => {
        if (err) console.error(err);
        if (rows.length === 0) {
            console.log('Adding fournisseur_id to depenses...');
            db.query("ALTER TABLE depenses ADD COLUMN fournisseur_id INT NULL, ADD CONSTRAINT fk_depenses_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL", (err) => {
                if (err) console.error('Error adding to depenses:', err);
                else console.log('fournisseur_id added to depenses successfully.');
            });
        } else {
            console.log('fournisseur_id already exists in depenses.');
        }
    });

    // Check and add fournisseur_id to produit_achat
    db.query("SHOW COLUMNS FROM produit_achat LIKE 'fournisseur_id'", (err, rows) => {
        if (err) console.error(err);
        if (rows.length === 0) {
            console.log('Adding fournisseur_id to produit_achat...');
            db.query("ALTER TABLE produit_achat ADD COLUMN fournisseur_id INT NULL, ADD CONSTRAINT fk_produit_achat_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL", (err) => {
                if (err) console.error('Error adding to produit_achat:', err);
                else console.log('fournisseur_id added to produit_achat successfully.');
            });
        } else {
            console.log('fournisseur_id already exists in produit_achat.');
        }
    });

    // Check and add fournisseur_id to produits
    db.query("SHOW COLUMNS FROM produits LIKE 'fournisseur_id'", (err, rows) => {
        if (err) console.error(err);
        if (rows.length === 0) {
            console.log('Adding fournisseur_id to produits...');
            db.query("ALTER TABLE produits ADD COLUMN fournisseur_id INT NULL, ADD CONSTRAINT fk_produits_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL", (err) => {
                if (err) console.error('Error adding to produits:', err);
                else console.log('fournisseur_id added to produits successfully.');
            });
        } else {
            console.log('fournisseur_id already exists in produits.');
        }
    });
}

migrate();
setTimeout(() => process.exit(), 5000);
