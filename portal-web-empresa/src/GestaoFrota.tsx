import React, { useState, useEffect } from 'react';
import { db, auth } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function GestaoFrota() {
  const [motoristas, setMotoristas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [emailApp, setEmailApp] = useState('');
  const [senhaApp, setSenhaApp] = useState('');
  const [placa, setPlaca] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnh, setCnh] = useState('');

  const buscarMotoristas = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setCarregando(true);
    try {
      const q = query(collection(db, 'motoristas'), where('empresa_id', '==', user.uid));
      const snap = await getDocs(q);
      setMotoristas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Erro ao buscar frota:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarMotoristas();
  }, []);

  const abrirModalNovo = () => {
    setEditandoId(null);
    setNome(''); setEmailApp(''); setSenhaApp(''); setPlaca(''); setVeiculo('');
    setCpf(''); setCnh('');
    setMostrarModal(true);
  };

  const abrirModalEditar = (mot: any) => {
    setEditandoId(mot.id);
    setNome(mot.nome || '');
    setEmailApp(mot.email || '');
    setSenhaApp('');
    setPlaca(mot.placa || '');
    setVeiculo(mot.veiculo || '');
    setCpf(mot.cpf || '');
    setCnh(mot.cnh || '');
    setMostrarModal(true);
  };

  const handleSalvarMotorista = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      const endpoint = editandoId 
        ? `http://localhost:3000/api/motorista/atualizar/${editandoId}` 
        : 'http://localhost:3000/api/motorista/cadastrar';

      const metodo = editandoId ? 'PUT' : 'POST';

      const resposta = await fetch(endpoint, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: user.uid,
          nome,
          email: emailApp,
          senha: senhaApp,
          placa,
          veiculo,
          cpf,
          cnh
        })
      });

      const dados = await resposta.json();

      if (resposta.ok && dados.valido) {
        alert(editandoId ? "✅ Motorista atualizado com sucesso!" : "✅ Motorista cadastrado com sucesso!");
        setMostrarModal(false);
        buscarMotoristas();
      } else {
        alert(`⚠️ Erro: ${dados.erro}`);
      }
    } catch (error) {
      alert("Erro de conexão com o servidor.");
    }
  };

  const excluirMotorista = async (motoristaId: string) => {
    if (!window.confirm("Tem certeza que deseja remover este motorista da frota?")) return;

    try {
      const resposta = await fetch(`http://localhost:3000/api/motorista/deletar/${motoristaId}`, {
        method: 'DELETE',
      });
      const json = await resposta.json();

      if (json.valido) {
        setMotoristas(prev => prev.filter(m => m.id !== motoristaId));
        alert("✅ Motorista removido com sucesso!");
      } else {
        alert("⚠️ Erro: " + json.erro);
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
      alert("Erro de conexão ao tentar excluir.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#1a237e', margin: '0 0 5px 0' }}>🚐 Gestão de Frota e Motoristas</h2>
          <p style={{ color: '#666', margin: 0 }}>Cadastre e gerencie os motoristas da sua operação.</p>
        </div>
        {!mostrarModal && (
          <button onClick={abrirModalNovo} style={styles.btnPrimario}>
            + Novo Motorista
          </button>
        )}
      </div>

      {mostrarModal && (
        <div style={styles.cardForm}>
          <h3 style={{ marginTop: 0, color: '#1a237e' }}>{editandoId ? '✏️ Editar Motorista' : '➕ Cadastrar Novo Motorista'}</h3>
          <form onSubmit={handleSalvarMotorista} style={styles.formGrid}>
            <input placeholder="Nome do Motorista" value={nome} onChange={e => setNome(e.target.value)} required style={styles.input} />
            <input placeholder="CPF (000.000.000-00)" value={cpf} onChange={e => setCpf(e.target.value)} required style={styles.input} />
            <input placeholder="Número da CNH" value={cnh} onChange={e => setCnh(e.target.value)} required style={styles.input} />
            <input placeholder="Veículo (Ex: Van Ducato)" value={veiculo} onChange={e => setVeiculo(e.target.value)} required style={styles.input} />
            <input placeholder="Placa (Ex: ABC-1234)" value={placa} onChange={e => setPlaca(e.target.value)} required style={styles.input} />
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', margin: '10px 0' }}></div>
            <p style={{ gridColumn: '1 / -1', margin: 0, fontSize: '13px', color: '#1a237e', fontWeight: 'bold' }}>Credenciais para o App Mobile:</p>
            <input type="email" placeholder="E-mail de Acesso" value={emailApp} onChange={e => setEmailApp(e.target.value)} required style={styles.input} />
            <input type="text" placeholder={editandoId ? "Nova Senha (deixe em branco se não mudar)" : "Senha Provisória"} value={senhaApp} onChange={e => setSenhaApp(e.target.value)} style={styles.input} />

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" onClick={() => setMostrarModal(false)} style={styles.btnCancelar}>Cancelar</button>
              <button type="submit" style={styles.btnPrimario}>{editandoId ? 'Salvar Alterações' : 'Salvar e Liberar Acesso'}</button>
            </div>
          </form>
        </div>
      )}

      {carregando ? <p>Carregando frota...</p> : (
        <div style={styles.gridFrota}>
          {motoristas.length === 0 && !mostrarModal ? (
            <p style={{ color: '#888' }}>Nenhum motorista cadastrado ainda.</p>
          ) : (
            motoristas.map(mot => (
              <div key={mot.id} style={styles.cardMotoristaItem}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#333' }}>🚐 {mot.veiculo} ({mot.placa})</p>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#666' }}>Motorista: {mot.nome}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    onClick={() => abrirModalEditar(mot)}
                    style={styles.btnEditarMotorista}
                    title="Editar motorista"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => excluirMotorista(mot.id)}
                    style={styles.btnExcluirMotorista}
                    title="Remover motorista"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: '20px', width: '100%', boxSizing: 'border-box' },
  btnPrimario: { padding: '10px 20px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  btnCancelar: { padding: '10px 20px', backgroundColor: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  cardForm: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px', border: '2px solid #e8effd' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' },
  gridFrota: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' },
  cardMotoristaItem: { backgroundColor: '#fff', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #1a237e' },
  
  btnEditarMotorista: { padding: '5px 10px', backgroundColor: '#e3f2fd', color: '#1565c0', border: '1px solid #bbdefb', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' },
  btnExcluirMotorista: { padding: '5px 10px', backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }
};