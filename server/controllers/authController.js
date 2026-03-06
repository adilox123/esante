// controllers/authController.js
const User = require('../models/User');
const Medecin = require('../models/Medecin');
const Patient = require('../models/Patient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

console.log('✅ authController chargé');

const authController = {
  // Inscription
  register: async (req, res) => {
    try {
      console.log("📝 Tentative d'inscription:", req.body.email);
      
      const { nom, prenom, email, role, specialite_id, adresse, telephone, password } = req.body;

      // Validation
      if (!nom || !prenom || !email || !password) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
      }

      // Vérifier si l'utilisateur existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur
      const user = await User.create({
        nom,
        prenom,
        email,
        password: hashedPassword,
        role: role || 'patient'
      });

      // Créer le profil selon le rôle
      if (role === 'medecin') {
        await Medecin.create({
          user_id: user.id,
          specialite_id,
          adresse,
          telephone
        });
      } else if (role === 'patient') {
        await Patient.create({
          user_id: user.id,
          telephone: telephone || ''
        });
      }

      res.status(201).json({
        message: "Inscription réussie",
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error("❌ Erreur register:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Connexion
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Mot de passe incorrect" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'secret_temporaire',
        { expiresIn: '1d' }
      );

      res.json({
        message: "Connexion réussie",
        token,
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role
        }
      });

    } catch (error) {
      console.error("❌ Erreur login:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Récupérer les infos utilisateur
  getUserInfo: async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      res.json(user);

    } catch (error) {
      console.error("❌ Erreur getUserInfo:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authController;