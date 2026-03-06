import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './Chat.css';

const socket = io('http://localhost:5000');

export default function Chat({ rendezVousId, userId, currentUserName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // 1. Charger l'historique et rejoindre la "room"
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${rendezVousId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Erreur historique:", err);
      }
    };

    fetchHistory();
    socket.emit('join_room', rendezVousId);

    // Écouter les nouveaux messages
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off('receive_message');
  }, [rendezVousId]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. Envoyer un message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const messageData = {
      rendez_vous_id: rendezVousId,
      expediteur_id: userId,
      contenu: newMessage,
      nom_expediteur: currentUserName, // Pour l'affichage immédiat
      createdAt: new Date()
    };

    // Envoyer via Socket.io
    socket.emit('send_message', messageData);
    
    // Sauvegarder en BDD (Optionnel si votre socket le fait déjà côté serveur)
    try {
      await axios.post('http://localhost:5000/api/messages', messageData);
    } catch (err) {
      console.error("Erreur sauvegarde message:", err);
    }

    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Discussion - RDV #{rendezVousId}</div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-bubble ${msg.expediteur_id === userId ? 'me' : 'other'}`}>
            <span className="msg-content">{msg.contenu}</span>
            <small className="msg-time">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-area" onSubmit={sendMessage}>
        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder="Écrivez votre message..."
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}