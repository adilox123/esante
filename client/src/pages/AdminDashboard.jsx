import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // ✅ AJOUT useSearchParams
import axios from 'axios';
import {
  FaUserInjured, FaUserMd, FaChartLine, FaSignOutAlt,
  FaShieldAlt, FaCalendarCheck, FaClipboardList,
  FaCheckCircle, FaEye, FaTrash, FaBell, FaTachometerAlt,
  FaEdit, FaPlus, FaTimes, FaSearch, FaFilter
} from 'react-icons/fa';
import './AdminDashboard.css';

/* ============================================================
   NAV
   ============================================================ */
const NAV_ITEMS = [
  { id: 'overview',  icon: <FaTachometerAlt />, label: "Vue d'ensemble" },
  { id: 'patients',  icon: <FaUserInjured />,   label: 'Patients' },
  { id: 'medecins',  icon: <FaUserMd />,         label: 'Médecins' },
  { id: 'rdv',       icon: <FaCalendarCheck />,  label: 'Rendez-vous' },
  { id: 'rapports',  icon: <FaClipboardList />,  label: 'Rapports' },
];

/* ============================================================
   MODAL CONFIRM DELETE
   ============================================================ */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="ad-overlay" onClick={onCancel}>
      <div className="ad-modal ad-modal--danger" onClick={e => e.stopPropagation()}>
        <div className="ad-modal__icon ad-modal__icon--red">🗑️</div>
        <h3 className="ad-modal__title">Confirmer la suppression</h3>
        <p className="ad-modal__body">{message}</p>
        <div className="ad-modal__actions">
          <button className="ad-mbtn ad-mbtn--danger" onClick={onConfirm}>Supprimer</button>
          <button className="ad-mbtn ad-mbtn--ghost" onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MODAL FORMULAIRE PATIENT
   ============================================================ */
function PatientModal({ patient, onClose, onSaved }) {
  const isEdit = !!patient;
  const [form, setForm] = useState({
    nom:            patient?.nom            || '',
    email:          patient?.email          || '',
    telephone:      patient?.telephone      || '',
    adresse:        patient?.adresse        || '',
    date_naissance: patient?.date_naissance || '',
    groupe_sanguin: patient?.groupe_sanguin || '',
    sexe:           patient?.sexe           || '',
    password:       '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const nomSaisi = form.nom || "Docteur";
      const parts = nomSaisi.trim().split(' ');
      
      const nomFinal = parts[0];
      const prenomFinal = parts.slice(1).join(' ') || 'Praticien';

      const dataToSend = {
        nom: nomFinal,
        prenom: prenomFinal,
        email: form.email,
        password: form.password,
        telephone: form.telephone,
        adresse: form.adresse,
        role: 'patient',
        groupe_sanguin: form.groupe_sanguin,
        sexe: form.sexe,
        date_naissance: form.date_naissance,
      };

      if (isEdit) {
        await axios.put(`http://localhost:5000/api/admin/patients/${patient.id}`, dataToSend);
      } else {
        await axios.post('http://localhost:5000/api/auth/register', dataToSend);
      }
      
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Erreur d'enregistrement";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal ad-modal--form" onClick={e => e.stopPropagation()}>
        <button className="ad-modal__close" onClick={onClose}><FaTimes /></button>
        <div className="ad-modal__header">
          <div className="ad-modal__icon ad-modal__icon--blue">🧑‍💼</div>
          <div>
            <h3 className="ad-modal__title">{isEdit ? 'Modifier le patient' : 'Ajouter un patient'}</h3>
            <p className="ad-modal__sub">{isEdit ? `Modification de ${patient.nom}` : 'Nouveau compte patient'}</p>
          </div>
        </div>

        {error && <div className="ad-form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="ad-form">
          <div className="ad-form__row">
            <div className="ad-form__field">
              <label className="ad-form__label">Nom complet *</label>
              <input className="ad-form__input" name="nom" value={form.nom} onChange={handleChange} placeholder="Ex: Salaheddine Fettah" required />
            </div>
            <div className="ad-form__field">
              <label className="ad-form__label">Email *</label>
              <input className="ad-form__input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@exemple.com" required />
            </div>
          </div>
          <div className="ad-form__row">
            <div className="ad-form__field">
              <label className="ad-form__label">Téléphone</label>
              <input className="ad-form__input" name="telephone" value={form.telephone} onChange={handleChange} placeholder="06XXXXXXXX" />
            </div>
            <div className="ad-form__field">
              <label className="ad-form__label">Date de naissance</label>
              <input className="ad-form__input" name="date_naissance" type="date" value={form.date_naissance} onChange={handleChange} />
            </div>
          </div>
          <div className="ad-form__row">
            <div className="ad-form__field">
              <label className="ad-form__label">Groupe sanguin</label>
              <select className="ad-form__input ad-form__select" name="groupe_sanguin" value={form.groupe_sanguin} onChange={handleChange}>
                <option value="">Sélectionner</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="ad-form__field">
              <label className="ad-form__label">Sexe</label>
              <select className="ad-form__input ad-form__select" name="sexe" value={form.sexe} onChange={handleChange}>
                <option value="">Sélectionner</option>
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
          </div>
          <div className="ad-form__field">
            <label className="ad-form__label">Adresse</label>
            <input className="ad-form__input" name="adresse" value={form.adresse} onChange={handleChange} placeholder="Quartier, Ville" />
          </div>
          {!isEdit && (
            <div className="ad-form__field">
              <label className="ad-form__label">Mot de passe *</label>
              <input className="ad-form__input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Minimum 6 caractères" required />
            </div>
          )}
          <div className="ad-form__actions">
            <button type="button" className="ad-mbtn ad-mbtn--ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="ad-mbtn ad-mbtn--primary" disabled={loading}>
              {loading ? <span className="ad-btn-spinner" /> : null}
              {isEdit ? 'Enregistrer les modifications' : 'Créer le compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   MODAL FORMULAIRE MÉDECIN
   ============================================================ */
function MedecinModal({ medecin, onClose, onSaved }) {
  const isEdit = !!medecin;
  const [form, setForm] = useState({
    nom:         medecin?.nom_du_docteur || medecin?.User?.nom || '',
    email:       medecin?.email || medecin?.User?.email || '',
    telephone:   medecin?.telephone || '',
    specialite:  medecin?.specialite_nom || medecin?.Specialite?.nom || '',
    adresse:     medecin?.adresse || '',
    tarif:       medecin?.tarif || '',
    password:    '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const nomSaisi = form.nom || "Docteur";
      const parts = nomSaisi.trim().split(' ');
      const nomFinal = parts[0];
      const prenomFinal = parts.slice(1).join(' ') || 'Praticien';

      const leColisPourLeServeur = {
        nom: nomFinal,
        prenom: prenomFinal,
        email: form.email,
        telephone: form.telephone,
        adresse: form.adresse,
        tarif: form.tarif,
        role: 'medecin',
        specialite_id: 1
      };

      if (form.password) {
        leColisPourLeServeur.password = form.password;
      }

      if (!leColisPourLeServeur.nom) return setError("Le Nom est vide !");
      if (!leColisPourLeServeur.email) return setError("L'Email est vide !");
      
      if (!isEdit && !leColisPourLeServeur.password) {
        return setError("Le Mot de passe est obligatoire pour créer un médecin !");
      }

      if (isEdit) {
        await axios.put(`http://localhost:5000/api/admin/medecins/${medecin.id}`, leColisPourLeServeur);
      } else {
        await axios.post('http://localhost:5000/api/auth/register', leColisPourLeServeur);
      }
      
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Erreur d'enregistrement";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const SPECIALITES = ['Cardiologie','Neurologie','Dentisterie','Ophtalmologie','Orthopédie','Pneumologie','Médecine Générale','Dermatologie','Pédiatrie','Gynécologie'];

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal ad-modal--form" onClick={e => e.stopPropagation()}>
        <button className="ad-modal__close" onClick={onClose}><FaTimes /></button>
        <div className="ad-modal__header">
          <div className="ad-modal__icon ad-modal__icon--teal">👨‍⚕️</div>
          <div>
            <h3 className="ad-modal__title">{isEdit ? 'Modifier le médecin' : 'Ajouter un médecin'}</h3>
            <p className="ad-modal__sub">{isEdit ? `Dr. ${medecin?.User?.nom || ''}` : 'Nouveau praticien'}</p>
          </div>
        </div>

        {error && <div className="ad-form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="ad-form">
          <div className="ad-form__row">
            <div className="ad-form__field">
              <label className="ad-form__label">Nom complet *</label>
              <input className="ad-form__input" name="nom" value={form.nom} onChange={handleChange} placeholder="Ex: Karim Benali" required />
            </div>
            <div className="ad-form__field">
              <label className="ad-form__label">Email *</label>
              <input className="ad-form__input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="dr.email@exemple.com" required />
            </div>
          </div>
          <div className="ad-form__row">
            <div className="ad-form__field">
              <label className="ad-form__label">Téléphone</label>
              <input className="ad-form__input" name="telephone" value={form.telephone} onChange={handleChange} placeholder="06XXXXXXXX" />
            </div>
            <div className="ad-form__field">
              <label className="ad-form__label">Spécialité *</label>
              <select className="ad-form__input ad-form__select" name="specialite" value={form.specialite} onChange={handleChange} required>
                <option value="">Sélectionner</option>
                {SPECIALITES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="ad-form__row">
            <div className="ad-form__field">
              <label className="ad-form__label">Tarif (MAD)</label>
              <input className="ad-form__input" name="tarif" type="number" value={form.tarif} onChange={handleChange} placeholder="Ex: 300" />
            </div>
            <div className="ad-form__field">
              <label className="ad-form__label">Adresse du cabinet</label>
              <input className="ad-form__input" name="adresse" value={form.adresse} onChange={handleChange} placeholder="Quartier, Ville" />
            </div>
          </div>
          {!isEdit && (
            <div className="ad-form__field">
              <label className="ad-form__label">Mot de passe *</label>
              <input className="ad-form__input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Minimum 6 caractères" required />
            </div>
          )}
          <div className="ad-form__actions">
            <button type="button" className="ad-mbtn ad-mbtn--ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="ad-mbtn ad-mbtn--teal" disabled={loading}>
              {loading ? <span className="ad-btn-spinner" /> : null}
              {isEdit ? 'Enregistrer les modifications' : 'Ajouter le médecin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN DASHBOARD
   ============================================================ */
export default function AdminDashboard() {
  const navigate = useNavigate();

  // ✅ MODIFICATION : Lire et écrire le paramètre ?tab= dans l'URL
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab,    setActiveTab]    = useState(searchParams.get('tab') || 'overview'); // ✅
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [patients,     setPatients]     = useState([]);
  const [medecins,     setMedecins]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [rendezvous,   setRendezvous]   = useState([]);

  const [patientSearch, setPatientSearch] = useState('');
  const [medecinSearch, setMedecinSearch] = useState('');

  const [showPatientModal,  setShowPatientModal]  = useState(false);
  const [showMedecinModal,  setShowMedecinModal]  = useState(false);
  const [editPatient,       setEditPatient]       = useState(null);
  const [editMedecin,       setEditMedecin]       = useState(null);
  const [confirmDelete,     setConfirmDelete]     = useState(null);

  // ✅ MODIFICATION : Synchroniser l'onglet quand l'URL change (clic depuis la Navbar)
  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    setActiveTab(tab);
  }, [searchParams]);

  // ✅ MODIFICATION : Fonction qui change l'onglet ET met à jour l'URL
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    if (localStorage.getItem('role') !== 'admin') navigate('/');
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, mRes, rRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/patients').catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/admin/medecins').catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/admin/rendezvous').catch(() => ({ data: [] })),
      ]);
      setPatients(pRes.data);
      setMedecins(mRes.data);
      setRendezvous(rRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleLogout = () => { localStorage.clear(); navigate('/'); window.location.reload(); };
  const getInitials  = (nom = '') => nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'patient') {
        await axios.delete(`http://localhost:5000/api/admin/patients/${confirmDelete.id}`);
      } else {
        await axios.delete(`http://localhost:5000/api/admin/medecins/${confirmDelete.id}`);
      }
      setConfirmDelete(null);
      loadData();
    } catch (e) {
      console.error("Erreur détaillée de suppression :", e.response?.data || e);
      alert('Erreur lors de la suppression. Vérifie la console F12 !');
      setConfirmDelete(null);
    }
  };

  const filteredPatients = patients.filter(p =>
    (p.nom || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(patientSearch.toLowerCase())
  );

  const filteredMedecins = medecins.filter(m =>
    (m.User?.nom || '').toLowerCase().includes(medecinSearch.toLowerCase()) ||
    (m.User?.email || '').toLowerCase().includes(medecinSearch.toLowerCase()) ||
    (m.Specialite?.nom || '').toLowerCase().includes(medecinSearch.toLowerCase())
  );

  const STATS = [
    { label: 'Patients inscrits',   value: loading ? '…' : patients.length,   icon: '🧑‍💼', color: 'blue' },
    { label: 'Médecins actifs',     value: loading ? '…' : medecins.length,    icon: '👨‍⚕️', color: 'teal' },
    { label: 'RDV ce mois',        value: loading ? '…' : rendezvous.length,   icon: '📅',  color: 'purple' },
    { label: 'Satisfaction',        value: '98%',                               icon: '⭐',  color: 'orange' },
  ];

  return (
    <div className="ad-root">
      <div className="ad-bg-orb ad-bg-orb--1" />
      <div className="ad-bg-orb ad-bg-orb--2" />

      {/* ===== SIDEBAR ===== */}
      <aside className={`ad-sidebar ${sidebarOpen ? 'ad-sidebar--open' : ''}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="ad-sidebar__glow" />
        <div className="ad-sidebar__brand">
          <div className="ad-sidebar__brand-icon"><FaShieldAlt size={18} /></div>
          <div className="ad-sidebar__brand-info">
            <span className="ad-sidebar__brand-name">Admin Panel</span>
            <span className="ad-sidebar__brand-sub">E-Santé · Supervision</span>
          </div>
        </div>
        <div className="ad-sidebar__divider" />
        <nav className="ad-sidebar__nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              className={`ad-nav-item ${activeTab === item.id ? 'ad-nav-item--active' : ''}`}
              onClick={() => handleTabChange(item.id)} // ✅ handleTabChange au lieu de setActiveTab
            >
              <span className="ad-nav-item__icon">{item.icon}</span>
              <span className="ad-nav-item__label">{item.label}</span>
              {activeTab === item.id && <span className="ad-nav-item__dot" />}
            </button>
          ))}
        </nav>
        <button className="ad-sidebar__logout" onClick={handleLogout}>
          <FaSignOutAlt size={15} />
          <span className="ad-nav-item__label">Déconnexion</span>
        </button>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="ad-main">

        <header className="ad-topbar">
          <div className="ad-topbar__left">
            <div className="ad-topbar__badge"><span className="ad-topbar__badge-dot" />Système opérationnel</div>
            <h1 className="ad-topbar__title">Espace <span>Administrateur</span> 👑</h1>
          </div>
          <div className="ad-topbar__right">
            <div className="ad-topbar__notif"><FaBell size={15} /><span className="ad-topbar__notif-dot" /></div>
            <div className="ad-topbar__avatar">{getInitials(localStorage.getItem('nom') || 'Admin')}</div>
          </div>
        </header>

        {/* ===== OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <div className="ad-fade-in">
            <div className="ad-stats-grid">
              {STATS.map((s, i) => (
                <div key={i} className={`ad-stat-card ad-stat-card--${s.color}`} style={{ animationDelay: `${i*80}ms` }}>
                  <div className="ad-stat-card__top">
                    <span className="ad-stat-card__icon">{s.icon}</span>
                    <span className="ad-stat-card__num">{s.value}</span>
                  </div>
                  <p className="ad-stat-card__label">{s.label}</p>
                  <div className="ad-stat-card__bar" />
                </div>
              ))}
            </div>
            <div className="ad-section-title">Accès rapide</div>
            <div className="ad-quick-grid">
              {[
                { icon:'🧑‍💼', title:'Gestion des Patients', desc:"Ajoutez, modifiez ou supprimez des comptes patients.", color:'blue',   tab:'patients', cta:"Gérer les patients" },
                { icon:'👨‍⚕️', title:'Gestion des Médecins', desc:"Gérez les praticiens autorisés sur la plateforme.",   color:'teal',   tab:'medecins', cta:'Gérer les médecins' },
                { icon:'📅',   title:'Rendez-vous',           desc:"Supervisez toutes les consultations programmées.",    color:'purple', tab:'rdv',      cta:'Voir les RDV' },
                { icon:'📊',   title:'Rapports & Stats',      desc:"Analysez les données d'utilisation globale.",         color:'orange', tab:'rapports', cta:'Voir les rapports' },
              ].map((c, i) => (
                <div key={i} className={`ad-quick-card ad-quick-card--${c.color}`}
                  onClick={() => handleTabChange(c.tab)} // ✅ handleTabChange
                  style={{ animationDelay: `${i*70}ms` }}>
                  <div className="ad-quick-card__accent" />
                  <span className="ad-quick-card__icon">{c.icon}</span>
                  <h3 className="ad-quick-card__title">{c.title}</h3>
                  <p className="ad-quick-card__desc">{c.desc}</p>
                  <div className="ad-quick-card__action">{c.cta} →</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== PATIENTS ===== */}
        {activeTab === 'patients' && (
          <div className="ad-fade-in">
            <div className="ad-table-card">
              <div className="ad-table-card__header">
                <div className="ad-table-card__icon ad-table-card__icon--blue">🧑‍💼</div>
                <div className="ad-table-card__info">
                  <h2 className="ad-table-card__title">Gestion des Patients</h2>
                  <p className="ad-table-card__sub">{filteredPatients.length} patient(s)</p>
                </div>
                <div className="ad-table-card__toolbar">
                  <div className="ad-search-box">
                    <FaSearch className="ad-search-box__icon" />
                    <input
                      className="ad-search-box__input"
                      placeholder="Rechercher..."
                      value={patientSearch}
                      onChange={e => setPatientSearch(e.target.value)}
                    />
                  </div>
                  <button className="ad-add-btn ad-add-btn--blue" onClick={() => { setEditPatient(null); setShowPatientModal(true); }}>
                    <FaPlus size={12} /> Ajouter
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="ad-loading"><div className="ad-spinner" /><p>Chargement...</p></div>
              ) : filteredPatients.length === 0 ? (
                <div className="ad-empty">
                  <div className="ad-empty__icon">👤</div>
                  <p className="ad-empty__title">Aucun patient trouvé</p>
                  <p className="ad-empty__sub">Modifiez votre recherche ou ajoutez un nouveau patient.</p>
                  <button className="ad-add-btn ad-add-btn--blue" onClick={() => { setEditPatient(null); setShowPatientModal(true); }}>
                    <FaPlus size={12} /> Ajouter un patient
                  </button>
                </div>
              ) : (
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Patient</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Groupe sanguin</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((p, i) => (
                        <tr key={p.id || i} style={{ animationDelay: `${i*35}ms` }}>
                          <td className="ad-table__num">{i+1}</td>
                          <td>
                            <div className="ad-table__user">
                              <div className="ad-table__avatar ad-table__avatar--blue">{getInitials(p.nom || 'P')}</div>
                              <span className="ad-table__name">{p.nom || '—'}</span>
                            </div>
                          </td>
                          <td className="ad-table__email">{p.email || '—'}</td>
                          <td className="ad-table__email">{p.telephone || '—'}</td>
                          <td>
                            {p.groupe_sanguin
                              ? <span className="ad-badge ad-badge--blood">{p.groupe_sanguin}</span>
                              : <span className="ad-table__email">—</span>
                            }
                          </td>
                          <td><span className="ad-badge ad-badge--active"><FaCheckCircle size={9} /> Actif</span></td>
                          <td>
                            <div className="ad-table__actions">
                              <button className="ad-action-btn ad-action-btn--edit" title="Modifier"
                                onClick={() => { setEditPatient(p); setShowPatientModal(true); }}>
                                <FaEdit />
                              </button>
                              <button className="ad-action-btn ad-action-btn--delete" title="Supprimer"
                                onClick={() => setConfirmDelete({ type: 'patient', id: p.id, nom: p.nom || 'ce patient' })}>
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== MÉDECINS ===== */}
        {activeTab === 'medecins' && (
          <div className="ad-fade-in">
            <div className="ad-table-card">
              <div className="ad-table-card__header">
                <div className="ad-table-card__icon ad-table-card__icon--teal">👨‍⚕️</div>
                <div className="ad-table-card__info">
                  <h2 className="ad-table-card__title">Gestion des Médecins</h2>
                  <p className="ad-table-card__sub">{filteredMedecins.length} médecin(s)</p>
                </div>
                <div className="ad-table-card__toolbar">
                  <div className="ad-search-box">
                    <FaSearch className="ad-search-box__icon" />
                    <input
                      className="ad-search-box__input"
                      placeholder="Nom, spécialité..."
                      value={medecinSearch}
                      onChange={e => setMedecinSearch(e.target.value)}
                    />
                  </div>
                  <button className="ad-add-btn ad-add-btn--teal" onClick={() => { setEditMedecin(null); setShowMedecinModal(true); }}>
                    <FaPlus size={12} /> Ajouter
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="ad-loading"><div className="ad-spinner" /><p>Chargement...</p></div>
              ) : filteredMedecins.length === 0 ? (
                <div className="ad-empty">
                  <div className="ad-empty__icon">🏥</div>
                  <p className="ad-empty__title">Aucun médecin trouvé</p>
                  <p className="ad-empty__sub">Ajoutez un nouveau praticien à la plateforme.</p>
                  <button className="ad-add-btn ad-add-btn--teal" onClick={() => { setEditMedecin(null); setShowMedecinModal(true); }}>
                    <FaPlus size={12} /> Ajouter un médecin
                  </button>
                </div>
              ) : (
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Médecin</th>
                        <th>Spécialité</th>
                        <th>Téléphone</th>
                        <th>Tarif</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedecins.map((m, i) => (
                        <tr key={m.id || i} style={{ animationDelay: `${i*35}ms` }}>
                          <td className="ad-table__num">{i+1}</td>
                          <td>
                            <div className="ad-table__user">
                              <div className="ad-table__avatar ad-table__avatar--teal">
                                {getInitials(m.nom_du_docteur || 'Dr')}
                              </div>
                              <div>
                                <span className="ad-table__name">Dr. {m.nom_du_docteur || 'Sans Nom'}</span>
                                <span className="ad-table__email">{m.email || '—'}</span>
                              </div>
                            </div>
                          </td>
                          <td><span className="ad-badge ad-badge--spec">{m.specialite_nom || 'Généraliste'}</span></td>
                          <td className="ad-table__email">{m.telephone || '—'}</td>
                          <td className="ad-table__email">{m.tarif ? `${m.tarif} MAD` : '—'}</td>
                          <td><span className="ad-badge ad-badge--active"><FaCheckCircle size={9} /> Approuvé</span></td>
                          <td>
                            <div className="ad-table__actions">
                              <button className="ad-action-btn ad-action-btn--edit" title="Modifier"
                                onClick={() => { setEditMedecin(m); setShowMedecinModal(true); }}>
                                <FaEdit />
                              </button>
                              <button className="ad-action-btn ad-action-btn--delete" title="Supprimer"
                                onClick={() => setConfirmDelete({ type: 'medecin', id: m.user_id || m.id, nom: `Dr. ${m.nom_du_docteur || 'ce médecin'}` })}>
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== RDV ===== */}
        {activeTab === 'rdv' && (
          <div className="ad-fade-in">
            <div className="ad-table-card">
              <div className="ad-table-card__header">
                <div className="ad-table-card__icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>📅</div>
                <div className="ad-table-card__info">
                  <h2 className="ad-table-card__title">Tous les Rendez-vous</h2>
                  <p className="ad-table-card__sub">{rendezvous.length} consultation(s) enregistrée(s)</p>
                </div>
              </div>

              {loading ? (
                <div className="ad-loading"><div className="ad-spinner" /><p>Chargement...</p></div>
              ) : rendezvous.length === 0 ? (
                <div className="ad-empty">
                  <div className="ad-empty__icon">📅</div>
                  <p className="ad-empty__title">Aucun rendez-vous trouvé</p>
                  <p className="ad-empty__sub">Il n'y a pas encore de consultations dans la base de données.</p>
                </div>
              ) : (
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Patient</th>
                        <th>Médecin</th>
                        <th>Date & Heure</th>
                        <th>Motif</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rendezvous.map((r, i) => (
                        <tr key={r.id || i} style={{ animationDelay: `${i*35}ms` }}>
                          <td className="ad-table__num">{i+1}</td>
                          <td><strong style={{ color: '#e2e8f0' }}>{r.patient_nom}</strong></td>
                          <td>
                            <span style={{ color: '#e2e8f0' }}>Dr. {r.medecin_nom}</span><br/>
                            <small style={{ color: '#94a3b8' }}>{r.specialite_nom || 'Généraliste'}</small>
                          </td>
                          <td>{r.date_heure ? r.date_heure.replace(' ', ' à ') : '—'}</td>
                          <td>{r.motif}</td>
                          <td>
                            <span className={`ad-badge ad-badge--${r.statut === 'Confirmé' ? 'active' : 'spec'}`}>
                              {r.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== RAPPORTS ===== */}
        {activeTab === 'rapports' && (
          <div className="ad-fade-in">
            <div className="ad-rapports-grid">
              {[
                { icon:'🧑‍💼', label:'Patients inscrits', val: patients.length, color:'blue' },
                { icon:'👨‍⚕️', label:'Médecins actifs',   val: medecins.length, color:'teal' },
                { icon:'⭐',   label:'Note moyenne',      val:'4.9 / 5',        color:'orange' },
                { icon:'🔒',   label:'Sécurité SSL',      val:'100%',           color:'green' },
              ].map((r,i) => (
                <div key={i} className={`ad-rapport-card ad-rapport-card--${r.color}`} style={{ animationDelay:`${i*80}ms` }}>
                  <span className="ad-rapport-card__icon">{r.icon}</span>
                  <span className="ad-rapport-card__val">{r.val}</span>
                  <p className="ad-rapport-card__label">{r.label}</p>
                </div>
              ))}
            </div>
            <div className="ad-table-card" style={{ marginTop: 20 }}>
              <div className="ad-table-card__header">
                <div className="ad-table-card__icon">📊</div>
                <div className="ad-table-card__info">
                  <h2 className="ad-table-card__title">Rapport de plateforme</h2>
                  <p className="ad-table-card__sub">Données globales E-Santé</p>
                </div>
              </div>
              <div className="ad-rapport-summary">
                {[
                  ['Total utilisateurs', patients.length + medecins.length],
                  ['Médecins approuvés', medecins.length],
                  ['Patients inscrits',  patients.length],
                ].map(([label, val], i) => (
                  <div key={i} className="ad-rapport-row">
                    <span>{label}</span><strong>{val}</strong>
                  </div>
                ))}
                <div className="ad-rapport-row">
                  <span>Statut système</span>
                  <span className="ad-badge ad-badge--active">🟢 Opérationnel</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ===== MODALS ===== */}
      {showPatientModal && (
        <PatientModal
          patient={editPatient}
          onClose={() => { setShowPatientModal(false); setEditPatient(null); }}
          onSaved={() => { setShowPatientModal(false); setEditPatient(null); loadData(); }}
        />
      )}

      {showMedecinModal && (
        <MedecinModal
          medecin={editMedecin}
          onClose={() => { setShowMedecinModal(false); setEditMedecin(null); }}
          onSaved={() => { setShowMedecinModal(false); setEditMedecin(null); loadData(); }}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          message={`Voulez-vous vraiment supprimer ${confirmDelete.nom} ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

    </div>
  );
}