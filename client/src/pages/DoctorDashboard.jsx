import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserMd, FaCalendarAlt, FaUserInjured, FaNotesMedical, 
  FaCheckCircle, FaBan, FaSearch, FaSortAmountDown, 
  FaIdCard, FaEdit, FaComments // ✅ Ajout de FaComments pour l'icône de chat
} from 'react-icons/fa';
import Chat from '../components/chat/Chat'; // ✅ Import du composant Chat
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profil');
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [activeChat, setActiveChat] = useState(null); // ✅ État pour gérer le chat ouvert

  const [sortType, setSortType] = useState('date-asc'); 
  const [searchPatient, setSearchPatient] = useState(''); 
  
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [periodeAbsence, setPeriodeAbsence] = useState('Journée entière');

  const medecinId = localStorage.getItem('userId');

  const [medecinInfo, setMedecinInfo] = useState({
    nom: "Chargement...",
    email: "...",
    telephone: "Non renseigné",
    adresse: "Non renseignée"
  });

  const [rendezVous, setRendezVous] = useState([]);

  useEffect(() => {
    if (medecinId) {
      // 1. Profil du médecin
      axios.get(`http://localhost:5000/api/auth/user/${medecinId}`)
        .then(res => {
          setMedecinInfo({
            nom: res.data.nom || "Médecin sans nom",
            email: res.data.email || "Non renseigné",
            telephone: res.data.telephone || "Non renseigné",
            adresse: res.data.adresse || "Non renseignée"
          });
        })
        .catch(err => console.log("Erreur chargement profil :", err));

      // 2. RDV du médecin
      axios.get(`http://localhost:5000/api/appointments/medecin/${medecinId}`)
        .then(res => {
          const vraisRdvs = res.data.map(rdv => ({
            id: rdv.id,
            patient: rdv.Patient?.User?.nom || `Patient N°${rdv.patient_id}`,
            date: rdv.date_rdv,
            heure: rdv.heure_rdv,
            motif: rdv.motif,
            statut: rdv.statut,
            noteSecrete: rdv.note_secrete
          }));
          setRendezVous(vraisRdvs);
        })
        .catch(err => console.log("Erreur chargement RDV :", err));
    }
  }, [medecinId]);

  const handleEditProfile = () => {
    navigate('/edit-profile-medecin');
  };

  const sortedRdv = [...rendezVous]
    .filter(r => r.statut === "À venir" || r.statut === "Confirmé") // ✅ Inclus aussi les confirmés
    .sort((a, b) => {
      if (sortType === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortType === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortType === 'nom') return a.patient.localeCompare(b.patient);
      return 0;
    });

  const filteredHistory = rendezVous.filter(r => 
    r.statut === "Terminé" && 
    r.patient.toLowerCase().includes(searchPatient.toLowerCase())
  );

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
    if (!medecinId) return alert("Erreur : Aucun médecin connecté.");
    if (!dateDebut) return alert("⚠️ Veuillez choisir au moins une date de début !");
    
    try {
      const res = await axios.post('http://localhost:5000/api/absences', {
        medecin_id: medecinId,
        date_debut: dateDebut,
        date_fin: dateFin || dateDebut,
        periode: periodeAbsence
      });
      alert(res.data.message);
      setDateDebut('');
      setDateFin('');
    } catch (err) {
      console.error(err);
      alert("❌ Erreur serveur lors de la sauvegarde du congé.");
    }
  };

  return (
    <div className="doctor-dashboard">
      <aside className="dashboard-sidebar">
        <div className="doctor-profile-mini">
          <div className="avatar-pro"><FaUserMd size={40} /></div>
          <h3>{medecinInfo.nom}</h3>
          <p>Espace Praticien</p>
        </div>
        <nav className="sidebar-menu">
          <button className={`menu-item ${activeTab === 'profil' ? 'active' : ''}`} onClick={() => setActiveTab('profil')}>
            <FaIdCard size={20} /> Mes Informations
          </button>
          <button className={`menu-item ${activeTab === 'rdv' ? 'active' : ''}`} onClick={() => setActiveTab('rdv')}>
            <FaCalendarAlt size={20} /> Mon Agenda
          </button>
          <button className={`menu-item ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
            <FaUserInjured size={20} /> Dossiers Patients
          </button>
          <button className={`menu-item ${activeTab === 'absences' ? 'active' : ''}`} onClick={() => setActiveTab('absences')}>
            <FaBan size={20} /> Gérer mes Absences
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
              <div className="info-group"><label>Nom complet</label><p>{medecinInfo.nom}</p></div>
              <div className="info-group"><label>Email Pro</label><p>{medecinInfo.email}</p></div>
              <div className="info-group"><label>Téléphone Cabinet</label><p>{medecinInfo.telephone}</p></div>
              <div className="info-group"><label>Adresse du Cabinet</label><p>{medecinInfo.adresse}</p></div>
              <div className="info-group"><label>Spécialité</label><p>Médecin</p></div>
            </div>
            <button className="btn-edit-profile" onClick={handleEditProfile}>
              <FaEdit /> Modifier mes informations
            </button>
          </div>
        )}

        {activeTab === 'rdv' && (
          <div className="content-card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h2 style={{margin:0}}><FaCalendarAlt /> Rendez-vous à venir</h2>
            </div>

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
                      {/* ✅ AJOUT DU BOUTON CHAT */}
                      <button className="btn-action chat" style={{background: '#0ea5e9'}} onClick={() => setActiveChat(rdv)}>
                        <FaComments /> Chat
                      </button>
                      
                      <button className="btn-action success" onClick={() => alert("Consultation démarrée")}>
                        <FaCheckCircle /> Démarrer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ✅ FENÊTRE MODALE DU CHAT */}
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

        {/* Sections patients et absences sửa*/}
        {activeTab === 'patients' && (
          <div className="content-card">
            <h2><FaUserInjured /> Dossiers Patients</h2>
            <div className="patient-controls" style={{marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center'}}>
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchPatient}
                onChange={e => setSearchPatient(e.target.value)}
                style={{padding: '5px 10px', flex: 1}}
              />
              <select value={sortType} onChange={e => setSortType(e.target.value)} style={{padding: '5px 10px'}}>
                <option value="date-asc">Date asc.</option>
                <option value="date-desc">Date desc.</option>
                <option value="nom">Nom patient</option>
              </select>
            </div>

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
                      <button className="btn-action success" onClick={() => alert("Consultation démarrée")}> 
                        <FaCheckCircle /> Démarrer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Historique simple filtré par recherche */}
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
                        <h4>{rdv.patient}</h4>
                        <p>Date : {rdv.date} | Motif : {rdv.motif}</p>
                      </div>
                    </div>
                    {rdv.noteSecrete && (
                      <div className="note-secrete">
                        <em>Note : {rdv.noteSecrete}</em>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'absences' && (
          <div className="content-card">
            <h2><FaBan /> Gérer mes Absences</h2>
            <div className="absence-form" style={{display:'flex',flexDirection:'column',gap:'10px',maxWidth:'400px'}}>
              <label>Date de début</label>
              <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
              <label>Date de fin (facultatif)</label>
              <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} />
              <label>Période</label>
              <select value={periodeAbsence} onChange={e => setPeriodeAbsence(e.target.value)}>
                <option>Journée entière</option>
                <option>Matin</option>
                <option>Après-midi</option>
              </select>
              <button className="btn-action" onClick={handleSaveAbsence}>Enregistrer l'absence</button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}