import React from 'react';
import { signOut } from 'firebase/auth';
import type { UserProfile, Tela } from '../App';
import { auth } from '../firebaseConfig';
import '../layout.css';
import { GoHomeFill } from "react-icons/go";
import { TbGps } from "react-icons/tb";
import { MdPeople } from "react-icons/md";
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

  const handleLogout = async () => {
    await signOut(auth);
    setTelaAtual('login');
  };

  return (
    <div className="layout">

      <aside className="sidebar">
          <button className="BtnOpenCloes">
             <IoIosArrowBack  size={20}/>
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
              <GoHomeFill className="icons"/>Meu Painel
            </button>
          )}
          

          <button
            onClick={() => setTelaAtual('radar')}
            className="navStyle"
          >
            <TbGps className="icons" /> Radar GPS
          </button>

           <button
            onClick={() => setTelaAtual('radar')}
            className="navStyle"
          >
            <IoTicket className="icons" /> Passagens
          </button>

          

          {userData.tipo === 'responsavel' && (
            <button
              onClick={() => setTelaAtual('gerenciar-filhos')}
              className="navStyle depender"
            >
              <MdPeople className="icons" /> Meus Dependentes
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