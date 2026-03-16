// components/PaymentMethods.jsx
import React, { useState } from 'react';
import './PaymentMethods.css';

const PaymentMethods = ({ amount, onPaymentComplete }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showPaypalForm, setShowPaypalForm] = useState(false);
  // 🎯 NOUVEAU : État pour afficher la confirmation d'espèce
  const [showEspeceForm, setShowEspeceForm] = useState(false); 
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [paypalDetails, setPaypalDetails] = useState({
    email: '',
    password: ''
  });

  // 🎯 NOUVEAU : Ajout de l'Espèce dans la liste des méthodes
  const paymentMethods = [
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: '💳',
      accepted: ['Visa', 'Mastercard', 'Amex']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '🅿️',
      color: '#003087'
    },
    {
      id: 'espece',
      name: 'Paiement sur place',
      icon: '💵',
      accepted: ['Espèce au cabinet']
    }
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    // On cache tout par défaut
    setShowCardForm(false);
    setShowPaypalForm(false);
    setShowEspeceForm(false);
    
    // On affiche seulement celui qui est cliqué
    if (method.id === 'card' || method.id === 'cb') {
      setShowCardForm(true);
    } else if (method.id === 'paypal') {
      setShowPaypalForm(true);
    } else if (method.id === 'espece') {
      setShowEspeceForm(true);
    }
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    onPaymentComplete({
      method: selectedMethod.id,
      cardDetails: cardDetails,
      success: true
    });
  };

  const handlePaypalSubmit = (e) => {
    e.preventDefault();
    onPaymentComplete({
      method: 'paypal',
      paypalDetails: paypalDetails,
      success: true
    });
  };

  // 🎯 NOUVEAU : Fonction de validation pour l'espèce
  const handleEspeceSubmit = () => {
    onPaymentComplete({
      method: 'espece',
      success: true
    });
  };

  const handleCreatePaypalAccount = () => {
    window.open('https://www.paypal.com/fr/signup', '_blank');
  };

  const handleForgotPassword = () => {
    window.open('https://www.paypal.com/fr/forgotpassword', '_blank');
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    }
    return value;
  };

  return (
    <div className="payment-methods-container">
      <h3>Choisissez votre moyen de paiement</h3>
      
      <div className="methods-grid">
        {paymentMethods.map(method => (
          <div
            key={method.id}
            className={`method-card ${selectedMethod?.id === method.id ? 'selected' : ''}`}
            onClick={() => handleMethodSelect(method)}
          >
            <span className="method-icon">{method.icon}</span>
            <span className="method-name">{method.name}</span>
            {method.accepted && (
              <div className="accepted-badges">
                {method.accepted.map(badge => (
                  <span key={badge} className="badge">{badge}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulaire Carte Bancaire */}
      {showCardForm && (
        <div className="card-form-container">
          <h4>Entrez les informations de votre carte</h4>
          <form onSubmit={handleCardSubmit} className="card-form">
            <div className="form-group">
              <label>Numéro de carte</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails({
                  ...cardDetails,
                  cardNumber: formatCardNumber(e.target.value)
                })}
                maxLength="19"
                required
              />
            </div>

            <div className="form-group">
              <label>Nom sur la carte</label>
              <input
                type="text"
                placeholder="JEAN DUPONT"
                value={cardDetails.cardName}
                onChange={(e) => setCardDetails({
                  ...cardDetails,
                  cardName: e.target.value.toUpperCase()
                })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date d'expiration</label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  value={cardDetails.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\//g, '');
                    if (value.length >= 2) {
                      value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    setCardDetails({ ...cardDetails, expiryDate: value });
                  }}
                  maxLength="5"
                  required
                />
              </div>

              <div className="form-group">
                <label>CVV</label>
                <input
                  type="password"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({
                    ...cardDetails,
                    cvv: e.target.value.replace(/\D/g, '')
                  })}
                  maxLength="3"
                  required
                />
              </div>
            </div>

            <div className="secure-badge">
              <span className="lock-icon">🔒</span>
              <span>Paiement 100% sécurisé</span>
            </div>

            <button type="submit" className="pay-now-btn">
              Payer {amount} DH
            </button>
          </form>
        </div>
      )}

      {/* Formulaire PayPal */}
      {showPaypalForm && (
        <div className="paypal-form-container">
          <div className="paypal-header">
            <span className="paypal-icon">🅿️</span>
            <h4>Connectez-vous à votre compte PayPal</h4>
          </div>
          
          <form onSubmit={handlePaypalSubmit} className="paypal-form">
            <div className="form-group">
              <label>Adresse email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={paypalDetails.email}
                onChange={(e) => setPaypalDetails({
                  ...paypalDetails,
                  email: e.target.value
                })}
                required
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={paypalDetails.password}
                onChange={(e) => setPaypalDetails({
                  ...paypalDetails,
                  password: e.target.value
                })}
                required
              />
            </div>

            <div className="paypal-options">
              <label className="checkbox-label">
                <input type="checkbox" /> Rester connecté
              </label>
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="forgot-link-btn"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div className="secure-badge paypal-badge">
              <span className="lock-icon">🔒</span>
              <span>Connexion sécurisée PayPal</span>
            </div>

            <button type="submit" className="paypal-login-btn">
              Se connecter et payer {amount} DH
            </button>

            <div className="paypal-footer">
              <p>Vous n'avez pas de compte PayPal ?</p>
              <button 
                type="button"
                onClick={handleCreatePaypalAccount}
                className="create-account-btn"
              >
                Créer un compte sur PayPal
              </button>
              <p className="paypal-note">
                Vous serez redirigé vers le site officiel de PayPal
              </p>
            </div>
          </form>
        </div>
      )}

      {/* 🎯 NOUVEAU : Zone de confirmation pour le paiement en Espèce */}
      {showEspeceForm && (
        <div className="espece-form-container" style={{ 
          textAlign: 'center', padding: '30px', backgroundColor: '#f0fdf4', 
          border: '1px solid #bbf7d0', borderRadius: '8px', marginTop: '20px' 
        }}>
          <h4 style={{ color: '#166534', fontSize: '1.2rem', marginBottom: '10px' }}>Règlement sur place au cabinet</h4>
          <p style={{ color: '#15803d', marginBottom: '25px', fontSize: '1rem' }}>
            Vous paierez le montant de <strong>{amount} DH</strong> directement au médecin lors de votre rendez-vous.
          </p>
          <button 
            onClick={handleEspeceSubmit}
            className="pay-now-btn" 
            style={{ backgroundColor: '#16a34a', border: 'none', maxWidth: '300px', margin: '0 auto' }}
          >
            Confirmer la réservation
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;