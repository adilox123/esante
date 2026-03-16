const User = require('../models/User');
const Medecin = require('../models/Medecin');
const Patient = require('../models/Patient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/db'); // Import indispensable pour la transaction

console.log('✅ authController avec synchronisation d\'ID chargé');

const authController = {
  // ==========================================
  // INSCRIPTION (SÉCURISÉE & SYNCHRONISÉE)
  // ==========================================
  register: async (req, res) => {
    // On démarre une transaction pour garantir l'intégrité des données
    const t = await sequelize.transaction(); 
    
    try {
      // 🎯 MODIFICATION ICI : On ajoute les nouveaux champs envoyés par ton étape 2 du Frontend
      const { 
        nom, prenom, email, role, specialite_id, adresse, telephone, password, 
        date_naissance, sexe, groupe_sanguin 
      } = req.body;

      // 1. Validation de base
      if (!nom || !prenom || !email || !password) {
        await t.rollback();
        return res.status(400).json({ message: "Tous les champs sont requis" });
      }

      // 2. Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ where: { email } }, { transaction: t });
      if (existingUser) {
        await t.rollback();
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      // 3. Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. CRÉATION DE L'UTILISATEUR
      const user = await User.create({
        nom,
        prenom,
        email,
        password: hashedPassword,
        role: role || 'patient'
      }, { transaction: t });

      // 5. CRÉATION DU PROFIL (ID SYNCHRONISÉ)
      // On force l'ID du profil pour qu'il soit identique à l'ID de l'User
      if (user.role === 'medecin') {
        await Medecin.create({
          id: user.id,          // ✅ Synchronisation automatique de l'ID
          user_id: user.id,     // Lien de clé étrangère
          specialite_id,
          adresse: adresse || '',
          telephone: telephone || ''
        }, { transaction: t });
      } else {
        // Par défaut, on crée un profil patient
        // 🎯 MODIFICATION ICI : On enregistre toutes les infos médicales dans la BD !
        await Patient.create({
          id: user.id,          // ✅ Synchronisation automatique de l'ID
          user_id: user.id,     // Lien de clé étrangère
          telephone: telephone || '',
          adresse: adresse || '',
          date_naissance: date_naissance || null,
          sexe: sexe || null,
          groupe_sanguin: groupe_sanguin || null
        }, { transaction: t });
      }

      // Si tout est OK, on valide les changements dans la base
      await t.commit();

      res.status(201).json({
        message: "Inscription réussie et profils synchronisés",
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      // En cas d'erreur (ex: problème BDD), on annule tout
      if (t) await t.rollback();
      console.error("❌ Erreur register:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // ==========================================
  // CONNEXION
  // ==========================================
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

  // ==========================================
  // RÉCUPÉRER INFOS UTILISATEUR
  // ==========================================
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