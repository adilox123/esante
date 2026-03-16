// pages/EditProfile.jsx - Version Patient (avec adresse)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    date_naissance: '',
    groupe_sanguin: 'Non renseigné',
    adresse: '' // ✅ Ajout de l'adresse ici
  });

  const groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Non renseigné'];

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      console.log("🔍 User ID:", userId);
      
      const response = await api.get(`/patients/profile?userId=${userId}`);
      
      console.log("✅ Données reçues:", response.data);
      
      setFormData({
        nom: response.data.user?.nom || '',
        prenom: response.data.user?.prenom || '',
        email: response.data.user?.email || '',
        telephone: response.data.telephone || '',
        date_naissance: response.data.date_naissance || '',
        groupe_sanguin: response.data.groupe_sanguin || 'Non renseigné',
        adresse: response.data.adresse || '' // ✅ Récupération de l'adresse depuis la BD
      });
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur:', error);
      setError('Erreur lors du chargement de vos informations');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      const profileResponse = await api.get(`/patients/profile?userId=${userId}`);
      const patientId = profileResponse.data.id;
      
      // ✅ Envoi de l'adresse avec les autres champs
      await api.put(`/patients/${patientId}`, {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        date_naissance: formData.date_naissance,
        groupe_sanguin: formData.groupe_sanguin,
        adresse: formData.adresse 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard', { // ⚠️ J'ai remis '/dashboard' au lieu de '/patient-dashboard' selon ta capture d'écran précédente
          state: { 
            message: '✅ Vos informations ont été mises à jour avec succès !',
            type: 'success'
          }
        });
      }, 1500);
      
    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
      setError('Erreur lors de la mise à jour de vos informations');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard'); // ⚠️ Ajusté pour correspondre à ton URL
  };

  if (loading) {
    return (
      <div className="edit-profile-container">
        <div className="loading-spinner">Chargement de vos informations...</div>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h1>Modifier mes informations</h1>
        
        {success && (
          <div className="success-message">
            ✓ Informations mises à jour avec succès ! Redirection...
          </div>
        )}
        
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="06 XX XX XX XX"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date de naissance</label>
              <input
                type="date"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Groupe sanguin</label>
              <select
                name="groupe_sanguin"
                value={formData.groupe_sanguin}
                onChange={handleChange}
              >
                {groupesSanguins.map(groupe => (
                  <option key={groupe} value={groupe}>{groupe}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ✅ Ajout du champ Adresse ici */}
          <div className="form-group">
            <label>Adresse</label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              placeholder="Ex: Quartier Agdal, Rabat"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={handleCancel}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;