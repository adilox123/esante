// controllers/medecinController.js
const { Medecin, User, Specialite } = require('../models');

console.log('✅ medecinController.js chargé');

const medecinController = {
  // Récupérer tous les médecins (pour la liste)
  getAllMedecins: async (req, res) => {
    try {
      console.log("📋 Récupération de tous les médecins");
      
      const medecins = await Medecin.findAll({
        include: [
          { 
            model: User, 
            attributes: ['nom', 'prenom', 'email'] 
          },
          { 
            model: Specialite, 
            as: 'specialite', 
            attributes: ['id', 'nom'] 
          }
        ]
      });
      
      console.log(`✅ ${medecins.length} médecins trouvés`);
      res.json(medecins);
      
    } catch (error) {
      console.error("❌ Erreur getAllMedecins:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Récupérer le profil d'un médecin par user_id
  getProfile: async (req, res) => {
    try {
      const userId = req.query.userId;
      
      console.log("🔍 getProfile médecin pour userId:", userId);
      
      if (!userId) {
        return res.status(400).json({ message: "userId manquant" });
      }

      const user = await User.findByPk(userId, {
        attributes: ['id', 'nom', 'prenom', 'email']
      });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const medecin = await Medecin.findOne({
        where: { user_id: userId },
        include: [
          { 
            model: Specialite, 
            as: 'specialite', 
            attributes: ['id', 'nom'] 
          }
        ]
      });

      if (!medecin) {
        return res.status(404).json({ message: "Médecin non trouvé" });
      }

      const response = {
        id: medecin.id,
        user_id: medecin.user_id,
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email
        },
        specialite: medecin.specialite || { nom: 'Non spécifié' },
        telephone: medecin.telephone || '',
        adresse: medecin.adresse || '',
        ville: medecin.ville || '',
        code_postal: medecin.code_postal || ''
      };

      console.log("✅ Médecin trouvé:", response.user.nom);
      res.json(response);
      
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
      
      console.log("📦 updateMedecin pour ID:", id);

      const medecin = await Medecin.findOne({ 
        where: { user_id: id } 
      });
      
      if (!medecin) {
        return res.status(404).json({ message: "Médecin non trouvé" });
      }

      await medecin.update({
        telephone: updateData.telephone,
        adresse: updateData.adresse,
        ville: updateData.ville,
        code_postal: updateData.code_postal
      });

      await User.update({
        nom: updateData.nom,
        prenom: updateData.prenom,
        email: updateData.email
      }, {
        where: { id: medecin.user_id }
      });

      console.log("✅ Médecin mis à jour");
      res.json({ success: true, message: "Mise à jour réussie" });
      
    } catch (error) {
      console.error("❌ Erreur updateMedecin:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Récupérer un médecin par son ID
  getMedecinById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const medecin = await Medecin.findByPk(id, {
        include: [
          { model: User, attributes: ['nom', 'prenom', 'email'] },
          { model: Specialite, as: 'specialite', attributes: ['nom'] }
        ]
      });
      
      if (!medecin) {
        return res.status(404).json({ message: "Médecin non trouvé" });
      }
      
      res.json(medecin);
    } catch (error) {
      console.error("❌ Erreur getMedecinById:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = medecinController;