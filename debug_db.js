const db = require('./backend/db');

async function debug() {
    console.log('--- TABLE produits ---');
    db.query('SELECT id, nom, quantite, pieces_par_carton FROM produits LIMIT 5', (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);

        console.log('\n--- TABLE produit_achat ---');
        db.query('SELECT id, nom, quantite, produit_id, description FROM produit_achat ORDER BY id DESC LIMIT 5', (err2, rows2) => {
            if (err2) console.error(err2);
            else console.table(rows2);
            process.exit();
        });
    });
}

debug();
