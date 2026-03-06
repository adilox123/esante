// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Vérification que le contrôleur est bien chargé
console.log('✅ paymentRoutes chargé');
console.log('📦 paymentController:', paymentController ? 'OK' : 'NULL');

// Route de test - Vérifie que cette fonction existe bien
router.get('/test', (req, res) => {
  console.log('✅ Route test appelée');
  res.json({ message: 'Route paiement OK' });
});

// ✅ ROUTE POST POUR CRÉER UN PAIEMENT
if (paymentController && typeof paymentController.createPayment === 'function') {
  router.post('/', paymentController.createPayment);
  console.log('✅ Route POST / créée');
} else {
  console.error('❌ paymentController.createPayment n\'est pas une fonction');
}

// Route pour create-intent
router.post('/create-intent', (req, res) => {
  console.log('💰 create-intent appelé');
  console.log('Données reçues:', req.body);
  res.json({ clientSecret: 'mock_' + Date.now() });
});

// Route pour récupérer les paiements d'un patient
if (paymentController && typeof paymentController.getPatientPayments === 'function') {
  router.get('/patient/:patientId', paymentController.getPatientPayments);
}

// Route pour récupérer un paiement par ID
if (paymentController && typeof paymentController.getPaymentById === 'function') {
  router.get('/:id', paymentController.getPaymentById);
}

module.exports = router;