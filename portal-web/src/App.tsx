import React, { useState, useEffect } from 'react';
import Login from './Login';
import Cadastro from './Cadastro';
import Painel from './Painel';
import './style.css';

type Tela = 'login' | 'cadastro' | 'sucesso' | 'painel';

export default function App() {
  const [telaAtual, setTelaAtual] = useState<Tela>('login');

  // cronometro pra cutcine
  useEffect(() => {
    if (telaAtual === 'sucesso') {
      const timer = setTimeout(() => {
        setTelaAtual('painel'); 
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [telaAtual]);

  // Telas
  if (telaAtual === 'login') {
    return <Login irParaCadastro={() => setTelaAtual('cadastro')} irParaPainel={() => setTelaAtual('painel')} />;
  }

  if (telaAtual === 'cadastro') {
    return <Cadastro irParaSucesso={() => setTelaAtual('sucesso')} irParaLogin={() => setTelaAtual('login')} />;
  }

  if (telaAtual === 'sucesso') {
    return (
      // div da cutcine
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem' }}>🎉 Conta criada com sucesso! Preparando o BusGap...</h1>
      </div>
    );
  }

  if (telaAtual === 'painel') {
    return <Painel irParaLogin={() => setTelaAtual('login')} />;
  }

  return null;
}