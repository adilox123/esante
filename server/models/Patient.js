const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Patient = sequelize.define('Patient', {
  // Ces colonnes correspondent à ta structure en base de données
  date_naissance: { type: DataTypes.DATEONLY },
  sexe: { type: DataTypes.ENUM('M', 'F') },
  groupe_sanguin: { type: DataTypes.STRING(5) },
  
  // 🎯 NOUVELLES COLONNES AJOUTÉES ICI
  telephone: { type: DataTypes.STRING(20) },
  adresse: { type: DataTypes.STRING(255) }
}, { 
  tableName: 'patients', 
  timestamps: false 
});

module.exports = Patient;