// routes/patientRoutes.js - VERSION SIMPLIFIÉE
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

console.log('✅ patientRoutes chargé - Version simplifiée');

// Routes essentielles uniquement
router.get('/profile', patientController.getProfile);
router.get('/:id', patientController.getPatientById);
router.put('/:id', patientController.updatePatient);

module.exports = router;