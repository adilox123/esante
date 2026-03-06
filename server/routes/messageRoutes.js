const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Route pour enregistrer un nouveau message (POST)
router.post('/', async (req, res) => {
  try {
    const { contenu, expediteur_id, rendez_vous_id } = req.body;
    
    // Validation simple
    if (!contenu || !expediteur_id || !rendez_vous_id) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    const newMessage = await Message.create({
      contenu,
      expediteur_id,
      rendez_vous_id
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du message:", error);
    res.status(500).json({ error: "Erreur serveur lors de l'envoi du message." });
  }
});

// Route pour récupérer l'historique d'un rendez-vous (GET)
router.get('/:rendezVousId', async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { rendez_vous_id: req.params.rendezVousId },
      order: [['createdAt', 'ASC']] // Les plus vieux en haut, les plus récents en bas
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Impossible de récupérer l'historique." });
  }
});

module.exports = router;