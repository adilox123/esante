const db = require('../config/db');

// 1. Récupérer la liste de TOUS les patients
// 1. Récupérer la liste de TOUS les patients (avec leurs détails)
exports.getAllPatients = async (req, res) => {
  try {
    // 🎯 On joint la table 'users' et la table 'patients'
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
    
    // Utilise ta méthode habituelle pour exécuter la requête (db.query ou sequelize)
    const patients = await db.query(sql, { type: db.QueryTypes.SELECT });
    res.status(200).json(patients);

  } catch (error) {
    console.error("❌ Erreur Admin Patients :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// 2. Récupérer la liste de TOUS les médecins
exports.getAllMedecins = async (req, res) => {
  try {
    const sql = `
      SELECT 
        m.id, 
        u.nom AS nom_du_docteur,   -- 🎯 On change le nom ici : nom_du_docteur
        u.email, 
        m.telephone, 
        m.tarif, 
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

// 3. Récupérer la liste de TOUS les rendez-vous (Supervision Admin)
// ==========================================
// RÉCUPÉRER TOUS LES RENDEZ-VOUS (Sécurisé)
// ==========================================
exports.getAllRendezvous = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id, 
        CONCAT(r.date_rdv, ' à ', r.heure_rdv) AS date_heure, /* 🎯 LA FUSION MAGIQUE EST ICI */
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
    
    // Remplacer db.query par sequelize.query si tu utilises l'instance sequelize directement
    const rendezvous = await db.query(query, { type: db.QueryTypes.SELECT });
    res.status(200).json(rendezvous);
    
  } catch (error) {
    console.error("❌ ERREUR SERVEUR (getAllRendezvous) :", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération des rendez-vous." });
  }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params; // L'ID du patient ou médecin à supprimer
    const adminUserId = req.user.id; // L'ID de l'admin connecté (via ton Token JWT)

    try {
        // 1. On récupère d'abord l'ID de l'admin dans la table 'admins'
        const adminData = await db.query("SELECT id FROM admins WHERE user_id = ?", [adminUserId]);
        const adminId = adminData[0].id;

        // 2. Action principale : Supprimer l'utilisateur
        await db.query("DELETE FROM users WHERE id = ?", [id]);

        // 3. 🎯 L'ENREGISTREMENT DU LOG
        const logSql = `
            INSERT INTO logs_admin (admin_id, action, type_cible, cible_id, details) 
            VALUES (?, 'Suppression définitive', 'patient', ?, 'L\'admin a supprimé ce compte depuis le dashboard')
        `;
        await db.query(logSql, [adminId, id]);

        res.json({ message: "Utilisateur supprimé et action enregistrée !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updatePatient = async (req, res) => {
  const { id } = req.params; // ID du patient à modifier
  const { nom, email, telephone, adresse, groupe_sanguin, sexe, date_naissance } = req.body;

  try {
    console.log("--- Début de la mise à jour ---");

    // 1. Mise à jour de la table 'users'
    await db.query(
      "UPDATE users SET nom = ?, email = ? WHERE id = ?",
      { replacements: [nom, email, id], type: db.QueryTypes.UPDATE }
    );

    // 2. Mise à jour de la table 'patients'
    await db.query(
      "UPDATE patients SET telephone = ?, adresse = ?, groupe_sanguin = ?, sexe = ?, date_naissance = ? WHERE user_id = ?",
      { replacements: [telephone, adresse, groupe_sanguin, sexe, date_naissance, id], type: db.QueryTypes.UPDATE }
    );
    
    console.log("✅ Tables users et patients mises à jour.");

    // 3. 🎯 INSERTION DU LOG
    // On cherche l'ID de Ziad (User 8) dans la table 'admins'
    const adminData = await db.query("SELECT id FROM admins WHERE user_id = 8", {
      type: db.QueryTypes.SELECT
    });

    if (adminData.length > 0) {
      const adminTableId = adminData[0].id; // Ce sera 2 selon ta photo
      console.log("ID Admin trouvé :", adminTableId);

      await db.query(
        "INSERT INTO logs_admin (admin_id, action, type_cible, cible_id, details) VALUES (?, ?, ?, ?, ?)",
        {
          replacements: [
            adminTableId, 
            'Modification Patient', 
            'patient', 
            id, 
            `Profil de ${nom} mis à jour (Groupe: ${groupe_sanguin})`
          ],
          type: db.QueryTypes.INSERT
        }
      );
      console.log("✅ Log enregistré dans logs_admin !");
    } else {
      console.log("❌ Erreur : Ziad n'est pas trouvé dans la table admins.");
    }

    res.status(200).json({ message: "Succès !" });

  } catch (error) {
    console.error("❌ ERREUR SERVEUR :", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateMedecin = async (req, res) => {
  const { id } = req.params; // L'ID du médecin à modifier (c'est le user_id)
  
  // On récupère les données envoyées par React
  const { nom, prenom, email, telephone, adresse, tarif } = req.body;

  try {
    console.log(`--- Début de la mise à jour du médecin ID: ${id} ---`);
    console.log("Données reçues:", req.body);

    // 1. Mise à jour de la table 'users'
    await db.query(
      "UPDATE users SET nom = ?, prenom = ?, email = ? WHERE id = ?",
      {
        replacements: [nom, prenom, email, id],
        type: db.QueryTypes.UPDATE
      }
    );

    // 2. Mise à jour de la table 'medecins'
    // 🎯 AJOUT DE updated_at = NOW() POUR NE PAS FAIRE PLANTER MYSQL !
    await db.query(
      `UPDATE medecins 
       SET telephone = ?, adresse = ?, tarif = ?, specialite_id = 1, updated_at = NOW()
       WHERE user_id = ?`,
      {
        // On s'assure que tarif est bien un chiffre
        replacements: [telephone || '', adresse || '', parseInt(tarif) || 0, id],
        type: db.QueryTypes.UPDATE
      }
    );
    
    console.log("✅ Tables users et medecins mises à jour.");

    // 3. 🎯 INSERTION DU LOG (Traçabilité)
    const adminData = await db.query("SELECT id FROM admins WHERE user_id = 8", {
      type: db.QueryTypes.SELECT
    });

    if (adminData.length > 0) {
      const adminTableId = adminData[0].id;
      await db.query(
        "INSERT INTO logs_admin (admin_id, action, type_cible, cible_id, details) VALUES (?, ?, ?, ?, ?)",
        {
          replacements: [
            adminTableId, 
            'Modification Médecin', 
            'medecin', 
            id, 
            `Profil mis à jour (Tarif: ${tarif} DH)`
          ],
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


// ==========================================
// SUPPRIMER UN MÉDECIN (Le Grand Nettoyage)
// ==========================================
// ==========================================
// SUPPRIMER UN MÉDECIN (BULLDOZER INTELLIGENT 🚜🧠)
// ==========================================
exports.deleteMedecin = async (req, res) => {
  const { id } = req.params; // L'ID envoyé par React (peut être user_id ou medecin_id)

  try {
    console.log(`\n--- Début de la suppression BULLDOZER pour ID: ${id} ---`);

    const safeDelete = async (query, params) => {
      try { await db.query(query, { replacements: params, type: db.QueryTypes.DELETE }); } catch (e) {}
    };

    // 1. 🎯 RECHERCHE INTELLIGENTE : On trouve le médecin peu importe l'ID envoyé
    const medecinData = await db.query(
      "SELECT id, user_id FROM medecins WHERE id = ? OR user_id = ?", 
      { replacements: [id, id], type: db.QueryTypes.SELECT }
    );

    if (medecinData.length === 0) {
      // S'il n'est plus dans 'medecins', on tente un nettoyage de secours
      await safeDelete("DELETE FROM users WHERE id = ?", [id]);
      return res.status(200).json({ message: "Compte nettoyé avec succès." });
    }

    const idM = medecinData[0].id; // Son ID dans medecins (ex: 2)
    const actualUserId = medecinData[0].user_id; // Son ID dans users (ex: 3)

    // 2. Récupérer le nom
    const userToDel = await db.query("SELECT nom, prenom FROM users WHERE id = ?", { replacements: [actualUserId], type: db.QueryTypes.SELECT });
    const nomComplet = userToDel.length > 0 ? `${userToDel[0].nom} ${userToDel[0].prenom || ''}`.trim() : "Médecin Inconnu";

    console.log(`🎯 Cible verrouillée : ${nomComplet} (Medecin ID: ${idM}, User ID: ${actualUserId})`);

    console.log("🧹 Étape 1 : Nettoyage des paiements, messages et documents liés aux RDV...");
    await safeDelete("DELETE FROM payments WHERE rendez_vous_id IN (SELECT id FROM rendez_vous WHERE medecin_id = ?)", [idM]);
    await safeDelete("DELETE FROM messages WHERE rendez_vous_id IN (SELECT id FROM rendez_vous WHERE medecin_id = ?)", [idM]);
    await safeDelete("DELETE FROM documents WHERE rendez_vous_id IN (SELECT id FROM rendez_vous WHERE medecin_id = ?)", [idM]);
    
    console.log("🧹 Étape 2 : Nettoyage des absences, favoris, avis et RDV...");
    await safeDelete("DELETE FROM absences WHERE medecin_id = ?", [idM]);
    await safeDelete("DELETE FROM favoris WHERE medecin_id = ?", [idM]);
    await safeDelete("DELETE FROM avis_plateforme WHERE medecin_id = ?", [idM]);
    await safeDelete("DELETE FROM rendez_vous WHERE medecin_id = ?", [idM]);
    
    console.log("🧹 Étape 3 : Suppression du profil 'medecins'...");
    await safeDelete("DELETE FROM medecins WHERE id = ?", [idM]);

    console.log("🧹 Étape 4 : Nettoyage des messages et documents de l'utilisateur...");
    await safeDelete("DELETE FROM messages WHERE expediteur_id = ? OR destinataire_id = ?", [actualUserId, actualUserId]);
    await safeDelete("DELETE FROM documents WHERE user_id = ?", [actualUserId]);
    
    console.log("🧨 Étape 5 : Suppression finale du compte utilisateur...");
    await db.query("DELETE FROM users WHERE id = ?", { replacements: [actualUserId], type: db.QueryTypes.DELETE });

    console.log(`✅ VICTOIRE ! Dr. ${nomComplet} a été totalement effacé !`);

    res.status(200).json({ message: "Médecin supprimé avec succès !" });

  } catch (error) {
    console.error("❌ ERREUR FATALE SERVEUR :", error.message || error);
    res.status(500).json({ error: "La base de données bloque la suppression.", details: error.message });
  }
};
// ==========================================
// SUPPRIMER UN PATIENT
// ==========================================
// ==========================================
// SUPPRIMER UN PATIENT (BULLDOZER INTELLIGENT 🚜🧠)
// ==========================================
exports.deletePatient = async (req, res) => {
  const { id } = req.params; // L'ID envoyé par React (user_id)

  try {
    console.log(`\n--- Début de la suppression BULLDOZER pour Patient ID: ${id} ---`);

    const safeDelete = async (query, params) => {
      try { await db.query(query, { replacements: params, type: db.QueryTypes.DELETE }); } catch (e) {}
    };

    // 1. Vérifier qui est cet utilisateur et récupérer son RÔLE
    const userToDel = await db.query("SELECT id, nom, prenom, role FROM users WHERE id = ?", {
      replacements: [id],
      type: db.QueryTypes.SELECT
    });

    if (userToDel.length === 0) {
      // S'il n'est plus dans 'users', on nettoie juste la table 'patients' au cas où
      await safeDelete("DELETE FROM patients WHERE user_id = ?", [id]);
      return res.status(200).json({ message: "Patient introuvable ou déjà nettoyé." });
    }

    const nomComplet = `${userToDel[0].nom} ${userToDel[0].prenom || ''}`.trim();
    const role = userToDel[0].role; // 'admin', 'patient', etc.

    console.log(`🎯 Cible verrouillée : ${nomComplet} (Rôle: ${role})`);

    // 2. Trouver l'ID officiel du patient dans la table 'patients'
    const patientData = await db.query("SELECT id FROM patients WHERE user_id = ?", {
      replacements: [id], type: db.QueryTypes.SELECT
    });

    if (patientData.length > 0) {
      const idP = patientData[0].id;
      
      console.log("🧹 Étape 1 : Nettoyage des rendez-vous et documents...");
      await safeDelete("DELETE FROM payments WHERE rendez_vous_id IN (SELECT id FROM rendez_vous WHERE patient_id = ?)", [idP]);
      await safeDelete("DELETE FROM documents WHERE patient_id = ?", [idP]);
      await safeDelete("DELETE FROM rendez_vous WHERE patient_id = ?", [idP]);
      
      console.log("🧹 Étape 2 : Suppression du profil dans 'patients'...");
      await safeDelete("DELETE FROM patients WHERE id = ?", [idP]);
    }

    // 🛑 LE FAMEUX BOUCLIER ANTI-ADMIN EST ICI !
    if (role === 'admin' || role === 'super_admin') {
      console.log(`🛡️ PROTECTION ACTIVÉE : ${nomComplet} est un Administrateur ! Son compte est préservé.`);
      
      // On arrête la fonction ici, on ne va pas jusqu'au DELETE FROM users !
      return res.status(200).json({ 
        message: "Profil patient effacé, mais le compte Administrateur a été conservé par sécurité !" 
      });
    }

    // 🧨 Si ce N'EST PAS un admin, le bulldozer continue le travail :
    console.log("🧹 Étape 3 : Nettoyage des messages de l'utilisateur...");
    await safeDelete("DELETE FROM messages WHERE expediteur_id = ? OR destinataire_id = ?", [id, id]);

    console.log("🧨 Étape 4 : Suppression finale du compte utilisateur...");
    await db.query("DELETE FROM users WHERE id = ?", { replacements: [id], type: db.QueryTypes.DELETE });

    console.log(`✅ VICTOIRE ! Patient ${nomComplet} a été totalement effacé !`);
    res.status(200).json({ message: "Patient supprimé avec succès !" });

  } catch (error) {
    console.error("❌ ERREUR FATALE SERVEUR :", error.message || error);
    res.status(500).json({ error: "La base de données bloque la suppression.", details: error.message });
  }
};