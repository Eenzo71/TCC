import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import MapaRadar from './MapaRadar';
import AdicionarDependente from './AdicionarDependente';

import { CiUser, CiBellOn } from "react-icons/ci";
import { SlMagnifier } from "react-icons/sl";

const colors = {
  bgSite: "#e8effd",
  bgNavbar: "#d6e2f9",
  primaryBlue: "#7b8ff7",
  darkBlue: "#5c6bc0",
};

interface PainelProps {
  irParaLogin: () => void;
  irParaRadar: () => void;
}

// dependentes de pó quimico

const AbaDependentes = () => {
  const [dependentes, setDependentes] = useState<any[]>([]);
  const [carregandoFilhos, setCarregandoFilhos] = useState(false);
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false);

  const empresaIdDoPai = localStorage.getItem('empresa_vinculada') || ''; 

  const buscarDependentes = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setCarregandoFilhos(true);
    try {
      const q = query(
        collection(db, 'passageiros'), 
        where('responsavel_id', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDependentes(lista);
    } catch (error) {
      console.error("Erro ao buscar dependentes:", error);
    } finally {
      setCarregandoFilhos(false);
    }
  };

  useEffect(() => {
    buscarDependentes();
  }, []);

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: colors.darkBlue, margin: 0 }}>Meus Passageiros (Filhos)</h2>
        
        {!mostrarModalAdicionar && (
          <button 
            onClick={() => setMostrarModalAdicionar(true)}
            style={{ backgroundColor: '#4caf50', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Adicionar Filho
          </button>
        )}
      </div>

      {mostrarModalAdicionar ? (
        <AdicionarDependente 
          empresaId={empresaIdDoPai} 
          onSucesso={() => {
            setMostrarModalAdicionar(false);
            buscarDependentes();
          }} 
          onCancelar={() => setMostrarModalAdicionar(false)} 
        />
      ) : (
        <>
          {carregandoFilhos ? (
            <p style={{ color: '#666' }}>Buscando passageiros vinculados à sua conta...</p>
          ) : dependentes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <p style={{ color: '#666', fontSize: '16px' }}>Você ainda não cadastrou nenhum passageiro.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {dependentes.map((filho) => (
                <div key={filho.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px' }}>{filho.nome_passageiro}</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                      🏫 {filho.dados_escolares?.instituicao} <br/> 📖 Turma: {filho.dados_escolares?.turma}
                    </p>
                  </div>
                  <div>
                    <span style={{ 
                      padding: '8px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: filho.status_conta === 'pendente' ? '#fff3cd' : '#d4edda',
                      color: filho.status_conta === 'pendente' ? '#856404' : '#155724'
                    }}>
                      {filho.status_conta === 'pendente' ? '⏳ Aguardando Frota' : '✅ Ativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// sidebar

const Sidebar = ({ irParaLogin, irParaRadar, abaAtual, setAbaAtual }: any) => {

  const handleSair = async () => {
    try {
      await signOut(auth);
      irParaLogin();
    } catch (error) {
      console.error("Erro ao deslogar", error);
    }
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>BUSGAP</div>

      <nav style={styles.menu}>
        <div style={{...styles.menuItem, backgroundColor: abaAtual === 'inicio' ? '#e8effd' : 'transparent'}} onClick={() => setAbaAtual('inicio')}>
          📊 DashBoard
        </div>

        <div style={styles.menuItem} onClick={irParaRadar}>
          📡 Radar Ao Vivo
        </div>

        <div style={{...styles.menuItem, backgroundColor: abaAtual === 'dependentes' ? '#e8effd' : 'transparent'}} onClick={() => setAbaAtual('dependentes')}>
          👨‍👧 Gerenciar Filhos
        </div>

        <div style={styles.menuItem}>🚌 Rotas</div>
        <div style={styles.menuItem}>⚙️ Configurações</div>
      </nav>

      {/* caixa de ajuda = botão de Sair */}
      <div
        style={{ ...styles.ajudaBox, backgroundColor: '#ffebee', color: '#d32f2f', cursor: 'pointer', fontWeight: 'bold' }}
        onClick={handleSair}
      >
        Sair da Conta
      </div>
    </aside>
  );
};

// CONTEÚDO PRINCIPAL

const MainContent = ({ abaAtual }: { abaAtual: string }) => {
  return (
    <main style={styles.conteudoGeral}>
      <header style={styles.navbar}>
        <div style={styles.notificacaoIcon}>
          <CiBellOn />
        </div>
        <div style={styles.perfil}>
          <CiUser />
          <span>Responsável</span>
        </div>
      </header>

      {abaAtual === 'inicio' && (
        <>
          <section style={styles.bannerContainer}>
            <div style={styles.bannerImg}></div>
          </section>

          <section style={styles.gridSistema}>
            {/* ROTAS */}
            <div style={styles.rotas}>
              <h2 style={styles.tituloSecao}>Rotas dos ônibus</h2>
              <div style={{ ...styles.cardBranco, ...styles.areaRotas }}>
                <h3>Area que vai mostra as rotas</h3>
              </div>
            </div>

            {/* MAPA */}
            <div style={styles.mapa}>
              <div style={styles.busca}>
                <input type="text" placeholder="Buscar" style={styles.buscaInput} />
                <SlMagnifier />
              </div>

              <div style={{ ...styles.cardBranco, ...styles.areaMapa, padding: '5px' }}>
                <MapaRadar />
              </div>
            </div>
          </section>

          <footer style={styles.footerNoticias}>Noticias/atualizaçoes</footer>
        </>
      )}

      {abaAtual === 'dependentes' && (
        <AbaDependentes />
      )}

    </main>
  );
};

export default function PainelResponsavel({ irParaLogin, irParaRadar }: PainelProps) {
  const [abaAtual, setAbaAtual] = useState('inicio');

  return (
    <div style={styles.container}>
      <Sidebar irParaLogin={irParaLogin} irParaRadar={irParaRadar} abaAtual={abaAtual} setAbaAtual={setAbaAtual} />
      <MainContent abaAtual={abaAtual} />
    </div>
  );
}

// css
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: colors.bgSite,
    fontFamily: "'Segoe UI', sans-serif",
    color: "#333",
  },
  sidebar: {
    width: "18%",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #cfd9e8",
    backgroundColor: '#fff'
  },
  logo: {
    height: "80px",
    backgroundColor: colors.primaryBlue,
    color: "#1a237e",
    display: "flex",
    alignItems: "center",
    paddingLeft: "20px",
    fontSize: "24px",
    fontWeight: "bold",
    borderBottom: `2px solid ${colors.darkBlue}`,
  },
  menu: {
    display: "flex",
    flexDirection: "column",
  },
  menuItem: {
    padding: "15px 20px",
    color: colors.darkBlue,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: 'background-color 0.2s',
  },
  ajudaBox: {
    margin: "auto 20px 30px",
    background: "white",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  conteudoGeral: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto" // Para a tela de dependentes conseguir rolar caso tenha muitos filhos
  },
  navbar: {
    height: "70px",
    backgroundColor: colors.bgNavbar,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0 30px",
    gap: "20px",
  },
  perfil: {
    background: "linear-gradient(90deg, #7b8ff7, #a5b4fc)",
    padding: "5px 15px",
    borderRadius: "25px",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    justifyContent: "space-between",
  },
  bannerContainer: {
    padding: "15px 20px",
    height: "180px",
  },
  bannerImg: {
    backgroundImage: "url('/images/imagemdoponto.png')",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    height: "100%",
    borderRadius: "12px",
  },
  gridSistema: {
    flex: 1,
    display: "flex",
    padding: "20px",
    gap: "20px",
  },
  rotas: {
    width: "65%",
    display: "flex",
    flexDirection: "column",
  },
  mapa: {
    width: "35%",
    display: "flex",
    flexDirection: "column",
  },
  tituloSecao: {
    color: colors.primaryBlue,
    margin: "0 0 10px 0",
    fontSize: "1.5rem",
  },
  busca: {
    background: "#d1d9e6",
    height: "45px",
    padding: "0 15px",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  buscaInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    width: "90%",
  },
  cardBranco: {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  areaRotas: {
    flex: 1,
  },
  areaMapa: {
    flex: 1,
  },
  footerNoticias: {
    background: "white",
    padding: "10px 25px",
    color: "#888",
    fontSize: "0.9rem",
  },
  notificacaoIcon: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  }
};