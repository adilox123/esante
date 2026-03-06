import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserMd, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import './BookAppointment.css';

export default function BookAppointment() {
  const { doctorId } = useParams(); 
  const navigate = useNavigate();
  
  const [medecin, setMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [motif, setMotif] = useState('Consultation générale');
  const [isSuccess, setIsSuccess] = useState(false);

  const availableTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  useEffect(() => {
    axios.get('http://localhost:5000/api/medecins')
      .then(res => {
        const foundDoctor = res.data.find(d => d.id.toString() === doctorId);
        setMedecin(foundDoctor);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, [doctorId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const patientId = localStorage.getItem('userId');

    if (!token || !patientId) {
      alert("⚠️ Vous devez être connecté en tant que patient pour prendre rendez-vous.");
      return;
    }

    if (!date || !time) {
      alert("⚠️ Veuillez sélectionner une date et une heure.");
      return;
    }

    const appointmentDetails = {
      medecinId: doctorId,
      patientId: patientId,
      date_rdv: date,
      heure_rdv: time,
      motif: motif,
      medecinNom: medecin.User?.nom,
      medecinPrenom: medecin.User?.prenom,
      amount: 50
    };

    navigate('/payment', { state: appointmentDetails });
  };

  if (loading) return <h2 style={{textAlign: 'center', marginTop: '50px'}}>Chargement...</h2>;
  if (!medecin) return <h2 style={{textAlign: 'center', marginTop: '50px', color: '#e11d48'}}>Médecin introuvable</h2>;

  return (
    <div className="booking-container">
      <div className="booking-wrapper">
        
        <div className="doctor-summary-card">
          <div className="doctor-summary-avatar" style={{ backgroundColor: '#eff6ff', color: '#3182ce' }}>
            <FaUserMd size={45} />
          </div>
          <h2 className="doctor-summary-name">{medecin.User?.nom} {medecin.User?.prenom}</h2>
          <span className="doctor-summary-spec">{medecin.Specialite?.nom || "Spécialiste"}</span>
          <div className="doctor-summary-details">
            <p><FaMapMarkerAlt color="#3182ce" /> {medecin.adresse || "Adresse non renseignée"}</p>
            <p><FaPhone color="#3182ce" /> {medecin.telephone || "Téléphone non renseigné"}</p>
            <p><FaEnvelope color="#3182ce" /> {medecin.User?.email || "Email non renseigné"}</p>
          </div>
        </div>

        <div className="booking-form-card">
          <form onSubmit={handleSubmit}>
            <h2>Prendre un rendez-vous</h2>

            <div className="booking-section">
              <label>1. Motif de la consultation</label>
              <select className="booking-select" value={motif} onChange={(e) => setMotif(e.target.value)}>
                <option value="Consultation générale">Consultation générale</option>
                <option value="Première visite">Première visite</option>
                <option value="Suivi médical">Suivi médical</option>
                <option value="Urgence">Urgence</option>
              </select>
            </div>

            <div className="booking-section">
              <label>2. Choisissez une date</label>
              <input 
                type="date" 
                className="booking-date" 
                value={date} 
                min={new Date().toISOString().split('T')[0]} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </div>

            <div className="booking-section">
              <label>3. Choisissez l'heure</label>
              {date ? (
                <div className="time-slots-grid">
                  {availableTimeSlots.map(slot => (
                    <div 
                      key={slot} 
                      className={`time-slot ${time === slot ? 'selected' : ''}`} 
                      onClick={() => setTime(slot)}
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{color: '#718096', fontSize: '14px', fontStyle: 'italic'}}>
                  Veuillez d'abord sélectionner une date pour voir les créneaux horaires.
                </p>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-confirm-booking" 
              disabled={!date || !time}
              style={{ 
                backgroundColor: (!date || !time) ? '#cbd5e1' : '#3182ce',
                cursor: (!date || !time) ? 'not-allowed' : 'pointer'
              }}
            >
              Passer au paiement 
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}