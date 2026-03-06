const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Favori = sequelize.define('Favori', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  patient_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  medecin_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  }
}, {
  timestamps: false
});

module.exports = Favori;