import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd, FaMapMarkerAlt, FaPhone, FaEnvelope, FaRegHeart, FaHeart, FaSearch } from 'react-icons/fa';
import { api } from '../services/api'; // IMPORT DÉPLACÉ EN HAUT
import './DoctorList.css'; 

export default function DoctorList() {
  const [medecins, setMedecins] = useState([]);
  const [favorisIds, setFavorisIds] = useState([]); 
  const [showFavorisOnly, setShowFavorisOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); 

  const patientId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Charger tous les médecins
        const resMedecins = await api.get('/medecins');
        setMedecins(resMedecins.data);
        setError(null);

        // 2. Charger les favoris si l'utilisateur est connecté
        if (patientId) {
          const resFavoris = await api.get(`/favoris/${patientId}`);
          // On s'assure que ce sont des nombres pour la comparaison plus tard
          const idsEnNombres = resFavoris.data.map(fav => Number(fav.medecinId || fav));
          setFavorisIds(idsEnNombres);
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
        setError("Impossible de charger la liste des médecins. Vérifiez la connexion au serveur.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  // Fonction pour gérer le clic sur le coeur
  const handleToggleFavori = async (medecinId) => {
    if (!patientId) {
      alert("Veuillez vous connecter en tant que patient pour ajouter aux favoris.");
      return;
    }

    try {
      const res = await api.post('/favoris/toggle', {
        patient_id: patientId,
        medecin_id: medecinId
      });

      if (res.data.isFavori) {
        setFavorisIds(prev => [...prev, Number(medecinId)]);
      } else {
        setFavorisIds(prev => prev.filter(id => Number(id) !== Number(medecinId)));
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour des favoris.");
    }
  };

  // Filtrage intelligent
  const filteredMedecins = medecins.filter((medecin) => {
    const nomMedecin = medecin.User?.nom?.toLowerCase() || "";
    const speMedecin = medecin.Specialite?.nom?.toLowerCase() || "";
    const matchesSearch = nomMedecin.includes(searchTerm.toLowerCase()) || 
                          speMedecin.includes(searchTerm.toLowerCase());
    
    const isDansFavoris = favorisIds.some(id => Number(id) === Number(medecin.id));
    const matchesTab = showFavorisOnly ? isDansFavoris : true;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="doctor-page-container">
      <div className="doctor-page-content">
        
        <header className="doctor-header">
          <h1>Prenez rendez-vous en ligne</h1>
          <p>Trouvez le spécialiste qui vous convient parmi nos professionnels de santé</p>
        </header>

        {patientId && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
            <button 
              onClick={() => setShowFavorisOnly(false)}
              style={{
                padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', border: 'none',
                backgroundColor: !showFavorisOnly ? '#3182ce' : '#f1f5f9',
                color: !showFavorisOnly ? 'white' : '#475569',
                transition: 'all 0.3s'
              }}
            >
              Tous les médecins
            </button>
            <button 
              onClick={() => setShowFavorisOnly(true)}
              style={{
                padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', border: 'none',
                backgroundColor: showFavorisOnly ? '#e11d48' : '#f1f5f9',
                color: showFavorisOnly ? 'white' : '#475569',
                transition: 'all 0.3s'
              }}
            >
              ❤️ Mes Favoris
            </button>
          </div>
        )}

        <div className="search-bar-container">
          <span className="search-icon"><FaSearch color="#94a3b8" /></span>
          <input 
            type="text" 
            className="search-input"
            placeholder={showFavorisOnly ? "Rechercher dans mes favoris..." : "Rechercher un médecin, une spécialité..."} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && <div className="state-message loading">Chargement des spécialistes en cours...</div>}
        {error && <div className="state-message error">⚠️ {error}</div>}

        {!loading && !error && (
          <div className="doctor-grid">
            {filteredMedecins.length === 0 ? (
              <div className="state-message empty">
                {showFavorisOnly ? "Vous n'avez pas encore de médecin favori." : "Aucun médecin trouvé."}
              </div>
            ) : (
              filteredMedecins.map((medecin) => {
                const isFavori = favorisIds.some(id => Number(id) === Number(medecin.id));

                return (
                  <div key={medecin.id} className="doctor-card" style={{ position: 'relative' }}>
                    
                    <button 
                      onClick={() => handleToggleFavori(medecin.id)}
                      style={{
                        position: 'absolute', top: '20px', right: '20px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: isFavori ? '#e11d48' : '#94a3b8', 
                        transition: 'transform 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      title={isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      {isFavori ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
                    </button>

                    <div className="doctor-profile-header">
                      <div className="doctor-avatar" style={{ backgroundColor: '#eff6ff', color: '#3182ce' }}>
                        <FaUserMd size={26} />
                      </div>
                      <div>
                        <h3 className="doctor-name">{medecin.User?.nom}</h3>
                        <span className="doctor-specialty">
                          {medecin.Specialite?.nom || "Médecin Généraliste"}
                        </span>
                      </div>
                    </div>
                    
                    <ul className="doctor-info-list">
                      <li><span className="info-icon" style={{color: '#3182ce'}}><FaMapMarkerAlt /></span> <strong>Cabinet :</strong> {medecin.adresse || "Non communiquée"}</li>
                      <li><span className="info-icon" style={{color: '#3182ce'}}><FaPhone /></span> <strong>Téléphone :</strong> {medecin.telephone || "Non communiqué"}</li>
                      <li><span className="info-icon" style={{color: '#3182ce'}}><FaEnvelope /></span> <strong>Email :</strong> {medecin.User?.email}</li>
                    </ul>

                    <Link to={`/book/${medecin.id}`} className="btn-appointment" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                      Prendre Rendez-vous
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}