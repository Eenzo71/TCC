import React, { useState, useRef, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { FaSignOutAlt, FaChevronDown, FaShieldAlt, FaExternalLinkAlt } from 'react-icons/fa';

export interface UserProfile {
  uid: string;
  email: string;
  tipo: 'responsavel' | 'aluno_maior' | 'dependente' | 'empresa';
  nome: string;
}

interface HeaderPerfilProps {
  userData: UserProfile;
  setTelaAtual?: (tela: any) => void;
  tituloPainel?: string;
}

export default function HeaderPerfil({ userData, setTelaAtual }: HeaderPerfilProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const abrirPerfilEmNovaAba = () => {
    setMenuAberto(false);
    window.open('/?tela=perfil', '_blank');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (setTelaAtual) setTelaAtual('login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      <div style={styles.perfilBtn} onClick={() => setMenuAberto(!menuAberto)}>
        <div style={styles.avatarMini}>
          {userData?.nome ? userData.nome.charAt(0).toUpperCase() : 'U'}
        </div>
        <span>{userData?.nome || 'Usuário'}</span>
        <FaChevronDown style={{ fontSize: '12px', marginLeft: '4px', transition: 'transform 0.2s', transform: menuAberto ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </div>

      {menuAberto && (
        <div style={styles.dropdownMenu}>
          <p style={styles.dropdownLabel}>Sua Conta</p>
          <div style={styles.miniCardPerfil} onClick={abrirPerfilEmNovaAba} title="Abrir perfil completo em nova aba">
            <div style={styles.avatarMiniCard}>
              {userData?.nome ? userData.nome.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={styles.nomeMini}>{userData?.nome}</div>
              <div style={styles.emailMini}>{userData?.email}</div>
              <span style={styles.badgeMini}>
                <FaShieldAlt style={{ marginRight: '4px' }} /> {userData?.tipo}
              </span>
            </div>
            <FaExternalLinkAlt style={{ fontSize: '12px', color: '#004181', flexShrink: 0 }} />
          </div>

          <hr style={styles.divisor} />

          <button style={styles.menuItem} onClick={handleLogout}>
            <FaSignOutAlt style={{ marginRight: '8px', color: '#e53e3e' }} /> Sair da Conta
          </button>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { position: 'relative' },
  perfilBtn: { background: 'linear-gradient(90deg, #56a8cb, #0052A3)', padding: '8px 18px', borderRadius: '25px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'sans-serif', fontWeight: 'bold', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' },
  avatarMini: { width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#ffffff', color: '#0052A3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' },
  dropdownMenu: { position: 'absolute', right: 0, top: '50px', width: '270px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', padding: '14px', zIndex: 1000 },
  dropdownLabel: { margin: '0 0 8px 4px', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
  miniCardPerfil: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', backgroundColor: '#f4f8ff', cursor: 'pointer', transition: 'background 0.2s' },
  avatarMiniCard: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0052A3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', flexShrink: 0 },
  nomeMini: { fontWeight: 'bold', fontSize: '14px', color: '#004181', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  emailMini: { fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  badgeMini: { display: 'inline-flex', alignItems: 'center', marginTop: '4px', backgroundColor: '#d3e9ff', color: '#004181', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '8px' },
  divisor: { border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0' },
  menuItem: { width: '100%', background: 'none', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#e53e3e', fontWeight: 'bold', fontSize: '14px', textAlign: 'left' }
};