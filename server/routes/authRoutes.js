// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

console.log('✅ authRoutes chargé');
console.log('📦 Fonctions disponibles:', Object.keys(authController));

// Routes d'authentification
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/user/:id', authController.getUserInfo);

module.exports = router;