const db = require('../db');
const { logAction } = require('../utils/logger');

// Retourner le stock réel (somme des quantités) pour chaque produit_id
exports.getStockParProduit = (req, res) => {
    const query = `
        SELECT produit_id, nom, SUM(quantite) AS stock_reel
        FROM produit_achat
        GROUP BY produit_id, nom
        ORDER BY produit_id ASC
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors du calcul du stock', error: err.message });
        }
        res.status(200).json(results);
    });
};

// Mettre à jour un produit_achat
exports.updateProduitAchat = (req, res) => {
    const { id } = req.params;
    const { nom, description, quantite, prix_achat, prix_achat_piece, prix_vente, unite, category_id, produit_id, fournisseur_id, entrepot_id } = req.body;
    const updateQuery = `UPDATE produit_achat SET nom = ?, description = ?, quantite = ?, prix_achat = ?, prix_achat_piece = ?, prix_vente = ?, unite = ?, category_id = ?, produit_id = ?, fournisseur_id = ?, entrepot_id = ? WHERE id = ?`;
    const safeProductId = (produit_id !== undefined && produit_id !== null && produit_id !== '') ? produit_id : null;
    const safeFournisseurId = (fournisseur_id !== undefined && fournisseur_id !== null && fournisseur_id !== '') ? fournisseur_id : null;
    const safeEntrepotId = (entrepot_id !== undefined && entrepot_id !== null && entrepot_id !== '') ? entrepot_id : null;
    db.query(updateQuery, [nom, description, quantite, prix_achat, prix_achat_piece || 0, prix_vente, unite || null, category_id || null, safeProductId, safeFournisseurId, safeEntrepotId, id], (err, result) => {
        if (err) {
            console.error('Erreur update produit achat:', err);
            return res.status(500).json({ message: 'Erreur lors de la modification', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Enregistrement non trouvé' });
        }
        logAction(req.user?.id, 'update', 'produit_achat', id, null, req.body, `Modification de l'historique d'achat/ajustement: ${nom}`);
        res.status(200).json({ id, nom, description, quantite, prix_achat, prix_vente, unite, category_id, produit_id, fournisseur_id: safeFournisseurId });
    });
};

// Récupérer tous les produits achetés (avec filtres optionnels + Historique Ventes)
exports.getAllProduitAchats = async (req, res) => {
    const { nom, startDate, endDate, produit_id } = req.query;

    try {
        // 1. Récupérer les achats/ajustements (Base)
        let queryAchats = `
            SELECT pa.*, c.nom AS categorie_nom 
            FROM produit_achat pa 
            LEFT JOIN categories c ON pa.category_id = c.id
        `;
        const paramsAchats = [];
        const conditionsAchats = [];

        if (produit_id) {
            conditionsAchats.push('pa.produit_id = ?');
            paramsAchats.push(produit_id);
        } else if (nom) {
            conditionsAchats.push('pa.nom = ?');
            paramsAchats.push(nom);
        }

        if (startDate && endDate) {
            conditionsAchats.push('pa.created_at BETWEEN ? AND ?');
            paramsAchats.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
        }

        if (conditionsAchats.length > 0) {
            queryAchats += ' WHERE ' + conditionsAchats.join(' AND ');
        }
        queryAchats += ' ORDER BY pa.created_at DESC';

        const achats = await new Promise((resolve, reject) => {
            db.query(queryAchats, paramsAchats, (err, results) => err ? reject(err) : resolve(results));
        });

        // 2. Si on demande pour un produit spécifique, récupérer aussi les VENTES (Factures)
        if (produit_id) {
            const queryFactures = `
                SELECT id, numero_facture, date_facture, liste_articles, created_at 
                FROM factures 
                WHERE JSON_CONTAINS(liste_articles, JSON_OBJECT('produit_id', ?))
            `;

            const factures = await new Promise((resolve, reject) => {
                db.query(queryFactures, [Number(produit_id)], (err, results) => err ? reject(err) : resolve(results));
            });

            const ventesFormatted = [];
            factures.forEach(f => {
                let articles = [];
                try {
                    articles = typeof f.liste_articles === 'string' ? JSON.parse(f.liste_articles) : f.liste_articles;
                } catch (e) { console.error("Parse error:", e); }

                const item = articles.find(a => String(a.produit_id) === String(produit_id));
                if (item) {
                    ventesFormatted.push({
                        id: `fact-${f.id}`,
                        nom: item.nom || 'Produit vendu',
                        description: `Vente via ${f.numero_facture}`,
                        quantite: -parseFloat(item.quantite),
                        unite: item.unité || item.unite || (item.type_vente === 'carton' ? 'Gros' : 'Détail'),
                        created_at: f.created_at,
                        is_vente: true
                    });
                }
            });

            const combined = [...achats, ...ventesFormatted].sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );
            return res.status(200).json(combined);
        }

        res.status(200).json(achats);
    } catch (error) {
        console.error('Erreur récupération historique:', error);
        res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
    }
};

// Créer un enregistrement dans produit_achat
exports.createProduitAchat = (req, res) => {
    const { nom, description, quantite, prix_achat, prix_achat_piece, prix_vente, unite, category_id, produit_id, fournisseur_id, entrepot_id } = req.body;
    const insertQuery = `
        INSERT INTO produit_achat (nom, description, quantite, prix_achat, prix_achat_piece, prix_vente, unite, category_id, produit_id, fournisseur_id, entrepot_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const safeProductId = (produit_id !== undefined && produit_id !== null && produit_id !== '') ? produit_id : null;
    const safeFournisseurId = (fournisseur_id !== undefined && fournisseur_id !== null && fournisseur_id !== '') ? fournisseur_id : null;
    const safeEntrepotId = (entrepot_id !== undefined && entrepot_id !== null && entrepot_id !== '') ? entrepot_id : null;

    db.query(insertQuery, [nom, description, quantite, prix_achat, prix_achat_piece || 0, prix_vente, unite || null, category_id || null, safeProductId, safeFournisseurId, safeEntrepotId], (err, result) => {
        if (err) {
            console.error('Erreur insertion produit achat:', err);
            return res.status(500).json({ message: 'Erreur lors de la création', error: err.message });
        }

        if (safeProductId) {
            db.query('SELECT * FROM produits WHERE id = ?', [safeProductId], (errProd, resProd) => {
                if (!errProd && resProd.length > 0) {
                    const produit = resProd[0];
                    let quantiteAAjouter = parseFloat(quantite);

                    if (produit.pieces_par_carton > 1 && unite && unite.toLowerCase() === (produit.nom_unite_gros || 'Gros').toLowerCase()) {
                        quantiteAAjouter = quantiteAAjouter * produit.pieces_par_carton;
                    }

                    const nouvelleQuantite = parseFloat(produit.quantite) + quantiteAAjouter;

                    db.query('UPDATE produits SET quantite = ? WHERE id = ?', [nouvelleQuantite, safeProductId], (errUpd) => {
                        if (errUpd) console.error("Erreur màj stock produit après achat:", errUpd);
                    });
                }
            });
        }

        logAction(req.user?.id, 'add', 'produit_achat', result.insertId, null, req.body, `Nouvel achat/ajustement de stock pour: ${nom}`);
        res.status(201).json({ id: result.insertId, nom, description, quantite, prix_achat, prix_vente, unite, category_id, produit_id, fournisseur_id: safeFournisseurId });
    });
};

// Supprimer un achat
exports.deleteProduitAchat = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM produit_achat WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la suppression', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Enregistrement non trouvé' });
        }
        logAction(req.user?.id, 'delete', 'produit_achat', id, null, null, `Suppression d'un enregistrement d'achat/ajustement ID: ${id}`);
        res.json({ message: 'Produit achat supprimé avec succès' });
    });
};

// Stats totales des achats de produits (avec filtre optionnel)
exports.getProduitAchatStats = (req, res) => {
    const { startDate, endDate } = req.query;
    let query = `
        SELECT 
            pa.id,
            pa.nom, 
            SUM(pa.quantite) AS total_quantite, 
            pa.prix_achat,
            SUM(pa.quantite * pa.prix_achat) AS total_cout,
            pa.unite,
            pa.fournisseur_id,
            f.nom AS fournisseur_nom,
            pa.entrepot_id,
            e.nom AS entrepot_nom,
            pa.description,
            pa.created_at,
            pa.produit_id,
            (
                SELECT GROUP_CONCAT(f2.nom SEPARATOR ', ')
                FROM produit_fournisseurs pf
                JOIN fournisseurs f2 ON f2.id = pf.fournisseur_id
                WHERE pf.produit_id = pa.produit_id
            ) AS fournisseurs_list
        FROM produit_achat pa
        LEFT JOIN fournisseurs f ON pa.fournisseur_id = f.id
        LEFT JOIN entrepots e ON pa.entrepot_id = e.id
    `;
    const params = [];

    if (startDate && endDate) {
        query += ' WHERE pa.created_at BETWEEN ? AND ?';
        params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
    }

    query += `
        GROUP BY pa.id, pa.nom, pa.prix_achat, pa.unite, pa.fournisseur_id, f.nom, pa.entrepot_id, e.nom, pa.description, pa.created_at, pa.produit_id
        ORDER BY pa.created_at DESC
    `;

    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne', error: err.message });
        }
        res.status(200).json(results);
    });
};
