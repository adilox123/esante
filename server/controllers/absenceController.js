// 🎯 Utilise l'import global pour éviter les erreurs de redéclaration ou d'initialisation
const { Absence } = require('../models');

// 1. Ajouter des absences
exports.addAbsence = async (req, res) => {
  try {
    const { medecin_id, date_debut, date_fin, periode } = req.body;

    if (!medecin_id || !date_debut) {
      return res.status(400).json({ success: false, message: "Données manquantes." });
    }

    let currentDate = new Date(date_debut);
    let endDate = new Date(date_fin || date_debut);
    let absencesToCreate = [];

    while (currentDate <= endDate) {
      absencesToCreate.push({
        medecin_id,
        date_absence: currentDate.toISOString().split('T')[0],
        periode
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    await Absence.bulkCreate(absencesToCreate);
    res.status(201).json({ success: true, message: "Absences enregistrées !" });
  } catch (error) {
    console.error("Erreur addAbsence:", error);
    res.status(500).json({ success: false, error: "Erreur lors de l'enregistrement." });
  }
};

// 2. Récupérer les absences
exports.getAbsencesByMedecin = async (req, res) => {
  try {
    const medecinId = req.params.id;
    const absences = await Absence.findAll({
      where: { medecin_id: medecinId },
      order: [['date_absence', 'ASC']]
    });

    res.status(200).json({ success: true, absences });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Supprimer une absence
exports.deleteAbsence = async (req, res) => {
  try {
    const { id } = req.params; 
    
    // 💡 Vérification : l'id doit être celui de la table 'absences'
    const result = await Absence.destroy({
      where: { id: id }
    });

    if (result) {
      res.status(200).json({ success: true, message: "Supprimée !" });
    } else {
      res.status(404).json({ success: false, message: "Absence non trouvée en BDD." });
    }
  } catch (error) {
    console.error("❌ Erreur serveur suppression:", error);
    res.status(500).json({ success: false, error: "Erreur serveur." });
  }
};