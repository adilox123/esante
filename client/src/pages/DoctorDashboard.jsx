import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserMd, FaCalendarAlt, FaUserInjured, FaNotesMedical, 
  FaCheckCircle, FaBan, FaSearch, FaSortAmountDown, 
  FaIdCard, FaEdit, FaComments, FaTimesCircle 
} from 'react-icons/fa';
import Chat from '../components/chat/Chat'; 
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profil');
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  const [sortType, setSortType] = useState('date-asc'); 
  const [searchPatient, setSearchPatient] = useState(''); 
  
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [periodeAbsence, setPeriodeAbsence] = useState('Journée entière');
  const [absences, setAbsences] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vraiId, setVraiId] = useState(null);
  
  // 🎯 AJOUT : États pour gérer l'affichage des pop-ups personnalisées
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [absenceToDelete, setAbsenceToDelete] = useState(null);
  const [showAddSuccessModal, setShowAddSuccessModal] = useState(false);

  const medecinId = localStorage.getItem('userId');

  const [medecinInfo, setMedecinInfo] = useState({
    nom: "Chargement...",
    email: "...",
    telephone: "Non renseigné",
    adresse: "Non renseignée",
    specialite: "Médecin" 
  });

  const [rendezVous, setRendezVous] = useState([]);

  // Styles pour le Modal
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000
  };

  const modalStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  };

  const fetchAbsences = async (idToFetch) => {
    try {
      const id = idToFetch || medecinId;
      const res = await axios.get(`http://localhost:5000/api/absences/${id}`);
      if (res.data.success) {
        setAbsences(res.data.absences);
      }
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
        throw new Error("ID Médecin introuvable dans la table medecins");
      }
    })
    .then(res => {
      if(res) {
        const vraisRdvs = res.data.map(rdv => ({
          id: rdv.id,
          patient_id: rdv.patient_id,
          patient: rdv.nom_patient || `Patient N°${rdv.patient_id}`,
          date: rdv.date_rdv,
          heure: rdv.heure_rdv,
          motif: rdv.motif,
          statut: rdv.statut,
          noteSecrete: rdv.note_secrete,
        }));
        setRendezVous(vraisRdvs);
      }
    })
    .catch(err => console.error("Erreur chargement profil/RDV/Absences Médecin :", err));

  }, [medecinId]);

  const handleViewDetails = async (rdv) => {
    const patientId = rdv.patient_id;
    if (!patientId) {
      alert("Impossible de trouver l'ID du patient");
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5000/api/documents/${patientId}`);
      const documents = res.data.success ? res.data.documents : [];
      const patientData = {
        nomComplet: rdv.patient,
        statut: rdv.statut,
        motif: rdv.motif,
        date: rdv.date,
        heure: rdv.heure,
        fichiers: documents
      };
      setSelectedPatient(patientData);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Erreur chargement documents:", error);
      alert("Erreur lors du chargement des documents");
    }
  };

  const handleEditProfile = () => {
    navigate('/edit-profile-medecin');
  };

  const sortedRdv = [...rendezVous]
    .filter(r => r.statut === "À venir" || r.statut === "Confirmé") 
    .sort((a, b) => {
      if (sortType === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortType === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortType === 'nom') return a.patient.localeCompare(b.patient);
      return 0;
    });

  const filteredHistory = [...rendezVous]
    .filter(r => 
      r.patient.toLowerCase().includes(searchPatient.toLowerCase())
    )
    .sort((a, b) => {
      if (sortType === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortType === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortType === 'nom') return a.patient.localeCompare(b.patient);
      return 0;
    });

  const handleSaveNote = async (id, text) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}/note`, {
        note_secrete: text
      });
      const newData = rendezVous.map(rdv => rdv.id === id ? { ...rdv, noteSecrete: text } : rdv);
      setRendezVous(newData);
      setActiveNoteId(null);
      alert("🔒 Note secrète enregistrée définitivement !");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur serveur lors de la sauvegarde.");
    }
  };

  const handleSaveAbsence = async () => {
    if (!vraiId) return alert("Erreur : Profil non chargé.");
    if (!dateDebut) return alert("⚠️ Veuillez choisir au moins une date de début !");
    
    try {
      const res = await axios.post('http://localhost:5000/api/absences', {
        medecin_id: vraiId,
        date_debut: dateDebut,
        date_fin: dateFin || dateDebut,
        periode: periodeAbsence
      });
      
      setDateDebut('');
      setDateFin('');
      fetchAbsences(vraiId); 
      
      // On ouvre la nouvelle pop-up de succès d'ajout !
      setShowAddSuccessModal(true);
      setTimeout(() => setShowAddSuccessModal(false), 2000); // Se ferme après 2 secondes

    } catch (err) {
      console.error(err);
      alert("❌ Erreur serveur lors de la sauvegarde du congé.");
    }
  };

  // 🎯 MODIFICATION : Ouvre la pop-up de confirmation au lieu du window.confirm
  const handleDeleteAbsence = (id) => {
    setAbsenceToDelete(id);
    setShowConfirmModal(true); 
  };

  // 🎯 MODIFICATION : Exécute la suppression et affiche le succès
  const confirmDelete = async () => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/absences/${absenceToDelete}`);
      
      if (res.data.success) {
        fetchAbsences(vraiId); 
        setShowConfirmModal(false); 
        setShowSuccessModal(true);  
        
        // Fait disparaître la pop-up de succès après 2 secondes
        setTimeout(() => setShowSuccessModal(false), 2000);
      }
    } catch (err) {
      console.error("Erreur suppression front:", err);
      alert("Erreur lors de la suppression de l'absence");
    }
  };

  return (
    <div className="doctor-dashboard">
      <aside className="dashboard-sidebar">
        
        {/* 1. 🎯 NOUVEAU : Le bouton avec les 3 tirets (Hamburger) */}
        <div className="hamburger-trigger">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="doctor-profile-mini">
          <div className="avatar-pro"><FaUserMd size={40} /></div>
          
          {/* 2. 🎯 NOUVEAU : On enveloppe le nom pour pouvoir le cacher quand la barre est réduite */}
          <div className="doctor-profile-info">
            <h3>{medecinInfo.nom}</h3>
            <p>Espace Praticien</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          
          {/* 3. 🎯 NOUVEAU : On ajoute className="menu-icon" sur l'icône, et on enveloppe le texte dans un <span> */}
          <button className={`menu-item ${activeTab === 'profil' ? 'active' : ''}`} onClick={() => setActiveTab('profil')}>
            <FaIdCard size={20} className="menu-icon" /> 
            <span className="menu-text">Mes Informations</span>
          </button>
          
          <button className={`menu-item ${activeTab === 'rdv' ? 'active' : ''}`} onClick={() => setActiveTab('rdv')}>
            <FaCalendarAlt size={20} className="menu-icon" /> 
            <span className="menu-text">Mon Agenda</span>
          </button>
          
          <button className={`menu-item ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
            <FaUserInjured size={20} className="menu-icon" /> 
            <span className="menu-text">Dossiers Patients</span>
          </button>
          
          <button className={`menu-item ${activeTab === 'absences' ? 'active' : ''}`} onClick={() => setActiveTab('absences')}>
            <FaBan size={20} className="menu-icon" /> 
            <span className="menu-text">Gérer mes Absences</span>
          </button>

        </nav>
      </aside>

      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>Bonjour, {medecinInfo.nom}</h1>
          <p>Voici un résumé de votre activité de consultation.</p>
        </div>

        {activeTab === 'profil' && (
          <div className="content-card">
            <h2><FaIdCard /> Mes Informations Professionnelles</h2>
            <div className="profile-info-grid">
              <div className="info-group"><label>Nom </label><p>{medecinInfo.nom}</p></div>
              <div className="info-group"><label>Email Pro</label><p>{medecinInfo.email}</p></div>
              <div className="info-group"><label>Téléphone Cabinet</label><p>{medecinInfo.telephone}</p></div>
              <div className="info-group"><label>Adresse du Cabinet</label><p>{medecinInfo.adresse}</p></div>
              <div className="info-group"><label>Spécialité</label><p>{medecinInfo.specialite}</p></div>
            </div>
            <button className="btn-edit-profile" onClick={handleEditProfile}>
              <FaEdit /> Modifier mes informations
            </button>
          </div>
        )}

        {activeTab === 'rdv' && (
          <div className="content-card">
            <h2 style={{marginBottom:'20px'}}><FaCalendarAlt /> Rendez-vous à venir</h2>
            <div className="rdv-list">
              {sortedRdv.length === 0 ? (
                <p style={{color: '#94a3b8', textAlign: 'center'}}>Aucun rendez-vous à venir.</p>
              ) : (
                sortedRdv.map(rdv => (
                  <div key={rdv.id} className="rdv-item">
                    <div className="rdv-info">
                      <div className="rdv-time">{rdv.heure}</div>
                      <div className="rdv-patient">
                        <h4>{rdv.patient}</h4>
                        <p>Date : {rdv.date} | Motif : {rdv.motif}</p>
                      </div>
                    </div>
                    <div className="rdv-actions" style={{display: 'flex', gap: '10px'}}>
                      <button className="btn-action chat" style={{background: '#0ea5e9'}} onClick={() => setActiveChat(rdv)}>
                        <FaComments /> Chat
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeChat && (
          <div className="chat-modal-overlay">
            <div className="chat-modal-container">
              <button className="close-chat" onClick={() => setActiveChat(null)}>✕ Fermer</button>
              <Chat 
                rendezVousId={activeChat.id} 
                userId={medecinId} 
                currentUserName={medecinInfo.nom} 
              />
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="content-card">
            <h2><FaUserInjured /> Dossiers Patients</h2>
            <div className="patient-controls" style={{marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center'}}>
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchPatient}
                onChange={e => setSearchPatient(e.target.value)}
                style={{padding: '10px', flex: 1, borderRadius: '8px', border: '1px solid #e2e8f0'}}
              />
              <select value={sortType} onChange={e => setSortType(e.target.value)} style={{padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                <option value="date-asc">Date asc.</option>
                <option value="date-desc">Date desc.</option>
                <option value="nom">Nom patient</option>
              </select>
            </div>

            <h3 style={{marginTop: '30px'}}>Historique des clients</h3>
            <div className="rdv-list">
              {filteredHistory.length === 0 ? (
                <p style={{color: '#94a3b8', textAlign: 'center'}}>Aucun patient trouvé dans l'historique.</p>
              ) : (
                filteredHistory.map(rdv => (
                  <div key={rdv.id} className="rdv-item past">
                    <div className="rdv-info">
                      <div className="rdv-time">{rdv.heure}</div>
                      <div className="rdv-patient">
                        <h4>{rdv.patient} <span style={{fontSize: '0.8em', fontWeight: 'normal', color: '#64748b'}}>({rdv.statut})</span></h4>
                        <p>Date : {rdv.date} | Motif : {rdv.motif}</p>
                      </div>
                    </div>
                    <button 
                      className="btn-view-details" 
                      onClick={() => handleViewDetails(rdv)}
                      style={{ padding: '8px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      Voir détails
                    </button>
                    {rdv.noteSecrete && (
                      <div className="note-secrete" style={{background: '#f8fafc', padding: '10px', borderRadius: '5px', marginTop: '10px', fontSize: '0.9em'}}>
                        <strong>Note :</strong> <em>{rdv.noteSecrete}</em>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'absences' && (
  <div className="absence-container">
    
    {/* 1. CARTE DU FORMULAIRE */}
    <div className="absence-form-card">
      <div className="absence-form-header">
        <h3><FaBan /> Gérer mes Absences</h3>
        <p>Définissez vos périodes d'indisponibilité pour bloquer la prise de rendez-vous.</p>
      </div>

      <div className="absence-form-grid">
        
        <div className="absence-input-group">
          <label>Date de début</label>
          <input 
            type="date" 
            className="absence-input"
            value={dateDebut} 
            onChange={e => setDateDebut(e.target.value)} 
          />
        </div>
        
        <div className="absence-input-group">
          <label>Date de fin</label>
          <input 
            type="date" 
            className="absence-input"
            value={dateFin} 
            onChange={e => setDateFin(e.target.value)} 
          />
        </div>
        
        <div className="absence-input-group">
          <label>Période</label>
          <select 
            className="absence-input"
            value={periodeAbsence} 
            onChange={e => setPeriodeAbsence(e.target.value)}
          >
            <option>Journée entière</option>
            <option>Matin</option>
            <option>Après-midi</option>
          </select>
        </div>

        <button className="btn-submit-absence" onClick={handleSaveAbsence}>
          <FaBan /> <span>Enregistrer l'indisponibilité</span>
        </button>
        
      </div>
    </div>

    {/* 2. CARTE DE LA LISTE / HISTORIQUE */}
    <div className="absence-list-card">
      <h3>Mes absences enregistrées</h3>
      
      <div className="doc-grid" style={{ marginTop: '20px' }}> 
        {absences && absences.length > 0 ? (
          absences.map(abs => (
            <div key={abs.id} className="doc-card-item absence-card">
              <div className="doc-details">
                <span className="doc-name">
                  Absence le : {new Date(abs.date_absence).toLocaleDateString('fr-FR')}
                </span>
                <span className="doc-date">Période : {abs.periode}</span>
              </div>
              <button className="btn-delete-doc" onClick={() => handleDeleteAbsence(abs.id)}>
                <FaTimesCircle />
              </button>
            </div>
          ))
        ) : (
          /* NOUVEL ÉTAT VIDE (Empty State) */
          <div className="absence-empty-state">
            <div className="absence-empty-icon"><FaBan /></div>
            <p>Aucune absence enregistrée pour le moment.</p>
          </div>
        )}
      </div>
    </div>

  </div>
)}
      </main>

      {/* MODAL DU DOSSIER PATIENT */}
      {isModalOpen && selectedPatient && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal-content" style={modalStyle}>
            <h2 style={{ color: '#1e293b', marginBottom: '15px' }}>
              Dossier de {selectedPatient.patient}
            </h2>

            <div className="patient-details" style={{ textAlign: 'left', fontSize: '0.95em', color: '#334155' }}>
              <p style={{ margin: '5px 0' }}><strong>Statut :</strong> <span style={{ color: '#3b82f6' }}>{selectedPatient.statut}</span></p>
              <p style={{ margin: '5px 0' }}><strong>Motif :</strong> {selectedPatient.motif}</p>
              <p style={{ margin: '5px 0' }}><strong>Date :</strong> {selectedPatient.date} à {selectedPatient.heure}</p>
            </div>

            <div className="document-section" style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', marginTop: '15px' }}>
              <h3 style={{ fontSize: '0.9em', marginBottom: '10px', fontWeight: 'bold' }}>📄 Documents du Dossier</h3>

              {selectedPatient?.fichiers && selectedPatient.fichiers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedPatient.fichiers.map((file, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.85em', color: '#475569' }}>
                        {file.nom_original} 
                      </span>
                      <a
                        href={`http://localhost:5000/uploads/${file.chemin.replace('uploads/', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '0.85em', textDecoration: 'underline' }}
                      >
                        Voir
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85em', fontStyle: 'italic' }}>
                  Aucun document trouvé dans la table documents.
                </div>
              )}
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              style={{ padding: '12px', background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px', width: '100%' }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* 🎯 AJOUT : Modal de Confirmation de Suppression */}
      {showConfirmModal && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal-content" style={{...modalStyle, borderTop: '5px solid #ef4444'}}>
            <FaBan size={50} style={{color: '#ef4444', marginBottom: '15px'}} />
            <h2 style={{color: '#1e293b'}}>Confirmation</h2>
            <p style={{margin: '15px 0', color: '#64748b'}}>Voulez-vous vraiment supprimer cette absence ?</p>
            <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                style={{flex: 1, padding: '12px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#334155'}}
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete} 
                style={{flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 AJOUT : Modal de Succès */}
      {showSuccessModal && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal-content" style={{...modalStyle, borderTop: '5px solid #10b981', maxWidth: '350px'}}>
            <FaCheckCircle size={50} style={{color: '#10b981', marginBottom: '15px'}} />
            <h2 style={{color: '#1e293b'}}>Supprimé !</h2>
            <p style={{color: '#64748b'}}>L'absence a été retirée avec succès.</p>
          </div>
        </div>
      )}

    </div>
  );
}