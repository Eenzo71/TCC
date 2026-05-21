import React, { useState, useEffect } from 'react';
import CadastroEmpresa from './CadastroEmpresa';
import PainelEmpresa from './PainelEmpresa';
import PerfilEmpresa from './PerfilEmpresa';
import CompletarPerfil from './CompletarPerfil';
import LoginEmpresa from './LoginEmpresa';
import maparadar from './MapaRadar';

import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

type Tela = 'login' | 'cadastro' | 'painel' | 'perfil' | 'completar' | 'maparadar';

export default function App() {
  const [telaAtual, setTelaAtual] = useState<Tela>('login');

  const [usuarioLogado, setUsuarioLogado] = useState<boolean>(false);
  const [verificandoAuth, setVerificandoAuth] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioLogado(true);
        if (sessionStorage.getItem('esperando2FA') !== 'true') {
          if (telaAtual === 'login' || telaAtual === 'cadastro') {
            setTelaAtual('painel');
          }
        }
      } else {
        setUsuarioLogado(false);
      }
      setVerificandoAuth(false);
    });

    return () => unsubscribe();
  }, [telaAtual]);

  // public telas

  if (telaAtual === 'cadastro') {
    return (
      <CadastroEmpresa
        irParaLogin={() => setTelaAtual('login')}
        irParaPainel={() => setTelaAtual('painel')}
      />
    );
  }

  if (telaAtual === 'login') {
    return (
      <LoginEmpresa 
        irParaCadastro={() => setTelaAtual('cadastro')} 
        irParaPainel={() => setTelaAtual('painel')} 
      />
    );
  }

  // cutcine enquanto firebase processa a autenticação do usuário
  if (verificandoAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f9' }}>
        <h2 style={{ color: '#111' }}>🛡️ Verificando credenciais corporativas...</h2>
      </div>
    );
  }
 // caso não esteja logado manda pra tela de login
  if (!usuarioLogado) {
    setTimeout(() => setTelaAtual('login'), 0); // setTimeout evita erro visual no React
    return null;
  }

  // private telas
  if (telaAtual === 'painel') {
    return (
      <PainelEmpresa
        irParaLogin={() => setTelaAtual('login')}
        irParaPerfil={() => setTelaAtual('perfil')}
      />
    );
  }

  if (telaAtual === 'perfil') {
    return (
      <PerfilEmpresa 
        irParaPainel={() => setTelaAtual('painel')} 
        irParaCompletar={() => setTelaAtual('completar')}
      />
    );
  }

  if (telaAtual === 'completar') {
    return <CompletarPerfil irParaPerfil={() => setTelaAtual('perfil')} />;
  }

  return null;
}