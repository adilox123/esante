const express = require('express');
const router = express.Router();
const absenceController = require('../controllers/absenceController');

// Route POST pour ajouter une absence
router.post('/', absenceController.addAbsence);

module.exports = router;