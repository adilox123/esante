const RendezVous = require('../models/RendezVous');
const Patient = require('../models/Patient');
const Medecin = require('../models/Medecin');
const User = require('../models/User');
const Absence = require('../models/Absence');

// ==========================================
// CRÉER UN NOUVEAU RENDEZ-VOUS
// ==========================================
exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, medecin_id, date_rdv, heure_rdv, motif, statut } = req.body;
    if (!patient_id || !medecin_id || !date_rdv || !heure_rdv) {
      return res.status(400).json({ error: "Données manquantes" });
    }
    const rdv = await RendezVous.create({
      patient_id,
      medecin_id,
      date_rdv,
      heure_rdv,
      motif: motif || "Consultation",
      statut: statut || "À venir"
    });
    res.status(201).json({ success: true, id: rdv.id, rendezvous: rdv });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// RÉCUPÉRER LES RDV D'UN MÉDECIN
// ==========================================
// ==========================================
// RÉCUPÉRER LES RDV D'UN MÉDECIN
// ==========================================
// ==========================================
// RÉCUPÉRER LES RDV D'UN MÉDECIN
// ==========================================
exports.getRdvsByMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const rdvs = await RendezVous.findAll({
      where: { medecin_id: medecinId },
      include: [
        {
          model: Patient,
          include: [
            { 
              model: User, 
              as: 'user', // L'alias qui a réparé ton erreur
              attributes: ['nom', 'prenom'] 
            }
          ]
        }
      ],
      order: [['date_rdv', 'ASC']]
    });

    // 🎯 LE SECRET EST ICI : On formate les données pour React !
    const dataFormatee = rdvs.map(rdv => {
      const rdvJson = rdv.toJSON(); // Convertit en objet simple
      
      // On cherche le nom (que Sequelize l'écrive avec ou sans majuscule)
      const userData = rdvJson.Patient?.user || rdvJson.patient?.user || rdvJson.Patient?.User || rdvJson.patient?.User;
      
      const nomComplet = userData ? `${userData.nom} ${userData.prenom || ''}`.trim() : `Patient N°${rdvJson.patient_id}`;

      return {
        ...rdvJson,
        nom_patient: nomComplet // On ajoute cette ligne magique pour React
      };
    });

    res.json(dataFormatee);
  } catch (error) {
    console.error("❌ Erreur getRdvsByMedecin:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// RÉCUPÉRER LES RDV D'UN PATIENT (via patient_id)
// ==========================================
exports.getRdvsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const rdvs = await RendezVous.findAll({
      where: { patient_id: patientId },
      include: [{
        model: Medecin,
        include: [{ model: User, attributes: ['nom', 'prenom'] }]
      }],
      order: [['date_rdv', 'ASC']]
    });
    const dataFormatee = rdvs.map(rdv => ({
      ...rdv.toJSON(),
      nom_medecin: rdv.Medecin?.User ? `Dr. ${rdv.Medecin.User.nom}` : `Médecin N°${rdv.medecin_id}`
    }));
    res.json(dataFormatee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// RÉCUPÉRER LES RDV D'UN PATIENT À PARTIR DE SON USER_ID
// ==========================================
exports.getRdvsByUserPatient = async (req, res) => {
  try {
    const { userId } = req.params;
    const patientEntry = await Patient.findOne({ where: { user_id: userId } });
    if (!patientEntry) return res.status(404).json({ error: "Patient non trouvé" });

    const rdvs = await RendezVous.findAll({
      where: { patient_id: patientEntry.id },
      include: [{
        model: Medecin,
        include: [
          { model: User, attributes: ['nom', 'prenom'] },
          { model: Absence, as: 'absences', required: false }
        ]
      }],
      order: [['date_rdv', 'ASC']]
    });

    const dataFormatee = rdvs.map(rdv => ({
      ...rdv.toJSON(),
      nom_medecin: rdv.Medecin?.User ? `Dr. ${rdv.Medecin.User.nom}` : `Médecin N°${rdv.medecin_id}`,
      absences_medecin: rdv.Medecin?.absences || []
    }));

    res.json(dataFormatee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// METTRE À JOUR LA NOTE SECRÈTE
// ==========================================
exports.updateNoteSecrete = async (req, res) => {
  try {
    const { id } = req.params;
    const { note_secrete } = req.body;
    const rdv = await RendezVous.findByPk(id);
    if (!rdv) return res.status(404).json({ error: "Rendez-vous non trouvé" });
    await rdv.update({ note_secrete });
    res.json({ success: true, message: "✅ Note sauvegardée !" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// SUPPRIMER UN RENDEZ-VOUS
// ==========================================
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await RendezVous.destroy({ where: { id } });
    if (deletedRows === 0) {
      return res.status(404).json({ success: false, message: "Rendez-vous non trouvé." });
    }
    res.json({ success: true, message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// RÉSERVATION DE RDV (optionnel)
// ==========================================
exports.bookAppointment = async (req, res) => {
  try {
    const { patient_id, medecin_id, date_rdv, heure_rdv, motif } = req.body;
    const rdv = await RendezVous.create({
      patient_id,
      medecin_id,
      date_rdv,
      heure_rdv,
      motif: motif || "Consultation",
      statut: "À venir"
    });
    res.status(201).json({ success: true, rdv });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};