const db = require('../db');
const { logAction } = require('../utils/logger');

// Récupérer toutes les catégories
exports.getAllCategories = (req, res) => {
    const query = 'SELECT * FROM categories ORDER BY id DESC';
    db.query(query, (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération des catégories:', err);
            return res.status(500).send('Erreur interne du serveur');
        }
        res.status(200).json(result);
    });
};

// Créer une nouvelle catégorie
exports.createCategory = (req, res) => {
    const { nom, description } = req.body;

    if (!nom) {
        return res.status(400).json({ message: 'Le nom de la catégorie est requis' });
    }

    const query = 'INSERT INTO categories (nom, description) VALUES (?, ?)';
    db.query(query, [nom, description], (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de la catégorie:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Une catégorie avec ce nom existe déjà' });
            }
            return res.status(500).send('Erreur lors de la création de la catégorie');
        }
        logAction(req.user?.id, 'add', 'categorie', result.insertId, null, req.body, `Création de la catégorie: ${nom}`);
        res.status(201).json({ id: result.insertId, nom, description });
    });
};

// Mettre à jour une catégorie
exports.updateCategory = (req, res) => {
    const { id } = req.params;
    const { nom, description } = req.body;

    const query = 'UPDATE categories SET nom = ?, description = ? WHERE id = ?';
    db.query(query, [nom, description, id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de la catégorie:', err);
            return res.status(500).send('Erreur lors de la mise à jour');
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }
        logAction(req.user?.id, 'update', 'categorie', id, null, req.body, `Mise à jour de la catégorie: ${nom}`);
        res.json({ id, nom, description });
    });
};

// Supprimer une catégorie
exports.deleteCategory = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM categories WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression de la catégorie:', err);
            return res.status(500).send('Erreur lors de la suppression');
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }
        logAction(req.user?.id, 'delete', 'categorie', id, null, null, `Suppression de la catégorie ID: ${id}`);
        res.json({ message: 'Catégorie supprimée avec succès' });
    });
};
