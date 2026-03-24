const mysql = require('mysql2');
require('dotenv').config({ path: '/home/asus/Documents/V1.0/backend/.env' });
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ge',
    port: process.env.DB_PORT || 3306,
});
db.query('DESCRIBE depenses', (err, results) => {
    if(err) console.error(err);
    else console.log(results);
    db.end();
});
