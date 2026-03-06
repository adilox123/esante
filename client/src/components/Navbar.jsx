import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaUserMd, FaUser } from 'react-icons/fa';
import './Navbar.css';

export default function Navbar({ onOpenLogin, onOpenRegister }) {
  const navigate = useNavigate();
  
  // On récupère le token et le rôle depuis le stockage du navigateur
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // Peut être 'patient' ou 'medecin'

  const handleLogout = () => {
    localStorage.clear(); // Efface toutes les données de session
    navigate('/'); // Redirige vers l'accueil
  };

  return (
    <nav className="global-navbar">
      
      {/* --- LOGO --- */}
      <div className="nav-logo">
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <FaHeartbeat size={28} color="#0056d2" style={{ marginRight: '8px' }} />
          E-Santé
        </Link>
      </div>
      
      {/* --- MENU CENTRAL --- */}
      <div className="nav-menu">
        <Link to="/" className="nav-link">Accueil</Link>
        <Link to="/doctors" className="nav-link">Médecins</Link>
        <Link to="/contact" className="nav-link">Contact</Link>
      </div>

      {/* --- ACTIONS (Connexion / Boutons) --- */}
      <div className="nav-actions">
        {token ? (
          // SI L'UTILISATEUR EST CONNECTÉ :
          <>
            {/* Différenciation intelligente Patient / Médecin */}
            {role === 'medecin' ? (
              <Link 
                to="/doctor-dashboard" 
                className="btn-text" 
                style={{marginRight: '20px', color: '#0056d2', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none'}}
              >
                <FaUserMd size={20} /> Espace Médecin
              </Link>
            ) : (
              <Link 
                to="/dashboard" 
                className="btn-text" 
                style={{marginRight: '20px', color: '#0056d2', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none'}}
              >
                <FaUser size={18} /> Mon Espace Patient
              </Link>
            )}
            
            <button 
              onClick={handleLogout} 
              className="btn-primary" 
              style={{backgroundColor: '#e11d48', border:'none', cursor:'pointer', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: 'bold'}}
            >
              Déconnexion
            </button>
          </>
        ) : (
          // SI L'UTILISATEUR N'EST PAS CONNECTÉ :
          <>
            <button 
              onClick={onOpenLogin} 
              className="btn-text" 
              style={{background:'none', border:'none', cursor:'pointer', fontSize:'16px', color: '#334155', fontWeight: '600'}}
            >
              Se connecter
            </button>
            <button 
              onClick={onOpenRegister} 
              className="btn-primary" 
              style={{border:'none', cursor:'pointer', fontSize:'16px', padding: '10px 20px', borderRadius: '8px', backgroundColor: '#0056d2', color: 'white', fontWeight: 'bold'}}
            >
              S'inscrire
            </button>
          </>
        )}
      </div>
      
    </nav>
  );
}