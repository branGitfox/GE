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
    db.query("DESC produit_achat", (err, res) => {
        if (err) console.error(err);
        else console.log(JSON.stringify(res, null, 2));
        db.end();
    });
});
