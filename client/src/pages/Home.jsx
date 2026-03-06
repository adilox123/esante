import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

// =============================================
// IMPORTATION DE TES IMAGES
// =============================================
import heroImg from '../assets/home-hero.jpg';
import hopitalImg from '../assets/ibnsina.jpg'; 
import machineImg from '../assets/machine.jpeg'; // ⚠️ Remplacé par .jpeg
import ministereLogo from '../assets/ministre de sante.jpg'; // ⚠️ Sans espaces
export default function Home() {
  return (
    <div className="home-container">
      
      {/* ================= HERO SECTION (Inspiré de ta maquette) ================= */}
      <section className="hero-modern">
        <div className="wrapper hero-content">
          
          {/* Colonne Gauche : Textes */}
          <div className="hero-text">
            <div className="hero-subtitle">Plateforme E-Santé Maroc</div>
            <h1>Votre Santé, <br/><span>Plus Proche De Vous</span></h1>
            <p>
              Une plateforme solidaire et innovante pour faciliter l'accès aux soins, 
              la prise de rendez-vous et le suivi médical de tous les citoyens.
            </p>
            
            <div className="hero-checks">
              <span><span className="check-icon">✔</span> Médecins certifiés</span>
              <span><span className="check-icon">✔</span> Prise de RDV rapide</span>
              <span><span className="check-icon">✔</span> Dossier médical sécurisé</span>
            </div>

            <div className="hero-buttons">
              <Link to="/register" className="btn-primary-hero">Commencer ➔</Link>
              <Link to="/doctors" className="btn-secondary-hero">Nos Médecins ➔</Link>
            </div>
          </div>

          {/* Colonne Droite : Image et Badges */}
          <div className="hero-image-wrapper">
            <div className="bg-circle"></div>
            
            <div className="hero-image-box">
              <img src={heroImg} alt="Initiative de solidarité" />
            </div>

            {/* Badges Flottants */}
            <div className="floating-badge badge-top">
              <div className="badge-icon" style={{color: '#E60000'}}>🏥</div>
              <div className="badge-text">
                <h4>Solidarité</h4>
                <p>Nationale</p>
              </div>
            </div>

            <div className="floating-badge badge-bottom">
              <div className="badge-icon" style={{color: '#0047AB'}}>👨‍⚕️</div>
              <div className="badge-text">
                <h4>+500</h4>
                <p>Médecins actifs</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SECTION : Infrastructures (Ibn Sina / Hôpital) ================= */}
      <section className="nat-section">
        <div className="wrapper split-content">
          <div className="nat-text">
            <h2 style={{color: '#0047AB'}}>Des infrastructures de pointe pour tous</h2>
            <p>
              Dans le cadre de la refonte du système national de santé, notre plateforme vous connecte aux centres hospitaliers universitaires (CHU) les plus modernes du Royaume, à l'image du nouvel Hôpital Ibn Sina. 
            </p>
            <p>
              Un accès simplifié à des structures d'excellence, dotées des dernières innovations architecturales et médicales pour une prise en charge optimale.
            </p>
          </div>
          <div className="nat-image">
            <img src={hopitalImg} alt="Nouvel Hôpital Maroc" />
          </div>
        </div>
      </section>

      {/* ================= SECTION : Équipements & Technologie (Machine / m6_2) ================= */}
      <section className="nat-section white-bg">
        <div className="wrapper split-content reverse">
          <div className="nat-text">
            <h2 style={{color: '#E60000'}}>Une médecine de haute précision</h2>
            <p>
              E-Santé vous oriente vers des spécialistes équipés des technologies médicales de dernière génération. Blocs opératoires intelligents, imagerie de haute précision et équipements radiologiques avancés.
            </p>
            <p>
              Parce que votre santé mérite la meilleure technologie, nous collaborons avec des professionnels utilisant un matériel de pointe certifié.
            </p>
            <Link to="/doctors" className="btn-primary-hero" style={{display: 'inline-block', marginTop: '15px'}}>
              Trouver un spécialiste
            </Link>
          </div>
          <div className="nat-image">
            <img src={machineImg} alt="Équipement médical haute technologie" />
          </div>
        </div>
      </section>

      {/* ================= SECTION : Ministère de la Santé ================= */}
      <section className="ministry-section">
        <div className="wrapper">
          <img src={ministereLogo} alt="Ministère de la Santé" className="ministry-logo" />
          <h3 style={{color: '#1e293b', marginBottom: '10px'}}>Une initiative reconnue</h3>
          <p style={{color: '#64748b', maxWidth: '600px', margin: '0 auto'}}>
            Cette plateforme s'inscrit dans la vision globale d'amélioration des services de santé publique au Maroc, garantissant la sécurité de vos données et la qualité des soins prodigués.
          </p>
        </div>
      </section>

    </div>
  );
}