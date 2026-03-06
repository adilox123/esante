// models/Payment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'completed'
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rendezvous_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  medecin_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  transaction_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  card_last4: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  card_brand: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  paypal_email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  appointment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  appointment_time: {
    type: DataTypes.STRING,
    allowNull: true
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false // Important : ne pas ajouter de underscores automatiques
});

module.exports = Payment;