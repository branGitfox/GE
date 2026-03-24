const db = require('../db');

// Récupérer toutes les dépenses (avec filtre optionnel entre 2 dates)
exports.getAllDepenses = (req, res) => {
    const { startDate, endDate } = req.query;
    let query = `
        SELECT d.*, f.nom AS fournisseur_nom 
        FROM depenses d 
        LEFT JOIN fournisseurs f ON d.fournisseur_id = f.id
    `;
    const queryParams = [];

    if (startDate && endDate) {
        query += ' WHERE d.date BETWEEN ? AND ?';
        queryParams.push(startDate, endDate);
    }

    query += ' ORDER BY d.date DESC, d.id DESC';
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des dépenses:', err);
            return res.status(500).json({ message: 'Erreur interne du serveur', error: err.message });
        }
        res.status(200).json(results);
    });
};

// Statistiques des dépenses (total avec filtre optionnel)
exports.getDepensesStats = (req, res) => {
    const { startDate, endDate } = req.query;
    let query = 'SELECT SUM(montant) AS totalDepenses FROM depenses';
    const queryParams = [];

    if (startDate && endDate) {
        query += ' WHERE date BETWEEN ? AND ?';
        queryParams.push(startDate, endDate);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur interne du serveur', error: err.message });
        }
        res.status(200).json({ totalDepenses: parseFloat(results[0].totalDepenses || 0).toFixed(2) });
    });
};

// Créer une nouvelle dépense
exports.createDepense = (req, res) => {
    const { nom, montant, description, date, fournisseur_id } = req.body;
    const query = 'INSERT INTO depenses (nom, montant, description, date, fournisseur_id) VALUES (?, ?, ?, ?, ?)';
    const safeFournisseurId = fournisseur_id && fournisseur_id !== '' ? fournisseur_id : null;
    db.query(query, [nom, montant, description, date, safeFournisseurId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la création de la dépense:', err);
            return res.status(500).json({ message: 'Erreur lors de la création de la dépense', error: err.message });
        }
        res.status(201).json({
            id: results.insertId,
            nom,
            montant,
            description,
            date,
            fournisseur_id: safeFournisseurId
        });
    });
};

// Mettre à jour une dépense existante
exports.updateDepense = (req, res) => {
    const { id } = req.params;
    const { nom, montant, description, date, fournisseur_id } = req.body;

    const query = 'UPDATE depenses SET nom = ?, montant = ?, description = ?, date = ?, fournisseur_id = ? WHERE id = ?';
    const safeFournisseurId = fournisseur_id && fournisseur_id !== '' ? fournisseur_id : null;
    db.query(query, [nom, montant, description, date, safeFournisseurId, id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Erreur lors de la mise à jour de la dépense',
                error: err.message
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Dépense non trouvée' });
        }

        res.json({ id, nom, montant, description, date, fournisseur_id: safeFournisseurId });
    });
};

// Supprimer une dépense
exports.deleteDepense = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM depenses WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({
                message: 'Erreur lors de la suppression de la dépense',
                error: error.message
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Dépense non trouvée' });
        }

        res.json({ message: 'Dépense supprimée avec succès' });
    });
};
