import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FaUser, FaCalendarCheck, FaHistory, FaFolderOpen, 
  FaUpload, FaTimesCircle, FaIdCard, FaEdit, FaComments, FaCheckCircle, FaStar, FaBell
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import Chat from '../components/chat/Chat'; 
import './PatientDashboard.css';
import Chatbot from '../components/Chatbot';

/* ============================================================
   MODAL AVIS PATIENT
   ============================================================ */
const NOTES_LABELS = ['', 'Très mauvais 😞', 'Mauvais 😕', 'Moyen 😐', 'Bien 😊', 'Excellent 🤩'];

function AvisModal({ onClose }) {
  const [note, setNote]               = useState(0);
  const [hover, setHover]             = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [submitted, setSubmitted]     = useState(false);
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (note === 0) return;
    try {
      setLoading(true);
      const patientId = localStorage.getItem('userId');
      await axios.post('http://localhost:5000/api/avis/ajouter', { patientId, note, commentaire });
      setSubmitted(true);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'avis:", error);
      alert("Une erreur est survenue lors de l'envoi de votre avis.");
    } finally {
      setLoading(false);
    }
  };

  const displayVal = hover || note;

  return (
    <div className="pd-modal-overlay" onClick={onClose}>
      <div className="pd-avis-modal" onClick={e => e.stopPropagation()}>
        <button className="pd-avis-modal__close" onClick={onClose}>✕</button>

        {submitted ? (
          <div className="pd-avis-success">
            <div className="pd-avis-success__orb" />
            <div className="pd-avis-success__icon">🌟</div>
            <p className="pd-avis-success__title">Merci pour votre avis !</p>
            <p className="pd-avis-success__sub">
              Votre retour nous aide à améliorer la plateforme E-Santé.<br />
              Nous apprécions votre confiance.
            </p>
            <button className="pd-btn pd-btn--primary" onClick={onClose} style={{ marginTop: 8 }}>Fermer</button>
          </div>
        ) : (
          <>
            <div className="pd-avis-modal__header">
              <div className="pd-avis-modal__icon">⭐</div>
              <div>
                <h3 className="pd-avis-modal__title">Donnez votre avis</h3>
                <p className="pd-avis-modal__sub">Votre expérience sur la plateforme E-Santé</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="pd-avis-form">
              <div className="pd-avis-block">
                <p className="pd-avis-label">Votre note</p>
                <div className="pd-avis-stars">
                  {[1,2,3,4,5].map(i => (
                    <button key={i} type="button"
                      className={`pd-star-btn ${displayVal >= i ? 'pd-star-btn--active' : ''}`}
                      onClick={() => setNote(i)}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(0)}
                    >★</button>
                  ))}
                  {displayVal > 0 && <span className="pd-avis-note-label">{NOTES_LABELS[displayVal]}</span>}
                </div>
              </div>

              <div className="pd-avis-block">
                <p className="pd-avis-label">
                  Commentaire <span style={{ color: '#94a3b8', fontWeight: 500, textTransform: 'none' }}>(optionnel)</span>
                </p>
                <textarea
                  className="pd-avis-textarea" rows={4}
                  placeholder="Partagez votre expérience sur la plateforme..."
                  value={commentaire} onChange={e => setCommentaire(e.target.value)}
                />
              </div>

              <div className="pd-avis-actions">
                <button type="button" className="pd-btn pd-btn--ghost" onClick={onClose}>Annuler</button>
                <button type="submit"
                  className={`pd-btn pd-btn--primary ${note === 0 ? 'pd-avis-submit--disabled' : ''}`}
                  disabled={note === 0 || loading}
                >
                  {loading ? <><span className="pd-avis-spinner" /> Envoi...</> : <><span>⭐</span> Envoyer mon avis</>}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PATIENT DASHBOARD
   ============================================================ */
export default function PatientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab]               = useState('profil');
  const [rendezVous, setRendezVous]             = useState([]);
  const [successMessage]                        = useState(location.state?.message || '');
  const [activeChat, setActiveChat]             = useState(null);
  const [documents, setDocuments]               = useState([]);
  const [uploadStatus, setUploadStatus]         = useState(null);
  const [sidebarExpanded, setSidebarExpanded]   = useState(false);
  const [showAvisModal, setShowAvisModal]       = useState(false);

  // Cloche notifications
  const [notifOpen, setNotifOpen]           = useState(false);
  const [notifications, setNotifications]   = useState([]);
  const [seenIds, setSeenIds]               = useState(new Set());
  const notifRef = useRef(null);

  const [showCancelModal, setShowCancelModal]             = useState(false);
  const [showSuccessModal, setShowSuccessModal]           = useState(false);
  const [appointmentToCancelId, setAppointmentToCancelId] = useState(null);
  const [showDeleteDocModal, setShowDeleteDocModal]       = useState(false);
  const [docToDeleteId, setDocToDeleteId]                 = useState(null);

  const [patientInfo, setPatientInfo] = useState({
    nom: 'Chargement...', email: '...', telephone: 'Non renseigné',
    adresse: 'Non renseignée', date_naissance: 'Non renseignée',
    groupe_sanguin: 'Non renseigné', sexe: 'Non renseigné'
  });

  const patientId = localStorage.getItem('userId');

  useEffect(() => {
    if (!patientId) return;

    Promise.all([
      axios.get(`http://localhost:5000/api/auth/user/${patientId}`),
      axios.get(`http://localhost:5000/api/patients/profile?userId=${patientId}`).catch(() => ({ data: {} }))
    ]).then(([userRes, patientRes]) => {
      const user = userRes.data, patient = patientRes.data;
      setPatientInfo({
        nom:            user.nom            || 'Utilisateur sans nom',
        email:          user.email          || 'Non renseigné',
        telephone:      patient.telephone   || 'Non renseigné',
        adresse:        patient.adresse     || 'Non renseignée',
        date_naissance: patient.date_naissance || 'Non renseignée',
        groupe_sanguin: patient.groupe_sanguin || 'Non renseigné',
        sexe: patient.sexe === 'M' ? 'Homme' : patient.sexe === 'F' ? 'Femme' : 'Non renseigné'
      });
    }).catch(err => console.log('Erreur profil :', err));

    axios.get(`http://localhost:5000/api/appointments/patient/${patientId}`)
      .then(res => {
        const rdvs = res.data.map(rdv => ({
          id:        rdv.id,
          medecinId: rdv.medecin_id,
          medecin:   rdv.nom_medecin || `Médecin N°${rdv.medecin_id}`,
          date:      rdv.date_rdv,
          heure:     rdv.heure_rdv,
          motif:     rdv.motif,
          statut:    rdv.statut,
          tarif:     rdv.tarif || 200,
        }));
        setRendezVous(rdvs);
        buildNotifications(rdvs);
      }).catch(err => console.log('Erreur RDV :', err));

    fetchDocuments();
  }, [patientId]);

  const buildNotifications = (rdvs) => {
    const stored = JSON.parse(localStorage.getItem(`pd_seen_${patientId}`) || '[]');
    const seenSet = new Set(stored);
    const notifs = rdvs
      .filter(r => r.statut === 'Confirmé' || r.statut === 'Annulé')
      .map(r => ({ ...r, _read: seenSet.has(`${r.id}_${r.statut}`) }));
    setNotifications(notifs);
    setSeenIds(seenSet);
  };

  // Fermer dropdown si clic en dehors
  useEffect(() => {
    const handleOut = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleOut);
    return () => document.removeEventListener('mousedown', handleOut);
  }, []);

  const handleOpenNotif = () => {
    setNotifOpen(v => !v);
    if (!notifOpen) {
      const newSeen = new Set(notifications.map(n => `${n.id}_${n.statut}`));
      localStorage.setItem(`pd_seen_${patientId}`, JSON.stringify([...newSeen]));
      setNotifications(prev => prev.map(n => ({ ...n, _read: true })));
      setSeenIds(newSeen);
    }
  };

  const unreadCount = notifications.filter(n => !n._read).length;

  // ✅ Redirection vers la page de paiement depuis la notification
  const handlePayFromNotif = (notif) => {
    setNotifOpen(false);
    navigate('/payment', {
      state: {
        appointmentId: notif.id,
        medecinId:  notif.medecinId,
        patientId,
        date_rdv:   notif.date,
        heure_rdv:  notif.heure,
        motif:      notif.motif,
        medecinNom: notif.medecin,
        tarif:      notif.tarif || 200,
        amount:     notif.tarif || 200,
      }
    });
  };

  useEffect(() => {
    if (activeTab === 'documents' && patientId) fetchDocuments();
  }, [activeTab, patientId]);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/documents/${patientId}`);
      if (res.data.success) setDocuments(res.data.documents);
    } catch (err) { console.error('Erreur chargement documents :', err); }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setUploadStatus({ type: 'error', message: 'Veuillez sélectionner un fichier PDF uniquement.' });
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploadStatus({ type: 'loading', message: 'Envoi du document...' });
    try {
      const res = await axios.post(
        `http://localhost:5000/api/appointments/upload-medical/${patientId}`,
        formData, { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (res.data.success) {
        setUploadStatus({ type: 'success', message: 'Document médical ajouté avec succès !' });
        fetchDocuments();
      }
    } catch { setUploadStatus({ type: 'error', message: "Erreur lors de l'envoi." }); }
  };

  const handleDeleteFile  = (id) => { setDocToDeleteId(id); setShowDeleteDocModal(true); };
  const confirmDeleteFile = async () => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/documents/${docToDeleteId}`);
      if (res.data.success) fetchDocuments();
    } catch { alert('Impossible de supprimer le document.'); }
    setShowDeleteDocModal(false);
  };

  const handleCancel  = (id) => { setAppointmentToCancelId(id); setShowCancelModal(true); };
  const confirmCancel = async () => {
    try {
      // 🎯 On utilise PUT pour changer le statut en "Annulé" au lieu de DELETE
      const res = await axios.put(`http://localhost:5000/api/appointments/${appointmentToCancelId}/statut`, { 
        statut: 'Annulé' 
      });
      
      if (res.data.success) {
        // 🎯 On met à jour l'affichage avec .map() au lieu de .filter()
        setRendezVous(prev => prev.map(r => 
          r.id === appointmentToCancelId ? { ...r, statut: 'Annulé' } : r
        ));
        
        setShowCancelModal(false);
        setShowSuccessModal(true);
      }
    } catch (err) { 
      setShowCancelModal(false); 
      console.error(err);
      alert('Erreur lors de l\'annulation du rendez-vous.'); 
    }
  };

  const handleEditProfile = () => {
    localStorage.getItem('role') === 'medecin'
      ? navigate('/edit-profile-medecin')
      : navigate('/edit-profile');
  };

  // 🎯 REMPLACE CETTE LIGNE :
const rdvsAVenir = rendezVous.filter(r => r.statut === 'À venir' || r.statut === 'Confirmé' || r.statut === 'Payé');

  const menuItems = [
    { id: 'profil',     icon: <FaIdCard />,       label: 'Mes Informations' },
    { id: 'rdv',        icon: <FaCalendarCheck />, label: 'Mes Rendez-vous' },
    { id: 'historique', icon: <FaHistory />,       label: 'Mon Historique' },
    { id: 'documents',  icon: <FaFolderOpen />,    label: 'Mes Documents' },
  ];

  const getInitials = (name) => {
    if (!name || name === 'Chargement...') return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="pd-root">

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`pd-sidebar ${sidebarExpanded ? 'pd-sidebar--open' : ''}`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="pd-sidebar__glow" />
        <div className="pd-sidebar__avatar-wrap">
          <div className="pd-sidebar__avatar"><span>{getInitials(patientInfo.nom)}</span></div>
          <div className="pd-sidebar__avatar-info">
            <span className="pd-sidebar__avatar-name">{patientInfo.nom}</span>
            <span className="pd-sidebar__avatar-role">Dossier Santé</span>
          </div>
        </div>
        <div className="pd-sidebar__divider" />
        <nav className="pd-sidebar__nav">
          {menuItems.map(item => (
            <button key={item.id}
              className={`pd-nav-item ${activeTab === item.id ? 'pd-nav-item--active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="pd-nav-item__icon">{item.icon}</span>
              <span className="pd-nav-item__label">{item.label}</span>
              {activeTab === item.id && <span className="pd-nav-item__dot" />}
            </button>
          ))}
          <button className="pd-nav-item pd-nav-item--avis" onClick={() => setShowAvisModal(true)}>
            <span className="pd-nav-item__icon"><FaStar /></span>
            <span className="pd-nav-item__label">Mon Avis</span>
          </button>
        </nav>
        <div className="pd-sidebar__footer">
          <div className="pd-sidebar__pulse-dot" />
          <span className="pd-sidebar__footer-label">Système en ligne</span>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="pd-main">
        <header className="pd-topbar">
          <div className="pd-topbar__greeting">
            <p className="pd-topbar__sub">Tableau de bord patient</p>
            <h1 className="pd-topbar__title">Bonjour, <span>{patientInfo.nom}</span> 👋</h1>
          </div>
          <div className="pd-topbar__actions">
            <div className="pd-topbar__stat">
              <span className="pd-topbar__stat-num">{rdvsAVenir.length}</span>
              <span className="pd-topbar__stat-lbl">RDV à venir</span>
            </div>
            <div className="pd-topbar__stat">
              <span className="pd-topbar__stat-num">{documents.length}</span>
              <span className="pd-topbar__stat-lbl">Documents</span>
            </div>

            {/* ===== CLOCHE NOTIFICATIONS ===== */}
            <div className="pd-notif-wrap" ref={notifRef}>
              <button
                className={`pd-notif-bell ${unreadCount > 0 ? 'pd-notif-bell--active' : ''}`}
                onClick={handleOpenNotif}
                title="Mes notifications"
              >
                <FaBell size={17} />
                {unreadCount > 0 && <span className="pd-notif-badge">{unreadCount}</span>}
              </button>

              {notifOpen && (
                <div className="pd-notif-dropdown">
                  <div className="pd-notif-dropdown__header">
                    <div className="pd-notif-dropdown__title">
                      <FaBell size={13} /> Mes notifications
                    </div>
                    <span className="pd-notif-dropdown__count">{notifications.length}</span>
                  </div>

                  <div className="pd-notif-dropdown__glow" />

                  {notifications.length === 0 ? (
                    <div className="pd-notif-empty">
                      <span className="pd-notif-empty__icon">🔔</span>
                      <p>Aucune notification</p>
                      <small>Vos mises à jour de RDV apparaîtront ici</small>
                    </div>
                  ) : (
                    <div className="pd-notif-list">
                      {notifications.map((notif, i) => {
                        const isConfirmed = notif.statut === 'Confirmé';
                        const isCancelled = notif.statut === 'Annulé';
                        return (
                          <div key={notif.id}
                            className={`pd-notif-item ${isConfirmed ? 'pd-notif-item--confirmed' : ''} ${isCancelled ? 'pd-notif-item--cancelled' : ''}`}
                            style={{ animationDelay: `${i * 60}ms` }}
                          >
                            {/* Icône statut */}
                            <div className={`pd-notif-item__status-icon ${isConfirmed ? 'pd-notif-item__status-icon--green' : 'pd-notif-item__status-icon--red'}`}>
                              {isConfirmed ? <FaCheckCircle size={16} /> : <FaTimesCircle size={16} />}
                            </div>

                            {/* Contenu */}
                            <div className="pd-notif-item__content">
                              <p className="pd-notif-item__title">
                                {isConfirmed ? '✅ Rendez-vous confirmé !' : '❌ Rendez-vous annulé'}
                              </p>
                              <p className="pd-notif-item__medecin">Dr. {notif.medecin}</p>
                              <p className="pd-notif-item__details">
                                📅 {notif.date} · 🕐 {notif.heure}
                              </p>
                              <p className="pd-notif-item__motif">{notif.motif}</p>

                              <span className={`pd-notif-item__badge ${isConfirmed ? 'pd-notif-item__badge--green' : 'pd-notif-item__badge--red'}`}>
                                {isConfirmed ? 'Confirmé par le médecin' : 'Annulé par le médecin'}
                              </span>

                              {/* ✅ BOUTON PAIEMENT — RDV Confirmé uniquement */}
                              {isConfirmed && (
                                <div className="pd-notif-item__pay">
                                  <button
                                    className="pd-notif-pay-btn"
                                    onClick={() => handlePayFromNotif(notif)}
                                  >
                                    <span>💳</span>
                                    Procéder au paiement
                                    <span className="pd-notif-pay-btn__arrow">→</span>
                                  </button>
                                  <p className="pd-notif-pay-btn__amount">{notif.tarif || 200} DH</p>
                                </div>
                              )}

                              {/* Bouton reprendre RDV — RDV Annulé uniquement */}
                              {isCancelled && (
                                <p className="pd-notif-item__cta">
                                  👉 <button onClick={() => { navigate('/doctors'); setNotifOpen(false); }}>
                                    Reprendre un RDV
                                  </button>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pd-notif-dropdown__footer">
                    <button onClick={() => { setActiveTab('rdv'); setNotifOpen(false); }}>
                      Voir mes rendez-vous →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {successMessage && (
          <div className="pd-alert pd-alert--success"><FaCheckCircle /> {successMessage}</div>
        )}

        {/* ===== TAB: PROFIL ===== */}
        {activeTab === 'profil' && (
          <div className="pd-card pd-fade-in">
            <div className="pd-card__header">
              <div className="pd-card__icon-wrap pd-card__icon-wrap--blue"><FaIdCard /></div>
              <div>
                <h2 className="pd-card__title">Mes Informations Personnelles</h2>
                <p className="pd-card__subtitle">Vos données médicales et de contact</p>
              </div>
            </div>
            <div className="pd-info-grid">
              {[
                { label: 'Nom',               value: `${patientInfo.prenom || ''} ${patientInfo.nom || ''}`.trim(), icon: '👤', cap: true  },
                { label: 'Email',             value: patientInfo.email,          icon: '✉️',  cap: false },
                { label: 'Téléphone',         value: patientInfo.telephone,      icon: '📱',  cap: false },
                { label: 'Date de naissance', value: patientInfo.date_naissance, icon: '🎂',  cap: false },
                { label: 'Groupe Sanguin',    value: patientInfo.groupe_sanguin, icon: '🩸',  cap: false },
                { label: 'Adresse',           value: patientInfo.adresse,        icon: '📍',  cap: true  },
                { label: 'Sexe',              value: patientInfo.sexe,           icon: '⚕️',  cap: true  },
              ].map((item, i) => (
                <div className="pd-info-cell" key={i} style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="pd-info-cell__emoji">{item.icon}</span>
                  <div>
                    <p className="pd-info-cell__label">{item.label}</p>
                    <p className="pd-info-cell__value" style={{ textTransform: item.cap ? 'capitalize' : 'none' }}>
                      {item.value || 'Non renseigné'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="pd-btn pd-btn--primary" onClick={handleEditProfile}>
              <FaEdit /> Modifier mon profil
            </button>
          </div>
        )}

        {/* ===== TAB: RDV ===== */}
        {activeTab === 'rdv' && (
          <div className="pd-card pd-fade-in">
            <div className="pd-card__header">
              <div className="pd-card__icon-wrap pd-card__icon-wrap--green"><FaCalendarCheck /></div>
              <div>
                <h2 className="pd-card__title">Prochains Rendez-vous</h2>
                <p className="pd-card__subtitle">{rdvsAVenir.length} rendez-vous confirmé(s)</p>
              </div>
            </div>
            <div className="pd-rdv-list">
              {rdvsAVenir.length === 0 ? (
                <div className="pd-empty">
                  <div className="pd-empty__icon">📅</div>
                  <p className="pd-empty__title">Aucun rendez-vous prévu</p>
                  <p className="pd-empty__sub">Vos prochains rendez-vous apparaîtront ici.</p>
                </div>
              ) : rdvsAVenir.map((rdv, i) => (
                <div key={rdv.id} className="pd-rdv-card" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="pd-rdv-card__date">
                    <span className="pd-rdv-card__day">{rdv.date}</span>
                    <span className="pd-rdv-card__time">{rdv.heure}</span>
                  </div>
                  <div className="pd-rdv-card__info">
                    <h4 className="pd-rdv-card__doctor">{rdv.medecin}</h4>
                    <p className="pd-rdv-card__motif">Motif : {rdv.motif}</p>
                    <span className="pd-badge pd-badge--active">{rdv.statut}</span>
                  </div>
                  <div className="pd-rdv-card__actions">
                    <button className="pd-btn pd-btn--chat" onClick={() => setActiveChat(rdv)}><FaComments /> Chat</button>
                    <button className="pd-btn pd-btn--danger" onClick={() => handleCancel(rdv.id)}><FaTimesCircle /> Annuler</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TAB: HISTORIQUE ===== */}
        {activeTab === 'historique' && (
          <div className="pd-card pd-fade-in">
            <div className="pd-card__header">
              <div className="pd-card__icon-wrap pd-card__icon-wrap--purple"><FaHistory /></div>
              <div>
                <h2 className="pd-card__title">Historique Complet</h2>
                <p className="pd-card__subtitle">{rendezVous.length} consultations au total</p>
              </div>
            </div>
            <div className="pd-rdv-list">
              {rendezVous.length === 0 ? (
                <div className="pd-empty"><div className="pd-empty__icon">📋</div><p className="pd-empty__title">Aucun historique</p></div>
              ) : rendezVous.map((rdv, i) => (
                <div key={rdv.id} className="pd-rdv-card pd-rdv-card--history" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="pd-rdv-card__date">
                    <span className="pd-rdv-card__day">{rdv.date}</span>
                    <span className="pd-rdv-card__time">{rdv.heure}</span>
                  </div>
                  <div className="pd-rdv-card__info">
                    <h4 className="pd-rdv-card__doctor">{rdv.medecin}</h4>
                    <span className={`pd-badge ${rdv.statut === 'Confirmé' || rdv.statut === 'À venir' ? 'pd-badge--active' : rdv.statut === 'Terminé' ? 'pd-badge--done' : 'pd-badge--cancelled'}`}>{rdv.statut}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TAB: DOCUMENTS ===== */}
        {activeTab === 'documents' && (
          <div className="pd-card pd-fade-in">
            <div className="pd-card__header">
              <div className="pd-card__icon-wrap pd-card__icon-wrap--orange"><FaFolderOpen /></div>
              <div>
                <h2 className="pd-card__title">Mes Documents Médicaux</h2>
                <p className="pd-card__subtitle">{documents.length} fichier(s) enregistré(s)</p>
              </div>
            </div>
            <div className="pd-upload-zone">
              <input type="file" id="file-upload" className="pd-upload-zone__input" onChange={e => handleFileUpload(e.target.files[0])} />
              <label htmlFor="file-upload" className="pd-upload-zone__label">
                <div className="pd-upload-zone__icon"><FaUpload /></div>
                <p className="pd-upload-zone__title">Déposez votre fichier ici</p>
                <p className="pd-upload-zone__sub">Format PDF uniquement · Cliquez pour parcourir</p>
              </label>
            </div>
            {uploadStatus && (
              <div className={`pd-alert ${uploadStatus.type === 'success' ? 'pd-alert--success' : uploadStatus.type === 'error' ? 'pd-alert--error' : 'pd-alert--info'}`}>
                {uploadStatus.message}
              </div>
            )}
            <div className="pd-doc-grid">
              {documents.length === 0 ? (
                <div className="pd-empty">
                  <div className="pd-empty__icon">📂</div>
                  <p className="pd-empty__title">Aucun document</p>
                  <p className="pd-empty__sub">Uploadez vos documents médicaux pour y accéder à tout moment.</p>
                </div>
              ) : documents.map((doc, i) => (
                <div key={doc.id} className="pd-doc-card" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="pd-doc-card__pdf-icon">PDF</div>
                  <div className="pd-doc-card__info">
                    <p className="pd-doc-card__name">{doc.nom_original}</p>
                    <p className="pd-doc-card__date">{new Date(doc.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <button className="pd-doc-card__delete" onClick={() => handleDeleteFile(doc.id)}><FaTimesCircle /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat modal */}
        {activeChat && (
          <div className="pd-modal-overlay">
            <div className="pd-chat-container">
              <button className="pd-chat-close" onClick={() => setActiveChat(null)}><FaTimesCircle /> Fermer la conversation</button>
              <Chat rendezVousId={activeChat.id} userId={patientId} currentUserName={patientInfo.nom} />
            </div>
          </div>
        )}
      </main>

      {/* ===== MODAL AVIS ===== */}
      {showAvisModal && <AvisModal onClose={() => setShowAvisModal(false)} />}

      {/* ===== MODALS ===== */}
      {showCancelModal && (
        <div className="pd-modal-overlay">
          <div className="pd-modal pd-modal--danger">
            <div className="pd-modal__icon-ring pd-modal__icon-ring--red"><FaTimesCircle size={32} /></div>
            <h3 className="pd-modal__title">Annuler ce rendez-vous ?</h3>
            <p className="pd-modal__body">Cette action supprimera définitivement le rendez-vous de votre agenda.</p>
            <div className="pd-modal__actions">
              <button className="pd-btn pd-btn--danger" onClick={confirmCancel}>Oui, annuler</button>
              <button className="pd-btn pd-btn--ghost" onClick={() => setShowCancelModal(false)}>Conserver</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteDocModal && (
        <div className="pd-modal-overlay">
          <div className="pd-modal pd-modal--danger">
            <div className="pd-modal__icon-ring pd-modal__icon-ring--red"><FaTimesCircle size={32} /></div>
            <h3 className="pd-modal__title">Supprimer ce document ?</h3>
            <p className="pd-modal__body">Ce fichier sera définitivement retiré de votre dossier médical.</p>
            <div className="pd-modal__actions">
              <button className="pd-btn pd-btn--danger" onClick={confirmDeleteFile}>Supprimer</button>
              <button className="pd-btn pd-btn--ghost" onClick={() => setShowDeleteDocModal(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="pd-modal-overlay">
          <div className="pd-modal pd-modal--success">
            <div className="pd-modal__icon-ring pd-modal__icon-ring--green"><FaCheckCircle size={32} /></div>
            <h3 className="pd-modal__title">C'est fait !</h3>
            <p className="pd-modal__body">Le rendez-vous a été annulé avec succès.</p>
            <div className="pd-modal__actions">
              <button className="pd-btn pd-btn--primary" onClick={() => setShowSuccessModal(false)}>D'accord</button>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
    </div>
  );
}