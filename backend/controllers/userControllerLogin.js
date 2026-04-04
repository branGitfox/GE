require('dotenv').config();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // JWT pour générer les tokens sécurisés

const SECRET_KEY = process.env.JWT_SECRET || '8219';


// Connexion d'un utilisateur
exports.loginUser = async (req, res) => {
    const { email, mdp } = req.body;
  
    if (!email || !mdp) {
      return res.status(400).send({ message: 'Veuillez fournir le email et le mot de passe.' });
    }
  
    try {
      // Vérifier si le email existe
      const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
      db.query(checkUserQuery, [email], async (err, result) => {
        if (err) {
          console.error('Erreur lors de la vérification de l\'utilisateur:', err);
          return res.status(500).send('Erreur interne du serveur');
        }
  
        if (result.length === 0) {
          return res.status(404).send({ message: 'Utilisateur introuvable.' });
        }
  
        const user = result[0];
  
        // Vérifier si l'utilisateur est validé
        if (!user.validated) {
          return res.status(403).send({ message: 'Votre compte n\'est pas encore validé par l\'administrateur.' });
        }
  
        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(mdp, user.mdp);
        if (!isMatch) {
          return res.status(401).send({ message: 'Mot de passe incorrect.' });
        }
  
        // Récupérer les permissions (pages autorisées)
        const permQuery = `
          SELECT p.chemin 
          FROM pages p
          JOIN role_pages rp ON p.id = rp.page_id
          WHERE rp.role_id = ?
        `;
        
        db.query(permQuery, [user.role_id], (err, perms) => {
          if (err) {
            console.error('Erreur permissions:', err);
            return res.status(500).send('Erreur lors de la récupération des permissions');
          }

          const permissions = perms.map(p => p.chemin);

          // Générer un token JWT (Expire dans 1 an pour rester connecté)
          const token = jwt.sign({ id: user.id, role: user.role, role_id: user.role_id }, SECRET_KEY, { expiresIn: '365d' });
          
          res.status(200).send({
            message: 'Connexion réussie',
            token,
            user: {
              id: user.id,
              nom: user.nom,
              prenom: user.prenom,
              role: user.role,
              role_id: user.role_id,
              permissions,
              image: user.image
            },
          });
        });
      });
    } catch (err) {
      res.status(500).send('Erreur interne du serveur');
    }
  };
    