// ⚠️ CORRECTION ICI : On enlève les accolades {} autour de Favori
const Favori = require('../models/Favori'); 

exports.toggleFavori = async (req, res) => {
  try {
    const { patient_id, medecin_id } = req.body;

    // On cherche si ce favori existe déjà
    const existingFavori = await Favori.findOne({ 
      where: { patient_id, medecin_id } 
    });

    if (existingFavori) {
      await existingFavori.destroy();
      return res.json({ message: "Retiré des favoris", isFavori: false });
    } else {
      await Favori.create({ patient_id, medecin_id });
      return res.json({ message: "Ajouté aux favoris", isFavori: true });
    }
  } catch (error) {
    console.error("❌ Erreur dans toggleFavori :", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFavorisByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const favoris = await Favori.findAll({ where: { patient_id: patientId } });
    
    // On renvoie juste un tableau avec les IDs des médecins
    const medecinIds = favoris.map(fav => fav.medecin_id);
    res.json(medecinIds);
  } catch (error) {
    console.error("❌ Erreur dans getFavoris :", error);
    res.status(500).json({ error: error.message });
  }
};