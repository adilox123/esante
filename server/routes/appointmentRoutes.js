const express = require('express');
const multer = require('multer');
const path = require('path'); 
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const Patient = require('../models/Patient');
const DocumentModel = require('../models/Document'); 

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, `doc-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// ==========================================
// ROUTES DE RÉCUPÉRATION (GET)
// ==========================================

// ✅ AJOUTÉ : La route pour l'espace patient d'Adil (avec absences)
router.get('/user-patient/:userId', appointmentController.getRdvsByUserPatient);

// Route pour l'agenda du médecin (Dr. Salaheddine)
router.get('/medecin/:medecinId', appointmentController.getRdvsByMedecin);

// Route historique simple
router.get('/patient/:patientId', appointmentController.getRdvsByPatient);


// ==========================================
// ROUTES D'ACTION (POST, PUT, DELETE)
// ==========================================

router.post('/', appointmentController.createAppointment);
router.post('/book', appointmentController.bookAppointment);
router.put('/:id/note', appointmentController.updateNoteSecrete);
router.delete('/:id', appointmentController.deleteAppointment);
router.put('/:id/statut', appointmentController.updateRdvStatus);

// ==========================================
// ROUTE UPLOAD MÉDICAL
// ==========================================
router.post('/upload-medical/:patientId', upload.single('file'), async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!req.file) return res.status(400).json({ success: false, message: "Aucun fichier reçu" });

    const fileName = req.file.filename; 
    const originalName = req.file.originalname;

    await Patient.update(
      { document_medical: fileName }, 
      { where: { id: patientId } }
    );

    await DocumentModel.create({
      patient_id: patientId, 
      nom_original: originalName,
      chemin: fileName, 
      type: 'medical'
    });

    res.json({ success: true, message: "Document enregistré !", fileName: fileName });
  } catch (error) {
    console.error("❌ Erreur upload :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;