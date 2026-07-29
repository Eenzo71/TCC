import React from 'react';
import { signOut } from 'firebase/auth';
import type { UserProfile, Tela } from '../App';
import { auth } from '../firebaseConfig';
import '../layout.css';

interface LayoutProps {
  userData: UserProfile;
  telaAtual: Tela;
  setTelaAtual: (tela: Tela) => void;
  children: React.ReactNode;
}

export default function Layout({
  userData,
  telaAtual,
  setTelaAtual,
  children
}: LayoutProps) {

  const handleLogout = async () => {
    await signOut(auth);
    setTelaAtual('login');
  };

  return (
    <div className="layout">

      <aside className="sidebar">

        <div className="sidebarHeader">
          <h2 className="logo">BusGap</h2>

          <p className="usuario">
            Olá, {userData.nome}
          </p>

          <span className="tipoUsuario">
            {userData.tipo.toUpperCase().replace('_', ' ')}
          </span>
        </div>

        <nav className="nav">

          {userData.tipo !== 'dependente' && (
            <button
              onClick={() => setTelaAtual('painel')}
              className="navStyle"
            >
              🏠 Meu Painel
            </button>
          )}

          <button
            onClick={() => setTelaAtual('radar')}
            className="navStyle"
          >
            📍 Radar GPS
          </button>

          {userData.tipo === 'responsavel' && (
            <button
              onClick={() => setTelaAtual('gerenciar-filhos')}
              className="navStyle depender"
            >
              👥 Meus Dependentes
            </button>
          )}

        </nav>

        <div className="logoutContainer">
          <button
            onClick={handleLogout}
            className="btnLogout"
          >
            Sair do Sistema
          </button>
        </div>

      </aside>

      <main className="mainContent">
        {children}
      </main>

    </div>
  );
}