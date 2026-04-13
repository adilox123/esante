const RendezVous = require('../models/RendezVous');
const Patient = require('../models/Patient');
const Medecin = require('../models/Medecin');
const User = require('../models/User');
const Absence = require('../models/Absence');
const db = require('../config/db');

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
exports.getRdvsByMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const rdvs = await RendezVous.findAll({
      where: { medecin_id: medecinId },
      include: [
        {
          model: Patient,
          attributes: ['telephone'], // 👈 AJOUTÉ : On récupère le téléphone ici
          include: [
            { 
              model: User, 
              as: 'user', 
              attributes: ['nom', 'prenom'] 
            }
          ]
        }
      ],
      order: [['date_rdv', 'ASC']]
    });

    const dataFormatee = rdvs.map(rdv => {
      const rdvJson = rdv.toJSON();
      const userData = rdvJson.Patient?.user || rdvJson.patient?.user || rdvJson.Patient?.User || rdvJson.patient?.User;
      
      const nomComplet = userData ? `${userData.nom} ${userData.prenom || ''}`.trim() : `Patient N°${rdvJson.patient_id}`;

      return {
        ...rdvJson,
        nom_patient: nomComplet,
        // 🎯 AJOUTÉ : On envoie le téléphone au frontend pour le bouton "Appeler"
        telephone_patient: rdvJson.Patient?.telephone || rdvJson.patient?.telephone || '' 
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
// MÉDECIN : CONFIRMER, ANNULER OU ABSENCE (NON HONORÉ)
// ==========================================
exports.updateRdvStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { statut } = req.body;

    // 1. Mettre à jour le statut du rendez-vous
    await db.query(`UPDATE rendez_vous SET statut = :statut WHERE id = :id`, {
      replacements: { statut, id },
      type: db.QueryTypes.UPDATE
    });

    // 🚨 LOGIQUE DE BAN AUTOMATIQUE (Si statut === 'non honoré')
    if (statut === 'non honoré') {
        const rdv = await RendezVous.findByPk(id);
        if (rdv) {
            // Compter les absences du patient
            const count = await RendezVous.count({
                where: { patient_id: rdv.patient_id, statut: 'non honoré' }
            });

            // Si 3 absences ou plus, on suspend l'utilisateur
            if (count >= 3) {
                const patient = await Patient.findByPk(rdv.patient_id);
                if (patient) {
                    await User.update(
                        { statut_validation: 'suspendu' }, 
                        { where: { id: patient.user_id } }
                    );
                    console.log(`🚫 Utilisateur ${patient.user_id} suspendu pour 3 absences.`);
                }
            }
        }
    }

    // 2. Récupérer les infos pour la notification
    const rdvInfo = await db.query(
      `SELECT p.user_id, um.nom as medecin_nom, r.motif, r.date_rdv, r.heure_rdv
       FROM rendez_vous r 
       JOIN patients p ON r.patient_id = p.id 
       JOIN medecins m ON r.medecin_id = m.id
       JOIN users um ON m.user_id = um.id
       WHERE r.id = :id`,
      { replacements: { id }, type: db.QueryTypes.SELECT }
    );

    if (rdvInfo.length > 0) {
      const info = rdvInfo[0];
      
      let message = "";
      let type = "info";

      if (statut === 'Confirmé') {
          message = `✅ Votre rendez-vous avec le Dr. ${info.medecin_nom} a été confirmé. Vous pouvez maintenant procéder au paiement.`;
          type = 'success';
      } else if (statut === 'Annulé') {
          message = `❌ Désolé, le Dr. ${info.medecin_nom} a dû annuler votre rendez-vous.`;
          type = 'danger';
      } else if (statut === 'non honoré') {
          message = `⚠️ Vous avez été marqué comme absent pour votre RDV avec le Dr. ${info.medecin_nom}. Attention, après 3 absences, votre compte sera suspendu.`;
          type = 'warning';
      }

      await db.query(
        `INSERT INTO notifications (user_id, appointment_id, message, type) 
         VALUES (:userId, :rdvId, :msg, :type)`,
        { replacements: { 
            userId: info.user_id, 
            rdvId: id, 
            msg: message, 
            type: type 
        }}
      );
    }

    res.status(200).json({ success: true, message: "Statut mis à jour et patient notifié." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};