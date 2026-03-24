import React, { useEffect, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface PainelEmpresaProps {
  irParaLogin: () => void;
  irParaPerfil: () => void;
}

export default function PainelEmpresa({ irParaLogin, irParaPerfil }: PainelEmpresaProps) {
  const [empresa, setEmpresa] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState<number>(60);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "empresas", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const dados = docSnap.data();
          setEmpresa({ id: docSnap.id, ...dados });

          // A MÁGICA DA MATEMÁTICA DOS 60 DIAS (KYC/COMPLIANCE)
          if (dados.data_cadastro && !dados.perfil_completo) {
            const dataCadastro = new Date(dados.data_cadastro);
            const hoje = new Date();
            // Calcula a diferença em dias
            const diffTime = hoje.getTime() - dataCadastro.getTime();
            const diasPassados = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            setDiasRestantes(60 - diasPassados);
          }
        }
      } else {
        irParaLogin();
      }
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  const copiarLink = () => {
    if (empresa && empresa.slug_convite) {
      const linkBase = `http://localhost:5173/?convite=${empresa.slug_convite}`;
      navigator.clipboard.writeText(linkBase);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 3000);
    }
  };

  const handleSair = async () => {
    await auth.signOut();
    irParaLogin();
  };

  if (carregando) return <div style={styles.telaInteira}><p>Carregando sistema...</p></div>;

  // Se o cara demorou mais de 60 dias e não completou o perfil, a conta fica BLOQUEADA!
  const contaBloqueada = !empresa?.perfil_completo && diasRestantes <= 0;

  return (
    <div style={styles.telaInteira}>
      
      {/* O BANNER DE AVISO (Aparece se o perfil estiver incompleto) */}
      {!empresa?.perfil_completo && !contaBloqueada && (
        <div style={styles.bannerAviso}>
          ⚠️ <strong>Atenção:</strong> Seu perfil empresarial está incompleto. Você tem <strong>{diasRestantes} dias</strong> para enviar seus documentos antes que o link de convite seja bloqueado.
          <button onClick={irParaPerfil} style={styles.btnSecundario}>⚙️ Configurações</button>
        </div>
      )}

      {/* O BANNER DE BLOQUEIO (Vermelhão) */}
      {contaBloqueada && (
        <div style={styles.bannerBloqueado}>
          ⛔ <strong>Conta Restrita:</strong> O prazo para envio de documentos expirou. O cadastro de novos alunos está suspenso.
          <button style={styles.btnBannerBloqueado}>Enviar Documentos</button>
        </div>
      )}

      <div style={styles.painelCard}>
        <h1 style={{ color: '#111', fontSize: '24px', marginBottom: '5px' }}>🏢 Painel de Controle</h1>
        <h2 style={{ color: '#4caf50', margin: '0 0 20px 0' }}>{empresa?.nomeFantasia}</h2>
        <p style={{ color: '#777', fontSize: '12px', marginTop: '-15px', marginBottom: '30px' }}>
          Razão Social: {empresa?.razaoSocial}
        </p>

        {/* SE A CONTA TIVER BLOQUEADA, ESCONDE O PANFLETO */}
        {!contaBloqueada ? (
          <div style={styles.cardConvite}>
            <h3 style={{ marginBottom: '10px' }}>📄 Panfleto Digital</h3>
            <p style={{ color: '#555', fontSize: '14px', marginBottom: '15px' }}>
              Compartilhe este link com os pais e alunos. Quem se cadastrar por ele será vinculado automaticamente à sua frota.
            </p>
            
            <div style={styles.caixaLink}>
              <span style={{ color: '#888' }}>http://localhost:5173/?convite=</span>
              <span style={{ fontWeight: 'bold', color: '#111' }}>{empresa?.slug_convite}</span>
            </div>

            <button onClick={copiarLink} style={styles.btnCopiar}>
              {linkCopiado ? '✅ Link Copiado!' : '🔗 Copiar Link de Convite'}
            </button>
          </div>
        ) : (
          <div style={{ padding: '30px', backgroundColor: '#ffebee', borderRadius: '10px', marginBottom: '30px', border: '1px dashed #d32f2f' }}>
            <h3 style={{ color: '#d32f2f' }}>Acesso ao Panfleto Suspenso</h3>
            <p style={{ color: '#555', fontSize: '14px' }}>Complete a verificação da sua empresa para voltar a recrutar alunos pelo BusGap.</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button style={styles.btnSecundario}>⚙️ Configurações</button>
          <button onClick={handleSair} style={styles.btnSair}>Sair do Sistema</button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  telaInteira: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f4f9', fontFamily: 'sans-serif' },
  bannerAviso: { width: '100%', backgroundColor: '#fff9c4', color: '#f57f17', padding: '15px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  btnBanner: { backgroundColor: '#f57f17', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  bannerBloqueado: { width: '100%', backgroundColor: '#d32f2f', color: '#fff', padding: '15px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  btnBannerBloqueado: { backgroundColor: '#fff', color: '#d32f2f', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  painelCard: { width: '600px', padding: '40px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center', marginTop: '40px' },
  cardConvite: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '10px', border: '1px dashed #ccc', marginBottom: '30px' },
  caixaLink: { backgroundColor: '#eaeaea', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontFamily: 'monospace', fontSize: '15px', overflowX: 'auto', whiteSpace: 'nowrap' },
  btnCopiar: { width: '100%', padding: '12px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  btnSecundario: { padding: '10px 20px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  btnSair: { padding: '10px 20px', backgroundColor: 'transparent', color: '#d32f2f', border: '1px solid #d32f2f', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};