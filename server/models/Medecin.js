// models/Medecin.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Medecin = sequelize.define('Medecin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  specialite_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'specialites',
      key: 'id'
    }
  },
  telephone: {
    type: DataTypes.STRING
  },
  adresse: {
    type: DataTypes.STRING
  },
  ville: {
    type: DataTypes.STRING
  },
  code_postal: {
    type: DataTypes.STRING
  }
  // 🎯 NOUVEAU : Ajout de la colonne tarif pour faire le lien avec MySQL
  ,tarif: {
    type: DataTypes.INTEGER,
    defaultValue: 200 // Un tarif par défaut au cas où
  }


}, {
  tableName: 'medecins',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Medecin;