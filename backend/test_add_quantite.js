const axios = require('axios');
const fs = require('fs');

async function test() {
    try {
        console.log("Fetching root token for auth if needed... wait, I can just do db request directly");
        const mysql = require('mysql2/promise');
        require('dotenv').config({ path: '/home/asus/Documents/V1.0/backend/.env' });
        
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ge',
            port: process.env.DB_PORT || 3306,
        });

        const [produits] = await db.query('SELECT * FROM produits LIMIT 1');
        if (produits.length === 0) {
            console.log("No products found.");
            process.exit(1);
        }
        const p = produits[0];
        console.log(`Testing with product: ${p.nom} (ID: ${p.id})`);
        
        const unite = p.nom_unite_gros || 'Gros';
        
        // Simulating addQuantite
        const valToAdd = 5;
        const pAchat = p.prix_achat || 0;
        const pVente = p.prix_carton || 0;
        
        console.log(`Inserting Ajustement (+) for ${valToAdd} ${unite} at price ${pAchat}`);
        
        await db.query(
            'INSERT INTO produit_achat (nom, description, quantite, prix_achat, prix_vente, unite, category_id, produit_id, fournisseur_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [p.nom, 'Ajustement (+)', valToAdd, pAchat, pVente, unite, p.category_id || null, p.id, p.fournisseur_id || null]
        );
        
        console.log("Insert successful! Fetching history...");
        
        const [history] = await db.query('SELECT * FROM produit_achat WHERE produit_id = ? ORDER BY id DESC LIMIT 5', [p.id]);
        console.log("History:");
        console.table(history);
        
        db.end();
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
