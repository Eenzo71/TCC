import React from 'react';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import MapaRadar from './MapaRadar';

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

// barra lateral
const Sidebar = ({ irParaLogin, irParaRadar }: PainelProps) => {

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
        <div style={styles.menuItem}>📊 DashBoard</div>

        {/* radar */}
        <div style={styles.menuItem} onClick={irParaRadar}>
          📡 Radar Ao Vivo
        </div>

        <div style={styles.menuItem}>🚌 Rotas</div>
        <div style={styles.menuItem}>alguma coisa </div>
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

// conteudo principal
const MainContent = () => {
  return (
    <main style={styles.conteudoGeral}>
      <header style={styles.navbar}>
        <div style={styles.notificacaoIcon}>
          <CiBellOn />
        </div>
        <div style={styles.perfil}>
          <CiUser />
          <span>gordin da xj</span>
        </div>
      </header>

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
    </main>
  );
};

export default function Painel({ irParaLogin, irParaRadar }: PainelProps) {
  return (
    <div style={styles.container}>
      <Sidebar irParaLogin={irParaLogin} irParaRadar={irParaRadar} />
      <MainContent />
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
  /* barrinha da lateral*/
  sidebar: {
    width: "18%",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #cfd9e8",
  },
  /* BUSGAP seco seco seco */
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
  },
  ajudaBox: {
    margin: "auto 20px 30px",
    background: "white",
    height: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    borderRadius: "4px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  /* Main */
  conteudoGeral: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  /* Barrinha de cima */
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
  perfilImg: {
    borderRadius: "50%",
    width: "25px",
    height: "25px",
  },
  /* Banner ou imagenzinha top */
  bannerContainer: {
    padding: "15px 20px",
    height: "180px",
  },
  bannerImg: {
    backgroundImage: "url('/images/imagemdoponto.png')",//Coloca a imagem que a empresa quiser usar
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    height: "100%",
    borderRadius: "12px",
  },
  /* Grid de Conteúdo */
  gridSistema: {
    flex: 1,
    display: "flex",
    padding: "20px",
    gap: "20px",
  },
  /* ROTAS */
  rotas: {
    width: "65%",
    display: "flex",
    flexDirection: "column",
  },
  /* MAPA */
  mapa: {
    width: "35%",
    display: "flex",
    flexDirection: "column",
  },
  /*Titulo que aparece em cima das rotas */
  tituloSecao: {
    color: colors.primaryBlue,
    margin: "0 0 10px 0",
    fontSize: "1.5rem",
  },
  /* Area de busca em cima do mapa */
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
  buscaImg: {
    width: "20px",
    height: "20px",
    cursor: "pointer",
  },
  /* Area das rotas e do mapa */
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
  /* As noticia que aparece la embaixo */
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
  },
  iconNotifImg: {
    width: "24px",
    height: "24px",
  }
};