import React, { useState } from 'react';
import { auth } from './firebaseConfig'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import './style.css'; 

// Agora recebemos as funções de navegação aqui em cima:
export default function Login({ irParaCadastro, irParaPainel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault(); 
    
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Se logou com sucesso, chama a função que muda para o Painel!
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
          <img src="/images/bus-image.png" alt="Bus Image" />
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
            {/* Botão de cadastrar chama a função que muda a tela */}
            <a href="#" onClick={(e) => { e.preventDefault(); irParaCadastro(); }}>cadastrar-se</a>
          </div>
        </div>
      </div>
    </div>
  );
}