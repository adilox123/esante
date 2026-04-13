const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Ces routes seront accessibles via : /api/admin/...
router.get('/patients', adminController.getAllPatients);
router.get('/medecins', adminController.getAllMedecins);
// Ajoute cette ligne avec tes autres routes admin :
router.get('/rendezvous', adminController.getAllRendezvous);
router.put('/patients/:id', adminController.updatePatient);
router.put('/medecins/:id', adminController.updateMedecin);
router.delete('/medecins/:id', adminController.deleteMedecin);
router.delete('/patients/:id', adminController.deletePatient);
router.put('/valider-medecin/:id', adminController.validerMedecin);

module.exports = router;