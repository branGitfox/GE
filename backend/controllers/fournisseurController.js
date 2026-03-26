const db = require('../db');
const { logAction } = require('../utils/logger');

// Get all suppliers
exports.getAllFournisseurs = (req, res) => {
    const query = 'SELECT * FROM fournisseurs ORDER BY nom ASC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching suppliers:', err);
            return res.status(500).json({ message: 'Error fetching suppliers' });
        }
        res.status(200).json(results);
    });
};

// Get supplier by ID
exports.getFournisseurById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM fournisseurs WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching supplier:', err);
            return res.status(500).json({ message: 'Error fetching supplier' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json(results[0]);
    });
};

// Create supplier
exports.createFournisseur = (req, res) => {
    const { nom, telephone, adresse, email, description } = req.body;

    if (!nom) {
        return res.status(400).json({ message: 'Name is required' });
    }

    const query = 'INSERT INTO fournisseurs (nom, telephone, adresse, email, description) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nom, telephone, adresse, email, description], (err, result) => {
        if (err) {
            console.error('Error creating supplier:', err);
            return res.status(500).json({ message: 'Error creating supplier' });
        }
        logAction(req.user?.id, 'add', 'fournisseur', result.insertId, null, req.body, `Création du fournisseur: ${nom}`);
        res.status(201).json({
            success: true,
            message: 'Supplier created successfully',
            id: result.insertId
        });
    });
};

// Update supplier
exports.updateFournisseur = (req, res) => {
    const { id } = req.params;
    const { nom, telephone, adresse, email, description } = req.body;

    if (!nom) {
        return res.status(400).json({ message: 'Name is required' });
    }

    const query = 'UPDATE fournisseurs SET nom = ?, telephone = ?, adresse = ?, email = ?, description = ? WHERE id = ?';
    db.query(query, [nom, telephone, adresse, email, description, id], (err, result) => {
        if (err) {
            console.error('Error updating supplier:', err);
            return res.status(500).json({ message: 'Error updating supplier' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        logAction(req.user?.id, 'update', 'fournisseur', id, null, req.body, `Mise à jour du fournisseur: ${nom}`);
        res.status(200).json({ success: true, message: 'Supplier updated successfully' });
    });
};

// Delete supplier
exports.deleteFournisseur = (req, res) => {
    const { id } = req.params;

    // Check if supplier is linked to products or expenses
    const checkQuery = 'SELECT (SELECT COUNT(*) FROM produits WHERE fournisseur_id = ?) + (SELECT COUNT(*) FROM depenses WHERE fournisseur_id = ?) AS total';

    db.query(checkQuery, [id, id], (err, checkResult) => {
        if (err) {
            console.error('Error checking supplier links:', err);
            return res.status(500).json({ message: 'Error checking supplier links' });
        }

        if (checkResult[0].total > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete supplier with linked products or expenses'
            });
        }

        const query = 'DELETE FROM fournisseurs WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Error deleting supplier:', err);
                return res.status(500).json({ message: 'Error deleting supplier' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Supplier not found' });
            }
            logAction(req.user?.id, 'delete', 'fournisseur', id, null, null, `Suppression du fournisseur ID: ${id}`);
            res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
        });
    });
};
