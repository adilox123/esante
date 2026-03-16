// models/index.js
const User = require('./User');
const Patient = require('./Patient');
const Medecin = require('./Medecin');
const Specialite = require('./Specialite');
const RendezVous = require('./RendezVous');
const Message = require('./Message');
const Payment = require('./Payment'); 
const Document = require('./Document');
const Absence = require('./Absence'); // ← IMPORT ABSENCE

console.log('✅ Modèles chargés:', {
  User: !!User,
  Patient: !!Patient,
  Medecin: !!Medecin,
  Specialite: !!Specialite,
  RendezVous: !!RendezVous,
  Message: !!Message,
  Payment: !!Payment,
  Document: !!Document,
  Absence: !!Absence // ← Vérifier Absence
});

// --- Relations Messages ---
Message.belongsTo(User, { 
  foreignKey: 'expediteur_id', 
  as: 'expediteur' 
});
User.hasMany(Message, { 
  foreignKey: 'expediteur_id' 
});

Message.belongsTo(RendezVous, { 
  foreignKey: 'rendez_vous_id', 
  as: 'rendez_vous' 
});
RendezVous.hasMany(Message, { 
  foreignKey: 'rendez_vous_id', 
  as: 'messages' 
});

// --- Relations User / Patient / Medecin ---
User.hasOne(Patient, { foreignKey: 'user_id', as: 'patient' });
Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Medecin, { foreignKey: 'user_id' });
Medecin.belongsTo(User, { foreignKey: 'user_id' });

// --- Relations Specialite ---
Medecin.belongsTo(Specialite, { foreignKey: 'specialite_id', as: 'specialite' });
Specialite.hasMany(Medecin, { foreignKey: 'specialite_id', as: 'medecins' });

// --- Relations RendezVous ---
RendezVous.belongsTo(Patient, { foreignKey: 'patient_id' });
Patient.hasMany(RendezVous, { foreignKey: 'patient_id' });

RendezVous.belongsTo(Medecin, { foreignKey: 'medecin_id' });
Medecin.hasMany(RendezVous, { foreignKey: 'medecin_id' });

// --- Relations Absence ---
Medecin.hasMany(Absence, { foreignKey: 'medecin_id', as: 'absences' });
Absence.belongsTo(Medecin, { foreignKey: 'medecin_id' });

// --- Relations Payment ---
Payment.belongsTo(Patient, { foreignKey: 'patient_id' });
Payment.belongsTo(Medecin, { foreignKey: 'medecin_id' });
Payment.belongsTo(RendezVous, { foreignKey: 'rendezvous_id' });

// --- Relations Patient - Document ---
Patient.hasMany(Document, { 
  foreignKey: 'patient_id', 
  as: 'documents' 
});
Document.belongsTo(Patient, { 
  foreignKey: 'patient_id', 
  as: 'patient' 
});

module.exports = {
  User,
  Patient,
  Medecin,
  Specialite,
  RendezVous,
  Message,
  Payment,
  Document,
  Absence // ← EXPORTER Absence
};