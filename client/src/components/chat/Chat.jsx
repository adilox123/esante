// Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './Chat.css';

const Chat = ({ rendezVousId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const socketRef = useRef();
  const scrollRef = useRef();

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!rendezVousId) return;

    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit('join_room', rendezVousId);

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/messages/${rendezVousId}`);
        if (res.data.success) setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Erreur historique:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    socketRef.current.on('receive_message', (data) => {
      const newMessage = Array.isArray(data) ? data[0] : data;
      setMessages(prev => [...prev, newMessage]);
    });

    socketRef.current.on('message_deleted', (deletedId) => {
      setMessages(prev => prev.filter(m => m.id !== deletedId));
    });

    return () => socketRef.current.disconnect();
  }, [rendezVousId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const deleteMessage = async (messageId) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/messages/${messageId}`);
      if (res.data.success) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === yesterday.toDateString()) return "Hier";
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = formatDate(msg.createdAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  if (loading) return (
    <div className="ch-loading">
      <div className="ch-loading__spinner" />
      <p>Chargement des messages...</p>
    </div>
  );

  return (
    <div className="ch-root">

      {/* ===== HEADER ===== */}
      <div className="ch-header">
        <div className="ch-header__circle ch-header__circle--1" />
        <div className="ch-header__circle ch-header__circle--2" />

        <div className="ch-header__avatar">
          💬
          <div className="ch-header__avatar-ring" />
        </div>

        <div className="ch-header__info">
          <p className="ch-header__title">Discussion — RDV #{rendezVousId}</p>
          <div className="ch-header__status">
            <span className="ch-status-dot" />
            Conversation en temps réel
          </div>
        </div>

        {onClose && (
          <button className="ch-header__close" onClick={onClose} title="Fermer">✕</button>
        )}
      </div>

      {/* ===== MESSAGES ===== */}
      <div className="ch-messages">

        {messages.length === 0 ? (
          <div className="ch-empty">
            <div className="ch-empty__icon">💬</div>
            <p className="ch-empty__title">Aucun message</p>
            <p className="ch-empty__sub">Commencez la conversation ci-dessous !</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="ch-date-sep">
                <span /><p>{date}</p><span />
              </div>

              {msgs.map((msg, index) => {
                const isMe = String(msg.expediteur_id) === String(userId);

                return (
                  <div
                    key={msg.id || index}
                    className={`ch-msg-row ${isMe ? 'ch-msg-row--me' : 'ch-msg-row--other'}`}
                  >
                    {/* Avatar (other only) */}
                    {!isMe && (
                      <div className="ch-msg-avatar">
                        {(msg.nom_expediteur || 'C')[0].toUpperCase()}
                      </div>
                    )}

                    <div className={`ch-bubble ${isMe ? 'ch-bubble--me' : 'ch-bubble--other'}`}>

                      {/* Sender name */}
                      <span className="ch-bubble__sender">
                        {isMe ? 'Moi' : (msg.nom_expediteur || 'Correspondant')}
                      </span>

                      <p className="ch-bubble__text">{msg.contenu}</p>

                      <div className="ch-bubble__footer">
                        <span className="ch-bubble__time">{formatTime(msg.createdAt)}</span>
                        {isMe && <span className="ch-bubble__check">✓✓</span>}
                      </div>

                      {/* Delete btn (me only) */}
                      {isMe && (
                        <button
                          className="ch-delete-btn"
                          onClick={() => setDeleteConfirm(msg.id)}
                          title="Supprimer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        <div ref={scrollRef} />
      </div>

      {/* ===== INPUT ===== */}
      <form onSubmit={sendMessage} className="ch-input-area">
        <input
          className="ch-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Tapez un message..."
          autoComplete="off"
        />
        <button type="submit" className="ch-send-btn" disabled={!input.trim()}>
          <span className="ch-send-btn__icon">➤</span>
        </button>
      </form>

      {/* ===== DELETE CONFIRM MODAL ===== */}
      {deleteConfirm && (
        <div className="ch-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="ch-modal" onClick={e => e.stopPropagation()}>
            <div className="ch-modal__icon">🗑️</div>
            <h4 className="ch-modal__title">Supprimer ce message ?</h4>
            <p className="ch-modal__sub">Cette action est irréversible.</p>
            <div className="ch-modal__actions">
              <button className="ch-modal__btn ch-modal__btn--danger" onClick={() => deleteMessage(deleteConfirm)}>
                Supprimer
              </button>
              <button className="ch-modal__btn ch-modal__btn--ghost" onClick={() => setDeleteConfirm(null)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Chat;