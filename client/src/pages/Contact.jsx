import React from 'react';
import './Contact.css';

export default function Contact() {
  return (
    <div className="contact-page-container">
      <div className="contact-wrapper">
        
        {/* --- PARTIE GAUCHE : Infos & Réseaux Sociaux --- */}
        <div className="contact-info-panel">
          <div>
            <h2>Contactez-nous</h2>
            <p>Notre équipe est à votre disposition pour toute question concernant la plateforme E-Santé ou pour une assistance technique.</p>
            
            <div className="info-items">
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div className="info-text">
                  <h4>Adresse Officielle</h4>
                  <p>335, Avenue Mohammed V, Rabat, Maroc</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-icon">📞</span>
                <div className="info-text">
                  <h4>Téléphone</h4>
                  <p>+212 537 76 11 21</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">✉️</span>
                <div className="info-text">
                  <h4>Email</h4>
                  <p>contact@sante.gov.ma</p>
                </div>
              </div>
            </div>
          </div>

          <div className="social-media-section">
            <h4>Suivez le Ministère de la Santé</h4>
            <div className="social-icons">
              {/* Facebook */}
              <a href="https://www.facebook.com/ministere.sante.ma" target="_blank" rel="noreferrer" className="social-btn" title="Facebook">
                <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/ministeresantemaroc/" target="_blank" rel="noreferrer" className="social-btn" title="Instagram">
                <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.88z"/></svg>
              </a>
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/company/ministere-de-la-sante-maroc" target="_blank" rel="noreferrer" className="social-btn" title="LinkedIn">
                <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              {/* YouTube */}
              <a href="https://www.youtube.com/channel/UC-bEab69_x_Wj0_3m_i1Wlg" target="_blank" rel="noreferrer" className="social-btn" title="YouTube">
                <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.498 5.814a3.016 3.016 0 0 0 2.122 2.136C4.495 20.5 12 20.5 12 20.5s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* --- PARTIE DROITE : Formulaire de contact --- */}
        <div className="contact-form-panel">
          <h3>Envoyez-nous un message</h3>
          <form onSubmit={(e) => { e.preventDefault(); alert("Message envoyé avec succès !"); }}>
            
            <div className="form-group">
              <label>Nom complet</label>
              <input type="text" className="form-input" placeholder="Ex: Youssef Alaoui" required />
            </div>

            <div className="form-group">
              <label>Adresse Email</label>
              <input type="email" className="form-input" placeholder="Ex: youssef@email.com" required />
            </div>

            <div className="form-group">
              <label>Sujet de votre message</label>
              <input type="text" className="form-input" placeholder="Ex: Problème de connexion" required />
            </div>

            <div className="form-group">
              <label>Votre message</label>
              <textarea className="form-textarea" placeholder="Expliquez-nous comment nous pouvons vous aider..." required></textarea>
            </div>

            <button type="submit" className="btn-submit">
              Envoyer le message
            </button>
            
          </form>
        </div>

      </div>
    </div>
  );
}