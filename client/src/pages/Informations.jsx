import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // 👈 AJOUT POUR REQUÊTE API
import './Informations.css';

/* ============================================================
   DATA
   ============================================================ */
const STATS = [
  { num: '200+',  label: 'Médecins agréés',       icon: '👨‍⚕️' },
  { num: '15k+',  label: 'Patients satisfaits',   icon: '😊' },
  { num: '98%',   label: 'Taux de satisfaction',  icon: '⭐' },
  { num: '24/7',  label: 'Assistance disponible', icon: '🕐' },
];

const FEATURES = [
  {
    icon: '📅',
    title: 'Prise de RDV en ligne',
    desc: 'Réservez votre consultation en quelques clics, 24h/24 et 7j/7, sans attente téléphonique.',
    color: 'teal',
  },
  {
    icon: '🤖',
    title: 'Assistant IA Médical',
    desc: 'Notre intelligence artificielle vous guide, analyse vos symptômes et vous oriente vers le bon spécialiste.',
    color: 'blue',
  },
  {
    icon: '📂',
    title: 'Dossier Médical Numérique',
    desc: 'Centralisez tous vos documents médicaux dans un espace sécurisé, accessible à tout moment.',
    color: 'purple',
  },
  {
    icon: '💬',
    title: 'Chat Médecin-Patient',
    desc: 'Communiquez directement avec votre médecin via notre messagerie sécurisée en temps réel.',
    color: 'green',
  },
  {
    icon: '💳',
    title: 'Paiement Sécurisé',
    desc: 'Réglez vos consultations en ligne par carte bancaire, PayPal ou en espèce au cabinet.',
    color: 'orange',
  },
  {
    icon: '🔔',
    title: 'Rappels Automatiques',
    desc: 'Recevez des notifications pour vos rendez-vous et ne manquez plus jamais une consultation.',
    color: 'red',
  },
];

const STEPS = [
  { num: '01', title: 'Créez votre compte', desc: 'Inscrivez-vous gratuitement en tant que patient ou médecin en moins de 2 minutes.', icon: '✍️' },
  { num: '02', title: 'Trouvez un spécialiste', desc: 'Parcourez notre annuaire de médecins agréés, filtrez par spécialité et localisation.', icon: '🔍' },
  { num: '03', title: 'Prenez rendez-vous', desc: 'Choisissez un créneau disponible et confirmez votre réservation instantanément.', icon: '📅' },
  { num: '04', title: 'Consultez & payez', desc: 'Consultez votre médecin et réglez en ligne de manière simple et sécurisée.', icon: '✅' },
];

const SPECIALITES = [
  { icon: '❤️',  name: 'Cardiologie' },
  { icon: '🧠',  name: 'Neurologie' },
  { icon: '🦷',  name: 'Dentisterie' },
  { icon: '👁️',  name: 'Ophtalmologie' },
  { icon: '🦴',  name: 'Orthopédie' },
  { icon: '🫁',  name: 'Pneumologie' },
  { icon: '🩺',  name: 'Médecine Générale' },
  { icon: '🧬',  name: 'Dermatologie' },
];

const TEMOIGNAGES = [
  {
    name: 'Fatima Z.',
    role: 'Patiente',
    text: 'E-Santé a transformé ma façon de gérer ma santé. Je prends mes RDV en quelques secondes et mon dossier médical est toujours à portée de main.',
    avatar: '👩',
    stars: 5,
  },
  {
    name: 'Dr. Karim B.',
    role: 'Cardiologue, Casablanca',
    text: 'En tant que médecin, la plateforme m\'a permis de mieux organiser mon agenda et de communiquer efficacement avec mes patients.',
    avatar: '👨‍⚕️',
    stars: 5,
  },
  {
    name: 'Youssef A.',
    role: 'Patient',
    text: "L'assistant IA est impressionnant. Il m'a orienté vers le bon spécialiste immédiatement. Interface intuitive et moderne.",
    avatar: '👨',
    stars: 5,
  },
];

/* ============================================================
   COMPOSANT PRINCIPAL
   ============================================================ */
export default function Informations() {
  const [activeTab, setActiveTab] = useState('patients');
  const [medecins, setMedecins] = useState([]); // 👈 AJOUT : Stocker la liste des médecins

  // 👈 AJOUT : Récupérer les médecins au chargement de la page
  useEffect(() => {
    const fetchMedecins = async () => {
      try {
        // ⚠️ Vérifie que cette URL correspond bien à la route de ton backend !
        const response = await axios.get('http://localhost:5000/api/medecins'); 
        console.log("🕵️‍♂️ DONNÉES MÉDECINS :", response.data); // 👈 AJOUTE CETTE LIGNE
        setMedecins(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des médecins:", error);
      }
    };
    fetchMedecins();
  }, []);

  return (
    <div className="info-root">

      {/* BG orbs */}
      <div className="info-orb info-orb--1" />
      <div className="info-orb info-orb--2" />
      <div className="info-orb info-orb--3" />

      {/* ===== HERO ===== */}
      <section className="info-hero">
        <div className="info-hero__badge">
          <span className="info-badge-dot" />
          À propos de la plateforme
        </div>
        <h1 className="info-hero__title">
          La santé connectée<br />
          <span>réinventée</span> pour le Maroc
        </h1>
        <p className="info-hero__sub">
          E-Santé est la première plateforme marocaine de santé numérique qui connecte
          patients et médecins pour une expérience médicale moderne, rapide et sécurisée.
        </p>
        <div className="info-hero__actions">
          <Link to="/doctors" className="info-btn info-btn--primary">
            <span>Trouver un médecin</span>
            <span className="info-btn__arrow">→</span>
          </Link>
          <Link to="/aide" className="info-btn info-btn--ghost">
            Centre d'aides
          </Link>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="info-stats-section">
        <div className="info-stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="info-stat-card" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="info-stat-card__icon">{s.icon}</span>
              <span className="info-stat-card__num">{s.num}</span>
              <span className="info-stat-card__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT SPLIT ===== */}
      <section className="info-about">
        <div className="info-about__text">
          <div className="info-section-badge">Notre mission</div>
          <h2 className="info-section-title">
            Démocratiser l'accès<br />
            aux <span>soins de qualité</span>
          </h2>
          <p className="info-about__p">
            E-Santé est née d'une vision simple : que chaque citoyen marocain puisse accéder
            facilement à des soins médicaux de qualité, peu importe sa localisation ou ses
            disponibilités.
          </p>
          <p className="info-about__p">
            Grâce à notre plateforme, la prise de rendez-vous, le suivi médical et la communication
            avec les professionnels de santé deviennent simples, rapides et accessibles 24h/24.
          </p>
          <div className="info-about__pills">
            <span>🇲🇦 100% Marocain</span>
            <span>🔒 RGPD Conforme</span>
            <span>🏥 Médecins Agréés</span>
          </div>
        </div>
        
        <div className="info-about__visual">
          <div className="info-about__card-wrap">
            
            {/* 🎯 MODIFICATION ICI : Liste Scrollable Dynamique */}
            <div 
              className="info-about__card info-about__card--1" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px', 
                padding: '12px', 
                maxHeight: '220px', 
                overflowY: 'auto', 
                alignItems: 'stretch' 
              }}
            >
              {medecins.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' }}>
                  Chargement des médecins...
                </div>
              ) : (
                medecins.map((medecin, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '8px 12px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px', background: 'white', padding: '6px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        👨‍⚕️
                      </span>
                      <div>
  <p className="info-about__card-title" style={{ fontSize: '13px', margin: '0 0 2px 0', textTransform: 'capitalize' }}>
    {/* 🎯 CORRECTION : U majuscule à User */}
    Dr. {medecin.User?.nom} {medecin.User?.prenom}
  </p>
  <p className="info-about__card-sub" style={{ fontSize: '11px', margin: 0 }}>
    {/* 🎯 CORRECTION : S majuscule à Specialite, et on utilise adresse s'il n'y a pas de ville */}
    {medecin.Specialite?.nom || 'Spécialiste'} · {medecin.adresse?.split(',')[1] || 'Maroc'}
  </p>
</div>
                    </div>
                    <span className="info-about__card-badge" style={{ fontSize: '9px', padding: '4px 6px' }}>
                      ✓ Dispo
                    </span>
                  </div>
                ))
              )}
            </div>
            {/* FIN MODIFICATION */}

            <div className="info-about__card info-about__card--2">
              <div className="info-about__card-stat">
                <span>📅</span>
                <div>
                  <p className="info-about__card-title">+1,200</p>
                  <p className="info-about__card-sub">RDV ce mois</p>
                </div>
              </div>
            </div>
            
            <div className="info-about__card info-about__card--3">
              <span>⭐</span>
              <div>
                <p className="info-about__card-title">4.9 / 5</p>
                <p className="info-about__card-sub">Note moyenne</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="info-features">
        <div className="info-section-header">
          <div className="info-section-badge">Fonctionnalités</div>
          <h2 className="info-section-title">
            Tout ce dont vous avez <span>besoin</span>
          </h2>
          <p className="info-section-sub">
            Une suite complète d'outils pour gérer votre santé au quotidien.
          </p>
        </div>
        <div className="info-features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className={`info-feature-card info-feature-card--${f.color}`} style={{ animationDelay: `${i * 70}ms` }}>
              <div className="info-feature-card__icon">{f.icon}</div>
              <h3 className="info-feature-card__title">{f.title}</h3>
              <p className="info-feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="info-how">
        <div className="info-section-header">
          <div className="info-section-badge">Comment ça marche ?</div>
          <h2 className="info-section-title">
            Prêt en <span>4 étapes</span>
          </h2>
          <p className="info-section-sub">De l'inscription à la consultation, tout se fait en quelques minutes.</p>
        </div>
        <div className="info-steps">
          {STEPS.map((s, i) => (
            <div key={i} className="info-step" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="info-step__num">{s.num}</div>
              <div className="info-step__icon">{s.icon}</div>
              <h3 className="info-step__title">{s.title}</h3>
              <p className="info-step__desc">{s.desc}</p>
              {i < STEPS.length - 1 && <div className="info-step__connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* ===== TABS: PATIENTS / MEDECINS ===== */}
      <section className="info-tabs-section">
        <div className="info-section-header">
          <div className="info-section-badge">Pour qui ?</div>
          <h2 className="info-section-title">
            Conçu pour <span>chacun</span>
          </h2>
        </div>
        <div className="info-tabs">
          <button
            className={`info-tab ${activeTab === 'patients' ? 'info-tab--active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            🧑‍💼 Patients
          </button>
          <button
            className={`info-tab ${activeTab === 'medecins' ? 'info-tab--active info-tab--active-teal' : ''}`}
            onClick={() => setActiveTab('medecins')}
          >
            👨‍⚕️ Médecins
          </button>
        </div>

        <div className="info-tab-content">
          {activeTab === 'patients' ? (
            <div className="info-tab-panel">
              {[
                { icon: '📅', title: 'Prenez RDV 24h/24', desc: 'Plus besoin d\'appeler. Réservez en ligne à tout moment.' },
                { icon: '📂', title: 'Gérez votre dossier', desc: 'Stockez et partagez vos documents médicaux en toute sécurité.' },
                { icon: '💬', title: 'Chatez avec votre médecin', desc: 'Communication directe et sécurisée avant et après la consultation.' },
                { icon: '🤖', title: 'Obtenez des conseils IA', desc: 'Notre assistant analyse vos symptômes et vous guide.' },
              ].map((item, i) => (
                <div key={i} className="info-tab-item" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="info-tab-item__icon">{item.icon}</div>
                  <div>
                    <p className="info-tab-item__title">{item.title}</p>
                    <p className="info-tab-item__desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="info-tab-panel">
              {[
                { icon: '📋', title: 'Gérez votre agenda', desc: 'Organisez vos consultations, confirmez ou annulez en un clic.' },
                { icon: '👥', title: 'Accédez aux dossiers patients', desc: 'Consultez les documents de vos patients en toute sécurité.' },
                { icon: '🔔', title: 'Gérez vos absences', desc: 'Bloquez vos indisponibilités pour éviter les réservations.' },
                { icon: '💰', title: 'Paiements automatiques', desc: 'Recevez vos honoraires directement sur votre compte.' },
              ].map((item, i) => (
                <div key={i} className="info-tab-item" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="info-tab-item__icon info-tab-item__icon--teal">{item.icon}</div>
                  <div>
                    <p className="info-tab-item__title">{item.title}</p>
                    <p className="info-tab-item__desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== SPÉCIALITÉS ===== */}
      <section className="info-specialites">
        <div className="info-section-header">
          <div className="info-section-badge">Nos spécialités</div>
          <h2 className="info-section-title">
            Des experts dans <span>chaque domaine</span>
          </h2>
        </div>
        <div className="info-spec-grid">
          {SPECIALITES.map((s, i) => (
            <div key={i} className="info-spec-card" style={{ animationDelay: `${i * 60}ms` }}>
              <span className="info-spec-card__icon">{s.icon}</span>
              <span className="info-spec-card__name">{s.name}</span>
            </div>
          ))}
        </div>
        <div className="info-spec-cta">
          <Link to="/doctors" className="info-btn info-btn--primary">
            <span>Voir tous les médecins</span>
            <span className="info-btn__arrow">→</span>
          </Link>
        </div>
      </section>

      {/* ===== TEMOIGNAGES ===== */}
      <section className="info-temoignages">
        <div className="info-section-header">
          <div className="info-section-badge">Témoignages</div>
          <h2 className="info-section-title">
            Ils nous font <span>confiance</span>
          </h2>
        </div>
        <div className="info-temo-grid">
          {TEMOIGNAGES.map((t, i) => (
            <div key={i} className="info-temo-card" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="info-temo-card__stars">
                {'⭐'.repeat(t.stars)}
              </div>
              <p className="info-temo-card__text">"{t.text}"</p>
              <div className="info-temo-card__author">
                <div className="info-temo-card__avatar">{t.avatar}</div>
                <div>
                  <p className="info-temo-card__name">{t.name}</p>
                  <p className="info-temo-card__role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="info-cta">
        <div className="info-cta__card">
          <div className="info-cta__circle info-cta__circle--1" />
          <div className="info-cta__circle info-cta__circle--2" />
          <div className="info-cta__badge">
            <span className="info-badge-dot info-badge-dot--white" />
            Rejoignez E-Santé
          </div>
          <h2 className="info-cta__title">
            Prenez le contrôle<br />de votre santé dès aujourd'hui
          </h2>
          <p className="info-cta__sub">
            Inscription gratuite · Plus de 200 spécialistes disponibles · Prise de RDV instantanée
          </p>
          <div className="info-cta__actions">
            <Link to="/doctors" className="info-btn info-btn--white">
              <span>Commencer maintenant</span>
              <span className="info-btn__arrow">→</span>
            </Link>
            <Link to="/centre-aide" className="info-btn info-btn--outline-white">
              Centre d'aides
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}