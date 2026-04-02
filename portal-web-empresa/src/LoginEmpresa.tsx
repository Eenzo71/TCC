import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface LoginEmpresaProps {
  irParaCadastro: () => void;
  irParaPainel: () => void;
}

export default function LoginEmpresa({ irParaCadastro, irParaPainel }: LoginEmpresaProps) {
  const [fase, setFase] = useState<'credenciais' | '2fa'>('credenciais');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const emailSalvo = sessionStorage.getItem('emailBusGapEmpresa');
    if (emailSalvo) {
      setEmail(emailSalvo);
      sessionStorage.removeItem('emailBusGapEmpresa');
    }
  }, []);

  // 2FA
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      sessionStorage.setItem('esperando2FA', 'true');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const respostaBack = await fetch('http://localhost:3000/api/empresa/solicitar-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, email: user.email })
      });
      const dadosBack = await respostaBack.json();

      if (!respostaBack.ok || !dadosBack.valido) {
        throw new Error(dadosBack.erro || "Falha ao disparar o e-mail pelo servidor.");
      }
      setFase('2fa');

    } catch (error: any) {
      sessionStorage.removeItem('esperando2FA');
      console.error("Erro no login:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErro("E-mail ou senha incorretos.");
      } else {
        setErro("Erro ao tentar entrar. O servidor pode estar offline.");
      }
    } finally {
      setCarregando(false);
    }
  };

  // 2FA - Verificar código
  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Sessão perdida. Faça login novamente.");

      const respostaBack = await fetch('http://localhost:3000/api/empresa/verificar-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, codigoDigitado: codigoDigitado })
      });

      const dadosBack = await respostaBack.json();

      if (respostaBack.ok && dadosBack.valido) {
        sessionStorage.removeItem('esperando2FA');
        irParaPainel();
      } else {
        setErro(dadosBack.erro || "Código de segurança inválido ou expirado.");
      }

    } catch (error) {
      setErro("Erro crítico de conexão com o servidor de segurança.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.telaInteira}>
      <div style={styles.caixa}>
        <div style={styles.cabecalho}>
          <h1 style={{ color: '#111', margin: 0, fontSize: '24px' }}>BusGap Business</h1>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
            {fase === 'credenciais' ? 'Acesso corporativo blindado' : 'Verificação de Segurança (2FA)'}
          </p>
        </div>

        {fase === 'credenciais' && (
          <form onSubmit={handleLogin} style={styles.formulario}>
            {erro && <div style={styles.caixaErro}>⚠️ {erro}</div>}

            <div style={styles.campo}>
              <label style={styles.label}>E-mail Corporativo</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} placeholder="contato@empresa.com" />
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} placeholder="••••••••" />
            </div>

            <button type="submit" disabled={carregando} style={styles.btnEntrar}>
              {carregando ? 'Conectando ao Servidor...' : 'Entrar no Sistema'}
            </button>
          </form>
        )}

        {fase === '2fa' && (
          <form onSubmit={handleVerificarCodigo} style={styles.formulario}>
            <div style={styles.caixaAviso}>
              Acabamos de enviar um código blindado para <strong>{email}</strong>.
            </div>

            {erro && <div style={styles.caixaErro}>⚠️ {erro}</div>}

            <div style={styles.campo}>
              <label style={{ ...styles.label, textAlign: 'center', fontSize: '16px' }}>Digite os 6 dígitos</label>
              <input
                type="text"
                value={codigoDigitado}
                onChange={(e) => setCodigoDigitado(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                style={styles.inputCodigo}
                placeholder="000000"
              />
            </div>

            <button type="submit" disabled={carregando || codigoDigitado.length < 6} style={styles.btnEntrar}>
              {carregando ? 'Validando...' : 'Confirmar Acesso'}
            </button>

            <button type="button" onClick={() => {
              sessionStorage.removeItem('esperando2FA');
              auth.signOut();
              setFase('credenciais');
            }} style={styles.btnVoltar}>
              Voltar ao Login
            </button>
          </form>
        )}

        {fase === 'credenciais' && (
          <div style={styles.rodape}>
            <p style={{ color: '#555', fontSize: '14px' }}>Ainda não tem uma conta?</p>
            <button onClick={irParaCadastro} style={styles.btnCadastrar}>
              Cadastrar Nova Empresa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  telaInteira: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f4f9', fontFamily: 'sans-serif' },
  caixa: { width: '400px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', overflow: 'hidden' },
  cabecalho: { padding: '30px 30px 20px', textAlign: 'center', borderBottom: '1px solid #eee' },
  formulario: { padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' },
  campo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', color: '#333', fontWeight: 'bold' },
  input: { padding: '12px 15px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  inputCodigo: { padding: '15px', border: '2px solid #111', borderRadius: '8px', fontSize: '24px', outline: 'none', textAlign: 'center', letterSpacing: '5px', fontWeight: 'bold' },
  btnEntrar: { padding: '14px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  btnVoltar: { padding: '10px', backgroundColor: 'transparent', color: '#555', border: 'none', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' },
  caixaErro: { padding: '10px', backgroundColor: '#ffebee', color: '#d32f2f', borderRadius: '8px', fontSize: '13px', textAlign: 'center', border: '1px solid #ffcdd2' },
  caixaAviso: { padding: '15px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', fontSize: '13px', textAlign: 'center', border: '1px solid #c8e6c9', lineHeight: '1.5' },
  rodape: { padding: '20px 30px', backgroundColor: '#fafafa', textAlign: 'center', borderTop: '1px solid #eee' },
  btnCadastrar: { padding: '10px 20px', backgroundColor: '#fff', color: '#111', border: '2px solid #111', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', width: '100%' }
};