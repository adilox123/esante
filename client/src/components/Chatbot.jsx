import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const patientId = localStorage.getItem('userId');

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`chat_history_${patientId}`);
    if (saved && patientId) return JSON.parse(saved);
    return [{ text: "Bonjour ! Je suis l'assistant E-Santé. Comment puis-je vous aider aujourd'hui ?", isBot: true }];
  });

  useEffect(() => {
    if (patientId) {
      localStorage.setItem(`chat_history_${patientId}`, JSON.stringify(messages));
    }
  }, [messages, patientId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chatbot/ask', {
        message: userMessage.text,
        patientId: patientId, // On le garde pour l'historique
        
        // 🚀 LES DEUX LIGNES À AJOUTER :
        role: localStorage.getItem('role'),    // Envoie 'patient' ou 'medecin'
        userId: localStorage.getItem('userId') // Permet au backend de trouver les patients du médecin
      });
      
      setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
    } catch {
      setMessages(prev => [...prev, { text: "Désolé, je rencontre un problème de connexion.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = ["Prendre RDV", "Mes symptômes", "Urgence", "Horaires"];

  return (
    <div className="cb-root">

      {/* ===== CHAT WINDOW ===== */}
      {isOpen && (
        <div className="cb-window">

          {/* Header */}
          <div className="cb-header">
            <div className="cb-header__circle cb-header__circle--1" />
            <div className="cb-header__circle cb-header__circle--2" />

            <div className="cb-header__avatar">
              <span>🩺</span>
              <div className="cb-header__avatar-ring" />
            </div>

            <div className="cb-header__info">
              <p className="cb-header__name">Assistant E-Santé</p>
              <div className="cb-header__status">
                <span className="cb-status-dot" />
                En ligne · IA médicale
              </div>
            </div>

            <button className="cb-header__close" onClick={() => setIsOpen(false)} title="Fermer">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="cb-messages">

            {/* Date separator */}
            <div className="cb-date-sep">
              <span />
              <p>Aujourd'hui</p>
              <span />
            </div>

            {messages.map((msg, i) => (
              <div key={i} className={`cb-msg cb-msg--${msg.isBot ? 'bot' : 'user'}`}>
                {msg.isBot && (
                  <div className="cb-msg__avatar">🩺</div>
                )}
                <div className="cb-msg__bubble">
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="cb-msg cb-msg--bot">
                <div className="cb-msg__avatar">🩺</div>
                <div className="cb-msg__bubble cb-msg__bubble--typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          <div className="cb-quick-replies">
            {quickReplies.map(q => (
              <button
                key={q}
                className="cb-quick-btn"
                onClick={() => setInput(q)}
                disabled={loading}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="cb-input-area">
            <input
              type="text"
              className="cb-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Décrivez vos symptômes..."
              disabled={loading}
              autoComplete="off"
            />
            <button type="submit" className="cb-send-btn" disabled={loading || !input.trim()}>
              {loading ? <span className="cb-send-spinner" /> : <span className="cb-send-icon">→</span>}
            </button>
          </form>

        </div>
      )}

      {/* ===== TOGGLE BUTTON ===== */}
      <button
        className={`cb-toggle ${isOpen ? 'cb-toggle--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <span className="cb-toggle__icon">✕</span>
        ) : (
          <>
            <div className="cb-toggle__pulse" />
            <span className="cb-toggle__icon">💬</span>
            <span className="cb-toggle__label">Assistant Médical</span>
            <div className="cb-toggle__notif" />
          </>
        )}
      </button>

    </div>
  );
};

export default Chatbot;