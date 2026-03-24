const mysql = require('mysql2');
require('dotenv').config({ path: './backend/.env' });

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ge',
    port: process.env.DB_PORT || 3306
});

db.query('ALTER TABLE factures ADD COLUMN date_paiement DATE DEFAULT NULL', (err, results) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log("Column date_paiement added successfully.");
    db.end();
});
