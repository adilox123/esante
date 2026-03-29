const db = require('../config/db');

exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `SELECT * FROM notifications WHERE user_id = :userId ORDER BY created_at DESC LIMIT 10`;
    
    const notifications = await db.query(query, {
      replacements: { userId },
      type: db.QueryTypes.SELECT
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Erreur récup notifications:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Optionnel : Marquer comme lu
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE notifications SET is_read = TRUE WHERE id = :id`, {
      replacements: { id },
      type: db.QueryTypes.UPDATE
    });
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json(error); }
};