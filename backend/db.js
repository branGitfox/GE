const mysql = require('mysql2');
require('dotenv').config(); // Charger les variables d’environnement

// Créer la connexion à la base de données
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ge',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
});

// Gérer la connexion à la base de données
db.connect(err => {
    if (err) {
        console.error('❌ Erreur de connexion MySQL:', err.message);
        return;
    }
    console.log('✅ Connecté à MySQL');
});

// Gérer les erreurs de connexion (utile en production)
db.on('error', err => {
    console.error('⚠️ Erreur MySQL:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        console.log('🔄 Tentative de reconnexion...');
        // On ne peut pas appeler connect() sur une connexion fermée si c'est un pool, 
        // mais ici c'est une simple connection.
        try {
            db.connect();
        } catch (e) {
            console.error("Échec de reconnexion immédiate:", e.message);
        }
    } else {
        // Ne pas throw pour éviter de crash le serveur
        console.error("Erreur DB non fatale (process continu):", err.code);
    }
});

module.exports = db;
