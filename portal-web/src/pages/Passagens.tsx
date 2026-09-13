import React from 'react';
import MapaRadar from '../components/MapaRadar';
import { CiUser, CiBellOn } from "react-icons/ci";
import { SlMagnifier } from "react-icons/sl";

const colors = { bgNavbar: "#ffffff", primaryBlue: "#7b8ff7" };

export default function PainelAlunoMaior() {
  return (
    <div style={styles.conteudoGeral}>
      <header style={styles.navbar}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <CiBellOn size={24} style={{ cursor: 'pointer' }} />
          <div style={styles.perfil}><CiUser size={20} /><span>Aluno</span></div>
        </div>
      </header>

      <section style={styles.bannerContainer}>
        <div style={styles.bannerImg}></div>
      </section>

      <section style={styles.gridSistema}>
        <div style={styles.rotas}>
          <h2 style={styles.tituloSecao}>Rotas dos ônibus</h2>
          <div style={{ ...styles.cardBranco, flex: 1 }}>
            <h3>Area que vai mostra as rotas</h3>
          </div>
        </div>

        <div style={styles.mapa}>
          <div style={styles.busca}>
            <input type="text" placeholder="Buscar" style={styles.buscaInput} />
            <SlMagnifier />
          </div>
          <div style={{ ...styles.cardBranco, flex: 1, padding: '5px' }}>
            <MapaRadar />
          </div>
        </div>
      </section>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  conteudoGeral: { display: "flex", flexDirection: "column", height: "100%" },
  navbar: { height: "70px", backgroundColor: colors.bgNavbar, display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "0 30px", borderRadius: "12px", marginBottom: "20px" },
  perfil: { background: "linear-gradient(90deg, #7b8ff7, #ffffff)", padding: "8px 15px", borderRadius: "25px", color: "white", display: "flex", alignItems: "center", gap: "10px" },
  bannerContainer: { height: "180px", marginBottom: "20px" },
  bannerImg: { backgroundImage: "url('/images/imagemdoponto.png')", backgroundPosition: "center", backgroundSize: "cover", borderRadius: "12px", height: "100%" },
  gridSistema: { display: "flex", gap: "20px", flex: 1 },
  rotas: { width: "65%", display: "flex", flexDirection: "column" },
  mapa: { width: "35%", display: "flex", flexDirection: "column" },
  tituloSecao: { color: colors.primaryBlue, margin: "0 0 10px 0", fontSize: "1.5rem" },
  busca: { background: "#d1d9e6", height: "45px", padding: "0 15px", borderRadius: "5px", display: "flex", alignItems: "center", marginBottom: "10px" },
  buscaInput: { border: "none", background: "transparent", outline: "none", width: "90%" },
  cardBranco: { background: "white", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.04)" }
};