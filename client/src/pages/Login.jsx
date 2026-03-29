import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('userId', res.data.userId);
      if (res.data.role === 'patient') {
        navigate('/dashboard');
      } else {
        navigate('/doctors');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ln-root">

      {/* Ambient orbs */}
      <div className="ln-orb ln-orb--1" />
      <div className="ln-orb ln-orb--2" />
      <div className="ln-orb ln-orb--3" />

      {/* Split layout */}
      <div className="ln-wrapper">

        {/* ===== LEFT PANEL (decorative) ===== */}
        <div className="ln-panel-left">
          <div className="ln-panel-left__circle ln-panel-left__circle--1" />
          <div className="ln-panel-left__circle ln-panel-left__circle--2" />

          <div className="ln-panel-left__content">
            {/* Logo */}
            <div className="ln-logo">
              <div className="ln-logo__icon">💙</div>
              <span className="ln-logo__text">E-Santé</span>
            </div>

            <h2 className="ln-panel-left__title">
              Votre santé,<br />
              <span>notre priorité.</span>
            </h2>
            <p className="ln-panel-left__sub">
              Prenez rendez-vous avec les meilleurs spécialistes de santé en quelques clics.
            </p>

            {/* Feature pills */}
            <div className="ln-features">
              <div className="ln-feature-pill">
                <span>🏥</span> 200+ médecins disponibles
              </div>
              <div className="ln-feature-pill">
                <span>⚡</span> Prise de RDV instantanée
              </div>
              <div className="ln-feature-pill">
                <span>🔒</span> Données 100% sécurisées
              </div>
            </div>
          </div>

          {/* Bottom wave decoration */}
          <div className="ln-panel-left__wave" />
        </div>

        {/* ===== RIGHT PANEL (form) ===== */}
        <div className="ln-panel-right">

          <div className="ln-form-wrap">

            {/* Header */}
            <div className="ln-form-header">
              <div className="ln-form-header__badge">
                <span className="ln-badge-dot" />
                Espace sécurisé
              </div>
              <h1 className="ln-form-header__title">Connexion</h1>
              <p className="ln-form-header__sub">
                Accédez à votre espace de santé personnel
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="ln-alert">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="ln-form">

              <div className="ln-field">
                <label className="ln-field__label">Adresse Email</label>
                <div className="ln-field__wrap">
                  <span className="ln-field__icon">✉️</span>
                  <input
                    type="email"
                    className="ln-field__input"
                    placeholder="Ex: youssef@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="ln-field">
                <label className="ln-field__label">Mot de passe</label>
                <div className="ln-field__wrap">
                  <span className="ln-field__icon">🔑</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="ln-field__input"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="ln-field__toggle"
                    onClick={() => setShowPass(!showPass)}
                    tabIndex="-1"
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="ln-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="ln-submit__spinner" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <span className="ln-submit__arrow">→</span>
                  </>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="ln-divider">
              <span />
              <p>Sécurisé par chiffrement SSL</p>
              <span />
            </div>

            {/* Trust badges */}
            <div className="ln-trust">
              <div className="ln-trust__item">🔒 Chiffré</div>
              <div className="ln-trust__item">🏥 Certifié</div>
              <div className="ln-trust__item">✅ Conforme RGPD</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}