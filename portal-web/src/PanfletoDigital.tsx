import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface PanfletoProps {
  slugConvite: string;
  irParaCadastroResponsavel: (empresaId: string) => void;
  irParaCadastroAlunoMaior: (empresaId: string) => void;
}

export default function PanfletoDigital({ slugConvite, irParaCadastroResponsavel, irParaCadastroAlunoMaior }: PanfletoProps) {
  const [empresa, setEmpresa] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const buscarEmpresa = async () => {
      try {
        const q = query(collection(db, "empresas"), where("slug_convite", "==", slugConvite));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docEmpresa = querySnapshot.docs[0];
          setEmpresa({ id: docEmpresa.id, ...docEmpresa.data() });
        } else {
          setErro('Link de convite inválido ou empresa não encontrada.');
        }
      } catch (error) {
        console.error("Erro ao buscar convite:", error);
        setErro('Erro ao carregar o convite.');
      } finally {
        setCarregando(false);
      }
    };

    if (slugConvite) buscarEmpresa();
  }, [slugConvite]);

  if (carregando) return <div style={styles.telaInteira}>Carregando convite...</div>;
  if (erro) return <div style={styles.telaInteira}><h2 style={{ color: '#d32f2f' }}>{erro}</h2></div>;

  return (
    <div style={styles.telaInteira}>
      <div style={styles.panfleto}>
        <div style={styles.cabecalho}>
          <h3 style={{ color: '#4caf50', margin: 0 }}>Convite Oficial</h3>
          <h1 style={{ color: '#111', marginTop: '10px' }}>{empresa?.nomeFantasia}</h1>
          <p style={{ color: '#555' }}>Escolha o seu perfil abaixo para se vincular à nossa frota no BusGap.</p>
        </div>

        <div style={styles.botoesContainer}>
          {/* Pais/Responsáveis */}
          <button onClick={() => irParaCadastroResponsavel(empresa.id)} style={styles.btnPrimario}>
            👨‍👩‍👧 Cadastro de Pais / Responsáveis
            <span style={styles.subTextoBtn}>Para cadastrar seus filhos no transporte</span>
          </button>

          {/* Alunos Maiores */}
          <button onClick={() => irParaCadastroAlunoMaior(empresa.id)} style={styles.btnSecundario}>
            🎓 Cadastro de Aluno (+18)
            <span style={styles.subTextoBtn}>Para universitários ou maiores de idade</span>
          </button>

          <hr style={{ width: '100%', border: '1px solid #eee', margin: '20px 0' }} />

          {/* Baixar o App */}
          <button onClick={() => alert("Redirecionando para a Play Store...")} style={styles.btnApp}>
            📱 Baixar o Aplicativo
            <span style={styles.subTextoBtn}>Vou gozar alguem coloca um texto que faz sentido ai</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  telaInteira: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f4f9', fontFamily: 'sans-serif' },
  panfleto: { width: '450px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', overflow: 'hidden', textAlign: 'center' },
  cabecalho: { padding: '30px', backgroundColor: '#fafafa', borderBottom: '1px solid #eaeaea' },
  botoesContainer: { padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' },
  btnPrimario: { backgroundColor: '#111', color: '#fff', padding: '15px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  btnSecundario: { backgroundColor: '#fff', color: '#111', padding: '15px', border: '2px solid #111', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  btnApp: { backgroundColor: '#e3f2fd', color: '#1565c0', padding: '15px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  subTextoBtn: { fontSize: '12px', fontWeight: 'normal', opacity: 0.8, marginTop: '5px' }
};