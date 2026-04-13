import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  { id: 'validations',icon: <FaShieldAlt />,     label: 'Validations' },
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
   MODAL FORMULAIRE MÉDECIN — ✅ MODIFIÉE avec upload document
   ============================================================ */
function MedecinModal({ medecin, onClose, onSaved }) {
  const isEdit = !!medecin;
  const [form, setForm] = useState({
    nom:        medecin?.nom_du_docteur || medecin?.User?.nom || '',
    email:      medecin?.email || medecin?.User?.email || '',
    telephone:  medecin?.telephone || '',
    specialite: medecin?.specialite_nom || medecin?.Specialite?.nom || '',
    adresse:    medecin?.adresse || '',
    tarif:      medecin?.tarif || '',
    password:   '',
  });
  const [file,     setFile]     = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFileChange = (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(f.type)) return setError("Format non supporté. Utilisez PDF, JPG ou PNG.");
    if (f.size > 5 * 1024 * 1024) return setError("Fichier trop lourd. Maximum 5 Mo.");
    setError('');
    setFile(f);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' Ko';
    return (bytes / 1024 / 1024).toFixed(1) + ' Mo';
  };

  const getFileIcon = (name = '') => {
    if (name.match(/\.pdf$/i))            return '📄';
    if (name.match(/\.(jpg|jpeg|png)$/i)) return '🖼️';
    return '📎';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const parts       = (form.nom || 'Docteur').trim().split(' ');
      const nomFinal    = parts[0];
      const prenomFinal = parts.slice(1).join(' ') || 'Praticien';

      if (!nomFinal)   return setError("Le nom est vide !");
      if (!form.email) return setError("L'email est vide !");
      if (!isEdit && !form.password) return setError("Le mot de passe est obligatoire !");

      const formData = new FormData();
      formData.append('nom',           nomFinal);
      formData.append('prenom',        prenomFinal);
      formData.append('email',         form.email);
      formData.append('telephone',     form.telephone);
      formData.append('adresse',       form.adresse);
      formData.append('tarif',         form.tarif);
      formData.append('role',          'medecin');
      formData.append('specialite_id', 1);
      if (form.password) formData.append('password',        form.password);
      if (file)          formData.append('document_preuve', file);

      if (isEdit) {
        await axios.put(
          `http://localhost:5000/api/admin/medecins/${medecin.id}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/auth/register',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Erreur d'enregistrement");
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

          {/* ===== ZONE UPLOAD ===== */}
          <div className="ad-form__field">
            <label className="ad-form__label">Document justificatif *</label>
            <div
              className={`ad-upload-zone ${file ? 'has-file' : ''} ${dragOver ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]); }}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => handleFileChange(e.target.files[0])}
              />
              <div className="ad-upload-zone__icon">{file ? '✅' : '📄'}</div>
              <p className="ad-upload-zone__title">
                {file ? 'Document sélectionné' : 'Glissez votre document ici'}
              </p>
              <p className="ad-upload-zone__sub">ou <span>parcourir vos fichiers</span></p>
              <div className="ad-upload-zone__badge">PDF · JPG · PNG · max 5 Mo</div>
            </div>
            {file && (
              <div className="ad-upload-zone__file-preview">
                <span className="ad-upload-zone__file-icon">{getFileIcon(file.name)}</span>
                <span className="ad-upload-zone__file-name">{file.name}</span>
                <span className="ad-upload-zone__file-size">{formatSize(file.size)}</span>
                <button type="button" className="ad-upload-zone__remove" onClick={() => setFile(null)}>
                  <FaTimes size={10} />
                </button>
              </div>
            )}
          </div>

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab,    setActiveTab]    = useState(searchParams.get('tab') || 'overview');
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

  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    setActiveTab(tab);
  }, [searchParams]);

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

  const medecinsEnAttente = medecins.filter(m => 
  m.statut_validation === 'en_attente' || m.User?.statut_validation === 'en_attente'
);

  const handleValidation = async (userId, nouveauStatut) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir ${nouveauStatut === 'valide' ? 'ACCEPTER' : 'REFUSER'} ce médecin ?`)) return;
    try {
      await axios.put(`http://localhost:5000/api/admin/valider-medecin/${userId}`, {
        statut_validation: nouveauStatut
      });
      alert(`Le médecin a été ${nouveauStatut === 'valide' ? 'accepté' : 'refusé'} avec succès !`);
      loadData();
    } catch (error) {
      alert("Erreur lors de la validation : " + (error.response?.data?.message || error.message));
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
    { label: 'Patients inscrits', value: loading ? '…' : patients.length,  icon: '🧑‍💼', color: 'blue' },
    { label: 'Médecins actifs',   value: loading ? '…' : medecins.length,   icon: '👨‍⚕️', color: 'teal' },
    { label: 'RDV ce mois',      value: loading ? '…' : rendezvous.length,  icon: '📅',  color: 'purple' },
    { label: 'Satisfaction',      value: '98%',                              icon: '⭐',  color: 'orange' },
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
              onClick={() => handleTabChange(item.id)}
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
                  onClick={() => handleTabChange(c.tab)}
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

        {/* ===== VALIDATIONS ===== */}
        {activeTab === 'validations' && (
          <div className="ad-fade-in">
            <div className="ad-table-card">
              <div className="ad-table-card__header">
                <div className="ad-table-card__icon ad-table-card__icon--orange">🛡️</div>
                <div className="ad-table-card__info">
                  <h2 className="ad-table-card__title">Demandes d'inscription</h2>
                  <p className="ad-table-card__sub">{medecinsEnAttente.length} médecin(s) en attente de validation</p>
                </div>
              </div>
              {loading ? (
                <div className="ad-loading"><div className="ad-spinner" /><p>Chargement...</p></div>
              ) : medecinsEnAttente.length === 0 ? (
                <div className="ad-empty">
                  <div className="ad-empty__icon">✅</div>
                  <p className="ad-empty__title">Tout est à jour !</p>
                  <p className="ad-empty__sub">Aucun médecin n'est en attente de validation pour le moment.</p>
                </div>
              ) : (
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Médecin</th>
                        <th>Spécialité & Téléphone</th>
                        <th>Preuve d'identité</th>
                        <th>Décision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medecinsEnAttente.map((m, i) => (
                        <tr key={m.id} style={{ animationDelay: `${i*35}ms` }}>
  <td>
    <div className="ad-table__user">
      {/* On utilise m.nom (SQL) ou m.User.nom (Sequelize) */}
      <div className="ad-table__avatar ad-table__avatar--orange">{getInitials(m.nom || m.User?.nom || 'Dr')}</div>
      <div>
        <span className="ad-table__name">Dr. {m.nom || m.User?.nom} {m.prenom || m.User?.prenom}</span>
        <span className="ad-table__email">{m.email || m.User?.email}</span>
      </div>
    </div>
  </td>
  <td>
    <span className="ad-badge ad-badge--spec">{m.specialite_nom || m.Specialite?.nom || 'Généraliste'}</span><br/>
    <small className="ad-table__email" style={{ marginTop: '4px', display: 'block' }}>📞 {m.telephone}</small>
  </td>
  <td>
    {m.document_preuve ? (
  <a href={`http://localhost:5000/uploads/attestations/${m.document_preuve.split(/[/\\]/).pop()}`}
     target="_blank" rel="noreferrer"
     className="ad-mbtn ad-mbtn--ghost" style={{ fontSize: '12px', padding: '6px 10px' }}>
    📄 Voir le document
  </a>
) : (
  <span className="ad-badge ad-badge--danger">Aucun document</span>
)}
  </td>
  <td>
    <div className="ad-table__actions">
      {/* 🎯 TRES IMPORTANT : On utilise m.user_id pour la validation */}
      <button className="ad-mbtn ad-mbtn--teal" style={{ padding: '6px 12px', fontSize: '12px', marginRight: '8px' }}
        onClick={() => handleValidation(m.user_id || m.User?.id, 'valide')}>
        ✅ Accepter
      </button>
      <button className="ad-mbtn ad-mbtn--danger" style={{ padding: '6px 12px', fontSize: '12px' }}
        onClick={() => handleValidation(m.user_id || m.User?.id, 'rejete')}>
        ❌ Refuser
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
                    <input className="ad-search-box__input" placeholder="Rechercher..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
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
                        <th>#</th><th>Patient</th><th>Email</th><th>Téléphone</th><th>Groupe sanguin</th><th>Statut</th><th>Actions</th>
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
                          <td>{p.groupe_sanguin ? <span className="ad-badge ad-badge--blood">{p.groupe_sanguin}</span> : <span className="ad-table__email">—</span>}</td>
                          <td><span className="ad-badge ad-badge--active"><FaCheckCircle size={9} /> Actif</span></td>
                          <td>
                            <div className="ad-table__actions">
                              <button className="ad-action-btn ad-action-btn--edit" title="Modifier" onClick={() => { setEditPatient(p); setShowPatientModal(true); }}><FaEdit /></button>
                              <button className="ad-action-btn ad-action-btn--delete" title="Supprimer" onClick={() => setConfirmDelete({ type: 'patient', id: p.id, nom: p.nom || 'ce patient' })}><FaTrash /></button>
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
                    <input className="ad-search-box__input" placeholder="Nom, spécialité..." value={medecinSearch} onChange={e => setMedecinSearch(e.target.value)} />
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
                        <th>#</th><th>Médecin</th><th>Spécialité</th><th>Téléphone</th><th>Tarif</th><th>Statut</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedecins.map((m, i) => (
                        <tr key={m.id || i} style={{ animationDelay: `${i*35}ms` }}>
                          <td className="ad-table__num">{i+1}</td>
                          <td>
  <div className="ad-table__user">
    {/* On cherche m.nom ou m.User.nom */}
    <div className="ad-table__avatar ad-table__avatar--teal">{getInitials(m.nom || m.User?.nom || 'Dr')}</div>
    <div>
      {/* On affiche le nom ET le prénom */}
      <span className="ad-table__name">Dr. {m.nom || m.User?.nom} {m.prenom || m.User?.prenom}</span>
      <span className="ad-table__email">{m.email || m.User?.email || '—'}</span>
    </div>
  </div>
</td>
                          <td><span className="ad-badge ad-badge--spec">{m.specialite_nom || 'Généraliste'}</span></td>
                          <td className="ad-table__email">{m.telephone || '—'}</td>
                          <td className="ad-table__email">{m.tarif ? `${m.tarif} MAD` : '—'}</td>
                          <td><span className="ad-badge ad-badge--active"><FaCheckCircle size={9} /> Approuvé</span></td>
                          <td>
                            <div className="ad-table__actions">
                              <button className="ad-action-btn ad-action-btn--edit" title="Modifier" onClick={() => { setEditMedecin(m); setShowMedecinModal(true); }}><FaEdit /></button>
                              <button className="ad-action-btn ad-action-btn--delete" title="Supprimer" onClick={() => setConfirmDelete({ type: 'medecin', id: m.user_id || m.id, nom: `Dr. ${m.nom_du_docteur || 'ce médecin'}` })}><FaTrash /></button>
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
                        <th>#</th><th>Patient</th><th>Médecin</th><th>Date & Heure</th><th>Motif</th><th>Statut</th>
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
                          <td><span className={`ad-badge ad-badge--${r.statut === 'Confirmé' ? 'active' : 'spec'}`}>{r.statut}</span></td>
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