import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, shadowUrl });

const iconeCasa = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const iconeEmpresa = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const iconePontoColeta = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

function AtualizaCameraMapa({ centro }: { centro: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (centro && !isNaN(centro[0]) && !isNaN(centro[1])) {
      map.setView(centro, map.getZoom());
    }
  }, [centro, map]);
  return null;
}

function InteracaoMapa({ modoDesenho, adicionarPonto }: { modoDesenho: boolean, adicionarPonto: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (modoDesenho) adicionarPonto(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

interface MapaRoteirizacaoProps {
  empresaId: string;
  empresa: any;
}

export default function MapaRoteirizacao({ empresaId, empresa }: MapaRoteirizacaoProps) {
  const [alunos, setAlunos] = useState<any[]>([]);

  const [centroMapa, setCentroMapa] = useState<[number, number]>([-15.8055, -43.3089]);

  const [rotasSalvas, setRotasSalvas] = useState<any[]>([]);
  const [modoDesenho, setModoDesenho] = useState(false);
  const [novaRota, setNovaRota] = useState<[number, number][]>([]);
  const [nomeRota, setNomeRota] = useState('');

  useEffect(() => {
    if (empresa?.endereco?.lat && empresa?.endereco?.lng) {
      const latNum = Number(empresa.endereco.lat);
      const lngNum = Number(empresa.endereco.lng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        setCentroMapa([latNum, lngNum]);
      }
    }

    if (empresaId) {
      buscarAlunos();
      buscarRotas();
    }
  }, [empresaId, empresa]);

  const buscarAlunos = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/passageiros/alunos/${empresaId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.valido) setAlunos(json.alunos);
      }
    } catch (e) { console.error(e); }
  };

  const buscarRotas = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/rotas/${empresaId}`);
      if (res.ok) setRotasSalvas(await res.json());
    } catch (e) { console.error(e); }
  };

  const lidarComCliqueNoMapa = (lat: number, lng: number) => {
    setNovaRota(prev => [...prev, [lat, lng]]);
  };

  const salvarTunel = async () => {
    if (novaRota.length < 2) return alert("Um túnel precisa de pelo menos 2 pontos (Início e Fim).");
    if (!nomeRota.trim()) return alert("Dê um nome para este túnel (Ex: Corredor Av. Paulista).");

    try {
      const res = await fetch('http://localhost:3000/api/rotas/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id: empresaId, nome: nomeRota, pontos: novaRota })
      });

      if (res.ok) {
        alert("Túnel criado com sucesso!");
        setModoDesenho(false);
        setNovaRota([]);
        setNomeRota('');
        buscarRotas();
      }
    } catch (error) {
      alert("Erro ao salvar o túnel.");
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>

      <div style={styles.painelFerramentas}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#1a237e' }}>Construtor de Túneis</h3>

        {!modoDesenho ? (
          <button onClick={() => setModoDesenho(true)} style={styles.btnDesenhar}>
            ✏️ Criar Novo Túnel
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text" placeholder="Nome do Túnel..."
              value={nomeRota} onChange={e => setNomeRota(e.target.value)}
              style={styles.inputNome}
            />
            <p style={{ margin: 0, fontSize: '12px', color: '#d32f2f' }}>
              Clique no mapa para traçar o caminho do ônibus.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setModoDesenho(false); setNovaRota([]); }} style={styles.btnCancelar}>Cancelar</button>
              <button onClick={() => setNovaRota([])} style={styles.btnLimpar}>Desfazer Pontos</button>
              <button onClick={salvarTunel} style={styles.btnSalvar}>Salvar Túnel</button>
            </div>
          </div>
        )}
      </div>

      <MapContainer center={centroMapa} zoom={14} style={{ height: '100%', width: '100%', cursor: modoDesenho ? 'crosshair' : 'grab' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <AtualizaCameraMapa centro={centroMapa} />
        <InteracaoMapa modoDesenho={modoDesenho} adicionarPonto={lidarComCliqueNoMapa} />

        {centroMapa && !isNaN(centroMapa[0]) && !isNaN(centroMapa[1]) && (
          <Marker position={centroMapa} icon={iconeEmpresa}>
            <Popup><strong>🏢 Garagem/Sede</strong></Popup>
          </Marker>
        )}

        {alunos
          .filter(aluno => aluno.lat && aluno.lng && !isNaN(Number(aluno.lat)) && !isNaN(Number(aluno.lng)))
          .map(aluno => (
            <Marker key={aluno.id} position={[Number(aluno.lat), Number(aluno.lng)]} icon={iconeCasa}>
              <Popup>
                <strong>{aluno.nome}</strong><br />Bairro: {aluno.bairro}
              </Popup>
            </Marker>
          ))}

        {rotasSalvas.map(rota => (
          rota.pontos && rota.pontos.length > 0 && (
            <div key={rota.id}>
              <Polyline positions={rota.pontos} color="#1a237e" weight={5} opacity={0.7} />
              <Marker position={rota.pontos[0]} icon={iconePontoColeta}>
                <Popup><strong>Túnel:</strong> {rota.nome} (Início)</Popup>
              </Marker>
            </div>
          )
        ))}

        {novaRota.length > 0 && (
          <>
            <Polyline positions={novaRota} color="#4caf50" weight={6} dashArray="10, 10" />
            {novaRota.map((ponto, index) => (
              <Marker key={index} position={ponto} icon={iconePontoColeta}>
                <Popup>Ponto de Coleta {index + 1}</Popup>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  painelFerramentas: { position: 'absolute', top: '10px', right: '10px', zIndex: 1000, backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '280px', backdropFilter: 'blur(5px)' },
  btnDesenhar: { width: '100%', padding: '10px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  inputNome: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' },
  btnSalvar: { flex: 1, padding: '8px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  btnCancelar: { padding: '8px', backgroundColor: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  btnLimpar: { padding: '8px', backgroundColor: '#f0f0f0', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }
};