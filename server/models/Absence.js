const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Absence = sequelize.define('Absence', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  medecin_id: { type: DataTypes.INTEGER, allowNull: false },
  date_absence: { type: DataTypes.DATEONLY, allowNull: false },
  periode: { type: DataTypes.STRING, defaultValue: 'Journée entière' }
}, {
  tableName: 'absences',
  timestamps: false
});

module.exports = Absence;