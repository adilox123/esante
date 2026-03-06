const RendezVous = require('../models/RendezVous');
const Patient = require('../models/Patient');
const Medecin = require('../models/Medecin');
const User = require('../models/User');

// ==========================================
// 🔗 DÉCLARATION DES JOINTURES (Relations SQL)
// ==========================================
RendezVous.belongsTo(Patient, { foreignKey: 'patient_id' });
Patient.belongsTo(User, { foreignKey: 'user_id' });
RendezVous.belongsTo(Medecin, { foreignKey: 'medecin_id' });
Medecin.belongsTo(User, { foreignKey: 'user_id' });

// ==========================================
// ✅ 0. CRÉER UN NOUVEAU RENDEZ-VOUS
// ==========================================
exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, medecin_id, date_rdv, heure_rdv, motif, statut } = req.body;
    if (!patient_id || !medecin_id || !date_rdv || !heure_rdv) {
      return res.status(400).json({ error: "Données manquantes" });
    }
    const rdv = await RendezVous.create({
      patient_id, medecin_id, date_rdv, heure_rdv,
      motif: motif || "Consultation",
      statut: statut || "À venir"
    });
    res.status(201).json({ success: true, id: rdv.id, rendezvous: rdv });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// ✅ 1. RÉCUPÉRER LES RDV D'UN MÉDECIN (UserID -> MedecinID)
// ==========================================
exports.getRdvsByMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params; // Reçoit l'ID 133
    const medecinTableEntry = await Medecin.findOne({ where: { user_id: medecinId } });

    if (!medecinTableEntry) {
      return res.status(404).json({ error: "Profil médecin introuvable." });
    }

    const rdvs = await RendezVous.findAll({ 
      where: { medecin_id: medecinTableEntry.id }, 
      include: [{
        model: Patient,
        include: [{ model: User, attributes: ['nom', 'prenom'] }]
      }]
    });
    res.json(rdvs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// ✅ 2. RÉCUPÉRER LES RDV D'UN PATIENT
// ==========================================
exports.getRdvsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const rdvs = await RendezVous.findAll({ 
      where: { patient_id: patientId },
      include: [{
        model: Medecin,
        include: [{ model: User, attributes: ['nom', 'prenom'] }]
      }]
    });
    res.json(rdvs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// ✅ 3. METTRE À JOUR LA NOTE SECRÈTE
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
// ✅ 4. RÉSERVATION DE RDV
// ==========================================
exports.bookAppointment = async (req, res) => {
  try {
    const { patient_id, medecin_id, date_rdv, heure_rdv, motif } = req.body;
    const rdv = await RendezVous.create({
      patient_id, medecin_id, date_rdv, heure_rdv,
      motif: motif || "Consultation",
      statut: "À venir"
    });
    res.status(201).json({ success: true, rdv });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};