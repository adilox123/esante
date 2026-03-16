// routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const DocumentModel = require('../models/Document');

// GET - Récupérer tous les documents d'un patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const documents = await DocumentModel.findAll({
      where: { patient_id: patientId },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, documents });
  } catch (error) {
    console.error("❌ Erreur récupération documents:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Télécharger un document (si besoin)
router.get('/download/:id', async (req, res) => {
  try {
    const document = await DocumentModel.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, error: "Document non trouvé" });
    }
    const filePath = path.join(__dirname, '../uploads', document.chemin);
    res.download(filePath, document.nom_original);
  } catch (error) {
    console.error("❌ Erreur téléchargement:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;