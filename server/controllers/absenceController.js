const Absence = require('../models/Absence');

exports.addAbsence = async (req, res) => {
  try {
    const { medecin_id, date_debut, date_fin, periode } = req.body;

    if (!medecin_id || !date_debut) {
      return res.status(400).json({ message: "Veuillez fournir une date de début." });
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
    
    const message = absencesToCreate.length > 1 
      ? `✅ Période de ${absencesToCreate.length} jours bloquée avec succès !`
      : `✅ Date bloquée avec succès !`;

    res.status(201).json({ message });
  } catch (error) {
    console.error("Erreur Absence:", error);
    res.status(500).json({ error: "Erreur lors de l'enregistrement du congé." });
  }
};