// models/index.js
const User = require('./User');
const Patient = require('./Patient');
const Medecin = require('./Medecin');
const Specialite = require('./Specialite');
const RendezVous = require('./RendezVous');
const Message = require('./Message');
const Payment = require('./Payment'); // ← AJOUTER CETTE LIGNE

console.log('✅ Modèles chargés:', {
  User: !!User,
  Patient: !!Patient,
  Medecin: !!Medecin,
  Specialite: !!Specialite,
  RendezVous: !!RendezVous,
  Message: !!Message,
  Payment: !!Payment  // ← Vérifier que Payment est chargé
});

// Un message appartient à un expéditeur (User)
Message.belongsTo(User, { 
  foreignKey: 'expediteur_id', 
  as: 'expediteur' 
});
User.hasMany(Message, { 
  foreignKey: 'expediteur_id' 
});

// Un message appartient à un rendez-vous
Message.belongsTo(RendezVous, { 
  foreignKey: 'rendez_vous_id', 
  as: 'rendez_vous' 
});
// Un rendez-vous peut contenir plusieurs messages
RendezVous.hasMany(Message, { 
  foreignKey: 'rendez_vous_id', 
  as: 'messages' 
});

// Relations User - Patient
User.hasOne(Patient, { foreignKey: 'user_id', as: 'patient' });
Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Relations User - Medecin (SANS ALIAS pour User)
User.hasOne(Medecin, { foreignKey: 'user_id' });
Medecin.belongsTo(User, { foreignKey: 'user_id' });

// Relations Medecin - Specialite (AVEC ALIAS)
Medecin.belongsTo(Specialite, { foreignKey: 'specialite_id', as: 'specialite' });
Specialite.hasMany(Medecin, { foreignKey: 'specialite_id', as: 'medecins' });

// Relations RendezVous
RendezVous.belongsTo(Patient, { foreignKey: 'patient_id' });
RendezVous.belongsTo(Medecin, { foreignKey: 'medecin_id' });

// Relations Payment (optionnel)
Payment.belongsTo(Patient, { foreignKey: 'patient_id' });
Payment.belongsTo(Medecin, { foreignKey: 'medecin_id' });
Payment.belongsTo(RendezVous, { foreignKey: 'rendezvous_id' });

module.exports = {
  User,
  Patient,
  Medecin,
  Specialite,
  RendezVous,
  Message,
  Payment  // ← EXPORTER Payment AUSSI
};