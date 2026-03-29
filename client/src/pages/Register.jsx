import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({ nom: '', email: '', password: '', role: 'patient' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      navigate('/verify', { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rg-root">

      {/* Orbs */}
      <div className="rg-orb rg-orb--1" />
      <div className="rg-orb rg-orb--2" />
      <div className="rg-orb rg-orb--3" />

      <div className="rg-wrapper">

        {/* ===== LEFT PANEL ===== */}
        <div className="rg-panel-left">
          <div className="rg-panel-left__circle rg-panel-left__circle--1" />
          <div className="rg-panel-left__circle rg-panel-left__circle--2" />

          <div className="rg-panel-left__content">
            {/* Logo */}
            <div className="rg-logo">
              <div className="rg-logo__icon">💙</div>
              <span className="rg-logo__text">E-Santé</span>
            </div>

            <h2 className="rg-panel-left__title">
              Rejoignez<br />
              <span>E-Santé</span><br />
              aujourd'hui.
            </h2>

            <p className="rg-panel-left__sub">
              Créez votre compte en quelques secondes et accédez à des soins de qualité partout au Maroc.
            </p>

            {/* Steps */}
            <div className="rg-steps">
              <div className="rg-step">
                <div className="rg-step__num">1</div>
                <div>
                  <p className="rg-step__title">Créez votre compte</p>
                  <p className="rg-step__sub">Remplissez le formulaire en 30 secondes</p>
                </div>
              </div>
              <div className="rg-step">
                <div className="rg-step__num">2</div>
                <div>
                  <p className="rg-step__title">Vérifiez votre email</p>
                  <p className="rg-step__sub">Un code de confirmation vous sera envoyé</p>
                </div>
              </div>
              <div className="rg-step">
                <div className="rg-step__num">3</div>
                <div>
                  <p className="rg-step__title">Accédez à vos soins</p>
                  <p className="rg-step__sub">Prenez RDV avec nos spécialistes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rg-panel-left__wave" />
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="rg-panel-right">
          <div className="rg-form-wrap">

            {/* Header */}
            <div className="rg-form-header">
              <div className="rg-form-header__badge">
                <span className="rg-badge-dot" />
                Inscription gratuite
              </div>
              <h1 className="rg-form-header__title">Créer un compte</h1>
              <p className="rg-form-header__sub">Accédez à votre espace de santé dès maintenant</p>
            </div>

            {/* Error */}
            {error && (
              <div className="rg-alert">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="rg-form">

              {/* Role selector */}
              <div className="rg-role-selector">
                <button
                  type="button"
                  className={`rg-role-btn ${form.role === 'patient' ? 'rg-role-btn--active' : ''}`}
                  onClick={() => setForm({ ...form, role: 'patient' })}
                >
                  <span className="rg-role-btn__icon">🧑‍💼</span>
                  <span className="rg-role-btn__label">Patient</span>
                </button>
                <button
                  type="button"
                  className={`rg-role-btn ${form.role === 'medecin' ? 'rg-role-btn--active rg-role-btn--active-teal' : ''}`}
                  onClick={() => setForm({ ...form, role: 'medecin' })}
                >
                  <span className="rg-role-btn__icon">👨‍⚕️</span>
                  <span className="rg-role-btn__label">Médecin</span>
                </button>
              </div>

              {/* Nom */}
              <div className="rg-field">
                <label className="rg-field__label">Nom complet</label>
                <div className="rg-field__wrap">
                  <span className="rg-field__icon">👤</span>
                  <input
                    type="text"
                    className="rg-field__input"
                    placeholder="Ex: Youssef Alaoui"
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="rg-field">
                <label className="rg-field__label">Adresse Email</label>
                <div className="rg-field__wrap">
                  <span className="rg-field__icon">✉️</span>
                  <input
                    type="email"
                    className="rg-field__input"
                    placeholder="Ex: youssef@email.com"
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="rg-field">
                <label className="rg-field__label">Mot de passe</label>
                <div className="rg-field__wrap">
                  <span className="rg-field__icon">🔑</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="rg-field__input"
                    placeholder="Minimum 8 caractères"
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="rg-field__toggle"
                    onClick={() => setShowPass(!showPass)}
                    tabIndex="-1"
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="rg-submit" disabled={loading}>
                {loading ? (
                  <><span className="rg-submit__spinner" /> Création du compte...</>
                ) : (
                  <><span>S'inscrire</span><span className="rg-submit__arrow">→</span></>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="rg-divider">
              <span /><p>Inscription sécurisée SSL</p><span />
            </div>

            {/* Trust */}
            <div className="rg-trust">
              <div className="rg-trust__item">🔒 Chiffré</div>
              <div className="rg-trust__item">🏥 Certifié</div>
              <div className="rg-trust__item">✅ RGPD</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}