import React, { useState, useEffect } from 'react';
import Login from './Login';
import Cadastro from './Cadastro';
import Painel from './Painel';
import './style.css';
import PanfletoDigital from './PanfletoDigital';
import Radar from './TelaRadar';
import CadastroAlunoMaior from './CadastroAlunoMaior';
import AdicionarDependente from './AdicionarDependente';

import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

type Tela = 'login' | 'cadastro' | 'sucesso' | 'painel' | 'radar' | 'panfleto' | 'cadastro-maior';

export default function App() {
  const [telaAtual, setTelaAtual] = useState<Tela>('login');

  const [slugConvite, setSlugConvite] = useState<string | null>(null);
  
  const [empresaVinculada, setEmpresaVinculada] = useState<string | null>(null);

  const [usuarioLogado, setUsuarioLogado] = useState<boolean>(false);
  const [verificandoAuth, setVerificandoAuth] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioLogado(true);

        setTelaAtual((telaAnterior) => telaAnterior === 'login' ? 'painel' : telaAnterior);
      } else {
        setUsuarioLogado(false);

        setTelaAtual((telaAnterior) =>
          (telaAnterior === 'painel' || telaAnterior === 'radar') ? 'login' : telaAnterior
        );
      }
      setVerificandoAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // effect url convite
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conviteNaUrl = params.get('convite');

    if (conviteNaUrl) {
      setSlugConvite(conviteNaUrl);
      setTelaAtual('panfleto');
    }
  }, []);

  // cronometro da Cutscene
  useEffect(() => {
    if (telaAtual === 'sucesso') {
      const timer = setTimeout(() => {
        setTelaAtual('painel');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [telaAtual]);

  if (verificandoAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#e8effd' }}>
        <h2 style={{ color: '#1a237e' }}>🛡️ Verificando sessão...</h2>
      </div>
    );
  }

  if (telaAtual === 'login') {
    return <Login irParaPanfleto={() => setTelaAtual('panfleto')} irParaPainel={() => setTelaAtual('painel')} />;
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

  if (telaAtual === 'cadastro-maior') {
    return <CadastroAlunoMaior 
      irParaPainel={() => setTelaAtual('painel')} 
      irParaVoltar={() => setTelaAtual('panfleto')}
    />;
  }
  if (telaAtual === 'sucesso') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem' }}>🎉 Conta criada com sucesso! Preparando o BusGap...</h1>
      </div>
    );
  }

  if (telaAtual === 'painel') {
    if (verificandoAuth) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f9' }}>
          <h2 style={{ color: '#111' }}>🛡️ Verificando credenciais...</h2>
        </div>
      );
    }
    if (!usuarioLogado) {
      setTimeout(() => setTelaAtual('login'), 0);
      return null;
    }
    return <Painel
      irParaLogin={() => setTelaAtual('login')}
      irParaRadar={() => setTelaAtual('radar')}
    />;
  }

  if (telaAtual === 'radar') {
    return <Radar irParaPainel={() => setTelaAtual('painel')} />;
  }

  if (telaAtual === 'panfleto') {
    return (
      <PanfletoDigital
        slugConvite={slugConvite || ''}
        irParaCadastroResponsavel={() => setTelaAtual('cadastro')}
        irParaCadastroAlunoMaior={() => setTelaAtual('cadastro-maior')}
      />
    );
  }

  return null;
}