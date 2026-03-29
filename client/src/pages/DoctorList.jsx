import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUserMd, FaMapMarkerAlt, FaPhone, FaEnvelope, FaRegHeart, 
  FaHeart, FaSearch, FaMoneyBillWave, FaExclamationTriangle
} from 'react-icons/fa';
import { api } from '../services/api'; 
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
        const resMedecins = await api.get('/medecins');
        setMedecins(resMedecins.data);
        setError(null);
        if (patientId) {
          const resFavoris = await api.get(`/favoris/${patientId}`);
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

  const handleToggleFavori = async (medecinId) => {
    if (!patientId) {
      alert("Veuillez vous connecter en tant que patient pour ajouter aux favoris.");
      return;
    }
    try {
      const res = await api.post('/favoris/toggle', { patient_id: patientId, medecin_id: medecinId });
      if (res.data.isFavori) {
        setFavorisIds(prev => [...prev, Number(medecinId)]);
      } else {
        setFavorisIds(prev => prev.filter(id => Number(id) !== Number(medecinId)));
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour des favoris.");
    }
  };

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
    <div className="dl-root">

      {/* Background orbs */}
      <div className="dl-bg-orb dl-bg-orb--1" />
      <div className="dl-bg-orb dl-bg-orb--2" />
      <div className="dl-bg-orb dl-bg-orb--3" />

      <div className="dl-container">

        {/* ===== HEADER ===== */}
        <header className="dl-header">
          <div className="dl-header__badge">
            <span className="dl-header__badge-dot" />
            Professionnels de santé
          </div>
          <h1 className="dl-header__title">
            Prenez rendez-vous <br />
            <span>en ligne</span>
          </h1>
          <p className="dl-header__sub">
            Trouvez le spécialiste qui vous convient parmi nos professionnels de santé
          </p>
        </header>

        {/* ===== FILTER TABS ===== */}
        {patientId && (
          <div className="dl-tabs">
            <button
              className={`dl-tab ${!showFavorisOnly ? 'dl-tab--active' : ''}`}
              onClick={() => setShowFavorisOnly(false)}
            >
              <FaUserMd size={14} />
              Tous les médecins
              <span className="dl-tab__count">{medecins.length}</span>
            </button>
            <button
              className={`dl-tab dl-tab--heart ${showFavorisOnly ? 'dl-tab--active-heart' : ''}`}
              onClick={() => setShowFavorisOnly(true)}
            >
              <FaHeart size={13} />
              Mes Favoris
              <span className="dl-tab__count dl-tab__count--red">{favorisIds.length}</span>
            </button>
          </div>
        )}

        {/* ===== SEARCH ===== */}
        <div className="dl-search-wrap">
          <div className="dl-search">
            <FaSearch className="dl-search__icon" />
            <input
              type="text"
              className="dl-search__input"
              placeholder={showFavorisOnly ? "Rechercher dans mes favoris..." : "Médecin, spécialité, ville..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="dl-search__clear" onClick={() => setSearchTerm('')}>✕</button>
            )}
          </div>
        </div>

        {/* ===== STATES ===== */}
        {loading && (
          <div className="dl-state dl-state--loading">
            <div className="dl-spinner" />
            <span>Chargement des spécialistes en cours...</span>
          </div>
        )}

        {error && (
          <div className="dl-state dl-state--error">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {/* ===== RESULTS META ===== */}
        {!loading && !error && filteredMedecins.length > 0 && (
          <p className="dl-results-meta">
            <strong>{filteredMedecins.length}</strong> médecin{filteredMedecins.length > 1 ? 's' : ''} trouvé{filteredMedecins.length > 1 ? 's' : ''}
          </p>
        )}

        {/* ===== GRID ===== */}
        {!loading && !error && (
          <div className="dl-grid">
            {filteredMedecins.length === 0 ? (
              <div className="dl-empty">
                <div className="dl-empty__icon">{showFavorisOnly ? '💙' : '🔍'}</div>
                <p className="dl-empty__title">
                  {showFavorisOnly ? "Aucun médecin favori" : "Aucun médecin trouvé"}
                </p>
                <p className="dl-empty__sub">
                  {showFavorisOnly
                    ? "Ajoutez des médecins à vos favoris en cliquant sur le cœur."
                    : "Essayez un autre terme de recherche."}
                </p>
              </div>
            ) : (
              filteredMedecins.map((medecin, i) => {
                const isFavori = favorisIds.some(id => Number(id) === Number(medecin.id));

                return (
                  <div
                    key={medecin.id}
                    className={`dl-card ${isFavori ? 'dl-card--favori' : ''}`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {/* Favorite button */}
                    <button
                      className={`dl-card__fav-btn ${isFavori ? 'dl-card__fav-btn--active' : ''}`}
                      onClick={() => handleToggleFavori(medecin.id)}
                      title={isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      {isFavori ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
                    </button>

                    {/* Card top accent */}
                    <div className="dl-card__accent" />

                    {/* Profile header */}
                    <div className="dl-card__profile">
                      <div className="dl-card__avatar">
                        <FaUserMd size={24} />
                        <div className="dl-card__avatar-ring" />
                      </div>
                      <div className="dl-card__profile-info">
                        <h3 className="dl-card__name">
                          {medecin.User?.nom} {medecin.User?.prenom}
                        </h3>
                        <span className="dl-card__specialty">
                          {medecin.Specialite?.nom || "Médecin Généraliste"}
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="dl-card__divider" />

                    {/* Info list */}
                    <ul className="dl-card__info-list">
                      <li className="dl-card__info-item">
                        <span className="dl-card__info-icon dl-card__info-icon--blue">
                          <FaMapMarkerAlt />
                        </span>
                        <div>
                          <span className="dl-card__info-label">Cabinet</span>
                          <span className="dl-card__info-value">{medecin.adresse || "Non communiquée"}</span>
                        </div>
                      </li>
                      <li className="dl-card__info-item">
                        <span className="dl-card__info-icon dl-card__info-icon--teal">
                          <FaPhone />
                        </span>
                        <div>
                          <span className="dl-card__info-label">Téléphone</span>
                          <span className="dl-card__info-value">{medecin.telephone || "Non communiqué"}</span>
                        </div>
                      </li>
                      <li className="dl-card__info-item">
                        <span className="dl-card__info-icon dl-card__info-icon--purple">
                          <FaEnvelope />
                        </span>
                        <div>
                          <span className="dl-card__info-label">Email</span>
                          <span className="dl-card__info-value">{medecin.User?.email}</span>
                        </div>
                      </li>
                      <li className="dl-card__info-item">
                        <span className="dl-card__info-icon dl-card__info-icon--green">
                          <FaMoneyBillWave />
                        </span>
                        <div>
                          <span className="dl-card__info-label">Tarif consultation</span>
                          <span className="dl-card__info-value dl-card__info-value--price">
                            {medecin.tarif || 200} <em>DH</em>
                          </span>
                        </div>
                      </li>

                      {/* Absences */}
                      {medecin.absences && medecin.absences.length > 0 && (
                        <li className="dl-card__absence-notice">
                          <div className="dl-card__absence-header">
                            <FaExclamationTriangle size={12} />
                            Indisponibilité signalée
                          </div>
                          {medecin.absences.slice(0, 2).map((abs, index) => (
                            <p key={index} className="dl-card__absence-row">
                              • Absent le {new Date(abs.date_absence).toLocaleDateString('fr-FR')} ({abs.periode})
                            </p>
                          ))}
                        </li>
                      )}
                    </ul>

                    {/* CTA */}
                    <Link to={`/book/${medecin.id}`} className="dl-card__cta">
                      Prendre Rendez-vous
                      <span className="dl-card__cta-arrow">→</span>
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