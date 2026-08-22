import React, { useState } from 'react';
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from 'firebase/auth';

// Mapinha
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface CadastroAlunoMaiorProps {
  irParaPainel: () => void;
  irParaVoltar: () => void;
}

interface EscolaBackend {
  nome: string;
  turmas: string[];
  empresa_id: string; 
}

export default function CadastroAlunoMaior({ irParaPainel, irParaVoltar }: CadastroAlunoMaiorProps) {
  const [step, setStep] = useState(1);
  const [carregandoFinal, setCarregandoFinal] = useState(false);

  // Escolas da Cidade
  const [escolasDisponiveis, setEscolasDisponiveis] = useState<EscolaBackend[]>([]);
  const [carregandoEscolas, setCarregandoEscolas] = useState(false);

  const [formData, setFormData] = useState({
    // Etapa 1
    email: '', password: '', confirmPassword: '',
    // Etapa 2
    nome: '', cpf: '', dataNascimento: '', celular: '', telefoneEmergencia: '',
    // Etapa 3
    cep: '', estado: '', cidade: '', bairro: '', rua: '', numero: '', complemento: '',
    // Etapa 4
    lat: '', lng: '',
    // Etapa 5
    instituicao: '', turma: '', turmaManual: '', matricula: '', empresa_id_vinculada: ''
  });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Se trocar de escola, limpa as turmas e acha o ID da empresa dona daquela escola
    if (name === 'instituicao') {
      const escolaEscolhida = escolasDisponiveis.find(esc => esc.nome === value);
      setFormData(prev => ({
        ...prev,
        instituicao: value,
        turma: '',
        turmaManual: '',
        empresa_id_vinculada: escolaEscolhida ? escolaEscolhida.empresa_id : ''
      }));
    }

    // Busca de CEP Automática (ViaCEP)
    if (name === 'cep') {
      const cepLimpo = value.replace(/\D/g, '');
      if (cepLimpo.length === 8) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
          const data = await response.json();
          if (!data.erro) {
            setFormData(prev => ({
              ...prev, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf
            }));
          }
        } catch (error) { console.error("Erro no CEP:", error); }
      }
    }
  };

  const nextStep = async () => {
    // credenciais
    if (step === 1) {
      try {
        const resposta = await fetch('http://localhost:3000/api/passageiros/validar-etapa1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword
          })
        });
        const dados = await resposta.json();
        if (!resposta.ok || !dados.valido) return alert(`⚠️ ${dados.erro}`);
      } catch (error) {
        return alert("Erro de conexão com o servidor de segurança.");
      }
    }

    // dados pessoais
    if (step === 2) {
      try {
        const resposta = await fetch('http://localhost:3000/api/passageiros/validar-etapa2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: formData.nome,
            cpf: formData.cpf,
            dataNascimento: formData.dataNascimento,
            celular: formData.celular
          })
        });
        const dados = await resposta.json();
        if (!resposta.ok || !dados.valido) return alert(`⚠️ ${dados.erro}`);
      } catch (error) {
        return alert("Erro de conexão com o servidor.");
      }
    }

    // endereço -> GPS
    if (step === 3) {
      try {
        const resposta = await fetch('http://localhost:3000/api/passageiros/validar-etapa3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cep: formData.cep, estado: formData.estado, cidade: formData.cidade,
            bairro: formData.bairro, rua: formData.rua, numero: formData.numero
          })
        });
        const dados = await resposta.json();
        if (!resposta.ok || !dados.valido) return alert(`⚠️ ${dados.erro}`);
      } catch (error) {
        return alert("Erro de conexão com o servidor.");
      }

      const tentativasBusca = [
        `${formData.rua}, ${formData.numero}, ${formData.cidade}, ${formData.estado}, Brasil`,
        `${formData.rua}, ${formData.cidade}, ${formData.estado}, Brasil`,            
        `${formData.cidade}, ${formData.estado}, Brasil`,
        `${formData.estado}, Brasil`
      ];

      let coordenadasEncontradas = false;

      for (const busca of tentativasBusca) {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busca)}`);
          if (!response.ok) continue; 
          const data = await response.json();

          if (data && data.length > 0) {
            setFormData(prev => ({ ...prev, lat: data[0].lat, lng: data[0].lon }));
            coordenadasEncontradas = true;
            
            if (busca !== tentativasBusca[0]) {
              alert(`O satélite não encontrou o número exato, mas centralizamos na região: ${busca}. Arraste o pino para a sua casa!`);
            }
            break;
          }
        } catch (error) {
          console.error(`Falha na busca Nominatim para: ${busca}`, error);
        }
      }

      if (!coordenadasEncontradas) {
        return alert("Não conseguimos localizar o endereço no mapa. Verifique a sua conexão ou tente simplificar o nome da rua.");
      }
    }

    // busca escolas
    if (step === 4) {
      setCarregandoEscolas(true);
      try {
        const resposta = await fetch(`http://localhost:3000/api/passageiros/escolas-por-cidade?cidade=${formData.cidade}&estado=${formData.estado}`);
        if (resposta.ok) {
          const dados = await resposta.json();
          if (dados.escolas) setEscolasDisponiveis(dados.escolas);
        }
      } catch (error) {
        console.error("Erro ao buscar escolas da cidade:", error);
      }
      setCarregandoEscolas(false);
    }

    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregandoFinal(true);

    const turmaFinal = formData.turma === 'outra' ? formData.turmaManual : formData.turma;
    const precisaRevisao = formData.turma === 'outra';

    try {
      const resposta = await fetch('http://localhost:3000/api/passageiros/cadastrar-maior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          senha: formData.password,
          tipo_cadastro: 'aluno_maior',
          dados_pessoais: {
            nome: formData.nome, cpf: formData.cpf, dataNascimento: formData.dataNascimento,
            telefone: formData.celular, telefone_emergencia: formData.telefoneEmergencia
          },
          endereco: {
            cep: formData.cep, estado: formData.estado, cidade: formData.cidade, bairro: formData.bairro,
            rua: formData.rua, numero: formData.numero, complemento: formData.complemento, lat: formData.lat, lng: formData.lng
          },
          dados_escolares: formData.instituicao && formData.instituicao !== 'nao_listada' ? {
            instituicao: formData.instituicao, turma: turmaFinal, pendente_revisao: precisaRevisao, matricula: formData.matricula
          } : null,
          empresa_id: formData.empresa_id_vinculada || null
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok || !dados.valido) {
        alert(`⚠️ Erro: ${dados.erro}`);
        setCarregandoFinal(false);
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        alert("✅ Conta criada com sucesso! Preparando o seu painel...");
        irParaPainel();
      } catch (loginError) {
        alert("Conta criada! Por favor, faça login para continuar.");
        irParaVoltar(); 
      }

    } catch (error) {
      alert("⚠️ Erro crítico de conexão com o servidor.");
      setCarregandoFinal(false);
    }
  };

  const turmasDaEscolaSelecionada = escolasDisponiveis.find(e => e.nome === formData.instituicao)?.turmas || [];

  return (
    <div style={styles.telaInteira}>
      
      {/* Caixa de Cadastro ajustada com card-cadastro para evitar conflitos de grid */}
      <div className="card-cadastro">

        <h3 style={{ textAlign: 'left', margin: 0, fontSize: '24px', color: '#1e293b' }}>Perfil do Aluno (+18)</h3>
        <hr className="linha-titulo" />

        <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>

          {/* Barra de Progresso */}
          <div style={styles.porcentagem}>
            <div style={{ ...styles.progress, width: `${step * 20}%` }}></div>
          </div>

          {/* credenciais */}
          {step === 1 && (
            <>
              <div style={styles.campo}><label style={styles.label}>E-mail:</label><input type="email" name="email" value={formData.email} onChange={handleChange} required style={styles.input} /></div>
              <div style={styles.campo}><label style={styles.label}>Senha:</label><input type="password" name="password" value={formData.password} onChange={handleChange} required style={styles.input} /></div>
              <div style={styles.campo}>
                <label style={styles.label}>Confirmar Senha:</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={styles.input} />
                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '-2px', marginBottom: '5px' }}>
                    * as senhas precisam ser iguais
                  </span>
                )}
              </div>
              <div style={styles.botoes}>
                <button type="button" onClick={irParaVoltar} style={styles.btnVoltar}>Cancelar</button>
                <button type="button" onClick={nextStep} style={styles.btnAvancar}>Próximo</button>
              </div>
            </>
          )}

          {/* dados pessoais */}
          {step === 2 && (
            <>
              <div style={styles.campo}><label style={styles.label}>Nome Completo:</label><input type="text" name="nome" value={formData.nome} onChange={handleChange} required style={styles.input} /></div>
              <div style={styles.linha}>
                <div style={styles.campo}><label style={styles.label}>CPF:</label><input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required style={styles.input} /></div>
                <div style={styles.campo}><label style={styles.label}>Nascimento:</label><input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required style={styles.input} /></div>
              </div>
              <div style={styles.campo}><label style={styles.label}>Celular Principal:</label><input type="text" name="celular" value={formData.celular} onChange={handleChange} required style={styles.input} /></div>
              <div style={styles.campo}><label style={styles.label}>Telefone de Emergência (Opcional):</label><input type="text" name="telefoneEmergencia" value={formData.telefoneEmergencia} onChange={handleChange} style={styles.input} /></div>
              <div style={styles.botoes}>
                <button type="button" onClick={prevStep} style={styles.btnVoltar}>Voltar</button>
                <button type="button" onClick={nextStep} style={styles.btnAvancar}>Próximo</button>
              </div>
            </>
          )}

          {/* endereço */}
          {step === 3 && (
            <>
              <div style={styles.campo}><label style={styles.label}>CEP:</label><input type="text" name="cep" value={formData.cep} onChange={handleChange} maxLength={9} required style={styles.input} /></div>
              <div style={styles.linha}>
                <div style={{ ...styles.campo, flex: 3 }}><label style={styles.label}>Cidade:</label><input type="text" name="cidade" value={formData.cidade} onChange={handleChange} required style={styles.input} /></div>
                <div style={{ ...styles.campo, flex: 1 }}><label style={styles.label}>UF:</label><input type="text" name="estado" value={formData.estado} onChange={handleChange} required style={styles.input} /></div>
              </div>
              <div style={styles.campo}><label style={styles.label}>Bairro:</label><input type="text" name="bairro" value={formData.bairro} onChange={handleChange} required style={styles.input} /></div>
              <div style={styles.linha}>
                <div style={{ ...styles.campo, flex: 3 }}><label style={styles.label}>Rua:</label><input type="text" name="rua" value={formData.rua} onChange={handleChange} required style={styles.input} /></div>
                <div style={{ ...styles.campo, flex: 1 }}><label style={styles.label}>Nº:</label><input type="text" name="numero" value={formData.numero} onChange={handleChange} required style={styles.input} /></div>
              </div>
              <div style={styles.campo}><label style={styles.label}>Complemento (Opcional):</label><input type="text" name="complemento" value={formData.complemento} onChange={handleChange} style={styles.input} /></div>
              <div style={styles.botoes}>
                <button type="button" onClick={prevStep} style={styles.btnVoltar}>Voltar</button>
                <button type="button" onClick={nextStep} style={styles.btnAvancar}>Próximo</button>
              </div>
            </>
          )}

          {/* map */}
          {step === 4 && (
            <>
              <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '18px', textAlign: 'left' }}>Confirme o local de embarque</h4>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px', textAlign: 'left' }}>Nosso algoritmo usará este ponto para traçar a rota. Arraste o pino para a sua casa.</p>

              <div style={{ height: '260px', width: '100%', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                {formData.lat && (
                  <MapContainer center={[parseFloat(formData.lat), parseFloat(formData.lng)]} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MarcadorArrastavel lat={formData.lat} lng={formData.lng} setFormData={setFormData} />
                  </MapContainer>
                )}
              </div>

              <div style={styles.botoes}>
                <button type="button" onClick={prevStep} style={styles.btnVoltar}>Voltar</button>
                <button type="button" onClick={nextStep} style={styles.btnAvancar}>Próximo</button>
              </div>
            </>
          )}

          {/* escolas e turmas */}
          {step === 5 && (
            <>
              {carregandoEscolas ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>Buscando frotas e escolas em {formData.cidade}...</p>
              ) : (
                <>
                  <div style={styles.campo}>
                    <label style={styles.label}>Sua Instituição / Escola:</label>
                    <select name="instituicao" value={formData.instituicao} onChange={handleChange} required style={styles.input}>
                      <option value="">Selecione...</option>
                      {escolasDisponiveis.map((e, i) => <option key={i} value={e.nome}>{e.nome}</option>)}
                      <option value="nao_listada">⚠️ Minha instituição não está listada</option>
                    </select>
                  </div>

                  {formData.instituicao && formData.instituicao !== 'nao_listada' && (
                    <>
                      <div style={styles.campo}>
                        <label style={styles.label}>Turma / Ano:</label>
                        <select name="turma" value={formData.turma} onChange={handleChange} required style={styles.input}>
                          <option value="">Selecione a turma...</option>
                          {turmasDaEscolaSelecionada.map((t, i) => <option key={i} value={t}>{t}</option>)}
                          <option value="outra">⚠️ Outra / Não encontrei</option>
                        </select>
                      </div>

                      {formData.turma === 'outra' && (
                        <div style={styles.campo}>
                          <label style={{ ...styles.label, color: '#d32f2f' }}>Digite sua turma manualmente:</label>
                          <input type="text" name="turmaManual" value={formData.turmaManual} onChange={handleChange} required style={styles.input} placeholder="Ex: 1º INFO B" />
                        </div>
                      )}

                      <div style={styles.campo}>
                        <label style={styles.label}>Número de Matrícula:</label>
                        <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} required style={styles.input} placeholder="Necessário para validar com a escola" />
                      </div>
                    </>
                  )}

                  {formData.instituicao === 'nao_listada' && (
                    <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px dashed #ffb300', marginBottom: '15px', textAlign: 'left' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                        Sem problemas! Você poderá criar sua conta e, posteriormente, vincular-se a uma frota usando um código de convite no painel.
                      </p>
                    </div>
                  )}

                  <div style={styles.botoes}>
                    <button type="button" onClick={prevStep} style={styles.btnVoltar}>Voltar</button>
                    <button type="submit" disabled={carregandoFinal} style={styles.btnAvancar}>
                      {carregandoFinal ? 'Finalizando...' : 'Finalizar Cadastro'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}

function MarcadorArrastavel({ lat, lng, setFormData }: any) {
  const [position, setPosition] = useState({ lat: parseFloat(lat), lng: parseFloat(lng) });
  return (
    <Marker draggable={true} position={position} eventHandlers={{
      dragend: (e) => {
        const pos = e.target.getLatLng();
        setPosition(pos);
        setFormData((prev: any) => ({ ...prev, lat: pos.lat.toString(), lng: pos.lng.toString() }));
      },
    }}
    />
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  telaInteira: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' },
  porcentagem: { width: '100%', height: '6px', borderRadius: '4px', marginBottom: '20px', backgroundColor: '#e2e8f0', position: 'relative', overflow: 'hidden' },
  progress: { height: '100%', backgroundColor: '#4f46e5', borderRadius: '4px', transition: 'width 0.3s ease' },
  campo: { width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', marginBottom: '15px' },
  linha: { display: 'flex', width: '100%', gap: '10px' },
  label: { fontSize: '14px', color: '#334155', fontWeight: '600' },
  input: { width: '100%', height: '42px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 12px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#1e293b', outline: 'none' },
  botoes: { display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '20px', gap: '12px' },
  btnVoltar: { flex: 1, height: '42px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#374151', fontSize: '14px', cursor: 'pointer', fontWeight: '600' },
  btnAvancar: { flex: 1, height: '42px', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }
};