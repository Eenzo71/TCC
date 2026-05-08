import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db } from './firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// icon do bus >>> trocar depois
const iconeOnibus = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// pega a câmera do mapa e vai até o busao
function CameraDoRadar({ coordenadas }: { coordenadas: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coordenadas) {
      map.flyTo(coordenadas, 16, { animate: true, duration: 1.5 });
    }
  }, [coordenadas, map]);
  
  return null;
}

export default function MapaRadar() {
  const [motoristas, setMotoristas] = useState<any[]>([]);
  
  const centroPadrao: [number, number] = [-15.8033, -43.3086];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'motoristas'), (snapshot) => {
      const listaMotoristas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("👀 O Front-end atualizou! Dados do banco:", listaMotoristas);

      setMotoristas(listaMotoristas);
    });

    return () => unsubscribe();
  }, []);

  const motoristaComGps = motoristas.find(m => m.localizacao_atual && m.localizacao_atual.lat);
  
  const focoDaCamera = motoristaComGps
    ? [motoristaComGps.localizacao_atual.lat, motoristaComGps.localizacao_atual.lng] as [number, number]
    : null;

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '15px', overflow: 'hidden' }}>
      <MapContainer 
        center={centroPadrao} 
        zoom={13} 
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {focoDaCamera && <CameraDoRadar coordenadas={focoDaCamera} />}

        {motoristas.map((mot) => {
          if (mot.localizacao_atual?.lat && mot.localizacao_atual?.lng) {
            return (
              <Marker 
                key={mot.id} 
                position={[mot.localizacao_atual.lat, mot.localizacao_atual.lng]}
                icon={iconeOnibus}
              >
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <strong>🚐 Veículo Ativo</strong> <br />
                    Velocidade: {(mot.localizacao_atual.velocidade * 3.6).toFixed(1)} km/h <br />
                    <span style={{ fontSize: '10px', color: '#4caf50', fontWeight: 'bold' }}>
                      ● Online
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}