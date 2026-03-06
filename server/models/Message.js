const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // ⚠️ Ajustez le chemin selon votre projet

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  contenu: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true // Le message ne peut pas être vide
    }
  },
  expediteur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Pointe vers votre table users
      key: 'id'
    }
  },
  rendez_vous_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rendez_vous', // Pointe vers votre table rendez_vous
      key: 'id'
    }
  },
  lu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // Pratique pour afficher "Message non lu"
  }
}, {
  tableName: 'messages',
  timestamps: true // Sequelize créera automatiquement 'createdAt' (heure d'envoi)
});

module.exports = Message;