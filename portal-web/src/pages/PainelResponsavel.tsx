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
    } catch (error) { console.error("Erro ao buscar dependentes:", error); } 
    finally { setCarregandoFilhos(false); }
  };

  useEffect(() => { buscarDependentes(); }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
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
        
        <div style={styles.busca}>
          <input type="text" placeholder="Buscar" style={styles.buscaInput} />
          <SlMagnifier />
        </div>
        <img src="/images/bus_gap_sem_fundo.png"  alt="Logo BusGap"  style={styles.logoNavbar}/>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <CiBellOn size={24} style={{ cursor: 'pointer' }} />
          <div style={styles.perfil}>
            <CiUser size={20} />
            <span>Responsável</span>
          </div>
        </div>

      </header>

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
              </section>
            </>
          )}

      {telaAtual === 'gerenciar-filhos' && <AbaDependentes />}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  conteudoGeral: { display: "flex", flexDirection: "column", height: "100%", },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", margin: "-5px -5px 20px -5px", background: "#ffffff", height: "80px", boxShadow: "0 1px 10px rgba(0, 0, 0, 0.03)", position: "relative" },
  logoNavbar: {position: "absolute", left: "50%", transform: "translateX(-50%)", height: "110px", objectFit: "contain"},
  perfil: { background: "linear-gradient(90deg, #56a8cb, #56a8cb)", padding: "8px 15px", borderRadius: "25px", color: "white", display: "flex", alignItems: "center", gap: "10px", fontFamily: "sans-serif" },
  bannerContainer: { height: "180px", marginBottom: "20px" },
  bannerImg: { backgroundImage: "url('/images/imagemdoponto.png')", backgroundPosition: "center", backgroundSize: "cover", borderRadius: "12px", height: "100%", border: "4px solid #b6dbff", boxShadow: "0 1px 10px rgba(0, 0, 0, 0.07)" },
  gridSistema: { display: "flex", gap: "20px", flex: 1 },
  rotas: { width: "60%", display: "flex", flexDirection: "column" },
  mapa: { width: "35%", display: "flex", flexDirection: "column" },
  tituloSecao: { color: colors.primaryBlue, margin: "0 0 10px 0", fontSize: "1.5rem", fontFamily: "sans-serif" },
  busca: { background: "#edf4ff", height: "45px", padding: "0 15px", border: "2px solid #d3e9ff", borderRadius: "5px", display: "flex", alignItems: "center", margin: "0 auto", width: "300px", marginRight: "720px" },
  buscaInput: { border: "none", background: "transparent", outline: "none", width: "90%" },
  cardBranco: { background: "white", borderRadius: "20px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 10px rgba(0, 0, 0, 0.18)", height: "350px", padding: "10px", overflow: "hidden" },
};
//fazer a seguinte coisas:colocar a logo na top bar, colocar a navBar denro de "Rotas aqui",junto a isso e colocar o mapinha dentro de "Rotas aqui", provavelmente colocar algo relacionado ao filho no lugar da onde estava o mapinha antigo
