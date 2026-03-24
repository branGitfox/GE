const db = require('./db');

db.query('DESCRIBE produits', (err, results) => {
    if (err) console.error(err);
    console.log('TABLE produits');
    console.table(results);

    db.query('DESCRIBE produit_achat', (err2, results2) => {
        if (err2) console.error(err2);
        console.log('TABLE produit_achat');
        console.table(results2);

        process.exit();
    });
});
