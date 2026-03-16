const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Document = sequelize.define('Document', {
    nom_original: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // ✅ CHANGEMENT : On utilise 'chemin' au lieu de 'nom_fichier'
    chemin: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'documents',
    timestamps: true // Puisque tu as les colonnes createdAt et updatedAt
});

module.exports = Document;