// pages/EditProfile.jsx - Version Patient
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
    adresse: ''
  });

  const groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Non renseigné'];

  useEffect(() => { fetchPatientData(); }, []);

  const fetchPatientData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await api.get(`/patients/profile?userId=${userId}`);
      setFormData({
        nom: response.data.user?.nom || '',
        prenom: response.data.user?.prenom || '',
        email: response.data.user?.email || '',
        telephone: response.data.telephone || '',
        date_naissance: response.data.date_naissance || '',
        groupe_sanguin: response.data.groupe_sanguin || 'Non renseigné',
        adresse: response.data.adresse || ''
      });
      setLoading(false);
    } catch (error) {
      setError('Erreur lors du chargement de vos informations');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      await api.put(`/patients/${patientId}`, {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        date_naissance: formData.date_naissance,
        groupe_sanguin: formData.groupe_sanguin,
        adresse: formData.adresse
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', {
          state: { message: '✅ Vos informations ont été mises à jour avec succès !', type: 'success' }
        });
      }, 1500);
    } catch (error) {
      setError('Erreur lors de la mise à jour de vos informations');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate('/dashboard');

  if (loading) {
    return (
      <div className="ep-root">
        <div className="ep-orb ep-orb--1" /><div className="ep-orb ep-orb--2" />
        <div className="ep-loading">
          <div className="ep-spinner" />
          <p>Chargement de vos informations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-root">
      <div className="ep-orb ep-orb--1" />
      <div className="ep-orb ep-orb--2" />
      <div className="ep-orb ep-orb--3" />

      <div className="ep-card">

        {/* Header */}
        <div className="ep-card__header">
          <div className="ep-card__header-icon">👤</div>
          <div>
            <h1 className="ep-card__title">Modifier mon profil</h1>
            <p className="ep-card__subtitle">Mettez à jour vos informations personnelles</p>
          </div>
        </div>

        {/* Top accent */}
        <div className="ep-card__accent" />

        {/* Alerts */}
        {success && (
          <div className="ep-alert ep-alert--success">
            <span>✅</span> Informations mises à jour avec succès ! Redirection en cours...
          </div>
        )}
        {error && (
          <div className="ep-alert ep-alert--error">
            <span>❌</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ep-form">

          {/* Section identité */}
          <div className="ep-section">
            <p className="ep-section__label">Identité</p>
            <div className="ep-row">
              <div className="ep-field">
                <label className="ep-field__label">Nom</label>
                <input
                  type="text" name="nom" value={formData.nom}
                  onChange={handleChange} required
                  className="ep-field__input" placeholder="Ex: Alaoui"
                />
              </div>
              <div className="ep-field">
                <label className="ep-field__label">Prénom</label>
                <input
                  type="text" name="prenom" value={formData.prenom}
                  onChange={handleChange} required
                  className="ep-field__input" placeholder="Ex: Youssef"
                />
              </div>
            </div>
          </div>

          {/* Section contact */}
          <div className="ep-section">
            <p className="ep-section__label">Contact</p>
            <div className="ep-field">
              <label className="ep-field__label">Adresse Email</label>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} required
                className="ep-field__input" placeholder="Ex: youssef@email.com"
              />
            </div>
            <div className="ep-field">
              <label className="ep-field__label">Téléphone</label>
              <input
                type="tel" name="telephone" value={formData.telephone}
                onChange={handleChange}
                className="ep-field__input" placeholder="Ex: 06 XX XX XX XX"
              />
            </div>
            <div className="ep-field">
              <label className="ep-field__label">Adresse</label>
              <input
                type="text" name="adresse" value={formData.adresse}
                onChange={handleChange}
                className="ep-field__input" placeholder="Ex: Quartier Agdal, Rabat"
              />
            </div>
          </div>

          {/* Section médical */}
          <div className="ep-section">
            <p className="ep-section__label">Informations médicales</p>
            <div className="ep-row">
              <div className="ep-field">
                <label className="ep-field__label">Date de naissance</label>
                <input
                  type="date" name="date_naissance" value={formData.date_naissance}
                  onChange={handleChange}
                  className="ep-field__input"
                />
              </div>
              <div className="ep-field">
                <label className="ep-field__label">Groupe sanguin</label>
                <select
                  name="groupe_sanguin" value={formData.groupe_sanguin}
                  onChange={handleChange}
                  className="ep-field__input"
                >
                  {groupesSanguins.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="ep-actions">
            <button type="button" className="ep-btn ep-btn--ghost" onClick={handleCancel}>
              Annuler
            </button>
            <button type="submit" className="ep-btn ep-btn--primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="ep-btn-spinner" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <span>Enregistrer les modifications</span>
                  <span className="ep-btn-arrow">→</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProfile;