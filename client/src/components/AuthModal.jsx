import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, initialMode }) {
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState(1);

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('patient');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [dateNaissance, setDateNaissance] = useState('');
  const [sexe, setSexe] = useState('M');
  const [groupeSanguin, setGroupeSanguin] = useState('O+');
  const [specialiteId, setSpecialiteId] = useState('1');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMode(initialMode);
    setStep(1);
    setError(''); setSuccess('');
    setEmail(''); setPassword(''); setConfirmPassword('');
    setNom(''); setPrenom('');
    setDateNaissance(''); setAdresse(''); setTelephone('');
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleClose = () => onClose();

  const handleNextStep = () => {
    if (!prenom.trim()) { setError("Le prénom est obligatoire."); return; }
    if (!nom.trim()) { setError("Le nom est obligatoire."); return; }
    if (password !== confirmPassword) { setError("Les mots de passe ne correspondent pas !"); return; }
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setIsLoading(true);
    try {
      if (mode === 'login') {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        
        const userRole = res.data.user.role; // On récupère le rôle
        
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', userRole);
        localStorage.setItem('userId', res.data.user.id);
        localStorage.setItem('nom', res.data.user.nom);
        localStorage.setItem('prenom', res.data.user.prenom);
        
        handleClose();
        
        // 🎯 LA NOUVELLE REDIRECTION INTELLIGENTE :
        if (userRole === 'admin') {
          navigate('/admin-dashboard');
        } else if (userRole === 'medecin') {
          navigate('/doctors'); // 👈 J'ai gardé ta route d'origine pour les médecins
        } else {
          navigate('/dashboard'); // 👈 Route pour les patients
        }
        
      } else {
        // ... (Le reste de ton code d'inscription reste exactement pareil)
        const payload = { nom, prenom, email, password, role };
        if (role === 'patient') {
          payload.date_naissance = dateNaissance;
          payload.sexe = sexe;
          payload.groupe_sanguin = groupeSanguin;
          payload.adresse = adresse;
          payload.telephone = telephone;
        } else {
          payload.specialite_id = parseInt(specialiteId);
          payload.adresse = adresse;
          payload.telephone = telephone;
        }
        await axios.post('http://localhost:5000/api/auth/register', payload);
        setSuccess("Inscription réussie !");
        setTimeout(() => {
          setMode('login'); setStep(1);
          setNom(''); setPrenom(''); setEmail('');
          setPassword(''); setConfirmPassword('');
          setDateNaissance(''); setAdresse(''); setTelephone('');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const switchToRegister = () => { setMode('register'); setStep(1); setError(''); };
  const switchToLogin    = () => { setMode('login');    setError(''); };

  return (
    <div className="am-overlay" onClick={handleClose}>
      <div className="am-modal" onClick={e => e.stopPropagation()}>

        {/* ===== LEFT PANEL ===== */}
        <div className="am-panel-left">
          <div className="am-panel-left__circle am-panel-left__circle--1" />
          <div className="am-panel-left__circle am-panel-left__circle--2" />

          <div className="am-panel-left__content">
            {/* Logo */}
            <div className="am-logo">
              <div className="am-logo__icon">💙</div>
              <span className="am-logo__text">E-Santé</span>
            </div>

            <div className="am-panel-left__icon-wrap">⚕️</div>

            <h2 className="am-panel-left__title">
              {mode === 'login' ? (
                <>Ravi de<br /><span>vous revoir</span></>
              ) : (
                <>Rejoignez<br /><span>E-Santé</span><br />Maroc</>
              )}
            </h2>

            <p className="am-panel-left__sub">
              {mode === 'login'
                ? "Connectez-vous pour gérer vos rendez-vous médicaux en toute simplicité."
                : "Rejoignez la plateforme et simplifiez votre santé."}
            </p>

            {/* Register: steps indicator */}
            {mode === 'register' && (
              <div className="am-steps">
                <div className={`am-step ${step >= 1 ? 'am-step--done' : ''}`}>
                  <div className="am-step__num">{step > 1 ? '✓' : '1'}</div>
                  <span>Compte</span>
                </div>
                <div className="am-steps__line" />
                <div className={`am-step ${step >= 2 ? 'am-step--done' : ''}`}>
                  <div className="am-step__num">2</div>
                  <span>Profil</span>
                </div>
              </div>
            )}

            {/* Login: trust badges */}
            {mode === 'login' && (
              <div className="am-trust">
                <div className="am-trust__item">🔒 Sécurisé</div>
                <div className="am-trust__item">🏥 Certifié</div>
                <div className="am-trust__item">✅ RGPD</div>
              </div>
            )}
          </div>

          <div className="am-panel-left__wave" />
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="am-panel-right">

          {/* Close button */}
          <button className="am-close" onClick={handleClose} title="Fermer">✕</button>

          {/* Header */}
          <div className="am-form-header">
            {mode === 'register' && (
              <div className="am-step-badge">Étape {step} sur 2</div>
            )}
            <h3 className="am-form-header__title">
              {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </h3>
            <p className="am-form-header__sub">
              {mode === 'login' ? 'Entrez vos identifiants' : 'Complétez votre profil pour continuer'}
            </p>
          </div>

          {/* Alerts */}
          {error   && <div className="am-alert am-alert--error"><span>⚠️</span>{error}</div>}
          {success && <div className="am-alert am-alert--success"><span>✅</span>{success}</div>}

          <form className="am-form" onSubmit={handleSubmit}>

            {/* ===== LOGIN ===== */}
            {mode === 'login' && (
              <>
                <div className="am-field">
                  <label className="am-field__label">Email</label>
                  <div className="am-field__wrap">
                    <span className="am-field__icon">✉️</span>
                    <input type="email" className="am-field__input" placeholder="youssef@email.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="am-field">
                  <label className="am-field__label">Mot de passe</label>
                  <div className="am-field__wrap">
                    <span className="am-field__icon">🔑</span>
                    <input type={showPwd ? 'text' : 'password'} className="am-field__input"
                      placeholder="Votre mot de passe"
                      value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" className="am-field__toggle" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="am-btn am-btn--primary" disabled={isLoading}>
                  {isLoading ? <><span className="am-spinner" />Connexion...</> : <><span>Se connecter</span><span className="am-btn__arrow">→</span></>}
                </button>
              </>
            )}

            {/* ===== REGISTER STEP 1 ===== */}
            {mode === 'register' && step === 1 && (
              <>
                {/* Role selector */}
                <div className="am-role-selector">
                  <button type="button"
                    className={`am-role-btn ${role === 'patient' ? 'am-role-btn--active am-role-btn--blue' : ''}`}
                    onClick={() => setRole('patient')}>
                    <span>🧑‍💼</span> Patient
                  </button>
                  <button type="button"
                    className={`am-role-btn ${role === 'medecin' ? 'am-role-btn--active am-role-btn--teal' : ''}`}
                    onClick={() => setRole('medecin')}>
                    <span>👨‍⚕️</span> Médecin
                  </button>
                </div>

                <div className="am-row">
                  <div className="am-field">
                    <label className="am-field__label">Nom</label>
                    <input type="text" className="am-field__input am-field__input--simple"
                      placeholder="Ex: Alaoui" value={nom} onChange={e => setNom(e.target.value)} required />
                  </div>
                  <div className="am-field">
                    <label className="am-field__label">Prénom</label>
                    <input type="text" className="am-field__input am-field__input--simple"
                      placeholder="Ex: Youssef" value={prenom} onChange={e => setPrenom(e.target.value)} required />
                  </div>
                </div>

                <div className="am-field">
                  <label className="am-field__label">Email</label>
                  <div className="am-field__wrap">
                    <span className="am-field__icon">✉️</span>
                    <input type="email" className="am-field__input" placeholder="youssef@email.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="am-row">
                  <div className="am-field">
                    <label className="am-field__label">Mot de passe</label>
                    <div className="am-field__wrap">
                      <span className="am-field__icon">🔑</span>
                      <input type={showPwd ? 'text' : 'password'} className="am-field__input"
                        placeholder="Min. 6 caractères"
                        value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" className="am-field__toggle" onClick={() => setShowPwd(!showPwd)}>
                        {showPwd ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div className="am-field">
                    <label className="am-field__label">Confirmer</label>
                    <div className="am-field__wrap">
                      <span className="am-field__icon">🔒</span>
                      <input type={showConfirmPwd ? 'text' : 'password'} className="am-field__input"
                        placeholder="Répéter"
                        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                      <button type="button" className="am-field__toggle" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                        {showConfirmPwd ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="button" className="am-btn am-btn--primary" onClick={handleNextStep}>
                  <span>Suivant</span><span className="am-btn__arrow">→</span>
                </button>
              </>
            )}

            {/* ===== REGISTER STEP 2 — PATIENT ===== */}
            {mode === 'register' && step === 2 && role === 'patient' && (
              <>
                <div className="am-row">
                  <div className="am-field">
                    <label className="am-field__label">Date de naissance</label>
                    <input type="date" className="am-field__input am-field__input--simple"
                      value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} required />
                  </div>
                  <div className="am-field">
                    <label className="am-field__label">Sexe</label>
                    <select className="am-field__input am-field__input--simple"
                      value={sexe} onChange={e => setSexe(e.target.value)}>
                      <option value="M">Homme</option>
                      <option value="F">Femme</option>
                    </select>
                  </div>
                </div>
                <div className="am-field">
                  <label className="am-field__label">Groupe Sanguin</label>
                  <select className="am-field__input am-field__input--simple"
                    value={groupeSanguin} onChange={e => setGroupeSanguin(e.target.value)}>
                    {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="am-field">
                  <label className="am-field__label">Téléphone</label>
                  <div className="am-field__wrap">
                    <span className="am-field__icon">📱</span>
                    <input type="tel" className="am-field__input" placeholder="Ex: 0612345678"
                      value={telephone} onChange={e => setTelephone(e.target.value)} />
                  </div>
                </div>
                <div className="am-field">
                  <label className="am-field__label">Adresse</label>
                  <div className="am-field__wrap">
                    <span className="am-field__icon">📍</span>
                    <input type="text" className="am-field__input" placeholder="Votre adresse..."
                      value={adresse} onChange={e => setAdresse(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {/* ===== REGISTER STEP 2 — MÉDECIN ===== */}
            {mode === 'register' && step === 2 && role === 'medecin' && (
              <>
                <div className="am-field">
                  <label className="am-field__label">Spécialité</label>
                  <select className="am-field__input am-field__input--simple"
                    value={specialiteId} onChange={e => setSpecialiteId(e.target.value)}>
                    <option value="1">Cardiologue</option>
                    <option value="2">Dermatologue</option>
                    <option value="3">Généraliste</option>
                  </select>
                </div>
                <div className="am-field">
                  <label className="am-field__label">Adresse du cabinet</label>
                  <div className="am-field__wrap">
                    <span className="am-field__icon">🏥</span>
                    <input type="text" className="am-field__input" placeholder="123 Rue de l'Hôpital, Ville"
                      value={adresse} onChange={e => setAdresse(e.target.value)} required />
                  </div>
                </div>
                <div className="am-field">
                  <label className="am-field__label">Téléphone</label>
                  <div className="am-field__wrap">
                    <span className="am-field__icon">📞</span>
                    <input type="tel" className="am-field__input" placeholder="06..."
                      value={telephone} onChange={e => setTelephone(e.target.value)} required />
                  </div>
                </div>
              </>
            )}

            {/* Step 2 actions */}
            {mode === 'register' && step === 2 && (
              <div className="am-btn-group">
                <button type="button" className="am-btn am-btn--ghost" onClick={() => setStep(1)}>
                  ← Retour
                </button>
                <button type="submit" className="am-btn am-btn--primary" disabled={isLoading}>
                  {isLoading
                    ? <><span className="am-spinner" />Inscription...</>
                    : <><span>Valider l'inscription</span><span className="am-btn__arrow">→</span></>
                  }
                </button>
              </div>
            )}

          </form>

          {/* Toggle mode */}
          <div className="am-toggle">
            {mode === 'login' ? (
              <p>Nouveau ici ? <span onClick={switchToRegister}>Créer un compte</span></p>
            ) : (
              <p>Déjà inscrit ? <span onClick={switchToLogin}>Se connecter</span></p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}