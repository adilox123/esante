const { Message, User } = require('../models');

const messageController = {
  // 📥 Récupérer l'historique d'un chat
  getMessagesByRdv: async (req, res) => {
    try {
      const { rdvId } = req.params;
      
      const messages = await Message.findAll({
        where: { rendez_vous_id: rdvId },
        include: [{
          model: User,
          as: 'expediteur', // Assurez-vous que cet alias existe dans votre modèle Message
          attributes: ['nom', 'prenom']
        }],
        order: [['createdAt', 'ASC']] // Ordre chronologique style WhatsApp
      });
      
      res.json(messages);
    } catch (error) {
      console.error("❌ Erreur getMessagesByRdv:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // 📤 Envoyer un nouveau message
  sendMessage: async (req, res) => {
    try {
      const { contenu, expediteur_id, rendez_vous_id } = req.body;

      // Création de l'entrée dans la table messages
      const newMessage = await Message.create({
        contenu,
        expediteur_id,   // ID de l'utilisateur qui envoie (1 ou 2)
        rendez_vous_id,
        lu: false
      });

      // On récupère le message avec les infos de l'expéditeur pour le renvoyer au frontend
      const messageComplete = await Message.findByPk(newMessage.id, {
        include: [{ model: User, as: 'expediteur', attributes: ['nom', 'prenom'] }]
      });

      res.status(201).json(messageComplete);
    } catch (error) {
      console.error("❌ Erreur sendMessage:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = messageController;