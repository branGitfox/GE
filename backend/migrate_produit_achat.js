const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ge',
    port: process.env.DB_PORT || 3306
});

db.connect(err => {
    if (err) {
        console.error('Connection error:', err.message);
        process.exit(1);
    }
    const query = "ALTER TABLE produit_achat ADD COLUMN entrepot_id INT NULL AFTER fournisseur_id";
    db.query(query, (err, res) => {
        if (err) {
            if (err.errno === 1060) {
                console.log('Column already exists');
            } else {
                console.error(err);
            }
        } else {
            console.log('Column added successfully');
        }
        db.end();
    });
});
