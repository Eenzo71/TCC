import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import type { UserProfile, Tela } from '../App';
import { auth } from '../firebaseConfig';
import '../layout.css';
import { GoHomeFill } from "react-icons/go";
import { TbGps } from "react-icons/tb";
import { MdPeople, MdLogout } from "react-icons/md";
import { IoIosArrowBack } from "react-icons/io";
import { IoTicket } from "react-icons/io5";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    setTelaAtual('login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div className="layout">
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <button className="BtnOpenCloes" onClick={toggleSidebar}>
          <IoIosArrowBack size={20} className="arrowIcon" />
        </button>
    
        <div className="sidebarHeader">
          <img className="img-logo" src="/images/Bbus.png" alt="Logo" />
          <h2 className="logo">BusGap</h2>
        </div>

        <nav className="nav">
          {userData.tipo !== 'dependente' && (
            <button
              onClick={() => setTelaAtual('painel')}
              className="navStyle"
            >
              <GoHomeFill className="icons" />
              <span className="navText">Meu Painel</span>
            </button>
          )}

          <button
            onClick={() => setTelaAtual('radar')}
            className="navStyle"
          >
            <TbGps className="icons" />
            <span className="navText">Radar GPS</span>
          </button>

          <button
            onClick={() => setTelaAtual('radar')}
            className="navStyle"
          >
            <IoTicket className="icons" />
            <span className="navText">Passagens</span>
          </button>

          {userData.tipo === 'responsavel' && (
            <button
              onClick={() => setTelaAtual('gerenciar-filhos')}
              className="navStyle depender"
            >
              <MdPeople className="icons" />
              <span className="navText">Meus Dependentes</span>
            </button>
          )}
        </nav>

        <div className="logoutContainer">
          <button
            onClick={handleLogout}
            className="btnLogout"
          >
            <MdLogout className="icons logoutIcon" />
            <span className="navText">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      <div className="contentWrapper">
        <main className="mainContent">
          {children}
        </main>
      </div>
    </div>
  );
}