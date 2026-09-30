import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';

export interface EmpresaItem {
  id: string;
  nome: string;
  escolas: string[];
}

interface SelecionarEmpresaProps {
  onSelecionar?: (empresa: EmpresaItem) => void;
  onVoltar?: () => void;
}

interface EscolaBackend {
  nome: string;
  turmas: string[];
}

export default function SelecionarEmpresa({ onSelecionar, onVoltar }: SelecionarEmpresaProps) {
  const [fase, setFase] = useState<'lista' | 'detalhes' | 'escola' | 'vinculado'>('lista');

  const [empresas, setEmpresas] = useState<EmpresaItem[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<EmpresaItem | null>(null);

  const [detalhes, setDetalhes] = useState<any>(null);
  const [frota, setFrota] = useState<any[]>([]);

  // Dados escolares do aluno vinculado
  const [escolasDaEmpresa, setEscolasDaEmpresa] = useState<EscolaBackend[]>([]);
  const [instituicao, setInstituicao] = useState('');
  const [turma, setTurma] = useState('');
  const [turmaManual, setTurmaManual] = useState('');
  const [matricula, setMatricula] = useState('');

  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [erro, setErro] = useState('');

  const carregarDadosEscolaresSeparados = async (uid: string) => {
    try {
      const [resEscola, resTurma, resMatricula] = await Promise.all([
        fetch(`http://localhost:3000/api/usuario/escola/${uid}`).then(r => r.json()),
        fetch(`http://localhost:3000/api/usuario/turma/${uid}`).then(r => r.json()),
        fetch(`http://localhost:3000/api/usuario/matricula/${uid}`).then(r => r.json())
      ]);

      if (resEscola.valido) setInstituicao(resEscola.escola);
      if (resTurma.valido) setTurma(resTurma.turma);
      if (resMatricula.valido) setMatricula(resMatricula.matricula);
    } catch (error) {
      console.error("Erro ao carregar dados escolares individualizados:", error);
    }
  };

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

            setEmpresaSelecionada({
              id: json.empresa_id,
              nome: dadosEmpresa.dados.nomeFantasia || dadosEmpresa.dados.razaoSocial || 'Empresa',
              escolas: []
            });

            await carregarDadosEscolaresSeparados(user.uid);

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

  const irParaEscolhaEscola = async () => {
    if (!empresaSelecionada) return;
    setCarregandoAcao(true);
    try {
      const resposta = await fetch(`http://localhost:3000/api/empresa/${empresaSelecionada.id}/escolas`);
      const json = await resposta.json();
      if (json.valido) {
        setEscolasDaEmpresa(json.escolas || []);
      }
      setFase('escola');
    } catch (error) {
      console.error("Erro ao buscar escolas:", error);
      setFase('escola');
    } finally {
      setCarregandoAcao(false);
    }
  };

  const confirmarVinculoComEscola = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !empresaSelecionada) return alert("Erro de autenticação.");

    const turmaFinal = turma === 'outra' ? turmaManual : turma;
    const precisaRevisao = turma === 'outra';

    setCarregandoAcao(true);
    try {
      const res = await fetch('http://localhost:3000/api/usuario/vincular-empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          empresa_id: empresaSelecionada.id,
          dados_escolares: {
            instituicao,
            turma: turmaFinal,
            pendente_revisao: precisaRevisao,
            matricula
          }
        })
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

    if (!window.confirm("Tem certeza que deseja cancelar o vínculo com esta empresa?")) return;

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

  const turmasDaEscolaSelecionada = escolasDaEmpresa.find(e => e.nome === instituicao)?.turmas || [];

  return (
    <div style={styles.container}>
      <div style={styles.caixaCentral}>

        {/* FASE 1: LISTA DE EMPRESAS */}
        {fase === 'lista' && (
          <>
            <div style={styles.cabecalho}>
              <h2 style={{ color: '#1a237e', margin: '0 0 5px 0', fontSize: '22px' }}>Encontre sua Frota 🚌</h2>
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Pesquise pelo nome da empresa.</p>
            </div>

            <div style={styles.areaBusca}>
              <input type="text" placeholder="🔍 Buscar nome da empresa..." value={busca} onChange={(e) => setBusca(e.target.value)} style={styles.inputBusca} />
            </div>

            <div style={styles.areaLista}>
              {carregando ? <p style={{ textAlign: 'center' }}>⏳ Buscando frotas na sua região...</p> :
                erro ? <p style={{ textAlign: 'center', color: 'red' }}>⚠️ {erro}</p> :
                  empresasFiltradas.length === 0 ? <p style={{ textAlign: 'center' }}>Nenhuma empresa encontrada.</p> :
                    (
                      <div style={styles.grid}>
                        {empresasFiltradas.map((empresa) => {
                          const isSelected = empresaSelecionada?.id === empresa.id;
                          return (
                            <div key={empresa.id} onClick={() => setEmpresaSelecionada(empresa)} style={{ ...styles.card, borderColor: isSelected ? '#4caf50' : '#eee', backgroundColor: isSelected ? '#f1f8e9' : '#fff' }}>
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
              <button onClick={abrirDetalhes} disabled={!empresaSelecionada} style={{ ...styles.btnAvancar, backgroundColor: empresaSelecionada ? '#1a237e' : '#ccc', cursor: empresaSelecionada ? 'pointer' : 'not-allowed' }}>
                Ver Perfil e Avançar
              </button>
            </div>
          </>
        )}

        {/* FASE 2: DETALHES DA FROTA (Pré-vínculo) */}
        {fase === 'detalhes' && (
          <div style={{ padding: '30px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
              <div>
                <h2 style={{ color: '#1a237e', margin: '0 0 5px 0' }}>Perfil da Frota</h2>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Revise as informações antes de vincular sua conta.</p>
              </div>
            </div>

            {carregandoAcao ? (
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
                      <p style={styles.textoLinha}>{detalhes?.endereco?.rua}, {detalhes?.endereco?.numero}</p>
                      <p style={styles.textoLinha}>{detalhes?.endereco?.bairro} - {detalhes?.endereco?.cidade}/{detalhes?.endereco?.estado}</p>
                      <p style={styles.textoLinha}>CEP: {detalhes?.endereco?.cep}</p>
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
                    <button onClick={irParaEscolhaEscola} style={styles.btnConfirmarVerde}>
                      Sim, é essa mesma!
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* FASE 3: ESCOLA, TURMA E MATRÍCULA */}
        {fase === 'escola' && (
          <div style={{ padding: '30px' }}>
            <h2 style={{ color: '#1a237e', margin: '0 0 5px 0' }}>Dados Escolares</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '25px' }}>
              Selecione a instituição de ensino e turma atendidas por <strong>{empresaSelecionada?.nome}</strong>.
            </p>

            <form onSubmit={confirmarVinculoComEscola}>
              <div style={styles.campoForm}>
                <label style={styles.labelForm}>Sua Instituição / Escola:</label>
                <select name="instituicao" value={instituicao} onChange={e => setInstituicao(e.target.value)} required style={styles.inputForm}>
                  <option value="">Selecione a escola...</option>
                  {escolasDaEmpresa.map((e, i) => <option key={i} value={e.nome}>{e.nome}</option>)}
                  <option value="outra">⚠️ Outra / Não encontrada</option>
                </select>
              </div>

              {instituicao && instituicao !== 'outra' && (
                <div style={styles.campoForm}>
                  <label style={styles.labelForm}>Turma / Ano:</label>
                  <select name="turma" value={turma} onChange={e => setTurma(e.target.value)} required style={styles.inputForm}>
                    <option value="">Selecione a turma...</option>
                    {turmasDaEscolaSelecionada.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    <option value="outra">⚠️ Outra / Não encontrei</option>
                  </select>
                </div>
              )}

              {(instituicao === 'outra' || turma === 'outra') && (
                <div style={styles.campoForm}>
                  <label style={{ ...styles.labelForm, color: '#d32f2f' }}>Digite sua turma/escola manualmente:</label>
                  <input type="text" value={turmaManual} onChange={e => setTurmaManual(e.target.value)} required style={styles.inputForm} placeholder="Ex: 2º Ano B - Escola Exemplo" />
                </div>
              )}

              <div style={styles.campoForm}>
                <label style={styles.labelForm}>Número de Matrícula:</label>
                <input type="text" value={matricula} onChange={e => setMatricula(e.target.value)} required style={styles.inputForm} placeholder="Necessário para validar com a escola" />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button type="button" onClick={() => setFase('detalhes')} style={styles.btnVoltarLargo} disabled={carregandoAcao}>
                  Voltar
                </button>
                <button type="submit" style={styles.btnConfirmarVerde} disabled={carregandoAcao}>
                  {carregandoAcao ? 'Finalizando...' : 'Finalizar Vínculo'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FASE 4: VINCULADO (Exibe o perfil completo da empresa + dados escolares + botão de desvincular) */}
        {fase === 'vinculado' && (
          <div style={{ padding: '30px', maxHeight: '85vh', overflowY: 'auto' }}>

            {/* Cabeçalho de Status Vinculado */}
            <div style={styles.caixaStatusVinculado}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '22px' }}>✅</span>
                <h2 style={{ color: '#1a237e', margin: 0, fontSize: '20px' }}>Sua Frota Atual</h2>
              </div>
              <p style={{ color: '#555', fontSize: '13px', margin: '0 0 15px 0' }}>
                Você está vinculado com sucesso à empresa <strong>{empresaSelecionada?.nome}</strong>.
              </p>

              <div style={styles.painelDadosAluno}>
                <p style={styles.textoLinhaAluno}>🏫 <strong>Escola:</strong> {instituicao || 'Não informada'}</p>
                <p style={styles.textoLinhaAluno}>📚 <strong>Turma:</strong> {turma || 'Não informada'}</p>
                <p style={styles.textoLinhaAluno}>🆔 <strong>Matrícula:</strong> {matricula || 'Não informada'}</p>
              </div>
            </div>

            <h3 style={{ color: '#1a237e', fontSize: '16px', margin: '25px 0 15px 0', borderBottom: '2px solid #eee', paddingBottom: '8px' }}>
              📋 Informações Públicas da Frota
            </h3>

            {/* Grid com todas as informações públicas da empresa */}
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
                  <p style={styles.textoLinha}>{detalhes?.endereco?.rua}, {detalhes?.endereco?.numero}</p>
                  <p style={styles.textoLinha}>{detalhes?.endereco?.bairro} - {detalhes?.endereco?.cidade}/{detalhes?.endereco?.estado}</p>
                  <p style={styles.textoLinha}>CEP: {detalhes?.endereco?.cep}</p>
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

            <button onClick={desvincularEmpresa} disabled={carregandoAcao} style={styles.btnDesvincularLargo}>
              {carregandoAcao ? 'Aguarde...' : 'Desvincular da Empresa ❌'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f4f4f9', fontFamily: 'sans-serif', padding: '20px' },
  caixaCentral: { backgroundColor: '#fff', width: '100%', maxWidth: '750px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
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

  gridDuplo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' },
  secaoDetalhe: { marginBottom: '20px' },
  tituloSecao: { color: '#1a237e', margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '5px' },
  textoLinha: { margin: '0 0 6px 0', fontSize: '13px', color: '#444' },
  tagIsento: { backgroundColor: '#e0e0e0', color: '#555', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  tagEscola: { backgroundColor: '#e8effd', color: '#1a237e', padding: '4px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold' },
  cardMiniFrota: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px', border: '1px solid #eee' },

  caixaConfirmacao: { backgroundColor: '#f9f9f9', border: '2px dashed #ccc', borderRadius: '15px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  btnVoltarLargo: { flex: 1, padding: '14px', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  btnConfirmarVerde: { flex: 1, padding: '14px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },

  campoForm: { marginBottom: '15px', textAlign: 'left' },
  labelForm: { fontSize: '14px', color: '#334155', fontWeight: '600', display: 'block', marginBottom: '6px' },
  inputForm: { width: '100%', height: '42px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 12px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#1e293b', outline: 'none' },

  caixaStatusVinculado: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', marginBottom: '25px' },
  painelDadosAluno: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 15px', display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' },
  textoLinhaAluno: { margin: 0, fontSize: '13px', color: '#1e293b' },

  btnDesvincularLargo: { width: '100%', padding: '14px', backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '10px' }
};