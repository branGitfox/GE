const db = require('./db');

db.query('ALTER TABLE produit_achat ADD COLUMN prix_achat_piece DECIMAL(15,2) DEFAULT 0', (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists');
        } else {
            console.error(err);
        }
    } else {
        console.log('Column added');
    }
    process.exit();
});
