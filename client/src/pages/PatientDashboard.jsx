import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUser, FaCalendarCheck, FaHistory, FaFolderOpen, 
  FaUpload, FaTimesCircle, FaIdCard, FaEdit, FaComments // ✅ Ajout de FaComments
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import Chat from '../components/chat/Chat'; // ✅ Import du composant Chat
import './PatientDashboard.css';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profil');
  const [rendezVous, setRendezVous] = useState([]);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [activeChat, setActiveChat] = useState(null); // ✅ État pour gérer le chat ouvert

  const [patientInfo, setPatientInfo] = useState({
    nom: "Chargement...",
    email: "...",
    telephone: "Non renseigné",
    adresse: "Non renseignée",
    date_naissance: "Non renseignée",
    groupe_sanguin: "Non renseigné"
  });

  const patientId = localStorage.getItem('userId');

  useEffect(() => {
    if (patientId) {
      // 1. Profil du patient
      axios.get(`http://localhost:5000/api/auth/user/${patientId}`)
        .then(res => {
          setPatientInfo({
            nom: res.data.nom || "Utilisateur sans nom",
            email: res.data.email || "Non renseigné",
            telephone: res.data.telephone || "Non renseigné",
            adresse: res.data.adresse || "Non renseignée",
            date_naissance: res.data.date_naissance || "Non renseignée",
            groupe_sanguin: res.data.groupe_sanguin || "Non renseigné"
          });
        })
        .catch(err => console.log("Erreur chargement profil :", err));

      // 2. RDV du patient
      axios.get(`http://localhost:5000/api/appointments/patient/${patientId}`)
        .then(res => {
          const vraisRdvs = res.data.map(rdv => ({
            id: rdv.id,
            medecin: rdv.Medecin?.User?.nom || `Médecin N°${rdv.medecin_id}`,
            date: rdv.date_rdv,
            heure: rdv.heure_rdv,
            motif: rdv.motif,
            statut: rdv.statut // Peut être "Confirmé", "À venir", etc.
          }));
          setRendezVous(vraisRdvs);
        })
        .catch(err => console.log("Erreur chargement RDV :", err));
    }
  }, [patientId]);

  const handleEditProfile = () => {
    const userRole = localStorage.getItem('role');
    if (userRole === 'medecin') {
      navigate('/edit-profile-medecin');
    } else {
      navigate('/edit-profile');
    }
  };

  // Filtrage des RDV
  const rdvsAVenir = rendezVous.filter(r => r.statut === "À venir" || r.statut === "Confirmé");
  const rdvsPasses = rendezVous.filter(r => r.statut === "Terminé" || r.statut === "Annulé");

  return (
    <div className="patient-dashboard">
      <aside className="dashboard-sidebar">
        <div className="patient-profile-mini">
          <div className="avatar-patient"><FaUser size={35} /></div>
          <h3>{patientInfo.nom}</h3>
          <p>Mon Dossier Santé</p>
        </div>
        <nav className="sidebar-menu">
          <button className={`menu-item ${activeTab === 'profil' ? 'active' : ''}`} onClick={() => setActiveTab('profil')}>
            <FaIdCard size={20} /> Mes Informations
          </button>
          <button className={`menu-item ${activeTab === 'rdv' ? 'active' : ''}`} onClick={() => setActiveTab('rdv')}>
            <FaCalendarCheck size={20} /> Mes Rendez-vous
          </button>
          <button className={`menu-item ${activeTab === 'historique' ? 'active' : ''}`} onClick={() => setActiveTab('historique')}>
            <FaHistory size={20} /> Mon Historique
          </button>
          <button className={`menu-item ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
            <FaFolderOpen size={20} /> Mes Documents
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
              <div className="info-group"><label>Nom complet</label><p>{patientInfo.nom}</p></div>
              <div className="info-group"><label>Email</label><p>{patientInfo.email}</p></div>
              <div className="info-group"><label>Téléphone</label><p>{patientInfo.telephone}</p></div>
              <div className="info-group"><label>Date de naissance</label><p>{patientInfo.date_naissance}</p></div>
              <div className="info-group"><label>Groupe Sanguin</label><p>{patientInfo.groupe_sanguin}</p></div>
              <div className="info-group"><label>Adresse</label><p>{patientInfo.adresse}</p></div>
            </div>
            <button className="btn-edit-profile" onClick={handleEditProfile}><FaEdit /> Modifier</button>
          </div>
        )}

        {activeTab === 'rdv' && (
          <div className="content-card">
            <h2><FaCalendarCheck /> Prochains Rendez-vous</h2>
            <div className="rdv-list">
              {rdvsAVenir.length === 0 ? (
                <p>Aucun rendez-vous prévu.</p>
              ) : (
                rdvsAVenir.map(rdv => (
                  <div key={rdv.id} className="rdv-item">
                    <div className="rdv-info">
                      <div className="rdv-date-badge">{rdv.date}<br/><span>{rdv.heure}</span></div>
                      <div className="rdv-doctor">
                        <h4>Dr. {rdv.medecin}</h4>
                        <p>Motif : {rdv.motif}</p>
                      </div>
                    </div>
                    <div className="rdv-actions">
                      {/* ✅ Bouton Chat : Apparaît si le RDV est confirmé */}
                      <button className="btn-chat" onClick={() => setActiveChat(rdv)}>
                        <FaComments /> Chat
                      </button>
                      <button className="btn-cancel" onClick={() => alert("Annulation...")}>
                        <FaTimesCircle /> Annuler
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ✅ Affichage du Chat si un RDV est sélectionné */}
        {activeChat && (
          <div className="chat-modal-overlay">
            <div className="chat-modal-container">
              <button className="close-chat" onClick={() => setActiveChat(null)}>✕ Fermer</button>
              <Chat 
                rendezVousId={activeChat.id} 
                userId={patientId} 
                currentUserName={patientInfo.nom} 
              />
            </div>
          </div>
        )}

        {activeTab === 'historique' && (
          <div className="content-card">
            <h2><FaHistory /> Historique des Rendez-vous</h2>
            <div className="rdv-list">
              {rdvsPasses.length === 0 ? (
                <p>Aucun historique de rendez-vous.</p>
              ) : (
                rdvsPasses.map(rdv => (
                  <div key={rdv.id} className="rdv-item past">
                    <div className="rdv-info">
                      <div className="rdv-date-badge">{rdv.date}<br/><span>{rdv.heure}</span></div>
                      <div className="rdv-doctor">
                        <h4>Dr. {rdv.medecin}</h4>
                        <p>Motif : {rdv.motif}</p>
                        <span className={`statut-badge ${rdv.statut.toLowerCase()}`}>{rdv.statut}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="content-card">
            <h2><FaFolderOpen /> Mes Documents Médicaux</h2>
            <div className="documents-section">
              <div className="upload-area">
                <FaUpload size={30} />
                <p>Cliquez pour télécharger vos documents médicaux</p>
                <input type="file" style={{ display: 'none' }} />
              </div>
              <div className="documents-list">
                <p>Aucun document chargé pour le moment.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}