import React, { useState, useEffect, useRef } from 'react';
import MapaRadar from '../components/MapaRadar';
import { CiUser, CiBellOn } from "react-icons/ci";
import { SlMagnifier } from "react-icons/sl";
import { FaChevronDown, FaExternalLinkAlt } from "react-icons/fa";

const colors = { bgNavbar: "#f4f8ff", primaryBlue: "#7b8ff7", darkBlue: "#5c6bc0" };

export default function PainelAlunoMaior({ telaAtual }: { telaAtual: string }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const abrirPerfilEmNovaAba = () => {
    setMenuAberto(false);
    window.open('/?tela=perfil', '_blank');
  };

  return (
    <div style={styles.conteudoGeral}>
      <header style={styles.navbar}>
        <div style={styles.secaoBusca}>
          <div style={styles.busca}>
            <input type="text" placeholder="Buscar..." style={styles.buscaInput} />
            <SlMagnifier style={{ color: '#004181', flexShrink: 0 }} />
          </div>
        </div>

        <div style={styles.secaoLogo}>
          <img src="/images/bus_gap_sem_fundo.png" alt="Logo BusGap" style={styles.logoNavbar}/>
        </div>

        <div style={styles.secaoPerfil} ref={dropdownRef}>
          <CiBellOn size={24} style={{ cursor: 'pointer', color: '#004181', flexShrink: 0 }} />
          
          <div style={{ position: 'relative' }}>
            <div style={styles.perfil} onClick={() => setMenuAberto(!menuAberto)}>
              <CiUser size={20} />
              <span>Aluno</span>
              <FaChevronDown style={{ fontSize: '12px', marginLeft: '4px', transition: 'transform 0.2s', transform: menuAberto ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </div>

            {menuAberto && (
              <div style={styles.dropdownMenu}>
                <p style={styles.dropdownLabel}>Sua Conta</p>
                <div style={styles.miniCardPerfil} onClick={abrirPerfilEmNovaAba} title="Abrir perfil completo em nova aba">
                  <div style={styles.avatarMini}>A</div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={styles.nomeMini}>Aluno BusGap</div>
                    <div style={styles.emailMini}>aluno@busgap.com</div>
                    <span style={styles.badgeMini}>🎓 Aluno</span>
                  </div>
                  <FaExternalLinkAlt style={{ fontSize: '12px', color: '#004181', flexShrink: 0 }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={styles.areaConteudoInterno}>
        <section style={styles.bannerContainer}>
          <div style={styles.bannerImg}></div>
        </section>
        <section style={styles.gridSistema}>
          <div style={styles.rotas}>
            <h2 style={styles.tituloSecao}>Minhas Rotas</h2>
            <div style={styles.cardBranco}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h3>Mapa do ônibus</h3>
              </div>
              <div style={{ flex: 1, height: '100%' }}>
                <MapaRadar />
              </div>
            </div>
          </div>
          <div style={styles.painelLateral}>
            <h2 style={styles.tituloSecao}>Horários</h2>
            <div style={styles.cardBrancoLateral}></div>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  conteudoGeral: { display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" },
  navbar: { display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "0 25px", background: "#ffffff", height: "80px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)", width: "100%", boxSizing: "border-box", zIndex: 10 },
  secaoBusca: { display: "flex", alignItems: "center", justifyContent: "flex-start", width: "100%" },
  secaoLogo: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" },
  secaoPerfil: { display: "flex", gap: "20px", alignItems: "center", justifyContent: "flex-end", width: "100%" },
  logoNavbar: { height: "85px", objectFit: "contain" },
  perfil: { background: "linear-gradient(90deg, #56a8cb, #0052A3)", padding: "8px 18px", borderRadius: "25px", color: "white", display: "flex", alignItems: "center", gap: "10px", fontFamily: "sans-serif", fontWeight: "bold", whiteSpace: "nowrap", cursor: "pointer", userSelect: "none" },
  busca: { background: "#edf4ff", height: "42px", padding: "0 15px", border: "1.5px solid #d3e9ff", borderRadius: "8px", display: "flex", alignItems: "center", width: "100%", maxWidth: "320px" },
  buscaInput: { border: "none", background: "transparent", outline: "none", width: "100%", marginRight: "8px", fontSize: "14px" },
  areaConteudoInterno: { flex: 1, padding: "20px", overflowY: "auto" },
  bannerContainer: { height: "180px", marginBottom: "20px" },
  bannerImg: { backgroundImage: "url('/images/imagemdoponto.png')", backgroundPosition: "center", backgroundSize: "cover", borderRadius: "12px", height: "100%", border: "4px solid #b6dbff", boxShadow: "0 1px 10px rgba(0, 0, 0, 0.07)" },
  gridSistema: { display: "flex", gap: "20px", flex: 1 },
  rotas: { flex: "3", display: "flex", flexDirection: "column" },
  painelLateral: { width: "260px", flexShrink: 0, display: "flex", flexDirection: "column" },
  tituloSecao: { color: colors.primaryBlue, margin: "0 0 10px 0", fontSize: "1.5rem", fontFamily: "sans-serif" },
  cardBranco: { background: "white", borderRadius: "20px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 10px rgba(0, 0, 0, 0.18)", height: "350px", padding: "10px", overflow: "hidden" },
  cardBrancoLateral: { background: "white", borderRadius: "20px", boxShadow: "0 1px 10px rgba(0, 0, 0, 0.18)", height: "350px", padding: "15px", overflow: "hidden" },
  dropdownMenu: { position: "absolute", right: 0, top: "50px", width: "270px", backgroundColor: "#ffffff", borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", border: "1px solid #e2e8f0", padding: "14px", zIndex: 1000 },
  dropdownLabel: { margin: "0 0 8px 4px", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" },
  miniCardPerfil: { display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "12px", backgroundColor: "#f4f8ff", cursor: "pointer", transition: "background 0.2s" },
  avatarMini: { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#0052A3", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px", flexShrink: 0 },
  nomeMini: { fontWeight: "bold", fontSize: "14px", color: "#004181", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  emailMini: { fontSize: "11px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  badgeMini: { display: "inline-block", marginTop: "4px", backgroundColor: "#d3e9ff", color: "#004181", fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "8px" }
};