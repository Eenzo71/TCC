import React from 'react';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';

export default function Painel({ irParaLogin }) {
  
  // função pra quando deslogar no site ja deslogar no firebase de forma segura
  const handleLogout = () => {
    signOut(auth).then(() => {
      // volta para pagina principal dps de deslogar... eu acho
      irParaLogin();
    }).catch((error) => {
      console.error("Erro ao sair:", error);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', backgroundColor: '#fff3e0' }}>
      
      {/* temp*/}
      <h1 style={{ color: '#e65100', fontSize: '3rem', marginTop: '100px' }}>
        ia la logo kkkkkkkk
      </h1>
      
      <p style={{ fontSize: '1.2rem', color: '#555', marginTop: '20px' }}>
        No futuro, aqui vai ficar o painel administrativo do BusFlow!
      </p>

      {/* sair funcional */}
      <button 
        onClick={handleLogout}
        style={{ 
          marginTop: '50px', 
          padding: '12px 30px', 
          fontSize: '1rem',
          backgroundColor: '#d32f2f', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Sair
      </button>

    </div>
  );
}