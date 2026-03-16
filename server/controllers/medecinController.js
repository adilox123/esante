// controllers/medecinController.js - Version adaptée au frontend

const { Medecin, User, Specialite, Absence } = require('../models');

const medecinController = {
  // ✅ Récupérer tous les médecins - Format adapté au frontend
  getAllMedecins: async (req, res) => {
    try {
      console.log("📋 Récupération de tous les médecins");
      
      const medecins = await Medecin.findAll({
        include: [
          { 
            model: User, 
            attributes: ['nom', 'prenom', 'email'],
            required: false
          },
          { 
            model: Specialite, 
            as: 'specialite', 
            attributes: ['id', 'nom'],
            required: false
          },
          { 
            model: Absence,
            as: 'absences', // Assure-toi que c'est bien l'alias défini dans tes modèles (sinon essaie sans la ligne 'as')
            required: false
          }
        ]
      });
      
      console.log(`✅ ${medecins.length} médecins trouvés`);
      
      // Formater exactement comme l'attend le frontend
      const formattedMedecins = medecins.map(medecin => ({
        id: medecin.id,
        User: {
          nom: medecin.User?.nom || 'Médecin',
          prenom: medecin.User?.prenom || '',
          email: medecin.User?.email || ''
        },
        Specialite: medecin.specialite ? {
          id: medecin.specialite.id,
          nom: medecin.specialite.nom
        } : { nom: 'Médecin Généraliste' },
        adresse: medecin.adresse || '',
        telephone: medecin.telephone || '',
        // 🎯 LE MIRACLE EST LÀ : On n'oublie plus d'envoyer le tarif au Frontend !
        tarif: medecin.tarif ,
        // 🎯 ON ENVOIE LES ABSENCES AU FRONTEND :
        absences: medecin.absences || []
      }));
      
      console.log("✅ Données formatées pour le frontend");
      res.json(formattedMedecins);
      
    } catch (error) {
      console.error("❌ Erreur getAllMedecins:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Récupérer le profil d'un médecin par user_id
  getProfile: async (req, res) => {
    try {
      const userId = req.query.userId;
      
      if (!userId) {
        return res.status(400).json({ message: "userId manquant" });
      }

      const medecin = await Medecin.findOne({
        where: { user_id: userId },
        include: [
          { model: User, attributes: ['nom', 'prenom', 'email'] },
          { model: Specialite, as: 'specialite', attributes: ['id', 'nom'] }
        ]
      });

      if (!medecin) {
        return res.status(404).json({ message: "Médecin non trouvé" });
      }

      res.json(medecin);
      
    } catch (error) {
      console.error("❌ Erreur getProfile:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Mettre à jour un médecin
  updateMedecin: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const medecin = await Medecin.findOne({ where: { user_id: id } });
      
      if (!medecin) {
        return res.status(404).json({ message: "Médecin non trouvé" });
      }

      await medecin.update({
        telephone: updateData.telephone,
        adresse: updateData.adresse,
        ville: updateData.ville,
        code_postal: updateData.code_postal,
        // On permet aussi la mise à jour du tarif si un jour on ajoute un panel Admin
        tarif: updateData.tarif !== undefined ? updateData.tarif : medecin.tarif
      });

      res.json({ success: true, message: "Mise à jour réussie" });
      
    } catch (error) {
      console.error("❌ Erreur updateMedecin:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = medecinController;