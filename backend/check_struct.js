const db = require('./db');

db.query('DESCRIBE fournisseurs', (err, res1) => {
    if (err) console.error('Error fournisseurs structure:', err);
    else console.log('Fournisseurs structure:', res1);

    db.query('DESCRIBE entrepots', (err, res2) => {
        if (err) console.error('Error entrepots structure:', err);
        else console.log('Entrepots structure:', res2);
        process.exit();
    });
});
