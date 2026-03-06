// routes/medecinRoutes.js
const express = require('express');
const router = express.Router();
const medecinController = require('../controllers/medecinController');

console.log('✅ medecinRoutes chargé');

// Route pour récupérer tous les médecins
router.get('/', medecinController.getAllMedecins);

// Route pour récupérer le profil par userId
router.get('/profile', medecinController.getProfile);

// Route pour mettre à jour un médecin
router.put('/:id', medecinController.updateMedecin);

module.exports = router;