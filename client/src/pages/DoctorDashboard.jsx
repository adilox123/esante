import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserMd, FaCalendarAlt, FaUserInjured, FaNotesMedical, 
  FaCheckCircle, FaBan, FaSearch, FaSortAmountDown, 
  FaIdCard, FaEdit, FaComments, FaTimesCircle, FaBell
} from 'react-icons/fa';
import Chat from '../components/chat/Chat'; 
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profil');
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const [sortType, setSortType] = useState('date-asc'); 
  const [searchPatient, setSearchPatient] = useState(''); 
  
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [periodeAbsence, setPeriodeAbsence] = useState('Journée entière');
  const [absences, setAbsences] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vraiId, setVraiId] = useState(null);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [absenceToDelete, setAbsenceToDelete] = useState(null);
  const [showAddSuccessModal, setShowAddSuccessModal] = useState(false);

  // ✅ NOUVEAU : États pour la cloche de notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [rdvActionFeedback, setRdvActionFeedback] = useState(null); // { type: 'success'|'error', msg }
  const notifRef = useRef(null);
  const [visiblePhoneId, setVisiblePhoneId] = useState(null);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [rdvToMarkAbsent, setRdvToMarkAbsent] = useState(null);

  const medecinId = localStorage.getItem('userId');

  const [medecinInfo, setMedecinInfo] = useState({
    nom: "Chargement...",
    email: "...",
    telephone: "Non renseigné",
    adresse: "Non renseignée",
    specialite: "Médecin" 
  });

  const [rendezVous, setRendezVous] = useState([]);

  const fetchAbsences = async (idToFetch) => {
    try {
      const id = idToFetch || medecinId;
      const res = await axios.get(`http://localhost:5000/api/absences/${id}`);
      if (res.data.success) setAbsences(res.data.absences);
    } catch (err) {
      console.error("Erreur lors de la récupération des absences:", err);
    }
  };

  useEffect(() => {
    if (!medecinId) return;

    Promise.all([
      axios.get(`http://localhost:5000/api/auth/user/${medecinId}`),
      axios.get(`http://localhost:5000/api/medecins/profile?userId=${medecinId}`).catch(() => ({ data: {} }))
    ])
    .then(([userRes, medecinRes]) => {
      const user = userRes.data;
      const medecin = medecinRes.data;
      setMedecinInfo({
        nom: user.nom || "Utilisateur sans nom",
        email: user.email || "Non renseigné",
        telephone: medecin.telephone || "Non renseigné",
        adresse: medecin.adresse || "Non renseignée",
        specialite: medecin.specialite?.nom || "Médecin" 
      });
      const vraiMedecinId = medecin.id;
      if (vraiMedecinId) {
        setVraiId(vraiMedecinId);
        fetchAbsences(vraiMedecinId); 
        return axios.get(`http://localhost:5000/api/appointments/medecin/${vraiMedecinId}`);
      } else {
        throw new Error("ID Médecin introuvable");
      }
    })
    .then(res => {
      if (res) {
        const vraisRdvs = res.data.map(rdv => ({
          id: rdv.id,
          patient_id: rdv.patient_id,
          patient: rdv.nom_patient || `Patient N°${rdv.patient_id}`,
          telephone: rdv.telephone_patient || rdv.telephone || '', // ✅ MODIFICATION: Ajout du téléphone pour l'appel
          date: rdv.date_rdv,
          heure: rdv.heure_rdv,
          motif: rdv.motif,
          statut: rdv.statut,
          noteSecrete: rdv.note_secrete,
        }));
        setRendezVous(vraisRdvs);

        // ✅ NOUVEAU : Initialiser les notifications avec les RDV "À venir"
        const rdvsEnAttente = vraisRdvs.filter(r => r.statut === 'En attente');
        setNotifications(rdvsEnAttente.map(r => ({ ...r, _read: false })));
      }
    })
    .catch(err => console.error("Erreur chargement :", err));
  }, [medecinId]);

  // ✅ NOUVEAU : Fermer la cloche si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ NOUVEAU : Confirmer un RDV
  const handleConfirmRdv = async (rdvId) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${rdvId}/statut`, { statut: 'Confirmé' });
      
      setRendezVous(prev => prev.map(r => r.id === rdvId ? { ...r, statut: 'Confirmé' } : r));
      setNotifications(prev => prev.map(n => n.id === rdvId ? { ...n, statut: 'Confirmé', _read: true } : n));
      setRdvActionFeedback({ type: 'success', msg: '✅ Rendez-vous confirmé avec succès !' });
      setTimeout(() => setRdvActionFeedback(null), 3000);
    } catch (err) {
      console.error(err); 
      setRdvActionFeedback({ type: 'error', msg: '❌ Erreur lors de la confirmation.' });
      setTimeout(() => setRdvActionFeedback(null), 3000);
    }
  };

  // ✅ NOUVEAU : Annuler un RDV
  const handleCancelRdv = async (rdvId) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${rdvId}/statut`, { statut: 'Annulé' });
      
      setRendezVous(prev => prev.map(r => r.id === rdvId ? { ...r, statut: 'Annulé' } : r));
      setNotifications(prev => prev.filter(n => n.id !== rdvId));
      
      setRdvActionFeedback({ type: 'success', msg: '🗑️ Rendez-vous annulé.' });
      setTimeout(() => setRdvActionFeedback(null), 3000);
    } catch (err) {
      console.error("Erreur annulation:", err);
      setRdvActionFeedback({ type: 'error', msg: '❌ Erreur lors de l\'annulation.' });
      setTimeout(() => setRdvActionFeedback(null), 3000);
    }
  };

  // ✅ NOUVEAU : Marquer un patient comme absent (Non honoré)
 const handlePatientAbsent = (rdv) => {
  setRdvToMarkAbsent(rdv); // On stocke le RDV sélectionné
  setShowAbsentModal(true); // On ouvre la modale
};

// La fonction qui sera appelée quand on clique sur "Confirmer" dans la modale
const confirmAbsentAction = async () => {
  if (!rdvToMarkAbsent) return;
  try {
    await axios.put(`http://localhost:5000/api/appointments/${rdvToMarkAbsent.id}/statut`, { statut: 'non honoré' });
    setRendezVous(prev => prev.map(r => r.id === rdvToMarkAbsent.id ? { ...r, statut: 'non honoré' } : r));
    setRdvActionFeedback({ type: 'success', msg: '⚠️ Patient marqué comme absent.' });
    setTimeout(() => setRdvActionFeedback(null), 3000);
  } catch (err) {
    setRdvActionFeedback({ type: 'error', msg: '❌ Erreur de mise à jour.' });
  } finally {
    setShowAbsentModal(false);
    setRdvToMarkAbsent(null);
  }
};

  const unreadCount = notifications.filter(n => !n._read).length;

  const handleViewDetails = async (rdv) => {
    const patientId = rdv.patient_id;
    if (!patientId) { alert("Impossible de trouver l'ID du patient"); return; }
    try {
      const res = await axios.get(`http://localhost:5000/api/documents/${patientId}`);
      const documents = res.data.success ? res.data.documents : [];
      setSelectedPatient({
        nomComplet: rdv.patient,
        statut: rdv.statut,
        motif: rdv.motif,
        date: rdv.date,
        heure: rdv.heure,
        fichiers: documents
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Erreur chargement documents:", error);
    }
  };

  const handleEditProfile = () => navigate('/edit-profile-medecin');

  const sortedRdv = [...rendezVous]
    .filter(r => r.statut === "À venir" || r.statut === "Confirmé" || r.statut === "Payé")
    .sort((a, b) => {
      if (sortType === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortType === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortType === 'nom') return a.patient.localeCompare(b.patient);
      return 0;
    });

  const filteredHistory = [...rendezVous]
    .filter(r => r.patient.toLowerCase().includes(searchPatient.toLowerCase()))
    .sort((a, b) => {
      if (sortType === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortType === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortType === 'nom') return a.patient.localeCompare(b.patient);
      return 0;
    });

  const handleSaveNote = async (id, text) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}/note`, { note_secrete: text });
      setRendezVous(rendezVous.map(rdv => rdv.id === id ? { ...rdv, noteSecrete: text } : rdv));
      setActiveNoteId(null);
      alert("🔒 Note secrète enregistrée !");
    } catch (err) {
      alert("❌ Erreur serveur lors de la sauvegarde.");
    }
  };

  const handleSaveAbsence = async () => {
    if (!vraiId) return alert("Erreur : Profil non chargé.");
    if (!dateDebut) return alert("⚠️ Veuillez choisir au moins une date de début !");
    try {
      await axios.post('http://localhost:5000/api/absences', {
        medecin_id: vraiId,
        date_debut: dateDebut,
        date_fin: dateFin || dateDebut,
        periode: periodeAbsence
      });
      setDateDebut('');
      setDateFin('');
      fetchAbsences(vraiId); 
      setShowAddSuccessModal(true);
      setTimeout(() => setShowAddSuccessModal(false), 2000);
    } catch (err) {
      alert("❌ Erreur serveur lors de la sauvegarde du congé.");
    }
  };

  const handleDeleteAbsence = (id) => {
    setAbsenceToDelete(id);
    setShowConfirmModal(true); 
  };

  const confirmDelete = async () => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/absences/${absenceToDelete}`);
      if (res.data.success) {
        fetchAbsences(vraiId); 
        setShowConfirmModal(false); 
        setShowSuccessModal(true);  
        setTimeout(() => setShowSuccessModal(false), 2000);
      }
    } catch (err) {
      alert("Erreur lors de la suppression de l'absence");
    }
  };

  const getInitials = (name) => {
    if (!name || name === 'Chargement...') return 'Dr';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const menuItems = [
    { id: 'profil',    icon: <FaIdCard />,      label: 'Mes Informations' },
    { id: 'rdv',       icon: <FaCalendarAlt />,  label: 'Mon Agenda' },
    { id: 'patients',  icon: <FaUserInjured />,  label: 'Dossiers Patients' },
    { id: 'absences',  icon: <FaBan />,          label: 'Gérer mes Absences' },
  ];

  const rdvAVenir = rendezVous.filter(r => r.statut === "À venir" || r.statut === "Confirmé" || r.statut === "Payé");

  return (
    <div className="dd-root">

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`dd-sidebar ${sidebarExpanded ? 'dd-sidebar--open' : ''}`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="dd-sidebar__glow" />

        <div className="dd-sidebar__avatar-wrap">
          <div className="dd-sidebar__avatar">
            <span>{getInitials(medecinInfo.nom)}</span>
          </div>
          <div className="dd-sidebar__avatar-info">
            <span className="dd-sidebar__avatar-name">{medecinInfo.nom}</span>
            <span className="dd-sidebar__avatar-role">Espace Praticien</span>
          </div>
        </div>

        <div className="dd-sidebar__divider" />

        <nav className="dd-sidebar__nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`dd-nav-item ${activeTab === item.id ? 'dd-nav-item--active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="dd-nav-item__icon">{item.icon}</span>
              <span className="dd-nav-item__label">{item.label}</span>
              {activeTab === item.id && <span className="dd-nav-item__dot" />}
            </button>
          ))}
        </nav>

        <div className="dd-sidebar__footer">
          <div className="dd-sidebar__pulse-dot" />
          <span className="dd-sidebar__footer-label">Système en ligne</span>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="dd-main">

        {/* Top bar */}
        <header className="dd-topbar">
          <div className="dd-topbar__greeting">
            <p className="dd-topbar__sub">Tableau de bord médecin</p>
            <h1 className="dd-topbar__title">Bonjour, Dr. <span>{medecinInfo.nom}</span> 👨‍⚕️</h1>
          </div>
          <div className="dd-topbar__actions">
            <div className="dd-topbar__stat dd-topbar__stat--blue">
              <span className="dd-topbar__stat-num">{rdvAVenir.length}</span>
              <span className="dd-topbar__stat-lbl">RDV à venir</span>
            </div>
            <div className="dd-topbar__stat dd-topbar__stat--green">
              <span className="dd-topbar__stat-num">{rendezVous.length}</span>
              <span className="dd-topbar__stat-lbl">Total patients</span>
            </div>
            <div className="dd-topbar__stat dd-topbar__stat--orange">
              <span className="dd-topbar__stat-num">{absences.length}</span>
              <span className="dd-topbar__stat-lbl">Absences</span>
            </div>

            {/* ✅ NOUVEAU : CLOCHE DE NOTIFICATION */}
            <div className="dd-notif-wrap" ref={notifRef}>
              <button
                className={`dd-notif-bell ${unreadCount > 0 ? 'dd-notif-bell--active' : ''}`}
                onClick={() => {
                  setNotifOpen(v => !v);
                  if (!notifOpen) setNotifications(prev => prev.map(n => ({ ...n, _read: true })));
                }}
                title="Notifications rendez-vous"
              >
                <FaBell size={18} />
                {unreadCount > 0 && (
                  <span className="dd-notif-badge">{unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="dd-notif-dropdown">
                  <div className="dd-notif-dropdown__header">
                    <div className="dd-notif-dropdown__title">
                      <FaBell size={14} />
                      Rendez-vous en attente
                    </div>
                    <span className="dd-notif-dropdown__count">
                      {notifications.length} RDV
                    </span>
                  </div>

                  <div className="dd-notif-dropdown__glow" />

                  {notifications.length === 0 ? (
                    <div className="dd-notif-empty">
                      <span className="dd-notif-empty__icon">🎉</span>
                      <p>Aucune notification</p>
                      <small>Tous vos rendez-vous sont traités</small>
                    </div>
                  ) : (
                    <div className="dd-notif-list">
                      {notifications.map((notif, i) => (
                        <div
                          key={notif.id}
                          className={`dd-notif-item ${notif.statut === 'Confirmé' ? 'dd-notif-item--confirmed' : ''}`}
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                          <div className="dd-notif-item__avatar">
                            {notif.patient.charAt(0).toUpperCase()}
                          </div>

                          <div className="dd-notif-item__content">
                            <p className="dd-notif-item__patient">{notif.patient}</p>
                            <p className="dd-notif-item__details">
                              📅 {notif.date} · 🕐 {notif.heure}
                            </p>
                            <p className="dd-notif-item__motif">{notif.motif}</p>

                            {notif.statut === 'Confirmé' ? (
                              <span className="dd-notif-item__confirmed-badge">
                                <FaCheckCircle size={10} /> Confirmé
                              </span>
                            ) : (
                              <div className="dd-notif-item__actions">
                                <button
                                  className="dd-notif-btn dd-notif-btn--confirm"
                                  onClick={() => handleConfirmRdv(notif.id)}
                                >
                                  <FaCheckCircle size={11} /> Confirmer
                                </button>
                                <button
                                  className="dd-notif-btn dd-notif-btn--cancel"
                                  onClick={() => handleCancelRdv(notif.id)}
                                >
                                  <FaTimesCircle size={11} /> Annuler
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="dd-notif-dropdown__footer">
                    <button onClick={() => { setActiveTab('rdv'); setNotifOpen(false); }}>
                      Voir tout l'agenda →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ✅ NOUVEAU : Toast feedback action RDV */}
        {rdvActionFeedback && (
          <div className={`dd-toast dd-toast--${rdvActionFeedback.type}`}>
            {rdvActionFeedback.msg}
          </div>
        )}

        {/* ===== TAB: PROFIL ===== */}
        {activeTab === 'profil' && (
          <div className="dd-card dd-fade-in">
            <div className="dd-card__header">
              <div className="dd-card__icon-wrap dd-card__icon-wrap--blue"><FaIdCard /></div>
              <div>
                <h2 className="dd-card__title">Mes Informations Professionnelles</h2>
                <p className="dd-card__subtitle">Vos coordonnées et informations de cabinet</p>
              </div>
            </div>

            <div className="dd-info-grid">
              {[
                { label: 'Nom ',               value: medecinInfo.nom,        icon: '👨‍⚕️' },
                { label: 'Email Pro',          value: medecinInfo.email,      icon: '✉️' },
                { label: 'Téléphone Cabinet',  value: medecinInfo.telephone,  icon: '📞' },
                { label: 'Adresse du Cabinet', value: medecinInfo.adresse,    icon: '🏥' },
                { label: 'Spécialité',         value: medecinInfo.specialite, icon: '🩺' },
              ].map((item, i) => (
                <div className="dd-info-cell" key={i} style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="dd-info-cell__emoji">{item.icon}</span>
                  <div>
                    <p className="dd-info-cell__label">{item.label}</p>
                    <p className="dd-info-cell__value">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="dd-btn dd-btn--primary" onClick={handleEditProfile}>
              <FaEdit /> Modifier mes informations
            </button>
          </div>
        )}

        {/* ===== TAB: AGENDA ===== */}
        {activeTab === 'rdv' && (
          <div className="dd-card dd-fade-in">
            <div className="dd-card__header">
              <div className="dd-card__icon-wrap dd-card__icon-wrap--green"><FaCalendarAlt /></div>
              <div>
                <h2 className="dd-card__title">Mon Agenda</h2>
                <p className="dd-card__subtitle">{sortedRdv.length} rendez-vous à venir</p>
              </div>
            </div>

            <div className="dd-rdv-list">
              {sortedRdv.length === 0 ? (
                <div className="dd-empty">
                  <div className="dd-empty__icon">📅</div>
                  <p className="dd-empty__title">Aucun rendez-vous à venir</p>
                  <p className="dd-empty__sub">Votre agenda est libre pour le moment.</p>
                </div>
              ) : (
                sortedRdv.map((rdv, i) => (
                  <div key={rdv.id} className="dd-rdv-card" style={{ animationDelay: `${i * 70}ms` }}>
                    <div className="dd-rdv-card__date">
                      <span className="dd-rdv-card__day">{rdv.date}</span>
                      <span className="dd-rdv-card__time">{rdv.heure}</span>
                    </div>
                    <div className="dd-rdv-card__info">
                      <h4 className="dd-rdv-card__patient">{rdv.patient}</h4>
                      <p className="dd-rdv-card__motif">Motif : {rdv.motif}</p>
                      <span className="dd-badge dd-badge--active">{rdv.statut}</span>
                    </div>
                    {/* ✅ MODIFICATION: Actions de l'Agenda mises à jour avec le bouton d'appel intelligent */}
<div className="dd-rdv-card__actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
  
  {/* Bouton Appeler (1er clic = affiche le numéro, 2ème clic = appelle) */}
  {visiblePhoneId === rdv.id ? (
    <a 
      href={`tel:${rdv.telephone}`} 
      className="dd-btn dd-btn--ghost" 
      style={{ textDecoration: 'none', fontWeight: 'bold', color: '#0ea5e9' }}
    >
      📞 {rdv.telephone || 'Aucun numéro'}
    </a>
  ) : (
    <button 
      className="dd-btn dd-btn--ghost" 
      onClick={() => setVisiblePhoneId(rdv.id)}
    >
      📞 Appeler
    </button>
  )}

  <button className="dd-btn dd-btn--chat" onClick={() => setActiveChat(rdv)}>
    <FaComments /> Message
  </button>
  
  <button className="dd-btn dd-btn--danger" onClick={() => handlePatientAbsent(rdv.id)}>
    ⚠️ Non honoré
  </button>
  
</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===== TAB: PATIENTS ===== */}
        {activeTab === 'patients' && (
          <div className="dd-card dd-fade-in">
            <div className="dd-card__header">
              <div className="dd-card__icon-wrap dd-card__icon-wrap--purple"><FaUserInjured /></div>
              <div>
                <h2 className="dd-card__title">Dossiers Patients</h2>
                <p className="dd-card__subtitle">Historique complet de vos consultations</p>
              </div>
            </div>

            <div className="dd-controls">
              <div className="dd-search">
                <FaSearch className="dd-search__icon" />
                <input
                  type="text"
                  placeholder="Rechercher un patient..."
                  value={searchPatient}
                  onChange={e => setSearchPatient(e.target.value)}
                  className="dd-search__input"
                />
              </div>
              <select
                value={sortType}
                onChange={e => setSortType(e.target.value)}
                className="dd-select"
              >
                <option value="date-asc">Date croissante</option>
                <option value="date-desc">Date décroissante</option>
                <option value="nom">Nom patient</option>
              </select>
            </div>

            <div className="dd-rdv-list">
              {filteredHistory.length === 0 ? (
                <div className="dd-empty">
                  <div className="dd-empty__icon">🔍</div>
                  <p className="dd-empty__title">Aucun patient trouvé</p>
                </div>
              ) : (
                filteredHistory.map((rdv, i) => (
                  <div key={rdv.id} className="dd-rdv-card dd-rdv-card--history" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="dd-rdv-card__date">
                      <span className="dd-rdv-card__day">{rdv.date}</span>
                      <span className="dd-rdv-card__time">{rdv.heure}</span>
                    </div>
                    <div className="dd-rdv-card__info">
                      <h4 className="dd-rdv-card__patient">{rdv.patient}</h4>
                      <p className="dd-rdv-card__motif">Motif : {rdv.motif}</p>
                      <span className={`dd-badge ${
  rdv.statut === 'Confirmé' || rdv.statut === 'À venir' || rdv.statut === 'Payé' ? 'dd-badge--active' :
  rdv.statut === 'Terminé' ? 'dd-badge--done' : 'dd-badge--cancelled'
}`}>{rdv.statut}</span>
                    </div>
                    <div className="dd-rdv-card__actions">
                      <button className="dd-btn dd-btn--view" onClick={() => handleViewDetails(rdv)}>
                        Voir dossier
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===== TAB: ABSENCES ===== */}
        {activeTab === 'absences' && (
          <div className="dd-absence-container dd-fade-in">
            <div className="dd-card">
              <div className="dd-card__header">
                <div className="dd-card__icon-wrap dd-card__icon-wrap--red"><FaBan /></div>
                <div>
                  <h2 className="dd-card__title">Gérer mes Absences</h2>
                  <p className="dd-card__subtitle">Bloquez vos périodes d'indisponibilité</p>
                </div>
              </div>

              <div className="dd-absence-grid">
                <div className="dd-field-group">
                  <label className="dd-field-label">Date de début</label>
                  <input type="date" className="dd-input" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
                </div>
                <div className="dd-field-group">
                  <label className="dd-field-label">Date de fin</label>
                  <input type="date" className="dd-input" value={dateFin} onChange={e => setDateFin(e.target.value)} />
                </div>
                <div className="dd-field-group">
                  <label className="dd-field-label">Période</label>
                  <select className="dd-input" value={periodeAbsence} onChange={e => setPeriodeAbsence(e.target.value)}>
                    <option>Journée entière</option>
                    <option>Matin</option>
                    <option>Après-midi</option>
                  </select>
                </div>
                <div className="dd-field-group">
                  <label className="dd-field-label" style={{ opacity: 0 }}>Action</label>
                  <button className="dd-btn dd-btn--primary dd-btn--full" onClick={handleSaveAbsence}>
                    <FaBan /> Enregistrer
                  </button>
                </div>
              </div>
            </div>

            <div className="dd-card">
              <div className="dd-card__header">
                <div className="dd-card__icon-wrap dd-card__icon-wrap--orange"><FaNotesMedical /></div>
                <div>
                  <h2 className="dd-card__title">Mes absences enregistrées</h2>
                  <p className="dd-card__subtitle">{absences.length} absence(s) planifiée(s)</p>
                </div>
              </div>

              {absences && absences.length > 0 ? (
                <div className="dd-absence-list">
                  {absences.map((abs, i) => (
                    <div key={abs.id} className="dd-absence-item" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="dd-absence-item__icon">🗓️</div>
                      <div className="dd-absence-item__info">
                        <p className="dd-absence-item__date">
                          {new Date(abs.date_absence).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <span className="dd-badge dd-badge--absence">{abs.periode}</span>
                      </div>
                      <button className="dd-absence-item__delete" onClick={() => handleDeleteAbsence(abs.id)}>
                        <FaTimesCircle />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dd-empty">
                  <div className="dd-empty__icon">✅</div>
                  <p className="dd-empty__title">Aucune absence enregistrée</p>
                  <p className="dd-empty__sub">Vous êtes disponible sans interruption planifiée.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat modal */}
        {activeChat && (
          <div className="dd-modal-overlay">
            <div className="dd-chat-container">
              <button className="dd-chat-close" onClick={() => setActiveChat(null)}>
                <FaTimesCircle /> Fermer la conversation
              </button>
              <Chat rendezVousId={activeChat.id} userId={medecinId} currentUserName={medecinInfo.nom} />
            </div>
          </div>
        )}
      </main>

      {/* ===== MODAL DOSSIER PATIENT ===== */}
      {isModalOpen && selectedPatient && (
        <div className="dd-modal-overlay">
          <div className="dd-modal dd-modal--info">
            <div className="dd-modal__header">
              <div className="dd-modal__icon-ring dd-modal__icon-ring--blue">
                <FaUserInjured size={28} />
              </div>
              <div>
                <h3 className="dd-modal__title">Dossier Patient</h3>
                <p className="dd-modal__subtitle">{selectedPatient.nomComplet}</p>
              </div>
            </div>

            <div className="dd-modal__details">
              <div className="dd-modal__detail-item">
                <span className="dd-modal__detail-label">Statut</span>
                <span className="dd-badge dd-badge--active">{selectedPatient.statut}</span>
              </div>
              <div className="dd-modal__detail-item">
                <span className="dd-modal__detail-label">Motif</span>
                <span className="dd-modal__detail-value">{selectedPatient.motif}</span>
              </div>
              <div className="dd-modal__detail-item">
                <span className="dd-modal__detail-label">Date & Heure</span>
                <span className="dd-modal__detail-value">{selectedPatient.date} à {selectedPatient.heure}</span>
              </div>
            </div>

            <div className="dd-modal__docs">
              <p className="dd-modal__docs-title">📄 Documents du Dossier</p>
              {selectedPatient?.fichiers && selectedPatient.fichiers.length > 0 ? (
                <div className="dd-doc-list">
                  {selectedPatient.fichiers.map((file, index) => (
                    <div key={index} className="dd-doc-row">
                      <div className="dd-doc-row__icon">PDF</div>
                      <span className="dd-doc-row__name">{file.nom_original}</span>
                      <a
                        href={`http://localhost:5000/uploads/${file.chemin.replace('uploads/', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dd-btn dd-btn--view dd-btn--sm"
                      >Voir</a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="dd-modal__no-docs">Aucun document dans ce dossier.</p>
              )}
            </div>

            <button className="dd-btn dd-btn--ghost dd-btn--full" onClick={() => setIsModalOpen(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modals absences */}
      {showConfirmModal && (
        <div className="dd-modal-overlay">
          <div className="dd-modal dd-modal--danger">
            <div className="dd-modal__icon-ring dd-modal__icon-ring--red"><FaBan size={28} /></div>
            <h3 className="dd-modal__title">Supprimer cette absence ?</h3>
            <p className="dd-modal__body">Cette période d'indisponibilité sera définitivement retirée.</p>
            <div className="dd-modal__actions">
              <button className="dd-btn dd-btn--danger" onClick={confirmDelete}>Supprimer</button>
              <button className="dd-btn dd-btn--ghost" onClick={() => setShowConfirmModal(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="dd-modal-overlay">
          <div className="dd-modal dd-modal--success">
            <div className="dd-modal__icon-ring dd-modal__icon-ring--green"><FaCheckCircle size={28} /></div>
            <h3 className="dd-modal__title">Absence supprimée !</h3>
            <p className="dd-modal__body">La période a été retirée de votre agenda.</p>
          </div>
        </div>
      )}

      {showAddSuccessModal && (
        <div className="dd-modal-overlay">
          <div className="dd-modal dd-modal--success">
            <div className="dd-modal__icon-ring dd-modal__icon-ring--green"><FaCheckCircle size={28} /></div>
            <h3 className="dd-modal__title">Absence enregistrée !</h3>
            <p className="dd-modal__body">Votre indisponibilité a été ajoutée avec succès.</p>
          </div>
        </div>
      )}

      {/* ===== MODALE ABSENCE CUSTOM ===== */}
{showAbsentModal && (
  <div className="dd-modal-overlay dd-fade-in">
    <div className="dd-confirm-modal">
      <div className="dd-confirm-modal__icon">⚠️</div>
      <h3 className="dd-confirm-modal__title">Confirmer l'absence ?</h3>
      <p className="dd-confirm-modal__text">
        Voulez-vous marquer <strong>{rdvToMarkAbsent?.patient}</strong> comme absent ? 
        <br />
        <span className="dd-confirm-modal__warning">
          Cette action sera comptabilisée dans son dossier (Règle des 3 absences).
        </span>
      </p>
      <div className="dd-confirm-modal__actions">
        <button 
          className="dd-btn dd-btn--danger" 
          onClick={confirmAbsentAction}
        >
          Confirmer l'absence
        </button>
        <button 
          className="dd-btn dd-btn--ghost" 
          onClick={() => setShowAbsentModal(false)}
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}