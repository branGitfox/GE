const db = require('../db');
const { logAction } = require('../utils/logger');


  // Récupérer tous les utilisateurs
  exports.getUsers = (req, res) => {
    const query = `
      SELECT u.id, u.nom, u.prenom, u.email, r.nom as role, u.role_id, u.image, u.created_at, u.validated 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
    `;
  
    db.query(query, (err, result) => {
      if (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        return res.status(500).send('Erreur interne du serveur');
      }
      res.status(200).json(result);
    });
  };
  
  // suppression  de liste
  // Suppression d'un utilisateur
  exports.deleteUser = async (req, res) => {
    const { id } = req.params;
  
    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    db.query(deleteQuery, [id], async (err, result) => {
      if (err) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', err);
        return res.status(500).send('Erreur interne du serveur');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('Utilisateur non trouvé');
      }
      await logAction(req.user?.id, 'delete', 'user', id, null, null, `Suppression de l'utilisateur ID: ${id}`);
      res.status(200).send({ message: 'Utilisateur supprimé avec succès' });
    });
  };
  
  
  // Mettre à jour les informations d'un utilisateur
  exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, role_id } = req.body;
  
    const updateQuery = `
      UPDATE users
      SET nom = ?, prenom = ?, email = ?, role_id = ?
      WHERE id = ?
    `;
  
    db.query(updateQuery, [nom, prenom, email, role_id, id], async (err, result) => {
      if (err) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
        return res.status(500).send('Erreur interne du serveur');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('Utilisateur non trouvé');
      }
      await logAction(req.user?.id, 'update', 'user', id, null, req.body, `Mise à jour de l'utilisateur: ${nom} ${prenom}`);
      res.status(200).send({ message: 'Utilisateur mis à jour avec succès' });
    });
  };
  