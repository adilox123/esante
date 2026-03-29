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
        color: "#0d1b2a",
        fontFamily: '"DM Sans", "Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "15px",
        "::placeholder": { color: "#94a3b8" },
        iconColor: "#0f766e",
      },
      invalid: {
        color: "#ef4444",
        iconColor: "#ef4444",
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
          setTimeout(() => { onSuccess(); }, 2000);
        }
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite.");
      setLoading(false);
    }
  };

  /* ===== SUCCESS STATE ===== */
  if (success) {
    return (
      <div className="cf-success">
        <div className="cf-success__orb" />
        <div className="cf-success__checkmark">
          <div className="cf-check-icon">
            <span className="icon-line line-tip" />
            <span className="icon-line line-long" />
            <div className="icon-circle" />
            <div className="icon-fix" />
          </div>
        </div>
        <h3 className="cf-success__title">Paiement réussi !</h3>
        <p className="cf-success__sub">Votre rendez-vous a été confirmé.</p>
        <p className="cf-success__redirect">
          <span className="cf-success__dot" />
          Redirection en cours...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="cf-form">

      {/* Orbs */}
      <div className="cf-orb cf-orb--1" />
      <div className="cf-orb cf-orb--2" />

      {/* Header */}
      <div className="cf-header">
        <div className="cf-header__icon">💳</div>
        <div>
          <h3 className="cf-header__title">Informations de paiement</h3>
          <p className="cf-header__sub">Finaliser votre rendez-vous</p>
        </div>
        <div className="cf-secure-badge">
          <span className="cf-secure-dot" />
          🔒 Sécurisé SSL
        </div>
      </div>

      <div className="cf-divider" />

      {/* Summary */}
      {appointmentData && (
        <div className="cf-summary">
          <div className="cf-summary__row">
            <div className="cf-summary__label">
              <span className="cf-summary__icon">🩺</span>
              Consultation médicale
            </div>
            <span className="cf-summary__val">{appointmentData.amount || 50} DH</span>
          </div>
          <div className="cf-summary__divider" />
          <div className="cf-summary__row cf-summary__row--total">
            <span>Total à payer</span>
            <span className="cf-summary__total">{appointmentData.amount || 50} <em>DH</em></span>
          </div>
        </div>
      )}

      {/* Card element */}
      <div className="cf-card-section">
        <label className="cf-card-label">
          Carte bancaire
          <div className="cf-accepted-cards">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>CB</span>
          </div>
        </label>
        <div className="cf-card-wrapper">
          <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="cf-alert">
          <span>❌</span>
          <p>{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className={`cf-pay-btn ${loading ? 'cf-pay-btn--loading' : ''}`}
        disabled={!stripe || loading}
      >
        {loading ? (
          <>
            <span className="cf-spinner" />
            Traitement en cours...
          </>
        ) : (
          <>
            <span>Payer {appointmentData?.amount || 50} DH</span>
            <span className="cf-pay-btn__arrow">→</span>
          </>
        )}
      </button>

      {/* Terms */}
      <p className="cf-terms">
        En procédant au paiement, vous acceptez nos
        <a href="/conditions"> conditions générales</a>.
      </p>

    </form>
  );
};

export default CheckoutForm;