// controllers/paymentController.js
console.log('✅ paymentController chargé - MODE DÉBOGAGE MAXIMAL');

const { Payment } = require('../models');
const sequelize = require('../config/db');

const paymentController = {
  createPayment: async (req, res) => {
    console.log("\n" + "=".repeat(60));
    console.log("🔥 createPayment APPELLÉ 🔥");
    console.log("=".repeat(60));
    
    console.log("📦 req.body reçu:", JSON.stringify(req.body, null, 2));
    console.log("📦 req.headers:", JSON.stringify(req.headers, null, 2));
    
    try {
      // Vérifier la connexion à la base de données
      console.log("🔍 Test de connexion BDD...");
      await sequelize.authenticate();
      console.log("✅ Connexion BDD OK");
      
      // Afficher les colonnes de la table
      const tableInfo = await sequelize.getQueryInterface().describeTable('payments');
      console.log("📊 Structure de la table payments:", tableInfo);
      
      const {
        patient_id,
        medecin_id,
        amount,
        method,
        card_last4,
        card_brand,
        paypal_email,
        appointment_date,
        appointment_time
      } = req.body;

      console.log("📝 Données extraites:", {
        patient_id,
        medecin_id,
        amount,
        method
      });

      // Validation
      if (!patient_id) console.log("⚠️ patient_id manquant");
      if (!medecin_id) console.log("⚠️ medecin_id manquant");
      if (!amount) console.log("⚠️ amount manquant");
      if (!method) console.log("⚠️ method manquant");

      if (!patient_id || !medecin_id || !amount || !method) {
        console.log("❌ Validation échouée - données manquantes");
        return res.status(400).json({ 
          error: "Données manquantes",
          required: ["patient_id", "medecin_id", "amount", "method"],
          received: req.body
        });
      }

      // Désactiver les contraintes
      console.log("🔓 Désactivation des contraintes...");
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      console.log("✅ Contraintes désactivées");

      // Générer un ID de transaction
      const transaction_id = 'PAY_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8).toUpperCase();
      console.log("🆔 Transaction ID généré:", transaction_id);

      // Créer le paiement
      console.log("💾 Tentative de création du paiement...");
      
      const paymentData = {
        patient_id: parseInt(patient_id),
        medecin_id: parseInt(medecin_id),
        amount: parseFloat(amount),
        method,
        status: 'completed',
        transaction_id,
        card_last4: card_last4 || null,
        card_brand: card_brand || null,
        paypal_email: paypal_email || null,
        appointment_date: appointment_date || null,
        appointment_time: appointment_time || null,
        payment_date: new Date()
      };
      
      console.log("📦 Données pour création:", paymentData);
      
      const payment = await Payment.create(paymentData);
      
      console.log("✅ Paiement créé avec ID:", payment.id);
      console.log("📊 Transaction:", transaction_id);

      // Réactiver les contraintes
      console.log("🔒 Réactivation des contraintes...");
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log("✅ Contraintes réactivées");

      res.status(201).json({
        success: true,
        message: "Paiement enregistré avec succès",
        payment: {
          id: payment.id,
          transaction_id: payment.transaction_id
        }
      });

    } catch (error) {
      console.error("\n❌❌❌ ERREUR CATASTROPHIQUE ❌❌❌");
      console.error("Message:", error.message);
      console.error("Name:", error.name);
      console.error("Stack:", error.stack);
      
      if (error.parent) {
        console.error("\n📌 Erreur MySQL:");
        console.error("- Code:", error.parent.code);
        console.error("- Errno:", error.parent.errno);
        console.error("- SQL State:", error.parent.sqlState);
        console.error("- SQL Message:", error.parent.sqlMessage);
        console.error("- SQL:", error.parent.sql);
      }
      
      if (error.original) {
        console.error("\n📌 Erreur originale:", error.original);
      }
      
      // Réactiver les contraintes
      try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log("✅ Contraintes réactivées (après erreur)");
      } catch (e) {
        console.error("❌ Erreur réactivation contraintes:", e);
      }
      
      // Renvoyer une erreur détaillée
      res.status(500).json({ 
        error: "Erreur lors de l'enregistrement du paiement",
        message: error.message,
        sqlMessage: error.parent?.sqlMessage,
        details: error.toString()
      });
    }
  },

  getPatientPayments: async (req, res) => {
    try {
      const { patientId } = req.params;
      const payments = await Payment.findAll({
        where: { patient_id: patientId },
        order: [['created_at', 'DESC']]
      });
      res.json({ success: true, payments });
    } catch (error) {
      console.error("❌ Erreur getPatientPayments:", error);
      res.status(500).json({ error: error.message });
    }
  },

  getPaymentById: async (req, res) => {
    try {
      const payment = await Payment.findByPk(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: "Paiement non trouvé" });
      }
      res.json({ success: true, payment });
    } catch (error) {
      console.error("❌ Erreur getPaymentById:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = paymentController;