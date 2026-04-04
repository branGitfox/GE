const db = require('../db');
const { logAction } = require('../utils/logger');

// Récupérer tous les rôles avec leurs pages assignées
exports.getRoles = (req, res) => {
    const queryRoles = 'SELECT id, nom, description FROM roles';
    const queryRolePages = `
        SELECT rp.role_id, p.id, p.nom, p.chemin 
        FROM role_pages rp
        JOIN pages p ON rp.page_id = p.id
    `;

    db.query(queryRoles, (err, roles) => {
        if (err) {
            console.error('Erreur getRoles (roles):', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération des rôles' });
        }

        db.query(queryRolePages, (err, pagesResult) => {
            if (err) {
                console.error('Erreur getRoles (pages):', err);
                return res.status(500).json({ message: 'Erreur lors de la récupération des pages liées' });
            }

            // Map in node to avoid MariaDB procedure errors
            const rolesWithPages = roles.map(role => {
                const rolePages = pagesResult.filter(p => p.role_id === role.id);
                return {
                    ...role,
                    pages_count: rolePages.length,
                    pages: rolePages.map(p => ({ id: p.id, nom: p.nom, chemin: p.chemin }))
                };
            });

            res.status(200).json(rolesWithPages);
        });
    });
};

// Récupérer toutes les pages
exports.getPages = (req, res) => {
    const query = 'SELECT * FROM pages';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur getPages:', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération des pages' });
        }
        res.status(200).json(results);
    });
};

// Créer un nouveau rôle
exports.createRole = async (req, res) => {
    const { nom, description, pages } = req.body;
    
    if (!nom) return res.status(400).json({ message: 'Le nom du rôle est requis' });

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: 'Erreur système' });

        db.query('INSERT INTO roles (nom, description) VALUES (?, ?)', [nom, description], (err, result) => {
            if (err) {
                db.rollback(() => {});
                console.error('Erreur createRole:', err);
                return res.status(500).json({ message: 'Erreur lors de la création du rôle' });
            }

            const roleId = result.insertId;

            if (pages && pages.length > 0) {
                const values = pages.map(pageId => [roleId, pageId]);
                db.query('INSERT INTO role_pages (role_id, page_id) VALUES ?', [values], async (err) => {
                    if (err) {
                        db.rollback(() => {});
                        console.error('Erreur assignation pages:', err);
                        return res.status(500).json({ message: 'Erreur lors de l\'assignation des pages' });
                    }
                    
                    db.commit();
                    await logAction(req.user?.id, 'create', 'role', roleId, null, { nom, pages }, `Création du rôle ${nom}`);
                    res.status(201).json({ message: 'Rôle créé avec succès', id: roleId });
                });
            } else {
                db.commit();
                logAction(req.user?.id, 'create', 'role', roleId, null, { nom }, `Création du rôle ${nom}`);
                res.status(201).json({ message: 'Rôle créé avec succès', id: roleId });
            }
        });
    });
};

// Mettre à jour un rôle
exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { nom, description, pages } = req.body;

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: 'Erreur système' });

        db.query('UPDATE roles SET nom = ?, description = ? WHERE id = ?', [nom, description, id], (err, updateResult) => {
            if (err) {
                db.rollback(() => {});
                return res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle' });
            }

            if (updateResult.affectedRows === 0) {
                db.rollback(() => {});
                return res.status(404).json({ message: 'Rôle non trouvé' });
            }

            // Supprimer les anciennes assignations
            db.query('DELETE FROM role_pages WHERE role_id = ?', [id], (err) => {
                if (err) {
                    db.rollback(() => {});
                    return res.status(500).json({ message: 'Erreur lors de la suppression des anciennes pages' });
                }

                if (pages && pages.length > 0) {
                    const values = pages.map(pageId => [id, pageId]);
                    db.query('INSERT INTO role_pages (role_id, page_id) VALUES ?', [values], async (err) => {
                        if (err) {
                            db.rollback(() => {});
                            return res.status(500).json({ message: 'Erreur lors de la nouvelle assignation' });
                        }
                        db.commit();
                        await logAction(req.user?.id, 'update', 'role', id, null, { nom, pages }, `Mise à jour du rôle ${nom}`);
                        res.status(200).json({ message: 'Rôle mis à jour' });
                    });
                } else {
                    db.commit();
                    logAction(req.user?.id, 'update', 'role', id, null, { nom }, `Mise à jour du rôle ${nom}`);
                    res.status(200).json({ message: 'Rôle mis à jour' });
                }
            });
        });
    });
};

// Supprimer un rôle
exports.deleteRole = async (req, res) => {
    const { id } = req.params;

    // Ne pas supprimer SuperAdmin ou Admin
    if (id == 1 || id == 2) {
        return res.status(403).json({ message: 'Les rôles par défaut ne peuvent pas être supprimés' });
    }

    db.query('DELETE FROM roles WHERE id = ?', [id], async (err, result) => {
        if (err) {
            console.error('Erreur suppression role:', err);
            return res.status(500).json({ message: 'Impossible de supprimer ce rôle. Il est peut-être assigné à des utilisateurs.' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Rôle non trouvé' });
        }

        await logAction(req.user?.id, 'delete', 'role', id, null, null, `Suppression du rôle ID: ${id}`);
        res.status(200).json({ message: 'Rôle supprimé avec succès' });
    });
};
