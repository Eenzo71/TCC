import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
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

interface Ponto {
  lat: number;
  lng: number;
  timestamp: string | number;
}

interface MapaRadarProps {
  pontosTimeline?: Ponto[];
}

// Pontin do mapa seguir o ônibus automaticamente
function CameraTracker({ pontos }: { pontos: Ponto[] }) {
  const map = useMap();
  useEffect(() => {
    if (pontos && pontos.length > 0) {
      const ultimoPonto = pontos[pontos.length - 1];
      // Vai pra ultima posição do ônibus com animação baitola
      map.flyTo([ultimoPonto.lat, ultimoPonto.lng], 15, { animate: true });
    }
  }, [pontos, map]);
  return null;
}

export default function MapaRadar({ pontosTimeline = [] }: MapaRadarProps) {
  // Centro padrão do mapa >>> fazer ficar automatico para cada cidade dps
  const defaultCenter: [number, number] = [-15.8055, -43.3089];

  const coordenadasLinha = pontosTimeline.map(p => [p.lat, p.lng] as [number, number]);
  const ultimoPonto = pontosTimeline.length > 0 ? pontosTimeline[pontosTimeline.length - 1] : null;

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={14} 
      scrollWheelZoom={true} 
      style={{ height: '100%', width: '100%', borderRadius: '10px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      <CameraTracker pontos={pontosTimeline} />

      {/* cria a linha por onde o busu passo >>> tem que testar dps saprr*/}
      {coordenadasLinha.length > 1 && (
        <Polyline positions={coordenadasLinha} color="#1a237e" weight={5} opacity={0.8} />
      )}

      {/* Pino na ultima posição do busu */}
      {ultimoPonto && (
        <Marker position={[ultimoPonto.lat, ultimoPonto.lng]}>
          <Popup>
            <strong>Último sinal recebido:</strong> <br />
            {new Date(ultimoPonto.timestamp).toLocaleTimeString()}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}