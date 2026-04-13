// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('patient', 'medecin', 'admin'),
    defaultValue: 'patient'
  },
  // 🎯 NOUVEAU : Statut de validation pour bloquer les médecins non vérifiés
  statut_validation: {
    type: DataTypes.STRING,
    defaultValue: 'valide'
  },
  // --- AJOUTS POUR CORRIGER L'ERREUR ---
  created_at: {
    type: DataTypes.DATE,
    allowNull: true, // On autorise le null temporairement pour l'ALTER TABLE
    defaultValue: DataTypes.NOW // La date actuelle sera utilisée par défaut
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at', // Mappe le timestamp automatique sur votre colonne
  updatedAt: 'updated_at'
});

module.exports = User;