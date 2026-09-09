import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

import Cadastro from './pages/cadastro/Cadastro';
import CadastroAlunoMaior from './pages/cadastro/CadastroAlunoMaior';
import PanfletoDigital from './pages/cadastro/PanfletoDigital';
import Login from './pages/Login';
import Layout from './components/Layout'; 
import PainelResponsavel from './pages/PainelResponsavel';
import PainelAlunoMaior from './pages/PainelAlunoMaior';
import TelaRadar from './pages/TelaRadar';
import Empresa from './pages/Empresa';
import Passagens from './pages/Passagens';
import PerfilPages from './pages/PerfilPages';
import './style.css';

// Definição e exportação de tipos para compartilhamento na aplicação
export type Tela = 
  | 'login' 
  | 'cadastro' 
  | 'sucesso' 
  | 'painel' 
  | 'radar' 
  | 'panfleto' 
  | 'cadastro-maior' 
  | 'gerenciar-filhos' 
  | 'Passagens' 
  | 'Empresa' 
  | 'perfil';

export interface UserProfile {
  uid: string;
  email: string;
  tipo: 'responsavel' | 'aluno_maior' | 'dependente' | 'empresa';
  nome: string;
}

export default function App() {
  const [telaAtual, setTelaAtual] = useState<Tela>('login');
  const [slugConvite, setSlugConvite] = useState<string | null>(null);
  const [empresaVinculada, setEmpresaVinculada] = useState<string | null>(null);
  const [verificandoAuth, setVerificandoAuth] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const resposta = await fetch(`http://localhost:3000/api/passageiros/perfil/${user.uid}`);
          let tipoUsuario = 'dependente'; 

          if (resposta.ok) {
            const dados = await resposta.json();
            if (dados.valido) tipoUsuario = dados.tipo;
          }

          setUserData({ 
            uid: user.uid, 
            email: user.email!, 
            tipo: tipoUsuario as any, 
            nome: user.displayName || 'Usuário' 
          });

          setTelaAtual((telaAnterior: Tela) => telaAnterior === 'login' ? 'painel' : telaAnterior);
        } catch (error) {
          console.error('❌ Erro ao consultar o Back-end:', error);
        }
      } else {
        setUserData(null);
        setTelaAtual((telaAnterior: Tela) => (['painel', 'radar', 'gerenciar-filhos', 'Passagens', 'Empresa', 'perfil'].includes(telaAnterior) ? 'login' : telaAnterior));
      }
      setVerificandoAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const telaNaUrl = params.get('tela') as Tela | null;

    if (telaNaUrl === 'perfil') {
      setTelaAtual('perfil');
    }

    const conviteNaUrl = params.get('convite');
    if (conviteNaUrl) { 
      setSlugConvite(conviteNaUrl); 
      setTelaAtual('panfleto'); 
    }

    const empresaNaUrl = params.get('empresa');
    if (empresaNaUrl) {
      setEmpresaVinculada(empresaNaUrl);
    }
  }, []);

  useEffect(() => {
    if (telaAtual === 'sucesso') {
      const timer = setTimeout(() => setTelaAtual('painel'), 3000);
      return () => clearTimeout(timer);
    }
  }, [telaAtual]);

  // ROTAS PÚBLICAS
  if (verificandoAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#e8effd' }}>
        <h2 style={{ color: '#1a237e' }}>🛡️ Verificando sessão...</h2>
      </div>
    );
  }

  if (telaAtual === 'perfil') return <PerfilPages />;
  if (telaAtual === 'login') return <Login irParaPanfleto={() => setTelaAtual('panfleto')} irParaPainel={() => setTelaAtual('painel')} />;
  if (telaAtual === 'cadastro') return <Cadastro irParaLogin={() => setTelaAtual('login')} irParaSucesso={() => setTelaAtual('sucesso')} empresaId={empresaVinculada} />;
  if (telaAtual === 'cadastro-maior') return <CadastroAlunoMaior irParaPainel={() => setTelaAtual('painel')} irParaVoltar={() => setTelaAtual('panfleto')} />;
  if (telaAtual === 'panfleto') return <PanfletoDigital slugConvite={slugConvite || ''} irParaCadastroResponsavel={() => setTelaAtual('cadastro')} irParaCadastroAlunoMaior={() => setTelaAtual('cadastro-maior')} />;
  if (telaAtual === 'sucesso') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111' }}>
        <h1 style={{ color: '#fff' }}>🎉 Preparando o BusGap...</h1>
      </div>
    );
  }

  // ROTAS PRIVADAS
  if (!userData) {
    return <Login irParaPanfleto={() => setTelaAtual('panfleto')} irParaPainel={() => setTelaAtual('painel')} />;
  }

  return (
    <Layout userData={userData} telaAtual={telaAtual} setTelaAtual={setTelaAtual}>
      {telaAtual === 'painel' && userData.tipo === 'responsavel' && <PainelResponsavel telaAtual={telaAtual} />}
      {telaAtual === 'painel' && userData.tipo === 'aluno_maior' && <PainelAlunoMaior telaAtual={telaAtual} />}
      {telaAtual === 'painel' && userData.tipo === 'dependente' && <TelaRadar />}
      
      {telaAtual === 'gerenciar-filhos' && userData.tipo === 'responsavel' && <PainelResponsavel telaAtual={telaAtual} />}
      {telaAtual === 'radar' && <TelaRadar />}
      {telaAtual === 'Passagens' && <Passagens />}
      {telaAtual === 'Empresa' && <Empresa />}
    </Layout>
  );
}