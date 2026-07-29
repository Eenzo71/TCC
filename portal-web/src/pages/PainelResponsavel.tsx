import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import MapaRadar from '../components/MapaRadar';
import AdicionarDependente from './AdicionarDependente';
import { CiUser, CiBellOn } from "react-icons/ci";
import { SlMagnifier } from "react-icons/sl";

const colors = { bgNavbar: "#e7e7e7", primaryBlue: "#7b8ff7", darkBlue: "#5c6bc0" };

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
          <button onClick={() => setMostrarModalAdicionar(true)} style={{ backgroundColor: '#4caf50', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
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
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
           <div style={styles.busca}><input type="text" placeholder="Buscar" style={styles.buscaInput} /><SlMagnifier /></div>
          <CiBellOn size={24} style={{ cursor: 'pointer' }} />
          <div style={styles.perfil}><CiUser size={20} /><span>Responsável</span></div>
        </div>
      </header>

      {telaAtual === 'painel' && (
        <>
          <section style={styles.bannerContainer}><div style={styles.bannerImg}></div></section>
          <section style={styles.gridSistema}>
            <div style={styles.rotas}>
              <h2 style={styles.tituloSecao}>Rotas dos ônibus</h2>
              <div style={{ ...styles.cardBranco, flex: 1 }}><h3>Rotas Aqui</h3></div>
            </div>
            <div style={styles.mapa}>
              <div style={{ ...styles.cardBranco, flex: 1, padding: '5px' }}><MapaRadar /></div>
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
  navbar: { height: "70px", backgroundColor: colors.bgNavbar, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", margin: "0px 0px 20px 0px", background: "#c4d7ff  " },
  perfil: { background: "linear-gradient(90deg, #7b8ff7, #a5b4fc)", padding: "8px 15px", borderRadius: "25px", color: "white", display: "flex", alignItems: "center", gap: "10px",  },
  bannerContainer: { height: "180px", marginBottom: "20px" },
  bannerImg: { backgroundImage: "url('/images/imagemdoponto.png')", backgroundPosition: "center", backgroundSize: "cover", borderRadius: "12px", height: "100%" },
  gridSistema: { display: "flex", gap: "20px", flex: 1 },
  rotas: { width: "65%", display: "flex", flexDirection: "column" },
  mapa: { width: "35%", display: "flex", flexDirection: "column" },
  tituloSecao: { color: colors.primaryBlue, margin: "0 0 10px 0", fontSize: "1.5rem" },
  busca: { background: "#d9e8ff", height: "45px", padding: "0 15px", borderRadius: "5px", display: "flex", alignItems: "center", marginBottom: "10px", marginRight: "830px" },
  buscaInput: { border: "none", background: "transparent", outline: "none", width: "90%" },
  cardBranco: { background: "white", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.04)" }
};