import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './CentreAide.css';

/* ============================================================
   DONNÉES
   ============================================================ */
const URGENCES = [
  { label: 'SAMU / Ambulance',      num: '150',          icon: '🚑', color: 'red' },
  { label: 'Protection Civile',     num: '15',           icon: '🚒', color: 'orange' },
  { label: 'Centre Antipoison Maroc', num: '0801 000 180', icon: '☠️', color: 'purple' },
  { label: 'Gendarmerie Royale',    num: '177',          icon: '🚔', color: 'blue' },
  { label: 'Sécurité (Police)',     num: '19',           icon: '👮', color: 'navy' },
  { label: 'Pompiers',              num: '15',           icon: '🔥', color: 'red' },
];

const FAQ = [
  {
    q: 'Comment prendre un rendez-vous ?',
    a: 'Rendez-vous sur la page "Médecins", choisissez un spécialiste, sélectionnez un créneau disponible et confirmez votre réservation. Vous recevrez une confirmation immédiate.'
  },
  {
    q: 'Comment annuler ou modifier un RDV ?',
    a: 'Dans votre espace patient, section "Mes Rendez-vous", cliquez sur "Annuler" à côté du rendez-vous concerné. Vous pouvez le faire jusqu\'à 2h avant la consultation.'
  },
  {
    q: 'Mes données médicales sont-elles sécurisées ?',
    a: 'Oui. Toutes vos données sont chiffrées (SSL/TLS) et hébergées sur des serveurs sécurisés conformes aux normes RGPD. Seul vous et votre médecin y avez accès.'
  },
  {
    q: 'Comment uploader un document médical ?',
    a: 'Dans votre espace patient, allez dans "Mes Documents" puis cliquez sur la zone d\'upload. Seuls les fichiers PDF sont acceptés (max 10 Mo par fichier).'
  },
  {
    q: 'Le paiement en ligne est-il sécurisé ?',
    a: 'Absolument. Nous utilisons Stripe, le leader mondial du paiement sécurisé. Vos informations bancaires ne sont jamais stockées sur nos serveurs.'
  },
  {
    q: 'Puis-je consulter mon historique de rendez-vous ?',
    a: 'Oui, dans votre espace patient, la section "Mon Historique" liste toutes vos consultations passées avec les détails (médecin, date, statut).'
  },
];

/* ============================================================
   COMPOSANT IMC
   ============================================================ */
function ImcCalculator() {
  const [poids, setPoids] = useState('');
  const [taille, setTaille] = useState('');
  const [result, setResult] = useState(null);

  const getCategory = (imc) => {
    if (imc < 18.5) return { label: 'Insuffisance pondérale', color: '#3b82f6', emoji: '📉' };
    if (imc < 25)   return { label: 'Poids normal',           color: '#10b981', emoji: '✅' };
    if (imc < 30)   return { label: 'Surpoids',               color: '#f59e0b', emoji: '⚠️' };
    return               { label: 'Obésité',                  color: '#ef4444', emoji: '🔴' };
  };

  const calculate = (e) => {
    e.preventDefault();
    const p = parseFloat(poids);
    const t = parseFloat(taille) / 100;
    if (!p || !t || t <= 0) return;
    const imc = p / (t * t);
    setResult({ value: imc.toFixed(1), ...getCategory(imc) });
  };

  return (
    <div className="ca-card ca-card--imc">
      <div className="ca-card__accent" />
      <div className="ca-card__header">
        <div className="ca-card__icon ca-card__icon--teal">⚖️</div>
        <div>
          <h3 className="ca-card__title">Calculateur d'IMC</h3>
          <p className="ca-card__sub">Indice de masse corporelle (OMS)</p>
        </div>
      </div>

      <form onSubmit={calculate} className="ca-imc-form">
        <div className="ca-imc-row">
          <div className="ca-field">
            <label className="ca-field__label">Poids (kg)</label>
            <input
              type="number" className="ca-field__input"
              placeholder="Ex: 70" value={poids}
              onChange={e => { setPoids(e.target.value); setResult(null); }}
              min="20" max="300"
            />
          </div>
          <div className="ca-field">
            <label className="ca-field__label">Taille (cm)</label>
            <input
              type="number" className="ca-field__input"
              placeholder="Ex: 175" value={taille}
              onChange={e => { setTaille(e.target.value); setResult(null); }}
              min="100" max="250"
            />
          </div>
        </div>
        <button type="submit" className="ca-btn ca-btn--primary ca-btn--full">
          Calculer mon IMC →
        </button>
      </form>

      {result && (
        <div className="ca-imc-result" style={{ '--result-color': result.color }}>
          <div className="ca-imc-result__score">{result.value}</div>
          <div className="ca-imc-result__info">
            <span className="ca-imc-result__emoji">{result.emoji}</span>
            <span className="ca-imc-result__label">{result.label}</span>
          </div>
          <div className="ca-imc-result__bar">
            <div
              className="ca-imc-result__fill"
              style={{ width: `${Math.min(100, (parseFloat(result.value) / 40) * 100)}%` }}
            />
          </div>
          <p className="ca-imc-result__hint">
            IMC normal : 18.5 – 24.9
          </p>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   COMPOSANT URGENCES
   ============================================================ */
function UrgencesCard() {
  return (
    <div className="ca-card ca-card--urgences">
      <div className="ca-card__accent ca-card__accent--red" />
      <div className="ca-card__header">
        <div className="ca-card__icon ca-card__icon--red">🚨</div>
        <div>
          <h3 className="ca-card__title">Numéros d'Urgence</h3>
          <p className="ca-card__sub">Maroc — disponibles 24h/24</p>
        </div>
      </div>
      <div className="ca-urgences-list">
        {URGENCES.map((u, i) => (
          <a
            key={i}
            href={`tel:${u.num.replace(/\s/g, '')}`}
            className={`ca-urgence-item ca-urgence-item--${u.color}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="ca-urgence-item__icon">{u.icon}</span>
            <span className="ca-urgence-item__label">{u.label}</span>
            <span className="ca-urgence-item__num">{u.num}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   COMPOSANT ASSISTANT IA
   ============================================================ */
function AssistantIA() {
  const [messages, setMessages] = useState([
    { text: "Bonjour ! Je suis l'assistant santé E-Santé. Posez-moi votre question médicale.", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();
  const patientId = localStorage.getItem('userId');

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/chatbot/ask', {
        message: userMsg.text,
        patientId
      });
      setMessages(prev => [...prev, { text: res.data.reply, isBot: true }]);
    } catch {
      setMessages(prev => [...prev, { text: "Désolé, je rencontre un problème de connexion.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ['Mal de tête', 'Fièvre', 'Douleur thoracique', 'Prévention'];

  return (
    <div className="ca-card ca-card--assistant">
      <div className="ca-card__accent ca-card__accent--navy" />
      <div className="ca-assistant-header">
        <div className="ca-assistant-header__orb" />
        <div className="ca-assistant-avatar">🩺</div>
        <div>
          <p className="ca-assistant-name">Assistant Santé IA</p>
          <div className="ca-assistant-status">
            <span className="ca-assistant-dot" />
            Propulsé par IA
          </div>
        </div>
      </div>

      <div className="ca-assistant-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ca-amsg ca-amsg--${msg.isBot ? 'bot' : 'user'}`}>
            {msg.isBot && <div className="ca-amsg__av">🩺</div>}
            <div className="ca-amsg__bubble">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="ca-amsg ca-amsg--bot">
            <div className="ca-amsg__av">🩺</div>
            <div className="ca-amsg__bubble ca-amsg__typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="ca-assistant-suggestions">
        {suggestions.map(s => (
          <button key={s} className="ca-sugg-btn" onClick={() => setInput(s)} disabled={loading}>
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={send} className="ca-assistant-input">
        <input
          className="ca-assistant-input__field"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ex: j'ai mal à la tête..."
          disabled={loading}
        />
        <button type="submit" className="ca-assistant-input__send" disabled={loading || !input.trim()}>
          {loading ? <span className="ca-send-spinner" /> : '➤'}
        </button>
      </form>
    </div>
  );
}

/* ============================================================
   COMPOSANT FAQ
   ============================================================ */
function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <section className="ca-faq-section">
      <div className="ca-section-header">
        <div className="ca-section-header__badge">
          <span className="ca-badge-dot" />Questions fréquentes
        </div>
        <h2 className="ca-section-header__title">
          Tout ce que vous devez <span>savoir</span>
        </h2>
        <p className="ca-section-header__sub">Retrouvez les réponses aux questions les plus posées par nos utilisateurs.</p>
      </div>

      <div className="ca-faq-list">
        {FAQ.map((item, i) => (
          <div
            key={i}
            className={`ca-faq-item ${open === i ? 'ca-faq-item--open' : ''}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <button className="ca-faq-item__q" onClick={() => setOpen(open === i ? null : i)}>
              <span>{item.q}</span>
              <span className={`ca-faq-item__chevron ${open === i ? 'ca-faq-item__chevron--open' : ''}`}>▾</span>
            </button>
            {open === i && (
              <div className="ca-faq-item__a">
                <p>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   PAGE PRINCIPALE
   ============================================================ */
export default function CentreAide() {
  return (
    <div className="ca-root">

      {/* Background orbs */}
      <div className="ca-orb ca-orb--1" />
      <div className="ca-orb ca-orb--2" />
      <div className="ca-orb ca-orb--3" />

      {/* ===== HERO ===== */}
      <section className="ca-hero">
        <div className="ca-hero__badge">
          <span className="ca-badge-dot" />Centre d'aides
        </div>
        <h1 className="ca-hero__title">
          Portail de la <span>Santé</span><br />au Maroc
        </h1>
        <p className="ca-hero__sub">
          Votre plateforme intelligente pour la prévention, le suivi de santé et<br />
          l'actualité médicale en temps réel.
        </p>
        <div className="ca-hero__pills">
          <span>🔒 Données sécurisées</span>
          <span>🏥 200+ médecins</span>
          <span>⚡ RDV instantané</span>
          <span>🤖 IA médicale</span>
        </div>
      </section>

      {/* ===== WIDGETS GRID ===== */}
      <section className="ca-widgets">
        <div className="ca-widgets__grid">
          <ImcCalculator />
          <UrgencesCard />
          <AssistantIA />
        </div>
      </section>

      {/* ===== INFO CARDS ===== */}
      <section className="ca-info-section">
        <div className="ca-info-grid">
          <div className="ca-info-card ca-info-card--teal">
            <div className="ca-info-card__icon">📞</div>
            <h3>Support Technique</h3>
            <p>Une question sur la plateforme ? Notre équipe est disponible du lundi au vendredi, 9h–18h.</p>
            <a href="/contact" className="ca-btn ca-btn--outline-teal">Nous contacter →</a>
          </div>
          <div className="ca-info-card ca-info-card--blue">
            <div className="ca-info-card__icon">📋</div>
            <h3>Guide d'utilisation</h3>
            <p>Consultez notre guide complet pour profiter de toutes les fonctionnalités d'E-Santé.</p>
            <a href="/informations" className="ca-btn ca-btn--outline-blue">Voir le guide →</a>
          </div>
          <div className="ca-info-card ca-info-card--green">
            <div className="ca-info-card__icon">🏥</div>
            <h3>Trouver un Médecin</h3>
            <p>Parcourez notre annuaire de plus de 200 spécialistes agréés et prenez RDV en ligne.</p>
            <a href="/doctors" className="ca-btn ca-btn--outline-green">Voir les médecins →</a>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <FaqSection />

    </div>
  );
}