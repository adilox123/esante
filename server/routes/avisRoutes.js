const express = require('express');
const router = express.Router();
const avisController = require('../controllers/avisController'); // Le chemin vers ton fichier

router.post('/ajouter', avisController.ajouterAvis);

module.exports = router;