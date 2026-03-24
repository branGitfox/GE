const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ge'
});

db.query("SHOW COLUMNS FROM produit_achat", (err, results) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(results.map(r => r.Field));

    const hasFournisseur = results.some(r => r.Field === 'fournisseur_id');
    if (!hasFournisseur) {
        db.query("ALTER TABLE produit_achat ADD COLUMN fournisseur_id INT NULL", (err2) => {
            if (err2) {
                console.error("Failed to add column", err2);
            } else {
                console.log("Added fournisseur_id column");
            }
            process.exit(0);
        });
    } else {
        console.log("Column fournisseur_id already exists");
        process.exit(0);
    }
});
