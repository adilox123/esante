const axios = require('axios');
const db = require('../config/db');

exports.askChatbot = async (req, res) => {
  try {
    const { message, patientId } = req.body; 
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

    // --- 🆕 MODIFICATION : RÉCUPÉRATION COMPLÈTE (NOM, SPÉCIALITÉ, TARIF, VILLE) ---
    
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

    const systemInstructions = `
      Tu es l'assistant expert de la plateforme 'E-Sante'. 
      
      --- INFOS SUR LA PLATEFORME ---
      - Réservation : Le patient doit choisir un médecin et cliquer sur 'Réserver' pour voir les disponibilités.
      - Paiement : Nous acceptons Stripe et les cartes bancaires.
      - Tarifs : Le prix moyen d'une consultation sur le site est entre 200 et 600 DH.
      
      --- BASE DE DONNÉES DES MÉDECINS ---
      ${listeMedecins}

      --- RÈGLES STRICTES DE RÉPONSE ---
      1. Suggère un médecin de la liste adapté aux symptômes décrits.
      2. ⚠️ RÈGLE ABSOLUE : NE MENTIONNE JAMAIS LE TARIF NI LA VILLE du médecin, SAUF SI le patient pose explicitement une question sur le prix ou la localisation.
      3. Si on te demande "Combien coûte une consultation ?", donne la fourchette générale (200-600 DH).
      4. Si on te demande le prix d'un médecin précis, donne son tarif exact.
      5. Sois naturel, empathique, et réponds UNIQUEMENT à la question posée sans rajouter d'informations inutiles.
      6. Ne donne jamais de diagnostic définitif ni de médicaments.

      Message du patient : ${message}
    `;

    // --- 🔚 FIN DE LA MODIFICATION ---

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