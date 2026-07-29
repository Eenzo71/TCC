import React, { useEffect, useState } from 'react';
import { auth } from './firebaseConfig';

import PainelResponsavel from './pages/PainelResponsavel';
import PainelAlunoMaior from './pages/PainelAlunoMaior';

interface PainelProps {
  irParaLogin: () => void;
  irParaRadar: () => void;
}

export default function Painel({ irParaLogin, irParaRadar }: PainelProps) {
  const [tipoPerfil, setTipoPerfil] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const verificarTipoDeUsuario = async () => {
      const user = auth.currentUser;
      
      if (user) {
        try {
          const resposta = await fetch(`http://localhost:3000/api/passageiros/perfil/${user.uid}`);
          const dados = await resposta.json();

          if (resposta.ok && dados.valido) {
            setTipoPerfil(dados.tipo);
          } else {
            console.error("Erro do servidor:", dados.erro);
          }
        } catch (error) {
          console.error("Erro de rede ao buscar perfil:", error);
        }
      }
      setCarregando(false);
    };

    verificarTipoDeUsuario();
  }, []);

  if (carregando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f9' }}>
        <h2 style={{ color: '#1a237e' }}>Identificando seu perfil...</h2>
      </div>
    );
  }


  if (tipoPerfil === 'responsavel') {
    return <PainelResponsavel irParaLogin={irParaLogin} irParaRadar={irParaRadar} />;
  }

  if (tipoPerfil === 'aluno_maior') {
    return <PainelAlunoMaior irParaLogin={irParaLogin} irParaRadar={irParaRadar} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
      <h2 style={{ color: '#d32f2f' }}>Erro ao carregar o perfil.</h2>
      <p style={{ color: '#666' }}>Não conseguimos identificar sua conta no banco de dados.</p>
      <button 
        onClick={() => { auth.signOut(); irParaLogin(); }}
        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc' }}
      >
        Sair e tentar novamente
      </button>
    </div>
  );
}