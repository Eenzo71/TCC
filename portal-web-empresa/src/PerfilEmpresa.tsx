import React, { useEffect, useState } from 'react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

interface PerfilEmpresaProps {
  irParaPainel: () => void;
  irParaCompletar: () => void;
}

export default function PerfilEmpresa({ irParaPainel, irParaCompletar }: PerfilEmpresaProps) {
  const [dados, setDados] = useState<any>(null);
  const [frota, setFrota] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [visaoAtual, setVisaoAtual] = useState<'publica' | 'privada'>('publica');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const resposta = await fetch(`http://localhost:3000/api/empresa/perfil-completo/${user.uid}`);
          const json = await resposta.json();

          if (json.valido) {
            setDados({ ...json.dados, dataCadastro: new Date(json.dados.dataCadastro).toLocaleDateString('pt-BR') });
            setFrota(json.frota);
          }
        } catch (error) {
          console.error("Falha ao se conectar com a API:", error);
        }
      }
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  if (carregando) return <div style={styles.telaInteira}>Carregando dados corporativos...</div>;

  return (
    <div style={styles.telaInteira}>
      <div style={styles.caixa}>
        
        <div style={styles.cabecalho}>
          <div>
            <h2 style={{ margin: 0, color: '#111' }}>{dados?.nomeFantasia}</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
              Status: <span style={{ color: dados?.perfilCompleto ? '#4caf50' : '#f57f17', fontWeight: 'bold' }}>{dados?.perfilCompleto ? 'Perfil Verificado ✅' : 'Dossiê Pendente ⏳'}</span>
            </p>
          </div>
          <button onClick={irParaPainel} style={styles.btnVoltar}>Voltar ao Painel</button>
        </div>

        <div style={styles.containerAbas}>
          <button onClick={() => setVisaoAtual('publica')} style={visaoAtual === 'publica' ? styles.abaAtiva : styles.abaInativa}>
            👁️ Visão do Passageiro
          </button>
          <button onClick={() => setVisaoAtual('privada')} style={visaoAtual === 'privada' ? styles.abaAtivaLock : styles.abaInativa}>
            🔒 Dados Confidenciais
          </button>
        </div>

        {visaoAtual === 'publica' && (
          <div style={styles.conteudoAba}>
            <p style={styles.textoAjuda}>É assim que os pais e alunos verão sua empresa no aplicativo BusGap.</p>
            
            <div style={styles.gridDuplo}>
              <div>
                <div style={styles.secao}>
                  <h3 style={styles.tituloSecao}>Informações Oficiais</h3>
                  <p style={styles.textoLinha}><strong>Razão Social:</strong> {dados?.isentoRazaoSocial ? <span style={styles.tagIsento}>Autônomo</span> : dados?.razaoSocial}</p>
                  <p style={styles.textoLinha}><strong>CNPJ:</strong> {dados?.isentoCNPJ ? <span style={styles.tagIsento}>Isento</span> : dados?.cnpj}</p>
                  <p style={styles.textoLinha}><strong>Responsável:</strong> {dados?.responsavelNome}</p>
                </div>

                <div style={styles.secao}>
                  <h3 style={styles.tituloSecao}>Operacional</h3>
                  <p style={styles.textoLinha}><strong>Veículos:</strong> {dados?.tipoTransporte}</p>
                  <p style={styles.textoLinha}><strong>Turnos:</strong> {dados?.turnos}</p>
                </div>

                <div style={styles.secao}>
                  <h3 style={styles.tituloSecao}>Contato Direto</h3>
                  <p style={styles.textoLinha}><strong>WhatsApp:</strong> {dados?.whatsappPrincipal}</p>
                  <p style={styles.textoLinha}><strong>E-mail:</strong> {dados?.emailPrincipal}</p>
                </div>
              </div>

              <div>
                <div style={styles.secao}>
                  <h3 style={styles.tituloSecao}>Sede / Ponto de Partida</h3>
                  <p style={styles.textoLinha}>{dados?.endereco.rua}, {dados?.endereco.numero}</p>
                  <p style={styles.textoLinha}>{dados?.endereco.bairro} - {dados?.endereco.cidade}/{dados?.endereco.estado}</p>
                  <p style={styles.textoLinha}>CEP: {dados?.endereco.cep}</p>
                </div>

                <div style={styles.secao}>
                  <h3 style={styles.tituloSecao}>Escolas Atendidas</h3>
                  {dados?.escolas?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {dados.escolas.map((esc: any, i: number) => <span key={i} style={styles.tagEscola}>🏫 {esc.nome}</span>)}
                    </div>
                  ) : <p style={{ color: '#888', fontSize: '13px' }}>Nenhuma cadastrada.</p>}
                </div>
              </div>
            </div>

            {(dados?.redes?.instagram || dados?.redes?.facebook || dados?.redes?.linkedin || dados?.redes?.site) && (
              <div style={styles.secao}>
                <h3 style={styles.tituloSecao}>Redes Sociais</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {dados.redes.instagram && <span style={styles.tagRede}>📷 @{dados.redes.instagram.replace('@', '')}</span>}
                  {dados.redes.facebook && <span style={styles.tagRede}>📘 {dados.redes.facebook}</span>}
                  {dados.redes.linkedin && <span style={styles.tagRede}>💼 LinkedIn</span>}
                  {dados.redes.site && <span style={styles.tagRede}>🌐 Site Oficial</span>}
                </div>
              </div>
            )}

            <button onClick={irParaCompletar} style={styles.btnSecundario}>Editar Perfil Público</button>
          </div>
        )}

        {visaoAtual === 'privada' && (
          <div style={styles.conteudoAba}>
            <p style={styles.textoAjudaAviso}>Estes dados são protegidos por criptografia e não ficam visíveis aos passageiros.</p>
            
            <div style={styles.secaoPrivada}>
              <h3 style={styles.tituloSecaoPrivada}>Documentos e Segurança</h3>
              <p style={styles.textoLinha}><strong>CPF do Responsável:</strong> {dados?.responsavelCpf}</p>
              <p style={styles.textoLinha}><strong>Data de Cadastro na Plataforma:</strong> {dados?.dataCadastro}</p>
              <p style={styles.textoLinha}><strong>Termos Aceitos:</strong> Sim ✅</p>
            </div>

            <button onClick={irParaCompletar} style={styles.btnSecundario}>Atualizar Dossiê Interno</button>
          </div>
        )}

        {!dados?.perfilCompleto && (
          <div style={styles.areaAcao}>
            <p style={{ color: '#555', fontSize: '14px', marginBottom: '15px' }}>Seu dossiê está incompleto. Precisamos de mais dados para verificar sua conta.</p>
            <button onClick={irParaCompletar} style={styles.btnAcao}>
              Completar Dossiê Agora
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  telaInteira: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  caixa: { width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  cabecalho: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px 30px', borderBottom: '1px solid #eee' },
  btnVoltar: { padding: '8px 15px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  
  containerAbas: { display: 'flex', borderBottom: '1px solid #ddd', backgroundColor: '#fafafa', position: 'sticky', top: 0, zIndex: 10 },
  abaAtiva: { flex: 1, padding: '15px', border: 'none', borderBottom: '3px solid #1a237e', backgroundColor: '#fff', color: '#1a237e', fontWeight: 'bold', cursor: 'pointer' },
  abaAtivaLock: { flex: 1, padding: '15px', border: 'none', borderBottom: '3px solid #d32f2f', backgroundColor: '#fff', color: '#d32f2f', fontWeight: 'bold', cursor: 'pointer' },
  abaInativa: { flex: 1, padding: '15px', border: 'none', borderBottom: '3px solid transparent', backgroundColor: 'transparent', color: '#888', cursor: 'pointer' },
  
  conteudoAba: { padding: '30px' },
  textoAjuda: { color: '#666', fontSize: '13px', marginBottom: '25px', padding: '12px', backgroundColor: '#e8effd', borderRadius: '8px' },
  textoAjudaAviso: { color: '#d32f2f', fontSize: '13px', marginBottom: '25px', padding: '12px', backgroundColor: '#ffebee', borderRadius: '8px' },
  
  gridDuplo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '20px' },
  
  secao: { marginBottom: '25px' },
  tituloSecao: { color: '#1a237e', margin: '0 0 12px 0', fontSize: '15px', borderBottom: '1px solid #eee', paddingBottom: '5px' },
  textoLinha: { margin: '0 0 6px 0', fontSize: '14px', color: '#444' },
  tagIsento: { backgroundColor: '#e0e0e0', color: '#555', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  tagEscola: { backgroundColor: '#e8effd', color: '#1a237e', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  tagRede: { backgroundColor: '#f0f0f0', color: '#333', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', border: '1px solid #ddd' },
  
  secaoPrivada: { marginBottom: '20px', backgroundColor: '#fafafa', padding: '20px', borderRadius: '10px', border: '1px solid #eaeaea' },
  tituloSecaoPrivada: { color: '#d32f2f', margin: '0 0 12px 0', fontSize: '15px', borderBottom: '1px solid #f5c6cb', paddingBottom: '5px' },

  btnSecundario: { width: '100%', padding: '12px', backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' },
  
  areaAcao: { padding: '25px', backgroundColor: '#fff9c4', textAlign: 'center', borderTop: '1px dashed #f57f17' },
  btnAcao: { padding: '12px 30px', backgroundColor: '#f57f17', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }
};