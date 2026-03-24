import React, { useState } from 'react';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { validarCNPJ } from './validarCnpj';
import { validarCPF } from './validarCpf'; // <-- Importando a validação do CPF que você vai copiar!

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

interface CadastroEmpresaProps {
  irParaLogin: () => void;
  irParaPainel: () => void;
}

export default function CadastroEmpresa({ irParaLogin, irParaPainel }: CadastroEmpresaProps) {
  const [step, setStep] = useState(1);
  const [showPopupEmail, setShowPopupEmail] = useState(false);
  const [formData, setFormData] = useState({
    // Acesso
    email: '', password: '', confirmPassword: '',
    // Dados Jurídicos
    razaoSocial: '', nomeFantasia: '', cnpj: '', 
    // Responsável Legal
    nomeResponsavel: '', cpfResponsavel: '', telefoneEmpresa: '',
    // Endereço e Satélite
    cep: '', estado: '', cidade: '', bairro: '', rua: '', numero: '', complemento: '',
    lat: '', lng: '',
    // Compliance
    termosAceitos: false 
  });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const valorFinal = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: valorFinal }));

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
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
        }
      }
    }
  };

  const nextStep = async () => {
    // Etapa 1: Credenciais
    if (step === 1) {
      try {
        const metodos = await fetchSignInMethodsForEmail(auth, formData.email);
        if (metodos.length > 0) {
          setShowPopupEmail(true);
          return;
        }
      } catch (error) { console.error(error); }

      if (formData.password !== formData.confirmPassword) {
        alert("As senhas precisam ser iguais para avançar.");
        return;
      }
    }

    // Etapa 2: Dados Jurídicos
    if (step === 2) {
      if (!formData.razaoSocial || !formData.nomeFantasia) {
        alert("Preencha a Razão Social e o Nome Fantasia.");
        return;
      }
      if (!validarCNPJ(formData.cnpj)) {
        alert("Ops! Esse CNPJ é inválido. Verifique os números.");
        return;
      }
    }

    // Etapa 3: Responsável Legal e Contato
    if (step === 3) {
      if (!formData.nomeResponsavel) {
        alert("Preencha o nome do responsável pela frota.");
        return;
      }
      if (!validarCPF(formData.cpfResponsavel)) {
        alert("Ops! O CPF do responsável é inválido.");
        return;
      }
      const telefoneLimpo = formData.telefoneEmpresa.replace(/\D/g, '');
      if (telefoneLimpo.length < 10) {
        alert("O número de telefone/WhatsApp parece incorreto.");
        return;
      }
    }

    // Etapa 4: Endereço
    if (step === 4) {
      if (!formData.cep || !formData.rua || !formData.numero || !formData.estado || !formData.cidade) {
        alert("Preencha os campos obrigatórios do endereço.");
        return;
      }

      const tentativasBusca = [
        `${formData.rua}, ${formData.numero}, ${formData.cidade}, ${formData.estado}, Brasil`,
        `${formData.cidade}, ${formData.estado}, Brasil`,
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
            break;
          }
        } catch (error) { console.error("Erro GPS:", error); }
      }

      if (!coordenadasEncontradas) {
        alert("Erro ao buscar coordenadas. Tente novamente.");
        return;
      }
    }
    
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termosAceitos) {
      alert("Você precisa aceitar os Termos de Uso para criar a conta da empresa.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const CHAVE_SECRETA = import.meta.env.VITE_alululu;

      // Criptografando dados sensíveis
      const cnpjCriptografado = CryptoJS.AES.encrypt(formData.cnpj, CHAVE_SECRETA).toString();
      const cpfResponsavelCriptografado = CryptoJS.AES.encrypt(formData.cpfResponsavel, CHAVE_SECRETA).toString();
      const nomeResponsavelCriptografado = CryptoJS.AES.encrypt(formData.nomeResponsavel, CHAVE_SECRETA).toString();
      const telefoneCriptografado = CryptoJS.AES.encrypt(formData.telefoneEmpresa, CHAVE_SECRETA).toString();
      
      const cepCriptografado = CryptoJS.AES.encrypt(formData.cep, CHAVE_SECRETA).toString();
      const estadoCriptografado = CryptoJS.AES.encrypt(formData.estado, CHAVE_SECRETA).toString();
      const cidadeCriptografada = CryptoJS.AES.encrypt(formData.cidade, CHAVE_SECRETA).toString();
      const bairroCriptografado = CryptoJS.AES.encrypt(formData.bairro, CHAVE_SECRETA).toString();
      const ruaCriptografada = CryptoJS.AES.encrypt(formData.rua, CHAVE_SECRETA).toString();
      const numeroCriptografado = CryptoJS.AES.encrypt(formData.numero, CHAVE_SECRETA).toString();
      const complementoCriptografado = formData.complemento ? CryptoJS.AES.encrypt(formData.complemento, CHAVE_SECRETA).toString() : "";
      
      const latCriptografada = CryptoJS.AES.encrypt(formData.lat, CHAVE_SECRETA).toString();
      const lngCriptografada = CryptoJS.AES.encrypt(formData.lng, CHAVE_SECRETA).toString();

      // Montando o documento com os GATILHOS do perfil incompleto (60 dias)
      await setDoc(doc(db, "empresas", user.uid), {
        razaoSocial: formData.razaoSocial,
        nomeFantasia: formData.nomeFantasia, 
        cnpj: cnpjCriptografado,
        responsavelLegal: {
          nome: nomeResponsavelCriptografado,
          cpf: cpfResponsavelCriptografado
        },
        telefone: telefoneCriptografado,
        endereco: {
          cep: cepCriptografado, estado: estadoCriptografado, cidade: cidadeCriptografada,
          bairro: bairroCriptografado, rua: ruaCriptografada, numero: numeroCriptografado,
          complemento: complementoCriptografado, lat: latCriptografada, lng: lngCriptografada
        },
        tipo_perfil: "empresa",
        slug_convite: formData.nomeFantasia.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        
        // MÁGICA DO COMPLIANCE AQUI:
        data_cadastro: new Date().toISOString(),
        perfil_completo: false,
        termos_aceitos: true
      });

      irParaPainel();
    } catch (error: any) {
      alert("Erro ao finalizar cadastro: " + error.message);
    }
  };

  return (
    <div style={styles.telaInteira}>
      <div style={styles.caixa}>
        <h2 style={{ color: '#111', marginBottom: '20px' }}>Acesso Corporativo</h2>
        
        <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          <div style={styles.porcentagem}>
            <div style={{ ...styles.progress, width: step === 1 ? '20%' : step === 2 ? '40%' : step === 3 ? '60%' : step === 4 ? '80%' : '100%' }}></div>
          </div>

          {/* PASSO 1: ACESSO */}
          {step === 1 && (
            <>
              <h4 style={styles.subTitulo}>1. Credenciais de Acesso</h4>
              <input type="email" name="email" placeholder="E-mail Corporativo" value={formData.email} onChange={handleChange} required style={styles.input} />
              <input type="password" name="password" placeholder="Senha" value={formData.password} onChange={handleChange} required style={styles.input} />
              <input type="password" name="confirmPassword" placeholder="Confirmar Senha" value={formData.confirmPassword} onChange={handleChange} required style={styles.input} />
              <div style={styles.botoes}>
                <button type="button" onClick={irParaLogin} style={styles.btnVoltar}>Cancelar</button>
                <button type="button" onClick={nextStep} style={styles.btnAvancar}>Próximo</button>
              </div>
            </>
          )}

          {/* PASSO 2: EMPRESA */}
          {step === 2 && (
            <>
              <h4 style={styles.subTitulo}>2. Dados Jurídicos</h4>
              <input name="razaoSocial" placeholder="Razão Social (Ex: LingLing Transportes LTDA)" value={formData.razaoSocial} onChange={handleChange} required style={styles.input} />
              <input name="nomeFantasia" placeholder="Nome Fantasia (Como os pais vão ver)" value={formData.nomeFantasia} onChange={handleChange} required style={styles.input} />
              <input name="cnpj" placeholder="CNPJ (Somente Números)" value={formData.cnpj} onChange={handleChange} required style={styles.input} />
              <div style={styles.botoes}>
                <button type="button" onClick={prevStep} style={styles.btnVoltar}>Voltar</button>
                <button type="button" onClick={nextStep} style={styles.btnAvancar}>Próximo</button>
              </div>
            </>
          )}

          {/* PASSO 3: RESPONSÁVEL LEGAL */}
          {step === 3 && (
            <>
              <h4 style={styles.subTitulo}>3. Responsável pela Frota</h4>
              <p style={{fontSize: '12px', color: '#666', marginBottom: '15px'}}>Quem responde legalmente pelo serviço prestado.</p>
              <input name="nomeResponsavel" placeholder="Nome Completo do Diretor/Dono" value={formData.nomeResponsavel} onChange={handleChange} required style={styles.input} />
              <input name="cpfResponsavel" placeholder="CPF do Responsável" value={formData.cpfResponsavel} onChange={handleChange} required style={styles.input} />
              <input name="telefoneEmpresa" placeholder="WhatsApp / Telefone de Contato" value={formData.telefoneEmpresa} onChange={handleChange} required style={styles.input} />
              <div style={styles.botoes}>
                <button type="button" onClick={prevStep} style={styles.btnVoltar}>Voltar</button>
                <button type="button" onClick={nextStep} style={styles.btnAvancar}>Próximo</button>
              </div>
            </>
          )}

          {/* PASSO 4: ENDEREÇO */}
          {step === 4 && (
            <>
              <h4 style={styles.subTitulo}>4. Endereço da Garagem/Sede</h4>
              <input name="cep" placeholder="CEP" value={formData.cep} onChange={handleChange} maxLength={9} required style={styles.input} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input name="estado" placeholder="UF" value={formData.estado} onChange={handleChange} required style={{ ...styles.input, flex: 1 }} />
                <input name="cidade" placeholder="Cidade" value={formData.cidade} onChange={handleChange} required style={{ ...styles.input, flex: 3 }} />
              </div>
              <input name="bairro" placeholder="Bairro" value={formData.bairro} onChange={handleChange} required style={styles.input} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input name="rua" placeholder="Rua" value={formData.rua} onChange={handleChange} required style={{ ...styles.input, flex: 3 }} />
                <input name="numero" placeholder="Nº" value={formData.numero} onChange={handleChange} required style={{ ...styles.input, flex: 1 }} />
              </div>
              <div style={styles.botoes}>
                <button type="button" onClick={prevStep} style={styles.btnVoltar}>Voltar</button>
                <button type="button" onClick={nextStep} style={styles.btnAvancar}>Próximo</button>
              </div>
            </>
          )}

          {/* PASSO 5: SATÉLITE E TERMOS */}
          {step === 5 && (
            <>
              <h4 style={styles.subTitulo}>5. Confirmação Final</h4>
              <p style={{ fontSize: '12px', color: '#555', marginBottom: '10px' }}>Arraste o pino para confirmar a localização exata da frota.</p>
              <div style={{ height: '200px', width: '100%', marginBottom: '15px', borderRadius: '10px', overflow: 'hidden' }}>
                {formData.lat && (
                  <MapContainer center={[parseFloat(formData.lat), parseFloat(formData.lng)]} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MarcadorArrastavel lat={formData.lat} lng={formData.lng} setFormData={setFormData} />
                  </MapContainer>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', textAlign: 'left' }}>
                <input type="checkbox" name="termosAceitos" checked={formData.termosAceitos} onChange={handleChange} style={{ marginRight: '10px', width: '20px', height: '20px' }} />
                <label style={{ fontSize: '13px', color: '#333' }}>
                  Li e concordo com os Termos de Uso e Política de Privacidade do BusGap.
                </label>
              </div>

              <div style={styles.botoes}>
                <button type="button" onClick={prevStep} style={styles.btnVoltar}>Voltar</button>
                <button type="submit" style={styles.btnAvancar}>Criar Conta</button>
              </div>
            </>
          )}
        </form>
      </div>

      {showPopupEmail && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <h2>E-mail já cadastrado</h2>
            <p>Este e-mail já pertence a uma empresa ativa no BusGap.</p>
            <button onClick={() => { sessionStorage.setItem('emailBusGapEmpresa', formData.email); irParaLogin(); }} style={styles.btnAvancar}>Fazer login</button>
            <button onClick={() => setShowPopupEmail(false)} style={styles.btnVoltar}>Cancelar</button>
          </div>
        </div>
      )}
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
  telaInteira: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f4f9' },
  caixa: { width: '480px', padding: '40px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' },
  subTitulo: { color: '#333', marginBottom: '15px', textAlign: 'left', fontSize: '16px' },
  input: { width: '100%', height: '45px', borderRadius: '10px', border: '1px solid #ccc', padding: '0 15px', boxSizing: 'border-box', marginBottom: '15px' },
  botoes: { display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '10px' },
  btnVoltar: { width: '48%', height: '45px', borderRadius: '10px', border: '1px solid #111', backgroundColor: '#fff', color: '#111', cursor: 'pointer', fontWeight: 'bold' },
  btnAvancar: { width: '48%', height: '45px', borderRadius: '10px', border: 'none', backgroundColor: '#111', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
  porcentagem: { width: '100%', height: '8px', borderRadius: '10px', marginBottom: '25px', backgroundColor: '#eee', position: 'relative' },
  progress: { height: '100%', backgroundColor: '#4caf50', borderRadius: '10px', transition: 'width 0.3s' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  popup: { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }
};