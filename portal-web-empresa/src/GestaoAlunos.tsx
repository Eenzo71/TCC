import React, { useState, useEffect } from 'react';

interface GestaoAlunosProps {
  empresaId: string;
}

export default function GestaoAlunos({ empresaId }: GestaoAlunosProps) {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const buscarAlunosDaEmpresa = async () => {
      if (!empresaId) return;
      try {
        const resposta = await fetch(`http://localhost:3000/api/passageiros/alunos/${empresaId}`);
        const json = await resposta.json();
        if (json.valido) {
          setAlunos(json.alunos);
        }
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
      } finally {
        setCarregando(false);
      }
    };

    buscarAlunosDaEmpresa();
  }, [empresaId]);

  const alunosFiltrados = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
    aluno.escola.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.cabecalhoSecao}>
        <div>
          <h2 style={{ color: '#1a237e', margin: '0 0 5px 0' }}>🎓 Gestão de Alunos / Passageiros</h2>
          <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Lista oficial de estudantes vinculados à sua frota para o transporte diário.</p>
        </div>
        <div style={styles.badgeTotal}>
          Total: <strong>{alunos.length}</strong> alunos
        </div>
      </div>

      <div style={styles.areaBusca}>
        <input
          type="text"
          placeholder="🔍 Pesquisar por nome do aluno ou escola..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={styles.inputBusca}
        />
      </div>

      {carregando ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>⏳ A carregar passageiros...</p>
      ) : alunosFiltrados.length === 0 ? (
        <div style={styles.semAlunos}>
          <p style={{ margin: 0, color: '#888' }}>Nenhum aluno encontrado ou vinculado via panfleto digital ainda.</p>
        </div>
      ) : (
        <div style={styles.tabelaContainer}>
          <table style={styles.tabela}>
            <thead>
              <tr style={styles.trCabecalho}>
                <th style={styles.th}>Nome do Aluno</th>
                <th style={styles.th}>Tipo de Perfil</th>
                <th style={styles.th}>Instituição / Escola</th>
                <th style={styles.th}>Turma</th>
                <th style={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {alunosFiltrados.map((aluno, index) => {
                const isMenor = aluno.tipo === 'dependente' || aluno.tipo === 'menor_idade';

                return (
                  <tr key={index} style={styles.trLinha}>
                    <td style={styles.td}><strong>{aluno.nome}</strong></td>
                    <td style={styles.td}>
                      <span style={isMenor ? styles.tagDependente : styles.tagMaior}>
                        {isMenor ? '👦 Dependente (Menor)' : '🎓 Aluno Maior (+18)'}
                      </span>
                    </td>
                    <td style={styles.td}>🏫 {aluno.escola}</td>
                    <td style={styles.td}>{aluno.turma}</td>
                    <td style={styles.td}>
                      <span style={styles.tagAtivo}>Vinculado ✅</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: '20px', width: '100%', boxSizing: 'border-box' },
  cabecalhoSecao: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  badgeTotal: { backgroundColor: '#e8effd', color: '#1a237e', padding: '8px 15px', borderRadius: '20px', fontSize: '13px' },

  areaBusca: { marginBottom: '20px' },
  inputBusca: { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #ccc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },

  semAlunos: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #eee' },

  tabelaContainer: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #eee' },
  tabela: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  trCabecalho: { backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' },
  th: { padding: '15px', fontSize: '13px', color: '#444', fontWeight: 'bold' },
  trLinha: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '15px', fontSize: '14px', color: '#333' },

  tagDependente: { backgroundColor: '#e1f5fe', color: '#01579b', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
  tagMaior: { backgroundColor: '#f3e5f5', color: '#4a148c', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
  tagAtivo: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }
};