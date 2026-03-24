import React, { useState, useEffect } from 'react';
import Login from './Login';
import Cadastro from './Cadastro';
import Painel from './Painel';
import './style.css';
import Radar from './Radar';
import PanfletoDigital from './PanfletoDigital';

type Tela = 'login' | 'cadastro' | 'sucesso' | 'painel' | 'radar' | 'panfleto';

export default function App() {
  const [telaAtual, setTelaAtual] = useState<Tela>('login');
  
  const [slugConvite, setSlugConvite] = useState<string | null>(null);
  const [empresaVinculada, setEmpresaVinculada] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conviteNaUrl = params.get('convite');

    if (conviteNaUrl) {
      setSlugConvite(conviteNaUrl);
      setTelaAtual('panfleto');
    }
  }, []);

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
    return (
      <Cadastro 
        irParaLogin={() => setTelaAtual('login')} 
        irParaSucesso={() => setTelaAtual('sucesso')} 
        empresaId={empresaVinculada}
      />
    );
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
    return <Painel irParaLogin={() => setTelaAtual('login')} irParaRadar={() => setTelaAtual('radar')} />;
  }

  if (telaAtual === 'panfleto' && slugConvite) {
    return (
      <PanfletoDigital 
        slugConvite={slugConvite}
        irParaCadastroResponsavel={(empresaId) => {
          setEmpresaVinculada(empresaId);
          setTelaAtual('cadastro'); 
        }}
        irParaCadastroAlunoMaior={(empresaId) => {
          setEmpresaVinculada(empresaId); 
          setTelaAtual('cadastro'); 
        }}
      />
    );
  }

  return null;
}