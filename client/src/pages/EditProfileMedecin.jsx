// pages/EditProfileMedecin.jsx - Version Médecin (AVEC adresse)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './EditProfile.css';

const EditProfileMedecin = () => {
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
    adresse: '',
    specialite: '',
    ville: '',
    code_postal: ''
  });

  useEffect(() => {
    fetchMedecinData();
  }, []);

  const fetchMedecinData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      console.log("🔍 User ID médecin:", userId);
      
      const response = await api.get(`/medecins/profile?userId=${userId}`);
      
      console.log("✅ Données reçues:", response.data);
      
      setFormData({
        nom: response.data.user?.nom || '',
        prenom: response.data.user?.prenom || '',
        email: response.data.user?.email || '',
        telephone: response.data.telephone || '',
        adresse: response.data.adresse || '',
        specialite: response.data.specialite?.nom || '',
        ville: response.data.ville || '',
        code_postal: response.data.code_postal || ''
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
      
      await api.put(`/medecins/${userId}`, {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        ville: formData.ville,
        code_postal: formData.code_postal
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/patient-dashboard', { 
          state: { message: '✅ Vos informations ont été mises à jour avec succès !' }
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
    navigate('/patient-dashboard');
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
        <h1>Modifier mes informations (Médecin)</h1>
        
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

          <div className="form-group">
            <label>Spécialité</label>
            <input
              type="text"
              name="specialite"
              value={formData.specialite}
              disabled
              className="disabled-input"
            />
          </div>

          <div className="form-group">
            <label>Adresse du cabinet</label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              placeholder="Numéro et nom de rue"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ville</label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                placeholder="Ville"
              />
            </div>
            
            <div className="form-group">
              <label>Code postal</label>
              <input
                type="text"
                name="code_postal"
                value={formData.code_postal}
                onChange={handleChange}
                placeholder="Code postal"
                maxLength="5"
              />
            </div>
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

export default EditProfileMedecin;