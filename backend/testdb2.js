const mysql = require('mysql2');
require('dotenv').config({ path: '/home/asus/Documents/V1.0/backend/.env' });
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ge',
    port: process.env.DB_PORT || 3306,
});
db.query('SELECT nom, quantite, unite, prix_achat, description FROM produit_achat ORDER BY id DESC LIMIT 5', (err, results) => {
    if(err) console.error(err);
    else console.table(results);
    db.end();
});
