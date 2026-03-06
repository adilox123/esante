import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ nom: '', email: '', password: '', role: 'patient' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      navigate('/verify', { state: { email: form.email } });
    } catch (err) { alert("Erreur inscription"); }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-box">
        <h2>Créer un compte</h2>
        <input type="text" placeholder="Nom" onChange={e => setForm({...form, nom: e.target.value})} required />
        <input type="email" placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} required />
        <input type="password" placeholder="Pass" onChange={e => setForm({...form, password: e.target.value})} required />
        <select onChange={e => setForm({...form, role: e.target.value})}>
          <option value="patient">Patient</option>
          <option value="medecin">Médecin</option>
        </select>
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
}