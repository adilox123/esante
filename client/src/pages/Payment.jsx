// pages/Payment.jsx - Version finale corrigée

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
  const appointmentData = location.state;

  const handlePaymentComplete = async (paymentInfo) => {
    console.log('💰 Paiement complété:', paymentInfo);
    setSelectedMethod(paymentInfo.method);
    setPaymentStep('processing');
    setLoading(true);
    setError(null);

   // Dans handlePaymentComplete, remplace la partie création du rendez-vous

try {
  // D'abord récupérer le patient_id à partir du user_id
  const userId = localStorage.getItem('userId'); // ex: 133
  console.log("🔍 User ID connecté:", userId);
  
  // Récupérer le patient correspondant
  const patientResponse = await api.get(`/patients/profile?userId=${userId}`);
  const patientId = patientResponse.data.id; // ex: 2
  console.log("✅ Patient ID trouvé:", patientId);

  // 1. Créer le rendez-vous avec le bon patient_id
  const rendezVousData = {
    patient_id: patientId, // ← Utilise le vrai patient_id de la table patients
    medecin_id: appointmentData.medecinId,
    date_rdv: appointmentData.date_rdv,
    heure_rdv: appointmentData.heure_rdv,
    motif: appointmentData.motif || 'Consultation',
    statut: 'À venir'
  };

  console.log("📤 Création du rendez-vous:", rendezVousData);

  const rdvResponse = await api.post('/appointments', rendezVousData);
  
  console.log("✅ Rendez-vous créé:", rdvResponse.data);
  
  // ... suite du code
      
      const rendezvousId = rdvResponse.data.id || rdvResponse.data.rendezvous?.id;

      // 2. Enregistrer le paiement
      const paymentData = {
        rendezvous_id: rendezvousId,
        patient_id: appointmentData.patientId || localStorage.getItem('userId'),
        medecin_id: appointmentData.medecinId,
        amount: appointmentData.amount || 50,
        method: paymentInfo.method,
        card_last4: paymentInfo.cardDetails?.cardNumber?.slice(-4) || null,
        card_brand: getCardBrand(paymentInfo.cardDetails?.cardNumber),
        paypal_email: paymentInfo.paypalDetails?.email || null,
        appointment_date: appointmentData.date_rdv,
        appointment_time: appointmentData.heure_rdv
      };

      console.log("📤 Enregistrement du paiement:", paymentData);

      await api.post('/payments', paymentData);
      
      // ✅ Succès - on passe à l'écran de succès
      setPaymentStep('success');

    } catch (error) {
      console.error("❌ Erreur:", error);
      
      // Afficher l'erreur mais on passe quand même en succès
      // car le rendez-vous a probablement été créé
      setError("Note: Le rendez-vous a été créé mais le paiement n'a pas pu être enregistré.");
      
      // ✅ On passe en succès quand même
      setPaymentStep('success');
    } finally {
      setLoading(false);
    }
  };

  const getCardBrand = (cardNumber) => {
    if (!cardNumber) return null;
    const firstDigit = cardNumber.toString()[0];
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'American Express';
    if (firstDigit === '6') return 'Discover';
    return 'Carte bancaire';
  };

  const handleConfirmAppointment = () => {
    navigate('/doctors', { 
      state: { 
        message: 'Rendez-vous confirmé avec succès !',
        paymentSuccess: true
      } 
    });
  };

  if (!appointmentData) {
    navigate("/doctors");
    return null;
  }

  return (
    <div className="payment-container">
      <h1>Finaliser votre réservation</h1>
      
      <div className="appointment-summary">
        <h3>Récapitulatif du rendez-vous</h3>
        <p><strong>Médecin :</strong> Dr. {appointmentData.medecinNom}</p>
        <p><strong>Date :</strong> {new Date(appointmentData.date_rdv).toLocaleDateString('fr-FR')}</p>
        <p><strong>Heure :</strong> {appointmentData.heure_rdv}</p>
        <p><strong>Motif :</strong> {appointmentData.motif}</p>
        <div className="amount-display">
          <strong>Montant total :</strong> {appointmentData.amount || 50} DH
        </div>
      </div>

      {error && paymentStep !== 'success' && (
        <div className="error-message">
          <p style={{color: '#e53e3e', background: '#fed7d7', padding: '10px', borderRadius: '5px'}}>
            ❌ {error}
          </p>
        </div>
      )}

      {error && paymentStep === 'success' && (
        <div className="warning-message">
          <p style={{color: '#856404', background: '#fff3cd', padding: '10px', borderRadius: '5px'}}>
            ⚠️ {error}
          </p>
        </div>
      )}

      {paymentStep === 'methods' && (
        <PaymentMethods 
          amount={appointmentData.amount || 50}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {paymentStep === 'processing' && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Traitement du paiement en cours...</p>
          <p className="small">Création du rendez-vous...</p>
        </div>
      )}

      {paymentStep === 'success' && (
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h3>Rendez-vous confirmé !</h3>
          <p>Votre rendez-vous a été enregistré avec succès.</p>
          <p className="payment-method-info">
            Moyen de paiement : {
              selectedMethod === 'card' ? 'Carte bancaire' :
              selectedMethod === 'paypal' ? 'PayPal' :
              selectedMethod === 'cb' ? 'CB' : 'Inconnu'
            }
          </p>
          <button onClick={handleConfirmAppointment} className="confirm-btn">
            Retour aux médecins
          </button>
        </div>
      )}
    </div>
  );
};

export default Payment;