import React, { useState } from 'react';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface CadastroProps {
  irParaSucesso: () => void;
  irParaLogin: () => void;
}

export default function Cadastro({ irParaSucesso, irParaLogin }: CadastroProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    nome: '', cpf: '', celular: '', telefoneEmergencia: '',
    cep: '', bairro: '', rua: '', numero: '', complemento: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao finalizar cadastro: " + error.message);
    }
  };

  return (
    // Essa div garante que a caixa fique no meio da tela vazia
    <div style={styles.telaInteira}>
      
      {/* Caixinha azul com o estilo herdado do login */}
      <div className="log" style={{ width: '450px', padding: '40px' }}>
        
        <h3 id="login" style={{ textAlign: 'left', margin: 0, fontSize: '24px' }}>Crie a sua conta</h3>
        <hr className="linha-titulo" />

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          
          {/* Barra de Progresso */}
          <div style={styles.porcentagem}>
            <div style={{ ...styles.progress, width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}></div>
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
                <input type="text" name="cep" value={formData.cep} onChange={handleChange} required style={styles.input} />
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
                <button type="submit" style={styles.btnAvancar}>Finalizar Cadastro</button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

// Estilos limpos, com a 'telaInteira' para garantir o centro perfeito
const styles: { [key: string]: React.CSSProperties } = {
  telaInteira: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' },
  porcentagem: { width: '100%', height: '8px', borderRadius: '10px', marginBottom: '25px', backgroundColor: '#fff', position: 'relative' },
  progress: { height: '100%', backgroundColor: '#111', borderRadius: '10px', transition: 'width 0.3s' },
  campo: { width: '100%', display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' },
  linha: { display: 'flex', width: '100%', justifyContent: 'space-between' },
  label: { fontSize: '14px', color: '#222', fontWeight: 'bold' },
  input: { width: '100%', height: '45px', borderRadius: '10px', border: 'none', padding: '0 15px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '15px', outline: 'none' },
  botoes: { display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '10px' },
  btnVoltar: { width: '48%', height: '45px', borderRadius: '10px', border: 'none', backgroundColor: '#fff', color: '#111', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' },
  btnAvancar: { width: '48%', height: '45px', borderRadius: '10px', border: 'none', backgroundColor: '#111', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }
};