// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// ✅ Route pour créer un nouveau rendez-vous (UTILISÉ PAR Payment.jsx)
router.post('/', appointmentController.createAppointment);

// Route pour obtenir les RDV d'un médecin spécifique
router.get('/medecin/:medecinId', appointmentController.getRdvsByMedecin);

// Route pour obtenir les RDV d'un patient spécifique
router.get('/patient/:patientId', appointmentController.getRdvsByPatient);

// Route pour modifier la note secrète d'un RDV
router.put('/:id/note', appointmentController.updateNoteSecrete);

// (Optionnel : Route pour réserver un RDV)
router.post('/book', appointmentController.bookAppointment);

// routes/appointmentRoutes.js


module.exports = router;