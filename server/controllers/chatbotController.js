const axios = require('axios');
const db = require('../config/db');

exports.askChatbot = async (req, res) => {
  try {
    // 🎯 MODIFICATION : On ajoute "role" et "userId" pour savoir qui parle à l'IA
    const { message, patientId, role, userId } = req.body; 
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

    if (!apiKey) {
      return res.status(500).json({ error: "Clé API absente du fichier .env" });
    }

    // 1. Diagnostic du modèle
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listRes = await axios.get(listUrl);
    const availableModels = listRes.data.models;
    const modelToUse = availableModels.find(m => m.supportedGenerationMethods.includes('generateContent'));

    if (!modelToUse) {
      throw new Error("Aucun modèle compatible trouvé.");
    }

    let systemInstructions = "";

    // =========================================================================
    // 👨‍⚕️ CERVEAU N°1 : SI C'EST LE MÉDECIN QUI PARLE (Le Super-Secrétaire)
    // =========================================================================
    if (role === 'medecin') {
      
      // On récupère uniquement les patients de CE médecin
      const patientsData = await db.query(`
        SELECT DISTINCT u.nom, u.prenom, p.date_naissance, p.groupe_sanguin, p.sexe, r.motif
        FROM patients p
        JOIN users u ON p.user_id = u.id
        JOIN rendez_vous r ON r.patient_id = p.id
        WHERE r.medecin_id = ?
      `, {
        replacements: [userId], 
        type: db.QueryTypes.SELECT
      });

      const listePatients = patientsData.length > 0 
        ? patientsData.map(p => 
            `- ${p.nom} ${p.prenom} | Sexe: ${p.sexe || 'N/A'} | Sang: ${p.groupe_sanguin || 'N/A'} | Né(e) le: ${p.date_naissance || 'N/A'} | Motif récent: ${p.motif || 'N/A'}`
          ).join("\n")
        : "Aucun patient pour le moment.";

      systemInstructions = `
        Tu es l'assistant personnel et le secrétaire médical du Docteur sur la plateforme E-Santé.
        Ton but est de l'aider à gérer ses patients et de lui faire gagner du temps.

        --- BASE DE DONNÉES DE TES PATIENTS ---
        Voici la liste stricte de tes patients actuels et leurs informations médicales :
        ${listePatients}

        --- RÈGLES POUR LE MÉDECIN ---
        1. Si le médecin te pose une question sur un patient, cherche dans la liste ci-dessus et réponds de manière concise.
        2. Si le médecin demande un résumé, fais-lui une synthèse claire.
        3. Si le médecin te parle d'un patient qui n'est pas dans la liste, dis-lui que tu n'as pas accès à ce dossier.
        4. Si le médecin te demande de rédiger un email, une réponse ou un compte rendu, fais-le de manière formelle et professionnelle.
        5. Sois direct. Les médecins n'ont pas le temps de lire de longues introductions.
        
        Message du Docteur : ${message}
      `;
    } 
    // =========================================================================
    // 🧑‍💼 CERVEAU N°2 : SI C'EST LE PATIENT QUI PARLE (Le Guide Médical)
    // =========================================================================
    else {
      const medecinsData = await db.query(`
        SELECT u.nom as nom_medecin, s.nom as nom_specialite, m.tarif, m.ville 
        FROM medecins m
        JOIN users u ON m.user_id = u.id
        JOIN specialites s ON m.specialite_id = s.id
      `, {
        type: db.QueryTypes.SELECT
      });

      const listeMedecins = medecinsData.map(m => 
        `- Dr. ${m.nom_medecin} (${m.nom_specialite}) à ${m.ville}. Tarif: ${m.tarif} DH`
      ).join("\n");

      systemInstructions = `
        Tu es l'Assistant IA Médical officiel de la plateforme marocaine 'E-Santé'. 
        Ton rôle est de guider les patients, de répondre à toutes leurs questions sur le site, et de les orienter vers le bon médecin.

        --- IDENTITÉ ET TON ---
        - Tu es poli, empathique, rassurant et professionnel.
        - Tu parles en français.
        - ⚠️ RÈGLE ABSOLUE : Tu n'es pas un vrai médecin. Ne donne JAMAIS de diagnostic définitif ni de prescription de médicaments. En cas d'urgence grave (douleur thoracique forte, saignement, perte de connaissance), dis au patient d'appeler les urgences marocaines (le 15 ou le 150) immédiatement.

        --- FONCTIONNALITÉS DE E-SANTÉ ---
        - Dossier Médical Numérique : Les patients peuvent centraliser leurs documents de santé en toute sécurité sur leur tableau de bord.
        - Prise de RDV 24h/24 : Plus besoin d'appeler, tout se fait en ligne.
        - Chat sécurisé : Possibilité de parler au médecin avant/après consultation.

        --- RÈGLES DE RÉSERVATION ET HORAIRES ---
        - Les cabinets médicaux sont FERMÉS les week-ends (Samedi et Dimanche) et les jours fériés marocains. Il est impossible de réserver ces jours-là.
        - Étapes pour réserver : Le patient doit aller sur l'onglet "Médecins", choisir son docteur, sélectionner un motif, une date en semaine, une heure, puis payer.
        - Paiement : Sécurisé en ligne par carte bancaire (Stripe) ou en espèces au cabinet.

        --- BASE DE DONNÉES DES MÉDECINS (EN TEMPS RÉEL) ---
        Voici les seuls médecins actuellement disponibles sur la plateforme :
        ${listeMedecins}

        --- RÈGLES DE RÉPONSE ---
        1. Suggère un médecin de la liste ci-dessus adapté aux symptômes décrits (ex: Cardiologue pour le cœur, Neurologue pour la tête, Généraliste pour la fièvre).
        2. Ne mentionne pas le tarif ou l'adresse du médecin à moins que le patient ne le demande ou demande des détails sur ce médecin.
        3. Si on te demande "Combien coûte une consultation ?", donne la fourchette (ex: de 200 à 600 DH selon la spécialité).
        4. Réponds de manière concise, aérée et naturelle. Ne recrache pas toutes les infos d'un coup, réponds UNIQUEMENT à ce que le patient demande.

        Message du patient : ${message}
      `;
    }
    // =========================================================================

    // 2. Appel à l'IA Gemini
    const chatUrl = `https://generativelanguage.googleapis.com/v1beta/${modelToUse.name}:generateContent?key=${apiKey}`;
    const response = await axios.post(chatUrl, {
      contents: [{
        parts: [{ text: systemInstructions }]
      }]
    });

    const responseText = response.data.candidates[0].content.parts[0].text;

    // 3. Sauvegarde compatible Sequelize
    if (patientId) {
      const sqlInsert = "INSERT INTO chatbot_interactions (patient_id, message_patient, reponse_ia) VALUES (?, ?, ?)";
      db.query(sqlInsert, {
        replacements: [patientId, message, responseText],
        type: db.QueryTypes.INSERT
      })
      .then(() => console.log("✅ Interaction sauvegardée pour le patient ID :", patientId))
      .catch(err => console.error("❌ Erreur sauvegarde Sequelize :", err));
    }

    res.json({ reply: responseText });

  } catch (error) {
    console.error("❌ ERREUR DÉTAILLÉE :");
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    res.status(500).json({ error: "Problème de configuration de l'IA." });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const query = "SELECT message_patient, reponse_ia FROM chatbot_interactions WHERE patient_id = ? ORDER BY created_at ASC";
    
    const history = await db.query(query, {
      replacements: [patientId],
      type: db.QueryTypes.SELECT
    });

    res.json(history);
  } catch (error) {
    console.error("❌ Erreur récupération historique:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};