import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./CheckoutForm.css";

const CheckoutForm = ({ clientSecret, onSuccess, appointmentData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
        iconColor: "#666ee8",
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
    hidePostalCode: true,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: localStorage.getItem("userName") || "Patient",
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          setSuccess(true);
          
          // Ici vous pouvez appeler votre API pour créer le rendez-vous
          // après confirmation du paiement
          
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="payment-success-container">
        <div className="success-checkmark">
          <div className="check-icon">
            <span className="icon-line line-tip"></span>
            <span className="icon-line line-long"></span>
            <div className="icon-circle"></div>
            <div className="icon-fix"></div>
          </div>
        </div>
        <h3>Paiement réussi !</h3>
        <p>Votre rendez-vous a été confirmé.</p>
        <p className="redirect-message">Redirection en cours...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="form-header">
        <h3>Informations de paiement</h3>
        <p className="secure-badge">
          <span className="lock-icon">🔒</span> Paiement sécurisé
        </p>
      </div>

      <div className="card-element-container">
        <label htmlFor="card-element">Carte bancaire</label>
        <div className="card-element-wrapper">
          <CardElement 
            id="card-element"
            options={CARD_ELEMENT_OPTIONS} 
          />
        </div>
        <div className="accepted-cards">
          <span>Visa</span>
          <span>Mastercard</span>
          <span>American Express</span>
          <span>CB</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <p>{error}</p>
        </div>
      )}

      {appointmentData && (
        <div className="price-summary">
          <div className="summary-row">
            <span>Consultation</span>
            <span>{appointmentData.amount || 50}€</span>
          </div>
          <div className="summary-row total">
            <span>Total à payer</span>
            <span>{appointmentData.amount || 50}€</span>
          </div>
        </div>
      )}

      <button 
        type="submit" 
        className={`pay-button ${loading ? 'loading' : ''}`}
        disabled={!stripe || loading}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Traitement en cours...
          </>
        ) : (
          `Payer ${appointmentData?.amount || 50}€`
        )}
      </button>

      <p className="terms">
        En procédant au paiement, vous acceptez nos 
        <a href="/conditions"> conditions générales</a>.
      </p>
    </form>
  );
};

export default CheckoutForm;