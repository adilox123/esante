import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUser, FaCalendarCheck, FaHistory, FaFolderOpen, 
  FaUpload, FaTimesCircle, FaIdCard, FaEdit, FaComments, FaCheckCircle 
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import Chat from '../components/chat/Chat'; 
import './PatientDashboard.css';
import Chatbot from '../components/Chatbot';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profil');
  const [rendezVous, setRendezVous] = useState([]);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [activeChat, setActiveChat] = useState(null); 
  const [documents, setDocuments] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  
  // États pour les Modals d'annulation de RDV
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appointmentToCancelId, setAppointmentToCancelId] = useState(null);

  // 🎯 NOUVEAUX ÉTATS : Modal de suppression de document
  const [showDeleteDocModal, setShowDeleteDocModal] = useState(false);
  const [docToDeleteId, setDocToDeleteId] = useState(null);

  const [patientInfo, setPatientInfo] = useState({
    nom: "Chargement...",
    email: "...",
    telephone: "Non renseigné",
    adresse: "Non renseignée",
    date_naissance: "Non renseignée",
    groupe_sanguin: "Non renseigné",
    sexe: "Non renseigné"
  });

  const patientId = localStorage.getItem('userId');

  // Styles pour les Modals
  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 2000
  };

  const modalStyle = {
    backgroundColor: 'white', padding: '30px', borderRadius: '12px',
    maxWidth: '450px', width: '90%', textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  };

  useEffect(() => {
    if (patientId) {
      // 🎯 ON FAIT DEUX REQUÊTES EN MÊME TEMPS : User ET Patient
      Promise.all([
        axios.get(`http://localhost:5000/api/auth/user/${patientId}`),
        axios.get(`http://localhost:5000/api/patients/profile?userId=${patientId}`).catch(() => ({ data: {} }))
      ])
      .then(([userRes, patientRes]) => {
        const user = userRes.data;
        const patient = patientRes.data;
        
        console.log("📦 Données User reçues:", user);
        console.log("📦 Données Patient reçues:", patient);

        setPatientInfo({
          nom: user.nom || "Utilisateur sans nom",
          email: user.email || "Non renseigné",
          // On va chercher dans la variable 'patient' que le backend nous envoie !
          telephone: patient.telephone || "Non renseigné",
          adresse: patient.adresse || "Non renseignée",
          date_naissance: patient.date_naissance || "Non renseignée",
          groupe_sanguin: patient.groupe_sanguin || "Non renseigné",
          sexe: patient.sexe === 'M' ? 'Homme' : patient.sexe === 'F' ? 'Femme' : "Non renseigné"
        });
      })
      .catch(err => console.log("Erreur profil :", err));

      // --- Le chargement des RDV reste identique ---
      axios.get(`http://localhost:5000/api/appointments/patient/${patientId}`)
        .then(res => {
          const vraisRdvs = res.data.map(rdv => ({
            id: rdv.id,
            medecin: rdv.nom_medecin || `Médecin N°${rdv.medecin_id}`,
            date: rdv.date_rdv,
            heure: rdv.heure_rdv,
            motif: rdv.motif,
            statut: rdv.statut 
          }));
          setRendezVous(vraisRdvs);
        })
        .catch(err => console.log("Erreur RDV :", err));

      fetchDocuments();
    }
  }, [patientId]);

  useEffect(() => {
    if (activeTab === 'documents' && patientId) {
      fetchDocuments();
    }
  }, [activeTab, patientId]);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/documents/${patientId}`);
      if (res.data.success) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      console.error("Erreur chargement documents :", err);
    }
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
        formData, 
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (res.data.success) {
        setUploadStatus({ type: 'success', message: 'Document médical ajouté avec succès !' });
        fetchDocuments(); 
      }
    } catch (err) {
      setUploadStatus({ type: 'error', message: "Erreur lors de l'envoi." });
    }
  };

  // 🎯 LOGIQUE MODAL SUPPRESSION DOCUMENT
  const handleDeleteFile = (id) => {
    setDocToDeleteId(id);
    setShowDeleteDocModal(true);
  };

  const confirmDeleteFile = async () => {
    try {
      console.log("🗑️ Suppression du document ID:", docToDeleteId);
      
      // 🎯 CORRECTION : On utilise .delete et non .get
      const res = await axios.delete(`http://localhost:5000/api/documents/${docToDeleteId}`);
      
      if (res.data.success) {
        fetchDocuments(); // On rafraîchit la liste
        console.log("✅ Document supprimé avec succès");
      }
      
      // On ferme TOUJOURS le modal après la réponse
      setShowDeleteDocModal(false); 
      
    } catch (err) {
      console.error("❌ Erreur lors de la suppression :", err);
      setShowDeleteDocModal(false);
      alert("Erreur : Impossible de supprimer le document.");
    }
  };

  // --- LOGIQUE MODAL ANNULATION RDV ---
  const handleCancel = (id) => {
    setAppointmentToCancelId(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/appointments/${appointmentToCancelId}`);
      if (res.data.success) {
        setRendezVous(prev => prev.filter(rdv => rdv.id !== appointmentToCancelId));
        setShowCancelModal(false);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error("Erreur annulation :", err);
      setShowCancelModal(false);
      alert("Erreur lors de la suppression du rendez-vous.");
    }
  };

  const handleEditProfile = () => {
    const userRole = localStorage.getItem('role');
    userRole === 'medecin' ? navigate('/edit-profile-medecin') : navigate('/edit-profile');
  };

  const rdvsAVenir = rendezVous.filter(r => r.statut === "À venir" || r.statut === "Confirmé");

  return (
    <div className="patient-dashboard">
      <aside className="dashboard-sidebar">
  
  {/* 1. 🎯 NOUVEAU : Le bouton Hamburger (les 3 tirets) */}
  <div className="hamburger-trigger">
    <span></span>
    <span></span>
    <span></span>
  </div>

  <div className="patient-profile-mini">
    <div className="avatar-patient">
      <FaUser size={35} />
    </div>
    
    {/* 2. 🎯 NOUVEAU : Enveloppe les textes pour l'animation de disparition */}
    <div className="patient-profile-info">
      <h3>{patientInfo.nom}</h3>
      <p>Mon Dossier Santé</p>
    </div>
  </div>

  <nav className="sidebar-menu">
    
    {/* 3. 🎯 NOUVEAU : Icônes isolées et texte dans un span.menu-text */}
    
    <button className={`menu-item ${activeTab === 'profil' ? 'active' : ''}`} onClick={() => setActiveTab('profil')}>
      <div className="menu-icon">
        <FaIdCard size={20} />
      </div>
      <span className="menu-text">Mes Informations</span>
    </button>

    <button className={`menu-item ${activeTab === 'rdv' ? 'active' : ''}`} onClick={() => setActiveTab('rdv')}>
      <div className="menu-icon">
        <FaCalendarCheck size={20} />
      </div>
      <span className="menu-text">Mes Rendez-vous</span>
    </button>

    <button className={`menu-item ${activeTab === 'historique' ? 'active' : ''}`} onClick={() => setActiveTab('historique')}>
      <div className="menu-icon">
        <FaHistory size={20} />
      </div>
      <span className="menu-text">Mon Historique</span>
    </button>

    <button className={`menu-item ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
      <div className="menu-icon">
        <FaFolderOpen size={20} />
      </div>
      <span className="menu-text">Mes Documents</span>
    </button>

  </nav>
</aside>

      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>Bonjour, {patientInfo.nom}</h1>
          <p>Gérez vos rendez-vous médicaux et vos documents de santé.</p>
        </div>

        {successMessage && <div className="success-message">✓ {successMessage}</div>}

        {activeTab === 'profil' && (
          <div className="content-card">
            <h2><FaIdCard /> Mes Informations Personnelles</h2>
            <div className="profile-info-grid">
              <div className="info-group"><label>Nom</label><p>{patientInfo.nom}</p></div>
              <div className="info-group"><label>Email</label><p>{patientInfo.email}</p></div>
              <div className="info-group"><label>Téléphone</label><p>{patientInfo.telephone}</p></div>
              <div className="info-group"><label>Date de naissance</label><p>{patientInfo.date_naissance}</p></div>
              <div className="info-group"><label>Groupe Sanguin</label><p>{patientInfo.groupe_sanguin}</p></div>
              <div className="info-group"><label>Adresse</label><p>{patientInfo.adresse}</p></div>
              <div className="info-group"><label>Sexe</label><p>{patientInfo.sexe}</p></div>
            </div>
            <button className="btn-edit-profile" onClick={handleEditProfile}><FaEdit /> Modifier</button>
          </div>
        )}

        {activeTab === 'rdv' && (
          <div className="content-card">
            <h2><FaCalendarCheck /> Prochains Rendez-vous</h2>
            <div className="rdv-list">
              {rdvsAVenir.length === 0 ? (
                <p style={{textAlign: 'center', color: '#94a3b8', padding: '20px'}}>Aucun rendez-vous prévu.</p>
              ) : (
                rdvsAVenir.map(rdv => (
                  <div key={rdv.id} className="rdv-item">
                    <div className="rdv-info">
                      <div className="rdv-date-badge">{rdv.date}<br/><span>{rdv.heure}</span></div>
                      <div className="rdv-doctor">
                        <h4>{rdv.medecin}</h4>
                        <p>Motif : {rdv.motif}</p>
                      </div>
                    </div>
                    <div className="rdv-actions">
                      <button className="btn-chat" onClick={() => setActiveChat(rdv)}>
                        <FaComments /> Chat
                      </button>
                      <button className="btn-cancel" onClick={() => handleCancel(rdv.id)}>
                        <FaTimesCircle /> Annuler
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'historique' && (
          <div className="content-card">
            <h2><FaHistory /> Historique Complet</h2>
            <div className="rdv-list">
              {rendezVous.map(rdv => (
                <div key={rdv.id} className="rdv-item">
                  <div className="rdv-info">
                    <div className="rdv-date-badge">{rdv.date}<br/><span>{rdv.heure}</span></div>
                    <div className="rdv-doctor">
                      <h4>{rdv.medecin}</h4>
                      <p>Statut : {rdv.statut}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="content-card">
            <h2><FaFolderOpen /> Mes Documents</h2>
            <div className="upload-section-styled">
              <input type="file" id="file-upload" className="hidden-input" onChange={(e) => handleFileUpload(e.target.files[0])} />
              <label htmlFor="file-upload" className="upload-cta-button">
                <FaUpload size={24} /> <span>Cliquez pour uploader un document</span>
              </label>
            </div>
            {uploadStatus && <div className={`status-message ${uploadStatus.type}`}>{uploadStatus.message}</div>}
            <div className="doc-grid">
              {documents.length === 0 ? <p>Aucun document pour le moment.</p> : documents.map(doc => (
                <div key={doc.id} className="doc-card-item">
                  <div className="doc-details">
                    <span className="doc-name">{doc.nom_original}</span>
                    <span className="doc-date">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button className="btn-delete-doc" onClick={() => handleDeleteFile(doc.id)}><FaTimesCircle /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeChat && (
          <div className="chat-modal-overlay">
            <div className="chat-modal-container">
              <button className="close-chat" onClick={() => setActiveChat(null)}>✕ Fermer</button>
              <Chat rendezVousId={activeChat.id} userId={patientId} currentUserName={patientInfo.nom} />
            </div>
          </div>
        )}
      </main>

      {/* --- POPUPS ANNULATION RDV --- */}
      {showCancelModal && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal-content" style={{...modalStyle, borderTop: '5px solid #ef4444'}}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ width: '70px', height: '70px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 15px' }}>
                <FaTimesCircle size={35} color="#ef4444" />
              </div>
              <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Annuler ce rendez-vous ?</h2>
              <p style={{ color: '#64748b', fontSize: '0.95em' }}>Cette action supprimera définitivement le rendez-vous de votre agenda.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={confirmCancel} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Oui, annuler</button>
              <button onClick={() => setShowCancelModal(false)} style={{ padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Garder</button>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP SUPPRESSION DOCUMENT --- */}
      {showDeleteDocModal && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal-content" style={{...modalStyle, borderTop: '5px solid #ef4444'}}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ width: '70px', height: '70px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 15px' }}>
                <FaTimesCircle size={35} color="#ef4444" />
              </div>
              <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Supprimer ce document ?</h2>
              <p style={{ color: '#64748b', fontSize: '0.95em' }}>Ce fichier sera définitivement retiré de votre dossier médical.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={confirmDeleteFile} style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Supprimer</button>
              <button onClick={() => setShowDeleteDocModal(false)} style={{ padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay" style={overlayStyle}>
          <div className="modal-content" style={{...modalStyle, borderTop: '5px solid #10b981'}}>
            <div style={{ width: '70px', height: '70px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 15px' }}>
              <FaCheckCircle size={35} color="#10b981" />
            </div>
            <h2 style={{ color: '#1e293b' }}>C'est fait !</h2>
            <p style={{ color: '#64748b' }}>Le rendez-vous a été annulé avec succès.</p>
            <button onClick={() => setShowSuccessModal(false)} style={{ marginTop: '20px', padding: '12px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>D'accord</button>
          </div>
        </div>
      )}
      <Chatbot />
    </div>

  );
}