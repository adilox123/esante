import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserMd, FaMapMarkerAlt, FaPhone, FaEnvelope, FaMoneyBillWave } from 'react-icons/fa';
import './BookAppointment.css';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [medecin, setMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [motif, setMotif] = useState('Consultation générale');
  const [submitting, setSubmitting] = useState(false);
  
  // 🎯 NOUVEAU : State pour gérer notre Pop-up d'erreur
  const [errorMessage, setErrorMessage] = useState('');

  const availableTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const motifs = [
    { value: 'Consultation générale', icon: '🩺' },
    { value: 'Première visite',       icon: '👋' },
    { value: 'Suivi médical',         icon: '📋' },
    { value: 'Urgence',               icon: '🚨' },
  ];

  const joursFeries = [
    "01-01", "01-11", "05-01", "07-30", "08-14", "08-20", "08-21", "11-06", "11-18"
  ];

  useEffect(() => {
    axios.get('http://localhost:5000/api/medecins')
      .then(res => {
        setMedecin(res.data.find(d => d.id.toString() === doctorId) || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [doctorId]);

  const handleDateChange = (e) => {
    const selectedDateStr = e.target.value;
    
    if (!selectedDateStr) {
      setDate('');
      setTime('');
      return;
    }

    const dateObj = new Date(selectedDateStr);
    const jourSemaine = dateObj.getDay();

    // 1. Vérifier le week-end
    if (jourSemaine === 0 || jourSemaine === 6) {
      setErrorMessage("Les cabinets médicaux sont fermés le week-end. Veuillez choisir un jour en semaine."); // 🎯 MODIFIÉ ICI
      setDate('');
      setTime('');
      return;
    }

    // 2. Vérifier les jours fériés
    const mois = String(dateObj.getMonth() + 1).padStart(2, '0');
    const jour = String(dateObj.getDate()).padStart(2, '0');
    
    if (joursFeries.includes(`${mois}-${jour}`)) {
      setErrorMessage("Cette date correspond à un jour férié. Les médecins ne sont pas disponibles."); // 🎯 MODIFIÉ ICI
      setDate('');
      setTime('');
      return;
    }

    setDate(selectedDateStr);
    setTime('');
    setErrorMessage(''); // On efface l'erreur si la date est bonne
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // C'est l'ID de l'utilisateur connecté

    if (!token || !userId) {
      setErrorMessage("Vous devez être connecté pour prendre rendez-vous.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. On récupère d'abord l'ID réel du patient à partir de l'userId
      const patientRes = await axios.get(`http://localhost:5000/api/patients/profile?userId=${userId}`);
      const patientId = patientRes.data.id;

      // 2. On prépare les données du rendez-vous
      const reservationData = {
        patient_id: patientId,
        medecin_id: doctorId,
        date_rdv: date,
        heure_rdv: time,
        motif: motif,
        statut: 'En attente' // 🎯 Très important : le médecin devra valider
      };

      // 3. On enregistre directement en base de données
      await axios.post('http://localhost:5000/api/appointments', reservationData);

      // 4. Succès ! On redirige vers le dashboard patient
      navigate('/dashboard', { 
        state: { message: "✅ Votre demande de réservation a été envoyée au médecin. Vous recevrez une notification dès qu'elle sera validée." } 
      });

    } catch (err) {
      console.error("Erreur réservation:", err);
      setErrorMessage("Désolé, une erreur est survenue lors de l'envoi de votre demande.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="ba-root">
      <div className="ba-orb ba-orb--1" /><div className="ba-orb ba-orb--2" />
      <div className="ba-loading">
        <div className="ba-loading__spinner" />
        <p>Chargement du profil médecin...</p>
      </div>
    </div>
  );

  if (!medecin) return (
    <div className="ba-root">
      <div className="ba-error">
        <div className="ba-error__icon">😔</div>
        <h2>Médecin introuvable</h2>
        <p>Ce profil n'existe pas ou a été supprimé.</p>
      </div>
    </div>
  );

  const isReady = date && time;

  return (
    <div className="ba-root">
      
      {/* 🎯 NOUVEAU : LE POP-UP D'ERREUR */}
      {errorMessage && (
        <div className="ba-modal-overlay">
          <div className="ba-modal">
            <div className="ba-modal__icon">⚠️</div>
            <h3 className="ba-modal__title">Date indisponible</h3>
            <p className="ba-modal__text">{errorMessage}</p>
            <button className="ba-modal__btn" onClick={() => setErrorMessage('')}>
              Compris
            </button>
          </div>
        </div>
      )}
      {/* -------------------------------- */}

      <div className="ba-orb ba-orb--1" />
      <div className="ba-orb ba-orb--2" />
      <div className="ba-orb ba-orb--3" />

      <div className="ba-container">
        <div className="ba-page-header">
          <div className="ba-page-header__badge">
            <span className="ba-badge-dot" />
            Prise de rendez-vous
          </div>
          <h1 className="ba-page-header__title">
            Réservez votre <span>consultation</span>
          </h1>
          <p className="ba-page-header__sub">Choisissez un créneau et confirmez en quelques clics</p>
        </div>

        <div className="ba-layout">
          {/* ===== LEFT: DOCTOR CARD ===== */}
          <div className="ba-doctor-card">
            <div className="ba-doctor-card__accent" />
            <div className="ba-doctor-card__avatar-wrap">
              <div className="ba-doctor-card__avatar">
                <FaUserMd size={36} />
                <div className="ba-doctor-card__avatar-ring" />
              </div>
              <div className="ba-doctor-card__online">
                <span className="ba-doctor-card__online-dot" />
                Disponible
              </div>
            </div>
            <h2 className="ba-doctor-card__name">
              Dr. {medecin.User?.nom} {medecin.User?.prenom}
            </h2>
            <span className="ba-doctor-card__spec">
              {medecin.Specialite?.nom || "Spécialiste"}
            </span>
            <div className="ba-doctor-card__divider" />
            <div className="ba-doctor-card__info-list">
              <div className="ba-info-item">
                <div className="ba-info-item__icon ba-info-item__icon--blue"><FaMapMarkerAlt /></div>
                <div>
                  <p className="ba-info-item__label">Cabinet</p>
                  <p className="ba-info-item__value">{medecin.adresse || "Non renseignée"}</p>
                </div>
              </div>
              <div className="ba-info-item">
                <div className="ba-info-item__icon ba-info-item__icon--teal"><FaPhone /></div>
                <div>
                  <p className="ba-info-item__label">Téléphone</p>
                  <p className="ba-info-item__value">{medecin.telephone || "Non renseigné"}</p>
                </div>
              </div>
              <div className="ba-info-item">
                <div className="ba-info-item__icon ba-info-item__icon--purple"><FaEnvelope /></div>
                <div>
                  <p className="ba-info-item__label">Email</p>
                  <p className="ba-info-item__value">{medecin.User?.email || "Non renseigné"}</p>
                </div>
              </div>
            </div>
            <div className="ba-price-badge">
              <div className="ba-price-badge__icon"><FaMoneyBillWave /></div>
              <div>
                <p className="ba-price-badge__label">Tarif consultation</p>
                <p className="ba-price-badge__amount">{medecin.tarif || 200} <em>DH</em></p>
              </div>
            </div>
          </div>

          {/* ===== RIGHT: FORM ===== */}
          <div className="ba-form-card">
            <div className="ba-form-card__accent" />
            <div className="ba-form-card__header">
              <div className="ba-form-card__header-icon">📅</div>
              <div>
                <h2 className="ba-form-card__title">Prendre un rendez-vous</h2>
                <p className="ba-form-card__sub">Remplissez les informations ci-dessous</p>
              </div>
            </div>

            <div className="ba-progress">
              <div className={`ba-progress__step ${motif ? 'ba-progress__step--done' : 'ba-progress__step--active'}`}>
                <div className="ba-progress__step-num">1</div><span>Motif</span>
              </div>
              <div className="ba-progress__line" />
              <div className={`ba-progress__step ${date ? 'ba-progress__step--done' : date ? '' : 'ba-progress__step--active'}`}>
                <div className="ba-progress__step-num">2</div><span>Date</span>
              </div>
              <div className="ba-progress__line" />
              <div className={`ba-progress__step ${time ? 'ba-progress__step--done' : ''}`}>
                <div className="ba-progress__step-num">3</div><span>Heure</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="ba-form">
              {/* Motif */}
              <div className="ba-section">
                <label className="ba-section__label"><span className="ba-section__num">1</span>Motif de la consultation</label>
                <div className="ba-motif-grid">
                  {motifs.map(m => (
                    <button
                      key={m.value} type="button"
                      className={`ba-motif-btn ${motif === m.value ? 'ba-motif-btn--active' : ''}`}
                      onClick={() => setMotif(m.value)}
                    >
                      <span className="ba-motif-btn__icon">{m.icon}</span>
                      <span className="ba-motif-btn__label">{m.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div className="ba-section">
                <label className="ba-section__label"><span className="ba-section__num">2</span>Choisissez une date</label>
                <div className="ba-field-wrap">
                  <span className="ba-field-icon">📅</span>
                  <input
                    type="date" className="ba-input" value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={handleDateChange} required
                  />
                </div>
              </div>

              {/* Time */}
              <div className="ba-section">
                <label className="ba-section__label"><span className="ba-section__num">3</span>Choisissez l'heure</label>
                {!date ? (
                  <div className="ba-slots-placeholder">
                    <span>📅</span><p>Sélectionnez d'abord une date pour voir les créneaux disponibles</p>
                  </div>
                ) : (
                  <div className="ba-slots-grid">
                    {availableTimeSlots.map(slot => (
                      <button
                        key={slot} type="button"
                        className={`ba-slot ${time === slot ? 'ba-slot--active' : ''}`}
                        onClick={() => setTime(slot)}
                      >
                        {time === slot && <div className="ba-slot__glow" />}
                        <span className="ba-slot__time">{slot}</span>
                        {time === slot && <span className="ba-slot__check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isReady && (
                <div className="ba-recap">
                  <div className="ba-recap__item"><span>📋</span><span>{motif}</span></div>
                  <div className="ba-recap__item"><span>📅</span><span>{new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                  <div className="ba-recap__item"><span>🕐</span><span>{time}</span></div>
                </div>
              )}

              <button type="submit" className={`ba-submit ${isReady ? 'ba-submit--ready' : ''}`} disabled={!isReady || submitting}>
  {submitting ? (
    <span>Envoi de la demande...</span>
  ) : isReady ? (
    <><span>Confirmer la réservation</span><span className="ba-submit__arrow">→</span></>
  ) : (
    <span>Sélectionnez une date et une heure</span>
  )}
</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}