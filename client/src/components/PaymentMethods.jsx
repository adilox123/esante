// components/PaymentMethods.jsx
import React, { useState } from 'react';
import './PaymentMethods.css';

const PaymentMethods = ({ amount, onPaymentComplete }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showPaypalForm, setShowPaypalForm] = useState(false);
  const [showEspeceForm, setShowEspeceForm] = useState(false);

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '', cardName: '', expiryDate: '', cvv: ''
  });
  const [paypalDetails, setPaypalDetails] = useState({
    email: '', password: ''
  });

  const paymentMethods = [
    { id: 'card', name: 'Carte bancaire', icon: '💳', sub: 'Visa · Mastercard · Amex', accepted: ['Visa', 'Mastercard', 'Amex'] },
    { id: 'paypal', name: 'PayPal',        icon: '🅿️', sub: 'Compte PayPal', color: '#003087' },
    { id: 'espece', name: 'Sur place',     icon: '💵', sub: 'Espèce au cabinet', accepted: ['Espèce au cabinet'] },
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setShowCardForm(false);
    setShowPaypalForm(false);
    setShowEspeceForm(false);
    if (method.id === 'card' || method.id === 'cb') setShowCardForm(true);
    else if (method.id === 'paypal') setShowPaypalForm(true);
    else if (method.id === 'espece') setShowEspeceForm(true);
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    onPaymentComplete({ method: selectedMethod.id, cardDetails, success: true });
  };

  const handlePaypalSubmit = (e) => {
    e.preventDefault();
    onPaymentComplete({ method: 'paypal', paypalDetails, success: true });
  };

  const handleEspeceSubmit = () => {
    onPaymentComplete({ method: 'espece', success: true });
  };

  const handleCreatePaypalAccount = () => window.open('https://www.paypal.com/fr/signup', '_blank');
  const handleForgotPassword = () => window.open('https://www.paypal.com/fr/forgotpassword', '_blank');

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) parts.push(match.substring(i, i + 4));
    return parts.length ? parts.join(' ') : value;
  };

  return (
    <div className="pm-root">

      {/* Method selector */}
      <div className="pm-grid">
        {paymentMethods.map(method => (
          <button
            key={method.id}
            type="button"
            className={`pm-method ${selectedMethod?.id === method.id ? 'pm-method--active' : ''}`}
            onClick={() => handleMethodSelect(method)}
          >
            {selectedMethod?.id === method.id && <div className="pm-method__glow" />}
            <span className="pm-method__icon">{method.icon}</span>
            <span className="pm-method__name">{method.name}</span>
            <span className="pm-method__sub">{method.sub}</span>
            {selectedMethod?.id === method.id && (
              <div className="pm-method__check">✓</div>
            )}
          </button>
        ))}
      </div>

      {/* ===== CARD FORM ===== */}
      {showCardForm && (
        <div className="pm-form-panel pm-form-panel--card">
          <div className="pm-form-panel__accent" />

          <div className="pm-form-panel__header">
            <div className="pm-form-panel__header-icon">💳</div>
            <div>
              <h4 className="pm-form-panel__title">Informations de carte</h4>
              <p className="pm-form-panel__sub">Vos données sont chiffrées et sécurisées</p>
            </div>
            <div className="pm-secure-pill">
              <span className="pm-secure-dot" />🔒 SSL
            </div>
          </div>

          <form onSubmit={handleCardSubmit} className="pm-form">

            <div className="pm-field">
              <label className="pm-field__label">Numéro de carte</label>
              <div className="pm-field__wrap">
                <span className="pm-field__icon">💳</span>
                <input
                  type="text"
                  className="pm-field__input"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={e => setCardDetails({ ...cardDetails, cardNumber: formatCardNumber(e.target.value) })}
                  maxLength="19"
                  required
                />
                <div className="pm-card-brands">
                  <span>Visa</span><span>MC</span>
                </div>
              </div>
            </div>

            <div className="pm-field">
              <label className="pm-field__label">Nom sur la carte</label>
              <div className="pm-field__wrap">
                <span className="pm-field__icon">👤</span>
                <input
                  type="text"
                  className="pm-field__input"
                  placeholder="JEAN DUPONT"
                  value={cardDetails.cardName}
                  onChange={e => setCardDetails({ ...cardDetails, cardName: e.target.value.toUpperCase() })}
                  required
                />
              </div>
            </div>

            <div className="pm-row">
              <div className="pm-field">
                <label className="pm-field__label">Expiration</label>
                <div className="pm-field__wrap">
                  <span className="pm-field__icon">📅</span>
                  <input
                    type="text"
                    className="pm-field__input"
                    placeholder="MM/AA"
                    value={cardDetails.expiryDate}
                    onChange={e => {
                      let value = e.target.value.replace(/\//g, '');
                      if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
                      setCardDetails({ ...cardDetails, expiryDate: value });
                    }}
                    maxLength="5"
                    required
                  />
                </div>
              </div>
              <div className="pm-field">
                <label className="pm-field__label">CVV</label>
                <div className="pm-field__wrap">
                  <span className="pm-field__icon">🔑</span>
                  <input
                    type="password"
                    className="pm-field__input"
                    placeholder="•••"
                    value={cardDetails.cvv}
                    onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                    maxLength="3"
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="pm-pay-btn">
              <span>Payer {amount} DH</span>
              <span className="pm-pay-btn__arrow">→</span>
            </button>
          </form>
        </div>
      )}

      {/* ===== PAYPAL FORM ===== */}
      {showPaypalForm && (
        <div className="pm-form-panel pm-form-panel--paypal">
          <div className="pm-form-panel__accent pm-form-panel__accent--paypal" />

          <div className="pm-form-panel__header">
            <div className="pm-form-panel__header-icon pm-form-panel__header-icon--paypal">🅿️</div>
            <div>
              <h4 className="pm-form-panel__title">Connexion PayPal</h4>
              <p className="pm-form-panel__sub">Connectez-vous à votre compte PayPal</p>
            </div>
          </div>

          <form onSubmit={handlePaypalSubmit} className="pm-form">

            <div className="pm-field">
              <label className="pm-field__label">Adresse email</label>
              <div className="pm-field__wrap">
                <span className="pm-field__icon">✉️</span>
                <input
                  type="email"
                  className="pm-field__input"
                  placeholder="votre@email.com"
                  value={paypalDetails.email}
                  onChange={e => setPaypalDetails({ ...paypalDetails, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pm-field">
              <label className="pm-field__label">Mot de passe</label>
              <div className="pm-field__wrap">
                <span className="pm-field__icon">🔑</span>
                <input
                  type="password"
                  className="pm-field__input"
                  placeholder="••••••••"
                  value={paypalDetails.password}
                  onChange={e => setPaypalDetails({ ...paypalDetails, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pm-paypal-options">
              <label className="pm-paypal-check">
                <input type="checkbox" /> Rester connecté
              </label>
              <button type="button" className="pm-paypal-forgot" onClick={handleForgotPassword}>
                Mot de passe oublié ?
              </button>
            </div>

            <div className="pm-paypal-secure">
              <span className="pm-secure-dot pm-secure-dot--paypal" />
              🔒 Connexion sécurisée PayPal
            </div>

            <button type="submit" className="pm-pay-btn pm-pay-btn--paypal">
              <span>Se connecter et payer {amount} DH</span>
              <span className="pm-pay-btn__arrow">→</span>
            </button>

            <div className="pm-paypal-footer">
              <p>Vous n'avez pas de compte PayPal ?</p>
              <button type="button" className="pm-paypal-create" onClick={handleCreatePaypalAccount}>
                Créer un compte PayPal
              </button>
              <p className="pm-paypal-note">Vous serez redirigé vers le site officiel de PayPal</p>
            </div>
          </form>
        </div>
      )}

      {/* ===== ESPECE ===== */}
      {showEspeceForm && (
        <div className="pm-form-panel pm-form-panel--espece">
          <div className="pm-form-panel__accent pm-form-panel__accent--espece" />

          <div className="pm-espece-content">
            <div className="pm-espece__icon-wrap">💵</div>
            <h4 className="pm-espece__title">Règlement sur place au cabinet</h4>
            <p className="pm-espece__sub">
              Vous paierez le montant de <strong>{amount} DH</strong> directement au médecin lors de votre rendez-vous.
            </p>

            <div className="pm-espece__info-list">
              <div className="pm-espece__info-item">
                <span>📅</span>
                <span>Le paiement est dû le jour du rendez-vous</span>
              </div>
              <div className="pm-espece__info-item">
                <span>🏥</span>
                <span>Directement au cabinet du médecin</span>
              </div>
              <div className="pm-espece__info-item">
                <span>✅</span>
                <span>Votre rendez-vous sera réservé immédiatement</span>
              </div>
            </div>

            <button type="button" className="pm-pay-btn pm-pay-btn--espece" onClick={handleEspeceSubmit}>
              <span>Confirmer la réservation</span>
              <span className="pm-pay-btn__arrow">→</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentMethods;