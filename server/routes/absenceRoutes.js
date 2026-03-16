const express = require('express');
const router = express.Router();
const absenceController = require('../controllers/absenceController');

// Route POST pour ajouter une absence
router.post('/', absenceController.addAbsence);

// AJOUTE CETTE LIGNE : Route GET pour récupérer les absences d'un médecin spécifique
router.get('/:id', absenceController.getAbsencesByMedecin);
router.delete('/:id', absenceController.deleteAbsence);

module.exports = router;