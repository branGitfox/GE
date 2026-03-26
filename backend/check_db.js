const db = require('./db');

db.query('SELECT COUNT(*) as count FROM fournisseurs', (err, res1) => {
    if (err) {
        console.error('Error fournisseurs:', err);
    } else {
        console.log('Fournisseurs count:', res1[0].count);
    }

    db.query('SELECT COUNT(*) as count FROM entrepots', (err, res2) => {
        if (err) {
            console.error('Error entrepots:', err);
        } else {
            console.log('Entrepots count:', res2[0].count);
        }
        process.exit();
    });
});
