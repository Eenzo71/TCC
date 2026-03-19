import React, { useState, useEffect } from 'react';
import Login from './Login';
import Cadastro from './Cadastro';
import Painel from './Painel';
import './style.css';

type Tela = 'login' | 'cadastro' | 'sucesso' | 'painel';

export default function App() {
  const [telaAtual, setTelaAtual] = useState<Tela>('login');

  useEffect(() => {
    if (telaAtual === 'sucesso') {
      const timer = setTimeout(() => {
        setTelaAtual('login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [telaAtual]);

  if (telaAtual === 'login') {
    return <Login irParaCadastro={() => setTelaAtual('cadastro')} irParaPainel={() => setTelaAtual('painel')} />;
  }

  if (telaAtual === 'cadastro') {
    return <Cadastro irParaSucesso={() => setTelaAtual('sucesso')} irParaLogin={() => setTelaAtual('login')} />;
  }

  if (telaAtual === 'sucesso') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#e8f5e9' }}>
        <h1 style={{ color: '#2e7d32', fontSize: '3rem' }}>Sucesso</h1>
      </div>
    );
  }

  if (telaAtual === 'painel') {
    return <Painel irParaLogin={() => setTelaAtual('login')} />;
  }

  return null;
}