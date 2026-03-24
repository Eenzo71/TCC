import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

interface Onibus {
  id: string;
  motorista: string;
  lat: number;
  lng: number;
  velocidade: number;
}

export default function Radar({ irParaPainel }: { irParaPainel: () => void }) {
  const [onibusAtivos, setOnibusAtivos] = useState<Onibus[]>([]);

  useEffect(() => {
    const frotaRef = collection(db, "frota_ativa");
    
    const unsubscribe = onSnapshot(frotaRef, (snapshot) => {
      const frotaAtualizada: Onibus[] = [];
      snapshot.forEach((doc) => {
        frotaAtualizada.push({ id: doc.id, ...doc.data() } as Onibus);
      });
      setOnibusAtivos(frotaAtualizada);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, backgroundColor: '#111', color: '#fff', padding: '15px 30px', borderRadius: '30px', display: 'flex', gap: '20px', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
        <span style={{ fontWeight: 'bold' }}>📡 Radar BusGap</span>
        <span style={{ color: '#4caf50' }}>{onibusAtivos.length} ônibus online</span>
        <button onClick={irParaPainel} style={{ backgroundColor: '#fff', color: '#111', border: 'none', padding: '5px 15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>Sair</button>
      </div>

      {onibusAtivos.length > 0 ? (
        <MapContainer 
          center={[onibusAtivos[0].lat, onibusAtivos[0].lng]} 
          zoom={16} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {onibusAtivos.map((onibus) => (
            <Marker key={onibus.id} position={[onibus.lat, onibus.lng]}>
              <Popup>
                <strong>Motorista:</strong> {onibus.motorista} <br/>
                <strong>Velocidade:</strong> {((onibus.velocidade || 0) * 3.6).toFixed(1)} km/h
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '18px' }}>
          Aguardando sinal GPS da frota...
        </div>
      )}
    </div>
  );
}