// pages/EditProfileMedecin.jsx - Version Médecin
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './EditProfileMedecin.css';

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

  useEffect(() => { fetchMedecinData(); }, []);

  const fetchMedecinData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await api.get(`/medecins/profile?userId=${userId}`);
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
      await api.put(`/medecins/${userId}`, {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        ville: formData.ville,
        code_postal: formData.code_postal
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(true);
      setTimeout(() => {
        navigate('/doctor-dashboard', {
          state: { message: '✅ Vos informations ont été mises à jour avec succès !' }
        });
      }, 1500);
    } catch (error) {
      setError('Erreur lors de la mise à jour de vos informations');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate('/doctor-dashboard');

  if (loading) {
    return (
      <div className="epm-root">
        <div className="epm-orb epm-orb--1" /><div className="epm-orb epm-orb--2" />
        <div className="epm-loading">
          <div className="epm-spinner" />
          <p>Chargement de vos informations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="epm-root">
      <div className="epm-orb epm-orb--1" />
      <div className="epm-orb epm-orb--2" />
      <div className="epm-orb epm-orb--3" />

      <div className="epm-card">

        {/* Top accent */}
        <div className="epm-card__accent" />

        {/* Header */}
        <div className="epm-card__header">
          <div className="epm-card__header-icon">👨‍⚕️</div>
          <div>
            <h1 className="epm-card__title">Modifier mon profil</h1>
            <p className="epm-card__subtitle">Mettez à jour vos informations professionnelles</p>
          </div>
          {/* Specialite badge */}
          {formData.specialite && (
            <div className="epm-specialty-badge">
              🩺 {formData.specialite}
            </div>
          )}
        </div>

        {/* Alerts */}
        {success && (
          <div className="epm-alert epm-alert--success">
            <span>✅</span> Informations mises à jour avec succès ! Redirection en cours...
          </div>
        )}
        {error && (
          <div className="epm-alert epm-alert--error">
            <span>❌</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="epm-form">

          {/* Section identité */}
          <div className="epm-section">
            <p className="epm-section__label">Identité</p>
            <div className="epm-row">
              <div className="epm-field">
                <label className="epm-field__label">Nom</label>
                <input type="text" name="nom" value={formData.nom}
                  onChange={handleChange} required
                  className="epm-field__input" placeholder="Ex: Faraj" />
              </div>
              <div className="epm-field">
                <label className="epm-field__label">Prénom</label>
                <input type="text" name="prenom" value={formData.prenom}
                  onChange={handleChange} required
                  className="epm-field__input" placeholder="Ex: Salaheddine" />
              </div>
            </div>
          </div>

          {/* Section contact */}
          <div className="epm-section">
            <p className="epm-section__label">Contact professionnel</p>
            <div className="epm-field">
              <label className="epm-field__label">Email</label>
              <input type="email" name="email" value={formData.email}
                onChange={handleChange} required
                className="epm-field__input" placeholder="Ex: docteur@email.com" />
            </div>
            <div className="epm-field">
              <label className="epm-field__label">Téléphone Cabinet</label>
              <input type="tel" name="telephone" value={formData.telephone}
                onChange={handleChange}
                className="epm-field__input" placeholder="Ex: 06 XX XX XX XX" />
            </div>
          </div>

          {/* Section spécialité — lecture seule */}
          <div className="epm-section">
            <p className="epm-section__label">Spécialité médicale</p>
            <div className="epm-field">
              <label className="epm-field__label">
                Spécialité
                <span className="epm-field__readonly-badge">Non modifiable</span>
              </label>
              <input type="text" name="specialite" value={formData.specialite}
                disabled className="epm-field__input epm-field__input--disabled"
              />
            </div>
          </div>

          {/* Section cabinet */}
          <div className="epm-section">
            <p className="epm-section__label">Adresse du cabinet</p>
            <div className="epm-field">
              <label className="epm-field__label">Adresse</label>
              <input type="text" name="adresse" value={formData.adresse}
                onChange={handleChange}
                className="epm-field__input" placeholder="Numéro et nom de rue" />
            </div>
            <div className="epm-row">
              <div className="epm-field">
                <label className="epm-field__label">Ville</label>
                <input type="text" name="ville" value={formData.ville}
                  onChange={handleChange}
                  className="epm-field__input" placeholder="Ex: Rabat" />
              </div>
              <div className="epm-field">
                <label className="epm-field__label">Code postal</label>
                <input type="text" name="code_postal" value={formData.code_postal}
                  onChange={handleChange} maxLength="5"
                  className="epm-field__input" placeholder="Ex: 10000" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="epm-actions">
            <button type="button" className="epm-btn epm-btn--ghost" onClick={handleCancel}>
              Annuler
            </button>
            <button type="submit" className="epm-btn epm-btn--primary" disabled={saving}>
              {saving ? (
                <><span className="epm-btn-spinner" /> Enregistrement...</>
              ) : (
                <><span>Enregistrer les modifications</span><span className="epm-btn-arrow">→</span></>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProfileMedecin;