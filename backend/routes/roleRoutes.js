const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const isAdmin = (req, res, next) => {
    // Only allow SuperAdmin (role_id 1) or Admin (role_id 2)
    // Adjust logic depending on how role or role_id is structured in req.user
    if (req.user && (req.user.role === 'SuperAdmin' || req.user.role === 'Admin' || req.user.role_id === 1 || req.user.role_id === 2)) {
        next();
    } else {
        res.status(403).json({ message: 'Accès non autorisé' });
    }
};

router.get('/', isAdmin, roleController.getRoles);
router.get('/pages', isAdmin, roleController.getPages);
router.post('/', isAdmin, roleController.createRole);
router.put('/:id', isAdmin, roleController.updateRole);
router.delete('/:id', isAdmin, roleController.deleteRole);

module.exports = router;
