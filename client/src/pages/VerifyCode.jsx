import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function VerifyCode() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/verify', { email, code });
      alert("Compte activé ! Connectez-vous.");
      navigate('/login');
    } catch (err) { alert("Code incorrect."); }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Vérification</h2>
        <p>Code envoyé à <b>{email}</b></p>
        <form onSubmit={handleVerify}>
          <input type="text" placeholder="Code (6 chiffres)" onChange={e => setCode(e.target.value)} required />
          <button type="submit">Valider</button>
        </form>
      </div>
    </div>
  );
}