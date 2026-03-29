// pages/Payment.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PaymentMethods from "../components/PaymentMethods";
import { api } from "../services/api";
import "./Payment.css";

const Payment = () => {
  const [paymentStep, setPaymentStep] = useState('methods');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  const location = useLocation();
  const navigate = useNavigate();

  // 🛡️ SÉCURITÉ : Si React perd les données, on met un objet vide au lieu de faire planter la page !
  const appointmentData = location.state || {};

  const finalAmount = appointmentData.tarif || appointmentData.amount || 200;

  const handlePaymentComplete = async (paymentInfo) => {
    setSelectedMethod(paymentInfo.method);
    setPaymentStep('processing');
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem('userId');
      const patientResponse = await api.get(`/patients/profile?userId=${userId}`);
      const patientId = patientResponse.data.id;
      console.log("📦 Données reçues du Dashboard :", appointmentData);

      // 🎯 L'ID DU RDV VIENT DE LA NOTIFICATION (on ne le crée plus !)
      const rendezvousId = appointmentData.appointmentId || appointmentData.id || appointmentData.rendezvous_id;

      if (!rendezvousId) {
        console.error("❌ Erreur : ID introuvable. Voici ce qu'on a reçu :", appointmentData);
        setError("Erreur : Impossible de retrouver le rendez-vous.");
        setPaymentStep('methods');
        return;
      }

      // 1. On enregistre UNIQUEMENT le paiement, lié à ce rendez-vous existant
      const paymentData = {
        rendezvous_id: rendezvousId,
        patient_id: patientId,
        medecin_id: appointmentData.medecinId || null, // Optionnel selon ta BD
        amount: finalAmount,
        method: paymentInfo.method,
        status: paymentInfo.method === 'espece' ? 'pending' : 'completed',
        card_last4: paymentInfo.cardDetails?.cardNumber?.slice(-4) || null,
        card_brand: getCardBrand(paymentInfo.cardDetails?.cardNumber),
        paypal_email: paymentInfo.paypalDetails?.email || null
      };

      await api.post('/payments', paymentData);
      // 🎯 AJOUTE CETTE LIGNE (Elle va changer le statut dans la base de données)
await api.put(`/appointments/${rendezvousId}/statut`, { statut: 'Payé' });

      // 💡 Optionnel mais recommandé : On met à jour le statut du RDV
      // Pour dire qu'il n'est plus juste "Confirmé", mais "Payé" !
      // await api.put(`/appointments/${rendezvousId}/statut`, { statut: 'Payé' });

      setPaymentStep('success');

    } catch (error) {
      console.error(error);
      setError("Erreur : Impossible d'enregistrer le paiement.");
      setPaymentStep('methods');
    } finally {
      setLoading(false);
    }
  };

  const getCardBrand = (cardNumber) => {
    if (!cardNumber) return null;
    const d = cardNumber.toString()[0];
    if (d === '4') return 'Visa';
    if (d === '5') return 'Mastercard';
    if (d === '3') return 'American Express';
    if (d === '6') return 'Discover';
    return 'Carte bancaire';
  };

  const getMethodLabel = (method) => {
    if (method === 'card' || method === 'cb') return 'Carte bancaire';
    if (method === 'paypal') return 'PayPal';
    if (method === 'espece') return 'Espèce au cabinet';
    return 'Inconnu';
  };

  const getMethodIcon = (method) => {
    if (method === 'card' || method === 'cb') return '💳';
    if (method === 'paypal') return '🅿️';
    if (method === 'espece') return '💵';
    return '💰';
  };

  const handleConfirmAppointment = () => {
    navigate('/dashboard', {
      state: { message: 'Rendez-vous confirmé avec succès !' }
    });
  };

  return (
    <div className="py-root">

      {/* Dot grid */}
      <div className="py-grid-bg" />

      {/* Background orbs */}
      <div className="py-orb py-orb--1" />
      <div className="py-orb py-orb--2" />
      <div className="py-orb py-orb--3" />

      <div className="py-container">

        {/* ===== PAGE HEADER ===== */}
        <div className="py-page-header">
          <div className="py-page-header__badge">
            <span className="py-badge-dot" />
            Paiement sécurisé
            <span className="py-badge-lock">🔒</span>
          </div>
          <h1 className="py-page-header__title">
            Finaliser votre <span>réservation</span>
          </h1>
          <p className="py-page-header__sub">
            Confirmez votre rendez-vous en toute sécurité — chiffrement SSL 256 bits
          </p>

          {/* Progress stepper */}
          <div className="py-stepper">
            <div className={`py-step ${paymentStep !== 'methods' ? 'py-step--done' : 'py-step--active'}`}>
              <div className="py-step__circle">
                {paymentStep !== 'methods' ? '✓' : '1'}
              </div>
              <span>Récapitulatif</span>
            </div>
            <div className={`py-stepper__line ${paymentStep !== 'methods' ? 'py-stepper__line--done' : ''}`} />
            <div className={`py-step ${paymentStep === 'processing' || paymentStep === 'success' ? 'py-step--done' : paymentStep === 'methods' ? 'py-step--active' : ''}`}>
              <div className="py-step__circle">
                {paymentStep === 'processing' || paymentStep === 'success' ? '✓' : '2'}
              </div>
              <span>Paiement</span>
            </div>
            <div className={`py-stepper__line ${paymentStep === 'success' ? 'py-stepper__line--done' : ''}`} />
            <div className={`py-step ${paymentStep === 'success' ? 'py-step--done py-step--success' : ''}`}>
              <div className="py-step__circle">
                {paymentStep === 'success' ? '✓' : '3'}
              </div>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {/* ===== MAIN LAYOUT ===== */}
        <div className="py-layout">

          {/* ===== LEFT: RECAP ===== */}
          <div className="py-recap-card">
            <div className="py-recap-card__accent" />
            <div className="py-recap-card__shine" />

            <div className="py-recap-card__header">
              <div className="py-recap-card__icon">
                <span>📋</span>
                <div className="py-recap-card__icon-ring" />
              </div>
              <div>
                <h3 className="py-recap-card__title">Récapitulatif</h3>
                <p className="py-recap-card__sub">Vérifiez avant de payer</p>
              </div>
            </div>

            <div className="py-recap-list">
              {[
                { icon: '👨‍⚕️', label: 'Médecin',  value: `Dr. ${appointmentData.medecinNom || 'Sélectionné'}` },
                { icon: '📅',   label: 'Date',     value: appointmentData.date_rdv || appointmentData.date || '—' },
                { icon: '🕐',   label: 'Heure',    value: appointmentData.heure_rdv || appointmentData.heure || '—' },
                { icon: '🩺',   label: 'Motif',    value: appointmentData.motif || 'Consultation' },
              ].map((item, i) => (
                <div className="py-recap-item" key={i} style={{ animationDelay: `${i * 70}ms` }}>
                  <div className="py-recap-item__icon-wrap">{item.icon}</div>
                  <div className="py-recap-item__content">
                    <p className="py-recap-item__label">{item.label}</p>
                    <p className="py-recap-item__value">{item.value}</p>
                  </div>
                  <div className="py-recap-item__check">✓</div>
                </div>
              ))}
            </div>

            {/* Amount card */}
            <div className="py-amount-card">
              <div className="py-amount-card__bg" />
              <div className="py-amount-card__row">
                <span className="py-amount-card__label">Consultation</span>
                <span className="py-amount-card__val">{finalAmount} DH</span>
              </div>
              <div className="py-amount-card__divider" />
              <div className="py-amount-card__total-row">
                <span>Total à payer</span>
                <div className="py-amount-card__total">
                  <span className="py-amount-card__total-num">{finalAmount}</span>
                  <span className="py-amount-card__total-cur">DH</span>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="py-trust">
              <div className="py-trust__badge">
                <span>🔒</span> SSL 256-bit
              </div>
              <div className="py-trust__badge">
                <span>✅</span> Certifié
              </div>
              <div className="py-trust__badge">
                <span>🏥</span> E-Santé
              </div>
            </div>
          </div>

          {/* ===== RIGHT: PAYMENT PANEL ===== */}
          <div className="py-payment-panel">

            {/* Error */}
            {error && paymentStep !== 'success' && (
              <div className="py-alert py-alert--error">
                <div className="py-alert__icon">❌</div>
                <div>
                  <p className="py-alert__title">Erreur de paiement</p>
                  <p className="py-alert__msg">{error}</p>
                </div>
              </div>
            )}

            {/* METHODS */}
            {paymentStep === 'methods' && (
              <div className="py-methods-wrap">
                <div className="py-methods-wrap__accent" />
                <div className="py-methods-header">
                  <div className="py-methods-header__icon">
                    <span>💳</span>
                  </div>
                  <div>
                    <h3 className="py-methods-header__title">Mode de paiement</h3>
                    <p className="py-methods-header__sub">Choisissez votre méthode préférée</p>
                  </div>
                  <div className="py-methods-header__secure">
                    <span>🔒</span> Sécurisé
                  </div>
                </div>
                <PaymentMethods
                  amount={finalAmount}
                  onPaymentComplete={handlePaymentComplete}
                />
              </div>
            )}

            {/* PROCESSING */}
            {paymentStep === 'processing' && (
              <div className="py-processing">
                <div className="py-processing__bg-ring py-processing__bg-ring--1" />
                <div className="py-processing__bg-ring py-processing__bg-ring--2" />
                <div className="py-processing__bg-ring py-processing__bg-ring--3" />

                <div className="py-processing__spinner">
                  <div className="py-processing__ring py-processing__ring--outer" />
                  <div className="py-processing__ring py-processing__ring--inner" />
                  <span className="py-processing__icon">💳</span>
                </div>

                <h3 className="py-processing__title">Traitement en cours...</h3>
                <p className="py-processing__sub">Nous enregistrons votre réservation, merci de patienter.</p>

                <div className="py-processing__steps">
                  {[
                    { label: 'Paiement reçu',           status: 'done' },
                    { label: 'Création du rendez-vous',  status: 'active' },
                    { label: 'Confirmation',              status: '' },
                  ].map((s, i) => (
                    <div key={i} className={`py-proc-step py-proc-step--${s.status}`}>
                      <div className="py-proc-step__dot" />
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUCCESS */}
            {paymentStep === 'success' && (
              <div className="py-success">
                <div className="py-success__confetti">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="py-confetti-dot" style={{ '--i': i }} />
                  ))}
                </div>

                <div className="py-success__check">
                  <div className="py-success__check-ring" />
                  <svg viewBox="0 0 52 52" className="py-success__svg">
                    <circle cx="26" cy="26" r="25" fill="none" className="py-success__circle" />
                    <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="py-success__path" />
                  </svg>
                </div>

                <div className="py-success__badge">🎉 Réservation confirmée</div>

                <h3 className="py-success__title">Rendez-vous confirmé !</h3>
                <p className="py-success__sub">
                  Votre réservation a été enregistrée avec succès.<br />
                  Un récapitulatif vous sera envoyé par email.
                </p>

                <div className="py-success__method">
                  <div className="py-success__method-icon">{getMethodIcon(selectedMethod)}</div>
                  <div>
                    <p className="py-success__method-label">Moyen de paiement</p>
                    <p className="py-success__method-val">{getMethodLabel(selectedMethod)}</p>
                  </div>
                  <div className="py-success__method-check">✓</div>
                </div>

                <div className="py-success__amount">
                  <span>Montant payé</span>
                  <strong>{finalAmount} DH</strong>
                </div>

                <button className="py-confirm-btn" onClick={handleConfirmAppointment}>
                  <span className="py-confirm-btn__icon">📅</span>
                  <span>Voir mes rendez-vous</span>
                  <span className="py-confirm-btn__arrow">→</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;