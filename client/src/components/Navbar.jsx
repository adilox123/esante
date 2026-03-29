import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHeartbeat, FaUserMd, FaUser, FaChevronDown,
  FaLifeRing, FaInfoCircle, FaShieldAlt,
  FaChartLine, FaUserInjured, FaCalendarCheck,
  FaClipboardList, FaTachometerAlt
} from 'react-icons/fa';
import './Navbar.css';

export default function Navbar({ onOpenLogin, onOpenRegister }) {
  const navigate   = useNavigate();
  const [scrolled,  setScrolled]  = useState(false);
  const [infoOpen,  setInfoOpen]  = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const dropdownRef  = useRef(null);
  const adminDropRef = useRef(null);

  const token   = localStorage.getItem('token');
  const role    = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleOut = (e) => {
      if (dropdownRef.current  && !dropdownRef.current.contains(e.target))  setInfoOpen(false);
      if (adminDropRef.current && !adminDropRef.current.contains(e.target)) setAdminOpen(false);
    };
    document.addEventListener('mousedown', handleOut);
    return () => document.removeEventListener('mousedown', handleOut);
  }, []);

  const handleLogout = () => {
    const patientId = localStorage.getItem('userId');
    if (patientId) localStorage.removeItem(`chat_history_${patientId}`);
    localStorage.clear();
    navigate('/');
  };

  /* ============================================================
     Helper: navigate admin tab
     ============================================================ */
  const goAdminTab = (tab) => {
    setAdminOpen(false);
    navigate(`/admin-dashboard?tab=${tab}`);
  };

  return (
    <nav className={`nb-root ${scrolled ? 'nb-root--scrolled' : ''} ${isAdmin ? 'nb-root--admin' : ''}`}>

      <div className={`nb-glow-line ${isAdmin ? 'nb-glow-line--admin' : ''}`} />

      {/* ===== LOGO ===== */}
      <div className="nb-logo">
        <Link to={isAdmin ? '/admin-dashboard?tab=overview' : '/'}>
          <div className={`nb-logo__icon ${isAdmin ? 'nb-logo__icon--admin' : ''}`}>
            {isAdmin ? <FaShieldAlt size={17} /> : <FaHeartbeat size={18} />}
          </div>
          <span className="nb-logo__text">
            E<span>-</span>Santé
            {isAdmin && <span className="nb-logo__admin-badge">Admin</span>}
          </span>
        </Link>
      </div>

      {/* ===== MENU ADMIN ===== */}
      {isAdmin ? (
        <div className="nb-menu nb-menu--admin">

          <button className="nb-link nb-link--admin" onClick={() => goAdminTab('overview')}>
            <FaTachometerAlt size={12} /> Vue d'ensemble
          </button>

          <button className="nb-link nb-link--admin" onClick={() => goAdminTab('patients')}>
            <FaUserInjured size={12} /> Patients
          </button>

          <button className="nb-link nb-link--admin" onClick={() => goAdminTab('medecins')}>
            <FaUserMd size={12} /> Médecins
          </button>

          <button className="nb-link nb-link--admin" onClick={() => goAdminTab('rdv')}>
            <FaCalendarCheck size={12} /> Rendez-vous
          </button>

          {/* Dropdown Rapports */}
          <div className="nb-dropdown" ref={adminDropRef}>
            <button
              className={`nb-link nb-link--admin nb-dropdown__trigger ${adminOpen ? 'nb-dropdown__trigger--open' : ''}`}
              onClick={() => setAdminOpen(v => !v)}
            >
              <FaClipboardList size={12} /> Rapports
              <FaChevronDown size={10} className={`nb-dropdown__chevron ${adminOpen ? 'nb-dropdown__chevron--open' : ''}`} />
            </button>

            {adminOpen && (
              <div className="nb-dropdown__menu nb-dropdown__menu--admin">
                <div className="nb-dropdown__glow nb-dropdown__glow--indigo" />

                <button className="nb-dropdown__item nb-dropdown__item--btn" onClick={() => goAdminTab('rapports')}>
                  <div className="nb-dropdown__item-icon nb-dropdown__item-icon--indigo">
                    <FaChartLine size={13} />
                  </div>
                  <div>
                    <p className="nb-dropdown__item-title">Statistiques</p>
                    <p className="nb-dropdown__item-sub">Données globales de la plateforme</p>
                  </div>
                </button>

                <div className="nb-dropdown__divider" />

                <button className="nb-dropdown__item nb-dropdown__item--btn" onClick={() => goAdminTab('rapports')}>
                  <div className="nb-dropdown__item-icon nb-dropdown__item-icon--purple">
                    <FaClipboardList size={13} />
                  </div>
                  <div>
                    <p className="nb-dropdown__item-title">Rapports complets</p>
                    <p className="nb-dropdown__item-sub">Export &amp; analyse des données</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

      ) : (
        /* ===== MENU PATIENT / MÉDECIN ===== */
        <div className="nb-menu">
          <Link to="/"        className="nb-link">Accueil</Link>
          <Link to="/doctors" className="nb-link">Médecins</Link>
          <Link to="/contact" className="nb-link">Contact</Link>

          <div className="nb-dropdown" ref={dropdownRef}>
            <button
              className={`nb-link nb-dropdown__trigger ${infoOpen ? 'nb-dropdown__trigger--open' : ''}`}
              onClick={() => setInfoOpen(v => !v)}
            >
              Informations
              <FaChevronDown size={11} className={`nb-dropdown__chevron ${infoOpen ? 'nb-dropdown__chevron--open' : ''}`} />
            </button>

            {infoOpen && (
              <div className="nb-dropdown__menu">
                <div className="nb-dropdown__glow" />

                <Link to="/centre-aide" className="nb-dropdown__item" onClick={() => setInfoOpen(false)}>
                  <div className="nb-dropdown__item-icon nb-dropdown__item-icon--teal">
                    <FaLifeRing size={14} />
                  </div>
                  <div>
                    <p className="nb-dropdown__item-title">Centre d'aides</p>
                    <p className="nb-dropdown__item-sub">FAQ &amp; support</p>
                  </div>
                </Link>

                <div className="nb-dropdown__divider" />

                <Link to="/Informations" className="nb-dropdown__item" onClick={() => setInfoOpen(false)}>
                  <div className="nb-dropdown__item-icon nb-dropdown__item-icon--blue">
                    <FaInfoCircle size={14} />
                  </div>
                  <div>
                    <p className="nb-dropdown__item-title">Informations E-Santé</p>
                    <p className="nb-dropdown__item-sub">À propos de la plateforme</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ACTIONS ===== */}
      <div className="nb-actions">
        {token ? (
          <>
            {isAdmin ? (
              <button className="nb-space-link nb-space-link--admin" onClick={() => goAdminTab('overview')} style={{ cursor: 'pointer', border: 'none' }}>
                <span className="nb-space-link__dot nb-space-link__dot--admin" />
                <FaShieldAlt size={14} />
                <span>Espace Admin</span>
              </button>
            ) : role === 'medecin' ? (
              <Link to="/doctor-dashboard" className="nb-space-link nb-space-link--teal">
                <span className="nb-space-link__dot" />
                <FaUserMd size={15} />
                <span>Espace Médecin</span>
              </Link>
            ) : (
              <Link to="/dashboard" className="nb-space-link nb-space-link--blue">
                <span className="nb-space-link__dot" />
                <FaUser size={14} />
                <span>Mon Espace Patient</span>
              </Link>
            )}
            <button onClick={handleLogout} className="nb-btn nb-btn--logout">Déconnexion</button>
          </>
        ) : (
          <>
            <button onClick={onOpenLogin}    className="nb-btn nb-btn--ghost">Se connecter</button>
            <button onClick={onOpenRegister} className="nb-btn nb-btn--primary">S'inscrire</button>
          </>
        )}
      </div>

    </nav>
  );
}