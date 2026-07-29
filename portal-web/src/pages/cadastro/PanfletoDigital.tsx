import React, { useEffect, useState } from 'react';

interface PanfletoProps {
  slugConvite: string;
  irParaCadastroResponsavel: () => void;
  irParaCadastroAlunoMaior: () => void;
}

export default function PanfletoDigital({ slugConvite, irParaCadastroResponsavel, irParaCadastroAlunoMaior }: PanfletoProps) {
  const [empresa, setEmpresa] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const buscarEmpresa = async () => {
      try {
        const resposta = await fetch(`http://localhost:3000/api/empresa/convite/${slugConvite}`);
        const dados = await resposta.json();

        if (resposta.ok && dados.valido) {
          setEmpresa(dados.empresa);
        } else {
          setErro(dados.erro || 'Convite não encontrado.');
        }
      } catch (error) {
        setErro('Erro de conexão com o servidor do BusGap.');
      } finally {
        setCarregando(false);
      }
    };

    if (slugConvite) {
      buscarEmpresa();
    } else {
      setCarregando(false);
    }
  }, [slugConvite]);

  const handleCadastroResponsavel = () => {
    if (empresa) {
      localStorage.setItem('empresa_vinculada', empresa.id);
    } else {
      localStorage.removeItem('empresa_vinculada'); 
    }
    irParaCadastroResponsavel();
  };

  const handleCadastroMaior = () => {
    if (empresa) {
      localStorage.setItem('empresa_vinculada', empresa.id);
    } else {
      localStorage.removeItem('empresa_vinculada');
    }
    irParaCadastroAlunoMaior();
  };

  if (carregando) return <div style={styles.telaInteira}>Carregando...</div>;
  if (erro) return <div style={styles.telaInteira}><h2 style={{ color: '#d32f2f' }}>{erro}</h2></div>;

  const tituloSecundario = empresa ? 'Convite Oficial' : 'Bem-vindo ao BusGap';
  const tituloPrincipal = empresa ? empresa.nomeFantasia : 'Escolha seu Perfil';
  const descricao = empresa 
    ? 'Escolha o seu perfil abaixo para se vincular à frota.' 
    : 'Escolha seu perfil. Você poderá vincular-se a uma van depois usando um código escolar.';

  return (
    <div style={styles.telaInteira}>
      <div style={styles.panfleto}>
        <div style={styles.cabecalho}>
          <h3 style={{ color: '#4caf50', margin: 0 }}>{tituloSecundario}</h3>
          <h1 style={{ color: '#111', marginTop: '10px' }}>{tituloPrincipal}</h1>
          <p style={{ color: '#555' }}>{descricao}</p>
        </div>

        <div style={styles.botoesContainer}>
          <button onClick={handleCadastroResponsavel} style={styles.btnPrimario}>
            👨‍👩‍👧 Cadastro de Pais / Responsáveis
            <span style={styles.subTextoBtn}>Para cadastrar seus filhos no transporte</span>
          </button>

          <button onClick={handleCadastroMaior} style={styles.btnSecundario}>
            🎓 Cadastro de Aluno (+18)
            <span style={styles.subTextoBtn}>Para universitários ou maiores de idade</span>
          </button>

          <hr style={{ width: '100%', border: '1px solid #eee', margin: '20px 0' }} />

          <button onClick={() => alert("Em breve na Play Store!")} style={styles.btnApp}>
            📱 Baixar o Aplicativo
            <span style={styles.subTextoBtn}>Baixe o app oficial do BusGap para acompanhar a rota</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  telaInteira: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f4f9', fontFamily: 'sans-serif' },
  panfleto: { width: '450px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', overflow: 'hidden', textAlign: 'center' },
  cabecalho: { padding: '30px', backgroundColor: '#fafafa', borderBottom: '1px solid #eaeaea' },
  botoesContainer: { padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' },
  btnPrimario: { backgroundColor: '#111', color: '#fff', padding: '15px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  btnSecundario: { backgroundColor: '#fff', color: '#111', padding: '15px', border: '2px solid #111', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  btnApp: { backgroundColor: '#e3f2fd', color: '#1565c0', padding: '15px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  subTextoBtn: { fontSize: '12px', fontWeight: 'normal', opacity: 0.8, marginTop: '5px' }
};