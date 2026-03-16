// controllers/patientController.js

console.log('✅ patientController chargé avec succès !');

const { Patient, User, RendezVous, Medecin } = require('../models');

const patientController = {
  // Récupérer le profil d'un patient par son user_id
  getProfile: async (req, res) => {
    try {
      const userId = req.query.userId;
      
      console.log("🔍 getProfile appelé avec userId:", userId);
      
      if (!userId || userId === 'undefined') {
        return res.status(400).json({ message: "ID utilisateur manquant" });
      }

      // Chercher le patient avec son user_id
      const patient = await Patient.findOne({
        where: { user_id: userId },
        include: [
          { 
            model: User, 
            as: 'user',
            attributes: ['nom', 'prenom', 'email'] 
          }
        ]
      });

      if (!patient) {
        console.log("❌ Aucun patient trouvé pour user_id:", userId);
        
        // Option: créer un profil patient s'il n'existe pas
        const newPatient = await Patient.create({
          user_id: userId,
          telephone: '',
          adresse: '',
          date_naissance: null,
          groupe_sanguin: null,
          ville: '',
          code_postal: ''
        });
        
        console.log("✅ Nouveau patient créé avec ID:", newPatient.id);
        
        // Récupérer l'utilisateur associé
        const user = await User.findByPk(userId, {
          attributes: ['nom', 'prenom', 'email']
        });
        
        return res.json({
          id: newPatient.id,
          user_id: newPatient.user_id,
          user: user,
          telephone: newPatient.telephone,
          adresse: newPatient.adresse,
          date_naissance: newPatient.date_naissance,
          sexe: newPatient.sexe,
          groupe_sanguin: newPatient.groupe_sanguin,
          ville: newPatient.ville,
          code_postal: newPatient.code_postal
        });
      }

      console.log("✅ Patient trouvé avec ID:", patient.id);
      
      // 🎯 CORRECTION : On structure explicitement la réponse
      return res.json({
        id: patient.id,
        user_id: patient.user_id,
        user: patient.user,
        telephone: patient.telephone,
        adresse: patient.adresse,
        date_naissance: patient.date_naissance,
        sexe: patient.sexe,
        groupe_sanguin: patient.groupe_sanguin,
        ville: patient.ville,
        code_postal: patient.code_postal
      });
      
    } catch (error) {
      console.error("❌ Erreur getProfile:", error);
      return res.status(500).json({ 
        error: error.message,
        stack: error.stack 
      });
    }
  },

  // Récupérer un patient par son ID
  getPatientById: async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log("🔍 getPatientById avec ID:", id);

      // Cherche d'abord par ID direct
      let patient = await Patient.findByPk(id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['nom', 'prenom', 'email']
        }]
      });

      // Si pas trouvé, cherche par user_id
      if (!patient) {
        console.log("⚠️ Patient non trouvé par id, recherche par user_id:", id);
        patient = await Patient.findOne({
          where: { user_id: id },
          include: [{
            model: User,
            as: 'user',
            attributes: ['nom', 'prenom', 'email']
          }]
        });
      }

      if (!patient) {
        console.log("❌ Aucun patient trouvé pour:", id);
        return res.status(404).json({ error: "Patient non trouvé" });
      }

      const patientData = {
        id: patient.id,
        nom: patient.user?.nom || '',
        prenom: patient.user?.prenom || '',
        email: patient.user?.email || '',
        telephone: patient.telephone || '',
        adresse: patient.adresse || '',
        date_naissance: patient.date_naissance || '',
        groupe_sanguin: patient.groupe_sanguin || '',
        ville: patient.ville || '',
        code_postal: patient.code_postal || ''
      };

      console.log("✅ Patient trouvé:", patientData);
      return res.json({ success: true, patient: patientData });
      
    } catch (error) {
      console.error("❌ Erreur getPatientById:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // Mettre à jour un patient
  updatePatient: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      console.log("📦 updatePatient pour ID:", id);
      console.log("Données reçues:", updateData);

      // Cherche d'abord par ID direct
      let patient = await Patient.findByPk(id);

      // Si pas trouvé, cherche par user_id
      if (!patient) {
        console.log("⚠️ Patient non trouvé par id, recherche par user_id:", id);
        patient = await Patient.findOne({
          where: { user_id: id }
        });
      }

      if (!patient) {
        console.log("❌ Patient non trouvé pour ID:", id);
        return res.status(404).json({ error: "Patient non trouvé" });
      }
      
      // Mettre à jour les champs du patient
      await patient.update({
        telephone: updateData.telephone || '',
        adresse: updateData.adresse || '',
        date_naissance: updateData.date_naissance || null,
        groupe_sanguin: updateData.groupe_sanguin === 'Non renseigné' ? null : updateData.groupe_sanguin,
        ville: updateData.ville || '',
        code_postal: updateData.code_postal || ''
      });
      
      // Mettre à jour l'utilisateur associé
      if (updateData.nom || updateData.prenom || updateData.email) {
        await User.update({
          nom: updateData.nom,
          prenom: updateData.prenom,
          email: updateData.email
        }, {
          where: { id: patient.user_id }
        });
      }
      
      console.log("✅ Patient mis à jour avec succès");
      
      return res.json({
        success: true,
        message: "Informations mises à jour avec succès"
      });
      
    } catch (error) {
      console.error("❌ Erreur updatePatient:", error);
      return res.status(500).json({ error: error.message });
    }
  }
};

module.exports = patientController;