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

  // ✅ NOUVEAU : État pour le document du médecin
  const [documentMedecin, setDocumentMedecin] = useState(null);
  const [docError, setDocError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

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
    setDocumentMedecin(null); setDocError(''); // ✅ Reset du doc
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleClose = () => onClose();

  // ✅ NOUVEAU : Validation et gestion du fichier uploadé
  const handleDocumentChange = (file) => {
    setDocError('');
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setDocError('Format non accepté. Veuillez choisir un PDF, JPG ou PNG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setDocError('Le fichier ne doit pas dépasser 5 Mo.');
      return;
    }
    setDocumentMedecin(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleDocumentChange(file);
  };

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

    // ✅ Vérification document obligatoire pour médecin
    if (mode === 'register' && role === 'medecin' && !documentMedecin) {
      setError("Veuillez joindre un document justificatif (diplôme ou carte professionnelle).");
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        const userRole = res.data.user.role;
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', userRole);
        localStorage.setItem('userId', res.data.user.id);
        localStorage.setItem('nom', res.data.user.nom);
        localStorage.setItem('prenom', res.data.user.prenom);
        handleClose();
        if (userRole === 'admin') {
          navigate('/admin-dashboard');
        } else if (userRole === 'medecin') {
          navigate('/doctors');
        } else {
          navigate('/dashboard');
        }
      } else {
        // ✅ Utilisation de FormData pour envoyer le fichier avec les données
        const formData = new FormData();
        formData.append('nom', nom);
        formData.append('prenom', prenom);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role);

        if (role === 'patient') {
          formData.append('date_naissance', dateNaissance);
          formData.append('sexe', sexe);
          formData.append('groupe_sanguin', groupeSanguin);
          formData.append('adresse', adresse);
          formData.append('telephone', telephone);
        } else {
          formData.append('specialite_id', parseInt(specialiteId));
          formData.append('adresse', adresse);
          formData.append('telephone', telephone);
          // ✅ Ajout du document justificatif
          if (documentMedecin) {
            formData.append('document_preuve', documentMedecin);
          }
        }

        await axios.post('http://localhost:5000/api/auth/register', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setSuccess("Inscription réussie ! Votre dossier sera examiné par notre équipe.");
        setTimeout(() => {
          setMode('login'); setStep(1);
          setNom(''); setPrenom(''); setEmail('');
          setPassword(''); setConfirmPassword('');
          setDateNaissance(''); setAdresse(''); setTelephone('');
          setDocumentMedecin(null);
        }, 2000);
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

          <button className="am-close" onClick={handleClose} title="Fermer">✕</button>

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

                {/* ✅ NOUVEAU : ZONE D'UPLOAD DOCUMENT JUSTIFICATIF */}
                <div className="am-field">
                  <label className="am-field__label">
                    Document justificatif <span className="am-field__required">*</span>
                  </label>
                  <p className="am-field__hint">
                    Diplôme de médecine, carte d'ordre des médecins ou certificat d'exercice
                  </p>

                  {/* Zone drag & drop */}
                  <div
                    className={`am-upload-zone ${isDragOver ? 'am-upload-zone--drag' : ''} ${documentMedecin ? 'am-upload-zone--done' : ''}`}
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('doc-medecin').click()}
                  >
                    <input
                      type="file"
                      id="doc-medecin"
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      onChange={e => handleDocumentChange(e.target.files[0])}
                    />

                    {documentMedecin ? (
                      /* Fichier sélectionné */
                      <div className="am-upload-zone__success">
                        <div className="am-upload-zone__success-icon">
                          {documentMedecin.type === 'application/pdf' ? '📄' : '🖼️'}
                        </div>
                        <div className="am-upload-zone__success-info">
                          <p className="am-upload-zone__filename">{documentMedecin.name}</p>
                          <p className="am-upload-zone__filesize">
                            {(documentMedecin.size / 1024).toFixed(0)} Ko · Cliquez pour changer
                          </p>
                        </div>
                        <div className="am-upload-zone__check">✓</div>
                      </div>
                    ) : (
                      /* Zone vide */
                      <div className="am-upload-zone__placeholder">
                        <div className="am-upload-zone__icon">📁</div>
                        <p className="am-upload-zone__text">
                          {isDragOver ? 'Déposez le fichier ici' : 'Glissez votre document ici'}
                        </p>
                        <p className="am-upload-zone__sub">ou cliquez pour parcourir</p>
                        <div className="am-upload-zone__formats">PDF · JPG · PNG · Max 5 Mo</div>
                      </div>
                    )}
                  </div>

                  {/* Erreur upload */}
                  {docError && (
                    <div className="am-upload-error">⚠️ {docError}</div>
                  )}

                  {/* Note sécurité */}
                  <div className="am-upload-note">
                    <span>🔒</span>
                    <span>Vos documents sont chiffrés et vérifiés par notre équipe sous 48h.</span>
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