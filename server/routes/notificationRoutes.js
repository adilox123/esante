const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notificationController');

router.get('/user/:userId', notifController.getUserNotifications);
router.put('/:id/read', notifController.markAsRead);

module.exports = router;