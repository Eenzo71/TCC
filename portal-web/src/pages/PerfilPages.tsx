import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { 
  FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaMapMarkerAlt, 
  FaTimes, FaBus, FaIdCard, FaCheckCircle 
} from 'react-icons/fa';

export default function PerfilPages() {
  const [usuario, setUsuario] = useState<any>(null);
  const [detalhesExtras, setDetalhesExtras] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        try {
          const docRef = doc(db, 'passageiros', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setDetalhesExtras(docSnap.data());
          }
        } catch (error) {
          console.error("Erro ao carregar detalhes extras:", error);
        }
      }
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  if (carregando) {
    return (
      <div style={styles.carregandoContainer}>
        <h2>🔄 Carregando perfil completo...</h2>
      </div>
    );
  }

  const nome = usuario?.displayName || detalhesExtras?.nome_passageiro || 'Usuário BusGap';
  const email = usuario?.email || 'Sem e-mail cadastrado';
  const tipoConta = detalhesExtras?.tipo || 'Passageiro BusGap';
  const empresa = detalhesExtras?.empresa_id || localStorage.getItem('empresa_vinculada') || 'Não vinculada';
  const instituicao = detalhesExtras?.dados_escolares?.instituicao || 'Não informada';
  const turma = detalhesExtras?.dados_escolares?.turma || 'Geral';

  return (
    <div style={styles.container}>
      <div style={styles.coverHeader}>
        <img src="/images/bus_gap_sem_fundo.png" alt="BusGap Logo" style={styles.logoCover} />
      </div>

      <div style={styles.profileCard}>
        <div style={styles.avatarLarge}>
          {nome.charAt(0).toUpperCase()}
        </div>

        <h1 style={styles.userName}>{nome}</h1>
        <p style={styles.userEmail}>{email}</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={styles.roleBadge}>
            <FaShieldAlt style={{ marginRight: '6px' }} /> {tipoConta.toUpperCase()}
          </span>
          <span style={styles.statusBadge}>
            <FaCheckCircle style={{ marginRight: '6px' }} /> Conta Ativa
          </span>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoBox}>
            <div style={styles.boxTitle}>
              <FaUser style={styles.boxIcon} /> Dados Pessoais
            </div>
            <p><strong>Nome Completo:</strong> {nome}</p>
            <p><strong>ID Usuário:</strong> <code style={styles.codeText}>{usuario?.uid?.substring(0, 12)}...</code></p>
            <p><strong>Status:</strong> Cadastrado</p>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.boxTitle}>
              <FaEnvelope style={styles.boxIcon} /> Contato
            </div>
            <p><strong>E-mail:</strong> {email}</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaPhone style={{ color: '#56a8cb' }} />
              <strong>Telefone:</strong> {detalhesExtras?.telefone || '(00) 00000-0000'}
            </p>
            <p><strong>Notificações:</strong> Ativadas</p>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.boxTitle}>
              <FaBus style={styles.boxIcon} /> Transporte & Rotas
            </div>
            <p><strong>Empresa:</strong> {empresa}</p>
            <p><strong>Instituição:</strong> {instituicao}</p>
            <p><strong>Turma / Turno:</strong> {turma}</p>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.boxTitle}>
              <FaIdCard style={styles.boxIcon} /> Passe Digital
            </div>
            <p><strong>Status do Passe:</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>Liberado</span></p>
            <p><strong>Cidade:</strong> Janaúba - MG</p>
            <p><strong>Acesso ao Radar:</strong> Habilitado</p>
          </div>
        </div>

        <button style={styles.btnFechar} onClick={() => window.close()}>
          <FaTimes style={{ marginRight: '8px' }} /> Fechar Aba
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { backgroundColor: '#f4f8ff', minHeight: '100vh', paddingBottom: '40px', fontFamily: 'sans-serif' },
  carregandoContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f8ff', color: '#004181', fontFamily: 'sans-serif' },
  coverHeader: { height: '160px', background: 'linear-gradient(90deg, #56a8cb, #0052A3)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  logoCover: { height: '70px', objectFit: 'contain' },
  profileCard: { maxWidth: '800px', margin: '-50px auto 0 auto', backgroundColor: '#ffffff', borderRadius: '24px', padding: '30px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', textAlign: 'center', position: 'relative' },
  avatarLarge: { width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#0052A3', color: '#fff', fontSize: '36px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', border: '4px solid #ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  userName: { margin: '0 0 4px 0', color: '#004181', fontSize: '24px' },
  userEmail: { margin: '0 0 12px 0', color: '#64748b', fontSize: '14px' },
  roleBadge: { display: 'inline-flex', alignItems: 'center', backgroundColor: '#edf4ff', color: '#0052A3', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', backgroundColor: '#d1fae5', color: '#065f46', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '30px', textAlign: 'left' },
  infoBox: { backgroundColor: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #edf4ff' },
  boxTitle: { display: 'flex', alignItems: 'center', gap: '8px', color: '#004181', fontWeight: 'bold', fontSize: '14px', marginBottom: '12px' },
  boxIcon: { color: '#56a8cb' },
  codeText: { backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: '#334155' },
  btnFechar: { marginTop: '30px', backgroundColor: '#0052A3', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center' }
};