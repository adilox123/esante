const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RendezVous = sequelize.define('RendezVous', {
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
  },
  date_rdv: { 
    type: DataTypes.DATEONLY, 
    allowNull: false 
  },
  heure_rdv: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  motif: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  statut: { 
    type: DataTypes.STRING, 
    defaultValue: 'À venir' 
  },
  note_secrete: { 
    type: DataTypes.TEXT, 
    allowNull: true
  }
}, {
  tableName: 'rendez_vous',
  timestamps: false // Empêche l'erreur des dates 0000-00-00
});

module.exports = RendezVous;