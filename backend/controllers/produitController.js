const db = require('../db');

// Récupérer tous les produits
exports.getAllProduits = (req, res) => {
    const query = `
        SELECT p.*, c.nom AS categorie_nom, f.nom AS fournisseur_nom
        FROM produits p 
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN fournisseurs f ON p.fournisseur_id = f.id
        ORDER BY p.id DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération des produits:', err);
            return res.status(500).send('Erreur interne du serveur');
        }
        res.status(200).json(result);
    });
};

// Créer un nouveau produit
exports.createProduit = (req, res) => {
    const { nom, description, nom_unite_gros, quantite, prix, unité, category_id, pieces_par_carton, prix_carton, prix_piece, prix_achat, prix_achat_piece, updateExisting, importSourceId, fournisseur_id, stock_threshold } = req.body;

    if (parseFloat(prix_carton || 0) <= 0) {
        return res.status(400).json({ message: 'Le prix de vente (Gros) doit être supérieur à 0' });
    }

    if (parseInt(pieces_par_carton || 1) > 1 && parseFloat(prix_piece || 0) <= 0) {
        return res.status(400).json({ message: 'Le prix de vente au détail doit être supérieur à 0' });
    }

    // 1. Vérifier si un produit avec le même nom existe déjà
    const checkQuery = 'SELECT * FROM produits WHERE nom = ?';
    db.query(checkQuery, [nom], (error, results) => {
        if (error) {
            console.error("Erreur vérification produit existant:", error);
            return res.status(500).json({
                message: 'Erreur lors de la vérification du produit',
                error: error.message
            });
        }

        // 2. Si le produit n'existe pas, procéder à l'insertion (ou mise à jour si demandé)
        if (updateExisting && results.length > 0) {
            const existingProduit = results[0];
            const query = 'UPDATE produits SET quantite = quantite + ?, prix_carton = ?, prix_piece = ?, category_id = ?, description = ?, nom_unite_gros = ?, unité = ?, pieces_par_carton = ?, prix_achat = ?, prix_achat_piece = ?, fournisseur_id = ?, stock_threshold = ? WHERE id = ?';
            const safeCategoryId = category_id && category_id !== '' ? category_id : existingProduit.category_id;
            const safeFournisseurId = fournisseur_id && fournisseur_id !== '' ? fournisseur_id : existingProduit.fournisseur_id;

            db.query(query, [quantite, prix_carton, prix_piece, safeCategoryId, description || existingProduit.description, nom_unite_gros || existingProduit.nom_unite_gros, unité || existingProduit.unité, pieces_par_carton || existingProduit.pieces_par_carton, prix_achat || existingProduit.prix_achat, prix_achat_piece || existingProduit.prix_achat_piece || 0, safeFournisseurId, stock_threshold !== undefined ? stock_threshold : existingProduit.stock_threshold, existingProduit.id], (err, resultsUpdate) => {
                if (err) {
                    console.error("Erreur mise à jour produit existant via import:", err);
                    return res.status(500).json({ message: 'Erreur lors de la mise à jour du produit', error: err.message });
                }

                // Lier TOUS les achats avec ce nom pour consolider l'historique
                db.query('UPDATE produit_achat SET produit_id = ? WHERE nom = ? AND (produit_id IS NULL OR produit_id = 0)', [existingProduit.id, nom], (errLink) => {
                    if (errLink) console.error("Erreur liaison auto lors maj:", errLink);

                    // Si c'est un approvisionnement direct (pas un import) avec de la quantité (positive ou negative), créer une ligne d'historique d'achat
                    const quantiteAjouteePieces = parseFloat(quantite);
                    if (!importSourceId && quantiteAjouteePieces !== 0 && !isNaN(quantiteAjouteePieces)) {
                        const { historique_achat } = req.body;

                        let histQuantite, histPrix, histUnite;
                        if (historique_achat) {
                            histQuantite = historique_achat.quantite;
                            histPrix = historique_achat.prix_achat;
                            histUnite = historique_achat.unite;
                        } else {
                            const ratio = parseFloat(pieces_par_carton || existingProduit.pieces_par_carton) || 1;
                            histQuantite = quantiteAjouteePieces / ratio;
                            histPrix = prix_achat || existingProduit.prix_achat || 0;
                            histUnite = (nom_unite_gros || existingProduit.nom_unite_gros || 'Gros').trim();
                        }

                        db.query(
                            'INSERT INTO produit_achat (nom, description, quantite, prix_achat, prix_vente, unite, category_id, produit_id, fournisseur_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [nom, 'Approvisionnement', histQuantite, histPrix, prix_carton || existingProduit.prix_carton || 0, histUnite, safeCategoryId, existingProduit.id, safeFournisseurId],
                            (errHist) => {
                                if (errHist) console.error("Erreur enregistrement achat approvisionnement:", errHist);
                            }
                        );
                    } else if (importSourceId) {
                        // Lier spécifiquement l'achat source si c'est un import
                        db.query('UPDATE produit_achat SET produit_id = ? WHERE id = ?', [existingProduit.id, importSourceId]);
                    }
                });

                return res.status(200).json({ id: existingProduit.id, nom, message: 'Stock mis à jour avec succès' });
            });
            return;
        }

        // Si un produit existe déjà et qu'on n'a pas demandé de mise à jour
        if (results.length > 0) {
            return res.status(409).json({
                message: 'Un produit avec ce nom existe déjà'
            });
        }

        const query = 'INSERT INTO produits (nom, description, nom_unite_gros, quantite, prix, unité, category_id, pieces_par_carton, prix_carton, prix_piece, prix_achat, prix_achat_piece, fournisseur_id, stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const safeCategoryId = category_id && category_id !== '' ? category_id : null;
        const safeFournisseurId = fournisseur_id && fournisseur_id !== '' ? fournisseur_id : null;
        db.query(query, [nom, description, nom_unite_gros || 'Gros', quantite, prix || prix_carton || 0, unité || 'Détail', safeCategoryId, pieces_par_carton, prix_carton, prix_piece, prix_achat || 0, prix_achat_piece || 0, safeFournisseurId, stock_threshold || 0], (err, resultsInsert) => {
            if (err) {
                console.error("Erreur insertion produit:", err);
                return res.status(500).json({
                    message: 'Erreur lors de la création du produit',
                    error: err.message
                });
            }

            const newId = resultsInsert.insertId;

            // 1. Lier TOUS les achats orphelins avec ce nom à ce nouveau produit
            db.query('UPDATE produit_achat SET produit_id = ? WHERE nom = ? AND (produit_id IS NULL OR produit_id = 0)', [newId, nom], (errLink) => {
                if (errLink) console.error("Erreur liaison auto lors creation:", errLink);

                // 2. Si création directe avec stock (pas via import), historiser le stock initial
                const quantiteInitialePieces = parseFloat(quantite);
                if (!importSourceId && quantiteInitialePieces > 0) {
                    const ratio = parseFloat(pieces_par_carton) || 1;
                    const quantiteGros = quantiteInitialePieces / ratio;
                    const targetUnite = (nom_unite_gros || 'Gros').trim();
                    db.query(
                        'INSERT INTO produit_achat (nom, description, quantite, prix_achat, prix_vente, unite, category_id, produit_id, fournisseur_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [nom, 'Stock Initial', quantiteGros, prix_achat || 0, prix_carton || prix || 0, targetUnite, safeCategoryId, newId, safeFournisseurId],
                        (errHist) => {
                            if (errHist) console.error("Erreur enregistrement stock initial:", errHist);
                        }
                    );
                } else if (importSourceId) {
                    // Lier spécifiquement l'achat source si c'est un import
                    db.query('UPDATE produit_achat SET produit_id = ? WHERE id = ?', [newId, importSourceId]);
                }
            });

            // Retourner le produit créé
            const createdProduit = { id: newId, nom, description, nom_unite_gros, quantite, prix_carton, prix_piece, prix_achat, unité, category_id: safeCategoryId, fournisseur_id: safeFournisseurId, stock_threshold };
            if (req.io) req.io.emit('produit-updated', createdProduit);
            res.status(201).json(createdProduit);
        });
    });
};

// Mettre à jour un produit existant 
exports.updateProduit = (req, res) => {
    const { id } = req.params;
    const { nom, description, nom_unite_gros, quantite, prix, unité, category_id, pieces_par_carton, prix_carton, prix_piece, prix_achat, prix_achat_piece, fournisseur_id, stock_threshold } = req.body;

    if (parseFloat(prix_carton || 0) <= 0) {
        return res.status(400).json({ message: 'Le prix de vente (Gros) doit être supérieur à 0' });
    }

    if (parseInt(pieces_par_carton || 1) > 1 && parseFloat(prix_piece || 0) <= 0) {
        return res.status(400).json({ message: 'Le prix de vente au détail doit être supérieur à 0' });
    }

    const safeCategoryId = category_id && category_id !== '' ? category_id : null;
    const safeFournisseurId = fournisseur_id && fournisseur_id !== '' ? fournisseur_id : null;

    db.query('SELECT quantite, pieces_par_carton FROM produits WHERE id = ?', [id], (err, oldRes) => {
        if (err) return res.status(500).json({ message: 'Erreur lecture ancienne quantité', error: err.message });
        if (oldRes.length === 0) return res.status(404).json({ message: 'Produit non trouvé' });

        const oldQuantite = parseFloat(oldRes[0].quantite || 0);
        const oldRatio = parseFloat(oldRes[0].pieces_par_carton || 1);
        const newQuantite = parseFloat(quantite || 0);
        const newRatio = parseFloat(pieces_par_carton || 1);

        console.log('[DEBUG Stock Update]', {
            id,
            oldQuantite,
            oldRatio,
            newQuantite,
            newRatio,
            deltaPieces: newQuantite - oldQuantite
        });

        const deltaPieces = newQuantite - oldQuantite;

        const updateQuery = 'UPDATE produits SET nom = ?, description = ?, nom_unite_gros = ?, quantite = ?, prix = ?, unité = ?, category_id = ?, pieces_par_carton = ?, prix_carton = ?, prix_piece = ?, prix_achat = ?, prix_achat_piece = ?, fournisseur_id = ?, stock_threshold = ? WHERE id = ?';
        
        db.query(updateQuery, [nom, description, nom_unite_gros || 'Gros', quantite, prix || prix_carton || 0, unité || 'Détail', safeCategoryId, pieces_par_carton, prix_carton, prix_piece, prix_achat || 0, prix_achat_piece || 0, safeFournisseurId, stock_threshold || 0, id], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la mise à jour du produit', error: err.message });
            }

            // Sync metadata for historical purchases
            const updateAchatQuery = `UPDATE produit_achat SET nom = ?, unite = ?, category_id = ?, fournisseur_id = ?, prix_achat = ? WHERE produit_id = ?`;
            db.query(updateAchatQuery, [nom, nom_unite_gros || 'Gros', safeCategoryId, safeFournisseurId, prix_achat || 0, id], (errAchat) => {
                if (errAchat) console.error("Erreur mise à jour produit_achat metadata:", errAchat);
            });

            // If stock was edited via the form, automatically generate adjustment logs
            if (Math.abs(deltaPieces) > 0.001) {
                const isPositive = deltaPieces > 0;
                let absDelta = Math.abs(deltaPieces);
                const currentRatio = parseFloat(pieces_par_carton) || 1;

                const adjustLabel = isPositive ? 'Ajustement Modif (+)' : 'Ajustement Modif (-)';
                const sign = isPositive ? 1 : -1;

                // SPECIAL CASE: transition from no-retail to retail
                // If oldRatio was 1 and currentRatio > 1, the "old" stock was actually containers.
                // We should log the addition of the new sub-units separately if possible, 
                // but the current logic of just logging the delta in cartons/pieces is usually fine 
                // IF it accounts for the change in unit definition.
                
                if (oldRatio === 1 && currentRatio > 1) {
                    // The user had X units (now cartons). If they still have X cartons, the delta is just extra pieces.
                    const oldCartons = oldQuantite; // when ratio was 1
                    const newCartons = Math.floor(newQuantite / currentRatio);
                    const newPieces = newQuantite % currentRatio;

                    const deltaCartons = newCartons - oldCartons;
                    const deltaPiecesRem = newPieces;

                    if (deltaCartons !== 0) {
                        db.query(
                            'INSERT INTO produit_achat (nom, description, quantite, prix_achat, prix_vente, unite, category_id, produit_id, fournisseur_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [nom, adjustLabel, deltaCartons, prix_achat || 0, prix_carton || 0, nom_unite_gros || 'Gros', safeCategoryId, id, safeFournisseurId]
                        );
                    }
                    if (deltaPiecesRem !== 0) {
                        const mappedPrixAchatPiece = parseFloat(prix_achat_piece) > 0 ? prix_achat_piece : ((prix_achat || 0) / currentRatio);
                        db.query(
                            'INSERT INTO produit_achat (nom, description, quantite, prix_achat, prix_vente, unite, category_id, produit_id, fournisseur_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [nom, adjustLabel, deltaPiecesRem, mappedPrixAchatPiece, prix_piece || 0, unité || 'Détail', safeCategoryId, id, safeFournisseurId]
                        );
                    }
                } else {
                    // Standard delta logging
                    const dCartons = Math.floor(absDelta / currentRatio);
                    const dPieces = absDelta % currentRatio;

                    if (dCartons > 0 && prix_carton) {
                        db.query(
                            'INSERT INTO produit_achat (nom, description, quantite, prix_achat, prix_vente, unite, category_id, produit_id, fournisseur_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [nom, adjustLabel, sign * dCartons, prix_achat || 0, prix_carton || 0, nom_unite_gros || 'Gros', safeCategoryId, id, safeFournisseurId]
                        );
                    }
                    
                    if (dPieces > 0.001) {
                        const mappedPrixAchatPiece = parseFloat(prix_achat_piece) > 0 ? prix_achat_piece : ((prix_achat || 0) / currentRatio);
                        db.query(
                            'INSERT INTO produit_achat (nom, description, quantite, prix_achat, prix_vente, unite, category_id, produit_id, fournisseur_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [nom, adjustLabel, sign * dPieces, mappedPrixAchatPiece, prix_piece || 0, unité || 'Détail', safeCategoryId, id, safeFournisseurId]
                        );
                    }
                }
            }

            const updatedProduit = { id, nom, description, quantite, prix_carton, prix_piece, prix_achat_piece, pieces_par_carton, unité, category_id, fournisseur_id: safeFournisseurId, stock_threshold };
            if (req.io) {
                req.io.emit('produit-updated', updatedProduit);
            }
            res.json(updatedProduit);
        });
    });
};

// Récupérer les produits récents pour le tableau de bord
exports.getRecentProduits = (req, res) => {
    const query = `
        SELECT 
            p.id, p.nom, p.quantite, p.prix_carton, p.prix_piece, 
            p.pieces_par_carton, p.\`unité\`, p.prix_achat, p.prix_achat_piece, p.nom_unite_gros, p.stock_threshold,
            (
                SELECT pa.unite 
                FROM produit_achat pa 
                WHERE pa.produit_id = p.id 
                ORDER BY pa.created_at DESC 
                LIMIT 1
            ) AS unite_achat
        FROM produits p
        ORDER BY p.id DESC LIMIT 10
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération des produits récents:', err);
            return res.status(500).send('Erreur interne du serveur');
        }
        res.status(200).json(result);
    });
};


// Supprimer un produit
exports.deleteProduit = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM produits WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({
                message: 'Erreur lors de la suppression du produit',
                error: error.message
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        res.json({ message: 'Produit supprimé avec succès' });
    });
};

exports.addQuantite = async (req, res) => {
    const { id } = req.params;
    const { quantite, rawQuantite, unite, prix_achat: newPrixAchat } = req.body;

    if (!id) return res.status(400).json({ success: false, message: 'ID de produit requis' });

    const queryAsync = (sql, params) => new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => err ? reject(err) : resolve(results));
    });

    try {
        let nouvelleQuantite;
        const quantiteAAjouter = parseFloat(quantite);
        if (isNaN(quantiteAAjouter) || quantiteAAjouter < 0.1) {
            throw new Error('Quantité invalide');
        }

        const rows = await queryAsync('SELECT * FROM produits WHERE id = ?', [id]);
        if (rows.length === 0) throw new Error('Produit non trouvé');
        const produit = rows[0];

        // 1. Mettre à jour produits (stock ET nouveau prix d'achat)
        nouvelleQuantite = parseFloat(produit.quantite) + quantiteAAjouter;
        
        let pAchatFinal = produit.prix_achat || 0;
        let pAchatPieceFinal = produit.prix_achat_piece || 0;

        if (newPrixAchat !== undefined && newPrixAchat !== null && !isNaN(parseFloat(newPrixAchat))) {
            const isDetail = unite === 'piece' || unite === (produit.unité || 'Détail');
            const ratio = produit.pieces_par_carton || 1;
            
            if (isDetail && ratio > 1) {
                pAchatPieceFinal = parseFloat(newPrixAchat);
                pAchatFinal = pAchatPieceFinal * ratio;
            } else {
                pAchatFinal = parseFloat(newPrixAchat);
                pAchatPieceFinal = ratio > 1 ? (pAchatFinal / ratio) : pAchatFinal;
            }
        }

        await queryAsync(
            'UPDATE produits SET quantite = ?, prix_achat = ?, prix_achat_piece = ? WHERE id = ?',
            [nouvelleQuantite, pAchatFinal, pAchatPieceFinal, id]
        );

        // 2. Historique : Log l'achat avec le prix spécifique fourni
        let targetUnite = (unite || produit.nom_unite_gros || 'Gros').trim();
        let valToAdd = rawQuantite !== undefined ? parseFloat(rawQuantite) : quantiteAAjouter;
        
        // On log le prix unitaire tel qu'il a été saisi
        const pAchatLog = (newPrixAchat !== undefined && newPrixAchat !== null) ? parseFloat(newPrixAchat) : (unite === 'piece' ? pAchatPieceFinal : pAchatFinal);
        const pVenteLog = (unite === 'piece' ? produit.prix_piece : produit.prix_carton) || 0;

        await queryAsync(
            'INSERT INTO produit_achat (nom, description, quantite, prix_achat, prix_vente, unite, category_id, produit_id, fournisseur_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [produit.nom, 'Ajustement (+)', valToAdd, pAchatLog, pVenteLog, targetUnite, produit.category_id || null, produit.id, produit.fournisseur_id || null]
        );
        
        const updatedProduit = { ...produit, quantite: nouvelleQuantite, prix_achat: pAchatFinal, prix_achat_piece: pAchatPieceFinal };
        if (req.io) {
            req.io.emit('produit-updated', updatedProduit);
        }
        res.json({ success: true, message: 'Stock ajouté avec succès', produit: updatedProduit });
    } catch (error) {
        console.error("Erreur addQuantite:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeQuantite = async (req, res) => {
    const { id } = req.params;
    const { quantite, rawQuantite, unite } = req.body;

    if (!id) return res.status(400).json({ success: false, message: 'ID de produit requis' });

    const queryAsync = (sql, params) => new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => err ? reject(err) : resolve(results));
    });

    try {
        let nouvelleQuantite;
        const quantiteARetirer = parseFloat(quantite);
        if (isNaN(quantiteARetirer) || quantiteARetirer < 0.1) {
            throw new Error('Quantité invalide');
        }

        const rows = await queryAsync('SELECT * FROM produits WHERE id = ?', [id]);
        if (rows.length === 0) throw new Error('Produit non trouvé');
        const produit = rows[0];

        if (parseFloat(produit.quantite) < quantiteARetirer) {
            throw new Error(`Stock insuffisant pour ${produit.nom} (Dispo: ${produit.quantite}, Requis: ${quantiteARetirer})`);
        }

        // 1. Mettre à jour produits
        nouvelleQuantite = parseFloat(produit.quantite) - quantiteARetirer;
        await queryAsync('UPDATE produits SET quantite = ? WHERE id = ?', [nouvelleQuantite, id]);

        // 2. Historique
        let targetUnite = (unite || produit.unité || 'Détail').trim();
        let valToSub = rawQuantite !== undefined ? parseFloat(rawQuantite) : quantiteARetirer;

        // NO CONSOLIDATION: Retirer sur le même standard
        const isDetail = unite === 'piece' || unite === (produit.unité || 'Détail');
        let pAchat = produit.prix_achat || 0;
        let pVente = produit.prix_carton || 0;

        if (isDetail && produit.pieces_par_carton > 1) {
            targetUnite = (produit.unité || 'Détail').trim();
            pAchat = produit.prix_achat_piece > 0 ? produit.prix_achat_piece : ((produit.prix_achat || 0) / produit.pieces_par_carton);
            pVente = produit.prix_piece || 0;
        } else {
            targetUnite = (produit.nom_unite_gros || 'Gros').trim();
        }

        await queryAsync(
            'INSERT INTO produit_achat (nom, description, quantite, prix_achat, prix_vente, unite, category_id, produit_id, fournisseur_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [produit.nom, 'Ajustement (-)', -valToSub, pAchat, pVente, targetUnite, produit.category_id || null, produit.id, produit.fournisseur_id || null]
        );
        const updatedProduit = { ...produit, quantite: nouvelleQuantite };
        if (req.io) {
            req.io.emit('produit-updated', updatedProduit);
        }
        res.json({ success: true, message: 'Stock retiré avec succès', produit: updatedProduit });
    } catch (error) {
        console.error("Erreur removeQuantite:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};




// Récupérer les achats non liés à un produit existant
exports.getUnlinkedPurchases = (req, res) => {
    const query = `
        SELECT pa.*, f.nom AS fournisseur_nom
        FROM produit_achat pa
        LEFT JOIN fournisseurs f ON pa.fournisseur_id = f.id
        WHERE (pa.produit_id IS NULL OR pa.produit_id = 0) AND pa.quantite > 0
        ORDER BY pa.created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur récupération achats non liés:', err);
            return res.status(500).json({ message: 'Erreur récupération achats', error: err.message });
        }
        res.json(results);
    });
};
