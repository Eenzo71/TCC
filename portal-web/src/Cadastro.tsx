import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

//mapinha
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

interface CadastroProps {
  irParaSucesso: () => void;
  irParaLogin: () => void;
  empresaId?: string | null;
}

export default function Cadastro({ irParaLogin, irParaSucesso, empresaId }: CadastroProps) {
  const [step, setStep] = useState(1);
  const [showPopupEmail, setShowPopupEmail] = useState(false);
  
  // Estado para controlar o hover de TODOS os botões "Voltar" de uma vez só
  const [isVoltarHovered, setIsVoltarHovered] = useState(false);

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    nome: '', cpf: '', celular: '', telefoneEmergencia: '',
    moraComigo: '',
    cep: '', estado: '', cidade: '', bairro: '', rua: '', numero: '', complemento: '',
    lat: '', lng: ''
  });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'cep') {
      const cepLimpo = value.replace(/\D/g, '');

      if (cepLimpo.length === 8) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
          const data = await response.json();

          if (!data.erro) {
            setFormData(prev => ({
              ...prev,
              rua: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf
            }));
          } else {
            alert("CEP não encontrado. Por favor, verifique.");
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
        }
      }
    }
  };

  // Salva a opção selecionada e avança para a Etapa 5 (Mapinha)
  const selecionarMoraComigo = (opcao: string) => {
    setFormData(prev => ({ ...prev, moraComigo: opcao }));
    setStep(5);
  };

  const nextStep = async () => {
    if (step === 1) {
      try {
        const respostaBack = await fetch('http://localhost:3000/api/cadastro/validar-etapa1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword
          })
        });

        const dadosBack = await respostaBack.json();

        if (!respostaBack.ok || !dadosBack.valido) {
          if (dadosBack.emailEmUso) {
            setShowPopupEmail(true);
            return;
          }
          alert(`⚠️ ${dadosBack.erro}`);
          return;
        }
      } catch (error) {
        console.error("Erro ao conectar com o backend:", error);
        alert("Erro de conexão com o servidor de segurança. Verifique se o Back-end está rodando.");
        return;
      }
    }

    if (step === 2) {
      try {
        const respostaBack = await fetch('http://localhost:3000/api/cadastro/validar-etapa2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: formData.nome,
            cpf: formData.cpf,
            celular: formData.celular,
            telefoneEmergencia: formData.telefoneEmergencia
          })
        });

        const dadosBack = await respostaBack.json();

        if (!respostaBack.ok || !dadosBack.valido) {
          alert(`⚠️ ${dadosBack.erro}`);
          return;
        }
      } catch (error) {
        console.error("Erro ao conectar com o backend na etapa 2:", error);
        alert("Erro de conexão com o servidor de segurança. Verifique se o Back-end está rodando.");
        return;
      }
    }

    if (step === 3) {
      try {
        const respostaBack = await fetch('http://localhost:3000/api/cadastro/validar-etapa3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cep: formData.cep,
            rua: formData.rua,
            numero: formData.numero,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado
          })
        });

        const dadosBack = await respostaBack.json();

        if (!respostaBack.ok || !dadosBack.valido) {
          alert(`⚠️ ${dadosBack.erro}`);
          return;
        }
      } catch (error) {
        console.error("Erro ao conectar com o backend na etapa de endereço:", error);
        alert("Erro de conexão com o servidor. Verifique se o Back-end está rodando.");
        return;
      }

      const tentativasBusca = [
        `${formData.rua}, ${formData.numero}, ${formData.cidade}, ${formData.estado}, Brasil`,
        `${formData.cidade}, ${formData.estado}, Brasil`,
        `${formData.estado}, Brasil`,
        `Brasil`
      ];

      let coordenadasEncontradas = false;

      for (const busca of tentativasBusca) {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busca)}`);
          const data = await response.json();

          if (data && data.length > 0) {
            setFormData(prev => ({ ...prev, lat: data[0].lat, lng: data[0].lon }));
            coordenadasEncontradas = true;

            if (busca !== tentativasBusca[0]) {
              alert(`Não encontramos o endereço exato, mas centralizamos em: ${busca}. Por favor, arraste o pino para a sua casa.`);
            }
            break;
          }
        } catch (error) {
          console.error(`Falha ao buscar nível: ${busca}`, error);
        }
      }

      if (!coordenadasEncontradas) {
        alert("Erro de conexão com o satélite. Verifique sua internet ou tente novamente.");
        return;
      }
    }

    if (step === 5) {
      if (formData.moraComigo === 'Sim') {
        handleSubmitSemEvento();
        return;
      }
    }

    setStep(step + 1);
  };
  
  const prevStep = () => setStep(step - 1);

  const irParaLoginComEmail = () => {
    sessionStorage.setItem('emailBusGap', formData.email);
    irParaLogin();
  };

  const [carregandoFinal, setCarregandoFinal] = useState(false);

  const handleSubmitSemEvento = () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregandoFinal(true);

    try {
      const respostaCriacao = await fetch('http://localhost:3000/api/cadastro/finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          formData: formData, 
          empresaId: empresaId
        })
      });

      const dadosCriacao = await respostaCriacao.json();

      if (!respostaCriacao.ok || !dadosCriacao.valido) {
        alert(`⚠️ Erro de Segurança: ${dadosCriacao.erro}`);
        setCarregandoFinal(false);
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        irParaSucesso();
      } catch (loginError) {
        console.error("Erro ao fazer o auto-login:", loginError);
        alert("Conta criada com sucesso! Mas por favor, faça o login manualmente.");
        irParaLogin();
      }

    } catch (error: any) {
      console.error("Erro fatal ao tentar finalizar o cadastro:", error);
      alert("Erro crítico de conexão. O servidor pode estar offline.");
      setCarregandoFinal(false);
    }
  };

  const obterEstiloVoltar = () => {
    if (isVoltarHovered) {
      return { ...styles.btnVoltar, ...styles.btnVoltarHover };
    }
    return styles.btnVoltar;
  };

  const totalSteps = formData.moraComigo === 'Não' ? 6 : 5;

  return (
    <div style={styles.telaInteira}>

      <div className="log" style={{ width: '450px', padding: '40px' }}>

        <h3 id="login" style={{ textAlign: 'left', margin: 0, fontSize: '24px' }}>Crie a sua conta</h3>
        <hr className="linha-titulo" />

        <form onSubmit={(e) => { 
          e.preventDefault(); 
          if(step === totalSteps) { 
            handleSubmit(e); 
          } else if(step !== 4) { 
            nextStep(); 
          } 
        }}>

          <div style={styles.porcentagem}>
            <div style={{ ...styles.progress, width: `${(step / totalSteps) * 100}%` }}></div>
          </div>

          {/* ETAPA 1: CREDENCIAIS */}
          {step === 1 && (
            <>
              <div style={styles.campo}>
                <label style={styles.label}>E-mail:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Senha:</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Confirmar Senha:</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={styles.input} />

                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '-10px', marginBottom: '5px' }}>
                    * as senhas precisam ser iguais
                  </span>
                )}
              </div>
              <div style={styles.botoes}>
                <button 
                  type="button" 
                  onClick={irParaLogin} 
                  onMouseEnter={() => setIsVoltarHovered(true)}
                  onMouseLeave={() => setIsVoltarHovered(false)}
                  style={obterEstiloVoltar()}
                >
                  Cancelar
                </button>
                <button type="button" onClick={nextStep} style={styles.btnAvancar}>Próximo</button>
              </div>
            </>
          )}

          {/* ETAPA 2: DADOS PESSOAIS */}
          {step === 2 && (
            <>
              <div style={styles.campo}>
                <label style={styles.label}>Nome Completo:</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} required style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>CPF:</label>
                <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Celular Principal:</label>
                <input type="text" name="celular" value={formData.celular} onChange={handleChange} required style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Telefone de Emergência (Opcional):</label>
                <input type="text" name="telefoneEmergencia" value={formData.telefoneEmergencia} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.botoes}>
                <button 
                  type="button" 
                  onClick={prevStep} 
                  onMouseEnter={() => setIsVoltarHovered(true)}
                  onMouseLeave={() => setIsVoltarHovered(false)}
                  style={obterEstiloVoltar()}
                >
                  Voltar
                </button>
                <button type="button" onClick={nextStep} style={styles.btnAvancar}>Próximo</button>
              </div>
            </>
          )}

          {/* ETAPA 3: ENDEREÇO */}
          {step === 3 && (
            <>
              <div style={styles.campo}>
                <label style={styles.label}>CEP:</label>
                <input type="text" name="cep" value={formData.cep} onChange={handleChange} maxLength={9} required style={styles.input} />
              </div>

              <div style={styles.linha}>
                <div style={{ ...styles.campo, flex: 1, marginRight: '10px' }}>
                  <label style={styles.label}>UF:</label>
                  <input type="text" name="estado" value={formData.estado} onChange={handleChange} required style={styles.input} />
                </div>
                <div style={{ ...styles.campo, flex: 3 }}>
                  <label style={styles.label}>Cidade:</label>
                  <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} required style={styles.input} />
                </div>
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Bairro:</label>
                <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} required style={styles.input} />
              </div>
              <div style={styles.linha}>
                <div style={{ ...styles.campo, flex: 3, marginRight: '10px' }}>
                  <label style={styles.label}>Rua:</label>
                  <input type="text" name="rua" value={formData.rua} onChange={handleChange} required style={styles.input} />
                </div>
                <div style={{ ...styles.campo, flex: 1 }}>
                  <label style={styles.label}>Nº:</label>
                  <input type="text" name="numero" value={formData.numero} onChange={handleChange} required style={styles.input} />
                </div>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Complemento (Opcional):</label>
                <input type="text" name="complemento" value={formData.complemento} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.botoes}>
                <button 
                  type="button" 
                  onClick={prevStep} 
                  onMouseEnter={() => setIsVoltarHovered(true)}
                  onMouseLeave={() => setIsVoltarHovered(false)}
                  style={obterEstiloVoltar()}
                >
                  Voltar
                </button>
                <button type="button" onClick={nextStep} style={styles.btnAvancar}>Próximo</button>
              </div>
            </>
          )}

          {/* ETAPA 4: PERGUNTA SE MORA OU NÃO MORA COMIGO */}
          {step === 4 && (
            <>
              <div style={{ ...styles.campo, textAlign: 'center', margin: '20px 0' }}>
                <label style={{ ...styles.label, fontSize: '16px', marginBottom: '20px', display: 'block', textAlign: 'center' }}>
                  Selecione uma opção:
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                  <button 
                    type="button" 
                    onClick={() => selecionarMoraComigo('Sim')}
                    style={{ ...styles.btnAvancar, width: '100%', backgroundColor: 'rgb(255, 255, 255)', transition: '0.3s' }}
                  >
                    Mora comigo
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => selecionarMoraComigo('Não')}
                    style={{ ...styles.btnVoltar, width: '100%', backgroundColor: '#ffffff', border: '1px solid #ffffff' }}
                  >
                    Não mora comigo
                  </button>
                </div>

                <button 
                  type="button" 
                  onClick={prevStep} 
                  style={{ background: 'none', border: 'none', marginTop: '25px', fontSize: '14px', color: '#666', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Voltar página
                </button>
              </div>
            </>
          )}

          {/* ETAPA 5: MAPINHA */}
          {step === 5 && (
            <>
              <h3>Ajuste Manual</h3>
              <p style={{ fontSize: '14px', margin: '5px 0 15px 0', color: '#444' }}>
                Segure e arraste o pino azul para o local exato da sua residência.
              </p>

              <div style={{ height: '300px', width: '100%', marginBottom: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                {formData.lat && formData.lng ? (
                  <MapContainer center={[parseFloat(formData.lat), parseFloat(formData.lng)]} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MarcadorArrastavel lat={formData.lat} lng={formData.lng} setFormData={setFormData} />
                  </MapContainer>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#eee', color: '#666' }}>
                    <span>Carregando mapa...</span>
                  </div>
                )}
              </div>

              <div style={styles.botoes}>
                <button 
                  type="button" 
                  onClick={prevStep} 
                  onMouseEnter={() => setIsVoltarHovered(true)}
                  onMouseLeave={() => setIsVoltarHovered(false)}
                  style={obterEstiloVoltar()}
                >
                  Voltar
                </button>
                <button 
                  type={formData.moraComigo === 'Sim' ? 'submit' : 'button'} 
                  onClick={nextStep} 
                  disabled={carregandoFinal} 
                  style={styles.btnAvancar}
                >
                  {formData.moraComigo === 'Sim' 
                    ? (carregandoFinal ? 'Processando Segurança...' : 'Finalizar Cadastro') 
                    : 'Próximo'}
                </button>
              </div>
            </>
          )}

          {/* ETAPA 6: MAPINHA NÂO MORA COMIGO */}
          {step === 6 &&  (
            <>
              <h3>Local de Trabalho / Segunda Localização</h3>
              <p style={{ fontSize: '14px', margin: '5px 0 15px 0', color: '#444' }}>
                Arraste o pino para indicar esta outra localização secundária relevante.
              </p>

              <div style={{ height: '300px', width: '100%', marginBottom: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                {formData.lat && formData.lng ? (
                  <MapContainer center={[parseFloat(formData.lat), parseFloat(formData.lng)]} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MarcadorArrastavel lat={formData.lat} lng={formData.lng} setFormData={() => {}} />
                  </MapContainer>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#eee', color: '#666' }}>
                    <span>Carregando mapa...</span>
                  </div>
                )}
              </div>

              <div style={styles.botoes}>
                <button 
                  type="button" 
                  onClick={prevStep} 
                  onMouseEnter={() => setIsVoltarHovered(true)}
                  onMouseLeave={() => setIsVoltarHovered(false)}
                  style={obterEstiloVoltar()}
                >
                  Voltar
                </button>
                <button type="submit" disabled={carregandoFinal} style={styles.btnAvancar}>
                  {carregandoFinal ? 'Processando Segurança...' : 'Finalizar Cadastro'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {/* popup email cadastrado */}
      {showPopupEmail && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <h2>E-mail já cadastrado</h2>
            <p>Parece que este e-mail já possui uma conta no BusGap. O que deseja fazer?</p>
            <button onClick={irParaLoginComEmail} style={styles.btnPopupLogin}>Fazer login / Entrar na conta</button>
            <button onClick={() => setShowPopupEmail(false)} style={styles.btnPopupCancelar}>Cancelar</button>
          </div>
        </div>
      )}

    </div>
  );
}

function MarcadorArrastavel({ lat, lng, setFormData }: any) {
  const [position, setPosition] = useState({ lat: parseFloat(lat), lng: parseFloat(lng) });

  return (
    <Marker
      draggable={true}
      position={position}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition(pos);
          if (typeof setFormData === 'function') {
            setFormData((prev: any) => ({ ...prev, lat: pos.lat.toString(), lng: pos.lng.toString() }));
          }
        },
      }}
    />
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  telaInteira: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', background: '#87c5ff' },
  porcentagem: { width: '100%', height: '8px', borderRadius: '10px', marginBottom: '25px', backgroundColor: '#fff', position: 'relative' },
  progress: { height: '100%', backgroundColor: '#528ee7ff', borderRadius: '10px', transition: 'width 0.3s' },
  campo: { width: '100%', display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' },
  linha: { display: 'flex', width: '100%', justifyContent: 'space-between' },
  label: { fontSize: '14px', color: '#222', fontWeight: 'bold', fontFamily: 'Unbounded' },
  input: { width: '100%', height: '45px', borderRadius: '10px', border: 'none', padding: '0 15px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '15px', outline: 'none', },
  botoes: { display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '10px',},
  btnVoltar: { width: '48%', height: '45px', borderRadius: '10px', border: 'none', backgroundColor: '#ffffff', color: '#111', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Unbounded' },
  btnAvancar: { width: '48%', height: '45px', borderRadius: '10px', border: 'none', backgroundColor: '#ffffff', color: '#000000', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'unbounded' }
};