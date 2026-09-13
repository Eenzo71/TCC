import React, { useState, useRef } from 'react';

interface PersonalizacaoProps {
  empresa: any;
  onAtualizarEmpresa?: (novaUrl: string) => void;
}

export default function PersonalizacaoLink({ empresa, onAtualizarEmpresa }: PersonalizacaoProps) {
  const imagemPadrao = '/images/ricoFeliz.png';
  
  const [imagemSelecionada, setImagemSelecionada] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(empresa?.imagem_login || imagemPadrao);
  const [carregando, setCarregando] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const linkConvite = `http://localhost:5174/?convite=${empresa?.slug_convite}`;

  const copiarLink = () => {
    navigator.clipboard.writeText(linkConvite);
    alert('✅ Link copiado para a área de transferência!');
  };

  const handleSelecionarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagemSelecionada(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSalvarPersonalizacao = async () => {
    if (!imagemSelecionada) return alert("Selecione uma nova imagem antes de salvar.");
    
    setCarregando(true);
    
    const formData = new FormData();
    formData.append('imagem', imagemSelecionada);
    formData.append('uid', empresa.id);

    try {
      const resposta = await fetch('http://localhost:3000/api/upload/logo', {
        method: 'POST',
        body: formData
      });

      const json = await resposta.json();

      if (resposta.ok && json.valido) {
        alert("🎉 Identidade visual atualizada com sucesso!");
        if (onAtualizarEmpresa) onAtualizarEmpresa(json.url);
        setImagemSelecionada(null);
      } else {
        alert(`⚠️ Erro: ${json.erro}`);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro de conexão com o servidor ao tentar fazer o upload.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.container}>
      
      <div style={styles.cabecalhoSecao}>
        <h2 style={{ margin: '0 0 5px 0', color: '#1a237e' }}>Link de Convite e Personalização</h2>
        <p style={{ margin: 0, color: '#666' }}>Compartilhe seu link e personalize a experiência dos seus passageiros.</p>
      </div>

      <div style={styles.gridDuplo}>
        
        <div style={styles.colunaControles}>
          
          <div style={styles.cardControle}>
            <h3 style={styles.tituloCard}>🔗 Seu Panfleto Digital</h3>
            <p style={styles.textoCard}>Envie este link no WhatsApp dos pais ou alunos para eles se vincularem à sua frota automaticamente.</p>
            <div style={styles.caixaLink}>{linkConvite}</div>
            <button onClick={copiarLink} style={styles.btnAcaoPrata}>Copiar Link Oficial</button>
          </div>

          <div style={styles.cardControle}>
            <h3 style={styles.tituloCard}>🎨 Imagem de Destaque</h3>
            <p style={styles.textoCard}>Esta imagem aparecerá na tela de Login e no Panfleto Digital da sua empresa. Recomendado: Foto da Van ou Logo.</p>
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleSelecionarArquivo}
            />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => fileInputRef.current?.click()} style={styles.btnUpload}>
                📂 Escolher Foto...
              </button>
              
              {imagemSelecionada && (
                <button onClick={handleSalvarPersonalizacao} disabled={carregando} style={styles.btnSalvarAzul}>
                  {carregando ? '⏳ Salvando...' : '💾 Salvar Imagem'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={styles.colunaPreview}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333', textAlign: 'center' }}>👀 Prévia do Login do Passageiro</h3>
          
          <div style={styles.telaMockupFundo}>
            <div style={styles.cardMockupLogin}>
              
              <div style={styles.mockupImagemBox}>
                <img src={preview} alt="Prévia" style={styles.mockupImagem} />
              </div>
              
              <div style={styles.mockupFormBox}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#111' }}>Login</h4>
                <div style={styles.mockupInput}></div>
                <div style={styles.mockupInput}></div>
                <div style={styles.mockupBtn}>ENTRAR</div>
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
  
  colunaControles: { display: 'flex', flexDirection: 'column', gap: '20px' },
  cardControle: { backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' },
  tituloCard: { margin: '0 0 10px 0', color: '#111', fontSize: '16px' },
  textoCard: { margin: '0 0 15px 0', color: '#666', fontSize: '13px', lineHeight: '1.4' },
  
  caixaLink: { backgroundColor: '#f4f4f9', padding: '12px 15px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', color: '#333', wordBreak: 'break-all', marginBottom: '15px', border: '1px dashed #ccc' },
  
  btnAcaoPrata: { width: '100%', padding: '12px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  btnUpload: { flex: 1, padding: '12px', backgroundColor: '#fff', color: '#1a237e', border: '2px solid #1a237e', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  btnSalvarAzul: { flex: 1, padding: '12px', backgroundColor: '#1a237e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },

  colunaPreview: { backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px dashed #ccc' },
  telaMockupFundo: { backgroundColor: '#d1e3ff', borderRadius: '12px', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  cardMockupLogin: { display: 'flex', width: '100%', maxWidth: '320px', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' },
  
  mockupImagemBox: { width: '45%', backgroundColor: '#f0f0f0', display: 'flex' },
  mockupImagem: { width: '100%', height: '100%', minHeight: '160px', objectFit: 'cover' },
  
  mockupFormBox: { width: '55%', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  mockupInput: { width: '100%', height: '20px', backgroundColor: '#e3f2fd', borderRadius: '4px', marginBottom: '10px' },
  mockupBtn: { padding: '6px 20px', backgroundColor: '#111', color: '#fff', fontSize: '10px', fontWeight: 'bold', borderRadius: '20px', marginTop: '5px' }
};