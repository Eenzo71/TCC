import React from 'react';
import MapaRadar from '../components/MapaRadar';

export default function TelaRadar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#1a237e' }}>📡 Sala de Controle</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Rastreamento de Frota em Tempo Real</p>
        </div>
        <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
          Sistema Online
        </div>
      </div>

      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <MapaRadar />
      </div>
    </div>
  );
}