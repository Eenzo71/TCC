import React, { useState, useRef } from 'react';
import { auth } from './firebaseConfig';

interface PersonalizacaoProps {
  empresa: any;
  onAtualizarEmpresa?: (novaUrl: string, tipo: 'capa' | 'fundo') => void;
}

export default function PersonalizacaoLink({ empresa, onAtualizarEmpresa }: PersonalizacaoProps) {
  const imagemPadrao = '/images/ricoFeliz.png';
  
  // Estados independentes para Capa e Fundo
  const [capaSelecionada, setCapaSelecionada] = useState<File | null>(null);
  const [previewCapa, setPreviewCapa] = useState<string>(empresa?.imagem_capa || imagemPadrao);
  
  const [fundoSelecionado, setFundoSelecionado] = useState<File | null>(null);
  const [previewFundo, setPreviewFundo] = useState<string>(empresa?.imagem_fundo || imagemPadrao);
  
  const [carregandoCapa, setCarregandoCapa] = useState(false);
  const [carregandoFundo, setCarregandoFundo] = useState(false);
  
  const fileInputCapaRef = useRef<HTMLInputElement>(null);
  const fileInputFundoRef = useRef<HTMLInputElement>(null);
  
  const linkConvite = `http://localhost:5174/?convite=${empresa?.slug_convite || ''}`;

  const copiarLink = () => {
    navigator.clipboard.writeText(linkConvite);
    alert('✅ Link copiado para a área de transferência!');
  };

  const handleSelecionarArquivo = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'capa' | 'fundo') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      
      if (tipo === 'capa') {
        setCapaSelecionada(file);
        setPreviewCapa(previewUrl);
      } else {
        setFundoSelecionado(file);
        setPreviewFundo(previewUrl);
      }
    }
  };

  const handleSalvarUpload = async (tipo: 'capa' | 'fundo') => {
    const arquivo = tipo === 'capa' ? capaSelecionada : fundoSelecionado;
    if (!arquivo) return;
    
    // Define qual loading ativar
    const setCarregando = tipo === 'capa' ? setCarregandoCapa : setCarregandoFundo;
    setCarregando(true);
    
    // 🛡️ BLINDAGEM: Tenta pegar o ID da empresa de várias formas seguras (nunca mais vai dar crash de "null")
    const uidDaEmpresa = empresa?.id || empresa?.uid || auth.currentUser?.uid;

    if (!uidDaEmpresa) {
      alert("⚠️️ Erro: Não foi possível identificar a empresa. Atualize a página e tente novamente.");
      setCarregando(false); // Destrava o botão
      return;
    }

    const formData = new FormData();
    formData.append('tipo', tipo);
    formData.append('uid', uidDaEmpresa);
    formData.append('imagem', arquivo);

    try {
      const resposta = await fetch('http://localhost:3000/api/upload/logo', {
        method: 'POST',
        body: formData
      });

      const json = await resposta.json();

      if (resposta.ok && json.valido) {
        alert(`🎉 Imagem de ${tipo} atualizada com sucesso!`);
        if (onAtualizarEmpresa) onAtualizarEmpresa(json.url, tipo);
        
        if (tipo === 'capa') setCapaSelecionada(null);
        else setFundoSelecionado(null);
      } else {
        alert(`⚠️ Erro: ${json.erro}`);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro de conexão com o servidor ao tentar fazer o upload.");
    } finally {
      // Garante que o botão vai voltar ao normal, mesmo se a internet cair
      setCarregando(false);
    }
  };

  return (
    <div style={styles.container}>
      
      <div style={styles.cabecalhoSecao}>
        <h2 style={{ margin: '0 0 5px 0', color: '#1a237e' }}>Identidade Visual do Panfleto</h2>
        <p style={{ margin: 0, color: '#666' }}>Personalize as imagens que os pais e alunos verão ao abrir seu link de convite.</p>
      </div>

      <div style={styles.gridDuplo}>
        
        {/* COLUNA ESQUERDA: CONTROLES E UPLOADS */}
        <div style={styles.colunaControles}>
          
          <div style={styles.cardControle}>
            <h3 style={styles.tituloCard}>🔗 Seu Link de Convite</h3>
            <p style={styles.textoCard}>Envie este link no WhatsApp para pais ou alunos se vincularem à sua frota.</p>
            <div style={styles.caixaLink}>{linkConvite}</div>
            <button onClick={copiarLink} style={styles.btnAcaoPrata}>Copiar Link Oficial</button>
          </div>

          {/* UPLOAD DA CAPA */}
          <div style={styles.cardControle}>
            <h3 style={styles.tituloCard}>🖼️ Imagem da Capa</h3>
            <p style={styles.textoCard}>Aparece no topo do panfleto. Ideal para a logo da empresa ou foto da van.</p>
            <input type="file" accept="image/*" ref={fileInputCapaRef} style={{ display: 'none' }} onChange={(e) => handleSelecionarArquivo(e, 'capa')} />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => fileInputCapaRef.current?.click()} style={styles.btnUpload}>📂 Alterar Capa...</button>
              {capaSelecionada && (
                <button onClick={() => handleSalvarUpload('capa')} disabled={carregandoCapa} style={styles.btnSalvarAzul}>
                  {carregandoCapa ? '⏳ Salvando...' : '💾 Salvar'}
                </button>
              )}
            </div>
          </div>

          {/* UPLOAD DO FUNDO */}
          <div style={styles.cardControle}>
            <h3 style={styles.tituloCard}>🌌 Imagem de Fundo</h3>
            <p style={styles.textoCard}>Aparece desfocada no fundo da tela inteira, dando um efeito moderno.</p>
            <input type="file" accept="image/*" ref={fileInputFundoRef} style={{ display: 'none' }} onChange={(e) => handleSelecionarArquivo(e, 'fundo')} />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => fileInputFundoRef.current?.click()} style={styles.btnUpload}>📂 Alterar Fundo...</button>
              {fundoSelecionado && (
                <button onClick={() => handleSalvarUpload('fundo')} disabled={carregandoFundo} style={styles.btnSalvarAzul}>
                  {carregandoFundo ? '⏳ Salvando...' : '💾 Salvar'}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: MOCKUP DO PANFLETO */}
        <div style={styles.colunaPreview}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333', textAlign: 'center' }}>👀 Prévia do Panfleto Digital</h3>
          
          <div style={{
            ...styles.telaMockupFundo,
            backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.75), rgba(17, 24, 39, 0.85)), url(${previewFundo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            <div style={styles.cardMockupPanfleto}>
              
              <div style={styles.mockupImagemBox}>
                <img src={previewCapa} alt="Prévia Capa" style={styles.mockupImagem} />
              </div>
              
              <div style={styles.mockupConteudo}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '10px', color: '#4caf50' }}>Convite Oficial</h4>
                <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#111' }}>{empresa?.nomeFantasia || 'Sua Frota'}</h2>
                
                <div style={styles.mockupBtnEscuro}>👨‍👩‍‍👧 Pais / Responsáveis</div>
                <div style={styles.mockupBtnClaro}>🎓 Aluno (+18)</div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { height: '100%', display: 'flex', flexDirection: 'column' },
  cabecalhoSecao: { marginBottom: '25px' },
  gridDuplo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' },
  
  colunaControles: { display: 'flex', flexDirection: 'column', gap: '15px' },
  cardControle: { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' },
  tituloCard: { margin: '0 0 8px 0', color: '#111', fontSize: '15px' },
  textoCard: { margin: '0 0 12px 0', color: '#666', fontSize: '12px', lineHeight: '1.4' },
  
  caixaLink: { backgroundColor: '#f4f4f9', padding: '10px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', color: '#333', wordBreak: 'break-all', marginBottom: '10px', border: '1px dashed #ccc' },
  
  btnAcaoPrata: { width: '100%', padding: '10px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  btnUpload: { flex: 2, padding: '10px', backgroundColor: '#fff', color: '#1a237e', border: '2px solid #1a237e', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  btnSalvarAzul: { flex: 1, padding: '10px', backgroundColor: '#1a237e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },

  colunaPreview: { backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px dashed #ccc' },
  telaMockupFundo: { borderRadius: '12px', padding: '30px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', overflow: 'hidden' },
  
  cardMockupPanfleto: { display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '220px', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' },
  mockupImagemBox: { width: '100%', height: '80px', backgroundColor: '#f0f0f0' },
  mockupImagem: { width: '100%', height: '100%', objectFit: 'cover' },
  
  mockupConteudo: { padding: '15px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' },
  mockupBtnEscuro: { width: '100%', padding: '8px', backgroundColor: '#111', color: '#fff', fontSize: '10px', fontWeight: 'bold', borderRadius: '6px' },
  mockupBtnClaro: { width: '100%', padding: '8px', backgroundColor: '#fff', color: '#111', border: '1px solid #111', fontSize: '10px', fontWeight: 'bold', borderRadius: '6px' }
};