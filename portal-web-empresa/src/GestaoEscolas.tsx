import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface Escola {
  nome: string;
  turmas: string[];
}

export default function GestaoEscolas() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [novaEscola, setNovaEscola] = useState('');
  const [novaTurma, setNovaTurma] = useState('');
  const [escolaSelecionada, setEscolaSelecionada] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  // busca as escolas que a empresa já cadastrou no Firebase
  useEffect(() => {
    const buscarEscolas = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'empresas', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().escolas_atendidas) {
          setEscolas(docSnap.data().escolas_atendidas);
        }
      }
      setCarregando(false);
    };
    buscarEscolas();
  }, []);

  // adiciona uma nova Instituição
  const handleAdicionarEscola = async () => {
    if (!novaEscola.trim()) return;
    const user = auth.currentUser;
    if (!user) return;

    const novaEscolaObj: Escola = { nome: novaEscola.trim(), turmas: [] };
    const novasEscolas = [...escolas, novaEscolaObj];

    try {
      await updateDoc(doc(db, 'empresas', user.uid), {
        escolas_atendidas: novasEscolas
      });
      setEscolas(novasEscolas);
      setNovaEscola('');
    } catch (error) {
      alert("Erro ao salvar escola.");
    }
  };

  // adiciona uma nova Turma dentro de uma Instituição
  const handleAdicionarTurma = async (nomeEscola: string) => {
    if (!novaTurma.trim()) return;
    const user = auth.currentUser;
    if (!user) return;

    const novasEscolas = escolas.map(esc => {
      if (esc.nome === nomeEscola) {
        if (!esc.turmas.includes(novaTurma.trim())) {
          return { ...esc, turmas: [...esc.turmas, novaTurma.trim()] };
        }
      }
      return esc;
    });

    try {
      await updateDoc(doc(db, 'empresas', user.uid), {
        escolas_atendidas: novasEscolas
      });
      setEscolas(novasEscolas);
      setNovaTurma('');
      setEscolaSelecionada(null);
    } catch (error) {
      alert("Erro ao salvar turma.");
    }
  };

  const handleRemoverEscola = async (escolaParaRemover: Escola) => {
    if(!window.confirm(`Tem certeza que quer apagar a escola ${escolaParaRemover.nome}?`)) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, 'empresas', user.uid), {
        escolas_atendidas: arrayRemove(escolaParaRemover)
      });
      setEscolas(escolas.filter(e => e.nome !== escolaParaRemover.nome));
    } catch (error) {
      alert("Erro ao remover escola.");
    }
  };

  if (carregando) return <p>Carregando escolas...</p>;

  return (
    <div style={styles.container}>
      <h2 style={{ color: '#1a237e', marginBottom: '5px' }}>🏫 Escolas e Turmas Atendidas</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Cadastre as escolas e turmas que você atende. Elas aparecerão automaticamente no formulário de matrícula dos seus passageiros.
      </p>

      {/* nova esxola */}
      <div style={styles.cardAdicionar}>
        <input 
          style={styles.input} 
          placeholder="Ex: IFNMG - Campus Janaúba" 
          value={novaEscola} 
          onChange={e => setNovaEscola(e.target.value)} 
        />
        <button style={styles.btnPrimario} onClick={handleAdicionarEscola}>
          + Nova Instituição
        </button>
      </div>

      {/* lista de esxolas e trumas */}
      <div style={styles.gridEscolas}>
        {escolas.map((escola, index) => (
          <div key={index} style={styles.cardEscola}>
            <div style={styles.cabecalhoEscola}>
              <h3 style={{ margin: 0, color: '#333' }}>{escola.nome}</h3>
              <button style={styles.btnExcluir} onClick={() => handleRemoverEscola(escola)}>🗑️</button>
            </div>

            <div style={styles.areaTurmas}>
              {escola.turmas.length === 0 ? (
                <span style={{ fontSize: '13px', color: '#999' }}>Nenhuma turma cadastrada.</span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {escola.turmas.map((turma, i) => (
                    <span key={i} style={styles.tagTurma}>{turma}</span>
                  ))}
                </div>
              )}
            </div>

            {/* add nova trumas */}
            {escolaSelecionada === escola.nome ? (
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <input 
                  autoFocus
                  style={styles.inputPequeno} 
                  placeholder="Ex: 1º INFO A" 
                  value={novaTurma} 
                  onChange={e => setNovaTurma(e.target.value)} 
                />
                <button style={styles.btnSecundario} onClick={() => handleAdicionarTurma(escola.nome)}>Salvar</button>
                <button style={styles.btnCancelar} onClick={() => setEscolaSelecionada(null)}>X</button>
              </div>
            ) : (
              <button style={styles.btnSecundario} onClick={() => setEscolaSelecionada(escola.nome)}>
                + Adicionar Turma
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: '20px', width: '100%', boxSizing: 'border-box' },
  cardAdicionar: { display: 'flex', gap: '10px', marginBottom: '30px', backgroundColor: '#fff', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' },
  inputPequeno: { flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' },
  btnPrimario: { padding: '0 20px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  btnSecundario: { marginTop: '15px', padding: '8px 15px', backgroundColor: '#e8effd', color: '#1a237e', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  btnCancelar: { marginTop: '15px', padding: '8px 12px', backgroundColor: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnExcluir: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  gridEscolas: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  cardEscola: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eee' },
  cabecalhoEscola: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' },
  areaTurmas: { minHeight: '40px' },
  tagTurma: { backgroundColor: '#1a237e', color: '#fff', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }
};