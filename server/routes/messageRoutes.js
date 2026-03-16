// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { Message } = require('../models');
const sequelize = require('../config/db');

// ==========================================
// POST - Enregistrer un nouveau message
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { contenu, expediteur_id, rendez_vous_id } = req.body;
    
    // Validation
    if (!contenu || !expediteur_id || !rendez_vous_id) {
      return res.status(400).json({ 
        success: false,
        error: "Tous les champs sont obligatoires." 
      });
    }

    const newMessage = await Message.create({
      contenu,
      expediteur_id,
      rendez_vous_id,
      lu: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Récupérer le message avec le nom de l'expéditeur
    const [result] = await sequelize.query(
      `SELECT m.*, u.nom as nom_expediteur 
       FROM messages m
       JOIN users u ON m.expediteur_id = u.id
       WHERE m.id = ?`,
      { replacements: [newMessage.id] }
    );

    // Émettre via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`room_${rendez_vous_id}`).emit('receive_message', result[0]);
    }

    res.status(201).json({
      success: true,
      message: result[0]
    });

  } catch (error) {
    console.error("❌ Erreur POST message:", error);
    res.status(500).json({ 
      success: false,
      error: "Erreur serveur lors de l'envoi du message." 
    });
  }
});

// ==========================================
// GET - Récupérer l'historique d'un rendez-vous
// ==========================================
router.get('/:rendezVousId', async (req, res) => {
  try {
    const messages = await sequelize.query(
      `SELECT m.*, u.nom as nom_expediteur 
       FROM messages m
       JOIN users u ON m.expediteur_id = u.id
       WHERE m.rendez_vous_id = ?
       ORDER BY m.createdAt ASC`,
      { replacements: [req.params.rendezVousId] }
    );

    res.json({
      success: true,
      messages: messages[0]
    });

  } catch (error) {
    console.error("❌ Erreur GET messages:", error);
    res.status(500).json({ 
      success: false,
      error: "Impossible de récupérer l'historique." 
    });
  }
});

// ==========================================
// DELETE - Supprimer un message
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer le message avant suppression (pour avoir le rendez_vous_id)
    const [message] = await sequelize.query(
      'SELECT * FROM messages WHERE id = ?',
      { replacements: [id] }
    );

    if (!message || message.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Message non trouvé" 
      });
    }

    // Supprimer le message
    await sequelize.query(
      'DELETE FROM messages WHERE id = ?',
      { replacements: [id] }
    );

    // Notifier les clients via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`room_${message[0].rendez_vous_id}`).emit('message_deleted', {
        id: parseInt(id),
        rendez_vous_id: message[0].rendez_vous_id
      });
    }

    res.json({ 
      success: true,
      message: "Message supprimé avec succès" 
    });

  } catch (error) {
    console.error("❌ Erreur DELETE message:", error);
    res.status(500).json({ 
      success: false,
      error: "Erreur lors de la suppression" 
    });
  }
});

// ==========================================
// PUT - Marquer un message comme lu
// ==========================================
router.put('/:id/lu', async (req, res) => {
  try {
    const { id } = req.params;

    await sequelize.query(
      'UPDATE messages SET lu = 1 WHERE id = ?',
      { replacements: [id] }
    );

    res.json({ 
      success: true,
      message: "Message marqué comme lu" 
    });

  } catch (error) {
    console.error("❌ Erreur PUT lu:", error);
    res.status(500).json({ 
      success: false,
      error: "Erreur lors du marquage" 
    });
  }
});

module.exports = router;