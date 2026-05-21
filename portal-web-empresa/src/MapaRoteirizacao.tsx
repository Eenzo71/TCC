import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const iconeCasa = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconeEmpresa = new L.Icon({ iconUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

function AtualizaCameraMapa({ centro }: { centro: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(centro, map.getZoom());
  }, [centro, map]);
  return null;
}

interface MapaRoteirizacaoProps {
  empresaId: string;
  empresa: any;
}

export default function MapaRoteirizacao({ empresaId, empresa }: MapaRoteirizacaoProps) {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [centroMapa, setCentroMapa] = useState<[number, number]>([-15.8055, -43.3089]);

  useEffect(() => {
    if (empresa && empresa.endereco) {
      const latEmpresa = Number(empresa.endereco.lat) || -15.8055;
      const lngEmpresa = Number(empresa.endereco.lng) || -43.3089;
      setCentroMapa([latEmpresa, lngEmpresa]);
    }

    if (empresaId) buscarAlunosDoBackEnd();
  }, [empresaId, empresa]);

  const buscarAlunosDoBackEnd = async () => {
    try {
      const resposta = await fetch(`http://localhost:3000/api/cadastro/empresa/${empresaId}/alunos`);
      
      if (resposta.ok) {
        const dadosAlunos = await resposta.json();
        setAlunos(dadosAlunos);
      } else {
        console.error("Erro na resposta do servidor backend");
      }
    } catch (error) {
      console.error("Erro ao buscar alunos via API do Back-end:", error);
    }
  };

  return (
    <MapContainer center={centroMapa} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <AtualizaCameraMapa centro={centroMapa} />

      {/* Empresa */}
      {empresa && (
        <Marker position={centroMapa} icon={iconeEmpresa}>
          <Popup>
            <strong>🏢 Sede da Frota</strong><br />
            {empresa.nomeFantasia || "Sua Empresa"}
          </Popup>
        </Marker>
      )}

      {/* Alunos */}
      {alunos.map((aluno) => (
        <Marker key={aluno.id} position={[aluno.lat, aluno.lng]} icon={iconeCasa}>
          <Popup>
            <strong>{aluno.nome}</strong><br />
            Bairro: {aluno.bairro || "Não informado"}<br />
            <button style={{marginTop: '5px', padding: '4px 10px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px'}}>
              Adicionar à Rota
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}