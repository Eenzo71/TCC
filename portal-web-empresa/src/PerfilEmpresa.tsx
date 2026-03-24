import React, { useEffect, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import CryptoJS from 'crypto-js';

interface PerfilEmpresaProps {
  irParaPainel: () => void;
  irParaCompletar: () => void;
}

export default function PerfilEmpresa({ irParaPainel, irParaCompletar }: PerfilEmpresaProps) {
  const [dados, setDados] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "empresas", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const bd = docSnap.data();
          const CHAVE_SECRETA = import.meta.env.VITE_alululu;

          // Função rápida para descriptografar os textos
          const descriptografar = (textoCifrado: string) => {
            if (!textoCifrado) return "";
            try {
              const bytes = CryptoJS.AES.decrypt(textoCifrado, CHAVE_SECRETA);
              return bytes.toString(CryptoJS.enc.Utf8);
            } catch (e) {
              return "Erro ao descriptografar";
            }
          };

          // Montando o objeto legível
          setDados({
            razaoSocial: bd.razaoSocial,
            nomeFantasia: bd.nomeFantasia,
            cnpj: descriptografar(bd.cnpj),
            telefone: descriptografar(bd.telefone),
            responsavelNome: descriptografar(bd.responsavelLegal?.nome),
            responsavelCpf: descriptografar(bd.responsavelLegal?.cpf),
            endereco: {
              cep: descriptografar(bd.endereco?.cep),
              rua: descriptografar(bd.endereco?.rua),
              numero: descriptografar(bd.endereco?.numero),
              bairro: descriptografar(bd.endereco?.bairro),
              cidade: descriptografar(bd.endereco?.cidade),
              estado: descriptografar(bd.endereco?.estado),
              complemento: descriptografar(bd.endereco?.complemento)
            },
            dataCadastro: new Date(bd.data_cadastro).toLocaleDateString('pt-BR'),
            perfilCompleto: bd.perfil_completo
          });
        }
      }
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  if (carregando) return <div style={styles.telaInteira}>Carregando dados...</div>;

  return (
    <div style={styles.telaInteira}>
      <div style={styles.caixa}>
        <div style={styles.cabecalho}>
          <h2 style={{ margin: 0, color: '#111' }}>Perfil da Empresa</h2>
          <button onClick={irParaPainel} style={styles.btnVoltar}>Voltar ao Painel</button>
        </div>

        <div style={styles.secao}>
          <h3 style={styles.tituloSecao}>Dados Jurídicos</h3>
          <p><strong>Razão Social:</strong> {dados?.razaoSocial}</p>
          <p><strong>Nome Fantasia:</strong> {dados?.nomeFantasia}</p>
          <p><strong>CNPJ:</strong> {dados?.cnpj}</p>
          <p><strong>Cadastrado em:</strong> {dados?.dataCadastro}</p>
          <p><strong>Status do Perfil:</strong> <span style={{ color: dados?.perfilCompleto ? '#4caf50' : '#f57f17', fontWeight: 'bold' }}>{dados?.perfilCompleto ? 'Completo' : 'Incompleto (Pendente)'}</span></p>
        </div>

        <div style={styles.secao}>
          <h3 style={styles.tituloSecao}>Responsável Legal</h3>
          <p><strong>Nome:</strong> {dados?.responsavelNome}</p>
          <p><strong>CPF:</strong> {dados?.responsavelCpf}</p>
          <p><strong>Telefone / WhatsApp:</strong> {dados?.telefone}</p>
        </div>

        <div style={styles.secao}>
          <h3 style={styles.tituloSecao}>Endereço da Garagem</h3>
          <p><strong>CEP:</strong> {dados?.endereco.cep}</p>
          <p><strong>Logradouro:</strong> {dados?.endereco.rua}, {dados?.endereco.numero} {dados?.endereco.complemento && `- ${dados?.endereco.complemento}`}</p>
          <p><strong>Bairro:</strong> {dados?.endereco.bairro}</p>
          <p><strong>Cidade/UF:</strong> {dados?.endereco.cidade} - {dados?.endereco.estado}</p>
        </div>

        {/* Aqui depois vamos colocar os inputs pra enviar documento e atualizar o perfil_completo pra true */}
        {!dados?.perfilCompleto && (
          <div style={styles.areaAcao}>
            <p style={{ color: '#555', fontSize: '14px', marginBottom: '15px' }}>Você precisa enviar seus documentos para completar a verificação.</p>
            <button onClick={irParaCompletar} style={styles.btnAcao}>
              Completar Perfil Agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  telaInteira: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f4f9', fontFamily: 'sans-serif', padding: '20px' },
  caixa: { width: '600px', padding: '40px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'left' },
  cabecalho: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' },
  btnVoltar: { padding: '8px 15px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  secao: { marginBottom: '25px', backgroundColor: '#fafafa', padding: '15px', borderRadius: '10px', border: '1px solid #eaeaea' },
  tituloSecao: { color: '#4caf50', margin: '0 0 15px 0', fontSize: '18px' },
  areaAcao: { marginTop: '30px', padding: '20px', backgroundColor: '#fff9c4', borderRadius: '10px', textAlign: 'center', border: '1px dashed #f57f17' },
  btnAcao: { padding: '12px 24px', backgroundColor: '#f57f17', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }
};