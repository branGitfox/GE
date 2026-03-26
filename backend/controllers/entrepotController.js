const db = require('../db');
const { logAction } = require('../utils/logger');

// Helper async query
const queryAsync = (sql, params = []) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => err ? reject(err) : resolve(results));
});

// ─── ENTREPOTS CRUD ────────────────────────────────

exports.getAllEntrepots = async (req, res) => {
    try {
        const rows = await queryAsync(`
            SELECT e.*, 
                   COUNT(pe.produit_id) AS nb_produits
            FROM entrepots e
            LEFT JOIN produit_entrepot pe ON pe.entrepot_id = e.id
            GROUP BY e.id
            ORDER BY e.nom ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Erreur récupération entrepôts', error: err.message });
    }
};

exports.createEntrepot = async (req, res) => {
    const { nom, type, description } = req.body;
    if (!nom) return res.status(400).json({ message: 'Le nom est requis' });
    try {
        const result = await queryAsync(
            'INSERT INTO entrepots (nom, type, description) VALUES (?, ?, ?)',
            [nom, type || 'entrepôt', description || null]
        );
        await logAction(req.user?.id, 'add', 'entrepot', result.insertId, null, req.body, `Création de l'entrepôt: ${nom}`);
        res.status(201).json({ id: result.insertId, nom, type, description });
    } catch (err) {
        res.status(500).json({ message: 'Erreur création entrepôt', error: err.message });
    }
};

exports.updateEntrepot = async (req, res) => {
    const { id } = req.params;
    const { nom, type, description } = req.body;
    if (!nom) return res.status(400).json({ message: 'Le nom est requis' });
    try {
        await queryAsync(
            'UPDATE entrepots SET nom = ?, type = ?, description = ? WHERE id = ?',
            [nom, type || 'entrepôt', description || null, id]
        );
        await logAction(req.user?.id, 'update', 'entrepot', id, null, req.body, `Mise à jour de l'entrepôt: ${nom}`);
        res.json({ success: true, message: 'Entrepôt mis à jour' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur mise à jour entrepôt', error: err.message });
    }
};

exports.deleteEntrepot = async (req, res) => {
    const { id } = req.params;
    try {
        await queryAsync('DELETE FROM entrepots WHERE id = ?', [id]);
        await logAction(req.user?.id, 'delete', 'entrepot', id, null, null, `Suppression de l'entrepôt ID: ${id}`);
        res.json({ success: true, message: 'Entrepôt supprimé' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur suppression entrepôt', error: err.message });
    }
};

// ─── LIAISON PRODUIT ↔ ENTREPÔT ──────────────────

exports.getEntrepotsForProduit = async (req, res) => {
    const { produitId } = req.params;
    try {
        const rows = await queryAsync(`
            SELECT e.* FROM entrepots e
            JOIN produit_entrepot pe ON pe.entrepot_id = e.id
            WHERE pe.produit_id = ?
        `, [produitId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Erreur', error: err.message });
    }
};

exports.setEntrepotsForProduit = async (req, res) => {
    const { produitId } = req.params;
    const { entrepot_ids } = req.body; // array of entrepot ids
    try {
        // Remove old
        await queryAsync('DELETE FROM produit_entrepot WHERE produit_id = ?', [produitId]);
        // Insert new
        for (const eid of (entrepot_ids || [])) {
            await queryAsync(
                'INSERT IGNORE INTO produit_entrepot (produit_id, entrepot_id) VALUES (?, ?)',
                [produitId, eid]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Erreur liaison entrepôt', error: err.message });
    }
};

// ─── LIAISON PRODUIT ↔ FOURNISSEURS N:N ──────────

exports.setFournisseursForProduit = async (req, res) => {
    const { produitId } = req.params;
    const { fournisseur_ids } = req.body; // array
    try {
        await queryAsync('DELETE FROM produit_fournisseurs WHERE produit_id = ?', [produitId]);
        for (const fid of (fournisseur_ids || [])) {
            await queryAsync(
                'INSERT IGNORE INTO produit_fournisseurs (produit_id, fournisseur_id) VALUES (?, ?)',
                [produitId, fid]
            );
        }
        // Update principal fournisseur_id on produits
        const mainId = (fournisseur_ids && fournisseur_ids.length > 0) ? fournisseur_ids[0] : null;
        await queryAsync('UPDATE produits SET fournisseur_id = ? WHERE id = ?', [mainId, produitId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Erreur liaison fournisseur', error: err.message });
    }
};
