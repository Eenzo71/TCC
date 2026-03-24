import React, { useState } from 'react';
import CadastroEmpresa from './CadastroEmpresa';
import PainelEmpresa from './PainelEmpresa';
import PerfilEmpresa from './PerfilEmpresa';
import CompletarPerfil from './CompletarPerfil';


// As rotas do portal da empresa
type Tela = 'login' | 'cadastro' | 'painel' | 'perfil' | 'completar';

export default function App() {
  // Já vamos começar na tela de cadastro pra você testar a LingLing Busões direto!
  const [telaAtual, setTelaAtual] = useState<Tela>('cadastro');

  // --- ROTA DE CADASTRO ---
  if (telaAtual === 'cadastro') {
    return (
      <CadastroEmpresa
        irParaLogin={() => setTelaAtual('login')}
        irParaPainel={() => setTelaAtual('painel')}
      />
    );
  }

  // --- ROTA DO PAINEL (Provisória) ---
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

  // --- ROTA DE LOGIN (Provisória) ---
  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>BusGap - Portal das Empresas</h1>
      <p style={styles.texto}>Gerencie sua frota e seus passageiros.</p>

      {/* Botão falso só pra fazer volume por enquanto */}
      <button style={styles.btnEntrar}>Entrar no Sistema</button>

      <p style={styles.texto}>Ainda não tem conta?</p>
      <button onClick={() => setTelaAtual('cadastro')} style={styles.btnCadastrar}>
        Cadastrar Nova Empresa
      </button>
    </div>
  );
}

// Estilização básica pra não ficar cego testando
const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f4f4f9', fontFamily: 'sans-serif' },
  titulo: { color: '#111', marginBottom: '10px' },
  texto: { color: '#555', marginBottom: '20px' },
  btnEntrar: { padding: '12px 24px', marginBottom: '30px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '8px', fontSize: '16px' },
  btnCadastrar: { padding: '12px 24px', cursor: 'pointer', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' },
  btnSair: { padding: '10px 20px', cursor: 'pointer', backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '20px' }
};