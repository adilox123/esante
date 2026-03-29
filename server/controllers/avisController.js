const db = require('../config/db');

exports.ajouterAvis = async (req, res) => {
  try {
    const { patientId, note, commentaire } = req.body;

    // Petite vérification de sécurité
    if (!patientId || !note) {
      return res.status(400).json({ error: "Le patient et la note sont obligatoires." });
    }

    // Requête SQL pour insérer l'avis
    const sqlInsert = `
      INSERT INTO avis_plateforme (patient_id, note, commentaire) 
      VALUES (?, ?, ?)
    `;
    
    await db.query(sqlInsert, {
      replacements: [patientId, note, commentaire || null], // Si le commentaire est vide, on met null
      type: db.QueryTypes.INSERT
    });

    res.status(201).json({ message: "Merci ! Votre avis a bien été enregistré." });

  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement de l'avis :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};