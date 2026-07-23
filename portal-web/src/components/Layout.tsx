import React from 'react';
import { signOut } from 'firebase/auth';
import type { UserProfile, Tela } from '../App'; 
import { auth } from '../firebaseConfig';

interface LayoutProps {
  userData: UserProfile;
  telaAtual: Tela; 
  setTelaAtual: (tela: Tela) => void;
  children: React.ReactNode; 
}

export default function Layout({ userData, telaAtual, setTelaAtual, children }: LayoutProps) {
  
  const handleLogout = async () => {
    await signOut(auth);
    setTelaAtual('login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f4f4f9', overflow: 'hidden' }}>
      
      <aside style={{ width: '250px', backgroundColor: '#1a237e', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 5px 0' }}>BusGap</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#ccc' }}>Olá, {userData.nome}</p>
          <span style={{ fontSize: '11px', backgroundColor: '#4caf50', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
            {userData.tipo.toUpperCase().replace('_', ' ')}
          </span>
        </div>

        <nav style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {userData.tipo !== 'dependente' && (
            <button onClick={() => setTelaAtual('painel')} style={navStyle(telaAtual === 'painel')}>
              🏠 Meu Painel
            </button>
          )}
          <button onClick={() => setTelaAtual('radar')} style={navStyle(telaAtual === 'radar')}>
            📍 Radar GPS
          </button>
          {userData.tipo === 'responsavel' && (
            <button onClick={() => setTelaAtual('gerenciar-filhos')} style={navStyle(telaAtual === 'gerenciar-filhos')}>
              👥 Meus Dependentes
            </button>
          )}
        </nav>

        <div style={{ padding: '20px' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Sair do Sistema
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

const navStyle = (ativo: boolean): React.CSSProperties => ({
  textAlign: 'left',
  padding: '12px 15px',
  backgroundColor: ativo ? 'rgba(255,255,255,0.15)' : 'transparent',
  color: ativo ? '#fff' : 'rgba(255,255,255,0.7)',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: ativo ? 'bold' : 'normal',
  transition: 'all 0.2s'
});