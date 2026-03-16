// Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './Chat.css';

const Chat = ({ rendezVousId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef();
  const scrollRef = useRef();

  // Récupération de l'utilisateur connecté via le localStorage
  const userId = localStorage.getItem('userId'); 

  useEffect(() => {
    if (!rendezVousId) return;
    
    // Connexion Socket.io
    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit('join_room', rendezVousId);

    // Chargement de l'historique depuis la base de données
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/messages/${rendezVousId}`);
        if (res.data.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error("Erreur historique:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    // Réception en temps réel
    socketRef.current.on('receive_message', (data) => {
      const newMessage = Array.isArray(data) ? data[0] : data;
      setMessages((prev) => [...prev, newMessage]);
    });

    socketRef.current.on('message_deleted', (deletedId) => {
      setMessages((prev) => prev.filter((m) => m.id !== deletedId));
    });

    return () => socketRef.current.disconnect();
  }, [rendezVousId]);

  // Scroll automatique vers le dernier message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fonction pour envoyer un message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!userId || !input.trim()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/messages', {
        contenu: input,
        expediteur_id: userId,
        rendez_vous_id: rendezVousId
      });
      if (res.data.success) setInput("");
    } catch (err) {
      console.error("Erreur d'envoi:", err);
    }
  };

  // Fonction pour supprimer un message (Front + Back)
  const deleteMessage = async (messageId) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce message ?")) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/messages/${messageId}`);
        if (res.data.success) {
          // Mise à jour instantanée de l'interface
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
        }
      } catch (err) {
        console.error("Erreur suppression:", err);
        alert("Impossible de supprimer le message.");
      }
    }
  };

  // Formater l'heure
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="loading-screen">Chargement des messages...</div>;

  return (
    <div className="whatsapp-container">
      {/* En-tête avec bouton fermer */}
      <div className="chat-header">
        <h3>Discussion - RDV #{rendezVousId}</h3>
        
      </div>

      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="no-messages">Aucun message. Commencez la conversation !</div>
        ) : (
          messages.map((msg, index) => {
            // Vérification si le message appartient à l'utilisateur actuel
            const isMe = String(msg.expediteur_id) === String(userId);
            
            return (
              <div key={msg.id || index} className={`message-wrapper ${isMe ? 'my-message-wrapper' : 'other-message-wrapper'}`}>
                <div className={`message-bubble ${isMe ? 'my-bubble' : 'other-bubble'}`}>
                  
                  {/* Bouton de suppression : Uniquement visible sur mes messages */}
                  {isMe && (
                    <button 
                      onClick={() => deleteMessage(msg.id)} 
                      className="delete-btn"
                      title="Supprimer"
                    >
                      ×
                    </button>
                  )}

                  <span className="message-info">
                    {isMe ? 'Moi' : (msg.nom_expediteur || 'Correspondant')}
                  </span>
                  <p className="message-text">{msg.contenu}</p>
                  <span className="message-time">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Formulaire de saisie style WhatsApp */}
      <form onSubmit={sendMessage} className="input-area">
        <input 
          className="whatsapp-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez un message..."
        />
        <button type="submit" className="whatsapp-send-btn">➤</button>
      </form>
    </div>
  );
};

export default Chat;