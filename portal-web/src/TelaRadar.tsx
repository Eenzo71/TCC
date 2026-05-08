import React from 'react';
import MapaRadar from './MapaRadar';

interface TelaRadarProps {
  irParaPainel: () => void;
}

export default function TelaRadar({ irParaPainel }: TelaRadarProps) {
  return (
    <div style={styles.containerFullscreen}>
      
      <button onClick={irParaPainel} style={styles.btnVoltar}>
        <span style={{ fontSize: '20px' }}>⬅</span> 
        Voltar ao Painel
      </button>

      <div style={styles.painelFlutuante}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#1a237e' }}>📡 Sala de Controle</h2>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Rastreamento de Frota em Tempo Real</p>
      </div>

      <div style={styles.areaMapaExpandida}>
        <MapaRadar />
      </div>

    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  containerFullscreen: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    backgroundColor: '#e8effd',
    overflow: 'hidden'
  },
  btnVoltar: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 20px',
    backgroundColor: '#1a237e',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    transition: 'transform 0.2s'
  },
  painelFlutuante: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '15px 25px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(5px)',
    textAlign: 'right'
  },
  areaMapaExpandida: {
    width: '100%',
    height: '100%'
  }
};