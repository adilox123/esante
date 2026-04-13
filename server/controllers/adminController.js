const db = require('../config/db');

// 1. Récupérer la liste de TOUS les patients (avec leurs détails)
exports.getAllPatients = async (req, res) => {
  try {
    const sql = `
      SELECT 
        u.id, 
        u.nom, 
        u.email, 
        p.telephone, 
        p.groupe_sanguin, 
        p.adresse, 
        p.date_naissance, 
        p.sexe
      FROM users u
      LEFT JOIN patients p ON u.id = p.user_id
      WHERE u.role = 'patient'
    `;
    
    const patients = await db.query(sql, { type: db.QueryTypes.SELECT });
    res.status(200).json(patients);

  } catch (error) {
    console.error("❌ Erreur Admin Patients :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// 2. Récupérer la liste de TOUS les médecins
// 2. Récupérer la liste de TOUS les médecins (avec statut et document)
exports.getAllMedecins = async (req, res) => {
  try {
    const sql = `
      SELECT 
        m.id, 
        m.user_id,
        u.nom, 
        u.prenom,
        u.email, 
        u.statut_validation,
        u.statut_validation,     -- 🎯 Indispensable pour le filtrage Admin
        m.telephone, 
        m.tarif, 
        m.document_preuve,
        m.document_preuve,       -- 🎯 Indispensable pour voir le diplôme
        s.nom AS specialite_nom
      FROM medecins m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN specialites s ON m.specialite_id = s.id
    `;
    
    const medecins = await db.query(sql, { type: db.QueryTypes.SELECT });
    res.status(200).json(medecins);

  } catch (error) {
    console.error("❌ Erreur Admin Medecins :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// 3. Récupérer la liste de TOUS les rendez-vous
exports.getAllRendezvous = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id, 
        CONCAT(r.date_rdv, ' à ', r.heure_rdv) AS date_heure,
        r.statut, 
        r.motif,
        up.nom AS patient_nom,
        um.nom AS medecin_nom,
        s.nom AS specialite_nom
      FROM rendez_vous r
      LEFT JOIN patients p ON r.patient_id = p.id
      LEFT JOIN users up ON p.user_id = up.id
      LEFT JOIN medecins m ON r.medecin_id = m.id
      LEFT JOIN users um ON m.user_id = um.id
      LEFT JOIN specialites s ON m.specialite_id = s.id
      ORDER BY r.date_rdv DESC, r.heure_rdv DESC
    `;
    
    const rendezvous = await db.query(query, { type: db.QueryTypes.SELECT });
    res.status(200).json(rendezvous);
    
  } catch (error) {
    console.error("❌ ERREUR SERVEUR (getAllRendezvous) :", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération des rendez-vous." });
  }
};

// 4. Mettre à jour un patient
exports.updatePatient = async (req, res) => {
  const { id } = req.params;
  const { nom, email, telephone, adresse, groupe_sanguin, sexe, date_naissance } = req.body;

  try {
    console.log("--- Début de la mise à jour ---");

    await db.query(
      "UPDATE users SET nom = ?, email = ? WHERE id = ?",
      { replacements: [nom, email, id], type: db.QueryTypes.UPDATE }
    );

    await db.query(
      "UPDATE patients SET telephone = ?, adresse = ?, groupe_sanguin = ?, sexe = ?, date_naissance = ? WHERE user_id = ?",
      { replacements: [telephone, adresse, groupe_sanguin, sexe, date_naissance, id], type: db.QueryTypes.UPDATE }
    );
    
    console.log("✅ Tables users et patients mises à jour.");

    // INSERTION DU LOG (Admin ID 8 / Table admins ID 2)
    const adminData = await db.query("SELECT id FROM admins WHERE user_id = 8", { type: db.QueryTypes.SELECT });

    if (adminData.length > 0) {
      const adminTableId = adminData[0].id;
      await db.query(
        "INSERT INTO logs_admin (admin_id, action, type_cible, cible_id, details) VALUES (?, ?, ?, ?, ?)",
        {
          replacements: [adminTableId, 'Modification Patient', 'patient', id, `Profil de ${nom} mis à jour (Groupe: ${groupe_sanguin})`],
          type: db.QueryTypes.INSERT
        }
      );
      console.log("✅ Log enregistré dans logs_admin !");
    }

    res.status(200).json({ message: "Succès !" });

  } catch (error) {
    console.error("❌ ERREUR SERVEUR :", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 5. Mettre à jour un médecin
exports.updateMedecin = async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, telephone, adresse, tarif } = req.body;

  try {
    console.log(`--- Début de la mise à jour du médecin ID: ${id} ---`);

    await db.query(
      "UPDATE users SET nom = ?, prenom = ?, email = ? WHERE id = ?",
      { replacements: [nom, prenom, email, id], type: db.QueryTypes.UPDATE }
    );

    await db.query(
      `UPDATE medecins SET telephone = ?, adresse = ?, tarif = ?, specialite_id = 1, updated_at = NOW() WHERE user_id = ?`,
      { replacements: [telephone || '', adresse || '', parseInt(tarif) || 0, id], type: db.QueryTypes.UPDATE }
    );
    
    console.log("✅ Tables users et medecins mises à jour.");

    const adminData = await db.query("SELECT id FROM admins WHERE user_id = 8", { type: db.QueryTypes.SELECT });

    if (adminData.length > 0) {
      const adminTableId = adminData[0].id;
      await db.query(
        "INSERT INTO logs_admin (admin_id, action, type_cible, cible_id, details) VALUES (?, ?, ?, ?, ?)",
        {
          replacements: [adminTableId, 'Modification Médecin', 'medecin', id, `Profil mis à jour (Tarif: ${tarif} DH)`],
          type: db.QueryTypes.INSERT
        }
      );
    }

    res.status(200).json({ message: "Médecin mis à jour avec succès !" });

  } catch (error) {
    console.error("❌ ERREUR SERVEUR (updateMedecin) :", error.message);
    res.status(500).json({ error: "Erreur lors de la modification en base de données" });
  }
};

// 6. Supprimer un médecin (Bulldozer)
exports.deleteMedecin = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`\n--- Début de la suppression BULLDOZER pour ID: ${id} ---`);
    const safeDelete = async (query, params) => {
      try { await db.query(query, { replacements: params, type: db.QueryTypes.DELETE }); } catch (e) {}
    };

    const medecinData = await db.query(
      "SELECT id, user_id FROM medecins WHERE id = ? OR user_id = ?", 
      { replacements: [id, id], type: db.QueryTypes.SELECT }
    );

    if (medecinData.length === 0) {
      await safeDelete("DELETE FROM users WHERE id = ?", [id]);
      return res.status(200).json({ message: "Compte nettoyé avec succès." });
    }

    const idM = medecinData[0].id;
    const actualUserId = medecinData[0].user_id;

    const userToDel = await db.query("SELECT nom, prenom FROM users WHERE id = ?", { replacements: [actualUserId], type: db.QueryTypes.SELECT });
    const nomComplet = userToDel.length > 0 ? `${userToDel[0].nom} ${userToDel[0].prenom || ''}`.trim() : "Médecin Inconnu";

    console.log(`🎯 Cible verrouillée : ${nomComplet}`);

    await safeDelete("DELETE FROM payments WHERE rendez_vous_id IN (SELECT id FROM rendez_vous WHERE medecin_id = ?)", [idM]);
    await safeDelete("DELETE FROM messages WHERE rendez_vous_id IN (SELECT id FROM rendez_vous WHERE medecin_id = ?)", [idM]);
    await safeDelete("DELETE FROM documents WHERE rendez_vous_id IN (SELECT id FROM rendez_vous WHERE medecin_id = ?)", [idM]);
    await safeDelete("DELETE FROM absences WHERE medecin_id = ?", [idM]);
    await safeDelete("DELETE FROM favoris WHERE medecin_id = ?", [idM]);
    await safeDelete("DELETE FROM avis_plateforme WHERE medecin_id = ?", [idM]);
    await safeDelete("DELETE FROM rendez_vous WHERE medecin_id = ?", [idM]);
    await safeDelete("DELETE FROM medecins WHERE id = ?", [idM]);
    await safeDelete("DELETE FROM messages WHERE expediteur_id = ? OR destinataire_id = ?", [actualUserId, actualUserId]);
    await safeDelete("DELETE FROM documents WHERE user_id = ?", [actualUserId]);
    
    await db.query("DELETE FROM users WHERE id = ?", { replacements: [actualUserId], type: db.QueryTypes.DELETE });

    res.status(200).json({ message: "Médecin supprimé avec succès !" });

  } catch (error) {
    console.error("❌ ERREUR FATALE SERVEUR :", error.message || error);
    res.status(500).json({ error: "La base de données bloque la suppression." });
  }
};

// 7. Supprimer un patient (Bulldozer)
exports.deletePatient = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`\n--- Début de la suppression BULLDOZER pour Patient ID: ${id} ---`);
    const safeDelete = async (query, params) => {
      try { await db.query(query, { replacements: params, type: db.QueryTypes.DELETE }); } catch (e) {}
    };

    const userToDel = await db.query("SELECT id, nom, prenom, role FROM users WHERE id = ?", { replacements: [id], type: db.QueryTypes.SELECT });

    if (userToDel.length === 0) {
      await safeDelete("DELETE FROM patients WHERE user_id = ?", [id]);
      return res.status(200).json({ message: "Patient introuvable ou déjà nettoyé." });
    }

    const nomComplet = `${userToDel[0].nom} ${userToDel[0].prenom || ''}`.trim();
    const role = userToDel[0].role;

    if (role === 'admin' || role === 'super_admin') {
      return res.status(200).json({ message: "Profil patient effacé, mais le compte Administrateur a été conservé par sécurité !" });
    }

    const patientData = await db.query("SELECT id FROM patients WHERE user_id = ?", { replacements: [id], type: db.QueryTypes.SELECT });

    if (patientData.length > 0) {
      const idP = patientData[0].id;
      await safeDelete("DELETE FROM payments WHERE rendez_vous_id IN (SELECT id FROM rendez_vous WHERE patient_id = ?)", [idP]);
      await safeDelete("DELETE FROM documents WHERE patient_id = ?", [idP]);
      await safeDelete("DELETE FROM rendez_vous WHERE patient_id = ?", [idP]);
      await safeDelete("DELETE FROM patients WHERE id = ?", [idP]);
    }

    await safeDelete("DELETE FROM messages WHERE expediteur_id = ? OR destinataire_id = ?", [id, id]);
    await db.query("DELETE FROM users WHERE id = ?", { replacements: [id], type: db.QueryTypes.DELETE });

    res.status(200).json({ message: "Patient supprimé avec succès !" });

  } catch (error) {
    console.error("❌ ERREUR FATALE SERVEUR :", error.message || error);
    res.status(500).json({ error: "La base de données bloque la suppression." });
  }
};

// ==========================================
// 8. VALIDER / REFUSER L'INSCRIPTION D'UN MÉDECIN
// ==========================================
exports.validerMedecin = async (req, res) => {
  const { id } = req.params;
  const { statut_validation } = req.body; 

  try {
    if (statut_validation !== 'valide' && statut_validation !== 'rejete') {
      return res.status(400).json({ error: "Statut invalide. Utilisez 'valide' ou 'rejete'." });
    }

    const [result] = await db.query(
      "UPDATE users SET statut_validation = ? WHERE id = ?",
      { replacements: [statut_validation, id], type: db.QueryTypes.UPDATE }
    );

    res.status(200).json({ message: `Le compte du médecin est maintenant ${statut_validation} !` });

  } catch (error) {
    console.error("❌ ERREUR SERVEUR (validerMedecin) :", error);
    res.status(500).json({ error: "Impossible de changer le statut dans la base de données." });
  }
};