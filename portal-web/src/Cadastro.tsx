import React, { useState } from 'react';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { validarCPF } from './validarCpf';

//mapinha
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    nome: '', cpf: '', celular: '', telefoneEmergencia: '',
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

  const nextStep = async () => {
    // Verificação etapa 1 de cadastro
    if (step === 1) {

      // Verificação de e-mail já cadastrado
      try {
        const metodos = await fetchSignInMethodsForEmail(auth, formData.email);
        if (metodos.length > 0) {
          setShowPopupEmail(true);
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar e-mail:", error);
      }

      // Verificação de senhas iguais
      if (formData.password !== formData.confirmPassword) {
        alert("As senhas precisam ser iguais para avançar.");
        return;
      }
    }

    // Verificação etapa 2 de cadastro
    if (step === 2) {
      // CPF
      if (!validarCPF(formData.cpf)) {
        alert("Ops! Esse CPF é inválido. Verifique os números digitados.");
        return;
      }

      // cell
      const celularLimpo = formData.celular.replace(/\D/g, '');

      if (celularLimpo.length !== 11) {
        alert("Ops! O número de celular parece incorreto. Digite com DDD (Ex: 38 99999-9999).");
        return;
      }
    }

    // Validação da Etapa 3 (Endereço)
    if (step === 3) {
      if (!formData.cep || !formData.rua || !formData.numero || !formData.estado || !formData.cidade) {
        alert("Ops! Preencha os campos obrigatórios do endereço para avançar.");
        return;
      }

      const tentativasBusca = [
        `${formData.rua}, ${formData.numero}, ${formData.cidade}, ${formData.estado}, Brasil`, // CEP Exato
        `${formData.cidade}, ${formData.estado}, Brasil`,                                      // Cidade
        `${formData.estado}, Brasil`,                                                          // Estado
        `Brasil`                                                                               // País
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
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  const irParaLoginComEmail = () => {
    sessionStorage.setItem('emailBusGap', formData.email);
    irParaLogin();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const CHAVE_SECRETA = import.meta.env.VITE_alululu;

      // dados pessoais
      const cpfCriptografado = CryptoJS.AES.encrypt(formData.cpf, CHAVE_SECRETA).toString();
      const celularCriptografado = CryptoJS.AES.encrypt(formData.celular, CHAVE_SECRETA).toString();
      const telEmergenciaCriptografado = formData.telefoneEmergencia
        ? CryptoJS.AES.encrypt(formData.telefoneEmergencia, CHAVE_SECRETA).toString()
        : "";

      // endrc
      const cepCriptografado = CryptoJS.AES.encrypt(formData.cep, CHAVE_SECRETA).toString();
      const estadoCriptografado = CryptoJS.AES.encrypt(formData.estado, CHAVE_SECRETA).toString();
      const cidadeCriptografada = CryptoJS.AES.encrypt(formData.cidade, CHAVE_SECRETA).toString();
      const bairroCriptografado = CryptoJS.AES.encrypt(formData.bairro, CHAVE_SECRETA).toString();
      const ruaCriptografada = CryptoJS.AES.encrypt(formData.rua, CHAVE_SECRETA).toString();
      const numeroCriptografado = CryptoJS.AES.encrypt(formData.numero, CHAVE_SECRETA).toString();
      const complementoCriptografado = formData.complemento
        ? CryptoJS.AES.encrypt(formData.complemento, CHAVE_SECRETA).toString()
        : "";

      // Coords
      const latCriptografada = CryptoJS.AES.encrypt(formData.lat, CHAVE_SECRETA).toString();
      const lngCriptografada = CryptoJS.AES.encrypt(formData.lng, CHAVE_SECRETA).toString();

      // salvando a criptografia 
      await setDoc(doc(db, "usuarios", user.uid), {
        nome: formData.nome,
        cpf: cpfCriptografado,
        celular: celularCriptografado,
        telefoneEmergencia: telEmergenciaCriptografado,
        endereco: {
          cep: cepCriptografado,
          estado: estadoCriptografado,
          cidade: cidadeCriptografada,
          bairro: bairroCriptografado,
          rua: ruaCriptografada,
          numero: numeroCriptografado,
          complemento: complementoCriptografado,
          lat: latCriptografada,
          lng: lngCriptografada
        },
        tipo_perfil: "responsavel",
        empresa_vinculada: empresaId || null
      });

      irParaSucesso();
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao finalizar cadastro: " + error.message);
    }
  };

  return (
    <div style={styles.telaInteira}>

      {/* Caixinha azul com o estilo herdado do login */}
      <div className="log" style={{ width: '450px', padding: '40px' }}>

        <h3 id="login" style={{ textAlign: 'left', margin: 0, fontSize: '24px' }}>Crie a sua conta</h3>
        <hr className="linha-titulo" />

        <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>

          {/* Barra de Progresso */}
          <div style={styles.porcentagem}>
            <div style={{ ...styles.progress, width: step === 1 ? '25%' : step === 2 ? '50%' : step === 3 ? '75%' : '100%' }}></div>
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
                <button type="button" onClick={irParaLogin} style={styles.btnVoltar}>Cancelar</button>
                <button type="submit" style={styles.btnAvancar}>Próximo</button>
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
                <button type="button" onClick={prevStep} style={styles.btnVoltar}>Voltar</button>
                <button type="submit" style={styles.btnAvancar}>Próximo</button>
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
                <button type="button" onClick={prevStep} style={styles.btnVoltar}>Voltar</button>
                <button type="submit" style={styles.btnAvancar}>Próximo</button>
              </div>
            </>
          )}
          {/* ETAPA 4: mapinha*/}
          {step === 4 && (
            <>
              <h3>
                Ajuste Manual
              </h3>
              <p>
                Segure e arraste o pino azul para o local exato da sua residência.
              </p>

              <div style={{ height: '300px', width: '100%', marginBottom: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                {formData.lat && (
                  <MapContainer center={[parseFloat(formData.lat), parseFloat(formData.lng)]} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MarcadorArrastavel lat={formData.lat} lng={formData.lng} setFormData={setFormData} />
                  </MapContainer>
                )}
              </div>

              <div style={styles.botoes}>
                <button type="button" onClick={prevStep} style={styles.btnVoltar}>Voltar</button>
                <button type="submit" style={styles.btnAvancar}>Finalizar Cadastro</button>
              </div>
            </>
          )}
        </form>
      </div>
      {/* popup email cadastrado*/}
      {showPopupEmail && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <h2>E-mail já cadastrado</h2>
            <p>
              Parece que este e-mail já possui uma conta no BusGap. O que deseja fazer?
            </p>
            <button onClick={irParaLoginComEmail} style={styles.btnPopupLogin}>
              Fazer login / Entrar na conta
            </button>
            <button onClick={() => setShowPopupEmail(false)} style={styles.btnPopupCancelar}>
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// componente pra ajudar a arrastar o pino no mapinha
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
          setFormData((prev: any) => ({ ...prev, lat: pos.lat.toString(), lng: pos.lng.toString() }));
        },
      }}
    />
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  telaInteira: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' },
  porcentagem: { width: '100%', height: '8px', borderRadius: '10px', marginBottom: '25px', backgroundColor: '#fff', position: 'relative' },
  progress: { height: '100%', backgroundColor: '#528ee7ff', borderRadius: '10px', transition: 'width 0.3s' },
  campo: { width: '100%', display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' },
  linha: { display: 'flex', width: '100%', justifyContent: 'space-between' },
  label: { fontSize: '14px', color: '#222', fontWeight: 'bold' },
  input: { width: '100%', height: '45px', borderRadius: '10px', border: 'none', padding: '0 15px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '15px', outline: 'none' },
  botoes: { display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '10px' },
  btnVoltar: { width: '48%', height: '45px', borderRadius: '10px', border: 'none', backgroundColor: '#fff', color: '#111', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' },
  btnAvancar: { width: '48%', height: '45px', borderRadius: '10px', border: 'none', backgroundColor: '#111', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }

};