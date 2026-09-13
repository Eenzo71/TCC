import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export interface EmpresaItem {
  id: string;
  nome: string;
  escolas: string[];
}

interface SelecionarEmpresaProps {
  onSelecionar?: (empresa: EmpresaItem) => void;
  onVoltar?: () => void;
}

export default function SelecionarEmpresa({ onSelecionar, onVoltar }: SelecionarEmpresaProps) {
  // Adicionamos a fase 'vinculado'
  const [fase, setFase] = useState<'lista' | 'detalhes' | 'vinculado'>('lista');
  
  const [empresas, setEmpresas] = useState<EmpresaItem[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<EmpresaItem | null>(null);
  
  const [detalhes, setDetalhes] = useState<any>(null);
  const [frota, setFrota] = useState<any[]>([]);
  
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [carregandoAcao, setCarregandoAcao] = useState(false); // Para os botões de vincular/desvincular
  const [erro, setErro] = useState('');

  useEffect(() => {
    const verificarVinculoExistente = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const res = await fetch(`http://localhost:3000/api/usuario/status-vinculo/${user.uid}`);
        const json = await res.json();

        if (json.vinculado && json.empresa_id) {
          const resposta = await fetch(`http://localhost:3000/api/empresa/perfil-completo/${json.empresa_id}`);
          const dadosEmpresa = await resposta.json();

          if (dadosEmpresa.valido) {
            setDetalhes(dadosEmpresa.dados);
            setFrota(dadosEmpresa.frota);
            setFase('vinculado');
          }
        }
      } catch (error) {
        console.error("Erro ao verificar vínculo:", error);
      } finally {
        setCarregando(false);
      }
    };

    verificarVinculoExistente();
  }, []);

  useEffect(() => {
    const buscarEmpresas = async () => {
      try {
        const resposta = await fetch('http://localhost:3000/api/empresa/lista');
        if (!resposta.ok) throw new Error("Erro ao buscar empresas");
        setEmpresas(await resposta.json());
      } catch (error) {
        setErro("Não foi possível carregar a lista de frotas.");
      } finally {
        setCarregando(false);
      }
    };
    buscarEmpresas();
  }, []);

  const abrirDetalhes = async () => {
    if (!empresaSelecionada) return;
    setFase('detalhes');
    setCarregandoAcao(true);

    try {
      const resposta = await fetch(`http://localhost:3000/api/empresa/perfil-completo/${empresaSelecionada.id}`);
      const json = await resposta.json();
      
      if (json.valido) {
        setDetalhes(json.dados);
        setFrota(json.frota);
      }
    } catch (error) {
      setErro("Erro ao carregar o perfil da empresa.");
    } finally {
      setCarregandoAcao(false);
    }
  };

  const confirmarVinculo = async () => {
    const user = auth.currentUser;
    if (!user || !empresaSelecionada) return alert("Erro de autenticação.");
    
    setCarregandoAcao(true);
    try {
      const res = await fetch('http://localhost:3000/api/usuario/vincular-empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, empresa_id: empresaSelecionada.id })
      });
      
      const json = await res.json();
      if (json.valido) {
        setFase('vinculado'); 
        if (onSelecionar) onSelecionar(empresaSelecionada); 
      } else {
        alert("Erro: " + json.erro);
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setCarregandoAcao(false);
    }
  };

  const desvincularEmpresa = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if(!window.confirm("Tem certeza que deseja cancelar o vínculo com esta empresa?")) return;

    setCarregandoAcao(true);
    try {
      const res = await fetch('http://localhost:3000/api/usuario/desvincular-empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });
      
      const json = await res.json();
      if (json.valido) {
        setEmpresaSelecionada(null);
        setDetalhes(null);
        setFase('lista');
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setCarregandoAcao(false);
    }
  };

  const empresasFiltradas = empresas.filter(emp => 
    emp.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.caixaCentral}>

        {fase === 'lista' && (
           <>
            <div style={styles.cabecalho}>
              <h2 style={{ color: '#1a237e', margin: '0 0 5px 0', fontSize: '22px' }}>Encontre sua Frota 🚌</h2>
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Pesquise pelo nome da empresa.</p>
            </div>
            
            <div style={styles.areaBusca}>
              <input type="text" placeholder="🔍 Buscar nome da empresa..." value={busca} onChange={(e) => setBusca(e.target.value)} style={styles.inputBusca}/>
            </div>

            <div style={styles.areaLista}>
              {carregando ? <p style={{textAlign: 'center'}}>⏳ Buscando frotas na sua região...</p> : 
               erro ? <p style={{textAlign: 'center', color: 'red'}}>⚠️ {erro}</p> : 
               empresasFiltradas.length === 0 ? <p style={{textAlign: 'center'}}>Nenhuma empresa encontrada.</p> : 
              (
                <div style={styles.grid}>
                  {empresasFiltradas.map((empresa) => {
                    const isSelected = empresaSelecionada?.id === empresa.id;
                    return (
                      <div key={empresa.id} onClick={() => setEmpresaSelecionada(empresa)} style={{...styles.card, borderColor: isSelected ? '#4caf50' : '#eee', backgroundColor: isSelected ? '#f1f8e9' : '#fff'}}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '16px' }}>{empresa.nome}</h3>
                        {empresa.escolas?.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {empresa.escolas.map((esc, i) => <span key={i} style={styles.tagEscola}>🏫 {esc}</span>)}
                          </div>
                        ) : <span style={{ fontSize: '12px', color: '#999' }}>Escolas não informadas</span>}
                        {isSelected && <div style={styles.seloCheck}>✅ Selecionada</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={styles.rodape}>
              {onVoltar && <button onClick={onVoltar} style={styles.btnVoltar}>Voltar</button>}
              <button onClick={abrirDetalhes} disabled={!empresaSelecionada} style={{...styles.btnAvancar, backgroundColor: empresaSelecionada ? '#1a237e' : '#ccc', cursor: empresaSelecionada ? 'pointer' : 'not-allowed'}}>
                Ver Perfil e Avançar
              </button>
            </div>
          </>
        )}

        {(fase === 'detalhes' || fase === 'vinculado') && (
          <div style={{ padding: '30px', maxHeight: '85vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
              <div>
                <h2 style={{ color: '#1a237e', margin: '0 0 5px 0' }}>
                  {fase === 'vinculado' ? '✅ Sua Frota Atual' : 'Perfil da Frota'}
                </h2>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                  {fase === 'vinculado' ? 'Você já está vinculado a esta empresa.' : 'Revise as informações antes de vincular sua conta.'}
                </p>
              </div>

              {fase === 'vinculado' && (
                <button onClick={desvincularEmpresa} disabled={carregandoAcao} style={styles.btnDesvincular}>
                  {carregandoAcao ? 'Aguarde...' : 'Desvincular ❌'}
                </button>
              )}
            </div>

            {carregandoAcao && fase === 'detalhes' ? (
               <div style={{ textAlign: 'center', margin: '50px 0' }}>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#111' }}>⏳ Processando...</p>
               </div>
            ) : (
              <>
                <div style={styles.gridDuplo}>
                  <div>
                    <div style={styles.secaoDetalhe}>
                      <h3 style={styles.tituloSecao}>Informações Oficiais</h3>
                      <p style={styles.textoLinha}><strong>Razão Social:</strong> {detalhes?.isentoRazaoSocial ? <span style={styles.tagIsento}>Autônomo</span> : detalhes?.razaoSocial}</p>
                      <p style={styles.textoLinha}><strong>CNPJ:</strong> {detalhes?.isentoCNPJ ? <span style={styles.tagIsento}>Isento</span> : detalhes?.cnpj}</p>
                      <p style={styles.textoLinha}><strong>Responsável:</strong> {detalhes?.responsavelNome}</p>
                    </div>

                    <div style={styles.secaoDetalhe}>
                      <h3 style={styles.tituloSecao}>Operacional</h3>
                      <p style={styles.textoLinha}><strong>Veículos:</strong> {detalhes?.tipoTransporte}</p>
                      <p style={styles.textoLinha}><strong>Turnos:</strong> {detalhes?.turnos}</p>
                    </div>

                    <div style={styles.secaoDetalhe}>
                      <h3 style={styles.tituloSecao}>Contato Direto</h3>
                      <p style={styles.textoLinha}><strong>WhatsApp:</strong> {detalhes?.whatsappPrincipal}</p>
                      <p style={styles.textoLinha}><strong>E-mail:</strong> {detalhes?.emailPrincipal}</p>
                    </div>
                  </div>
                  <div>
                    <div style={styles.secaoDetalhe}>
                      <h3 style={styles.tituloSecao}>Sede / Ponto de Partida</h3>
                      <p style={styles.textoLinha}>{detalhes?.endereco.rua}, {detalhes?.endereco.numero}</p>
                      <p style={styles.textoLinha}>{detalhes?.endereco.bairro} - {detalhes?.endereco.cidade}/{detalhes?.endereco.estado}</p>
                      <p style={styles.textoLinha}>CEP: {detalhes?.endereco.cep}</p>
                    </div>

                    <div style={styles.secaoDetalhe}>
                      <h3 style={styles.tituloSecao}>Nossa Frota</h3>
                      {frota.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {frota.map((mot, i) => (
                            <div key={i} style={styles.cardMiniFrota}>
                              <span>🚐</span>
                              <div>
                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '12px' }}>{mot.veiculo}</p>
                                <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>Mot: {mot.nome}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p style={{ color: '#888', fontSize: '13px' }}>Nenhum veículo registrado.</p>}
                    </div>
                  </div>
                </div>

                {fase === 'detalhes' && (
                  <div style={styles.caixaConfirmacao}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🤔</div>
                    <h3 style={{ color: '#1a237e', margin: '0 0 10px 0' }}>Confirmação de Vínculo</h3>
                    <p style={{ color: '#333', fontSize: '15px', marginBottom: '20px' }}>
                      Você tem certeza que deseja vincular sua conta à empresa <strong>{empresaSelecionada?.nome}</strong> para o transporte escolar?
                    </p>
                    
                    <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                      <button onClick={() => setFase('lista')} style={styles.btnVoltarLargo}>
                        Não, escolher outra
                      </button>
                      <button onClick={confirmarVinculo} style={styles.btnConfirmarVerde}>
                        Sim, é essa mesma!
                      </button>
                    </div>
                  </div>
                )}

              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f4f4f9', fontFamily: 'sans-serif', padding: '20px' },
  caixaCentral: { backgroundColor: '#fff', width: '100%', maxWidth: '700px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cabecalho: { padding: '25px', textAlign: 'center', borderBottom: '1px solid #eee' },
  areaBusca: { padding: '20px 25px 0 25px' },
  inputBusca: { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box', outline: 'none' },
  areaLista: { padding: '20px 25px', maxHeight: '350px', overflowY: 'auto', backgroundColor: '#fafafa' },
  grid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { border: '2px solid', borderRadius: '12px', padding: '15px', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' },
  seloCheck: { position: 'absolute', top: '15px', right: '15px', fontSize: '12px', fontWeight: 'bold', color: '#4caf50' },
  rodape: { padding: '20px 25px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', gap: '15px' },
  btnVoltar: { padding: '12px 20px', backgroundColor: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  btnAvancar: { flex: 1, padding: '12px 20px', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', transition: 'background-color 0.2s' },

  gridDuplo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' },
  secaoDetalhe: { marginBottom: '20px' },
  tituloSecao: { color: '#1a237e', margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '5px' },
  textoLinha: { margin: '0 0 6px 0', fontSize: '13px', color: '#444' },
  tagIsento: { backgroundColor: '#e0e0e0', color: '#555', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  tagEscola: { backgroundColor: '#e8effd', color: '#1a237e', padding: '4px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold' },
  cardMiniFrota: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px', border: '1px solid #eee' },

  caixaConfirmacao: { backgroundColor: '#f9f9f9', border: '2px dashed #ccc', borderRadius: '15px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  btnVoltarLargo: { flex: 1, padding: '14px', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  btnConfirmarVerde: { flex: 1, padding: '14px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  
  btnDesvincular: { padding: '8px 15px', backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }
};