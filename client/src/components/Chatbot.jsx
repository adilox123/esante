import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // On récupère l'ID du patient connecté
  const patientId = localStorage.getItem('userId');

  // 1. 🎯 INITIALISATION (Gère le rafraîchissement F5)
  const [messages, setMessages] = useState(() => {
    // On cherche si un historique existe dans le navigateur pour ce patient
    const savedMessages = localStorage.getItem(`chat_history_${patientId}`);
    
    if (savedMessages && patientId) {
      return JSON.parse(savedMessages); // On restaure les messages
    } else {
      // Sinon, message de bienvenue par défaut
      return [{ text: "Bonjour ! Je suis l'assistant E-Sante. Comment puis-je vous aider aujourd'hui ?", isBot: true }];
    }
  });

  // 2. 🎯 SAUVEGARDE AUTOMATIQUE (À chaque nouveau message)
  useEffect(() => {
    if (patientId) {
      localStorage.setItem(`chat_history_${patientId}`, JSON.stringify(messages));
    }
  }, [messages, patientId]);

  // 3. 🎯 LA FONCTION D'ENVOI (Une seule fois !)
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
        patientId: patientId // 👈 On envoie bien l'ID au backend
      });

      const botMessage = { text: response.data.reply, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Désolé, je rencontre un problème de connexion.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬 Assistant Médical'}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Assistant E-Sante</h3>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="message bot loading">L'assistant écrit...</div>}
          </div>

          <form onSubmit={sendMessage} className="chatbot-input">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Décrivez vos symptômes..."
            />
            <button type="submit" disabled={loading}>Envoyer</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;