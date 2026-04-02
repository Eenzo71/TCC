import React, { useState, useEffect } from 'react';
import Login from './Login';
import Cadastro from './Cadastro';
import Painel from './Painel';
import './style.css';
import Radar from './Radar';
import PanfletoDigital from './PanfletoDigital';

import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

type Tela = 'login' | 'cadastro' | 'sucesso' | 'painel' | 'radar' | 'panfleto';

export default function App() {
  const [telaAtual, setTelaAtual] = useState<Tela>('login');
  
  const [slugConvite, setSlugConvite] = useState<string | null>(null);
  const [empresaVinculada, setEmpresaVinculada] = useState<string | null>(null);

  const [usuarioLogado, setUsuarioLogado] = useState<boolean>(false);
  const [verificandoAuth, setVerificandoAuth] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioLogado(true); // esta logado
      } else {
        setUsuarioLogado(false); // não esta logado
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


  // telas render

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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem' }}>🎉 Conta criada com sucesso! Preparando o BusGap...</h1>
      </div>
    );
  }

  if (telaAtual === 'painel') {
    if (verificandoAuth) { /* sem resposat = sem ver painel */
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f9' }}>
          <h2 style={{ color: '#111' }}>🛡️ Verificando credenciais...</h2>
        </div>
      );
    }
    if (!usuarioLogado) { /* se erro manda para login */
      setTimeout(() => setTelaAtual('login'), 0);
      return null;
    }
    /* se ta tudo ok, manda pro painel */
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