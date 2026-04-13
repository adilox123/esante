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
    console.log("📥 Données reçues :", req.body);
    console.log("📂 Fichier reçu :", req.file);
    
    const t = await sequelize.transaction(); 
    
    try {
      const { 
        nom, prenom, email, role, specialite_id, adresse, telephone, password, 
        date_naissance, tarif, sexe, groupe_sanguin 
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

      // 🎯 NOUVEAU : On définit le statut selon le rôle (Médecin = en attente)
      const statutValidation = role === 'medecin' ? 'en_attente' : 'valide';

      // 4. CRÉATION DE L'UTILISATEUR
      const user = await User.create({
        nom,
        prenom,
        email,
        password: hashedPassword,
        role: role || 'patient',
        statut_validation: statutValidation // 👈 Ajout du statut
      }, { transaction: t });

      // 5. CRÉATION DU PROFIL (ID SYNCHRONISÉ)
      if (user.role === 'medecin') {
        
        // 🎯 NOUVEAU : On récupère le chemin du fichier Multer (s'il existe)
        // On remplace les \ de Windows par des / pour que ça soit propre dans la base
        const documentPath = req.file ? req.file.path.replace(/\\/g, '/') : null;

        await Medecin.create({
          id: user.id,          // Synchronisation automatique de l'ID
          user_id: user.id,     // Lien de clé étrangère
          specialite_id,
          adresse: adresse || '',
          telephone: telephone || '',
          tarif: tarif || 0,
          document_preuve: documentPath // 👈 Ajout du document dans la BD
        }, { transaction: t });
        
      } else {
        // Profil patient
        await Patient.create({
          id: user.id,
          user_id: user.id,
          telephone: telephone || '',
          adresse: adresse || '',
          date_naissance: date_naissance || null,
          sexe: sexe || null,
          groupe_sanguin: groupe_sanguin || null
        }, { transaction: t });
      }

      // Si tout est OK, on valide les changements
      await t.commit();

      res.status(201).json({
        message: user.role === 'medecin' 
          ? "Inscription réussie ! Votre dossier est en cours d'examen par notre équipe." 
          : "Inscription réussie et profils synchronisés",
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
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

      // 🎯 NOUVEAU : Le "Videur" pour les médecins non validés
      if (user.role === 'medecin') {
        if (user.statut_validation === 'en_attente') {
          return res.status(403).json({ message: "Votre compte est en cours d'examen par l'administration. Veuillez patienter." });
        }
        if (user.statut_validation === 'rejete') {
          return res.status(403).json({ message: "Désolé, votre inscription a été refusée par l'administration." });
        }
      }

      // Si tout est bon, on génère le token
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