import React, { useEffect, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import GestaoEscolas from './GestaoEscolas';
import MapaRadar from './MapaRadar';
import MapaRoteirizacao from './MapaRoteirizacao';

const Icon = ({ name }: { name: string }) => <span style={{ marginRight: '10px' }}>{name}</span>;

interface PainelEmpresaProps {
  irParaLogin: () => void;
  irParaPerfil: () => void;
}

export default function PainelEmpresa({ irParaLogin, irParaPerfil }: PainelEmpresaProps) {
  const [empresa, setEmpresa] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'monitoramento' | 'roteirizacao' | 'escolas' | 'ajustes'>('monitoramento');

  // Estados de Logística
  const [viagensHoje, setViagensHoje] = useState<any[]>([]);
  const [viagemSelecionada, setViagemSelecionada] = useState<any>(null);
  const [pontosTimeline, setPontosTimeline] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "empresas", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEmpresa({ id: docSnap.id, ...docSnap.data() });
          buscarViagensDoDia(user.uid);
        }
      } else {
        irParaLogin();
      }
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  // Busca as viagens inciadas no dia
  const buscarViagensDoDia = async (empresaId: string) => {
    const q = query(
      collection(db, "viagens"),
      where("empresa_id", "==", empresaId),
      orderBy("horario_inicio", "desc"),
      limit(10)
    );
    const snap = await getDocs(q);
    const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setViagensHoje(lista);
  };

  // Quando clica em uma viagem, busca os pontos no mapa
  const carregarLinhaDoTempo = async (viagem: any) => {
    setViagemSelecionada(viagem);
    const q = query(
      collection(db, "viagens", viagem.id, "rastreamento"),
      orderBy("timestamp", "asc")
    );
    const snap = await getDocs(q);
    setPontosTimeline(snap.docs.map(d => d.data()));
  };

  if (carregando) return <div style={styles.loading}>Carregando BusGap Business...</div>;

  return (
    <div style={styles.containerDashboard}>

      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>BUSGAP <span style={{ fontSize: '10px', color: '#4caf50' }}>CORP</span></div>

        <nav style={styles.nav}>
          <button style={abaAtiva === 'monitoramento' ? styles.navBtnAtivo : styles.navBtn} onClick={() => setAbaAtiva('monitoramento')}>
            <Icon name="📡" /> Radar e Logística
          </button>
          <button style={abaAtiva === 'roteirizacao' ? styles.navBtnAtivo : styles.navBtn} onClick={() => setAbaAtiva('roteirizacao')}>
            <Icon name="🗺️" /> Roteirização de Rotas
          </button>
          <button style={abaAtiva === 'escolas' ? styles.navBtnAtivo : styles.navBtn} onClick={() => setAbaAtiva('escolas')}>
            <Icon name="🏫" /> Escolas e Turmas
          </button>
          <button style={abaAtiva === 'ajustes' ? styles.navBtnAtivo : styles.navBtn} onClick={() => setAbaAtiva('ajustes')}>
            <Icon name="🔗" /> Link de Convite
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={() => signOut(auth)} style={styles.btnSair}>Sair</button>
        </div>
      </aside>

      {/* PRINCIPAL */}
      <main style={styles.mainContent}>

        {/* CABEÇAI */}
        <header style={styles.header}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px' }}>Dashboard Administrativo</h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{empresa?.nomeFantasia}</p>
          </div>
          <div style={styles.statusBadge}>Operação Normal</div>
        </header>

        {/* ÁREA DAS ABAS */}
        <div style={styles.contentArea}>

          {abaAtiva === 'monitoramento' && (
            <div style={styles.gridMonitoramento}>

              {/* MAPA */}
              <div style={styles.colunaMapa}>
                <div style={styles.cardMapa}>
                  <MapaRadar pontosTimeline={pontosTimeline} />
                </div>

                <div style={styles.miniStatsRow}>
                  <div style={styles.miniCard}><strong>12</strong> Alunos em Trânsito</div>
                  <div style={styles.miniCard}><strong>02</strong> Vans Ativas</div>
                </div>
              </div>

              {/* TIMELINE */}
              <div style={styles.colunaTimeline}>
                <h3 style={{ marginTop: 0, fontSize: '16px' }}>Histórico de Viagens (Hoje)</h3>
                <div style={styles.listaViagens}>
                  {viagensHoje.map(v => (
                    <div
                      key={v.id}
                      onClick={() => carregarLinhaDoTempo(v)}
                      style={viagemSelecionada?.id === v.id ? styles.itemViagemAtivo : styles.itemViagem}
                    >
                      <div style={{ fontWeight: 'bold' }}>Van #{v.motorista_id.substring(0, 5)}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>Início: {new Date(v.horario_inicio).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>

                {viagemSelecionada && (
                  <div style={styles.detalheTimeline}>
                    <h4 style={{ fontSize: '13px', color: '#1a237e' }}>Linha do Tempo</h4>
                    <div style={styles.timelineVertical}>
                      <div style={styles.pontoTimeline}>🟢 {new Date(viagemSelecionada.horario_inicio).toLocaleTimeString()} - Viagem Iniciada</div>
                      {pontosTimeline.map((p, i) => (
                        <div key={i} style={styles.pontoTimeline}>📍 {new Date(p.timestamp).toLocaleTimeString()} - Ponto de GPS</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {abaAtiva === 'roteirizacao' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ marginTop: 0, color: '#1a237e' }}>Planejamento de Rotas</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Visualize a localização de todos os alunos vinculados à sua empresa para otimizar as frotas.
              </p>
              <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <MapaRoteirizacao empresaId={empresa?.id} empresa={empresa} />
              </div>
            </div>
          )}

          {abaAtiva === 'escolas' && <GestaoEscolas />}

          {abaAtiva === 'ajustes' && (
            <div style={styles.cardInviteFull}>
              <h3>Link do Panfleto Digital</h3>
              <p>Compartilhe para vincular passageiros automaticamente.</p>
              <div style={styles.caixaLink}>http://localhost:5174/?convite={empresa?.slug_convite}</div>
              <button style={styles.btnCopiar}>Copiar Link</button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  containerDashboard: { display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f0f2f5', overflow: 'hidden' },
  sidebar: { width: '260px', backgroundColor: '#1a237e', color: '#fff', display: 'flex', flexDirection: 'column', padding: '20px' },
  logo: { fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
  navBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', textAlign: 'left', padding: '12px', cursor: 'pointer', borderRadius: '8px', fontSize: '15px' },
  navBtnAtivo: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', textAlign: 'left', padding: '12px', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold' },
  sidebarFooter: { paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  btnSair: { width: '100%', padding: '10px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },

  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  header: { height: '70px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  statusBadge: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },

  contentArea: { padding: '25px', flex: 1 },
  gridMonitoramento: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', height: '100%' },
  colunaMapa: { display: 'flex', flexDirection: 'column', gap: '20px' },
  cardMapa: { backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', height: '450px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '5px solid #fff' },

  colunaTimeline: { backgroundColor: '#fff', borderRadius: '15px', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  listaViagens: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  itemViagem: { padding: '12px', borderRadius: '10px', backgroundColor: '#f8f9fa', cursor: 'pointer', border: '1px solid #eee' },
  itemViagemAtivo: { padding: '12px', borderRadius: '10px', backgroundColor: '#e8effd', cursor: 'pointer', border: '1px solid #1a237e' },

  detalheTimeline: { borderTop: '1px solid #eee', paddingTop: '15px' },
  timelineVertical: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' },
  pontoTimeline: { fontSize: '11px', color: '#555', paddingLeft: '10px', borderLeft: '2px solid #ddd' },

  miniStatsRow: { display: 'flex', gap: '15px' },
  miniCard: { flex: 1, backgroundColor: '#fff', padding: '15px', borderRadius: '12px', textAlign: 'center', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },

  loading: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f4f9' },
  cardInviteFull: { backgroundColor: '#fff', padding: '40px', borderRadius: '15px', textAlign: 'center' },
  caixaLink: { backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '10px', margin: '20px 0', fontFamily: 'monospace' },
  btnCopiar: { padding: '10px 30px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};