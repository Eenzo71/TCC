import React from 'react';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';

interface PainelProps {
  irParaLogin: () => void;
  irParaRadar: () => void; // A nova rota entrando aqui!
}

export default function Painel({ irParaLogin, irParaRadar }: PainelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f4f4f9' }}>
      
      <h1 style={{ color: '#111', marginBottom: '10px' }}>Painel Administrativo</h1>
      <p style={{ color: '#555', marginBottom: '30px' }}>Bem-vindo ao centro de comando do BusGap.</p>

      <div style={{ display: 'flex', gap: '20px' }}>

        {/* BOTÃO DE SAIR */}
        <button 
          onClick={irParaLogin} 
          style={{ padding: '15px 30px', backgroundColor: '#fff', color: '#d32f2f', border: '2px solid #d32f2f', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Sair da Conta
        </button>
      </div>

    </div>
  );
}