import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import './style.css';

interface LoginProps {
  irParaPanfleto: () => void;
  irParaPainel: () => void;
}

export default function Login({ irParaPanfleto, irParaPainel }: LoginProps) {
  const [email, setEmail] = useState(sessionStorage.getItem('emailBusGap') || '');
  const [password, setPassword] = useState('');

  useEffect(() => {
    sessionStorage.removeItem('emailBusGap');
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        irParaPainel();
      })
      .catch((error) => {
        console.error("Erro no login:", error);
        alert("Erro ao logar. Verifique o e-mail e a senha.");
      });
  };

  return (
    <div className="container">
      <div className="top-bar">
        <h1>BusGap</h1>
      </div>
      <div className="main-content">
        <div className="foto">
          <img src="/images/bus_gap_sem_fundo.png" alt="Bus Image" />
        </div>
        <div className="log">
          <h3 id="login">Login</h3>
          <hr className="linha-titulo" />
          <form id="login-form" onSubmit={handleLogin}>
            <input type="email" name="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" name="password" required placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="btn-container">
              <input type="submit" value="ENTRAR" />
            </div>
          </form>
          <div className="links-rodape">
            <a href="#">esqueceu a senha?</a>
            <span className="divisor">|</span>
            <a href="#" onClick={(e) => { e.preventDefault(); irParaPanfleto(); }}>cadastrar-se</a>
          </div>
        </div>
      </div>
    </div>
  );
}