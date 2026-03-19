import React from 'react';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';

interface PainelProps {
  irParaLogin: () => void;
}

export default function Painel({ irParaLogin }: PainelProps) {
  const handleLogout = () => {
    signOut(auth).then(() => {
      irParaLogin();
    }).catch((error) => {
      console.error("Erro ao sair:", error);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', backgroundColor: '#fff3e0' }}>
      <h1 style={{ color: '#e65100', fontSize: '3rem', marginTop: '100px' }}>
        ia la logo kkkkkkkk
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#555', marginTop: '20px' }}>
        No futuro, aqui vai ficar o painel administrativo do BusGap!
      </p>
      <button 
        onClick={handleLogout}
        style={{ marginTop: '50px', padding: '12px 30px', fontSize: '1rem', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Sair do Sistema
      </button>
    </div>
  );
}