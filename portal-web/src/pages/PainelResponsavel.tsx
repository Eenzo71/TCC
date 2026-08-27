import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import MapaRadar from '../components/MapaRadar';
import AdicionarDependente from './AdicionarDependente';
import { CiUser, CiBellOn } from "react-icons/ci";
import { SlMagnifier } from "react-icons/sl";

const colors = { bgNavbar: "#f4f8ff", primaryBlue: "#7b8ff7", darkBlue: "#5c6bc0" };

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
      const q = query(collection(db, 'passageiros'), where('responsavel_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      setDependentes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { 
      console.error("Erro ao buscar dependentes:", error); 
    } 
    finally { 
      setCarregandoFilhos(false); 
    }
  };

  useEffect(() => { buscarDependentes(); }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: colors.darkBlue, margin: 0 }}>Meus Passageiros (Filhos)</h2>
        {!mostrarModalAdicionar && (
          <button onClick={() => setMostrarModalAdicionar(true)} style={{ backgroundColor: '#00ff08', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Adicionar Filho
          </button>
        )}
      </div>

      {mostrarModalAdicionar ? (
        <AdicionarDependente empresaId={empresaIdDoPai} onSucesso={() => { setMostrarModalAdicionar(false); buscarDependentes(); }} onCancelar={() => setMostrarModalAdicionar(false)} />
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {carregandoFilhos ? <p>Buscando passageiros...</p> : dependentes.length === 0 ? <p>Você ainda não cadastrou nenhum passageiro.</p> : dependentes.map((filho) => (
            <div key={filho.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{filho.nome_passageiro}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>🏫 {filho.dados_escolares?.instituicao} | 📖 {filho.dados_escolares?.turma}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function PainelResponsavel({ telaAtual }: { telaAtual: string }) {
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

        <div style={styles.secaoPerfil}>
          <CiBellOn size={24} style={{ cursor: 'pointer', color: '#004181', flexShrink: 0 }} />
          <div style={styles.perfil}>
            <CiUser size={20} />
            <span>Responsável</span>
          </div>
        </div>
      </header>

      <div style={styles.areaConteudoInterno}>
        {telaAtual === 'painel' && (
          <>
            <section style={styles.bannerContainer}>
              <div style={styles.bannerImg}></div>
            </section>
            <section style={styles.gridSistema}>
              <div style={styles.rotas}>
                <h2 style={styles.tituloSecao}>Rotas dos ônibus</h2>
                <div style={styles.cardBranco}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <h3>Rotas Aqui</h3>
                  </div>
                  <div style={{ flex: 1, height: '100%' }}>
                    <MapaRadar />
                  </div>
                </div>
              </div>
              <div style={styles.painelLateral}>
                <h2 style={styles.tituloSecao}>Informações</h2>
                <div style={styles.cardBrancoLateral}>
                </div>
              </div>
            </section>
          </>
        )}

        {telaAtual === 'gerenciar-filhos' && <AbaDependentes />}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  conteudoGeral: { display: "flex", flexDirection: "column", height: "100%", width: "100%",overflow: "hidden" },
  navbar: { display: "grid",gridTemplateColumns: "1fr auto 1fr",alignItems: "center", padding: "0 25px", background: "#ffffff", height: "80px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)", width: "100%",boxSizing: "border-box",zIndex: 10},
  secaoBusca: {display: "flex",alignItems: "center",justifyContent: "flex-start",width: "100%"},
  secaoLogo: {display: "flex",alignItems: "center",justifyContent: "center",height: "100%"},
  secaoPerfil: { display: "flex", gap: "20px", alignItems: "center",justifyContent: "flex-end",width: "100%"},
  logoNavbar: { height: "85px", objectFit: "contain" },
  perfil: { background: "linear-gradient(90deg, #56a8cb, #0052A3)", padding: "8px 18px", borderRadius: "25px", color: "white", display: "flex", alignItems: "center", gap: "10px", fontFamily: "sans-serif",fontWeight: "bold",whiteSpace: "nowrap"},
  busca: { background: "#edf4ff", height: "42px", padding: "0 15px", border: "1.5px solid #d3e9ff", borderRadius: "8px", display: "flex", alignItems: "center", width: "100%",maxWidth: "320px"},
  buscaInput: { border: "none", background: "transparent", outline: "none",width: "100%",marginRight: "8px",fontSize: "14px"},
  areaConteudoInterno: {flex: 1,padding: "20px",overflowY: "auto"},
  bannerContainer: { height: "180px", marginBottom: "20px" },
  bannerImg: { backgroundImage: "url('/images/imagemdoponto.png')", backgroundPosition: "center", backgroundSize: "cover", borderRadius: "12px", height: "100%", border: "4px solid #b6dbff", boxShadow: "0 1px 10px rgba(0, 0, 0, 0.07)" },
  gridSistema: { display: "flex", gap: "20px", flex: 1 },
  rotas: { flex: "3", display: "flex", flexDirection: "column" },
  painelLateral: {width: "260px",flexShrink: 0,display: "flex",flexDirection: "column"},
  tituloSecao: { color: colors.primaryBlue, margin: "0 0 10px 0", fontSize: "1.5rem", fontFamily: "sans-serif" },
  cardBranco: { background: "white", borderRadius: "20px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 10px rgba(0, 0, 0, 0.18)",height: "350px", padding: "10px", overflow: "hidden" },
  cardBrancoLateral: {background: "white",borderRadius: "20px",boxShadow: "0 1px 10px rgba(0, 0, 0, 0.18)",height: "350px",padding: "15px",overflow: "hidden"}
};