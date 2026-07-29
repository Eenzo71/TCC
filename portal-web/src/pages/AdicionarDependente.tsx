import React, { useState, useEffect } from 'react';
import { auth } from "../firebaseConfig";
import '../dependente.css';

interface AdicionarDependenteProps {
  empresaId: string;
  onSucesso: () => void;
  onCancelar: () => void;
}

interface EscolaBackend {
  nome: string;
  turmas: string[];
}

export default function AdicionarDependente({ empresaId, onSucesso, onCancelar }: AdicionarDependenteProps) {
  const [escolasDisponiveis, setEscolasDisponiveis] = useState<EscolaBackend[]>([]);
  const [carregandoEscolas, setCarregandoEscolas] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    email_app: '',
    senha_app: '',
    instituicao: '',
    turma: '',
    turmaManual: '',
    matricula: ''
  });

  // busca as escolas
  useEffect(() => {
    const buscarEscolas = async () => {
      if (!empresaId) return;
      try {
        const resposta = await fetch(`http://localhost:3000/api/empresa/${empresaId}/escolas`);
        if (resposta.ok) {
          const dados = await resposta.json();
          if (dados.escolas) setEscolasDisponiveis(dados.escolas);
        }
      } catch (error) {
        console.error("Erro ao buscar escolas:", error);
      }
      setCarregandoEscolas(false);
    };
    buscarEscolas();
  }, [empresaId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // se trocar de escola limpa a turma
    if (name === 'instituicao') {
      setFormData(prev => ({ ...prev, turma: '', turmaManual: '' }));
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    const user = auth.currentUser;
    if (!user) {
      alert("Erro de autenticação. Por favor, faça login novamente.");
      setSalvando(false);
      return;
    }

    if (formData.senha_app.length < 6) {
      alert("A senha de acesso do App precisa ter pelo menos 6 caracteres.");
      setSalvando(false);
      return;
    }

    try {
      const resposta = await fetch('http://localhost:3000/api/passageiros/cadastrar-dependente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responsavel_id: user.uid,
          empresa_id: empresaId,
          nome: formData.nome,
          dataNascimento: formData.dataNascimento,
          email_app: formData.email_app,
          senha_app: formData.senha_app,
          instituicao: formData.instituicao,
          turma: formData.turma,
          turmaManual: formData.turmaManual,
          matricula: formData.matricula
        })
      });

      const dados = await resposta.json();

      if (resposta.ok && dados.valido) {
        alert("✅ Passageiro adicionado com sucesso! A conta do App Mobile já está liberada.");
        onSucesso();
      } else {
        alert(`⚠️ Erro: ${dados.erro}`);
      }
    } catch (error) {
      alert("⚠️ Erro de conexão com o servidor.");
    } finally {
      setSalvando(false);
    }
  };

  const turmasDaEscolaSelecionada = escolasDisponiveis.find(e => e.nome === formData.instituicao)?.turmas || [];

  return (
    <div className='card'>
      <h3 className='tituloCard'>Adicionar Passageiro (Filho)</h3>
      <p className='descricaoCard'>
        Cadastre os dados do estudante e crie as credenciais para ele acessar o App Mobile (QR Code).
      </p>

      <form onSubmit={handleSalvar} className='form'>
        
        {/* dados basicos */}
        <div className='blocoGrupo'>
          <h4 className='tituloBloco'>👤 Dados Pessoais</h4>
          <div className='campo'>
            <label className='label'>Nome Completo:</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className='input' />
          </div>
          <div className='campo'>
            <label className='label'>Data de Nascimento:</label>
            <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required className='input' />
          </div>
        </div>

        {/* acesso ao app */}
        <div className='blocoGrupo'>
          <h4 className='tituloBloco'>📱 Acesso ao App Mobile</h4>
          <p className='descricaoBloco'>
            Crie um e-mail fictício (ex: enzo@busgap.com) ou use um real.
          </p>
          <div className='campo'>
            <label className='label'>E-mail de Acesso (App):</label>
            <input type="email" name="email_app" value={formData.email_app} onChange={handleChange} required className='input' placeholder="aluno@email.com" />
          </div>
          <div className='campo'>
            <label className='label'>Senha de Acesso (App):</label>
            <input type="password" name="senha_app" value={formData.senha_app} onChange={handleChange} required className='input' placeholder="Mínimo 6 caracteres" />
          </div>
        </div>

        {/* dados escolares */}
        <div className='blocoGrupo'>
          <h4 className='tituloBloco'>🏫 Escola e Turma</h4>
          {carregandoEscolas ? (
            <p style={{ fontSize: '13px', color: '#888' }}>Buscando escolas da frota...</p>
          ) : (
            <>
              <div className='campo'>
                <label className='label'>Instituição / Escola:</label>
                <select name="instituicao" value={formData.instituicao} onChange={handleChange} required className='input'>
                  <option value="">Selecione a escola...</option>
                  {escolasDisponiveis.map((e, i) => <option key={i} value={e.nome}>{e.nome}</option>)}
                </select>
              </div>

              {formData.instituicao && (
                <>
                  <div className='campo'>
                    <label className='label'>Turma / Ano:</label>
                    <select name="turma" value={formData.turma} onChange={handleChange} required className='input'>
                      <option value="">Selecione a turma...</option>
                      {turmasDaEscolaSelecionada.map((t, i) => <option key={i} value={t}>{t}</option>)}
                      <option value="outra">⚠️ Outra / Não encontrei</option>
                    </select>
                  </div>

                  {formData.turma === 'outra' && (
                    <div className='campo'>
                      <label className='label' style={{ color: '#d32f2f' }}>Digite a turma manualmente:</label>
                      <input type="text" name="turmaManual" value={formData.turmaManual} onChange={handleChange} required className="input" placeholder="Ex: 5º Ano C" />
                    </div>
                  )}

                  <div className='campo'>
                    <label className='label'>Número de Matrícula (Opcional):</label>
                    <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} className="input" placeholder="Matrícula escolar" />
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className='botoes'>
          <button type="button" onClick={onCancelar} className='btnVoltar' disabled={salvando}>Cancelar</button>
          <button type="submit" className='btnAvancar' disabled={salvando}>
            {salvando ? 'Salvando...' : 'Adicionar Filho'}
          </button>
        </div>
      </form>
    </div>
  );
}

