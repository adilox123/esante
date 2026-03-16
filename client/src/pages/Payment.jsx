// pages/Payment.jsx - Version finale avec Espèce et Prix Dynamique

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

  // 🎯 GESTION DU PRIX DYNAMIQUE
  const finalAmount = appointmentData?.tarif || appointmentData?.amount || 200;

  const handlePaymentComplete = async (paymentInfo) => {
    console.log('💰 Paiement complété:', paymentInfo);
    setSelectedMethod(paymentInfo.method);
    setPaymentStep('processing');
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem('userId');
      const patientResponse = await api.get(`/patients/profile?userId=${userId}`);
      const patientId = patientResponse.data.id;

      // 1. Créer le rendez-vous
      const rendezVousData = {
        patient_id: patientId,
        medecin_id: appointmentData.medecinId,
        date_rdv: appointmentData.date_rdv || appointmentData.date, 
        heure_rdv: appointmentData.heure_rdv || appointmentData.heure,
        motif: appointmentData.motif || 'Consultation',
        statut: 'À venir'
      };

      const rdvResponse = await api.post('/appointments', rendezVousData);
      const rendezvousId = rdvResponse.data.id || rdvResponse.data.rendezvous?.id;

      // 2. Enregistrer le paiement (🎯 MODIFIÉ : On enregistre TOUT, même l'espèce)
      const paymentData = {
        rendezvous_id: rendezvousId,
        patient_id: patientId,
        medecin_id: appointmentData.medecinId,
        amount: finalAmount,
        method: paymentInfo.method, // Sera 'espece', 'card' ou 'paypal'
        // Pour l'espèce, on met 'pending' (en attente) car l'argent n'est pas encore encaissé
        status: paymentInfo.method === 'espece' ? 'pending' : 'completed', 
        card_last4: paymentInfo.cardDetails?.cardNumber?.slice(-4) || null,
        card_brand: getCardBrand(paymentInfo.cardDetails?.cardNumber),
        paypal_email: paymentInfo.paypalDetails?.email || null,
        appointment_date: appointmentData.date_rdv || appointmentData.date,
        appointment_time: appointmentData.heure_rdv || appointmentData.heure
      };

      console.log("📤 Enregistrement du paiement en BDD:", paymentData);
      await api.post('/payments', paymentData);
      
      setPaymentStep('success');

    } catch (error) {
      console.error("❌ Erreur:", error);
      setError("Erreur : Impossible d'enregistrer le rendez-vous ou le paiement.");
      setPaymentStep('methods'); 
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
        <p><strong>Date :</strong> {appointmentData.date_rdv || appointmentData.date}</p>
        <p><strong>Heure :</strong> {appointmentData.heure_rdv || appointmentData.heure}</p>
        <p><strong>Motif :</strong> {appointmentData.motif || 'Consultation'}</p>
        <div className="amount-display" style={{ marginTop: '15px', fontSize: '1.2em', color: '#2b6cb0' }}>
          <strong>Montant total :</strong> {finalAmount} DH
        </div>
      </div>

      {error && paymentStep !== 'success' && (
        <div className="error-message">
          <p style={{color: '#e53e3e', background: '#fed7d7', padding: '10px', borderRadius: '5px'}}>
            ❌ {error}
          </p>
        </div>
      )}

      {paymentStep === 'methods' && (
        <div className="payment-methods-wrapper">
          <PaymentMethods 
            amount={finalAmount}
            onPaymentComplete={handlePaymentComplete}
          />
        </div>
      )}

      {paymentStep === 'processing' && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Traitement de la réservation en cours...</p>
        </div>
      )}

      {paymentStep === 'success' && (
        <div className="success-container">
          <div className="success-icon" style={{ fontSize: '40px', color: '#16a34a' }}>✓</div>
          <h3>Rendez-vous confirmé !</h3>
          <p>Votre rendez-vous a été enregistré avec succès.</p>
          <p className="payment-method-info">
            Moyen de paiement : <strong>{
              selectedMethod === 'card' || selectedMethod === 'cb' ? 'Carte bancaire' :
              selectedMethod === 'paypal' ? 'PayPal' :
              selectedMethod === 'espece' ? 'Espèce au cabinet' : 'Inconnu'
            }</strong>
          </p>
          <button onClick={handleConfirmAppointment} className="confirm-btn" style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Retour aux médecins
          </button>
        </div>
      )}
    </div>
  );
};

export default Payment;