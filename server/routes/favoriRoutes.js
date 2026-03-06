const express = require('express');
const router = express.Router();
const favoriController = require('../controllers/favoriController');

// Route POST pour Ajouter/Retirer un favori
router.post('/toggle', favoriController.toggleFavori);

// ⚠️ NOUVELLE ROUTE : Obtenir la liste des favoris d'un patient spécifique
router.get('/:patientId', favoriController.getFavorisByPatient);

module.exports = router;