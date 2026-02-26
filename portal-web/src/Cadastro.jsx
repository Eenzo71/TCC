import React, { useState } from 'react';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// funções de navegação
export default function Cadastro({ irParaSucesso, irParaLogin }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    nome: '', cpf: '', celular: '', telefoneEmergencia: '',
    cep: '', bairro: '', rua: '', numero: '', complemento: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        nome: formData.nome, cpf: formData.cpf, celular: formData.celular, telefoneEmergencia: formData.telefoneEmergencia,
        endereco: { cep: formData.cep, bairro: formData.bairro, rua: formData.rua, numero: formData.numero, complemento: formData.complemento },
        tipo_perfil: "responsavel" 
      });

      irParaSucesso();
      
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao finalizar cadastro: " + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Crie a sua conta</h2>
      
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div>
            {/* vamos trocar isso depois pela barrinha ou não sei la to poco me fudendo */}
            <p>Passo 1 de 3: Credenciais</p>
            <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} required style={inputStyle} />
            <input type="password" name="password" placeholder="Senha" value={formData.password} onChange={handleChange} required style={inputStyle} />
            <input type="password" name="confirmPassword" placeholder="Confirmar Senha" value={formData.confirmPassword} onChange={handleChange} required style={inputStyle} />
            
            <div style={btnContainerStyle}>
                {/*cancelar volta pro login */}
              <button type="button" onClick={irParaLogin}>Cancelar</button>
              <button type="button" onClick={nextStep}>Próximo</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p>Passo 2 de 3: Dados Pessoais</p>
            <input type="text" name="nome" placeholder="Nome Completo" value={formData.nome} onChange={handleChange} required style={inputStyle} />
            <input type="text" name="cpf" placeholder="CPF" value={formData.cpf} onChange={handleChange} required style={inputStyle} />
            <input type="text" name="celular" placeholder="Celular Principal" value={formData.celular} onChange={handleChange} required style={inputStyle} />
            <input type="text" name="telefoneEmergencia" placeholder="Telefone de Emergência" value={formData.telefoneEmergencia} onChange={handleChange} style={inputStyle} />
            
            <div style={btnContainerStyle}>
              <button type="button" onClick={prevStep}>Voltar</button>
              <button type="button" onClick={nextStep}>Próximo</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p>Passo 3 de 3: Endereço</p>
            <input type="text" name="cep" placeholder="CEP" value={formData.cep} onChange={handleChange} required style={inputStyle} />
            <input type="text" name="bairro" placeholder="Bairro" value={formData.bairro} onChange={handleChange} required style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" name="rua" placeholder="Rua" value={formData.rua} onChange={handleChange} required style={{ ...inputStyle, flex: 3 }} />
              <input type="text" name="numero" placeholder="Nº" value={formData.numero} onChange={handleChange} required style={{ ...inputStyle, flex: 1 }} />
            </div>
            <input type="text" name="complemento" placeholder="Complemento" value={formData.complemento} onChange={handleChange} style={inputStyle} />
            
            <div style={{ width: '100%', height: '150px', backgroundColor: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', borderRadius: '5px' }}>
              <p style={{ color: '#555', textAlign: 'center', padding: '10px' }}>Quadrado do mapa...</p>
            </div>

            <div style={btnContainerStyle}>
              <button type="button" onClick={prevStep}>Voltar</button>
              <button type="submit" style={{ fontWeight: 'bold' }}>Finalizar Cadastro</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btnContainerStyle = { display: 'flex', justifyContent: 'space-between', marginTop: '15px' };